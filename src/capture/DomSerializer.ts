import { ElementInfo, BoundingBox } from '../types';
import { Logger } from '../utils/logger';

export class DomSerializer {
    private readonly logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    public serializeElement(element: HTMLElement): ElementInfo {
        this.logger.debug('Serializing element', { tag: element.tagName });

        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);

        return {
            tag: element.tagName.toLowerCase(),
            id: element.id || undefined,
            classes: Array.from(element.classList),
            textContent: this.extractTextContent(element),
            attributes: this.extractAttributes(element),
            cssSelector: this.generateCSSSelector(element),
            xpath: this.generateXPath(element),
            boundingBox: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            },
            computedStyles: this.extractComputedStyles(computedStyle)
        };
    }

    public sanitizeHTML(html: string): string {
        // Remove script tags and other potentially harmful content
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<link[^>]*rel=["']?stylesheet["']?[^>]*>/gi, '') // We'll handle CSS separately
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
            .replace(/javascript:/gi, '') // Remove javascript: urls
            .replace(/vbscript:/gi, ''); // Remove vbscript: urls
    }

    public injectInteractivityScript(): string {
        return `
            <script>
                (function() {
                    let selectedElement = null;
                    let highlightedElement = null;
                    let overlayDiv = null;

                    // Create highlight overlay
                    function createOverlay() {
                        if (overlayDiv) return;
                        
                        overlayDiv = document.createElement('div');
                        overlayDiv.style.cssText = \`
                            position: absolute;
                            pointer-events: none;
                            border: 2px solid #007ACC;
                            background: rgba(0, 122, 204, 0.1);
                            z-index: 10000;
                            transition: all 0.1s ease;
                            box-sizing: border-box;
                        \`;
                        document.body.appendChild(overlayDiv);
                    }

                    // Update overlay position
                    function updateOverlay(element) {
                        if (!overlayDiv || !element) return;
                        
                        const rect = element.getBoundingClientRect();
                        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
                        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                        
                        overlayDiv.style.left = (rect.left + scrollX) + 'px';
                        overlayDiv.style.top = (rect.top + scrollY) + 'px';
                        overlayDiv.style.width = rect.width + 'px';
                        overlayDiv.style.height = rect.height + 'px';
                        overlayDiv.style.display = 'block';
                    }

                    // Hide overlay
                    function hideOverlay() {
                        if (overlayDiv) {
                            overlayDiv.style.display = 'none';
                        }
                    }

                    // Element hover handler
                    function handleMouseOver(event) {
                        const element = event.target;
                        if (element === overlayDiv) return;
                        
                        highlightedElement = element;
                        updateOverlay(element);
                    }

                    // Element click handler
                    function handleClick(event) {
                        event.preventDefault();
                        event.stopPropagation();
                        
                        const element = event.target;
                        if (element === overlayDiv) return;
                        
                        selectedElement = element;
                        
                        // Change overlay style for selection
                        if (overlayDiv) {
                            overlayDiv.style.border = '2px solid #FF6B35';
                            overlayDiv.style.background = 'rgba(255, 107, 53, 0.1)';
                        }

                        // Extract element information
                        const elementInfo = extractElementInfo(element);
                        
                        // Send to parent (VS Code webview)
                        if (window.parent && window.parent.postMessage) {
                            window.parent.postMessage({
                                type: 'element-selected',
                                payload: {
                                    element: elementInfo,
                                    position: {
                                        x: event.clientX,
                                        y: event.clientY
                                    }
                                }
                            }, '*');
                        }
                    }

                    // Extract element information
                    function extractElementInfo(element) {
                        const rect = element.getBoundingClientRect();
                        const computedStyle = window.getComputedStyle(element);
                        
                        return {
                            tag: element.tagName.toLowerCase(),
                            id: element.id || undefined,
                            classes: Array.from(element.classList),
                            textContent: element.textContent ? element.textContent.trim().substring(0, 200) : '',
                            attributes: extractAttributes(element),
                            cssSelector: generateCSSSelector(element),
                            xpath: generateXPath(element),
                            boundingBox: {
                                x: Math.round(rect.x),
                                y: Math.round(rect.y),
                                width: Math.round(rect.width),
                                height: Math.round(rect.height)
                            },
                            computedStyles: extractComputedStyles(computedStyle)
                        };
                    }

                    // Extract attributes
                    function extractAttributes(element) {
                        const attributes = {};
                        for (let i = 0; i < element.attributes.length; i++) {
                            const attr = element.attributes[i];
                            attributes[attr.name] = attr.value;
                        }
                        return attributes;
                    }

                    // Generate CSS selector
                    function generateCSSSelector(element) {
                        if (element.id) {
                            return '#' + element.id;
                        }

                        const path = [];
                        let current = element;

                        while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
                            let selector = current.tagName.toLowerCase();
                            
                            if (current.classList.length > 0) {
                                selector += '.' + Array.from(current.classList).join('.');
                            }
                            
                            const parent = current.parentElement;
                            if (parent) {
                                const siblings = Array.from(parent.children).filter(
                                    child => child.tagName === current.tagName
                                );
                                if (siblings.length > 1) {
                                    const index = siblings.indexOf(current) + 1;
                                    selector += ':nth-child(' + index + ')';
                                }
                            }
                            
                            path.unshift(selector);
                            current = current.parentElement;
                        }

                        return path.join(' > ');
                    }

                    // Generate XPath
                    function generateXPath(element) {
                        const path = [];
                        let current = element;

                        while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
                            let index = 1;
                            let sibling = current.previousElementSibling;
                            
                            while (sibling) {
                                if (sibling.tagName === current.tagName) {
                                    index++;
                                }
                                sibling = sibling.previousElementSibling;
                            }
                            
                            const tagName = current.tagName.toLowerCase();
                            path.unshift(tagName + '[' + index + ']');
                            current = current.parentElement;
                        }

                        return '//' + path.join('/');
                    }

                    // Extract computed styles
                    function extractComputedStyles(computedStyle) {
                        const importantStyles = [
                            'display', 'position', 'width', 'height', 'margin', 'padding',
                            'border', 'background', 'color', 'font-size', 'font-family',
                            'text-align', 'vertical-align', 'line-height', 'z-index'
                        ];
                        
                        const styles = {};
                        importantStyles.forEach(prop => {
                            styles[prop] = computedStyle.getPropertyValue(prop);
                        });
                        
                        return styles;
                    }

                    // Initialize interactivity
                    createOverlay();
                    document.addEventListener('mouseover', handleMouseOver);
                    document.addEventListener('click', handleClick);
                    
                    // Cleanup on page unload
                    window.addEventListener('beforeunload', () => {
                        document.removeEventListener('mouseover', handleMouseOver);
                        document.removeEventListener('click', handleClick);
                    });
                })();
            </script>
        `;
    }

    private extractTextContent(element: HTMLElement): string {
        // Get only direct text content, not from children
        const textNodes = Array.from(element.childNodes).filter(
            node => node.nodeType === Node.TEXT_NODE
        );
        
        const text = textNodes.map(node => node.textContent || '').join(' ').trim();
        return text.length > 200 ? text.substring(0, 200) + '...' : text;
    }

    private extractAttributes(element: HTMLElement): Record<string, string> {
        const attributes: Record<string, string> = {};
        
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            // Skip event handlers and potentially sensitive attributes
            if (!attr.name.startsWith('on') && !attr.name.startsWith('data-v-')) {
                attributes[attr.name] = attr.value;
            }
        }
        
        return attributes;
    }

    private generateCSSSelector(element: HTMLElement): string {
        if (element.id) {
            return `#${element.id}`;
        }

        const path: string[] = [];
        let current: Element | null = element;

        while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            
            if (current.classList.length > 0) {
                selector += '.' + Array.from(current.classList).join('.');
            }
            
            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(
                    child => child.tagName === current!.tagName
                );
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    selector += `:nth-child(${index})`;
                }
            }
            
            path.unshift(selector);
            current = current.parentElement;
        }

        return path.join(' > ');
    }

    private generateXPath(element: HTMLElement): string {
        const path: string[] = [];
        let current: Element | null = element;

        while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
            let index = 1;
            let sibling = current.previousElementSibling;
            
            while (sibling) {
                if (sibling.tagName === current.tagName) {
                    index++;
                }
                sibling = sibling.previousElementSibling;
            }
            
            const tagName = current.tagName.toLowerCase();
            path.unshift(`${tagName}[${index}]`);
            current = current.parentElement;
        }

        return `//${path.join('/')}`;
    }

    private extractComputedStyles(computedStyle: CSSStyleDeclaration): Record<string, string> {
        const importantStyles = [
            'display', 'position', 'width', 'height', 'margin', 'padding',
            'border', 'background', 'color', 'font-size', 'font-family',
            'text-align', 'vertical-align', 'line-height', 'z-index',
            'opacity', 'visibility', 'overflow', 'float', 'clear'
        ];
        
        const styles: Record<string, string> = {};
        importantStyles.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value) {
                styles[prop] = value;
            }
        });
        
        return styles;
    }
}