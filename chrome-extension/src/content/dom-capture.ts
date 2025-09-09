import { Logger } from '../utils/logger';
import { DOMSnapshot, ElementMetadata } from '../types';

export interface DOMCaptureOptions {
  fullPage?: boolean;
  includeStyles?: boolean;
  includeScripts?: boolean;
  maxDepth?: number;
}

export class DOMCapture {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  public async captureDOM(options: DOMCaptureOptions = {}): Promise<DOMSnapshot> {
    this.logger.info('Starting DOM capture', { options });

    try {
      const html = this.captureHTML();
      const css = options.includeStyles !== false ? this.captureCSS() : '';
      const elements = this.captureElements(options.maxDepth);
      const viewport = this.getViewportSize();

      const snapshot: DOMSnapshot = {
        html,
        css,
        url: window.location.href,
        timestamp: new Date(),
        viewport,
        elements
      };

      this.logger.info('DOM capture completed', {
        elementsCount: elements.length,
        htmlSize: html.length
      });

      return snapshot;
    } catch (error) {
      this.logger.error('DOM capture failed', error);
      throw error;
    }
  }

  private captureHTML(): string {
    // Clone the document to avoid modifying the original
    const clonedDoc = document.documentElement.cloneNode(true) as HTMLElement;

    // Remove script tags if not needed
    const scripts = clonedDoc.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Remove DOM Agent injected elements
    const injectedElements = clonedDoc.querySelectorAll('[id^="dom-agent-"]');
    injectedElements.forEach(element => element.remove());

    return clonedDoc.outerHTML;
  }

  private captureCSS(): string {
    const styles: string[] = [];

    // Get all external stylesheets
    const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
    linkElements.forEach(link => {
      if (link instanceof HTMLLinkElement && link.href) {
        styles.push(`/* External CSS: ${link.href} */`);
      }
    });

    // Get all inline styles
    const styleElements = document.querySelectorAll('style');
    styleElements.forEach(style => {
      if (style.textContent) {
        styles.push(style.textContent);
      }
    });

    // Get computed styles for key elements
    const keyElements = document.querySelectorAll('body, main, header, footer, section, article');
    keyElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const importantStyles = this.extractImportantStyles(computedStyle);
      if (importantStyles) {
        styles.push(`/* Computed styles for ${element.tagName.toLowerCase()} */\n${importantStyles}`);
      }
    });

    return styles.join('\n\n');
  }

  private captureElements(maxDepth: number = 10): ElementMetadata[] {
    const elements: ElementMetadata[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (!(node instanceof Element)) return NodeFilter.FILTER_REJECT;

          const element = node as Element;

          // Skip certain elements
          if (['SCRIPT', 'STYLE', 'META', 'LINK', 'NOSCRIPT'].includes(element.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip hidden elements
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node: Node | null;
    let depth = 0;

    while ((node = walker.nextNode()) && depth < maxDepth) {
      if (!(node instanceof Element)) continue;

      const element = node as Element;
      const metadata = this.createElementMetadata(element);

      if (metadata) {
        elements.push(metadata);
      }

      // Track depth
      if (element.children.length === 0) {
        depth++;
      }
    }

    return elements;
  }

  private createElementMetadata(element: Element): ElementMetadata | null {
    try {
      const rect = element.getBoundingClientRect();

      // Skip elements that are not visible
      if (rect.width <= 0 || rect.height <= 0) {
        return null;
      }

      const selector = this.generateCSSSelector(element);

      return {
        selector,
        boundingBox: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        tag: element.tagName.toLowerCase(),
        id: element.id || undefined,
        classes: Array.from(element.classList)
      };
    } catch (error) {
      this.logger.warn('Failed to create element metadata', error);
      return null;
    }
  }

  private generateCSSSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }

    const parts: string[] = [];
    let current: Element | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
      let selector = current.tagName.toLowerCase();

      if (current.classList.length > 0) {
        selector += '.' + Array.from(current.classList).join('.');
      } else if (current.parentElement) {
        // Add nth-child if no classes
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current as Element);
        if (siblings.length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
      }

      parts.unshift(selector);
      current = current.parentElement;
    }

    return parts.join(' > ');
  }

  private extractImportantStyles(computedStyle: CSSStyleDeclaration): string | null {
    const importantProperties = [
      'display',
      'position',
      'width',
      'height',
      'margin',
      'padding',
      'background',
      'color',
      'font-size',
      'font-family',
      'border',
      'flex',
      'grid'
    ];

    const styles: string[] = [];

    importantProperties.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
        styles.push(`  ${prop}: ${value};`);
      }
    });

    return styles.length > 0 ? `{${styles.join('\n')}\n}` : null;
  }

  private getViewportSize(): { width: number; height: number } {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    };
  }
}
