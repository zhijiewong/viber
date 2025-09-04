import { ElementInfo } from '../types';
import { Logger } from '../utils/logger';
import { HTMLProcessor } from '../utils/HTMLProcessor';
import unique from 'unique-selector';
import * as xpath from 'xpath';

export class DomSerializer {
  private readonly logger: Logger;
  private readonly htmlProcessor: HTMLProcessor;

  constructor() {
    this.logger = Logger.getInstance();
    this.htmlProcessor = new HTMLProcessor();
  }

  public serializeElement(element: HTMLElement): ElementInfo {
    this.logger.debug('Serializing element', { tag: element.tagName });

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    const elementInfo: ElementInfo = {
      tag: element.tagName.toLowerCase(),
      classes: Array.from(element.classList),
      textContent: this.extractTextContent(element),
      attributes: this.extractAttributes(element),
      cssSelector: this.generateCSSSelector(element),
      xpath: this.generateXPath(element),
      boundingBox: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      computedStyles: this.extractComputedStyles(computedStyle),
    };

    if (element.id) {
      elementInfo.id = element.id;
    }

    return elementInfo;
  }

  public sanitizeHTML(html: string): string {
    this.logger.debug('Starting HTML sanitization', { inputLength: html.length });

    try {
      // Use HTML processor to clean content
      const cleanedHTML = this.htmlProcessor.sanitize(html);

      // Validate processing result quality
      const validation = this.htmlProcessor.validate(cleanedHTML);

      if (validation.warnings.length > 0) {
        this.logger.warn('HTML processing warnings', validation.warnings);
      }

      this.logger.info('HTML sanitization completed successfully', {
        hasInteractiveElements: validation.hasInteractiveElements,
        hasStyles: validation.hasStyles,
        hasClasses: validation.hasClasses,
        originalLength: html.length,
        cleanedLength: cleanedHTML.length,
      });

      return cleanedHTML;
    } catch (error) {
      this.logger.error('HTML sanitization failed, using fallback method', {
        error: error instanceof Error ? error.message : String(error),
      });

      // Minimal fallback - only remove the most dangerous content
      return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/javascript\s*:/gi, 'removed:')
        .replace(/document\s*\.\s*write\s*\(/gi, 'void(');
    }
  }

  public injectInteractivityScript(): string {
    return `
            <script id="dom-agent-interactivity-script">
                
                // 🛡️ JavaScript Runtime Interceptor - Completely block dangerous function execution
                (function() {

                    // 1. Completely disable document.write and document.writeln
                    if (document.write) {
                        document.write = function() {
                            console.warn('🚫 document.write blocked by DOM Agent security');
                            return false;
                        };
                    }
                    if (document.writeln) {
                        document.writeln = function() {
                            console.warn('🚫 document.writeln blocked by DOM Agent security');
                            return false;
                        };
                    }

                    // 2. Intercept eval
                    const originalEval = window.eval;
                    window.eval = function(code) {
                        console.warn('🚫 eval() blocked by DOM Agent security:', code);
                        return undefined;
                    };

                    // 3. Intercept Function constructor
                    const OriginalFunction = window.Function;
                    window.Function = function() {
                        console.warn('🚫 Function constructor blocked by DOM Agent security');
                        return function() {};
                    };

                    // 4. Intercept setTimeout/setInterval with string parameters
                    const originalSetTimeout = window.setTimeout;
                    const originalSetInterval = window.setInterval;

                    window.setTimeout = function(callback, delay) {
                        if (typeof callback === 'string') {
                            console.warn('🚫 setTimeout with string blocked by DOM Agent security');
                            return 0;
                        }
                        return originalSetTimeout.apply(this, arguments);
                    };

                    window.setInterval = function(callback, delay) {
                        if (typeof callback === 'string') {
                            console.warn('🚫 setInterval with string blocked by DOM Agent security');
                            return 0;
                        }
                        return originalSetInterval.apply(this, arguments);
                    };
                    
                    console.log('✅ JavaScript security interceptors installed successfully');
                })();
                
                // Get VS Code API
                let vscode = window.vscode;
                if (!vscode) {
                    try {
                        vscode = acquireVsCodeApi();
                        window.vscode = vscode;
                        console.log('VS Code API acquired');
                    } catch (e) {
                        console.log('VS Code API already available');
                        vscode = window.vscode;
                    }
                }
                
                let currentHighlight = null;
                
                function initializeInteractivity() {
                    console.log('🚀 Initializing DOM Agent interactivity...');
                    console.log('📊 DOM Stats:', {
                        bodyElements: document.body.children.length,
                        hasBody: !!document.body,
                        hasHead: !!document.head,
                        readyState: document.readyState
                    });
                    
                    // Add global styles for highlighting with higher specificity
                    const style = document.createElement('style');
                    style.id = 'dom-agent-styles';
                    style.textContent = \`
                        /* DOM Agent selection box styles - Ultra high priority */
                        .dom-agent-highlight {
                            background: rgba(0, 150, 255, 0.15) !important;
                            outline: 2px solid #0096ff !important;
                            outline-offset: 0px !important;
                            box-shadow: 0 0 0 2px rgba(0, 150, 255, 0.3) !important;
                            cursor: crosshair !important;
                            position: relative !important;
                            z-index: 2147483647 !important;
                        }
                        
                        .dom-agent-selected {
                            background: rgba(255, 50, 50, 0.2) !important;
                            outline: 3px solid #ff3333 !important;
                            outline-offset: 0px !important;
                            box-shadow: 0 0 0 3px rgba(255, 50, 50, 0.4) !important;
                            position: relative !important;
                            z-index: 2147483647 !important;
                        }
                        
                        /* Ensure DOM Agent UI maintains highest z-index */
                        .dom-agent-toolbar {
                            z-index: 2147483647 !important;
                            position: fixed !important;
                        }
                        
                        /* Test styles - Add an obvious test class */
                        .dom-agent-test {
                            background: yellow !important;
                            border: 5px solid red !important;
                            color: black !important;
                            font-size: 20px !important;
                            padding: 10px !important;
                        }
                    \`;
                    
                    // Remove any existing DOM Agent styles first
                    const existingStyle = document.getElementById('dom-agent-styles');
                    if (existingStyle) {
                        existingStyle.remove();
                    }
                    
                    document.head.appendChild(style);
                    console.log('✅ DOM Agent styles injected successfully');
                    console.log('Style element added to head:', !!document.getElementById('dom-agent-styles'));
                    
                    // Add test styles to body to verify CSS works properly
                    document.body.style.setProperty('--dom-agent-test', 'working', 'important');
                    console.log('✅ CSS injection test completed');

                    // Simpler and more direct hover handling
                    let isMouseOverHandlerActive = false;

                    document.addEventListener('mouseover', function(e) {
                        if (isMouseOverHandlerActive) return;
                        isMouseOverHandlerActive = true;

                        const target = e.target;
                        console.log('🖱️ Mouse over:', target.tagName, target.className);

                        // Check if this element should be skipped
                        if (
                            target.closest('.dom-agent-toolbar') ||
                            target.classList.contains('dom-agent-selected')) {
                            console.log('⏭️ Skipping DOM Agent UI element');
                            isMouseOverHandlerActive = false;
                            return;
                        }

                        // Remove previous highlight
                        const prevHighlighted = document.querySelector('.dom-agent-highlight');
                        if (prevHighlighted && prevHighlighted !== target) {
                            prevHighlighted.classList.remove('dom-agent-highlight');
                            console.log('🔄 Removed previous highlight');
                        }
                        
                        // Add highlight to current element
                        if (!target.classList.contains('dom-agent-highlight')) {
                            target.classList.add('dom-agent-highlight');
                            console.log('✨ Added highlight to:', target.tagName, target.id || 'no-id');

                            // Verify if styles are applied
                            const computedStyle = window.getComputedStyle(target);
                            console.log('🎨 Applied outline:', computedStyle.outline);
                        }
                        
                        currentHighlight = target;
                        isMouseOverHandlerActive = false;
                        e.stopPropagation();
                    }, true);
                    
                    document.addEventListener('mouseout', function(e) {
                        const target = e.target;
                        console.log('🖱️ Mouse out:', target.tagName);
                        
                        // Only remove highlight when leaving current highlighted element and not in selection state
                        if (target === currentHighlight && !target.classList.contains('dom-agent-selected')) {
                            target.classList.remove('dom-agent-highlight');
                            console.log('🔄 Removed highlight on mouseout');
                            currentHighlight = null;
                        }
                    }, true);
                    
                    console.log('✅ Hover event listeners added');
                    
                    // 🔬 Test if event listeners are working
                    console.log('🧪 Testing event listeners...');

                    // Add a test event to body
                    document.body.addEventListener('mousemove', function(e) {
                        console.log('🖱️ Mouse move detected at:', e.clientX, e.clientY);
                    }, { once: true }); // Execute only once

                    // Test if styles can be applied
                    const testElement = document.createElement('div');
                    testElement.className = 'dom-agent-test';
                    testElement.textContent = 'DOM Agent Test Element';
                    testElement.style.cssText = 'position: fixed; top: 10px; left: 10px; z-index: 999999;';
                    document.body.appendChild(testElement);

                    setTimeout(() => {
                        if (testElement.parentNode) {
                            testElement.remove();
                        }
                    }, 3000);

                    console.log('🧪 Test element added for 3 seconds');
                    
                    // Click handler
                    document.addEventListener('click', function(e) {
                        const target = e.target;
                        
                        // Skip DOM Agent UI elements
                        if ( 
                            target.closest('.dom-agent-toolbar')) {
                            return;
                        }
                        
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log('🖱️ Element clicked:', target.tagName, target.id || 'no-id');
                        
                        // Remove previous selection
                        const prevSelected = document.querySelector('.dom-agent-selected');
                        if (prevSelected) {
                            prevSelected.classList.remove('dom-agent-selected');
                            console.log('🔄 Removed previous selection');
                        }

                        // Remove highlight and add selection style
                        target.classList.remove('dom-agent-highlight');
                        target.classList.add('dom-agent-selected');
                        console.log('✅ Element selected:', target.tagName);

                        // Verify selection style
                        const computedStyle = window.getComputedStyle(target);
                        console.log('🎨 Selection outline:', computedStyle.outline);
                        
                        // Generate element info
                        const rect = target.getBoundingClientRect();
                        const elementInfo = {
                            tag: target.tagName.toLowerCase(),
                            id: target.id || '',
                            classes: Array.from(target.classList).filter(c => !c.startsWith('dom-agent-')),
                            textContent: target.textContent ? target.textContent.trim().substring(0, 100) : '',
                            attributes: {},
                            cssSelector: generateSelector(target),
                            xpath: generateXPath(target),
                            boundingBox: {
                                x: Math.round(rect.x),
                                y: Math.round(rect.y),
                                width: Math.round(rect.width),
                                height: Math.round(rect.height)
                            },
                            computedStyles: {}
                        };
                        
                        // Get attributes
                        for (let i = 0; i < target.attributes.length; i++) {
                            const attr = target.attributes[i];
                            elementInfo.attributes[attr.name] = attr.value;
                        }
                        
                        // Send to VS Code
                        if (vscode && vscode.postMessage) {
                            vscode.postMessage({
                                type: 'element-selected',
                                payload: { element: elementInfo }
                            });
                        }
                        
                        // Show in inspector
                        if (window.showElementInspector) {
                            window.showElementInspector(elementInfo);
                        }
                        
                        return false;
                    });
                    
                    // Hover handler
                    document.addEventListener('mouseover', function(e) {
                        const target = e.target;
                        
                        // Skip DOM Agent UI elements
                        if ( 
                            target.closest('.dom-agent-toolbar') ||
                            target.classList.contains('dom-agent-selected') ||
                            target.tagName === 'SCRIPT' || 
                            target.tagName === 'STYLE') {
                            return;
                        }
                        
                        // Remove previous highlight
                        if (currentHighlight && currentHighlight !== target) {
                            currentHighlight.classList.remove('dom-agent-highlight');
                        }
                        
                        // Add highlight
                        target.classList.add('dom-agent-highlight');
                        currentHighlight = target;
                    });
                    
                    document.addEventListener('mouseout', function(e) {
                        const target = e.target;
                        if (target && target === currentHighlight) {
                            target.classList.remove('dom-agent-highlight');
                            currentHighlight = null;
                        }
                    });
                    
                    console.log('DOM Agent event handlers added');
                }
                
                function generateSelector(element) {
                    // Simple but effective selector generation
                    if (element.id && !element.id.includes(' ')) {
                        return '#' + element.id;
                    }
                    
                    // For elements with unique classes
                    if (element.classList.length > 0) {
                        const classes = Array.from(element.classList)
                            .filter(c => !c.startsWith('dom-agent-') && !c.match(/^[0-9]/));
                        if (classes.length > 0) {
                            const classSelector = '.' + classes.slice(0, 2).join('.');
                            const sameClassElements = document.querySelectorAll(classSelector);
                            if (sameClassElements.length === 1) {
                                return classSelector;
                            }
                        }
                    }
                    
                    // Build path with smart truncation
                    const path = [];
                    let current = element;
                    let depth = 0;
                    
                    while (current && current !== document.body && depth < 4) {
                        let selector = current.tagName.toLowerCase();
                        
                        // Add classes if they help uniqueness
                        if (current.classList.length > 0) {
                            const classes = Array.from(current.classList)
                                .filter(c => !c.startsWith('dom-agent-'))
                                .slice(0, 1);
                            if (classes.length > 0) {
                                selector += '.' + classes.join('.');
                            }
                        }
                        
                        path.unshift(selector);
                        current = current.parentElement;
                        depth++;
                    }
                    
                    return path.join(' > ');
                }
                
                function generateXPath(element) {
                    const path = [];
                    let current = element;
                    
                    while (current && current !== document.body) {
                        let index = 1;
                        let sibling = current.previousElementSibling;
                        
                        while (sibling) {
                            if (sibling.tagName === current.tagName) index++;
                            sibling = sibling.previousElementSibling;
                        }
                        
                        path.unshift(current.tagName.toLowerCase() + '[' + index + ']');
                        current = current.parentElement;
                        if (path.length > 5) break;
                    }
                    
                    return '//' + path.join('/');
                }
                
                // Initialize
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initializeInteractivity);
                } else {
                    setTimeout(initializeInteractivity, 100);
                }
                
            </script>
        `;
  }

  private extractTextContent(element: HTMLElement): string {
    // Get only direct text content, not from children
    const textNodes = Array.from(element.childNodes).filter(
      node => node.nodeType === Node.TEXT_NODE
    );

    const text = textNodes
      .map(node => node.textContent ?? '')
      .join(' ')
      .trim();
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
    try {
      // Use unique-selector library for better CSS selector generation
      return unique(element, {
        selectorTypes: ['ID', 'Class', 'Tag', 'NthChild'],
        attributesToIgnore: ['style', 'data-dom-agent-selected', 'data-dom-agent-highlighted'],
        excludeRegex: /^dom-agent-/,
      });
    } catch (error) {
      this.logger.warn('unique-selector failed, using fallback', error);

      // Fallback to simple ID or tag-based selector
      if (element.id) {
        return `#${element.id}`;
      }

      let selector = element.tagName.toLowerCase();
      if (element.classList.length > 0) {
        const classes = Array.from(element.classList)
          .filter(c => !c.startsWith('dom-agent-'))
          .slice(0, 2); // Limit to first 2 classes
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }

      return selector;
    }
  }

  private generateXPath(element: HTMLElement): string {
    try {
      // Try to use xpath library for better XPath generation
      if (element.ownerDocument) {
        const doc = element.ownerDocument;
        xpath.select('//*', doc, true);

        // Find the element in the document and generate its XPath
        const elementNodes = xpath.select('//*', doc) as Element[];
        const elementIndex = elementNodes.indexOf(element);

        if (elementIndex !== -1) {
          // Generate XPath based on element position
          return this.generateSimpleXPath(element);
        }
      }

      return this.generateSimpleXPath(element);
    } catch (error) {
      this.logger.warn('xpath library failed, using fallback', error);
      return this.generateSimpleXPath(element);
    }
  }

  private generateSimpleXPath(element: HTMLElement): string {
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
      'display',
      'position',
      'width',
      'height',
      'margin',
      'padding',
      'border',
      'background',
      'color',
      'font-size',
      'font-family',
      'text-align',
      'vertical-align',
      'line-height',
      'z-index',
      'opacity',
      'visibility',
      'overflow',
      'float',
      'clear',
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
