import { DOMSnapshot } from '../../types';
import { HTMLProcessor } from '../../utils/HTMLProcessor';
import { WebviewUI } from './WebviewUI';
import { ElementSelector } from './ElementSelector';
import { Logger } from '../../utils/logger';

export class ContentGenerator {
  private readonly htmlProcessor: HTMLProcessor;
  private readonly logger: Logger;

  constructor() {
    this.htmlProcessor = new HTMLProcessor();
    this.logger = Logger.getInstance();
  }

  public generateLoadingContent(logoUrl?: string): string {
    return WebviewUI.generateLoadingContent('Capturing webpage...', logoUrl);
  }

  public generateInteractiveContent(
    snapshot: DOMSnapshot,
    logoUrl?: string,
    webviewUri?: string
  ): string {
    this.logger.info('Generating interactive webview content');

    try {
      // 🎯 Use HTML processor with web-friendly mode for better display
      const sanitizedHtml = this.htmlProcessor.sanitize(snapshot.html, false); // false = not ultra-safe, preserve more content

      this.logger.info('🎯 HTML processing completed', {
        originalLength: snapshot.html.length,
        sanitizedLength: sanitizedHtml.length,
      });

      // 🎯 Use new simplified selector architecture with selector script
      const selectorScript = ElementSelector.generateScript(logoUrl, webviewUri);
      const finalContent = WebviewUI.generateInteractiveContent(
        snapshot,
        sanitizedHtml,
        selectorScript
      );

      // Log the first few characters to check for issues
      this.logger.info('Generated content preview:', {
        preview: finalContent.substring(0, 200),
        length: finalContent.length,
      });

      return finalContent;
    } catch (error) {
      this.logger.error('Failed to generate interactive content', { error });
      return this.generateErrorContent(error instanceof Error ? error.message : String(error));
    }
  }

  private generateErrorContent(errorMessage: string): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DOM Agent - Error</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family);
                }
                .error-container {
                    max-width: 600px;
                    margin: 0 auto;
                    text-align: center;
                }
                .error-icon {
                    font-size: 48px;
                    color: var(--vscode-errorForeground);
                    margin-bottom: 20px;
                }
                .error-title {
                    font-size: 24px;
                    margin-bottom: 16px;
                    color: var(--vscode-errorForeground);
                }
                .error-message {
                    font-size: 14px;
                    line-height: 1.6;
                    color: var(--vscode-descriptionForeground);
                    background: var(--vscode-textBlockQuote-background);
                    padding: 16px;
                    border-radius: 4px;
                    border-left: 4px solid var(--vscode-errorForeground);
                    text-align: left;
                    font-family: 'Consolas', 'Courier New', monospace;
                }
                .retry-button {
                    margin-top: 20px;
                    padding: 8px 16px;
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .retry-button:hover {
                    background: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <div class="error-title">Content Generation Failed</div>
                <div class="error-message">${this.escapeHtml(errorMessage)}</div>
                <button class="retry-button" onclick="window.location.reload()">
                    Retry
                </button>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                // Send error to extension
                vscode.postMessage({
                    type: 'content-generation-error',
                    payload: { error: '${this.escapeHtml(errorMessage)}' }
                });
            </script>
        </body>
        </html>
        `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
