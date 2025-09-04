import * as vscode from 'vscode';
import { WebviewProvider } from '../webview/WebviewProvider';
import { isValidUrl, normalizeUrl } from '../utils/validation';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

export async function openUrlCommand(webviewProvider: WebviewProvider): Promise<void> {
    try {
        // Show input box for URL
        const url = await vscode.window.showInputBox({
            prompt: 'Enter the URL to inspect',
            placeHolder: 'https://example.com or localhost:3000',
            validateInput: (value) => {
                if (!value) {
                    return 'URL is required';
                }
                
                const normalizedUrl = normalizeUrl(value);
                if (!isValidUrl(normalizedUrl)) {
                    return 'Please enter a valid URL';
                }
                
                return null;
            }
        });

        if (!url) {
            logger.info('User cancelled URL input');
            return;
        }

        const normalizedUrl = normalizeUrl(url);
        logger.info('Opening URL in DOM Agent', { url: normalizedUrl });

        // Show loading message
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'DOM Agent',
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Capturing DOM snapshot...' });
            
            try {
                await webviewProvider.captureAndShowWebpage(normalizedUrl);
                progress.report({ message: 'DOM snapshot ready!' });
            } catch (error) {
                logger.error('Failed to capture webpage', error);
                throw error;
            }
        });

    } catch (error) {
        logger.error('Error in openUrl command', error);
        vscode.window.showErrorMessage(`Failed to open URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}