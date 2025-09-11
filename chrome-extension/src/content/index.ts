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

    this.messageHandler.registerHandler('INJECT_DOM_AGENT_PANEL', (message, sender, sendResponse) => {
      console.log('📝 DOM Agent: INJECT_DOM_AGENT_PANEL handler called');
      this.handleInjectDOMAgentPanel(message, sender, sendResponse);
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

  private handleInjectDOMAgentPanel(
    message: any,
    sender: any,
    sendResponse: (response?: any) => void
  ): void {
    try {
      console.log('🚀 Injecting DOM Agent panel into webpage');
      this.injectDevToolsPanel();
      sendResponse({ success: true });
    } catch (error) {
      console.error('❌ Failed to inject DOM Agent panel:', error);
      this.logger.error('Failed to inject DOM Agent panel', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to inject DOM Agent panel'
      });
    }
  }

  private handleElementSelected(element: any): void {
    // Send element selection to background script
    chrome.runtime.sendMessage({
      type: 'ELEMENT_SELECTED',
      payload: { element }
    }).catch((error) => {
      this.logger.warn('Failed to send element selection to background', error);
    });

    // Update injected DOM Agent panel if it exists
    const content = document.getElementById('dom-agent-content');
    if (content && this.isInspecting) {
      // Generate locator information
      const locators = this.generateLocators(element);

      content.innerHTML = `
        <div>
          <!-- Element Info -->
          <div style="margin-bottom: 16px;">
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #1a73e8;
              margin-bottom: 8px;
            ">&lt;${element.tag}&gt;
            ${element.id ? '<span style="color: #ea4335;">#' + element.id + '</span>' : ''}
            ${element.classes.length > 0 ? '<span style="color: #22c55e;">.' + element.classes.slice(0, 2).join('.') + (element.classes.length > 2 ? '...' : '') + '</span>' : ''}
            </div>

            <div style="
              font-size: 11px;
              color: #5f6368;
              background: #f8f9fa;
              padding: 6px 10px;
              border-radius: 4px;
              margin-bottom: 8px;
              font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            ">${Math.round(element.boundingBox.width)}px × ${Math.round(element.boundingBox.height)}px</div>
          </div>

          <!-- Primary Locator -->
          <div style="margin-bottom: 16px;">
            <div style="
              font-size: 12px;
              font-weight: 600;
              color: #202124;
              margin-bottom: 8px;
            ">主要定位器:</div>
            <div style="
              background: #f8f9fa;
              border: 1px solid #e8eaed;
              border-radius: 6px;
              padding: 8px 12px;
              font-size: 11px;
              font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
              color: #202124;
              cursor: pointer;
              word-break: break-all;
            " onclick="navigator.clipboard.writeText('${locators.primary.replace(/'/g, "\\'")}')">${locators.primary}</div>
          </div>

          <!-- Alternative Locators -->
          ${locators.alternatives.length > 1 ? `
            <div style="margin-bottom: 16px;">
              <div style="
                font-size: 12px;
                font-weight: 600;
                color: #202124;
                margin-bottom: 8px;
              ">其他定位器:</div>
              ${locators.alternatives.slice(1, 4).map((alt: any, index: number) => `
                <div style="
                  background: #f8f9fa;
                  border: 1px solid #e8eaed;
                  border-radius: 4px;
                  padding: 6px 10px;
                  font-size: 10px;
                  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                  color: #5f6368;
                  cursor: pointer;
                  margin-bottom: 4px;
                " onclick="navigator.clipboard.writeText('${alt.locator.replace(/'/g, "\\'")}')">${alt.locator}</div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Action Buttons -->
          <div style="
            display: flex;
            gap: 8px;
            margin-top: 16px;
          ">
            <button style="
              flex: 1;
              background: #f1f3f4;
              color: #202124;
              border: 1px solid #dadce0;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
            " onclick="window.resetDOMAgent()">新检查</button>
            <button style="
              flex: 1;
              background: #ea4335;
              color: white;
              border: none;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
            " onclick="window.stopDOMInspection()">停止</button>
          </div>
        </div>
      `;

      (window as any).resetDOMAgent = () => {
        this.resetDOMAgent();
      };
    }
  }

  private generateLocators(element: any): any {
    const locators: any = {
      alternatives: [],
      primary: ''
    };

    // Priority 1: getByRole
    const role = this.generateRoleLocator(element);
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
    const testId = this.generateTestIdLocator(element);
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
    const text = this.generateTextLocator(element);
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
    const placeholder = this.generatePlaceholderLocator(element);
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
    locators.alternatives.sort((a: any, b: any) => a.priority - b.priority);

    // Set primary locator
    locators.primary = (locators.role || locators.testId || locators.text || locators.placeholder || locators.css) || '';

    return locators;
  }

  private generateRoleLocator(element: any): string | null {
    const role = element.attributes['role'] || this.getImplicitRole(element);
    if (!role) return null;

    const accessibleName = this.getAccessibleName(element);
    if (accessibleName) {
      return `page.getByRole('${role}', { name: '${this.escapeString(accessibleName)}' })`;
    }
    return `page.getByRole('${role}')`;
  }

  private generateTestIdLocator(element: any): string | null {
    const testId = element.attributes['data-testid'] ||
                   element.attributes['data-test-id'] ||
                   element.attributes['data-cy'] ||
                   element.attributes['data-test'];

    if (testId) {
      return `page.getByTestId('${this.escapeString(testId)}')`;
    }
    return null;
  }

  private generateTextLocator(element: any): string | null {
    const text = element.textContent?.trim();
    if (!text || text.length > 50 || text.length < 3) return null;
    return `page.getByText('${this.escapeString(text)}')`;
  }

  private generatePlaceholderLocator(element: any): string | null {
    if (element.tag === 'input' || element.tag === 'textarea') {
      const placeholder = element.attributes['placeholder'];
      if (placeholder && placeholder.trim()) {
        return `page.getByPlaceholder('${this.escapeString(placeholder.trim())}')`;
      }
    }
    return null;
  }

  private getImplicitRole(element: any): string | null {
    const roleMap: Record<string, string> = {
      'button': 'button',
      'input': this.getInputRole(element) || 'textbox',
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
  }

  private getInputRole(element: any): string | null {
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
  }

  private getAccessibleName(element: any): string | null {
    const ariaLabel = element.attributes['aria-label'];
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }

    const ariaLabelledBy = element.attributes['aria-labelledby'];
    if (ariaLabelledBy) {
      return null;
    }

    const title = element.attributes['title'];
    if (title && title.trim()) return title.trim();

    return null;
  }

  private escapeString(str: string): string {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }

  private resetDOMAgent(): void {
    const content = document.getElementById('dom-agent-content');
    if (content) {
      content.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <div style="
            font-size: 16px;
            color: #5f6368;
            margin-bottom: 16px;
          ">点击开始检查网页元素</div>
          <button style="
            background: #1a73e8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
          " onclick="window.startDOMInspection()">🔍 检查元素</button>
        </div>
      `;
    }
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
    // Check if panel already exists
    if (document.getElementById('dom-agent-overlay')) {
      console.log('DOM Agent panel already exists');
      return;
    }

    // Create overlay directly in the webpage body
    const overlay = document.createElement('div');
    overlay.id = 'dom-agent-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      z-index: 2147483647;
      pointer-events: none;
    `;

    // Create the DOM Agent panel
    const panel = document.createElement('div');
    panel.id = 'dom-agent-panel';
    panel.style.cssText = `
      position: fixed;
      right: 20px;
      top: 20px;
      width: 380px;
      min-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      border: 1px solid #e0e0e0;
      pointer-events: auto;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create panel content
    panel.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px 12px 0 0;
        position: relative;
        cursor: grab;
        user-select: none;
      " class="dom-agent-header">
        <div style="
          position: absolute;
          top: 12px;
          left: 16px;
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        ">🎯</div>

        <div style="
          position: absolute;
          top: 12px;
          right: 16px;
          display: flex;
          gap: 8px;
        ">
          <button style="
            background: rgba(255,255,255,0.2);
            border: none;
            border-radius: 4px;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 10px;
            color: white;
          " onclick="this.closest('#dom-agent-overlay').remove()">×</button>
        </div>

        <h1 style="
          font-size: 18px;
          font-weight: 600;
          margin: 8px 0 4px 48px;
        ">DOM Agent</h1>
        <p style="
          font-size: 13px;
          opacity: 0.9;
          margin: 0 0 0 48px;
        ">网页内嵌调试工具</p>
      </div>

      <div style="padding: 20px;" id="dom-agent-content">
        <div style="text-align: center; padding: 20px 0;">
          <div style="
            font-size: 16px;
            color: #5f6368;
            margin-bottom: 16px;
          ">点击开始检查网页元素</div>
          <button style="
            background: #1a73e8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
          " onclick="window.startDOMInspection()">🔍 检查元素</button>
        </div>
      </div>
    `;

    // Add drag functionality
    this.addDragFunctionality(panel);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Add global functions
    (window as any).startDOMInspection = () => {
      this.startInspection();
    };

    console.log('✅ DOM Agent panel injected directly into webpage');
  }

  private addDragFunctionality(panel: HTMLElement): void {
    const header = panel.querySelector('.dom-agent-header') as HTMLElement;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;

      header.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newX = initialX + dx;
      let newY = initialY + dy;

      // Keep panel within viewport
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      panel.style.left = `${newX}px`;
      panel.style.top = `${newY}px`;
      panel.style.right = 'auto'; // Clear right positioning when dragging
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = 'grab';
      }
    });
  }

  private startInspection(): void {
    // Start element inspection
    this.isInspecting = true;

    // Update panel content
    const content = document.getElementById('dom-agent-content');
    if (content) {
      content.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <div style="
            font-size: 16px;
            color: #1a73e8;
            margin-bottom: 12px;
            font-weight: 500;
          ">🔍 检查模式已激活</div>
          <div style="
            font-size: 13px;
            color: #5f6368;
            margin-bottom: 16px;
          ">将鼠标悬停在元素上查看信息</div>
          <button style="
            background: #ea4335;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
          " onclick="window.stopDOMInspection()">停止检查</button>
        </div>
      `;

      (window as any).stopDOMInspection = () => {
        this.stopInspection();
      };
    }

    // Start the element inspector
    this.elementInspector.initialize();
  }

  private stopInspection(): void {
    this.isInspecting = false;

    // Update panel content back to initial state
    const content = document.getElementById('dom-agent-content');
    if (content) {
      content.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <div style="
            font-size: 16px;
            color: #5f6368;
            margin-bottom: 16px;
          ">点击开始检查网页元素</div>
          <button style="
            background: #1a73e8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
          " onclick="window.startDOMInspection()">🔍 检查元素</button>
        </div>
      `;
    }

    // Stop the element inspector
    this.elementInspector.stopInspection();
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
