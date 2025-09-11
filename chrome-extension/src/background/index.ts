import { Logger } from '../utils/logger';
import { MessageHandler } from './message-handler';
import { ContextMenuManager } from './context-menu-manager';
import { TabManager } from './tab-manager';

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

class BackgroundService {
  private logger: Logger;
  private messageHandler: MessageHandler;
  private contextMenuManager: ContextMenuManager;
  private tabManager: TabManager;

  constructor() {
    this.logger = Logger.getInstance();
    this.logger.info('🚀 DOM Agent Chrome Extension background service starting...');

    this.messageHandler = new MessageHandler();
    this.contextMenuManager = new ContextMenuManager();
    this.tabManager = new TabManager();

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Set up message handling
      this.messageHandler.initialize();

      // Set up context menus
      await this.contextMenuManager.initialize();

      // Set up tab management
      this.tabManager.initialize();

      // Set up command listeners
      this.setupCommandListeners();

      // Set up extension lifecycle listeners
      this.setupLifecycleListeners();

      this.logger.info('✅ DOM Agent Chrome Extension background service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize background service', error);
    }
  }

  private setupCommandListeners(): void {
    chrome.commands.onCommand.addListener((command) => {
      this.logger.info('Command received', { command });

      switch (command) {
        case 'inspect-element':
          this.handleInspectElementCommand();
          break;
        case 'generate-code':
          this.handleGenerateCodeCommand();
          break;
        default:
          this.logger.warn('Unknown command', { command });
      }
    });
  }

  private setupLifecycleListeners(): void {
    // Handle extension installation/updates
    chrome.runtime.onInstalled.addListener((details) => {
      this.logger.info('Extension installed/updated', { reason: details.reason });

      if (details.reason === 'install') {
        this.handleFirstInstall();
      } else if (details.reason === 'update') {
        this.handleUpdate(details.previousVersion);
      }
    });

    // Handle extension startup
    chrome.runtime.onStartup.addListener(() => {
      this.logger.info('Extension startup');
    });

    // Handle extension suspension
    chrome.runtime.onSuspend.addListener(() => {
      this.logger.info('Extension suspending');
    });

    // Set up programmatic content script injection for restricted domains
    this.setupProgrammaticInjection();
  }

  private setupProgrammaticInjection(): void {
    // Listen for tab updates to inject content script on restricted domains
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      console.log(`🔄 Background: Tab update detected for tab ${tabId}:`, { status: changeInfo.status, url: tab?.url });

      if (changeInfo.status === 'complete' && tab.url) {
        // Validate URL before attempting injection
        if (!this.isValidUrlForInjection(tab.url)) {
          console.log(`🚫 Background: URL not supported for content script injection: ${tab.url}`);
          return;
        }

        // Check if this domain requires programmatic injection
        if (this.shouldInjectProgrammatically(tab.url)) {
          console.log(`🎯 Background: Domain requires programmatic injection, attempting for tab ${tabId}`);
          console.log(`📋 Background: Tab details:`, { id: tab.id, url: tab.url, status: tab.status });

          await this.attemptContentScriptInjection(tabId, tab);
        } else {
          console.log(`🚫 Background: Domain does not require programmatic injection: ${tab.url}`);
        }
      }
    });

    console.log('🔧 Background: Programmatic content script injection setup complete');
  }

  private isValidUrlForInjection(url: string): boolean {
    try {
      const urlObj = new URL(url);

      // Check if it's a supported protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        console.log(`🚫 Background: Unsupported protocol: ${urlObj.protocol}`);
        return false;
      }

      // Check for Chrome internal URLs that cannot have content scripts
      if (url.startsWith('chrome://') ||
          url.startsWith('chrome-extension://') ||
          url.startsWith('about:') ||
          url.startsWith('data:') ||
          url.startsWith('file:') ||
          url.startsWith('view-source:')) {
        console.log(`🚫 Background: Chrome internal URL not supported: ${url}`);
        return false;
      }

      // Check for other restricted schemes
      if (urlObj.protocol === 'javascript:' ||
          urlObj.protocol === 'vbscript:' ||
          urlObj.protocol === 'data:') {
        console.log(`🚫 Background: Restricted protocol: ${urlObj.protocol}`);
        return false;
      }

      return true;
    } catch (error) {
      console.log(`🚫 Background: Invalid URL format: ${url}`, error);
      return false;
    }
  }

  private shouldInjectProgrammatically(url: string): boolean {
    try {
      // For now, only inject programmatically on Google domains
      // This can be expanded to include other domains that block content scripts
      const googleDomains = ['google.com', 'googleusercontent.com', 'youtube.com', 'gmail.com'];

      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      return googleDomains.some(domain => hostname.includes(domain));
    } catch (error) {
      console.log(`🚫 Background: Error checking if programmatic injection needed: ${url}`, error);
      return false;
    }
  }

  private async attemptContentScriptInjection(tabId: number, tab: chrome.tabs.Tab): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log(`📤 Background: Executing content script injection for tab ${tabId} (attempt ${retryCount + 1}/${maxRetries})`);

        // Wait for the page to settle (longer wait on first attempt)
        const waitTime = retryCount === 0 ? 1500 : 500;
        await new Promise(resolve => setTimeout(resolve, waitTime));

        // Inject the content script programmatically
        const result = await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js']
        });
        console.log(`✅ Background: Content script injection result:`, result);

        // Also inject the CSS if needed
        console.log(`🎨 Background: Injecting CSS for tab ${tabId}`);
        const cssResult = await chrome.scripting.insertCSS({
          target: { tabId },
          files: ['content.css']
        });
        console.log(`✅ Background: CSS injection result:`, cssResult);

        console.log(`🎉 Background: Successfully injected content script and CSS into tab ${tabId}`);

        // Verify the injection worked by trying to send a test message
        try {
          const testResponse = await this.messageHandler.sendMessageToTab(tabId, { type: 'PING' });
          console.log(`🔍 Background: Test message response:`, testResponse);
        } catch (testError) {
          console.log(`⚠️ Background: Test message failed (this is expected initially):`, testError);
        }

        return; // Success, exit the retry loop

      } catch (error) {
        retryCount++;
        console.error(`❌ Background: Failed to inject content script into tab ${tabId} (attempt ${retryCount}/${maxRetries}):`, error);

        if (retryCount >= maxRetries) {
          console.error(`❌ Background: All injection attempts failed for tab ${tabId}`);
          console.error(`❌ Background: Final error details:`, error instanceof Error ? error.message : error);
          this.logger.error('Failed to inject content script programmatically after all retries', {
            tabId,
            url: tab.url,
            attempts: maxRetries,
            error: error instanceof Error ? error.message : error
          });
        } else {
          console.log(`🔄 Background: Retrying injection for tab ${tabId} in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  private handleInspectElementCommand(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Inject DOM Agent panel directly into the webpage
        this.injectDOMAgentIntoPage(tabs[0].id);
      }
    });
  }

  private async injectDOMAgentIntoPage(tabId: number): Promise<void> {
    try {
      // First, ensure content script is loaded
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });

      // Then send message to inject the DOM Agent panel
      await chrome.tabs.sendMessage(tabId, {
        type: 'INJECT_DOM_AGENT_PANEL'
      });

      console.log('✅ DOM Agent panel injection initiated for tab:', tabId);
    } catch (error) {
      console.error('❌ Failed to inject DOM Agent panel:', error);

      // Fallback: try to open in separate window
      this.openDomAgentWindow(tabId);
    }
  }

  private async openDomAgentWindow(tabId: number): Promise<void> {
    try {
      // Create a floating window for better drag experience
      const window = await chrome.windows.create({
        url: chrome.runtime.getURL('popup.html'),
        type: 'popup',
        width: 420,
        height: 700,
        left: Math.max(0, (screen.width - 420) / 2),
        top: Math.max(0, (screen.height - 700) / 2),
        focused: true
      });

      if (window.id) {
        // Store the window ID for later use
        console.log('DOM Agent window created:', window.id);
        this.messageHandler.broadcastMessage({
          type: 'START_INSPECTION',
          tabId: tabId,
          windowId: window.id
        });
      }
    } catch (error) {
      console.error('Failed to create DOM Agent window:', error);
      // Fallback to regular popup
      this.messageHandler.broadcastMessage({
        type: 'START_INSPECTION',
        tabId: tabId
      });
    }
  }

  private handleGenerateCodeCommand(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Use the message handler to route through proper channels
        this.messageHandler.broadcastMessage({
          type: 'GENERATE_CODE',
          tabId: tabs[0].id
        });
      }
    });
  }

  private handleFirstInstall(): void {
    // Set default settings
    chrome.storage.sync.set({
      defaultBrowser: 'chromium',
      autoDetectDevServer: true,
      inspectionMode: 'hover',
      codeGenerationFramework: 'react'
    });

    this.logger.info('Default settings initialized');
  }

  private handleUpdate(previousVersion?: string): void {
    this.logger.info('Extension updated', { from: previousVersion });
  }
}

// Initialize the background service
new BackgroundService();

// Export for testing
export { BackgroundService };
