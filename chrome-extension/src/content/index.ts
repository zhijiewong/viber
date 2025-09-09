import { Logger } from '../utils/logger';
import { DOMCapture } from './dom-capture';
import { ElementInspector } from './element-inspector';
import { MessageHandler } from './message-handler';

class ContentScript {
  private logger!: Logger;
  private domCapture!: DOMCapture;
  private elementInspector!: ElementInspector;
  private messageHandler!: MessageHandler;
  private isInspecting: boolean = false;

  constructor() {
    console.log('🚀 DOM Agent content script constructor called on:', window.location.href);
    console.log('📄 DOM Agent: Document ready state:', document.readyState);
    console.log('🌐 DOM Agent: Content script loaded successfully');

    try {
      this.logger = Logger.getInstance();
      console.log('✅ DOM Agent: Logger initialized successfully');
      this.logger.info('🚀 DOM Agent content script initializing...');

      this.domCapture = new DOMCapture();
      this.elementInspector = new ElementInspector();
      this.messageHandler = new MessageHandler();

      console.log('✅ DOM Agent: All dependencies initialized');
      this.initialize();
    } catch (error) {
      console.error('❌ DOM Agent: Failed to initialize content script:', error);
      console.error('❌ DOM Agent: Error details:', error instanceof Error ? error.stack : error);
      // Don't rethrow - let the script continue with limited functionality
    }
  }

  private initialize(): void {
    console.log('🔧 DOM Agent: Starting content script initialization');

    try {
      console.log('📡 DOM Agent: Setting up message handling');
      // Set up message handling
      this.messageHandler.initialize();

      console.log('📝 DOM Agent: Registering message handlers');
      // Register message handlers
      this.registerMessageHandlers();

      console.log('🔍 DOM Agent: Setting up element inspector');
      // Set up element inspector
      this.elementInspector.initialize();

      console.log('🎯 DOM Agent: Setting up element selection handler');
      // Listen for element selection
      this.elementInspector.onElementSelected((element) => {
        console.log('🎯 DOM Agent: Element selected:', element);
        this.handleElementSelected(element);
      });

      console.log('👁️ DOM Agent: Setting up DOM mutation observer');
      // Listen for DOM mutations
      this.setupDOMMutationObserver();

      console.log('✅ DOM Agent: Content script initialized successfully');
      console.log('🔄 DOM Agent: Ready to receive messages');
      this.logger.info('✅ DOM Agent content script initialized successfully');
    } catch (error) {
      console.error('❌ DOM Agent: Failed to initialize content script:', error);
      this.logger.error('Failed to initialize content script', error);
    }
  }

  private registerMessageHandlers(): void {
    console.log('📝 DOM Agent: Registering message handlers...');

    this.messageHandler.registerHandler('CAPTURE_DOM', (message, sender, sendResponse) => {
      console.log('📝 DOM Agent: CAPTURE_DOM handler called');
      this.handleDomCapture(message, sender, sendResponse);
    });

    this.messageHandler.registerHandler('START_INSPECTION', (message, sender, sendResponse) => {
      console.log('📝 DOM Agent: START_INSPECTION handler called');
      this.handleStartInspection(message, sender, sendResponse);
    });

    this.messageHandler.registerHandler('STOP_INSPECTION', (message, sender, sendResponse) => {
      console.log('📝 DOM Agent: STOP_INSPECTION handler called');
      this.handleStopInspection(message, sender, sendResponse);
    });

    this.messageHandler.registerHandler('GENERATE_CODE', (message, sender, sendResponse) => {
      console.log('📝 DOM Agent: GENERATE_CODE handler called');
      this.handleGenerateCode(message, sender, sendResponse);
    });

    this.messageHandler.registerHandler('HIGHLIGHT_ELEMENT', (message, sender, sendResponse) => {
      console.log('📝 DOM Agent: HIGHLIGHT_ELEMENT handler called');
      this.handleHighlightElement(message, sender, sendResponse);
    });

    this.messageHandler.registerHandler('OPEN_DEVTOOLS_PANEL', (message, sender, sendResponse) => {
      console.log('📝 DOM Agent: OPEN_DEVTOOLS_PANEL handler called');
      this.handleOpenDevToolsPanel(message, sender, sendResponse);
    });

    console.log('✅ DOM Agent: All message handlers registered');
    this.logger.info('Content script message handlers registered');
  }

  private async handleDomCapture(
    message: any,
    sender: any,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      const options = message.payload || {};
      const snapshot = await this.domCapture.captureDOM(options);

      sendResponse({
        success: true,
        data: snapshot
      });
    } catch (error) {
      this.logger.error('DOM capture failed', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'DOM capture failed'
      });
    }
  }

  private handleStartInspection(
    message: any,
    sender: any,
    sendResponse: (response?: any) => void
  ): void {
    console.log('🎯 DOM Agent: handleStartInspection called with message:', message);

    try {
      if (this.isInspecting) {
        console.log('⚠️ DOM Agent: Already in inspection mode');
        this.logger.warn('Already in inspection mode');
        sendResponse({ success: false, error: 'Already inspecting' });
        return;
      }

      console.log('✅ DOM Agent: Starting inspection mode');
      this.isInspecting = true;
      this.elementInspector.startInspection();
      this.addInspectionOverlay();

      console.log('🚀 DOM Agent: Inspection mode started successfully');
      sendResponse({ success: true });
    } catch (error) {
      console.error('❌ DOM Agent: Failed to start inspection:', error);
      this.logger.error('Failed to start inspection', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start inspection'
      });
    }
  }

  private handleStopInspection(
    message: any,
    sender: any,
    sendResponse: (response?: any) => void
  ): void {
    try {
      if (!this.isInspecting) {
        this.logger.warn('Not in inspection mode');
        sendResponse({ success: false, error: 'Not inspecting' });
        return;
      }

      this.isInspecting = false;
      this.elementInspector.stopInspection();
      this.removeInspectionOverlay();

      sendResponse({ success: true });
    } catch (error) {
      this.logger.error('Failed to stop inspection', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop inspection'
      });
    }
  }

  private async handleGenerateCode(
    message: any,
    sender: any,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      const selectedElement = this.elementInspector.getSelectedElement();
      if (!selectedElement) {
        sendResponse({
          success: false,
          error: 'No element selected'
        });
        return;
      }

      const code = await this.generateCodeForElement();
      sendResponse({
        success: true,
        data: code
      });
    } catch (error) {
      this.logger.error('Code generation failed', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Code generation failed'
      });
    }
  }

  private handleHighlightElement(
    message: any,
    sender: any,
    sendResponse: (response?: any) => void
  ): void {
    try {
      const { selector } = message.payload;
      this.elementInspector.highlightElement(selector);
      sendResponse({ success: true });
    } catch (error) {
      this.logger.error('Failed to highlight element', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to highlight element'
      });
    }
  }

  private handleOpenDevToolsPanel(
    message: any,
    sender: any,
    sendResponse: (response?: any) => void
  ): void {
    try {
      // Inject devtools panel if not already present
      if (!document.getElementById('dom-agent-devtools-panel')) {
        this.injectDevToolsPanel();
      }
      sendResponse({ success: true });
    } catch (error) {
      this.logger.error('Failed to open devtools panel', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open devtools panel'
      });
    }
  }

  private handleElementSelected(element: any): void {
    // Send element selection to background script and devtools
    chrome.runtime.sendMessage({
      type: 'ELEMENT_SELECTED',
      payload: { element }
    }).catch((error) => {
      this.logger.warn('Failed to send element selection', error);
    });
  }

  private setupDOMMutationObserver(): void {
    const observer = new MutationObserver(() => {
      if (this.isInspecting) {
        // Update element positions if DOM changed
        this.elementInspector.updateElementPositions();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  private addInspectionOverlay(): void {
    const overlay = document.createElement('div');
    overlay.id = 'dom-agent-inspection-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      z-index: 999999;
      cursor: crosshair;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
  }

  private removeInspectionOverlay(): void {
    const overlay = document.getElementById('dom-agent-inspection-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  private injectDevToolsPanel(): void {
    // This would inject a floating panel for devtools-like functionality
    const panel = document.createElement('div');
    panel.id = 'dom-agent-devtools-panel';
    panel.innerHTML = `
      <div style="
        position: fixed;
        top: 10px;
        right: 10px;
        width: 400px;
        height: 600px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        z-index: 1000000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      ">
        <div style="padding: 10px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0;">DOM Agent</h3>
        </div>
        <div id="dom-agent-panel-content" style="padding: 10px; height: calc(100% - 50px); overflow: auto;">
          <!-- Panel content will be injected here -->
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  private async generateCodeForElement(): Promise<string> {
    // This would integrate with the AI code generation functionality
    // For now, return a placeholder
    return `
/* Generated code for element */
/* This would integrate with AI code generation */
const element = document.querySelector('selector');
console.log('Selected element:', element);
    `.trim();
  }
}

// Initialize the content script
new ContentScript();
