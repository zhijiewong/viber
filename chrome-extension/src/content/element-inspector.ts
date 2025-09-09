import { Logger } from '../utils/logger';
import { ElementInfo } from '../types';

export class ElementInspector {
  private logger: Logger;
  private isActive: boolean = false;
  private selectedElement: ElementInfo | null = null;
  private overlayElement: HTMLElement | null = null;
  private onElementSelectedCallback?: (element: ElementInfo) => void;

  constructor() {
    this.logger = Logger.getInstance();
  }

  public initialize(): void {
    this.createOverlay();
    this.logger.info('Element inspector initialized');
  }

  public startInspection(): void {
    console.log('🚀 DOM Agent: startInspection called');
    if (this.isActive) {
      console.log('⚠️ DOM Agent: Element inspector already active');
      this.logger.warn('Element inspector already active');
      return;
    }

    console.log('✅ DOM Agent: Setting isActive to true');
    this.isActive = true;
    this.showOverlay();
    this.attachEventListeners();

    console.log('🎯 DOM Agent: Element inspection STARTED - mouse hover should now work');
    console.log('📋 DOM Agent: Event listeners attached, overlay created');
    this.logger.info('Element inspection started');
  }

  public stopInspection(): void {
    if (!this.isActive) {
      this.logger.warn('Element inspector not active');
      return;
    }

    this.isActive = false;
    this.hideOverlay();
    this.detachEventListeners();

    this.logger.info('Element inspection stopped');
  }

  public highlightElement(selector: string): void {
    try {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        this.highlightElementWithOverlay(element);
      }
    } catch (error) {
      this.logger.error('Failed to highlight element', error);
    }
  }

  public getSelectedElement(): ElementInfo | null {
    return this.selectedElement;
  }

  public onElementSelected(callback: (element: ElementInfo) => void): void {
    this.onElementSelectedCallback = callback;
  }

  public updateElementPositions(): void {
    if (this.selectedElement && this.overlayElement) {
      this.updateOverlayPosition();
    }
  }

  private createOverlay(): void {
    if (this.overlayElement) return;

    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'dom-agent-element-overlay';
    this.overlayElement.style.cssText = `
      position: fixed;
      pointer-events: none;
      background: rgba(255, 0, 255, 0.3);
      border: 2px solid #ff00ff;
      border-radius: 2px;
      z-index: 999998;
      transition: all 0.1s ease;
      box-sizing: border-box;
    `;

    // Create info tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'dom-agent-element-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      white-space: nowrap;
      z-index: 999999;
      pointer-events: none;
    `;
    this.overlayElement.appendChild(tooltip);

    document.body.appendChild(this.overlayElement);
  }

  private showOverlay(): void {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'block';
    }
  }

  private hideOverlay(): void {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'none';
    }
    this.selectedElement = null;
  }

  private attachEventListeners(): void {
    console.log('🔗 DOM Agent: Attaching event listeners');
    console.log('📄 DOM Agent: Document:', document);
    console.log('🖱️ DOM Agent: Attaching mouseover listener');

    document.addEventListener('mouseover', this.handleMouseOver.bind(this), true);
    document.addEventListener('mouseout', this.handleMouseOut.bind(this), true);
    document.addEventListener('click', this.handleClick.bind(this), true);
    document.addEventListener('keydown', this.handleKeyDown.bind(this), true);

    console.log('✅ DOM Agent: All event listeners attached');
  }

  private detachEventListeners(): void {
    document.removeEventListener('mouseover', this.handleMouseOver.bind(this), true);
    document.removeEventListener('mouseout', this.handleMouseOut.bind(this), true);
    document.removeEventListener('click', this.handleClick.bind(this), true);
    document.removeEventListener('keydown', this.handleKeyDown.bind(this), true);
  }

  private handleMouseOver(event: MouseEvent): void {
    console.log('🔍 DOM Agent: handleMouseOver called, isActive:', this.isActive);

    if (!this.isActive) {
      console.debug('DOM Agent: ElementInspector not active, ignoring mouseover');
      return;
    }

    const target = event.target as HTMLElement;
    console.log('🎯 DOM Agent: Mouse over element:', target.tagName, target.id || target.className);

    if (this.shouldInspectElement(target)) {
      console.log('✅ DOM Agent: Element should be inspected, calling highlightHoveredElement');
      event.preventDefault();
      event.stopPropagation();
      this.highlightHoveredElement(target);
    } else {
      console.log('🚫 DOM Agent: Skipping element:', target.tagName);
    }
  }

  private handleMouseOut(event: MouseEvent): void {
    if (!this.isActive) return;

    const relatedTarget = event.relatedTarget as HTMLElement;

    if (!relatedTarget || !this.overlayElement?.contains(relatedTarget)) {
      this.clearInspection();
    }
  }

  private handleClick(event: MouseEvent): void {
    if (!this.isActive) return;

    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    if (this.selectedElement) {
      this.finalizeSelection();
    } else {
      this.inspectElement(target);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isActive) return;

    if (event.key === 'Escape') {
      this.stopInspection();
    }
  }

  private shouldInspectElement(element: HTMLElement): boolean {
    // Skip certain elements
    if (['SCRIPT', 'STYLE', 'META', 'LINK', 'NOSCRIPT'].includes(element.tagName)) {
      return false;
    }

    // Skip our own overlay elements
    if (element.id?.startsWith('dom-agent-')) {
      return false;
    }

    // Skip elements with no size
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  private inspectElement(element: HTMLElement): void {
    const elementInfo = this.createElementInfo(element);
    this.selectedElement = elementInfo;
    this.showOverlay();
    this.updateOverlayPosition();

    // Update tooltip
    this.updateTooltip(elementInfo);
  }

  private highlightHoveredElement(element: HTMLElement): void {
    if (!this.overlayElement) {
      console.warn('DOM Agent: No overlay element available');
      return;
    }

    const rect = element.getBoundingClientRect();
    console.debug('DOM Agent: Highlighting element:', element.tagName, rect);

    // Position the overlay (using fixed positioning, so no scroll offset needed)
    this.overlayElement.style.left = `${rect.x}px`;
    this.overlayElement.style.top = `${rect.y}px`;
    this.overlayElement.style.width = `${rect.width}px`;
    this.overlayElement.style.height = `${rect.height}px`;
    this.overlayElement.style.display = 'block';

    // Create temporary element info for tooltip
    const elementInfo = {
      tag: element.tagName.toLowerCase(),
      id: element.id || undefined,
      classes: Array.from(element.classList),
      textContent: '',
      attributes: {},
      cssSelector: '',
      xpath: '',
      boundingBox: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      computedStyles: {}
    };

    // Update tooltip
    this.updateTooltip(elementInfo);
    console.debug('DOM Agent: Overlay positioned and tooltip updated');
  }

  private clearInspection(): void {
    this.selectedElement = null;
    if (this.overlayElement) {
      this.overlayElement.style.display = 'none';
    }
  }

  private finalizeSelection(): void {
    if (this.selectedElement && this.onElementSelectedCallback) {
      this.onElementSelectedCallback(this.selectedElement);
    }
    this.stopInspection();
  }

  private createElementInfo(element: HTMLElement): ElementInfo {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    return {
      tag: element.tagName.toLowerCase(),
      id: element.id || undefined,
      classes: Array.from(element.classList),
      textContent: element.textContent?.trim() || '',
      attributes: this.getElementAttributes(element),
      cssSelector: this.generateCSSSelector(element),
      xpath: this.generateXPath(element),
      boundingBox: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      computedStyles: this.getImportantComputedStyles(computedStyle)
    };
  }

  private getElementAttributes(element: HTMLElement): Record<string, string> {
    const attributes: Record<string, string> = {};
    Array.from(element.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    return attributes;
  }

  private generateCSSSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }

    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
      let selector = current.tagName.toLowerCase();

      if (current.classList.length > 0) {
        selector += '.' + Array.from(current.classList).join('.');
      } else if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current);
        if (siblings.length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
      }

      parts.unshift(selector);
      current = current.parentElement;
    }

    return parts.join(' > ');
  }

  private generateXPath(element: HTMLElement): string {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = current.previousSibling;

      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE &&
            (sibling as HTMLElement).tagName === current.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }

      const tagName = current.tagName.toLowerCase();
      const pathSegment = `${tagName}[${index}]`;
      parts.unshift(pathSegment);

      current = current.parentElement;
    }

    return '/' + parts.join('/');
  }

  private getImportantComputedStyles(computedStyle: CSSStyleDeclaration): Record<string, string> {
    const importantProps = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'background', 'color', 'font-size', 'font-family', 'border',
      'flex', 'grid', 'align-items', 'justify-content'
    ];

    const styles: Record<string, string> = {};
    importantProps.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
        styles[prop] = value;
      }
    });

    return styles;
  }

  private updateOverlayPosition(): void {
    if (!this.selectedElement || !this.overlayElement) return;

    const { boundingBox } = this.selectedElement;
    // For fixed positioning, use viewport coordinates directly
    this.overlayElement.style.left = `${boundingBox.x}px`;
    this.overlayElement.style.top = `${boundingBox.y}px`;
    this.overlayElement.style.width = `${boundingBox.width}px`;
    this.overlayElement.style.height = `${boundingBox.height}px`;
  }

  private updateTooltip(elementInfo: ElementInfo): void {
    const tooltip = this.overlayElement?.querySelector('#dom-agent-element-tooltip') as HTMLElement;
    if (!tooltip) return;

    tooltip.textContent = `${elementInfo.tag}${elementInfo.id ? `#${elementInfo.id}` : ''}${elementInfo.classes.length ? '.' + elementInfo.classes.join('.') : ''}`;

    // Position tooltip
    tooltip.style.left = '0px';
    tooltip.style.top = '-30px';
  }

  private highlightElementWithOverlay(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();

    if (!this.overlayElement) return;

    // For fixed positioning, use viewport coordinates directly
    this.overlayElement.style.left = `${rect.x}px`;
    this.overlayElement.style.top = `${rect.y}px`;
    this.overlayElement.style.width = `${rect.width}px`;
    this.overlayElement.style.height = `${rect.height}px`;
    this.overlayElement.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (this.overlayElement) {
        this.overlayElement.style.display = 'none';
      }
    }, 3000);
  }
}
