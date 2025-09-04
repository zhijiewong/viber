import * as vscode from 'vscode';
import { ElementInfo } from '../types';

export class ClipboardManager {
  public static async copyElementInfo(
    element: ElementInfo,
    format: 'json' | 'css' | 'xpath' = 'json'
  ): Promise<void> {
    let content: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(element, null, 2);
        break;
      case 'css':
        content = element.cssSelector;
        break;
      case 'xpath':
        content = element.xpath;
        break;
      default:
        content = JSON.stringify(element, null, 2);
    }

    await vscode.env.clipboard.writeText(content);
    void vscode.window.showInformationMessage(`Element ${format.toUpperCase()} copied to clipboard`);
  }

  public static async copyCustomData(data: any, label: string = 'Data'): Promise<void> {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    await vscode.env.clipboard.writeText(content);
    void vscode.window.showInformationMessage(`${label} copied to clipboard`);
  }

  public static async copyMultipleSelectors(selectors: {
    css: string;
    xpath: string;
  }): Promise<void> {
    const content = `CSS Selector: ${selectors.css}\nXPath: ${selectors.xpath}`;
    await vscode.env.clipboard.writeText(content);
    void vscode.window.showInformationMessage('Selectors copied to clipboard');
  }

  public static formatElementForClipboard(element: ElementInfo): {
    summary: string;
    detailed: string;
    selectors: string;
  } {
    const summary = `${element.tag}${element.id ? '#' + element.id : ''}${element.classes.length ? '.' + element.classes.join('.') : ''}`;

    const detailed = {
      tag: element.tag,
      id: element.id,
      classes: element.classes,
      text: element.textContent.substring(0, 100) + (element.textContent.length > 100 ? '...' : ''),
      attributes: element.attributes,
      position: element.boundingBox,
    };

    const selectors = {
      css: element.cssSelector,
      xpath: element.xpath,
    };

    return {
      summary,
      detailed: JSON.stringify(detailed, null, 2),
      selectors: JSON.stringify(selectors, null, 2),
    };
  }
}
