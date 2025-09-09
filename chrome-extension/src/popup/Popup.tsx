import React, { useState, useEffect } from 'react';
import { Settings, StatusMessage } from '../types';
import { Logger } from '../utils/logger';

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

interface PopupProps {}

export const Popup: React.FC<PopupProps> = () => {
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [settings, setSettings] = useState<Settings>({
    autoDetectDevServer: true,
    advancedMode: false,
    hoverInspection: true,
    codeGenerationFramework: 'react'
  });
  const [isInspecting, setIsInspecting] = useState(false);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);

  // Enhanced state for professional UI
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [locators, setLocators] = useState<LocatorInfo | null>(null);
  const [panelState, setPanelState] = useState<'ready' | 'inspecting' | 'selected'>('ready');
  const [copiedText, setCopiedText] = useState<string>('');

  const logger = Logger.getInstance();

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

  // Enhanced element selection handler
  const handleElementSelected = (element: ElementInfo) => {
    console.log('Element selected:', element);
    setSelectedElement(element);
    const generatedLocators = generateLocators(element);
    setLocators(generatedLocators);
    setPanelState('selected');

    // Auto-copy primary locator
    if (generatedLocators.primary && generatedLocators.primary.trim()) {
      copyToClipboard(generatedLocators.primary, 'Primary Locator');
    }

    showStatus('Element selected and locator copied!', 'success');
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string = 'Locator') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      showStatus(`${type} copied to clipboard!`, 'success');

      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedText(''), 2000);
    } catch (error) {
      logger.error('Failed to copy to clipboard', error);
      showStatus('Failed to copy to clipboard', 'error');
    }
  };

  useEffect(() => {
    initializePopup();

    // Listen for element selection messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'ELEMENT_SELECTED') {
        handleElementSelected(message.payload.element);
        sendResponse({ success: true });
      }
      return true;
    });
  }, []);

  const initializePopup = async () => {
    try {
      // Get current tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        setCurrentTab(tabs[0]);
      }

      // Load settings
      await loadSettings();

      // Check if inspection is active
      await checkInspectionStatus();

      logger.info('Popup initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize popup', error);
      showStatus('Error initializing popup', 'error');
    }
  };

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get({
        autoDetectDevServer: true,
        advancedMode: false,
        hoverInspection: true,
        codeGenerationFramework: 'react'
      });
      setSettings(result as Settings);
    } catch (error) {
      logger.error('Failed to load settings', error);
    }
  };

  const saveSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await chrome.storage.sync.set(updatedSettings);
      setSettings(updatedSettings);

      // Notify background script of settings change
      chrome.runtime.sendMessage({
        type: 'SETTINGS_UPDATED',
        payload: updatedSettings
      });

      showStatus('Settings saved', 'success');
    } catch (error) {
      logger.error('Failed to save settings', error);
      showStatus('Failed to save settings', 'error');
    }
  };

  const checkInspectionStatus = async () => {
    try {
      if (currentTab?.id) {
        const response = await chrome.tabs.sendMessage(currentTab.id, { type: 'GET_INSPECTION_STATUS' });
        setIsInspecting(response?.isInspecting || false);
      }
    } catch (error) {
      // Content script might not be loaded yet
      setIsInspecting(false);
    }
  };

  const showStatus = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleInspectElement = async () => {
    try {
      console.log('🔍 Popup: handleInspectElement called');
      if (!currentTab?.id) {
        console.log('❌ Popup: No active tab found');
        showStatus('No active tab found', 'error');
        return;
      }

      console.log('✅ Popup: Starting inspection, tabId:', currentTab.id);
      setIsInspecting(true);
      setPanelState('inspecting');
      setSelectedElement(null);
      setLocators(null);
      showStatus('Starting element inspection...', 'info');

      // First, try to ensure content script is loaded on Google domains
      if (currentTab.url && (currentTab.url.includes('google.com') || currentTab.url.includes('googleusercontent.com'))) {
        console.log('🎯 Popup: Google domain detected, attempting manual injection');
        try {
          await chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content.js']
          });
          await chrome.scripting.insertCSS({
            target: { tabId: currentTab.id },
            files: ['content.css']
          });
          console.log('✅ Popup: Manual injection completed');
          // Wait a bit for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (injectError) {
          console.log('⚠️ Popup: Manual injection failed, continuing anyway:', injectError);
        }
      }

      console.log('📤 Popup: Sending START_INSPECTION message to background script');
      const response = await chrome.runtime.sendMessage({
        type: 'START_INSPECTION',
        tabId: currentTab.id
      });

      console.log('📥 Popup: Received response:', response);

      if (response && response.success) {
        console.log('✅ Popup: Inspection started successfully');
        showStatus('Hover over elements to inspect', 'info');
      } else {
        console.log('❌ Popup: Failed to start inspection, response:', response);
        throw new Error(response?.error || 'Failed to start inspection');
      }
    } catch (error) {
      console.error('❌ Popup: Failed to start inspection:', error);
      logger.error('Failed to start inspection', error);
      showStatus('Failed to start inspection', 'error');
      setIsInspecting(false);
      setPanelState('ready');
    }
  };

  const handleCaptureDOM = async () => {
    try {
      if (!currentTab?.id) {
        showStatus('No active tab found', 'error');
        return;
      }

      showStatus('Capturing DOM...', 'info');

      const response = await chrome.runtime.sendMessage({
        type: 'CAPTURE_DOM',
        payload: { fullPage: true }
      });

      if (response?.success) {
        showStatus('DOM captured successfully', 'success');
        // Open devtools panel with captured data
        await chrome.runtime.sendMessage({
          type: 'OPEN_DEVTOOLS_PANEL',
          tabId: currentTab.id,
          payload: { snapshot: response.data }
        });
      } else {
        showStatus('Failed to capture DOM', 'error');
      }
    } catch (error) {
      logger.error('Failed to capture DOM', error);
      showStatus('Failed to capture DOM', 'error');
    }
  };

  const handleGenerateCode = async () => {
    try {
      if (!currentTab?.id) {
        showStatus('No active tab found', 'error');
        return;
      }

      showStatus('Generating code...', 'info');

      const response = await chrome.tabs.sendMessage(currentTab.id, {
        type: 'GENERATE_CODE'
      });

      if (response?.success) {
        showStatus('Code generated successfully', 'success');
      } else {
        showStatus('No element selected', 'warning');
      }
    } catch (error) {
      logger.error('Failed to generate code', error);
      showStatus('Failed to generate code', 'error');
    }
  };

  const handleOpenDevTools = async () => {
    try {
      if (!currentTab?.id) {
        showStatus('No active tab found', 'error');
        return;
      }

      await chrome.tabs.sendMessage(currentTab.id, {
        type: 'OPEN_DEVTOOLS_PANEL'
      });

      showStatus('DevTools panel opened', 'success');
    } catch (error) {
      logger.error('Failed to open devtools panel', error);
      showStatus('Failed to open devtools panel', 'error');
    }
  };

  const handleStopInspection = async () => {
    try {
      if (!currentTab?.id) {
        return;
      }

      setIsInspecting(false);
      setPanelState('ready');
      setSelectedElement(null);
      setLocators(null);

      await chrome.runtime.sendMessage({
        type: 'STOP_INSPECTION',
        tabId: currentTab.id
      });

      showStatus('Inspection stopped', 'info');
    } catch (error) {
      logger.error('Failed to stop inspection', error);
      showStatus('Failed to stop inspection', 'error');
    }
  };

  return (
    <div style={{
      width: '380px',
      minHeight: '600px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#f8f9fa',
      color: '#333',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Professional Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
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
        <h1 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '4px',
          marginTop: '8px'
        }}>DOM Agent</h1>
        <p style={{
          fontSize: '13px',
          opacity: 0.9,
          margin: 0
        }}>Chrome Extension</p>
      </div>

      {/* Professional Content Area */}
      <div style={{ padding: '20px' }}>

        {/* Status Message */}
        {status && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: '500',
            background: status.type === 'success' ? '#d4edda' :
                       status.type === 'error' ? '#f8d7da' :
                       status.type === 'warning' ? '#fff3cd' : '#d1ecf1',
            color: status.type === 'success' ? '#155724' :
                   status.type === 'error' ? '#721c24' :
                   status.type === 'warning' ? '#856404' : '#0c5460',
            border: `1px solid ${status.type === 'success' ? '#c3e6cb' :
                               status.type === 'error' ? '#f5c6cb' :
                               status.type === 'warning' ? '#ffeaa7' : '#bee5eb'}`
          }}>
            {status.message}
          </div>
        )}

        {/* Unified Panel - matching server-side design */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #dadce0',
          borderRadius: '12px',
          padding: '0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          overflow: 'hidden'
        }}>

          {/* Panel Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #e8eaed',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: '#1a73e8',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              marginRight: '12px'
            }}>
              🎯
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#202124',
                marginBottom: '2px'
              }}>
                Element Inspector
              </div>
              <div style={{
                fontSize: '11px',
                color: panelState === 'ready' ? '#5f6368' :
                       panelState === 'inspecting' ? '#1a73e8' : '#22c55e',
                fontWeight: '500'
              }}>
                {panelState === 'ready' && 'Ready'}
                {panelState === 'inspecting' && 'Inspecting...'}
                {panelState === 'selected' && 'Element Selected'}
              </div>
            </div>
          </div>

          {/* Panel Content */}
          <div style={{ padding: '16px' }}>

            {/* Ready State */}
            {panelState === 'ready' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  fontSize: '16px',
                  color: '#5f6368',
                  marginBottom: '16px'
                }}>
                  Click "Inspect Element" to start
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
                  🔍 Inspect Element
                </button>
              </div>
            )}

            {/* Inspecting State */}
            {panelState === 'inspecting' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  fontSize: '16px',
                  color: '#1a73e8',
                  marginBottom: '12px',
                  fontWeight: '500'
                }}>
                  🔍 Inspecting Mode Active
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#5f6368',
                  marginBottom: '16px'
                }}>
                  Hover over elements to highlight them
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
                  Stop Inspection
                </button>
              </div>
            )}

            {/* Selected Element State */}
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
                    Primary Locator:
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
                      Alternative Locators:
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
                    New Inspection
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
                    Stop
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={handleCaptureDOM}
            style={{
              flex: 1,
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            📸 DOM
          </button>
          <button
            onClick={handleGenerateCode}
            style={{
              flex: 1,
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            🤖 Code
          </button>
          <button
            onClick={handleOpenDevTools}
            style={{
              flex: 1,
              background: '#ffc107',
              color: '#212529',
              border: 'none',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            🛠️ DevTools
          </button>
        </div>

      </div>

      {/* Compact Footer */}
      <div style={{
        padding: '12px 20px',
        textAlign: 'center',
        fontSize: '11px',
        color: '#6c757d',
        borderTop: '1px solid #e8eaed'
      }}>
        <a href="https://heviber.org" target="_blank" style={{
          color: '#1a73e8',
          textDecoration: 'none',
          marginRight: '12px'
        }}>DOM Agent</a>
        <a href="https://github.com/zhijiewong/dom-agent" target="_blank" style={{
          color: '#1a73e8',
          textDecoration: 'none'
        }}>GitHub</a>
      </div>
    </div>
  );
};
