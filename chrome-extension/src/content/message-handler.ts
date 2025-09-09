import { Logger } from '../utils/logger';

export interface ContentMessage {
  type: string;
  payload?: any;
}

export class MessageHandler {
  private logger: Logger;
  private messageHandlers: Map<string, (message: ContentMessage, sender: any, sendResponse: (response?: any) => void) => void>;

  constructor() {
    this.logger = Logger.getInstance();
    this.messageHandlers = new Map();
  }

  public initialize(): void {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(
      (message: ContentMessage, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
      }
    );

    // Listen for messages from popup/devtools
    window.addEventListener('message', (event) => {
      // Only accept messages from the same origin or extension
      if (event.source !== window && event.origin !== window.location.origin) {
        return;
      }

      this.handleWindowMessage(event.data);
    });

    this.logger.info('Content message handler initialized');
  }

  private async handleMessage(
    message: ContentMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      console.log(`📨 DOM Agent: Received message type: ${message.type}`);
      console.log(`📊 DOM Agent: Available handlers: ${Array.from(this.messageHandlers.keys()).join(', ')}`);

      this.logger.debug('Content script received message', { type: message.type });

      // Handle the message with the provided handler
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        console.log(`✅ DOM Agent: Found handler for ${message.type}, calling handler...`);
        await handler(message, sender, sendResponse);
      } else {
        console.log(`❌ DOM Agent: No handler found for ${message.type}`);
        // Default handling
        switch (message.type) {
          case 'PING':
            console.log('🏓 DOM Agent: PING received');
            sendResponse({ success: true, pong: true });
            break;
          default:
            console.log(`🚫 DOM Agent: Unknown message type: ${message.type}`);
            this.logger.warn('Unknown message type', { type: message.type });
            sendResponse({ success: false, error: 'Unknown message type' });
        }
      }
    } catch (error) {
      console.error(`❌ DOM Agent: Error handling message ${message.type}:`, error);
      this.logger.error('Error handling message', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private handleWindowMessage(message: any): void {
    try {
      if (!message || typeof message !== 'object' || !message.type) {
        return;
      }

      this.logger.debug('Content script received window message', { type: message.type });

      // Forward window messages to background script
      chrome.runtime.sendMessage(message).catch((error) => {
        this.logger.warn('Failed to forward window message to background', error);
      });
    } catch (error) {
      this.logger.error('Error handling window message', error);
    }
  }

  public sendMessageToBackground(message: ContentMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  public sendMessageToWindow(message: any): void {
    window.postMessage(message, window.location.origin);
  }

  public broadcastMessage(message: ContentMessage): void {
    // Send to background script
    this.sendMessageToBackground(message).catch((error) => {
      this.logger.warn('Failed to send message to background', error);
    });

    // Send to window (for devtools/popup)
    this.sendMessageToWindow(message);
  }

  public registerHandler(type: string, handler: (message: ContentMessage, sender: any, sendResponse: (response?: any) => void) => void): void {
    console.log(`📝 DOM Agent: Registering handler for type: ${type}`);
    this.messageHandlers.set(type, handler);
    console.log(`✅ DOM Agent: Handler registered for ${type}. Total handlers: ${this.messageHandlers.size}`);
  }

  public unregisterHandler(type: string): void {
    this.messageHandlers.delete(type);
  }
}
