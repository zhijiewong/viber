import React, { useState, useEffect, useRef } from 'react';

// Element information interface matching server-side
interface ElementInfo {
  tag: string;
  id?: string;
  classes: string[];
  textContent: string;
  attributes: Record<string, string>;
  cssSelector: string;
  xpath: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  computedStyles: Record<string, string>;
}

// Locator information interface
interface LocatorInfo {
  primary: string;
  role?: string;
  testId?: string;
  text?: string;
  placeholder?: string;
  css?: string;
  alternatives: Array<{
    type: string;
    locator: string;
    description: string;
    priority: number;
  }>;
}

interface InjectedDOMAgentProps {
  onClose: () => void;
}

export const InjectedDOMAgent: React.FC<InjectedDOMAgentProps> = ({ onClose }) => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [locators, setLocators] = useState<LocatorInfo | null>(null);
  const [panelState, setPanelState] = useState<'ready' | 'inspecting' | 'selected'>('ready');
  const [copiedText, setCopiedText] = useState<string>('');

  // Drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panelPosition, setPanelPosition] = useState({ x: window.innerWidth - 420, y: 20 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Playwright-style locator generator (matching server-side)
  const generateLocators = (element: ElementInfo): LocatorInfo => {
    const locators: LocatorInfo = {
      alternatives: [],
      primary: ''
    };

    // Priority 1: getByRole
    const role = generateRoleLocator(element);
    if (role) {
      locators.role = role;
      locators.alternatives.push({
        type: 'role',
        locator: role,
        description: 'By ARIA role (most accessible)',
        priority: 1
      });
    }

    // Priority 2: getByTestId
    const testId = generateTestIdLocator(element);
    if (testId) {
      locators.testId = testId;
      locators.alternatives.push({
        type: 'testId',
        locator: testId,
        description: 'By test ID (most stable)',
        priority: 2
      });
    }

    // Priority 3: getByText
    const text = generateTextLocator(element);
    if (text) {
      locators.text = text;
      locators.alternatives.push({
        type: 'text',
        locator: text,
        description: 'By visible text (most user-friendly)',
        priority: 3
      });
    }

    // Priority 4: getByPlaceholder
    const placeholder = generatePlaceholderLocator(element);
    if (placeholder) {
      locators.placeholder = placeholder;
      locators.alternatives.push({
        type: 'placeholder',
        locator: placeholder,
        description: 'By placeholder text',
        priority: 4
      });
    }

    // Fallback: CSS selector
    const css = element.cssSelector || `[${element.tag}]`;
    locators.css = `page.locator('${css}')`;
    locators.alternatives.push({
      type: 'css',
      locator: locators.css,
      description: 'By CSS selector',
      priority: 8
    });

    // Sort by priority
    locators.alternatives.sort((a, b) => a.priority - b.priority);

    // Set primary locator - ensure it's never null
    locators.primary = (locators.role || locators.testId || locators.text || locators.placeholder || locators.css) || '';

    return locators;
  };

  // Locator generation helper methods
  const generateRoleLocator = (element: ElementInfo): string | null => {
    const role = element.attributes['role'] || getImplicitRole(element);
    if (!role) return null;

    const accessibleName = getAccessibleName(element);
    if (accessibleName) {
      return `page.getByRole('${role}', { name: '${escapeString(accessibleName)}' })`;
    }
    return `page.getByRole('${role}')`;
  };

  const generateTestIdLocator = (element: ElementInfo): string | null => {
    const testId = element.attributes['data-testid'] ||
                   element.attributes['data-test-id'] ||
                   element.attributes['data-cy'] ||
                   element.attributes['data-test'];

    if (testId) {
      return `page.getByTestId('${escapeString(testId)}')`;
    }
    return null;
  };

  const generateTextLocator = (element: ElementInfo): string | null => {
    const text = element.textContent?.trim();
    if (!text || text.length > 50 || text.length < 3) return null;
    return `page.getByText('${escapeString(text)}')`;
  };

  const generatePlaceholderLocator = (element: ElementInfo): string | null => {
    if (element.tag === 'input' || element.tag === 'textarea') {
      const placeholder = element.attributes['placeholder'];
      if (placeholder && placeholder.trim()) {
        return `page.getByPlaceholder('${escapeString(placeholder.trim())}')`;
      }
    }
    return null;
  };

  const getImplicitRole = (element: ElementInfo): string | null => {
    const roleMap: Record<string, string> = {
      'button': 'button',
      'input': getInputRole(element) || 'textbox',
      'textarea': 'textbox',
      'select': 'combobox',
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading'
    };
    return roleMap[element.tag] || null;
  };

  const getInputRole = (element: ElementInfo): string | null => {
    const type = (element.attributes['type'] || 'text').toLowerCase();
    const roleMap: Record<string, string> = {
      'button': 'button',
      'submit': 'button',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'text': 'textbox',
      'password': 'textbox',
      'email': 'textbox',
      'search': 'searchbox'
    };
    return roleMap[type] || 'textbox';
  };

  const getAccessibleName = (element: ElementInfo): string | null => {
    const ariaLabel = element.attributes['aria-label'];
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }

    const ariaLabelledBy = element.attributes['aria-labelledby'];
    if (ariaLabelledBy) {
      // This would need more complex logic in real implementation
      return null;
    }

    const title = element.attributes['title'];
    if (title && title.trim()) return title.trim();

    return null;
  };

  const escapeString = (str: string): string => {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
  };

  // Drag functionality handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.drag-handle')) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - 420));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 650));

    setPanelPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart.x, dragStart.y]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string = 'Locator') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard', error);
    }
  };

  const handleInspectElement = () => {
    setIsInspecting(true);
    setPanelState('inspecting');
    setSelectedElement(null);
    setLocators(null);

    // Send message to background script to start inspection
    chrome.runtime.sendMessage({
      type: 'START_INSPECTION',
      tabId: null // Will be filled by background script
    });
  };

  const handleStopInspection = () => {
    setIsInspecting(false);
    setPanelState('ready');
    setSelectedElement(null);
    setLocators(null);

    chrome.runtime.sendMessage({
      type: 'STOP_INSPECTION'
    });
  };

  const resetPanelPosition = () => {
    setPanelPosition({ x: window.innerWidth - 420, y: 20 });
  };

  // Listen for element selection messages from both runtime and shadow DOM
  useEffect(() => {
    const handleRuntimeMessage = (message: any) => {
      if (message.type === 'ELEMENT_SELECTED') {
        const element = message.payload.element;
        setSelectedElement(element);
        const generatedLocators = generateLocators(element);
        setLocators(generatedLocators);
        setPanelState('selected');
        setIsInspecting(false);
      }
    };

    const handleShadowMessage = (event: any) => {
      if (event.type === 'dom-agent-element-selected') {
        const element = event.detail.element;
        setSelectedElement(element);
        const generatedLocators = generateLocators(element);
        setLocators(generatedLocators);
        setPanelState('selected');
        setIsInspecting(false);
      }
    };

    // Listen for runtime messages
    chrome.runtime.onMessage.addListener(handleRuntimeMessage);

    // Listen for shadow DOM messages
    const shadowRoot = document.querySelector('#dom-agent-injected-container')?.shadowRoot;
    if (shadowRoot) {
      shadowRoot.addEventListener('dom-agent-element-selected', handleShadowMessage);
    }

    return () => {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
      if (shadowRoot) {
        shadowRoot.removeEventListener('dom-agent-element-selected', handleShadowMessage);
      }
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className="dom-agent-injected-panel"
      style={{
        position: 'fixed',
        left: `${panelPosition.x}px`,
        top: `${panelPosition.y}px`,
        width: '400px',
        minHeight: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#ffffff',
        color: '#333',
        borderRadius: '12px',
        boxShadow: isDragging ? '0 12px 48px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 2147483647, // Maximum z-index
        cursor: isDragging ? 'grabbing' : 'default',
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Header - Drag Handle */}
      <div
        className="drag-handle"
        onMouseDown={handleMouseDown}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px 12px 0 0',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '16px',
          width: '32px',
          height: '32px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px'
        }}>
          🎯
        </div>

        {/* Control buttons */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Reset position */}
          <button
            onClick={resetPanelPosition}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '4px',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '10px',
              color: 'white'
            }}
            title="重置位置"
          >
            ↻
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '4px',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'white'
            }}
            title="关闭"
          >
            ×
          </button>
        </div>

        <h1 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '4px',
          marginTop: '8px',
          marginLeft: '48px',
          marginRight: '80px'
        }}>DOM Agent</h1>
        <p style={{
          fontSize: '13px',
          opacity: 0.9,
          margin: '0 0 0 48px'
        }}>网页内嵌调试工具</p>
      </div>

      {/* Content Area */}
      <div style={{ padding: '20px' }}>
        {panelState === 'ready' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              fontSize: '16px',
              color: '#5f6368',
              marginBottom: '16px'
            }}>
              点击开始检查网页元素
            </div>
            <button
              onClick={handleInspectElement}
              style={{
                background: '#1a73e8',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(26, 115, 232, 0.3)'
              }}
            >
              🔍 检查元素
            </button>
          </div>
        )}

        {panelState === 'inspecting' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              fontSize: '16px',
              color: '#1a73e8',
              marginBottom: '12px',
              fontWeight: '500'
            }}>
              🔍 检查模式已激活
            </div>
            <div style={{
              fontSize: '13px',
              color: '#5f6368',
              marginBottom: '16px'
            }}>
              将鼠标悬停在元素上查看信息
            </div>
            <button
              onClick={handleStopInspection}
              style={{
                background: '#ea4335',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              停止检查
            </button>
          </div>
        )}

        {panelState === 'selected' && selectedElement && locators && (
          <div>
            {/* Element Info */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a73e8',
                marginBottom: '8px'
              }}>
                &lt;{selectedElement.tag}&gt;
                {selectedElement.id && <span style={{ color: '#ea4335' }}>#{selectedElement.id}</span>}
                {selectedElement.classes.length > 0 && (
                  <span style={{ color: '#22c55e' }}>
                    .{selectedElement.classes.slice(0, 2).join('.')}
                    {selectedElement.classes.length > 2 && '...'}
                  </span>
                )}
              </div>

              <div style={{
                fontSize: '11px',
                color: '#5f6368',
                background: '#f8f9fa',
                padding: '6px 10px',
                borderRadius: '4px',
                marginBottom: '8px',
                fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace'
              }}>
                {Math.round(selectedElement.boundingBox.width)}px × {Math.round(selectedElement.boundingBox.height)}px
              </div>
            </div>

            {/* Primary Locator */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#202124',
                marginBottom: '8px'
              }}>
                主要定位器:
              </div>
              <div
                onClick={() => copyToClipboard(locators.primary)}
                style={{
                  background: '#f8f9fa',
                  border: '1px solid #e8eaed',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                  color: '#202124',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  wordBreak: 'break-all'
                }}
              >
                {locators.primary}
              </div>
            </div>

            {/* Alternative Locators */}
            {locators.alternatives.length > 1 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#202124',
                  marginBottom: '8px'
                }}>
                  其他定位器:
                </div>
                {locators.alternatives.slice(1, 4).map((alt, index) => (
                  <div
                    key={index}
                    onClick={() => copyToClipboard(alt.locator)}
                    style={{
                      background: '#f8f9fa',
                      border: '1px solid #e8eaed',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      fontSize: '10px',
                      fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                      color: '#5f6368',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {alt.locator}
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px'
            }}>
              <button
                onClick={() => setPanelState('ready')}
                style={{
                  flex: 1,
                  background: '#f1f3f4',
                  color: '#202124',
                  border: '1px solid #dadce0',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                新检查
              </button>
              <button
                onClick={handleStopInspection}
                style={{
                  flex: 1,
                  background: '#ea4335',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                停止
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
