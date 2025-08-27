import * as vscode from 'vscode';
import { ElementInfo, DOMSnapshot, CaptureOptions } from '../types';
import { Logger } from '../utils/logger';
import { PlaywrightCapture } from '../capture/PlaywrightCapture';
import { DomSerializer } from '../capture/DomSerializer';
import { ElementInspector } from '../inspector/ElementInspector';

export class WebviewProvider {
    private panel: vscode.WebviewPanel | undefined;
    private readonly context: vscode.ExtensionContext;
    private readonly logger: Logger;
    private readonly playwrightCapture: PlaywrightCapture;
    private readonly domSerializer: DomSerializer;
    private readonly elementInspector: ElementInspector;
    private selectedElement: ElementInfo | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.logger = new Logger();
        this.playwrightCapture = new PlaywrightCapture();
        this.domSerializer = new DomSerializer();
        this.elementInspector = new ElementInspector();
    }

    public async captureAndShowWebpage(url: string): Promise<void> {
        this.logger.info('Starting webpage capture', { url });
        
        try {
            // Create webview panel first
            this.createWebviewPanel();
            
            // Show loading state
            this.updateWebviewContent(this.getLoadingContent());
            
            // Get capture options from configuration
            const config = vscode.workspace.getConfiguration('domAgent');
            const captureOptions: CaptureOptions = {
                browser: config.get('defaultBrowser') || 'chromium',
                viewport: { width: 1280, height: 720 },
                timeout: 30000
            };
            
            // Capture the webpage
            this.logger.info('Capturing DOM with Playwright', { options: captureOptions });
            const snapshot = await this.playwrightCapture.captureWebpage(url, captureOptions);
            
            // Process and display the captured content
            this.displayCapturedWebpage(snapshot);
            
            this.logger.info('Webpage capture completed successfully', { 
                url: snapshot.url,
                elements: snapshot.elements.length 
            });
            
        } catch (error) {
            this.logger.error('Failed to capture webpage', error);
            
            if (this.panel) {
                this.updateWebviewContent(this.getErrorContent(error));
            }
            
            vscode.window.showErrorMessage(
                `Failed to capture webpage: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    public getSelectedElement(): ElementInfo | undefined {
        return this.selectedElement;
    }

    public dispose(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        
        // Cleanup Playwright resources
        this.playwrightCapture.cleanup().catch(error => {
            this.logger.error('Error during Playwright cleanup', error);
        });
    }

    private displayCapturedWebpage(snapshot: DOMSnapshot): void {
        if (!this.panel) {
            this.logger.error('Cannot display captured webpage: panel not initialized');
            return;
        }

        this.logger.info('Displaying captured webpage in webview');
        
        // Sanitize and process HTML
        const sanitizedHtml = this.domSerializer.sanitizeHTML(snapshot.html);
        const interactivityScript = this.domSerializer.injectInteractivityScript();
        
        // Create the interactive webview content
        const webviewContent = this.createInteractiveWebviewContent(
            snapshot,
            sanitizedHtml,
            interactivityScript
        );
        
        this.updateWebviewContent(webviewContent);
    }

    private createInteractiveWebviewContent(
        snapshot: DOMSnapshot, 
        sanitizedHtml: string, 
        interactivityScript: string
    ): string {
        // Extract head and body content
        const headMatch = sanitizedHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        const bodyMatch = sanitizedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        
        const headContent = headMatch ? headMatch[1] : '';
        const bodyContent = bodyMatch ? bodyMatch[1] : sanitizedHtml;
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DOM Agent - ${snapshot.url}</title>
            <style>
                /* Base styles */
                * {
                    box-sizing: border-box;
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                /* Toolbar styles */
                .dom-agent-toolbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 40px;
                    background: var(--vscode-editor-background);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    display: flex;
                    align-items: center;
                    padding: 0 12px;
                    z-index: 10001;
                    gap: 12px;
                    font-size: 12px;
                    color: var(--vscode-foreground);
                }
                
                .dom-agent-toolbar .url {
                    font-weight: 500;
                    opacity: 0.8;
                }
                
                .dom-agent-toolbar .info {
                    margin-left: auto;
                    opacity: 0.6;
                }
                
                /* Inspector panel */
                .dom-agent-inspector {
                    position: fixed;
                    top: 40px;
                    right: 0;
                    width: 300px;
                    height: calc(100vh - 40px);
                    background: var(--vscode-sidebar-background);
                    border-left: 1px solid var(--vscode-panel-border);
                    z-index: 10002;
                    overflow-y: auto;
                    padding: 16px;
                    font-size: 12px;
                    color: var(--vscode-foreground);
                    transform: translateX(100%);
                    transition: transform 0.2s ease;
                }
                
                .dom-agent-inspector.active {
                    transform: translateX(0);
                }
                
                .dom-agent-inspector h3 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--vscode-foreground);
                }
                
                .dom-agent-inspector .section {
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                
                .dom-agent-inspector .property {
                    display: flex;
                    margin-bottom: 4px;
                    font-family: var(--vscode-editor-font-family);
                }
                
                .dom-agent-inspector .property-name {
                    min-width: 80px;
                    font-weight: 500;
                    opacity: 0.8;
                }
                
                .dom-agent-inspector .property-value {
                    font-family: var(--vscode-editor-font-family);
                    word-break: break-all;
                }
                
                /* Content area */
                .dom-agent-content {
                    margin-top: 40px;
                    margin-right: 0;
                    transition: margin-right 0.2s ease;
                }
                
                .dom-agent-content.inspector-open {
                    margin-right: 300px;
                }
                
                /* Captured styles */
                ${snapshot.css}
            </style>
            ${headContent}
        </head>
        <body>
            <!-- DOM Agent Toolbar -->
            <div class="dom-agent-toolbar">
                <div class="url">📄 ${snapshot.url}</div>
                <div class="info">${snapshot.elements.length} elements captured • ${new Date(snapshot.timestamp).toLocaleTimeString()}</div>
            </div>
            
            <!-- Inspector Panel -->
            <div class="dom-agent-inspector" id="inspector">
                <div class="section">
                    <h3>🔍 Element Inspector</h3>
                    <div id="inspector-content">
                        <p style="opacity: 0.6; text-align: center; margin: 20px 0;">
                            Click on any element to inspect it
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Captured Content -->
            <div class="dom-agent-content" id="content">
                ${bodyContent}
            </div>
            
            ${interactivityScript}
            
            <script>
                // Handle element selection messages
                window.addEventListener('message', (event) => {
                    if (event.data.type === 'element-selected') {
                        const { element, position } = event.data.payload;
                        showElementInspector(element);
                        
                        // Send to VS Code extension
                        if (window.parent && window.parent !== window) {
                            window.parent.postMessage({
                                type: 'element-selected',
                                payload: { element, position }
                            }, '*');
                        }
                    }
                });
                
                function showElementInspector(element) {
                    const inspector = document.getElementById('inspector');
                    const content = document.getElementById('content');
                    const inspectorContent = document.getElementById('inspector-content');
                    
                    // Show inspector panel
                    inspector.classList.add('active');
                    content.classList.add('inspector-open');
                    
                    // Populate inspector content
                    inspectorContent.innerHTML = \`
                        <div class="section">
                            <h3>Basic Info</h3>
                            <div class="property">
                                <span class="property-name">Tag:</span>
                                <span class="property-value">&lt;\${element.tag}&gt;</span>
                            </div>
                            \${element.id ? \`<div class="property">
                                <span class="property-name">ID:</span>
                                <span class="property-value">#\${element.id}</span>
                            </div>\` : ''}
                            \${element.classes.length ? \`<div class="property">
                                <span class="property-name">Classes:</span>
                                <span class="property-value">.\${element.classes.join('.')}</span>
                            </div>\` : ''}
                        </div>
                        
                        <div class="section">
                            <h3>Selectors</h3>
                            <div class="property">
                                <span class="property-name">CSS:</span>
                                <span class="property-value">\${element.cssSelector}</span>
                            </div>
                            <div class="property">
                                <span class="property-name">XPath:</span>
                                <span class="property-value">\${element.xpath}</span>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h3>Position</h3>
                            <div class="property">
                                <span class="property-name">X:</span>
                                <span class="property-value">\${element.boundingBox.x}px</span>
                            </div>
                            <div class="property">
                                <span class="property-name">Y:</span>
                                <span class="property-value">\${element.boundingBox.y}px</span>
                            </div>
                            <div class="property">
                                <span class="property-name">Width:</span>
                                <span class="property-value">\${element.boundingBox.width}px</span>
                            </div>
                            <div class="property">
                                <span class="property-name">Height:</span>
                                <span class="property-value">\${element.boundingBox.height}px</span>
                            </div>
                        </div>
                        
                        \${element.textContent ? \`<div class="section">
                            <h3>Text Content</h3>
                            <div class="property-value" style="font-style: italic; margin-top: 8px;">
                                "\${element.textContent}"
                            </div>
                        </div>\` : ''}
                        
                        <div class="section">
                            <button onclick="copyToClipboard('\${element.cssSelector}', 'CSS Selector')" 
                                    style="background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 12px; border-radius: 2px; cursor: pointer; margin-right: 8px; font-size: 11px;">
                                Copy CSS
                            </button>
                            <button onclick="copyToClipboard('\${element.xpath}', 'XPath')" 
                                    style="background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; padding: 6px 12px; border-radius: 2px; cursor: pointer; font-size: 11px;">
                                Copy XPath
                            </button>
                        </div>
                    \`;
                }
                
                function copyToClipboard(text, type) {
                    navigator.clipboard.writeText(text).then(() => {
                        // Show temporary feedback
                        const button = event.target;
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                            button.textContent = originalText;
                        }, 1500);
                    });
                }
            </script>
        </body>
        </html>`;
    }

    private updateWebviewContent(content: string): void {
        if (this.panel && this.panel.webview) {
            this.panel.webview.html = content;
        }
    }

    private getLoadingContent(): string {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DOM Agent - Loading</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                }
                .loading {
                    text-align: center;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--vscode-progressBar-background);
                    border-top: 4px solid var(--vscode-progressBar-foreground);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                h2 {
                    margin: 0 0 12px 0;
                    font-size: 18px;
                }
                p {
                    margin: 0;
                    opacity: 0.7;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="loading">
                <div class="spinner"></div>
                <h2>🔍 Capturing DOM</h2>
                <p>Please wait while we capture the webpage...</p>
            </div>
        </body>
        </html>`;
    }

    private getErrorContent(error: any): string {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DOM Agent - Error</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                }
                .error {
                    text-align: center;
                    max-width: 600px;
                }
                .error-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                h2 {
                    color: var(--vscode-errorForeground);
                    margin: 0 0 16px 0;
                }
                .error-message {
                    background: var(--vscode-inputValidation-errorBackground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                    color: var(--vscode-inputValidation-errorForeground);
                    padding: 12px;
                    border-radius: 4px;
                    font-family: var(--vscode-editor-font-family);
                    margin-bottom: 20px;
                }
                .suggestions {
                    text-align: left;
                    margin-top: 20px;
                }
                .suggestions h3 {
                    margin: 0 0 12px 0;
                }
                .suggestions ul {
                    margin: 0;
                    padding-left: 20px;
                }
                .suggestions li {
                    margin-bottom: 8px;
                    opacity: 0.8;
                }
            </style>
        </head>
        <body>
            <div class="error">
                <div class="error-icon">⚠️</div>
                <h2>Capture Failed</h2>
                <div class="error-message">
                    ${errorMessage}
                </div>
                <div class="suggestions">
                    <h3>Troubleshooting Tips:</h3>
                    <ul>
                        <li>Check if the URL is accessible and valid</li>
                        <li>Ensure you have an internet connection</li>
                        <li>Try a different browser engine in settings</li>
                        <li>Some sites may block automated access</li>
                        <li>Check the extension output for more details</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>`;
    }

    private createWebviewPanel(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'domAgent',
            'DOM Agent',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.context.extensionUri]
            }
        );

        this.panel.webview.html = this.getWebviewContent();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        this.panel.webview.onDidReceiveMessage(
            message => this.handleWebviewMessage(message),
            undefined,
            this.context.subscriptions
        );
    }

    private getWebviewContent(): string {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DOM Agent</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 20px;
                }
                .placeholder {
                    text-align: center;
                    margin-top: 50px;
                }
                .logo {
                    font-size: 24px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="placeholder">
                <div class="logo">🔍 DOM Agent</div>
                <p>Ready to capture and inspect web pages!</p>
                <p>Use the commands to get started:</p>
                <ul style="text-align: left; display: inline-block;">
                    <li>Open URL in DOM Agent</li>
                    <li>Detect Local Dev Server</li>
                </ul>
            </div>
        </body>
        </html>`;
    }

    private handleWebviewMessage(message: any): void {
        this.logger.info('Received webview message', message);
        
        switch (message.type) {
            case 'element-selected':
                this.selectedElement = message.payload.element;
                vscode.commands.executeCommand('setContext', 'dom-agent.hasSelection', true);
                break;
        }
    }
}