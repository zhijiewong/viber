import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
import { ElementInfo, WebviewMessage } from '../../types';
import { EventBus } from '../../utils/EventBus';

export class MessageHandler {
  private readonly logger: Logger;
  private readonly eventBus: EventBus;
  private panel: vscode.WebviewPanel | undefined;
  private onRefreshCapture?: () => Promise<void>;
  private onElementSelected?: (element: ElementInfo) => void;

  constructor(panel?: vscode.WebviewPanel) {
    this.logger = Logger.getInstance();
    this.eventBus = EventBus.getInstance();
    this.panel = panel;
    this.setupEventListeners();
  }

  public setPanel(panel: vscode.WebviewPanel): void {
    this.panel = panel;
  }

  public setRefreshHandler(handler: () => Promise<void>): void {
    this.onRefreshCapture = handler;
  }

  public setElementSelectedHandler(handler: (element: ElementInfo) => void): void {
    this.onElementSelected = handler;
  }

  private setupEventListeners(): void {
    // Listen to EventBus events
    this.eventBus.on('element:selected', (element: ElementInfo) => {
      this.sendMessage({
        type: 'element-selected',
        payload: { element },
      });
    });

    this.eventBus.on('capture:started', () => {
      this.logger.info('Capture started via EventBus');
    });

    this.eventBus.on('capture:completed', (data: any) => {
      this.logger.info('Capture completed via EventBus', data);
    });

    this.eventBus.on('error:occurred', (error: Error) => {
      this.logger.error('Error occurred via EventBus', { error: error.message });
      this.sendMessage({
        type: 'error',
        payload: { error: error.message },
      });
    });
  }

  public setupMessageHandling(): void {
    if (!this.panel) {
      this.logger.warn('Cannot setup message handling - no panel available');
      return;
    }

    this.panel.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      try {
        await this.handleMessage(message);
        // Emit event to EventBus for other components to listen
        this.eventBus.emit('webview:message', message);
      } catch (error) {
        this.logger.error('Error handling webview message', {
          messageType: message.type,
          error: error instanceof Error ? error.message : String(error),
        });
        this.eventBus.emit(
          'error:occurred',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    });
  }

  private async handleMessage(message: WebviewMessage): Promise<void> {
    this.logger.debug('Received webview message', { type: message.type });

    switch (message.type) {
      case 'refresh-capture':
        await this.handleRefreshCapture();
        break;

      case 'element-selected':
        this.handleElementSelected(message.payload);
        break;

      case 'open-cursor-chat':
        await this.handleOpenCursorChat(message.payload);
        break;

      case 'copy-to-clipboard':
        this.handleCopyToClipboard(message.payload);
        break;

      default:
        this.logger.warn('Unknown message type', { type: message.type });
    }
  }

  private async handleRefreshCapture(): Promise<void> {
    this.logger.info('Refresh capture requested');
    this.eventBus.emit('capture:refresh-requested');
    if (this.onRefreshCapture) {
      await this.onRefreshCapture();
    }
  }

  private handleElementSelected(payload: any): void {
    if (payload && payload.element) {
      this.logger.info('Element selected', {
        tag: payload.element.tag,
        id: payload.element.id,
        classes: payload.element.classes,
      });

      // Emit to EventBus for other components
      this.eventBus.emit('element:selected', payload.element);

      if (this.onElementSelected) {
        this.onElementSelected(payload.element);
      }
    }
  }

  private async handleOpenCursorChat(payload: any): Promise<void> {
    if (!payload || !payload.element) {
      this.logger.warn('Cannot open Cursor Chat - no element provided');
      return;
    }

    try {
      const element = payload.element;
      const framework = payload.framework || 'react';
      const type = payload.type || 'component';

      // Emit cursor chat request to EventBus
      this.eventBus.emit('cursor:chat-requested', { element, framework, type });

      // Generate prompt based on element
      const prompt = this.generateCursorPrompt(element, framework, type);

      // Open Cursor Chat with the generated prompt
      await this.openCursorWithPrompt(prompt);

      // Send success message back to webview
      this.sendMessage({
        type: 'cursor-chat-opened',
        payload: { element, framework, type },
      });

      // Emit success to EventBus
      this.eventBus.emit('cursor:chat-opened', { element, framework, type, prompt });
    } catch (error) {
      this.logger.error('Failed to open Cursor Chat', { error });

      // Emit error to EventBus
      this.eventBus.emit(
        'error:occurred',
        error instanceof Error ? error : new Error(String(error))
      );

      // Send error message back to webview
      this.sendMessage({
        type: 'cursor-chat-error',
        payload: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  private handleCopyToClipboard(payload: any): void {
    if (payload && payload.text) {
      // Emit clipboard request to EventBus
      this.eventBus.emit('clipboard:copy-requested', { text: payload.text, type: payload.type });

      // Copy to clipboard using VS Code API
      Promise.resolve(vscode.env.clipboard.writeText(payload.text))
        .then(() => {
          this.logger.info('Copied to clipboard', { text: payload.text.substring(0, 100) });
          vscode.window.showInformationMessage(`Copied ${payload.type || 'text'} to clipboard`);

          // Emit success to EventBus
          this.eventBus.emit('clipboard:copy-completed', {
            text: payload.text,
            type: payload.type,
          });
        })
        .catch((error: Error) => {
          this.logger.error('Failed to copy to clipboard', { error });
          vscode.window.showErrorMessage('Failed to copy to clipboard');

          // Emit error to EventBus
          this.eventBus.emit('error:occurred', error);
        });
    }
  }

  private generateCursorPrompt(element: ElementInfo, framework: string, type: string): string {
    const elementDescription = [
      `Tag: <${element.tag}>`,
      element.id ? `ID: ${element.id}` : '',
      element.classes.length > 0 ? `Classes: ${element.classes.join(', ')}` : '',
      element.textContent ? `Text: "${element.textContent}"` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const attributesDescription =
      Object.keys(element.attributes).length > 0
        ? `Attributes:\\n${Object.entries(element.attributes)
            .map(([key, value]) => `  ${key}: ${value}`)
            .join('\\n')}`
        : '';

    return `Create a ${framework} ${type} for this HTML element:

${elementDescription}

${attributesDescription}

CSS Selector: ${element.cssSelector}
XPath: ${element.xpath}

Please generate the appropriate ${framework} code for this element, including any necessary styling and functionality.`;
  }

  private async openCursorWithPrompt(prompt: string): Promise<void> {
    // Try to execute Cursor command
    try {
      // First try to open Cursor directly
      await vscode.commands.executeCommand('cursor.openChat', { prompt });
    } catch (error) {
      // If direct command fails, try alternative approaches
      this.logger.warn('Direct Cursor command failed, trying alternatives', { error });

      // Copy prompt to clipboard as fallback
      await vscode.env.clipboard.writeText(prompt);
      const selection = await vscode.window.showInformationMessage(
        'Cursor Chat prompt copied to clipboard. Please paste it in Cursor Chat.',
        'Open Cursor'
      );

      if (selection === 'Open Cursor') {
        await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('cursor://'));
      }
    }
  }

  public sendMessage(message: WebviewMessage): void {
    if (this.panel) {
      this.panel.webview.postMessage(message);
    }
  }
}
