import * as vscode from 'vscode';
import { ElementInfo } from '../types';
import { Logger } from '../utils/logger';

export class WebviewProvider {
    private panel: vscode.WebviewPanel | undefined;
    private readonly context: vscode.ExtensionContext;
    private readonly logger: Logger;
    private selectedElement: ElementInfo | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.logger = new Logger();
    }

    public async captureAndShowWebpage(url: string): Promise<void> {
        this.logger.info('Capturing webpage', { url });
        
        // TODO: Implement Playwright capture
        // For now, create a placeholder panel
        this.createWebviewPanel();
        
        // TODO: Capture DOM with Playwright
        // TODO: Send DOM snapshot to webview
        
        this.logger.info('Webpage capture placeholder implemented');
    }

    public getSelectedElement(): ElementInfo | undefined {
        return this.selectedElement;
    }

    public dispose(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
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