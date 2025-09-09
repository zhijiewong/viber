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
        // Check if this is a Google domain
        if (tab.url.includes('google.com') || tab.url.includes('googleusercontent.com')) {
          console.log(`🎯 Background: Detected Google domain, attempting injection for tab ${tabId}`);
          console.log(`📋 Background: Tab details:`, { id: tab.id, url: tab.url, status: tab.status });

          try {
            // Wait a bit for the page to fully settle
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Inject the content script programmatically
            console.log(`📤 Background: Executing content script injection for tab ${tabId}`);
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

            console.log(`🎉 Background: Successfully injected content script and CSS into Google tab ${tabId}`);

            // Verify the injection worked by trying to send a test message
            try {
              const testResponse = await this.messageHandler.sendMessageToTab(tabId, { type: 'PING' });
              console.log(`🔍 Background: Test message response:`, testResponse);
            } catch (testError) {
              console.log(`⚠️ Background: Test message failed (this is expected initially):`, testError);
            }

          } catch (error) {
            console.error(`❌ Background: Failed to inject content script into Google tab ${tabId}:`, error);
            console.error(`❌ Background: Error details:`, error instanceof Error ? error.message : error);
            this.logger.error('Failed to inject content script programmatically', error);
          }
        } else {
          console.log(`🚫 Background: Not a Google domain: ${tab.url}`);
        }
      }
    });

    console.log('🔧 Background: Programmatic content script injection setup complete');
  }

  private handleInspectElementCommand(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Use the message handler to route through proper channels
        this.messageHandler.broadcastMessage({
          type: 'START_INSPECTION',
          tabId: tabs[0].id
        });
      }
    });
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
