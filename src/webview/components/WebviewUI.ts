import { DOMSnapshot } from '../../types';

export class WebviewUI {
    
    public static generateLoadingContent(): string {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DOM Agent - Loading...</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    flex-direction: column;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--vscode-progressBar-background);
                    border-top: 4px solid var(--vscode-progressBar-foreground);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loading-text {
                    font-size: 16px;
                    color: var(--vscode-descriptionForeground);
                }
            </style>
        </head>
        <body>
            <div class="loading-spinner"></div>
            <div class="loading-text">Capturing webpage...</div>
        </body>
        </html>
        `;
    }

    public static generateInteractiveContent(
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
            ${this.generateBaseStyles()}
            ${headContent}
        </head>
        <body>
            ${this.generateToolbar(snapshot)}
            
            <!-- Main content wrapper -->
            <div id="content" class="dom-agent-content" style="margin-top: 60px;">
                ${bodyContent}
            </div>
            
            ${this.generateInspectorUI()}
            ${this.generateWebviewScripts()}
            ${interactivityScript}
        </body>
        </html>`;
    }

    private static generateBaseStyles(): string {
        return `
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
                    height: 50px;
                    background: var(--vscode-titleBar-activeBackground, #007acc);
                    color: var(--vscode-titleBar-activeForeground, white);
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                    z-index: 10001;
                    border-bottom: 1px solid var(--vscode-titleBar-border, rgba(255,255,255,0.1));
                    font-size: 14px;
                    font-weight: 500;
                    gap: 16px;
                }
                
                .dom-agent-toolbar .logo {
                    font-weight: 600;
                    font-size: 16px;
                }
                
                .dom-agent-toolbar .url {
                    color: var(--vscode-titleBar-inactiveForeground, rgba(255,255,255,0.8));
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 12px;
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .dom-agent-toolbar .controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .dom-agent-toolbar button {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 3px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .dom-agent-toolbar button:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.3);
                }
                
                /* Inspector styles */
                .dom-agent-inspector {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: var(--vscode-panel-background, #1e1e1e);
                    border-top: 1px solid var(--vscode-panel-border, #2d2d30);
                    max-height: 40vh;
                    display: none;
                    flex-direction: column;
                    z-index: 10000;
                    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
                }
                
                .dom-agent-inspector.active {
                    display: flex;
                }
                
                .dom-agent-inspector-header {
                    padding: 8px 16px;
                    background: var(--vscode-titleBar-activeBackground, #007acc);
                    color: var(--vscode-titleBar-activeForeground, white);
                    font-weight: 500;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .dom-agent-inspector-close {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    font-size: 16px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 3px;
                }
                
                .dom-agent-inspector-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .dom-agent-inspector-content {
                    padding: 16px;
                    overflow-y: auto;
                    max-height: calc(40vh - 40px);
                    font-size: 12px;
                    line-height: 1.4;
                    color: var(--vscode-editor-foreground, #cccccc);
                }

                /* Hide scrollbars but keep functionality */
                .dom-agent-inspector-content::-webkit-scrollbar {
                    width: 8px;
                }
                
                .dom-agent-inspector-content::-webkit-scrollbar-track {
                    background: var(--vscode-scrollbarSlider-background, rgba(255, 255, 255, 0.1));
                }
                
                .dom-agent-inspector-content::-webkit-scrollbar-thumb {
                    background: var(--vscode-scrollbarSlider-activeBackground, rgba(255, 255, 255, 0.3));
                    border-radius: 4px;
                }
            </style>
        `;
    }

    private static generateToolbar(snapshot: DOMSnapshot): string {
        return `
            <div class="dom-agent-toolbar">
                <div class="logo">🔍 DOM Agent</div>
                <div class="url">${snapshot.url}</div>
                <div class="controls">
                    <button onclick="refreshCapture()" title="Refresh capture">🔄</button>
                    <button onclick="toggleInspector()" title="Toggle inspector">🔧</button>
                </div>
            </div>
        `;
    }

    private static generateInspectorUI(): string {
        return `
            <!-- Inspector Panel -->
            <div id="inspector" class="dom-agent-inspector">
                <div class="dom-agent-inspector-header">
                    <span>Element Inspector</span>
                    <button class="dom-agent-inspector-close" onclick="hideInspector()" title="Close Inspector">×</button>
                </div>
                <div id="inspector-content" class="dom-agent-inspector-content">
                    <p>Click on any element to inspect it</p>
                </div>
            </div>
        `;
    }

    private static generateWebviewScripts(): string {
        return `
            <script>
                // Basic webview functionality
                const vscode = acquireVsCodeApi();
                
                function refreshCapture() {
                    vscode.postMessage({ type: 'refresh-capture' });
                }
                
                function toggleInspector() {
                    const inspector = document.getElementById('inspector');
                    if (inspector) {
                        inspector.classList.toggle('active');
                    }
                }
                
                function hideInspector() {
                    const inspector = document.getElementById('inspector');
                    if (inspector) {
                        inspector.classList.remove('active');
                    }
                }
                
                function showInspector() {
                    const inspector = document.getElementById('inspector');
                    if (inspector) {
                        inspector.classList.add('active');
                    }
                }
                
                // Element selection functionality
                function showElementInspector(elementInfo, context = {}) {
                    showInspector();
                    const content = document.getElementById('inspector-content');
                    if (content) {
                        content.innerHTML = generateElementInfoHTML(elementInfo);
                    }
                }
                
                function generateElementInfoHTML(elementInfo) {
                    return \`
                        <div style="font-family: 'Consolas', 'Courier New', monospace;">
                            <h3 style="margin: 0 0 12px 0; color: var(--vscode-textLink-foreground, #4fc3f7);">
                                &lt;\${elementInfo.tag}&gt;
                            </h3>
                            
                            \${elementInfo.id ? \`<p><strong>ID:</strong> \${elementInfo.id}</p>\` : ''}
                            \${elementInfo.classes.length > 0 ? \`<p><strong>Classes:</strong> \${elementInfo.classes.join(', ')}</p>\` : ''}
                            \${elementInfo.textContent ? \`<p><strong>Text:</strong> \${elementInfo.textContent}</p>\` : ''}
                            
                            <div style="margin-top: 16px;">
                                <button onclick="copyToClipboard('\${elementInfo.cssSelector || ''}', 'CSS Selector')" 
                                        style="margin-right: 8px; padding: 4px 8px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 3px; cursor: pointer;">
                                    Copy CSS Selector
                                </button>
                                <button onclick="copyToClipboard('\${elementInfo.xpath || ''}', 'XPath')" 
                                        style="padding: 4px 8px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 3px; cursor: pointer;">
                                    Copy XPath
                                </button>
                            </div>
                        </div>
                    \`;
                }
                
                function copyToClipboard(text, type) {
                    navigator.clipboard.writeText(text).then(() => {
                        console.log(\`\${type} copied to clipboard: \${text}\`);
                    }).catch(err => {
                        console.error('Failed to copy to clipboard:', err);
                    });
                }
                
                // Listen for messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'element-selected':
                            if (message.payload && message.payload.element) {
                                showElementInspector(message.payload.element);
                            }
                            break;
                        case 'refresh-capture':
                            // Handle refresh if needed
                            break;
                    }
                });
            </script>
        `;
    }
}