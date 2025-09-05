import { DOMSnapshot } from '../../types';
import * as Handlebars from 'handlebars';

/**
 * WebviewUI - Generates the webview HTML content for DOM Agent
 * Provides a clean interface for element selection and locator generation
 */

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
                    width: 80px;
                    height: 80px;
                    position: relative;
                    margin-bottom: 20px;
                    animation: logoPulse 2s ease-in-out infinite;
                }

                .loading-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    animation: logoSpin 3s linear infinite;
                }

                .loading-text-logo {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--vscode-progressBar-foreground);
                    animation: logoSpin 3s linear infinite;
                }

                .loading-spinner::after {
                    content: '';
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    right: -5px;
                    bottom: -5px;
                    border: 2px solid transparent;
                    border-top: 2px solid var(--vscode-progressBar-foreground);
                    border-radius: 8px;
                    animation: borderSpin 1.5s ease-in-out infinite;
                    opacity: 0.6;
                }

                @keyframes logoPulse {
                    0%, 100% {
                        opacity: 0.7;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.05);
                    }
                }

                @keyframes logoSpin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes borderSpin {
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
            <div class="loading-spinner">
                {{#if logoUrl}}
                    <img src="{{logoUrl}}" alt="DOM Agent Logo" class="loading-logo" />
                {{else}}
                    <div class="loading-text-logo">🔍 DOM Agent</div>
                {{/if}}
            </div>
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

            {{{webviewScripts}}}
            {{{interactivityScript}}}
        </body>
        </html>`);
  }

  public static generateLoadingContent(
    message: string = 'Capturing webpage...',
    logoUrl?: string
  ): string {
    return this.loadingTemplate({ message, logoUrl });
  }

  public static generateInteractiveContent(
    snapshot: DOMSnapshot,
    sanitizedHtml: string,
    interactivityScript?: string
  ): string {
    // Extract head and body content more safely
    const headMatch = sanitizedHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const bodyMatch = sanitizedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    let headContent = headMatch ? headMatch[1] : '';
    let bodyContent = bodyMatch ? bodyMatch[1] : '';

    // If no body tag found, try to extract content between </head> and end of document
    if (!bodyContent && headMatch) {
      const afterHeadMatch = sanitizedHtml.match(/<\/head>([\s\S]*)$/i);
      if (afterHeadMatch) {
        bodyContent = afterHeadMatch[1];
      }
    }

    // If still no body content, use the whole document but try to exclude head
    if (!bodyContent) {
      if (headMatch) {
        // Remove head content from sanitizedHtml to get body
        const headIndex = sanitizedHtml.indexOf(headMatch[0]);
        const endHeadIndex = headIndex + headMatch[0].length;
        bodyContent = sanitizedHtml.substring(endHeadIndex);
      } else {
        bodyContent = sanitizedHtml;
      }
    }

    // Ensure essential styles are preserved in head content
    if (!headContent.includes('<style') && sanitizedHtml.includes('<style')) {
      // Extract all style tags from sanitized HTML if not in head
      const styleMatches = sanitizedHtml.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? [];
      if (styleMatches.length > 0) {
        headContent = styleMatches.join('\n') + '\n' + headContent;
      }
    }

    // Safely escape the URL
    const safeUrl = snapshot.url
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return this.mainTemplate({
      safeUrl,
      baseStyles: this.generateBaseStyles(),
      headContent,
      bodyContent,
      toolbar: this.generateToolbar(snapshot),
      webviewScripts: this.generateWebviewScripts(),
      interactivityScript: interactivityScript ?? '',
    });
  }

  private static generateBaseStyles(): string {
    return `
            <style>
                /* Reset and base styles */
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

                .dom-agent-toolbar button:hover {
                    background: #e8eaed;
                    border-color: #c4c7c5;
                }

                .dom-agent-toolbar button.active {
                    background: #1a73e8;
                    color: white;
                    border-color: #1a73e8;
                }

                /* Content area */
                .dom-agent-content {
                    position: relative;
                    z-index: 1;
                    margin-top: 56px;
                    min-height: calc(100vh - 56px);
                    background: transparent;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                .dom-agent-content * {
                    max-width: 100% !important;
                }

                .dom-agent-content img {
                    height: auto !important;
                }

                /* Element highlighting styles */
                .dom-agent-highlight {
                    background-color: rgba(26, 115, 232, 0.1) !important;
                    outline: 2px solid #1a73e8 !important;
                    outline-offset: -2px !important;
                    cursor: crosshair !important;
                    position: relative !important;
                    z-index: 999999 !important;
                    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;
                    transition: all 0.1s ease !important;
                }

                .dom-agent-selected {
                    background-color: rgba(234, 67, 53, 0.1) !important;
                    outline: 3px solid #ea4335 !important;
                    outline-offset: -3px !important;
                    position: relative !important;
                    z-index: 999999 !important;
                    box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.2) !important;
                }

                /* Enhanced hover info tooltip */
                .dom-agent-hover-info {
                    position: fixed !important;
                    background: white !important;
                    color: #202124 !important;
                    border: 1px solid #dadce0 !important;
                    border-radius: 8px !important;
                    font-size: 12px !important;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                    z-index: 1000000 !important;
                    pointer-events: none !important;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08) !important;
                    max-width: 400px !important;
                    min-width: 280px !important;
                    line-height: 1.4 !important;
                    backdrop-filter: blur(8px) !important;
                    -webkit-backdrop-filter: blur(8px) !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                }

                /* Copy notification */
                .dom-agent-copied-notification {
                    position: fixed !important;
                    top: 70px !important;
                    right: 20px !important;
                    background: #1e8e3e !important;
                    color: white !important;
                    padding: 10px 16px !important;
                    border-radius: 6px !important;
                    font-size: 13px !important;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                    z-index: 10001 !important;
                    opacity: 0 !important;
                    transition: opacity 0.3s ease !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
                    font-weight: 500 !important;
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
                }
                const vscode = window.vscode;

                function refreshCapture() {
                    vscode.postMessage({ type: 'refresh-capture' });
                }

                // Listen for messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'refresh-capture':
                            break;
                    }
                });

                console.log('DOM Agent WebviewUI scripts loaded successfully');
            </script>
        `;
  }
}
