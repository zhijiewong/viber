import React, { useState, useEffect, useCallback } from 'react';
import { ElementInfo, DOMSnapshot, Settings } from '../../types';
import { Logger } from '../../utils/logger';

interface DevToolsPanelProps {}

export const DevToolsPanel: React.FC<DevToolsPanelProps> = () => {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [, setDomSnapshot] = useState<DOMSnapshot | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [settings, setSettings] = useState<Settings>({
    autoDetectDevServer: true,
    advancedMode: false,
    hoverInspection: true,
    codeGenerationFramework: 'react'
  });
  const [isLoading, setIsLoading] = useState(false);

  const logger = Logger.getInstance();

  useEffect(() => {
    initializePanel();
  }, []);

  const initializePanel = useCallback(async () => {
    try {
      // Connect to the inspected window
      if (chrome.devtools && chrome.devtools.inspectedWindow) {
        // Set up message listeners
        chrome.runtime.onMessage.addListener(handleMessage);

        // Load settings
        await loadSettings();

        // Get initial DOM snapshot
        await captureDOM();

        logger.info('DevTools panel initialized successfully');
      }
    } catch (error) {
      logger.error('Failed to initialize DevTools panel', error);
    }
  }, []);

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

  const handleMessage = useCallback((message: any) => {
    try {
      logger.debug('DevTools panel received message', { type: message.type });

      switch (message.type) {
        case 'ELEMENT_SELECTED':
          handleElementSelected(message.payload.element);
          break;
        case 'DOM_CAPTURED':
          handleDomCaptured(message.payload.snapshot);
          break;
        case 'CODE_GENERATED':
          handleCodeGenerated(message.payload.code);
          break;
        default:
          logger.warn('Unknown message type in DevTools panel', { type: message.type });
      }
    } catch (error) {
      logger.error('Error handling message in DevTools panel', error);
    }
  }, []);

  const handleElementSelected = (element: ElementInfo) => {
    setSelectedElement(element);
    logger.info('Element selected in DevTools panel', { tag: element.tag, id: element.id });
  };

  const handleDomCaptured = (snapshot: DOMSnapshot) => {
    setDomSnapshot(snapshot);
    setIsLoading(false);
    logger.info('DOM snapshot received in DevTools panel', {
      elementsCount: snapshot.elements.length,
      url: snapshot.url
    });
  };

  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code);
    setIsLoading(false);
  };

  const captureDOM = async () => {
    try {
      setIsLoading(true);

      // Send message to content script to capture DOM
      chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, {
        type: 'CAPTURE_DOM',
        payload: { fullPage: true }
      });

    } catch (error) {
      logger.error('Failed to capture DOM', error);
      setIsLoading(false);
    }
  };

  const generateCode = async () => {
    if (!selectedElement) {
      logger.warn('No element selected for code generation');
      return;
    }

    try {
      setIsLoading(true);

      chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, {
        type: 'GENERATE_CODE',
        payload: {
          element: selectedElement,
          framework: settings.codeGenerationFramework,
          type: 'component'
        }
      });

    } catch (error) {
      logger.error('Failed to generate code', error);
      setIsLoading(false);
    }
  };

  const copySelector = async () => {
    if (!selectedElement) return;

    try {
      await navigator.clipboard.writeText(selectedElement.cssSelector);
      // Show success feedback
      logger.info('CSS selector copied to clipboard', { selector: selectedElement.cssSelector });
    } catch (error) {
      logger.error('Failed to copy selector to clipboard', error);
    }
  };

  const highlightElement = async () => {
    if (!selectedElement) return;

    try {
      chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, {
        type: 'HIGHLIGHT_ELEMENT',
        payload: { selector: selectedElement.cssSelector }
      });
    } catch (error) {
      logger.error('Failed to highlight element', error);
    }
  };

  const captureScreenshot = async () => {
    try {
      await chrome.tabs.captureVisibleTab();
      // Display screenshot in panel
      logger.info('Screenshot captured');
    } catch (error) {
      logger.error('Failed to capture screenshot', error);
    }
  };

  const copyCode = async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      logger.info('Generated code copied to clipboard');
    } catch (error) {
      logger.error('Failed to copy code to clipboard', error);
    }
  };

  const renderElementPreview = () => {
    if (!selectedElement) {
      return <div style={{ color: '#718096', fontStyle: 'italic' }}>No element selected</div>;
    }

    return (
      <div style={{ fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace', fontSize: '13px' }}>
        <span style={{ color: '#e53e3e', fontWeight: '600' }}>{`<${selectedElement.tag}`}</span>
        {selectedElement.id && (
          <span style={{ color: '#3182ce' }}>{` id="${selectedElement.id}"`}</span>
        )}
        {selectedElement.classes.length > 0 && (
          <span style={{ color: '#38a169' }}>{` class="${selectedElement.classes.join(' ')}"`}</span>
        )}
        <span style={{ color: '#e53e3e', fontWeight: '600' }}>{'>'}</span>
        {selectedElement.textContent && (
          <span style={{ color: '#718096', fontStyle: 'italic' }}>
            {selectedElement.textContent.length > 50
              ? `${selectedElement.textContent.substring(0, 50)}...`
              : selectedElement.textContent
            }
          </span>
        )}
        <span style={{ color: '#e53e3e', fontWeight: '600' }}>{`</${selectedElement.tag}>`}</span>
      </div>
    );
  };

  const renderProperties = () => {
    if (!selectedElement) return null;

    const properties = [
      { label: 'Tag', value: selectedElement.tag },
      { label: 'ID', value: selectedElement.id || 'None' },
      { label: 'Classes', value: selectedElement.classes.join(', ') || 'None' },
      { label: 'CSS Selector', value: selectedElement.cssSelector },
      { label: 'XPath', value: selectedElement.xpath },
      { label: 'Text Content', value: selectedElement.textContent || 'None' },
      { label: 'Bounding Box', value: `${selectedElement.boundingBox.width} × ${selectedElement.boundingBox.height}` }
    ];

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: '16px'
      }}>
        {properties.map((prop, index) => (
          <div key={index} style={{
            background: '#f7fafc',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '11px',
              color: '#718096',
              textTransform: 'uppercase',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              {prop.label}
            </div>
            <div style={{
              fontSize: '13px',
              wordBreak: 'break-all',
              fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace'
            }}>
              {prop.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      margin: 0,
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      background: '#f8f9fa',
      minWidth: '400px',
      minHeight: '600px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          🎯 DOM Agent Panel
        </div>

        <div style={{ padding: '20px' }}>
          {isLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '40px',
              color: '#718096'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #e2e8f0',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span>Loading...</span>
            </div>
          )}

          <div style={{ display: isLoading ? 'none' : 'block' }}>
            <div style={{
              border: '2px solid #e2e8f0',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              background: '#f7fafc'
            }}>
              {renderElementPreview()}
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={generateCode}
                disabled={!selectedElement}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: selectedElement ? '#3b82f6' : '#f3f4f6',
                  color: selectedElement ? 'white' : '#9ca3af',
                  cursor: selectedElement ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                🤖 Generate Code
              </button>
              <button
                onClick={copySelector}
                disabled={!selectedElement}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: selectedElement ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                📋 Copy Selector
              </button>
              <button
                onClick={highlightElement}
                disabled={!selectedElement}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: selectedElement ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                🔍 Highlight Element
              </button>
              <button
                onClick={captureScreenshot}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                📸 Capture Screenshot
              </button>
            </div>

            <div style={{
              background: '#2d3748',
              color: '#e2e8f0',
              padding: '16px',
              borderRadius: '6px',
              fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
              fontSize: '13px',
              overflowX: 'auto',
              whiteSpace: 'pre',
              marginTop: '16px',
              minHeight: '100px'
            }}>
              {generatedCode || '// Generated code will appear here'}
            </div>

            {selectedElement && (
              <button
                onClick={copyCode}
                disabled={!generatedCode}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: generatedCode ? '#10b981' : '#f3f4f6',
                  color: generatedCode ? 'white' : '#9ca3af',
                  cursor: generatedCode ? 'pointer' : 'not-allowed',
                  fontSize: '12px'
                }}
              >
                📋 Copy Code
              </button>
            )}

            {renderProperties()}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
