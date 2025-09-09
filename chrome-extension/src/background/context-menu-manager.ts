import { Logger } from '../utils/logger';

export class ContextMenuManager {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  public async initialize(): Promise<void> {
    try {
      // Create context menu items
      await this.createContextMenus();

      // Set up context menu click handlers
      chrome.contextMenus.onClicked.addListener(this.handleContextMenuClick.bind(this));

      this.logger.info('Context menu manager initialized');
    } catch (error) {
      this.logger.error('Failed to initialize context menu manager', error);
    }
  }

  private async createContextMenus(): Promise<void> {
    // Remove existing menus first
    await chrome.contextMenus.removeAll();

    // Create main menu
    chrome.contextMenus.create({
      id: 'dom-agent-main',
      title: 'DOM Agent',
      contexts: ['page', 'selection']
    });

    // Create submenu items
    chrome.contextMenus.create({
      id: 'inspect-element',
      parentId: 'dom-agent-main',
      title: 'Inspect Element',
      contexts: ['page', 'selection']
    });

    chrome.contextMenus.create({
      id: 'capture-dom',
      parentId: 'dom-agent-main',
      title: 'Capture DOM Snapshot',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'generate-code',
      parentId: 'dom-agent-main',
      title: 'Generate Code',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'open-devtools',
      parentId: 'dom-agent-main',
      title: 'Open DevTools Panel',
      contexts: ['page']
    });

    this.logger.info('Context menus created');
  }

  private handleContextMenuClick(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab
  ): void {
    if (!tab?.id) {
      this.logger.warn('No tab ID for context menu click');
      return;
    }

    this.logger.info('Context menu clicked', { menuItemId: info.menuItemId });

    switch (info.menuItemId) {
      case 'inspect-element':
        this.handleInspectElement(tab.id, info);
        break;
      case 'capture-dom':
        this.handleCaptureDom(tab.id);
        break;
      case 'generate-code':
        this.handleGenerateCode(tab.id, info);
        break;
      case 'open-devtools':
        this.handleOpenDevTools(tab.id);
        break;
      default:
        this.logger.warn('Unknown context menu item', { menuItemId: info.menuItemId });
    }
  }

  private async handleInspectElement(tabId: number, info: chrome.contextMenus.OnClickData): Promise<void> {
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'START_INSPECTION',
        payload: {
          // Note: OnClickData doesn't have x,y coordinates in standard Chrome API
          // The coordinates would need to be captured differently if needed
        }
      });
    } catch (error) {
      this.logger.error('Failed to start inspection', error);
    }
  }

  private handleCaptureDom(tabId: number): void {
    chrome.tabs.sendMessage(tabId, {
      type: 'CAPTURE_DOM',
      payload: {
        fullPage: true
      }
    }).catch((error) => {
      this.logger.error('Failed to capture DOM', error);
    });
  }

  private handleGenerateCode(tabId: number, info: chrome.contextMenus.OnClickData): void {
    chrome.tabs.sendMessage(tabId, {
      type: 'GENERATE_CODE',
      payload: {
        selectedText: info.selectionText
      }
    }).catch((error) => {
      this.logger.error('Failed to generate code', error);
    });
  }

  private handleOpenDevTools(tabId: number): void {
    // Open the devtools panel
    chrome.tabs.sendMessage(tabId, {
      type: 'OPEN_DEVTOOLS_PANEL'
    }).catch((error) => {
      this.logger.error('Failed to open devtools panel', error);
    });
  }

  public async updateContextMenus(settings: any): Promise<void> {
    try {
      // Update context menus based on settings
      if (settings.advancedMode) {
        // Add advanced menu items
        chrome.contextMenus.create({
          id: 'advanced-analysis',
          parentId: 'dom-agent-main',
          title: 'Advanced Analysis',
          contexts: ['page']
        });
      } else {
        // Remove advanced menu items
        try {
          chrome.contextMenus.remove('advanced-analysis');
        } catch (error) {
          // Ignore if menu doesn't exist
        }
      }
    } catch (error) {
      this.logger.error('Failed to update context menus', error);
    }
  }
}
