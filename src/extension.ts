import * as vscode from 'vscode';
import { WebviewProvider } from './webview/WebviewProvider';
import { openUrlCommand } from './commands/openUrl';
import { detectDevServerCommand } from './commands/detectDevServer';
import { generateCodeCommand } from './commands/generateCode';
import { Logger } from './utils/logger';

let webviewProvider: WebviewProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
    const logger = new Logger();
    logger.info('DOM Agent extension is activating...');

    try {
        // Initialize webview provider
        webviewProvider = new WebviewProvider(context);

        // Register commands
        const disposables = [
            vscode.commands.registerCommand('dom-agent.openUrl', () => 
                openUrlCommand(webviewProvider!)
            ),
            vscode.commands.registerCommand('dom-agent.detectDevServer', () =>
                detectDevServerCommand(webviewProvider!)
            ),
            vscode.commands.registerCommand('dom-agent.generateCode', () =>
                generateCodeCommand(webviewProvider!)
            )
        ];

        // Set up context for conditional commands
        vscode.commands.executeCommand('setContext', 'dom-agent.hasSelection', false);

        context.subscriptions.push(...disposables);
        
        logger.info('DOM Agent extension activated successfully');
    } catch (error) {
        logger.error('Failed to activate DOM Agent extension', error);
        vscode.window.showErrorMessage('Failed to activate DOM Agent extension');
    }
}

export function deactivate() {
    const logger = new Logger();
    logger.info('DOM Agent extension is deactivating...');
    
    if (webviewProvider) {
        webviewProvider.dispose();
        webviewProvider = undefined;
    }
}