import React, { useState, useEffect, useCallback } from 'react';
import { ElementInfo, DOMSnapshot, Settings } from '../../types';
import { Logger } from '../../utils/logger';
import { FloatingPanel } from '../../components/ui/FloatingPanel';

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
  const [isPanelOpen, setIsPanelOpen] = useState(true);

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
      return <div className="text-gray-500 italic text-sm">No element selected</div>;
    }

    return (
      <div className="font-mono text-sm bg-gray-50 p-3 rounded-lg border">
        <span className="text-red-600 font-semibold">{`<${selectedElement.tag}`}</span>
        {selectedElement.id && (
          <span className="text-blue-600">{` id="${selectedElement.id}"`}</span>
        )}
        {selectedElement.classes.length > 0 && (
          <span className="text-green-600">{` class="${selectedElement.classes.join(' ')}"`}</span>
        )}
        <span className="text-red-600 font-semibold">{'>'}</span>
        {selectedElement.textContent && (
          <span className="text-gray-500 italic">
            {selectedElement.textContent.length > 50
              ? `${selectedElement.textContent.substring(0, 50)}...`
              : selectedElement.textContent
            }
          </span>
        )}
        <span className="text-red-600 font-semibold">{`</${selectedElement.tag}>`}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        {properties.map((prop, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
              {prop.label}
            </div>
            <div className="text-sm break-all font-mono text-gray-800">
              {prop.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <FloatingPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title="DOM Agent Panel"
        size="lg"
      >
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm">Loading...</span>
          </div>
        )}

        <div className={isLoading ? 'hidden' : 'block'}>
          {/* Element Preview */}
          <div className="mb-6">
            {renderElementPreview()}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={generateCode}
              disabled={!selectedElement}
              className={`px-4 py-2 border border-gray-300 rounded-lg font-medium text-sm transition-all ${
                selectedElement
                  ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              🤖 Generate Code
            </button>
            <button
              onClick={copySelector}
              disabled={!selectedElement}
              className={`px-4 py-2 border border-gray-300 rounded-lg bg-white font-medium text-sm transition-all ${
                selectedElement
                  ? 'hover:bg-gray-50 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              📋 Copy Selector
            </button>
            <button
              onClick={highlightElement}
              disabled={!selectedElement}
              className={`px-4 py-2 border border-gray-300 rounded-lg bg-white font-medium text-sm transition-all ${
                selectedElement
                  ? 'hover:bg-gray-50 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              🔍 Highlight Element
            </button>
            <button
              onClick={captureScreenshot}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium text-sm transition-all cursor-pointer"
            >
              📸 Capture Screenshot
            </button>
          </div>

          {/* Code Output */}
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto whitespace-pre min-h-[120px] mb-4">
            {generatedCode || '// Generated code will appear here'}
          </div>

          {/* Copy Code Button */}
          {selectedElement && (
            <button
              onClick={copyCode}
              disabled={!generatedCode}
              className={`mb-6 px-3 py-2 border border-gray-300 rounded-lg font-medium text-xs transition-all ${
                generatedCode
                  ? 'bg-green-500 text-white border-green-500 hover:bg-green-600 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              📋 Copy Code
            </button>
          )}

          {/* Properties Grid */}
          {renderProperties()}
        </div>
      </FloatingPanel>
    </div>
  );
};
