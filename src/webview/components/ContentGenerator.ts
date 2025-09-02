import { DOMSnapshot } from '../../types';
import { DomSerializer } from '../../capture/DomSerializer';
import { WebviewUI } from './WebviewUI';
import { Logger } from '../../utils/logger';

export class ContentGenerator {
    private readonly domSerializer: DomSerializer;
    private readonly logger: Logger;

    constructor(domSerializer: DomSerializer) {
        this.domSerializer = domSerializer;
        this.logger = new Logger();
    }

    public generateLoadingContent(): string {
        return WebviewUI.generateLoadingContent();
    }

    public generateInteractiveContent(snapshot: DOMSnapshot): string {
        this.logger.info('Generating interactive webview content');
        
        try {
            // Sanitize and process HTML
            const sanitizedHtml = this.domSerializer.sanitizeHTML(snapshot.html);
            const interactivityScript = this.domSerializer.injectInteractivityScript();
            
            this.logger.info('Injected interactivity script', { 
                scriptLength: interactivityScript.length 
            });
            
            // Generate the complete interactive content
            return WebviewUI.generateInteractiveContent(
                snapshot,
                sanitizedHtml,
                interactivityScript
            );
            
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
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}