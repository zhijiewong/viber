import * as vscode from 'vscode';
import { WebviewProvider } from './webview/WebviewProvider';
import { openUrlCommand } from './commands/openUrl';
import { detectDevServerCommand } from './commands/detectDevServer';
import { generateCodeCommand } from './commands/generateCode';
import { Logger } from './utils/logger';

let webviewProvider: WebviewProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
    const logger = new Logger();
    logger.info('🚀 DOM Agent extension is activating...');
    console.log('🚀 DOM Agent extension is activating...'); // Also log to console

    try {
        // Initialize webview provider with error handling
        logger.info('Initializing WebviewProvider...');
        webviewProvider = new WebviewProvider(context);
        logger.info('WebviewProvider initialized successfully');

        // Register commands with individual error handling
        const disposables = [];

        try {
            const openUrlDisposable = vscode.commands.registerCommand('dom-agent.openUrl', async () => {
                try {
                    await openUrlCommand(webviewProvider!);
                } catch (error) {
                    logger.error('Error in openUrl command', error);
                    vscode.window.showErrorMessage('Failed to open URL');
                }
            });
            disposables.push(openUrlDisposable);
            logger.info('Registered dom-agent.openUrl command');
        } catch (error) {
            logger.error('Failed to register openUrl command', error);
        }

        try {
            const detectDevServerDisposable = vscode.commands.registerCommand('dom-agent.detectDevServer', async () => {
                try {
                    await detectDevServerCommand(webviewProvider!);
                } catch (error) {
                    logger.error('Error in detectDevServer command', error);
                    vscode.window.showErrorMessage('Failed to detect dev server');
                }
            });
            disposables.push(detectDevServerDisposable);
            logger.info('Registered dom-agent.detectDevServer command');
        } catch (error) {
            logger.error('Failed to register detectDevServer command', error);
        }

        try {
            const generateCodeDisposable = vscode.commands.registerCommand('dom-agent.generateCode', async () => {
                try {
                    await generateCodeCommand(webviewProvider!);
                } catch (error) {
                    logger.error('Error in generateCode command', error);
                    vscode.window.showErrorMessage('Failed to generate code');
                }
            });
            disposables.push(generateCodeDisposable);
            logger.info('Registered dom-agent.generateCode command');
        } catch (error) {
            logger.error('Failed to register generateCode command', error);
        }

        // Set up context for conditional commands
        try {
            vscode.commands.executeCommand('setContext', 'dom-agent.hasSelection', false);
        } catch (error) {
            logger.warn('Failed to set context for hasSelection', error);
        }

        context.subscriptions.push(...disposables);

        logger.info('✅ DOM Agent extension activated successfully');
        console.log('✅ DOM Agent extension activated successfully');

        // Show success message only if at least one command was registered
        if (disposables.length > 0) {
            vscode.window.showInformationMessage('🎯 DOM Agent is ready!');
        } else {
            vscode.window.showWarningMessage('DOM Agent activated but no commands available');
        }

    } catch (error) {
        logger.error('Failed to activate DOM Agent extension', error);
        console.error('❌ DOM Agent extension activation failed:', error);
        vscode.window.showErrorMessage('Failed to activate DOM Agent extension');

        // Still register a minimal set of subscriptions to prevent extension host issues
        context.subscriptions.push({
            dispose: () => {
                if (webviewProvider) {
                    webviewProvider.dispose();
                    webviewProvider = undefined;
                }
            }
        });
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