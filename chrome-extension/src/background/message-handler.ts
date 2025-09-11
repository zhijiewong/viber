import { Logger } from '../utils/logger';

export interface ExtensionMessage {
  type: string;
  payload?: any;
  tabId?: number;
  windowId?: number;
}

export class MessageHandler {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  public initialize(): void {
    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener(
      (message: ExtensionMessage, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
        return true; // Keep message channel open for async responses
      }
    );

    // Handle messages from devtools
    chrome.runtime.onMessageExternal.addListener(
      (message: ExtensionMessage, sender, sendResponse) => {
        this.handleExternalMessage(message, sender, sendResponse);
        return true;
      }
    );

    this.logger.info('Message handler initialized');
  }

  private async handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      console.log(`📨 Background: Received message type: ${message.type} from sender:`, sender);
      this.logger.debug('Received message', { type: message.type, sender: sender.id });

      switch (message.type) {
        case 'CAPTURE_DOM':
          await this.handleDomCapture(message, sender, sendResponse);
          break;
        case 'GET_TAB_INFO':
          await this.handleGetTabInfo(message, sender, sendResponse);
          break;
        case 'OPEN_DEVTOOLS':
          await this.handleOpenDevTools(message, sender, sendResponse);
          break;
        case 'SAVE_SETTINGS':
          await this.handleSaveSettings(message, sender, sendResponse);
          break;
        case 'GET_SETTINGS':
          await this.handleGetSettings(message, sender, sendResponse);
          break;
        case 'START_INSPECTION':
          console.log('🎯 Background: Handling START_INSPECTION message');
          await this.handleContentScriptMessage(message, sender, sendResponse);
          break;
        case 'STOP_INSPECTION':
          console.log('🛑 Background: Handling STOP_INSPECTION message');
          await this.handleContentScriptMessage(message, sender, sendResponse);
          break;
        case 'GENERATE_CODE':
          console.log('💻 Background: Handling GENERATE_CODE message');
          await this.handleContentScriptMessage(message, sender, sendResponse);
          break;
        case 'HIGHLIGHT_ELEMENT':
          console.log('🎯 Background: Handling HIGHLIGHT_ELEMENT message');
          await this.handleContentScriptMessage(message, sender, sendResponse);
          break;
        case 'OPEN_DEVTOOLS_PANEL':
          console.log('🛠️ Background: Handling OPEN_DEVTOOLS_PANEL message');
          await this.handleContentScriptMessage(message, sender, sendResponse);
          break;
        case 'LOG_ERROR':
          console.log('📝 Background: Handling LOG_ERROR message');
          await this.handleLogError(message, sender, sendResponse);
          break;
        case 'ELEMENT_SELECTED':
          console.log('🎯 Background: Handling ELEMENT_SELECTED message');
          await this.handleElementSelected(message, sender, sendResponse);
          break;
        default:
          this.logger.warn('Unknown message type', { type: message.type });
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      this.logger.error('Error handling message', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleExternalMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    // Handle messages from devtools panel
    this.logger.debug('Received external message', { type: message.type });

    // Forward devtools messages to content scripts
    if (message.tabId) {
      await this.sendMessageToTab(message.tabId, message);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No tab ID provided' });
    }
  }

  private async handleDomCapture(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      const tabId = sender.tab?.id;
      if (!tabId) {
        throw new Error('No tab ID available for DOM capture');
      }

      // Forward capture request to content script
      const response = await this.sendMessageToTab(tabId, {
        type: 'CAPTURE_DOM',
        payload: message.payload
      });

      sendResponse({ success: true, data: response });
    } catch (error) {
      this.logger.error('DOM capture failed', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'DOM capture failed'
      });
    }
  }

  private async handleGetTabInfo(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      const tabId = sender.tab?.id;
      if (!tabId) {
        throw new Error('No tab ID available');
      }

      const tab = await chrome.tabs.get(tabId);
      sendResponse({
        success: true,
        data: {
          id: tab.id,
          url: tab.url,
          title: tab.title,
          favIconUrl: tab.favIconUrl
        }
      });
    } catch (error) {
      this.logger.error('Failed to get tab info', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tab info'
      });
    }
  }

  private async handleOpenDevTools(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      const tabId = sender.tab?.id;
      if (!tabId) {
        throw new Error('No tab ID available');
      }

      await chrome.debugger.attach({ tabId }, '1.3');
      sendResponse({ success: true });
    } catch (error) {
      this.logger.error('Failed to open devtools', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open devtools'
      });
    }
  }

  private async handleSaveSettings(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      await chrome.storage.sync.set(message.payload || {});
      sendResponse({ success: true });
    } catch (error) {
      this.logger.error('Failed to save settings', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save settings'
      });
    }
  }

  private async handleGetSettings(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      const settings = await chrome.storage.sync.get(null);
      sendResponse({ success: true, data: settings });
    } catch (error) {
      this.logger.error('Failed to get settings', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get settings'
      });
    }
  }

  private async handleLogError(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      // Log the error received from content script or other parts
      console.log('📝 Background: Received LOG_ERROR:', message.payload);
      this.logger.error('Received error from extension component', message.payload);

      // Could potentially store errors for debugging or send to external logging service
      // For now, just acknowledge receipt
      sendResponse({ success: true });
    } catch (error) {
      this.logger.error('Failed to handle log error', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle log error'
      });
    }
  }

  private async handleElementSelected(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      console.log('🎯 Background: Element selected:', message.payload);

      // Forward element selection to devtools if available
      if (sender.tab?.id) {
        // Could forward to devtools panel here
        this.logger.debug('Element selected in tab', { tabId: sender.tab.id, element: message.payload });
      }

      sendResponse({ success: true });
    } catch (error) {
      this.logger.error('Failed to handle element selection', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle element selection'
      });
    }
  }

  public async sendMessageToTab(tabId: number, message: ExtensionMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`📤 Background: Sending ${message.type} to tab ${tabId}`);
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.error(`❌ Background: chrome.runtime.lastError when sending to tab ${tabId}:`, chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log(`✅ Background: Successfully sent to tab ${tabId}, response:`, response);
          resolve(response);
        }
      });
    });
  }

  private async handleContentScriptMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      console.log(`🔄 Background: handleContentScriptMessage called for ${message.type}`);

      // If message has a tabId, use it; otherwise use sender's tab
      const targetTabId = message.tabId || sender.tab?.id;
      console.log(`🎯 Background: Target tab ID: ${targetTabId}, sender tab: ${sender.tab?.id}, message tabId: ${message.tabId}`);

      if (!targetTabId) {
        console.log(`❌ Background: No target tab ID available`);
        sendResponse({ success: false, error: 'No target tab ID available' });
        return;
      }

      // First, check if the tab exists and is accessible
      try {
        const tab = await chrome.tabs.get(targetTabId);
        console.log(`📋 Background: Tab info:`, { id: tab.id, url: tab.url, status: tab.status });

        // Check if tab is ready (not loading)
        if (tab.status !== 'complete') {
          console.log(`⏳ Background: Tab is still loading, status: ${tab.status}`);
          sendResponse({ success: false, error: 'Tab is still loading' });
          return;
        }

        // Check if URL is supported for content script injection
        if (!tab.url || !this.isValidUrlForInjection(tab.url)) {
          console.log(`🚫 Background: Content script not supported on URL: ${tab.url}`);
          sendResponse({ success: false, error: 'Content script not supported on this URL' });
          return;
        }
      } catch (tabError) {
        console.error(`❌ Background: Failed to get tab info:`, tabError);
        sendResponse({ success: false, error: 'Tab not accessible' });
        return;
      }

      console.log(`📤 Background: Forwarding ${message.type} to content script in tab ${targetTabId}`);
      // Forward the message to the content script
      const response = await this.sendMessageToTab(targetTabId, message);
      console.log(`📥 Background: Received response from content script:`, response);
      sendResponse({ success: true, data: response });
    } catch (error) {
      console.error(`❌ Background: Failed to handle content script message:`, error);
      this.logger.error('Failed to handle content script message', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle content script message'
      });
    }
  }

  public broadcastMessage(message: ExtensionMessage): void {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message).catch((error) => {
            this.logger.warn('Failed to send message to tab', { tabId: tab.id, error });
          });
        }
      });
    });
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
}
