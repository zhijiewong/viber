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
                console.log('=== [DOM Agent New Script] Starting simple DOM Agent selection script ===');
                console.log('[DOM Agent New Script] Script is executing now!');
                
                // Prevent multiple initializations
                if (window.domAgentInitialized) {
                    console.log('[DOM Agent New Script] Already initialized, skipping...');
                    return;
                }
                window.domAgentInitialized = true;
                console.log('[DOM Agent New Script] Set domAgentInitialized = true');
                
                // Wait for DOM to be ready
                function initDOMAgent() {
                    console.log('[DOM Agent New Script] Initializing DOM Agent...');
                    console.log('[DOM Agent New Script] Document ready state:', document.readyState);
                    
                    let currentHighlight = null;
                    
                    // Simple click handler
                    document.addEventListener('click', function(e) {
                        console.log('[DOM Agent New Script] CLICK DETECTED on:', e.target.tagName, e.target.className || 'no-class');
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Simple visual feedback
                        const target = e.target;
                        if (target && target.style) {
                            const originalBorder = target.style.border;
                            target.style.border = '3px solid red';
                            console.log('[DOM Agent New Script] Applied red border to element');
                            
                            setTimeout(() => {
                                target.style.border = originalBorder;
                                console.log('[DOM Agent New Script] Restored original border');
                            }, 2000);
                        }
                        
                        // Extract element info
                        const elementInfo = {
                            tag: target.tagName.toLowerCase(),
                            id: target.id || undefined,
                            classes: Array.from(target.classList || []),
                            textContent: target.textContent ? target.textContent.trim().substring(0, 100) : '',
                            attributes: {}
                        };
                        
                        // Get attributes
                        for (let i = 0; i < target.attributes.length; i++) {
                            const attr = target.attributes[i];
                            elementInfo.attributes[attr.name] = attr.value;
                        }
                        
                        console.log('[DOM Agent New Script] Element info:', elementInfo);
                        
                        // Send to parent window
                        if (window.parent && window.parent.postMessage) {
                            console.log('[DOM Agent New Script] Sending element info to parent');
                            window.parent.postMessage({
                                type: 'element-selected',
                                payload: { element: elementInfo }
                            }, '*');
                        }
                        
                        return false;
                    });
                    
                    // Simple mouseover handler
                    document.addEventListener('mouseover', function(e) {
                        const target = e.target;
                        if (target && target.style && target.tagName !== 'SCRIPT' && target.tagName !== 'STYLE' && target !== currentHighlight) {
                            // Remove previous highlight
                            if (currentHighlight && currentHighlight.style) {
                                currentHighlight.style.backgroundColor = '';
                                currentHighlight.style.outline = '';
                            }
                            
                            // Add new highlight
                            target.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                            target.style.outline = '2px solid rgba(0, 123, 255, 0.5)';
                            currentHighlight = target;
                            
                            console.log('[DOM Agent New Script] Highlighted:', target.tagName, target.className || 'no-class');
                        }
                    });
                    
                    document.addEventListener('mouseout', function(e) {
                        const target = e.target;
                        if (target && target.style && target === currentHighlight) {
                            target.style.backgroundColor = '';
                            target.style.outline = '';
                            currentHighlight = null;
                        }
                    });
                    
                    console.log('[DOM Agent New Script] All event handlers added successfully');
                }
                
                // Initialize immediately if DOM is ready, otherwise wait
                if (document.readyState === 'loading') {
                    console.log('[DOM Agent New Script] DOM still loading, waiting...');
                    document.addEventListener('DOMContentLoaded', initDOMAgent);
                } else {
                    console.log('[DOM Agent New Script] DOM already ready, initializing now...');
                    initDOMAgent();
                }
                
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