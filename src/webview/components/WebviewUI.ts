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
            <meta http-equiv="Content-Security-Policy" content="default-src 'self' vscode-resource: vscode-webview: https: data:; script-src 'self' 'unsafe-inline' vscode-resource: vscode-webview:; style-src 'self' 'unsafe-inline' vscode-resource: vscode-webview: https: data:; img-src 'self' data: https: vscode-resource: vscode-webview:; font-src 'self' https: data: vscode-resource:; connect-src 'self' https: vscode-resource: vscode-webview:;">
            <title>DOM Agent - DevTools Style</title>
            {{{baseStyles}}}
            {{{headContent}}}
        </head>
        <body>
            {{{toolbar}}}

            <div id="content" class="dom-agent-content">
                {{{bodyContent}}}
            </div>

            {{{inspectorUI}}}

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
        _interactivityScript?: string
    ): string {
        // Extract head and body content more safely
        const headMatch = sanitizedHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        const bodyMatch = sanitizedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

        let headContent = headMatch ? headMatch[1] : '';
        let bodyContent = bodyMatch ? bodyMatch[1] : sanitizedHtml;

        // Ensure essential styles are preserved in head content
        if (headContent && !headContent.includes('<style') && sanitizedHtml.includes('<style')) {
            // Extract all style tags from sanitized HTML if not in head
            const styleMatches = sanitizedHtml.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
            headContent = styleMatches.join('\n') + '\n' + headContent;
        }

        // Safely escape the URL
        const safeUrl = snapshot.url
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        // Generate scripts
        const simpleSelector = ElementSelector.generateScript();

        return this.mainTemplate({
            safeUrl,
            baseStyles: this.generateBaseStyles(),
            headContent,
            bodyContent,
            toolbar: this.generateToolbar(snapshot),
            inspectorUI: this.generateInspectorUI(),
            webviewScripts: this.generateWebviewScripts(),
            interactivityScript: simpleSelector
        });
    }

    private static generateBaseStyles(): string {
        return `
            <style>
                /* Chrome DevTools Style - Base Styles */
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    background: #f8f9fa;
                    color: #202124;
                    line-height: 1.5;
                    overflow-x: hidden;
                }

                /* Reset styles for captured content */
                .dom-agent-content * {
                    max-width: 100% !important;
                }

                .dom-agent-content img {
                    height: auto !important;
                }

                /* Preserve original styles but prevent breaking layout */
                .dom-agent-content {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                /* Toolbar - DevTools Style */
                .dom-agent-toolbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 56px;
                    background: #ffffff;
                    color: #202124;
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                    z-index: 10001;
                    border-bottom: 1px solid #e8eaed;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    font-size: 14px;
                    font-weight: 500;
                    gap: 16px;
                }

                .dom-agent-toolbar.dark {
                    background: #1a1a1a;
                    color: #e8eaed;
                    border-bottom-color: #3c4043;
                }

                .dom-agent-toolbar .logo {
                    font-weight: 600;
                    font-size: 18px;
                    color: #1a73e8;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .dom-agent-toolbar .url {
                    color: #5f6368;
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                    font-size: 13px;
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    background: #f1f3f4;
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: 1px solid #dadce0;
                }

                .dom-agent-toolbar.dark .url {
                    background: #3c4043;
                    color: #9aa0a6;
                    border-color: #5f6368;
                }

                .dom-agent-toolbar .controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .dom-agent-toolbar button {
                    background: #f1f3f4;
                    border: 1px solid #dadce0;
                    color: #3c4043;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 500;
                }

                .dom-agent-toolbar.dark button {
                    background: #3c4043;
                    border-color: #5f6368;
                    color: #e8eaed;
                }

                .dom-agent-toolbar button:hover {
                    background: #e8eaed;
                    border-color: #c4c7c5;
                }

                .dom-agent-toolbar.dark button:hover {
                    background: #5f6368;
                    border-color: #9aa0a6;
                }

                .dom-agent-toolbar button.active {
                    background: #1a73e8;
                    color: white;
                    border-color: #1a73e8;
                }

                /* Inspector Panel - DevTools Style */
                .dom-agent-inspector {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: #ffffff;
                    border-top: 2px solid #1a73e8;
                    height: 300px;
                    display: flex;
                    flex-direction: column;
                    z-index: 10000;
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                    pointer-events: auto;
                    box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }

                .dom-agent-inspector.dark {
                    background: #1a1a1a;
                    color: #e8eaed;
                    border-top-color: #8ab4f8;
                }

                .dom-agent-inspector.collapsed {
                    height: 40px;
                }

                .dom-agent-inspector.hidden {
                    display: none;
                }

                .dom-agent-inspector-header {
                    padding: 8px 16px;
                    background: #f8f9fa;
                    color: #202124;
                    font-weight: 600;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #e8eaed;
                    min-height: 40px;
                }

                .dom-agent-inspector.dark .dom-agent-inspector-header {
                    background: #2d2e30;
                    color: #e8eaed;
                    border-bottom-color: #5f6368;
                }

                .dom-agent-inspector-header .title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                }

                .dom-agent-inspector-header .controls {
                    display: flex;
                    gap: 4px;
                }

                .dom-agent-inspector-close {
                    background: none;
                    border: none;
                    color: #5f6368;
                    cursor: pointer;
                    font-size: 18px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }

                .dom-agent-inspector.dark .dom-agent-inspector-close {
                    color: #9aa0a6;
                }

                .dom-agent-inspector-close:hover {
                    background: #e8eaed;
                }

                .dom-agent-inspector.dark .dom-agent-inspector-close:hover {
                    background: #5f6368;
                }

                .dom-agent-inspector-content {
                    padding: 16px;
                    overflow-y: auto;
                    flex: 1;
                    font-size: 12px;
                    line-height: 1.5;
                    color: #202124;
                }

                .dom-agent-inspector.dark .dom-agent-inspector-content {
                    color: #e8eaed;
                }

                .dom-agent-inspector-content::-webkit-scrollbar {
                    width: 8px;
                }

                .dom-agent-inspector-content::-webkit-scrollbar-track {
                    background: #f1f3f4;
                }

                .dom-agent-inspector.dark .dom-agent-inspector-content::-webkit-scrollbar-track {
                    background: #3c4043;
                }

                .dom-agent-inspector-content::-webkit-scrollbar-thumb {
                    background: #dadce0;
                    border-radius: 4px;
                }

                .dom-agent-inspector.dark .dom-agent-inspector-content::-webkit-scrollbar-thumb {
                    background: #5f6368;
                }

                /* Element Information Display */
                .element-info {
                    background: #f8f9fa;
                    border: 1px solid #e8eaed;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                }

                .dom-agent-inspector.dark .element-info {
                    background: #2d2e30;
                    border-color: #5f6368;
                }

                .element-tag {
                    font-weight: 700;
                    color: #1a73e8;
                    font-size: 14px;
                    margin-bottom: 12px;
                }

                .dom-agent-inspector.dark .element-tag {
                    color: #8ab4f8;
                }

                .element-property {
                    margin-bottom: 8px;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                }

                .property-label {
                    font-weight: 600;
                    color: #5f6368;
                    min-width: 80px;
                    flex-shrink: 0;
                }

                .dom-agent-inspector.dark .property-label {
                    color: #9aa0a6;
                }

                .property-value {
                    color: #202124;
                    word-break: break-all;
                }

                .dom-agent-inspector.dark .property-value {
                    color: #e8eaed;
                }

                .property-value.code {
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                    background: #ffffff;
                    border: 1px solid #dadce0;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                }

                .dom-agent-inspector.dark .property-value.code {
                    background: #3c4043;
                    border-color: #5f6368;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                    flex-wrap: wrap;
                }

                .action-button {
                    background: #1a73e8;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                }

                .action-button:hover {
                    background: #1557b0;
                }

                .action-button.secondary {
                    background: #f1f3f4;
                    color: #3c4043;
                }

                .dom-agent-inspector.dark .action-button.secondary {
                    background: #5f6368;
                    color: #e8eaed;
                }

                .action-button.secondary:hover {
                    background: #e8eaed;
                }

                .dom-agent-inspector.dark .action-button.secondary:hover {
                    background: #9aa0a6;
                }

                /* Playwright Locator Styles */
                .playwright-section {
                    background: #e8f0fe;
                    border: 1px solid #dadce0;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                }

                .dom-agent-inspector.dark .playwright-section {
                    background: #1e3a5f;
                    border-color: #5f6368;
                }

                .playwright-title {
                    color: #1a73e8;
                    font-size: 14px;
                    font-weight: 700;
                    margin: 0 0 12px 0;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .dom-agent-inspector.dark .playwright-title {
                    color: #8ab4f8;
                }

                .playwright-primary {
                    background: #1a73e8 !important;
                    color: white !important;
                    font-weight: 600 !important;
                }

                .dom-agent-inspector.dark .playwright-primary {
                    background: #8ab4f8 !important;
                    color: #1a1a1a !important;
                }

                .alternatives-section {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #dadce0;
                }

                .dom-agent-inspector.dark .alternatives-section {
                    border-top-color: #5f6368;
                }

                .alternatives-title {
                    color: #5f6368;
                    font-size: 12px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                }

                .dom-agent-inspector.dark .alternatives-title {
                    color: #9aa0a6;
                }

                .alternative-locator {
                    margin-bottom: 8px;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 4px;
                    border: 1px solid #e8eaed;
                }

                .dom-agent-inspector.dark .alternative-locator {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: #5f6368;
                }

                .locator-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                }

                .locator-type {
                    background: #f1f3f4;
                    color: #3c4043;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .dom-agent-inspector.dark .locator-type {
                    background: #5f6368;
                    color: #e8eaed;
                }

                .locator-description {
                    font-size: 11px;
                    color: #5f6368;
                    font-style: italic;
                }

                .dom-agent-inspector.dark .locator-description {
                    color: #9aa0a6;
                }

                .locator-value {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .copy-btn {
                    background: #f1f3f4;
                    border: 1px solid #dadce0;
                    color: #5f6368;
                    padding: 4px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .dom-agent-inspector.dark .copy-btn {
                    background: #5f6368;
                    border-color: #9aa0a6;
                    color: #e8eaed;
                }

                .copy-btn:hover {
                    background: #1a73e8;
                    color: white;
                    border-color: #1a73e8;
                }

                .section-title {
                    color: #5f6368;
                    font-size: 12px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .dom-agent-inspector.dark .section-title {
                    color: #9aa0a6;
                }

                .basic-info-section {
                    padding-top: 8px;
                }

                .action-button.primary {
                    background: #1a73e8;
                    color: white;
                    border-color: #1a73e8;
                    font-weight: 600;
                }

                .action-button.primary:hover {
                    background: #1557b0;
                    border-color: #1557b0;
                }

                /* Element highlighting styles */
                .dom-agent-highlight {
                    background-color: rgba(26, 115, 232, 0.1) !important;
                    outline: 2px solid #1a73e8 !important;
                    outline-offset: -2px !important;
                    cursor: pointer !important;
                    position: relative !important;
                    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;
                    transition: all 0.1s ease !important;
                }

                .dom-agent-selected {
                    background-color: rgba(234, 67, 53, 0.1) !important;
                    outline: 3px solid #ea4335 !important;
                    outline-offset: -3px !important;
                    position: relative !important;
                    box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.2) !important;
                }

                /* Ensure DOM content stays interactive */
                .dom-agent-content {
                    position: relative;
                    z-index: 1;
                    margin-top: 56px;
                    min-height: calc(100vh - 56px);
                    background: transparent;
                }

                /* Theme toggle */
                .theme-toggle {
                    background: none;
                    border: none;
                    color: #5f6368;
                    cursor: pointer;
                    font-size: 16px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                }

                .dom-agent-inspector.dark .theme-toggle {
                    color: #9aa0a6;
                }

                .theme-toggle:hover {
                    background: #e8eaed;
                }

                .dom-agent-inspector.dark .theme-toggle:hover {
                    background: #5f6368;
                }
            </style>
        `;
    }

    private static generateToolbar(snapshot: DOMSnapshot): string {
        const safeUrl = snapshot.url
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        return `
            <div class="dom-agent-toolbar">
                <div class="logo">
                    🔍 <span>DOM Agent</span>
                </div>
                <div class="url" title="${safeUrl}">${safeUrl}</div>
                <div class="controls">
                    <button onclick="refreshCapture()" title="Refresh capture">🔄</button>
                    <button onclick="toggleInspector()" title="Toggle inspector" id="inspector-toggle">🔧</button>
                    <button onclick="toggleTheme()" title="Toggle theme" class="theme-toggle">🌙</button>
                </div>
            </div>
        `;
    }

    private static generateInspectorUI(): string {
        return `
            <div id="inspector" class="dom-agent-inspector collapsed">
                <div class="dom-agent-inspector-header">
                    <div class="title">
                        <span>📋</span>
                        <span>Element Inspector</span>
                    </div>
                    <div class="controls">
                        <button onclick="toggleInspector()" title="Minimize" class="dom-agent-inspector-close">−</button>
                        <button onclick="hideInspector()" title="Close" class="dom-agent-inspector-close">×</button>
                    </div>
                </div>
                <div id="inspector-content" class="dom-agent-inspector-content">
                    <div style="text-align: center; color: #5f6368; padding: 20px;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
                        <div style="font-weight: 500;">Ready to inspect</div>
                        <div style="font-size: 13px; margin-top: 4px;">Click on any element to inspect it</div>
                    </div>
                </div>
            </div>
        `;
    }

    private static generateWebviewScripts(): string {
        return `
            <script data-dom-agent="true">
                // Basic webview functionality
                if (!window.vscode) {
                    window.vscode = acquireVsCodeApi();
                    console.log('VS Code API acquired in WebviewUI');
                } else {
                    console.log('VS Code API already available');
                }
                const vscode = window.vscode;

                // Theme management
                let isDarkTheme = false;

                function toggleTheme() {
                    isDarkTheme = !isDarkTheme;
                    document.body.classList.toggle('dark-theme', isDarkTheme);
                    document.querySelector('.dom-agent-toolbar').classList.toggle('dark', isDarkTheme);
                    document.querySelector('.dom-agent-inspector').classList.toggle('dark', isDarkTheme);
                    const themeBtn = document.querySelector('.theme-toggle');
                    themeBtn.textContent = isDarkTheme ? '☀️' : '🌙';
                    themeBtn.title = isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme';
                }

                function refreshCapture() {
                    vscode.postMessage({ type: 'refresh-capture' });
                }

                function toggleInspector() {
                    const inspector = document.getElementById('inspector');
                    const toggleBtn = document.getElementById('inspector-toggle');
                    if (inspector) {
                        const isCollapsed = inspector.classList.contains('collapsed');
                        if (isCollapsed) {
                            inspector.classList.remove('collapsed');
                            toggleBtn.classList.add('active');
                        } else {
                            inspector.classList.add('collapsed');
                            toggleBtn.classList.remove('active');
                        }
                    }
                }

                function hideInspector() {
                    const inspector = document.getElementById('inspector');
                    const toggleBtn = document.getElementById('inspector-toggle');
                    if (inspector) {
                        inspector.classList.add('hidden');
                        toggleBtn.classList.remove('active');
                    }
                }

                function showInspector() {
                    const inspector = document.getElementById('inspector');
                    const toggleBtn = document.getElementById('inspector-toggle');
                    if (inspector) {
                        inspector.classList.remove('hidden');
                        inspector.classList.remove('collapsed');
                        toggleBtn.classList.add('active');
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

                    const tag = elementInfo.tagName || elementInfo.tag || 'unknown';
                    const id = elementInfo.id || 'none';

                    let classes = 'none';
                    if (elementInfo.className && elementInfo.className.trim()) {
                        classes = elementInfo.className.trim();
                    } else if (elementInfo.classes && Array.isArray(elementInfo.classes) && elementInfo.classes.length > 0) {
                        classes = elementInfo.classes.join(', ');
                    }

                    const text = elementInfo.textContent ? elementInfo.textContent.substring(0, 100) : 'none';
                    const bbox = elementInfo.boundingBox;
                    const dimensions = bbox ? \`\${Math.round(bbox.width)}px × \${Math.round(bbox.height)}px\` : 'unknown';

                    // Playwright locators section
                    let playwrightSection = '';
                    if (elementInfo.playwrightLocators) {
                        const locators = elementInfo.playwrightLocators;
                        
                        playwrightSection = \`
                            <div class="playwright-section">
                                <h4 class="playwright-title">🎭 Playwright Locators</h4>
                                
                                <div class="element-property">
                                    <span class="property-label">Primary:</span>
                                    <span class="property-value code playwright-primary">\${locators.primary}</span>
                                    <button class="copy-btn" onclick="copyToClipboard('\${locators.primary}', 'Primary Locator')" title="Copy primary locator">📋</button>
                                </div>
                        \`;

                        // Add alternative locators
                        if (locators.alternatives && locators.alternatives.length > 1) {
                            playwrightSection += '<div class="alternatives-section"><h5 class="alternatives-title">Alternative Locators:</h5>';
                            
                            locators.alternatives.forEach((alt, index) => {
                                if (alt.locator !== locators.primary) {
                                    playwrightSection += \`
                                        <div class="alternative-locator">
                                            <div class="locator-header">
                                                <span class="locator-type">\${alt.type}</span>
                                                <span class="locator-description">\${alt.description}</span>
                                            </div>
                                            <div class="locator-value">
                                                <span class="property-value code">\${alt.locator}</span>
                                                <button class="copy-btn" onclick="copyToClipboard('\${alt.locator}', '\${alt.type} locator')" title="Copy \${alt.type} locator">📋</button>
                                            </div>
                                        </div>
                                    \`;
                                }
                            });
                            
                            playwrightSection += '</div>';
                        }
                        
                        playwrightSection += '</div>';
                    }

                    return \`
                        <div class="element-info">
                            <div class="element-tag">&lt;\${tag}&gt;</div>

                            \${playwrightSection}

                            <div class="basic-info-section">
                                <h4 class="section-title">🏷️ Basic Information</h4>
                                
                                <div class="element-property">
                                    <span class="property-label">ID:</span>
                                    <span class="property-value">\${id}</span>
                                </div>

                                <div class="element-property">
                                    <span class="property-label">Classes:</span>
                                    <span class="property-value">\${classes}</span>
                                </div>

                                <div class="element-property">
                                    <span class="property-label">Dimensions:</span>
                                    <span class="property-value">\${dimensions}</span>
                                </div>

                                <div class="element-property">
                                    <span class="property-label">Text:</span>
                                    <span class="property-value">\${text}</span>
                                </div>
                            </div>

                            <div class="action-buttons">
                                <button class="action-button primary" onclick="copyToClipboard('\${elementInfo.playwrightLocators ? elementInfo.playwrightLocators.primary : 'N/A'}', 'Primary Playwright Locator')">
                                    🎭 Copy Primary
                                </button>
                                <button class="action-button secondary" onclick="hideInspector()">
                                    ✕ Close
                                </button>
                            </div>
                        </div>
                    \`;
                }

                function copyToClipboard(text, type) {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).then(() => {
                            console.log(\`\${type} copied to clipboard: \${text}\`);
                            showNotification(\`\${type} copied!\`, 'success');
                        }).catch(err => {
                            console.error('Failed to copy to clipboard:', err);
                            fallbackCopy(text, type);
                        });
                    } else {
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
                        showNotification(\`\${type} copied!\`, 'success');
                    }
                }

                function showNotification(message, type = 'info') {
                    // Simple notification system
                    const notification = document.createElement('div');
                    notification.style.cssText = \`
                        position: fixed;
                        top: 70px;
                        right: 20px;
                        background: \${type === 'success' ? '#1e8e3e' : '#1a73e8'};
                        color: white;
                        padding: 8px 16px;
                        border-radius: 4px;
                        font-size: 12px;
                        z-index: 10001;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    \`;
                    notification.textContent = message;
                    document.body.appendChild(notification);

                    setTimeout(() => notification.style.opacity = '1', 10);
                    setTimeout(() => {
                        notification.style.opacity = '0';
                        setTimeout(() => notification.remove(), 300);
                    }, 2000);
                }

                // Listen for messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'element-selected':
                            if (message.payload && message.payload.element) {
                                window.showElementInspector(message.payload.element);
                            }
                            break;
                        case 'refresh-capture':
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

                console.log('DOM Agent WebviewUI scripts loaded successfully');
            </script>
        `;
    }
}