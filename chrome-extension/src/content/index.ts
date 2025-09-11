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
      // Set up element inspector callback first
      console.log('🎯 DOM Agent: Setting up element selection handler');
      this.elementInspector.onElementSelected((element) => {
        console.log('🎯 DOM Agent: Element selected:', element);
        this.handleElementSelected(element);
      });

      // Then initialize the inspector
      this.elementInspector.initialize();

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

    this.messageHandler.registerHandler('CHECK_DOM_AGENT_STATUS', (message, sender, sendResponse) => {
      console.log('📝 DOM Agent: CHECK_DOM_AGENT_STATUS handler called');
      this.handleCheckDOMAgentStatus(message, sender, sendResponse);
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

  private handleCheckDOMAgentStatus(
    message: any,
    sender: any,
    sendResponse: (response?: any) => void
  ): void {
    try {
      // Check if DOM Agent panel already exists
      const panelExists = !!document.getElementById('dom-agent-panel');
      const overlayExists = !!document.getElementById('dom-agent-overlay');

      console.log('🔍 DOM Agent status check:', {
        panelExists,
        overlayExists,
        isInspecting: this.isInspecting
      });

      sendResponse({
        success: true,
        panelExists: panelExists && overlayExists,
        isInspecting: this.isInspecting
      });
    } catch (error) {
      console.error('❌ Failed to check DOM Agent status:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check DOM Agent status'
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
      console.log('🎯 DOM Agent: Updating panel with new element data');
      console.log('🔍 DOM Agent: Element selected:', element.tag, element.id, element.classes);

      // Generate locator information
      const locators = this.generateLocators(element);

      console.log('🎨 DOM Agent: Generated rich locators:', {
        colors: locators.colors.length,
        typography: Object.keys(locators.typography).length,
        assets: locators.assets.length,
        contrastRatio: locators.accessibility.contrastRatio
      });

      // Debug: Check if content element exists and log its current content
      console.log('🔧 DOM Agent: Content element exists:', !!content);
      console.log('🔧 DOM Agent: Content element current HTML length:', content.innerHTML.length);

      content.innerHTML = `
        <div>
          <!-- Navigation Tabs -->
          <div style="
            display: flex;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 16px;
          ">
            <button id="tab-overview" style="
              flex: 1;
              padding: 8px 12px;
              border: none;
              background: #1a73e8;
              color: white;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              border-radius: 4px 4px 0 0;
            ">概览</button>
            <button id="tab-colors" style="
              flex: 1;
              padding: 8px 12px;
              border: none;
              background: #f8f9fa;
              color: #666;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
            ">🎨 颜色</button>
            <button id="tab-typography" style="
              flex: 1;
              padding: 8px 12px;
              border: none;
              background: #f8f9fa;
              color: #666;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
            ">📝 字体</button>
            <button id="tab-assets" style="
              flex: 1;
              padding: 8px 12px;
              border: none;
              background: #f8f9fa;
              color: #666;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
            ">🖼️ 资源</button>
          </div>

          <!-- Tab Content -->
          <div id="tab-content-overview">
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

            <!-- Quick Stats -->
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 8px;
              margin-bottom: 16px;
            ">
              <div style="
                background: #e8f5e8;
                padding: 8px;
                border-radius: 4px;
                text-align: center;
              ">
                <div style="font-size: 10px; color: #666;">颜色</div>
                <div style="font-size: 12px; font-weight: 600; color: #22c55e;">${locators.colors.length}</div>
              </div>
              <div style="
                background: #f0f8ff;
                padding: 8px;
                border-radius: 4px;
                text-align: center;
              ">
                <div style="font-size: 10px; color: #666;">资源</div>
                <div style="font-size: 12px; font-weight: 600; color: #1a73e8;">${locators.assets.length}</div>
              </div>
              <div style="
                background: ${locators.accessibility.contrastRatio > 4.5 ? '#e8f5e8' : '#ffeaea'};
                padding: 8px;
                border-radius: 4px;
                text-align: center;
              ">
                <div style="font-size: 10px; color: #666;">对比度</div>
                <div style="font-size: 12px; font-weight: 600; color: ${locators.accessibility.contrastRatio > 4.5 ? '#22c55e' : '#ea4335'};">${locators.accessibility.contrastRatio.toFixed(1)}:1</div>
              </div>
            </div>
          </div>

          <!-- Colors Tab -->
          <div id="tab-content-colors" style="display: none;">
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #202124;
              margin-bottom: 12px;
            ">🎨 颜色调色板</div>
            ${locators.colors.length > 0 ? `
              <div style="display: grid; gap: 8px;">
                ${locators.colors.map((color: any, index: number) => `
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    cursor: pointer;
                  " onclick="navigator.clipboard.writeText('${color.hex}')">
                    <div style="
                      width: 24px;
                      height: 24px;
                      background: ${color.value};
                      border: 1px solid #ddd;
                      border-radius: 4px;
                    "></div>
                    <div style="flex: 1;">
                      <div style="font-size: 11px; font-weight: 500;">${color.property}</div>
                      <div style="font-size: 10px; color: #666; font-family: monospace;">${color.hex}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : '<div style="color: #666; font-style: italic;">无颜色信息</div>'}
          </div>

          <!-- Typography Tab -->
          <div id="tab-content-typography" style="display: none;">
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #202124;
              margin-bottom: 12px;
            ">📝 字体样式</div>
            <div style="display: grid; gap: 6px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 11px; color: #666;">字体家族:</span>
                <span style="font-size: 11px; font-family: monospace;">${locators.typography.fontFamily || 'inherit'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 11px; color: #666;">字体大小:</span>
                <span style="font-size: 11px; font-family: monospace;">${locators.typography.fontSize || 'inherit'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 11px; color: #666;">字体粗细:</span>
                <span style="font-size: 11px; font-family: monospace;">${locators.typography.fontWeight || 'normal'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 11px; color: #666;">行高:</span>
                <span style="font-size: 11px; font-family: monospace;">${locators.typography.lineHeight || 'normal'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 11px; color: #666;">对齐:</span>
                <span style="font-size: 11px; font-family: monospace;">${locators.typography.textAlign || 'left'}</span>
              </div>
            </div>
            <div style="
              margin-top: 12px;
              padding: 8px;
              background: #f8f9fa;
              border-radius: 4px;
              font-family: ${locators.typography.fontFamily || 'inherit'};
              font-size: ${locators.typography.fontSize || '14px'};
              font-weight: ${locators.typography.fontWeight || 'normal'};
              color: #333;
            ">
              示例文本：The quick brown fox jumps over the lazy dog
            </div>
          </div>

          <!-- Assets Tab -->
          <div id="tab-content-assets" style="display: none;">
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #202124;
              margin-bottom: 12px;
            ">🖼️ 资源文件</div>
            ${locators.assets.length > 0 ? `
              <div style="display: grid; gap: 8px;">
                ${locators.assets.map((asset: any, index: number) => `
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    cursor: pointer;
                  " onclick="navigator.clipboard.writeText('${asset.url}')">
                    <div style="
                      width: 24px;
                      height: 24px;
                      background: #666;
                      border-radius: 4px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 12px;
                      color: white;
                    ">${asset.type === 'img' ? '🖼️' : asset.type === 'background-image' ? '🎨' : '📁'}</div>
                    <div style="flex: 1;">
                      <div style="font-size: 11px; font-weight: 500; word-break: break-all;">${asset.url.split('/').pop()}</div>
                      <div style="font-size: 10px; color: #666;">${asset.type} ${asset.dimensions ? `• ${asset.dimensions}` : ''}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : '<div style="color: #666; font-style: italic;">无资源文件</div>'}
          </div>

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
            " id="dom-agent-reset-btn">新检查</button>
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

      // Add tab switching functionality
      setTimeout(() => {
        console.log('🔧 DOM Agent: Setting up tab switching functionality');

        const tabNames = ['overview', 'colors', 'typography', 'assets'];
        tabNames.forEach(tab => {
          const tabBtn = document.getElementById(`tab-${tab}`);
          console.log(`🔧 DOM Agent: Found tab button for ${tab}:`, tabBtn);

          if (tabBtn) {
            tabBtn.addEventListener('click', () => {
              console.log(`📱 DOM Agent: Tab clicked - ${tab}`);

              // Hide all tab contents with smooth animation
              tabNames.forEach(t => {
                const content = document.getElementById(`tab-content-${t}`);
                const btn = document.getElementById(`tab-${t}`);
                if (content) {
                  content.style.opacity = '0';
                  setTimeout(() => content.style.display = 'none', 150);
                }
                if (btn) {
                  btn.style.background = 'transparent';
                  btn.style.color = '#666';
                  btn.style.boxShadow = 'none';
                  btn.style.transform = 'scale(1)';
                }
              });

              // Show selected tab with smooth animation
              const selectedContent = document.getElementById(`tab-content-${tab}`);
              console.log(`📱 DOM Agent: Showing content for ${tab}:`, selectedContent);

              if (selectedContent) {
                selectedContent.style.display = 'block';
                setTimeout(() => selectedContent.style.opacity = '1', 150);
              }

              // Highlight selected tab button with CSS Peeper style
              if (tabBtn) {
                tabBtn.style.background = '#1a73e8';
                tabBtn.style.color = 'white';
                tabBtn.style.boxShadow = '0 2px 8px rgba(26, 115, 232, 0.3)';
                tabBtn.style.transform = 'scale(1.02)';
              }

              console.log(`✅ DOM Agent: Tab switch to ${tab} completed`);
            });
          }
        });

        console.log('✅ DOM Agent: Tab switching functionality setup complete');

        // Debug: Verify tab elements exist
        const debugTabs = ['overview', 'colors', 'typography', 'assets'];
        debugTabs.forEach(tab => {
          const tabBtn = document.getElementById(`tab-${tab}`);
          const tabContent = document.getElementById(`tab-content-${tab}`);
          console.log(`🔧 DOM Agent: Tab ${tab} - Button: ${!!tabBtn}, Content: ${!!tabContent}`);
        });

        (window as any).resetDOMAgent = () => {
          this.resetDOMAgent();
        };
      }, 100);

    }
  }

  private generateLocators(element: any): any {
    const locators: any = {
      alternatives: [],
      primary: '',
      colors: [],
      typography: {},
      assets: [],
      accessibility: {}
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

    // Extract colors (CSS Peeper style)
    locators.colors = this.extractColors(element);

    // Extract typography (CSS Peeper style)
    locators.typography = this.extractTypography(element);

    // Extract assets (CSS Peeper style)
    locators.assets = this.extractAssets(element);

    // Extract accessibility info (CSS Peeper style)
    locators.accessibility = this.extractAccessibility(element);

    return locators;
  }

  private extractColors(element: any): any[] {
    const colors: any[] = [];
    const computedStyle = window.getComputedStyle(element);

    // Common color properties
    const colorProps = [
      'color', 'background-color', 'border-color', 'border-top-color',
      'border-right-color', 'border-bottom-color', 'border-left-color',
      'text-decoration-color', 'outline-color', 'box-shadow'
    ];

    colorProps.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
        const colorMatch = value.match(/#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g);
        if (colorMatch) {
          colorMatch.forEach(color => {
            colors.push({
              property: prop,
              value: color,
              hex: this.rgbToHex(color)
            });
          });
        }
      }
    });

    return colors;
  }

  private rgbToHex(color: string): string {
    // Convert RGB/RGBA/HSL to hex
    if (color.startsWith('#')) return color;

    const ctx = document.createElement('canvas').getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      return ctx.fillStyle;
    }
    return color;
  }

  private extractTypography(element: any): any {
    const computedStyle = window.getComputedStyle(element);

    return {
      fontFamily: computedStyle.getPropertyValue('font-family'),
      fontSize: computedStyle.getPropertyValue('font-size'),
      fontWeight: computedStyle.getPropertyValue('font-weight'),
      lineHeight: computedStyle.getPropertyValue('line-height'),
      letterSpacing: computedStyle.getPropertyValue('letter-spacing'),
      textAlign: computedStyle.getPropertyValue('text-align'),
      textTransform: computedStyle.getPropertyValue('text-transform'),
      textDecoration: computedStyle.getPropertyValue('text-decoration')
    };
  }

  private extractAssets(element: any): any[] {
    const assets: any[] = [];

    // Extract background images
    const computedStyle = window.getComputedStyle(element);
    const backgroundImage = computedStyle.getPropertyValue('background-image');

    if (backgroundImage && backgroundImage !== 'none') {
      const urlMatch = backgroundImage.match(/url\(["']?([^"']+)["']?\)/g);
      if (urlMatch) {
        urlMatch.forEach(url => {
          const cleanUrl = url.replace(/url\(["']?([^"']+)["']?\)/, '$1');
          assets.push({
            type: 'background-image',
            url: cleanUrl,
            size: computedStyle.getPropertyValue('background-size')
          });
        });
      }
    }

    // Extract src attributes for img, video, audio, etc.
    const mediaElements = element.querySelectorAll('img, video, audio, source');
    mediaElements.forEach((mediaEl: any) => {
      const src = mediaEl.src || mediaEl.currentSrc;
      if (src) {
        assets.push({
          type: mediaEl.tagName.toLowerCase(),
          url: src,
          alt: mediaEl.alt || '',
          dimensions: mediaEl.tagName === 'IMG' ?
            `${mediaEl.naturalWidth}x${mediaEl.naturalHeight}` : ''
        });
      }
    });

    return assets;
  }

  private extractAccessibility(element: any): any {
    const computedStyle = window.getComputedStyle(element);
    const textColor = computedStyle.getPropertyValue('color');
    const backgroundColor = computedStyle.getPropertyValue('background-color');

    return {
      textColor: textColor,
      backgroundColor: backgroundColor,
      contrastRatio: this.calculateContrastRatio(textColor, backgroundColor),
      ariaLabel: element.getAttribute('aria-label'),
      ariaDescribedBy: element.getAttribute('aria-describedby'),
      role: element.getAttribute('role'),
      tabIndex: element.getAttribute('tabindex')
    };
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    // Simple contrast calculation (simplified version)
    // In a real implementation, you'd use proper WCAG contrast formulas
    try {
      const getLuminance = (color: string) => {
        // Convert to RGB and calculate relative luminance
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16) / 255;
          const g = parseInt(color.slice(3, 5), 16) / 255;
          const b = parseInt(color.slice(5, 7), 16) / 255;
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }
        return 0.5; // Default medium luminance
      };

      const l1 = getLuminance(color1);
      const l2 = getLuminance(color2);

      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);

      return (lighter + 0.05) / (darker + 0.05);
    } catch (error) {
      return 1;
    }
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
          " id="dom-agent-start-btn">🔍 检查元素</button>
        </div>
      `;

      // Add event listeners for buttons
      setTimeout(() => {
        const startBtn = document.getElementById('dom-agent-start-btn') as HTMLButtonElement;
        const resetBtn = document.getElementById('dom-agent-reset-btn') as HTMLButtonElement;

        if (startBtn) {
          startBtn.addEventListener('click', () => {
            console.log('▶️ Start button clicked');
            this.startInspection();
          });
        }

        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            console.log('🔄 Reset button clicked');
            this.resetDOMAgent();
          });
        }
      }, 100);
    }
  }

  private testDOMAgent(): void {
    console.log('🧪 DOM Agent: Running diagnostics...');

    // Test 1: Check if DOM is ready
    console.log('📄 Test 1 - Document ready state:', document.readyState);
    console.log('📄 Test 1 - Document body exists:', !!document.body);
    console.log('📄 Test 1 - Document title:', document.title);

    // Test 2: Check if we can create elements
    try {
      const testElement = document.createElement('div');
      testElement.textContent = 'Test element';
      document.body.appendChild(testElement);
      console.log('✅ Test 2 - Element creation: SUCCESS');
      setTimeout(() => testElement.remove(), 1000);
    } catch (error) {
      console.error('❌ Test 2 - Element creation: FAILED', error);
    }

    // Test 3: Check event listener attachment
    try {
      const testHandler = () => console.log('Test event fired');
      document.addEventListener('click', testHandler, { once: true });
      console.log('✅ Test 3 - Event listener: SUCCESS');
    } catch (error) {
      console.error('❌ Test 3 - Event listener: FAILED', error);
    }

    // Test 4: Check content script communication
    try {
      chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
        console.log('✅ Test 4 - Runtime messaging: SUCCESS', response);
      });
    } catch (error) {
      console.error('❌ Test 4 - Runtime messaging: FAILED', error);
    }

    // Test 5: Check element inspector state
    console.log('🔍 Test 5 - Element inspector state:', {
      isInspecting: this.isInspecting,
      overlayExists: !!document.getElementById('dom-agent-element-overlay'),
      panelExists: !!document.getElementById('dom-agent-panel')
    });

    // Update panel with test results
    const content = document.getElementById('dom-agent-content');
    if (content) {
      content.innerHTML = `
        <div style="padding: 10px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 10px; color: #1a73e8;">
            🧪 诊断结果
          </div>
          <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
            检查控制台查看详细结果
          </div>
          <button style="
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          " id="dom-agent-return-btn">返回</button>
        </div>
      `;
    }

    // Add event listener for the return button
    setTimeout(() => {
      const returnBtn = document.getElementById('dom-agent-return-btn') as HTMLButtonElement;
      if (returnBtn) {
        returnBtn.addEventListener('click', () => {
          console.log('↩️ Return button clicked');
          this.resetDOMAgent();
        });
      }
    }, 100);

    console.log('✅ DOM Agent: Diagnostics completed');
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
    console.log('🔧 DOM Agent: Starting panel injection process');

    // Check if panel already exists
    if (document.getElementById('dom-agent-overlay')) {
      console.log('DOM Agent panel already exists');
      return;
    }

    console.log('🔧 DOM Agent: Panel does not exist, creating new panel');

    // First, define global functions BEFORE creating HTML
    (window as any).startDOMInspection = () => {
      this.startInspection();
    };


    (window as any).testDOMAgent = () => {
      this.testDOMAgent();
    };

    (window as any).resetDOMAgent = () => {
      this.resetDOMAgent();
    };

    // Create overlay with Tailwind CSS
    const overlay = document.createElement('div');
    overlay.id = 'dom-agent-overlay';
    overlay.className = 'fixed inset-0 bg-blue-500/8 backdrop-blur-[2px] pointer-events-none transition-all duration-300 ease-out z-[2147483647]';

    // Create the DOM Agent panel with Tailwind CSS
    const panel = document.createElement('div');
    panel.id = 'dom-agent-panel';
    panel.className = 'fixed top-5 right-5 w-[450px] min-h-[680px] bg-gradient-to-br from-white to-gray-50 rounded-[20px] shadow-[0_20px_40px_rgba(26,115,232,0.15),0_8px_16px_rgba(0,0,0,0.08)] shadow-inner border border-blue-500/10 pointer-events-auto z-[2147483647] font-sans overflow-hidden transform translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]';

    // Create panel content with Tailwind CSS
    panel.innerHTML = `
      <div class="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white px-6 py-5 rounded-t-[20px] relative cursor-grab select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dom-agent-header">
        <div class="absolute top-4 left-5 w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-lg backdrop-blur-[10px] border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">🎯</div>

        <div class="absolute top-4 right-5 flex gap-2">
          <button class="bg-white/15 border border-white/20 rounded-lg w-7 h-7 flex items-center justify-center cursor-pointer text-white text-sm font-medium transition-all duration-200 backdrop-blur-[10px] hover:bg-white/25 hover:scale-105" id="dom-agent-close-btn">×</button>
        </div>

        <div class="ml-[60px] mr-[60px]">
          <h1 class="text-xl font-bold m-0 mb-1 tracking-[-0.5px] [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">DOM Agent</h1>
          <p class="text-sm opacity-90 m-0 font-normal [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">专业的网页样式分析工具</p>
        </div>
      </div>

      <div class="p-5" id="dom-agent-content">
        <div>
          <!-- Navigation Tabs with Tailwind CSS -->
          <div class="flex bg-gray-100 rounded-xl p-1 mb-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            <button id="tab-overview" class="flex-1 py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold cursor-pointer rounded-lg transition-all duration-300 ease-out shadow-[0_2px_8px_rgba(26,115,232,0.3)] relative overflow-hidden hover:scale-[1.02]">
              <span class="relative z-10">概览</span>
            </button>
            <button id="tab-colors" class="flex-1 py-2.5 px-4 bg-transparent text-gray-600 text-sm font-medium cursor-pointer rounded-lg transition-all duration-300 ease-out relative hover:bg-blue-500/10 hover:text-blue-600 hover:scale-[1.01]">
              <span class="relative z-10">🎨 颜色</span>
            </button>
            <button id="tab-typography" class="flex-1 py-2.5 px-4 bg-transparent text-gray-600 text-sm font-medium cursor-pointer rounded-lg transition-all duration-300 ease-out relative hover:bg-blue-500/10 hover:text-blue-600 hover:scale-[1.01]">
              <span class="relative z-10">📝 字体</span>
            </button>
            <button id="tab-assets" class="flex-1 py-2.5 px-4 bg-transparent text-gray-600 text-sm font-medium cursor-pointer rounded-lg transition-all duration-300 ease-out relative hover:bg-blue-500/10 hover:text-blue-600 hover:scale-[1.01]">
              <span class="relative z-10">🖼️ 资源</span>
            </button>
          </div>

          <!-- Tab Content with Tailwind CSS -->
          <div id="tab-content-overview" class="opacity-100 transition-opacity duration-300 ease-out">
            <div class="text-center py-10 px-5">
              <div class="text-lg text-blue-600 mb-4 font-semibold">🎯 欢迎使用DOM Agent</div>
              <div class="text-sm text-gray-600 mb-6 leading-relaxed">点击下方按钮开始检查网页元素，体验全新的CSS Peeper风格功能！</div>
              <button class="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none py-3.5 px-7 rounded-lg text-base font-semibold cursor-pointer inline-flex items-center gap-2 transition-all duration-300 ease-out shadow-[0_4px_12px_rgba(26,115,232,0.4)] transform scale-100 hover:scale-105 hover:shadow-[0_6px_20px_rgba(26,115,232,0.6)]" id="dom-agent-inspect-btn">
                🔍 开始检查元素
              </button>
              <div class="mt-5 text-xs text-gray-500 opacity-80">选择元素后将显示详细的样式信息和定位器</div>
            </div>
          </div>

          <!-- Colors Tab with Tailwind CSS -->
          <div id="tab-content-colors" class="hidden opacity-0 transition-opacity duration-300 ease-out">
            <div class="text-center py-10 px-5">
              <div class="text-5xl mb-4">🎨</div>
              <div class="text-base text-gray-600 mb-2 font-medium">颜色调色板</div>
              <div class="text-sm text-gray-400">选择元素后显示完整的颜色信息和调色板</div>
            </div>
          </div>

          <!-- Typography Tab with Tailwind CSS -->
          <div id="tab-content-typography" class="hidden opacity-0 transition-opacity duration-300 ease-out">
            <div class="text-center py-10 px-5">
              <div class="text-5xl mb-4">📝</div>
              <div class="text-base text-gray-600 mb-2 font-medium">字体样式</div>
              <div class="text-sm text-gray-400">选择元素后显示字体家族、大小、粗细等详细信息</div>
            </div>
          </div>

          <!-- Assets Tab with Tailwind CSS -->
          <div id="tab-content-assets" class="hidden opacity-0 transition-opacity duration-300 ease-out">
            <div class="text-center py-10 px-5">
              <div class="text-5xl mb-4">🖼️</div>
              <div class="text-base text-gray-600 mb-2 font-medium">资源文件</div>
              <div class="text-sm text-gray-400">选择元素后显示背景图片、媒体文件等资源信息</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners using addEventListener instead of onclick
    const inspectBtn = panel.querySelector('#dom-agent-inspect-btn') as HTMLButtonElement;
    const closeBtn = panel.querySelector('#dom-agent-close-btn') as HTMLButtonElement;

    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        console.log('🔍 Inspect button clicked - starting element inspection');
        this.startInspection();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        console.log('❌ Close button clicked');
        overlay.remove();
      });
    }

    // Add initial tab switching functionality
    setTimeout(() => {
      console.log('🔧 DOM Agent: Setting up initial tab switching functionality');

      const tabNames = ['overview', 'colors', 'typography', 'assets'];
        tabNames.forEach(tab => {
          const tabBtn = document.getElementById(`tab-${tab}`);
          console.log(`🔧 DOM Agent: Found initial tab button for ${tab}:`, tabBtn);

          if (tabBtn) {
            // Add hover effects using Tailwind classes
            tabBtn.addEventListener('mouseenter', () => {
              if (!tabBtn.classList.contains('bg-blue-600')) {
                tabBtn.classList.add('bg-blue-500/10', 'text-blue-600', 'scale-[1.01]');
                tabBtn.classList.remove('text-gray-600');
              }
            });

            tabBtn.addEventListener('mouseleave', () => {
              if (!tabBtn.classList.contains('bg-blue-600')) {
                tabBtn.classList.remove('bg-blue-500/10', 'text-blue-600', 'scale-[1.01]');
                tabBtn.classList.add('text-gray-600');
              }
            });

            tabBtn.addEventListener('click', () => {
            console.log(`📱 DOM Agent: Initial tab clicked - ${tab}`);

              // Hide all tab contents with smooth animation
              tabNames.forEach(t => {
                const content = document.getElementById(`tab-content-${t}`);
                const btn = document.getElementById(`tab-${t}`);
                if (content) {
                  content.classList.add('opacity-0');
                  content.classList.remove('opacity-100');
                  setTimeout(() => {
                    content.classList.add('hidden');
                    content.classList.remove('block');
                  }, 150);
                }
                if (btn) {
                  btn.classList.remove('bg-blue-600', 'text-white', 'shadow-[0_2px_8px_rgba(26,115,232,0.3)]', 'scale-[1.02]');
                  btn.classList.add('bg-transparent', 'text-gray-600', 'scale-100');
                }
              });

              // Show selected tab with smooth animation
              const selectedContent = document.getElementById(`tab-content-${tab}`);
              console.log(`📱 DOM Agent: Showing initial content for ${tab}:`, selectedContent);

              if (selectedContent) {
                selectedContent.classList.remove('hidden', 'opacity-0');
                selectedContent.classList.add('block');
                setTimeout(() => {
                  selectedContent.classList.add('opacity-100');
                  selectedContent.classList.remove('opacity-0');
                }, 150);
              }

              // Highlight selected tab button with Tailwind CSS
              if (tabBtn) {
                tabBtn.classList.remove('bg-transparent', 'text-gray-600', 'scale-100');
                tabBtn.classList.add('bg-blue-600', 'text-white', 'shadow-[0_2px_8px_rgba(26,115,232,0.3)]', 'scale-[1.02]');
              }

            console.log(`✅ DOM Agent: Initial tab switch to ${tab} completed`);
          });
        }
      });

      console.log('✅ DOM Agent: Initial tab switching functionality setup complete');
    }, 100);

    // Add drag functionality
    this.addDragFunctionality(panel);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    console.log('✅ DOM Agent panel injected directly into webpage - NEW CSS PEEPER FEATURES READY!');

    // Add visual indicator that new features are ready
    const indicator = document.createElement('div');
    indicator.id = 'dom-agent-ready-indicator';
    indicator.style.cssText = `
        position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #4caf50, #45a049);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
      z-index: 2147483647;
      animation: dom-agent-bounce 0.6s ease-out;
      border: 2px solid rgba(255,255,255,0.2);
    `;
    indicator.innerHTML = '🎨 <strong>新功能就绪！</strong> 点击"检查元素"开始体验';
    document.body.appendChild(indicator);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes dom-agent-bounce {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes dom-agent-fade {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.8); }
      }
    `;
    document.head.appendChild(style);

    // Remove indicator after 5 seconds
    setTimeout(() => {
      const indicator = document.getElementById('dom-agent-ready-indicator');
      if (indicator) {
        indicator.style.animation = 'dom-agent-fade 0.5s ease-out';
        setTimeout(() => indicator.remove(), 500);
      }
    }, 5000);
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
    console.log('🚀 DOM Agent: Starting inspection...');

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
          <div style="display: flex; gap: 8px; justify-content: center;">
          <button style="
            background: #ea4335;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
          " id="dom-agent-stop-btn">停止检查</button>
            <button style="
              background: #666;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
              cursor: pointer;
            " id="dom-agent-test-btn">测试</button>
        </div>
        </div>
      `;

      // Add event listeners for the new buttons
      setTimeout(() => {
        const stopBtn = document.getElementById('dom-agent-stop-btn') as HTMLButtonElement;
        const testBtn = document.getElementById('dom-agent-test-btn') as HTMLButtonElement;

        if (stopBtn) {
          stopBtn.addEventListener('click', () => {
            console.log('🛑 Stop button clicked');
            this.stopInspection();
          });
        }

        if (testBtn) {
          testBtn.addEventListener('click', () => {
            console.log('🧪 Test button clicked');
            this.testDOMAgent();
          });
        }
      }, 100);
    }

    // Check if we can attach event listeners
    try {
      console.log('🔧 DOM Agent: Checking document ready state:', document.readyState);
      console.log('🔧 DOM Agent: Document body exists:', !!document.body);

      // Start the element inspector
      console.log('🎯 DOM Agent: Starting element inspector...');
      this.elementInspector.startInspection();
      console.log('✅ DOM Agent: Element inspector started successfully');
    } catch (error) {
      console.error('❌ DOM Agent: Failed to start element inspector:', error);
    }
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
          " id="dom-agent-start-btn">🔍 检查元素</button>
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
