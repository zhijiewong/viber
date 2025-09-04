import sanitizeHtml from 'sanitize-html';
import { Logger } from './logger';

/**
 * HTML Processor - Optimized specifically for DOM Agent interactive features
 * Preserves important styles and interactive elements, removes security threats
 */
export class HTMLProcessor {
    private readonly logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
    }

    /**
     * Sanitize HTML content while preserving interactive functionality and styles
     * @param html Raw HTML string
     * @returns Safe HTML content preserving interactive elements and styles
     */
    public sanitize(html: string, useUltraSafe: boolean = false): string {
        this.logger.debug('Starting HTML sanitization with interaction preservation', { useUltraSafe });

        try {
            // 🔥 Phase 1: Ultra-strong preprocessing, completely remove document.write
            const megaCleanedHTML = this.megaCleanDocumentWrite(html);

            // 🔥 Ultra-safe mode: Use DOM parser to completely rebuild HTML
            if (useUltraSafe) {
                this.logger.info('Using ultra-safe DOM parser rebuild mode');
                const domRebuilt = this.domParserRebuild(megaCleanedHTML);
                const validation = this.validate(domRebuilt);

                if (validation.isSecure) {
                    return domRebuilt;
                } else {
                    this.logger.warn('DOM rebuild still has security issues, using aggressive fallback');
                }
            }

            // Preprocessing: Completely remove all forms of document.write
            const preProcessed = this.aggressivePreCleanup(megaCleanedHTML);

            // Use sanitize-html with relaxed configuration to preserve interactive features while enhancing security checks
            const sanitized = sanitizeHtml(preProcessed, {
                allowedTags: [
                    // Basic HTML tags
                    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
                    'form', 'input', 'button', 'textarea', 'select', 'option', 'label',
                    'header', 'footer', 'nav', 'section', 'article', 'aside', 'main',
                    'figure', 'figcaption', 'br', 'hr', 'strong', 'em', 'b', 'i',
                    'code', 'pre', 'blockquote', 'cite', 'small', 'sub', 'sup',
                    'time', 'address', 'del', 'ins', 'mark', 'canvas', 'svg', 'path',
                    'link', 'style'
                ],
                // Allow DOM Agent script tags through, but prohibit other scripts
                disallowedTagsMode: 'discard',
                nonTextTags: ['script', 'noscript', 'textarea', 'option'],
                allowedAttributes: {
                    '*': [
                        'id', 'class', 'title', 'role', 'aria-*', 'data-*', 
                        'style', 'tabindex', 'draggable'
                    ],
                    'a': ['href', 'target', 'rel'],
                    'img': ['src', 'alt', 'width', 'height', 'loading'],
                    'input': ['type', 'name', 'value', 'placeholder', 'disabled', 'readonly', 'checked'],
                    'button': ['type', 'disabled'],
                    'textarea': ['name', 'placeholder', 'disabled', 'readonly', 'rows', 'cols'],
                    'select': ['name', 'disabled', 'multiple'],
                    'option': ['value', 'selected'],
                    'label': ['for'],
                    'table': ['border', 'cellpadding', 'cellspacing'],
                    'td': ['colspan', 'rowspan'],
                    'th': ['colspan', 'rowspan', 'scope'],
                    'canvas': ['width', 'height'],
                    'svg': ['width', 'height', 'viewBox', 'xmlns'],
                    'path': ['d', 'fill', 'stroke', 'stroke-width'],
                    'link': ['rel', 'href', 'type', 'media'],
                    'style': ['type', 'media']
                },
                allowedSchemes: ['http', 'https', 'mailto', 'tel'],
                allowedSchemesByTag: {
                    img: ['http', 'https', 'data'],
                    link: ['http', 'https', 'data']
                },
                // Preserve CSS style properties to ensure layout is not broken
                allowedStyles: {
                    '*': {
                        'color': [/.*/],
                        'background-color': [/.*/],
                        'background': [/.*/],
                        'font-size': [/.*/],
                        'font-family': [/.*/],
                        'font-weight': [/.*/],
                        'text-align': [/.*/],
                        'text-decoration': [/.*/],
                        'margin': [/.*/],
                        'margin-top': [/.*/],
                        'margin-bottom': [/.*/],
                        'margin-left': [/.*/],
                        'margin-right': [/.*/],
                        'padding': [/.*/],
                        'padding-top': [/.*/],
                        'padding-bottom': [/.*/],
                        'padding-left': [/.*/],
                        'padding-right': [/.*/],
                        'width': [/.*/],
                        'height': [/.*/],
                        'display': [/.*/],
                        'position': [/.*/],
                        'top': [/.*/],
                        'left': [/.*/],
                        'right': [/.*/],
                        'bottom': [/.*/],
                        'z-index': [/.*/],
                        'border': [/.*/],
                        'border-radius': [/.*/],
                        'box-shadow': [/.*/],
                        'opacity': [/.*/],
                        'visibility': [/.*/],
                        'overflow': [/.*/],
                        'cursor': [/.*/],
                        'transition': [/.*/],
                        'transform': [/.*/],
                        'flex': [/.*/],
                        'flex-direction': [/.*/],
                        'justify-content': [/.*/],
                        'align-items': [/.*/],
                        'grid': [/.*/],
                        'grid-template': [/.*/],
                        'float': [/.*/],
                        'clear': [/.*/]
                    }
                },
                // Remove whitespace configuration
                allowedIframeHostnames: [], // Completely prohibit iframe
                // Custom transformers - Enhanced security checks
                transformTags: {
                    // Allow DOM Agent scripts through
                    'script': (tagName: string, attribs: any) => {
                        // Check if it's a DOM Agent script
                        if (attribs.id === 'dom-agent-selector-styles' ||
                            attribs.id === 'dom-agent-interactivity-script' ||
                            attribs['data-dom-agent'] === 'true') {
                            // Allow DOM Agent scripts through
                            return { tagName, attribs };
                        }
                        // Remove other scripts
                        return { tagName: 'div', attribs: { style: 'display:none;', 'data-removed-script': 'true' } };
                    },
                    // Clean links but preserve structure
                    'a': (tagName: string, attribs: any) => {
                        if (attribs.href && (
                            attribs.href.startsWith('javascript:') ||
                            attribs.href.startsWith('vbscript:') ||
                            attribs.href.startsWith('data:text/html') ||
                            attribs.href.includes('document.write') ||
                            attribs.href.includes('eval(')
                        )) {
                            attribs.href = '#';
                        }
                        return { tagName, attribs };
                    }
                }
            });

            // Lightweight post-processing - Only remove the most dangerous content
            const cleaned = this.lightCleanup(sanitized);

            this.logger.debug('HTML sanitization completed', {
                originalLength: html.length,
                cleanedLength: cleaned.length,
                reductionRatio: ((html.length - cleaned.length) / html.length * 100).toFixed(2) + '%'
            });

            return cleaned;

        } catch (error) {
            this.logger.error('HTML sanitization failed', { 
                error: error instanceof Error ? error.message : String(error) 
            });
            return this.minimalCleanup(html);
        }
    }

    /**
     * 🔥 Ultra-strong document.write cleanup - First line of defense
     */
    private megaCleanDocumentWrite(html: string): string {
        this.logger.debug('Applying mega document.write cleanup');
        
        let cleaned = html;
        
        // 🔥 Remove all script tags containing document.write
        cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?document\s*\.\s*write[\s\S]*?<\/script>/gi, '<!-- dangerous script removed -->');

        // 🔥 Remove all inline event handlers containing document.write
        cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*document\s*\.\s*write[^"']*["']/gi, '');

        // 🔥 Remove all href and src attributes containing document.write
        cleaned = cleaned.replace(/href\s*=\s*["'][^"']*document\s*\.\s*write[^"']*["']/gi, 'href="#removed"');
        cleaned = cleaned.replace(/src\s*=\s*["'][^"']*document\s*\.\s*write[^"']*["']/gi, 'src="#removed"');

        // 🔥 Remove bare document.write calls
        cleaned = cleaned.replace(/document\s*\.\s*write\s*\([^)]*\)/gi, '/* document.write removed */');
        cleaned = cleaned.replace(/document\s*\.\s*writeln\s*\([^)]*\)/gi, '/* document.writeln removed */');

        // 🔥 Remove any lines containing 'document.write' text
        cleaned = cleaned.replace(/.*document\s*\.\s*write.*$/gim, '<!-- line containing document.write removed -->');
        
        this.logger.debug('Mega document.write cleanup completed', {
            originalLength: html.length,
            cleanedLength: cleaned.length,
            removedBytes: html.length - cleaned.length
        });
        
        return cleaned;
    }

    /**
     * Aggressive pre-cleanup - Completely remove all JavaScript execution before sanitize-html
     */
    private aggressivePreCleanup(html: string): string {
        this.logger.debug('Applying aggressive pre-cleanup to remove all JavaScript execution');
        
        let cleaned = html;
        
        // 1. Completely remove script tags and content
        cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '<!-- script removed -->');
        cleaned = cleaned.replace(/<script[^>]*\/>/gi, '<!-- script removed -->');

        // 2. Remove all forms of document.write (including line break and space variants)
        cleaned = cleaned.replace(/document\s*\.\s*write\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/document\s*\.\s*writeln\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/document\s*\[\s*["']write["']\s*\]\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/document\s*\[\s*["']writeln["']\s*\]\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/window\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/self\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/top\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/parent\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(');

        // 3. Remove document.write in quoted JavaScript strings
        cleaned = cleaned.replace(/["']([^"']*document\s*\.\s*write[^"']*)["']/gi, '""');

        // 4. Remove eval and other dangerous functions
        cleaned = cleaned.replace(/eval\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/Function\s*\(\s*["'][^"']*["']/gi, 'Function("")');
        cleaned = cleaned.replace(/setTimeout\s*\(\s*["'][^"']*["']/gi, 'setTimeout(function(){}');
        cleaned = cleaned.replace(/setInterval\s*\(\s*["'][^"']*["']/gi, 'setInterval(function(){}');

        // 5. Remove all event handler attributes
        cleaned = cleaned.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
        cleaned = cleaned.replace(/\s+on\w+\s*=\s*[^"'\s>][^\s>]*/gi, '');

        // 6. Remove JavaScript URLs
        cleaned = cleaned.replace(/javascript\s*:/gi, 'removed:');
        cleaned = cleaned.replace(/vbscript\s*:/gi, 'removed:');

        // 7. Remove data:text/html URLs
        cleaned = cleaned.replace(/data\s*:\s*text\/html[^"'\s>]*/gi, 'data:text/plain,removed');
        
        this.logger.debug('Aggressive pre-cleanup completed', {
            originalLength: html.length,
            cleanedLength: cleaned.length,
            reductionBytes: html.length - cleaned.length
        });
        
        return cleaned;
    }

    /**
     * 🔥 DOM Parser Rebuild Solution - The most thorough solution
     * Completely rebuild HTML using DOM parser, ensuring no JavaScript remnants
     */
    private domParserRebuild(html: string): string {
        this.logger.debug('Using DOM parser to completely rebuild HTML');
        
        try {
            // Parse HTML using DOMParser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Recursively clean all nodes
            const cleanedBody = this.cleanDOMNode(doc.body);
            const cleanedHead = this.cleanDOMNode(doc.head);

            // Rebuild HTML
            const rebuiltHTML = `<!DOCTYPE html>
<html>
<head>
${cleanedHead}
</head>
<body>
${cleanedBody}
</body>
</html>`;
            
            this.logger.debug('DOM parser rebuild completed', {
                originalLength: html.length,
                rebuiltLength: rebuiltHTML.length
            });
            
            return rebuiltHTML;
            
        } catch (error) {
            this.logger.warn('DOM parser rebuild failed, falling back to regex cleanup', error);
            return this.aggressivePreCleanup(html);
        }
    }

    /**
     * Recursively clean DOM nodes, remove all JavaScript-related content
     */
    private cleanDOMNode(node: any): string {
        if (!node) {
            return '';
        }

        let result = '';
        
        for (const child of Array.from(node.childNodes)) {
            const nodeType = (child as any).nodeType;

            // Process element nodes
            if (nodeType === 1) { // Node.ELEMENT_NODE
                const element = child as any;
                const tagName = element.tagName.toLowerCase();

                // Skip dangerous tags
                if (['script', 'noscript', 'object', 'embed', 'iframe'].includes(tagName)) {
                    continue;
                }

                // Build safe opening tag
                let openTag = `<${tagName}`;

                // Only add safe attributes
                for (const attr of Array.from(element.attributes)) {
                    const attrName = (attr as any).name.toLowerCase();
                    const attrValue = (attr as any).value;

                    // Skip event handlers and dangerous attributes
                    if (attrName.startsWith('on') ||
                        attrValue.toLowerCase().includes('javascript:') ||
                        attrValue.toLowerCase().includes('document.write')) {
                        continue;
                    }

                    openTag += ` ${attrName}="${attrValue.replace(/"/g, '&quot;')}"`;
                }

                openTag += '>';

                // Recursively process child nodes
                const innerContent = this.cleanDOMNode(element);

                // Build complete element
                const closeTag = `</${tagName}>`;
                result += openTag + innerContent + closeTag;

            }
            // Process text nodes
            else if (nodeType === 3) { // Node.TEXT_NODE
                const textContent = (child as any).textContent || '';
                // Remove dangerous content from text
                const cleanText = textContent
                    .replace(/document\s*\.\s*write\s*\(/gi, 'void(')
                    .replace(/eval\s*\(/gi, 'void(');
                result += cleanText;
            }
            // Skip other node types (comments, etc.)
        }
        
        return result;
    }

    /**
     * Lightweight cleanup - Only remove the most necessary dangerous content
     */
    private lightCleanup(html: string): string {
        return html
            // Completely remove all forms of document.write
            .replace(/document\s*\.\s*write\s*\(/gi, 'void(')
            .replace(/document\s*\.\s*writeln\s*\(/gi, 'void(')
            .replace(/document\s*\[\s*["']write["']\s*\]\s*\(/gi, 'void(')
            .replace(/document\s*\[\s*["']writeln["']\s*\]\s*\(/gi, 'void(')
            .replace(/window\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(')
            .replace(/window\s*\.\s*document\s*\.\s*writeln\s*\(/gi, 'void(')

            // Remove other dangerous functions
            .replace(/eval\s*\(/gi, 'void(')
            .replace(/setTimeout\s*\(\s*["'][^"']*["']/gi, 'setTimeout(function(){})')
            .replace(/setInterval\s*\(\s*["'][^"']*["']/gi, 'setInterval(function(){})')
            .replace(/Function\s*\(\s*["'][^"']*["']/gi, 'Function("")')

            // Remove all event handlers
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')

            // Remove javascript: URLs but preserve others
            .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
            .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src="#"')
            .replace(/action\s*=\s*["']javascript:[^"']*["']/gi, 'action="#"')

            // Remove script tags but preserve structural tags and styles
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<script[^>]*\/>/gi, '')

            // Do not remove inline styles as they are important for layout
            // Only remove obvious dangerous content in style tags
            .replace(/<style[^>]*>[\s\S]*?expression\s*\([^)]*\)[\s\S]*?<\/style>/gi, '')

            .trim();
    }

    /**
     * Minimal cleanup - Fallback solution
     */
    private minimalCleanup(html: string): string {
        this.logger.warn('Using minimal HTML cleanup fallback');

        return html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<script[^>]*\/>/gi, '')
            .replace(/javascript\s*:/gi, 'removed:')
            .replace(/document\s*\.\s*write\s*\(/gi, 'void(')
            .replace(/document\s*\.\s*writeln\s*\(/gi, 'void(')
            .replace(/document\s*\[\s*["']write["']\s*\]\s*\(/gi, 'void(')
            .replace(/document\s*\[\s*["']writeln["']\s*\]\s*\(/gi, 'void(')
            .replace(/window\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(')
            .replace(/eval\s*\(/gi, 'void(')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .trim();
    }

    /**
     * Validate HTML content quality and security
     * @param html HTML string
     * @returns Validation results including interactive element detection, security checks, and warning messages
     */
    public validate(html: string): {
        hasInteractiveElements: boolean;
        hasStyles: boolean;
        hasClasses: boolean;
        isSecure: boolean;
        warnings: string[];
        securityIssues: string[];
    } {
        const warnings: string[] = [];
        const securityIssues: string[] = [];
        
        const hasInteractiveElements = /(?:button|input|select|textarea|a\s+href)/i.test(html);
        const hasStyles = /(?:style\s*=|<style|class\s*=)/i.test(html);
        const hasClasses = /class\s*=\s*["'][^"']*["']/i.test(html);

        // Security checks
        let isSecure = true;

        // Check if there are still dangerous JavaScript calls
        if (/document\s*\.\s*write\s*\(/i.test(html)) {
            securityIssues.push('document.write calls detected');
            isSecure = false;
        }

        if (/eval\s*\(/i.test(html)) {
            securityIssues.push('eval() calls detected');
            isSecure = false;
        }

        if (/<script[^>]*>/i.test(html)) {
            securityIssues.push('Script tags detected');
            isSecure = false;
        }

        if (/javascript\s*:/i.test(html)) {
            securityIssues.push('JavaScript URLs detected');
            isSecure = false;
        }

        if (/on\w+\s*=\s*["'][^"']*["']/i.test(html)) {
            securityIssues.push('Inline event handlers detected');
            isSecure = false;
        }

        // Functionality checks
        if (!hasInteractiveElements) {
            warnings.push('No interactive elements detected');
        }

        if (!hasStyles) {
            warnings.push('No styling detected - layout may be broken');
        }

        // Check for potential issues
        if (/position\s*:\s*fixed/i.test(html)) {
            warnings.push('Fixed positioning detected - may interfere with DOM Agent UI');
        }

        if (/z-index\s*:\s*\d{4,}/i.test(html)) {
            warnings.push('High z-index values detected - may interfere with DOM Agent UI');
        }

        return {
            hasInteractiveElements,
            hasStyles,
            hasClasses,
            isSecure,
            warnings,
            securityIssues
        };
    }
}