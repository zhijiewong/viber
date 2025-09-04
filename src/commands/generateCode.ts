import * as vscode from 'vscode';
import { WebviewProvider } from '../webview/WebviewProvider';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

export async function generateCodeCommand(webviewProvider: WebviewProvider): Promise<void> {
  try {
    const selectedElement = webviewProvider.currentSelectedElement;

    if (!selectedElement) {
      void vscode.window.showWarningMessage(
        'No element selected. Please select an element first. Use the webview to capture a webpage and click on elements to select them.'
      );
      return;
    }

    logger.info('Opening Cursor Chat with element context', {
      tag: selectedElement.tag,
      selector: selectedElement.cssSelector,
    });

    // Show info about Cursor Chat integration
    const action = await vscode.window.showInformationMessage(
      'Cursor Chat Integration is available! Use the Element Inspector panel to open Cursor Chat with element context.',
      'Open WebView',
      'Continue Here'
    );

    if (action === 'Open WebView') {
      // Focus on the webview panel
      webviewProvider.focus();
      return;
    }

    // Legacy command palette interface - directly copy element info and open Cursor Chat
    const elementContext = `
Element Information:
- Tag: <${selectedElement.tag}>
- ID: ${selectedElement.id ?? 'none'}
- Classes: ${selectedElement.classes.length > 0 ? selectedElement.classes.join(', ') : 'none'}
- CSS Selector: ${selectedElement.cssSelector}
- XPath: ${selectedElement.xpath}
- Size: ${selectedElement.boundingBox.width}px × ${selectedElement.boundingBox.height}px
- Text Content: ${selectedElement.textContent ? `"${selectedElement.textContent.substring(0, 100)}${selectedElement.textContent.length > 100 ? '...' : ''}"` : 'none'}

Request: Generate code based on this element.
        `;

    // Copy to clipboard
    await vscode.env.clipboard.writeText(elementContext);

    // Try to open Cursor Chat
    try {
      await vscode.commands.executeCommand('cursor.chat.open');
      void vscode.window.showInformationMessage(
        'Cursor Chat opened! Element context has been copied to clipboard - paste it in the chat.',
        'Got it'
      );
    } catch (error) {
      void vscode.window.showInformationMessage(
        'Element context copied to clipboard. Open Cursor Chat manually and paste the context.',
        'OK'
      );
    }
  } catch (error) {
    logger.error('Error in generateCode command', error);
    void vscode.window.showErrorMessage(
      `Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Note: Code generation logic has been moved to the AI provider system
// This command now delegates to the webview's interactive AI generation interface
