import * as vscode from 'vscode';
import { ElementInfo, DOMSnapshot, CaptureOptions } from '../types';
import { Logger } from '../utils/logger';
import { PlaywrightCapture } from '../capture/PlaywrightCapture';
import { ContentGenerator } from './components/ContentGenerator';
import { MessageHandler } from './components/MessageHandler';

export class WebviewProvider {
  private panel: vscode.WebviewPanel | undefined;
  private readonly context: vscode.ExtensionContext;
  private readonly logger: Logger;
  private readonly playwrightCapture: PlaywrightCapture;
  private readonly contentGenerator: ContentGenerator;
  private readonly messageHandler: MessageHandler;
  private selectedElement: ElementInfo | undefined;
  private currentSnapshot: DOMSnapshot | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.logger = Logger.getInstance();

    try {
      this.logger.info('Initializing PlaywrightCapture...');
      this.playwrightCapture = new PlaywrightCapture();
      this.logger.info('PlaywrightCapture initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize PlaywrightCapture', error);
      throw error;
    }

    try {
      this.logger.info('Initializing ContentGenerator...');
      this.contentGenerator = new ContentGenerator();
      this.logger.info('ContentGenerator initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize ContentGenerator', error);
      throw error;
    }

    try {
      this.logger.info('Initializing MessageHandler...');
      this.messageHandler = new MessageHandler();
      this.logger.info('MessageHandler initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MessageHandler', error);
      throw error;
    }

    this.setupMessageHandlers();
    this.logger.info('WebviewProvider constructor completed');
  }

  private setupMessageHandlers(): void {
    this.messageHandler.setRefreshHandler(async () => {
      if (this.currentSnapshot) {
        await this.refreshCapture();
      }
    });

    this.messageHandler.setElementSelectedHandler((element: ElementInfo) => {
      this.selectedElement = element;
      this.logger.info('Element selected via message handler', {
        tag: element.tag,
        id: element.id,
      });
    });
  }

  public async captureAndShowWebpage(url: string): Promise<void> {
    this.logger.info('Starting webpage capture', { url });

    try {
      // Create webview panel first
      this.createWebviewPanel();

      // Show loading state with logo
      const loadingLogoUri = this.panel?.webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'logo.png')
      );
      const loadingLogoUrl = loadingLogoUri?.toString();
      this.updateWebviewContent(this.contentGenerator.generateLoadingContent(loadingLogoUrl));

      // Capture the webpage
      const snapshot = await this.captureWebpage(url);
      this.currentSnapshot = snapshot;

      // Generate and display interactive content using professional HTML processor
      const panelLogoUri = this.panel?.webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'logo.png')
      );
      const panelLogoUrl = panelLogoUri?.toString();
      const webviewUri = this.panel?.webview
        .asWebviewUri(this.context.extensionUri)
        .toString();
      const interactiveContent = this.contentGenerator.generateInteractiveContent(
        snapshot,
        panelLogoUrl,
        webviewUri
      );
      this.updateWebviewContent(interactiveContent);

      this.logger.info('Webpage capture completed successfully');
    } catch (error) {
      this.logger.error('Failed to capture webpage', { url, error });
      this.handleCaptureError(error instanceof Error ? error.message : String(error));
    }
  }

  private async captureWebpage(url: string): Promise<DOMSnapshot> {
    const captureOptions: CaptureOptions = this.getCaptureOptions();

    this.logger.info('Starting webpage capture with Playwright', { url, options: captureOptions });
    const snapshot = await this.playwrightCapture.captureDOM(url, captureOptions);

    this.logger.info('Playwright capture completed', {
      url: snapshot.url,
      htmlLength: snapshot.html.length,
      timestamp: snapshot.timestamp,
    });

    return snapshot;
  }

  private getCaptureOptions(): CaptureOptions {
    let config;
    try {
      config = vscode.workspace.getConfiguration('domAgent');
    } catch (error) {
      config = { get: () => undefined };
    }

    return {
      browser: config?.get?.('defaultBrowser') ?? 'chromium',
      viewport: { width: 1280, height: 720 },
      timeout: 30000,
    };
  }

  private createWebviewPanel(): void {
    if (this.panel) {
      this.panel.dispose();
    }

    this.panel = vscode.window.createWebviewPanel('domAgent', 'DOM Agent', vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        this.context.extensionUri,
        vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview', 'libs'),
      ],
      portMapping: [],
      enableForms: false,
      enableCommandUris: false,
    });

    this.setupPanelEventHandlers();
  }

  private setupPanelEventHandlers(): void {
    if (!this.panel) {
      return;
    }

    // Setup message handling
    this.messageHandler.setPanel(this.panel);
    this.messageHandler.setupMessageHandling();

    // Handle panel disposal
    this.panel.onDidDispose(() => {
      this.logger.info('Webview panel disposed');
      this.panel = undefined;
      this.selectedElement = undefined;
      this.currentSnapshot = undefined;
    });

    // Handle visibility changes
    this.panel.onDidChangeViewState(e => {
      if (e.webviewPanel.visible) {
        this.logger.debug('Webview became visible');
      } else {
        this.logger.debug('Webview became hidden');
      }
    });
  }

  private updateWebviewContent(content: string): void {
    if (this.panel) {
      this.panel.webview.html = content;
      this.logger.debug('Webview content updated');
    }
  }

  private async refreshCapture(): Promise<void> {
    if (!this.currentSnapshot) {
      this.logger.warn('Cannot refresh - no current snapshot');
      return;
    }

    this.logger.info('Refreshing webpage capture');

    try {
      // Show loading state with logo
      const refreshLoadingLogoUri = this.panel?.webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'logo.png')
      );
      const refreshLoadingLogoUrl = refreshLoadingLogoUri?.toString();
      this.updateWebviewContent(
        this.contentGenerator.generateLoadingContent(refreshLoadingLogoUrl)
      );

      // Re-capture the same URL
      const snapshot = await this.captureWebpage(this.currentSnapshot.url);
      this.currentSnapshot = snapshot;

      // Update content using professional HTML processor
      const refreshLogoUri = this.panel?.webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, 'src', 'image', 'DOM_Agent.png')
      );
      const refreshLogoUrl = refreshLogoUri?.toString();
      const webviewUri = this.panel?.webview
        .asWebviewUri(this.context.extensionUri)
        .toString()
        .replace(/^vscode-webview:\/\/[^/]+\//, '/');
      const interactiveContent = this.contentGenerator.generateInteractiveContent(
        snapshot,
        refreshLogoUrl,
        webviewUri
      );
      this.updateWebviewContent(interactiveContent);

      this.logger.info('Refresh completed successfully');
    } catch (error) {
      this.logger.error('Failed to refresh capture', { error });
      this.handleCaptureError(error instanceof Error ? error.message : String(error));
    }
  }

  private handleCaptureError(errorMessage: string): void {
    const errorContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DOM Agent - Error</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    padding: 40px;
                    text-align: center;
                }
                .error-container {
                    max-width: 500px;
                    margin: 0 auto;
                }
                .error-icon { font-size: 48px; margin-bottom: 20px; }
                .error-title { font-size: 24px; margin-bottom: 16px; color: var(--vscode-errorForeground); }
                .error-message { 
                    background: var(--vscode-textBlockQuote-background);
                    padding: 16px;
                    border-radius: 4px;
                    border-left: 4px solid var(--vscode-errorForeground);
                    text-align: left;
                    font-family: monospace;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h2 class="error-title">Capture Failed</h2>
                <div class="error-message">${errorMessage}</div>
            </div>
        </body>
        </html>`;

    this.updateWebviewContent(errorContent);
    void vscode.window.showErrorMessage(`DOM Agent capture failed: ${errorMessage}`);
  }

  public dispose(): void {
    if (this.panel) {
      this.panel.dispose();
      this.panel = undefined;
    }
    this.selectedElement = undefined;
    this.currentSnapshot = undefined;
    this.logger.info('WebviewProvider disposed');
  }

  // Getters for external access
  public get isActive(): boolean {
    return this.panel !== undefined;
  }

  public get currentSelectedElement(): ElementInfo | undefined {
    return this.selectedElement;
  }

  public get snapshot(): DOMSnapshot | undefined {
    return this.currentSnapshot;
  }

  public focus(): void {
    if (this.panel) {
      this.panel.reveal();
    }
  }
}
