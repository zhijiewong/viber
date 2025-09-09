import { Logger } from '../utils/logger';

export class TabManager {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  public initialize(): void {
    try {
      // Set up tab event listeners
      this.setupTabListeners();

      this.logger.info('Tab manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize tab manager', error);
    }
  }

  private setupTabListeners(): void {
    // Listen for tab creation
    chrome.tabs.onCreated.addListener((tab) => {
      this.logger.debug('Tab created', { tabId: tab.id, url: tab.url });
    });

    // Listen for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.logger.debug('Tab updated', { tabId, url: tab.url });
      }
    });

    // Listen for tab activation
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.logger.debug('Tab activated', { tabId: activeInfo.tabId });
    });

    // Listen for tab removal
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      this.logger.debug('Tab removed', { tabId, wasWindowClosing: removeInfo.isWindowClosing });
    });
  }

  public async getActiveTab(): Promise<chrome.tabs.Tab | null> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      return tabs[0] || null;
    } catch (error) {
      this.logger.error('Failed to get active tab', error);
      return null;
    }
  }

  public async getAllTabs(): Promise<chrome.tabs.Tab[]> {
    try {
      return await chrome.tabs.query({});
    } catch (error) {
      this.logger.error('Failed to get all tabs', error);
      return [];
    }
  }

  public async switchToTab(tabId: number): Promise<void> {
    try {
      await chrome.tabs.update(tabId, { active: true });
      this.logger.debug('Switched to tab', { tabId });
    } catch (error) {
      this.logger.error('Failed to switch to tab', error);
    }
  }

  public async closeTab(tabId: number): Promise<void> {
    try {
      await chrome.tabs.remove(tabId);
      this.logger.debug('Closed tab', { tabId });
    } catch (error) {
      this.logger.error('Failed to close tab', error);
    }
  }
}
