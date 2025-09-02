import { DOMSnapshot } from '../../types';
import * as Handlebars from 'handlebars';
import { ElementSelector } from './ElementSelector';

export class WebviewUI {
    private static loadingTemplate: HandlebarsTemplateDelegate;
    private static mainTemplate: HandlebarsTemplateDelegate;
    
    static {
        // Initialize templates
        this.loadingTemplate = Handlebars.compile(`
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
            <div class="loading-text">{{message}}</div>
        </body>
        </html>
        `);
        
        this.mainTemplate = Handlebars.compile(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'self' vscode-resource: vscode-webview: https:; script-src 'self' 'unsafe-inline' vscode-resource:; style-src 'self' 'unsafe-inline' vscode-resource: https:; img-src 'self' data: https: vscode-resource:; font-src 'self' https: data:;">
            <title>DOM Agent</title>
            <!-- URL: {{safeUrl}} -->
            {{{baseStyles}}}
            {{{headContent}}}
        </head>
        <body>
            {{{toolbar}}}
            
            <!-- Main content wrapper -->
            <div id="content" class="dom-agent-content" style="margin-top: 60px;">
                {{{bodyContent}}}
            </div>
            
            {{{inspectorUI}}}
            
            <!-- DOM Agent Scripts - Keep at end to avoid conflicts -->
            {{{webviewScripts}}}
            {{{interactivityScript}}}
        </body>
        </html>`);
    }
    
    public static generateLoadingContent(message: string = 'Capturing webpage...'): string {
        return this.loadingTemplate({ message });
    }

    public static generateInteractiveContent(
        snapshot: DOMSnapshot, 
        sanitizedHtml: string, 
        _interactivityScript?: string // 标记为可选并使用下划线前缀表示未使用
    ): string {
        // Extract head and body content
        const headMatch = sanitizedHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        const bodyMatch = sanitizedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        
        let headContent = headMatch ? headMatch[1] : '';
        let bodyContent = bodyMatch ? bodyMatch[1] : sanitizedHtml;
        
        // Note: Skip additional cleanup as HTMLProcessor has already sanitized the content
        // and we don't want to remove our DOM Agent interactivity scripts
        
        // Safely escape the URL
        const safeUrl = snapshot.url
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        // 🎯 使用新的简单选择器替代复杂的交互脚本
        const simpleSelector = ElementSelector.generateScript();

        return this.mainTemplate({
            safeUrl,
            baseStyles: this.generateBaseStyles(),
            headContent,
            bodyContent,
            toolbar: this.generateToolbar(snapshot),
            inspectorUI: this.generateInspectorUI(),
            webviewScripts: this.generateWebviewScripts(),
            interactivityScript: simpleSelector // 使用新的简单选择器
        });
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
                    border-top: 3px solid var(--vscode-panel-border, #007acc);
                    max-height: 40vh;
                    display: none;
                    flex-direction: column;
                    z-index: 10000;
                    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
                    pointer-events: auto;
                    box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2);
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
                
                /* Element highlighting styles */
                .dom-agent-highlight {
                    background-color: rgba(0, 123, 255, 0.2) !important;
                    outline: 2px solid #007acc !important;
                    outline-offset: -2px !important;
                    cursor: pointer !important;
                    position: relative !important;
                    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.4) !important;
                    transition: all 0.1s ease !important;
                }
                
                .dom-agent-selected {
                    background-color: rgba(255, 0, 0, 0.2) !important;
                    outline: 3px solid #ff0000 !important;
                    outline-offset: -3px !important;
                    position: relative !important;
                    box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.3) !important;
                }
                
                /* Ensure DOM content stays interactive */
                .dom-agent-content {
                    position: relative;
                    z-index: 1;
                }
                
                /* Ensure Inspector doesn't block DOM interactions */
                .dom-agent-inspector {
                    z-index: 10000 !important;
                }
                
                .dom-agent-toolbar {
                    z-index: 10001 !important;
                }
            </style>
        `;
    }

    private static generateToolbar(snapshot: DOMSnapshot): string {
        // Safely escape the URL to prevent HTML injection
        const safeUrl = snapshot.url
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
            
        return `
            <div class="dom-agent-toolbar">
                <div class="logo">🔍 DOM Agent</div>
                <div class="url">${safeUrl}</div>
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
                // Basic webview functionality - only acquire if not already available
                if (!window.vscode) {
                    window.vscode = acquireVsCodeApi();
                    console.log('VS Code API acquired in WebviewUI');
                } else {
                    console.log('VS Code API already available');
                }
                const vscode = window.vscode;
                
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
                window.showElementInspector = function(elementInfo, context = {}) {
                    console.log('showElementInspector called with:', elementInfo);
                    showInspector();
                    const content = document.getElementById('inspector-content');
                    if (content) {
                        content.innerHTML = generateElementInfoHTML(elementInfo);
                        console.log('Inspector content updated');
                    } else {
                        console.warn('Inspector content element not found');
                    }
                }
                
                function generateElementInfoHTML(elementInfo) {
                    console.log('Generating HTML for element:', elementInfo);
                    
                    // Safely extract properties with fallbacks
                    const tag = elementInfo.tag || 'unknown';
                    const id = elementInfo.id || 'none';
                    const classes = elementInfo.classes && Array.isArray(elementInfo.classes) && elementInfo.classes.length > 0 
                        ? elementInfo.classes.join(', ') : 'none';
                    const text = elementInfo.textContent ? elementInfo.textContent.substring(0, 100) : 'none';
                    const selector = elementInfo.cssSelector || 'none';
                    const xpath = elementInfo.xpath || 'none';
                    
                    // Extract bounding box info if available
                    const bbox = elementInfo.boundingBox;
                    const dimensions = bbox ? \`\${Math.round(bbox.width)}px x \${Math.round(bbox.height)}px\` : 'unknown';
                    
                    return \`
                        <div style="font-family: 'Consolas', 'Courier New', monospace; color: var(--vscode-editor-foreground);">
                            <h3 style="margin: 0 0 12px 0; color: var(--vscode-textLink-foreground, #4fc3f7);">
                                &lt;\${tag}&gt;
                            </h3>
                            
                            <p><strong>ID:</strong> \${id}</p>
                            <p><strong>Classes:</strong> \${classes}</p>
                            <p><strong>Dimensions:</strong> \${dimensions}</p>
                            <p><strong>Text:</strong> \${text}</p>
                            <p><strong>CSS Selector:</strong> <code>\${selector}</code></p>
                            <p><strong>XPath:</strong> <code>\${xpath}</code></p>
                            
                            <div style="margin-top: 16px;">
                                <button onclick="copyToClipboard('\${selector}', 'CSS Selector')" 
                                        style="margin-right: 8px; padding: 6px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 3px; cursor: pointer;">
                                    Copy CSS Selector
                                </button>
                                <button onclick="copyToClipboard('\${xpath}', 'XPath')" 
                                        style="margin-right: 8px; padding: 6px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 3px; cursor: pointer;">
                                    Copy XPath
                                </button>
                                <button onclick="hideInspector()" 
                                        style="padding: 6px 12px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 3px; cursor: pointer;">
                                    Close
                                </button>
                            </div>
                        </div>
                    \`;
                    console.log('Generated inspector HTML for element:', tag);
                }
                
                function copyToClipboard(text, type) {
                    // Try navigator.clipboard first
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).then(() => {
                            console.log(\`\${type} copied to clipboard: \${text}\`);
                        }).catch(err => {
                            console.error('Failed to copy to clipboard:', err);
                            // Fallback to VS Code API
                            fallbackCopy(text, type);
                        });
                    } else {
                        // Use VS Code API
                        fallbackCopy(text, type);
                    }
                }
                
                function fallbackCopy(text, type) {
                    if (window.vscode) {
                        vscode.postMessage({
                            type: 'copy-to-clipboard',
                            payload: { text: text, type: type }
                        });
                        console.log(\`Sent copy request to VS Code: \${type}\`);
                    }
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
                
                // Listen for custom DOM events from the injected script
                document.addEventListener('dom-agent-element-selected', function(event) {
                    console.log('Custom event received:', event.detail);
                    if (event.detail && event.detail.element) {
                        window.showElementInspector(event.detail.element);
                    }
                });
                
                console.log('Event listeners set up successfully');
            </script>
        `;
    }
}