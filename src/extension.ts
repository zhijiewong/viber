import * as vscode from 'vscode';
import { WebviewProvider } from './webview/WebviewProvider';
import { openUrlCommand } from './commands/openUrl';
import { detectDevServerCommand } from './commands/detectDevServer';
import { generateCodeCommand } from './commands/generateCode';
import { Logger } from './utils/logger';

let webviewProvider: WebviewProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
  const logger = Logger.getInstance();
  logger.info('🚀 DOM Agent extension is activating...');

  try {
    // Initialize webview provider with error handling
    logger.info('Initializing WebviewProvider...');
    webviewProvider = new WebviewProvider(context);
    logger.info('WebviewProvider initialized successfully');

    // Register commands
    const disposables = [
      vscode.commands.registerCommand('viber.openUrl', async () => {
        try {
          if (!webviewProvider) {
            throw new Error('WebviewProvider not initialized');
          }
          await openUrlCommand(webviewProvider);
        } catch (error) {
          logger.error('Error in openUrl command', error);
          void vscode.window.showErrorMessage('Failed to open URL');
        }
      }),

      vscode.commands.registerCommand('viber.detectDevServer', async () => {
        try {
          if (!webviewProvider) {
            throw new Error('WebviewProvider not initialized');
          }
          await detectDevServerCommand(webviewProvider);
        } catch (error) {
          logger.error('Error in detectDevServer command', error);
          void vscode.window.showErrorMessage('Failed to detect dev server');
        }
      }),

      vscode.commands.registerCommand('viber.generateCode', async () => {
        try {
          if (!webviewProvider) {
            throw new Error('WebviewProvider not initialized');
          }
          await generateCodeCommand(webviewProvider);
        } catch (error) {
          logger.error('Error in generateCode command', error);
          void vscode.window.showErrorMessage('Failed to generate code');
        }
      }),
    ];

    logger.info(`Registered ${disposables.length} commands successfully`);

    // Set up context for conditional commands
    try {
      void vscode.commands.executeCommand('setContext', 'viber.hasSelection', false);
    } catch (error) {
      logger.warn('Failed to set context for hasSelection', error);
    }

    context.subscriptions.push(...disposables);

    logger.info('✅ DOM Agent extension activated successfully');

    // Show success message only if at least one command was registered
    if (disposables.length > 0) {
      void vscode.window.showInformationMessage('🎯 DOM Agent is ready!');
    } else {
      void vscode.window.showWarningMessage('DOM Agent activated but no commands available');
    }
  } catch (error) {
    logger.error('Failed to activate DOM Agent extension', error);
    console.error('❌ DOM Agent extension activation failed:', error);
    void vscode.window.showErrorMessage('Failed to activate DOM Agent extension');

    // Still register a minimal set of subscriptions to prevent extension host issues
    context.subscriptions.push({
      dispose: () => {
        if (webviewProvider) {
          webviewProvider.dispose();
          webviewProvider = undefined;
        }
      },
    });
  }
}

export function deactivate() {
  const logger = Logger.getInstance();
  logger.info('DOM Agent extension is deactivating...');

  if (webviewProvider) {
    webviewProvider.dispose();
    webviewProvider = undefined;
  }
}
