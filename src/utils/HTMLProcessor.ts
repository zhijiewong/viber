import sanitizeHtml from 'sanitize-html';
import { Logger } from './logger';

/**
 * HTML处理器 - 专门为DOM Agent交互功能优化
 * 保留重要样式和交互元素，移除安全威胁
 */
export class HTMLProcessor {
    private readonly logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    /**
     * 清理HTML内容，保留交互功能和样式
     * @param html 原始HTML字符串
     * @returns 安全的HTML内容，保留交互元素和样式
     */
    public sanitize(html: string, useUltraSafe: boolean = false): string {
        this.logger.debug('Starting HTML sanitization with interaction preservation', { useUltraSafe });

        try {
            // 🔥 第一阶段：超强预处理，彻底移除document.write
            const megaCleanedHTML = this.megaCleanDocumentWrite(html);
            
            // 🔥 超级安全模式：使用DOM解析器完全重建HTML
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
            
            // 预处理：彻底移除所有形式的document.write
            const preProcessed = this.aggressivePreCleanup(megaCleanedHTML);
            
            // 使用sanitize-html但配置更宽松以保留交互功能，同时加强安全检查
            const sanitized = sanitizeHtml(preProcessed, {
                allowedTags: [
                    // 基本HTML标签
                    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
                    'form', 'input', 'button', 'textarea', 'select', 'option', 'label',
                    'header', 'footer', 'nav', 'section', 'article', 'aside', 'main',
                    'figure', 'figcaption', 'br', 'hr', 'strong', 'em', 'b', 'i',
                    'code', 'pre', 'blockquote', 'cite', 'small', 'sub', 'sup',
                    'time', 'address', 'del', 'ins', 'mark', 'canvas', 'svg', 'path',
                    'style', 'link'
                ],
                // 完全禁止脚本相关标签，但允许样式标签
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
                // 保留CSS样式属性以确保布局不被破坏
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
                // 移除空白字符配置
                allowedIframeHostnames: [], // 完全禁止iframe
                // 自定义转换器 - 加强安全检查
                transformTags: {
                    // 清理链接但保留结构
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

            // 轻量级后处理 - 只移除最危险的内容
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
     * 🔥 超强document.write清理 - 第一道防线
     */
    private megaCleanDocumentWrite(html: string): string {
        this.logger.debug('Applying mega document.write cleanup');
        
        let cleaned = html;
        
        // 🔥 移除所有包含document.write的script标签
        cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?document\s*\.\s*write[\s\S]*?<\/script>/gi, '<!-- dangerous script removed -->');
        
        // 🔥 移除所有包含document.write的内联事件处理器
        cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*document\s*\.\s*write[^"']*["']/gi, '');
        
        // 🔥 移除所有包含document.write的href和src
        cleaned = cleaned.replace(/href\s*=\s*["'][^"']*document\s*\.\s*write[^"']*["']/gi, 'href="#removed"');
        cleaned = cleaned.replace(/src\s*=\s*["'][^"']*document\s*\.\s*write[^"']*["']/gi, 'src="#removed"');
        
        // 🔥 移除裸露的document.write调用
        cleaned = cleaned.replace(/document\s*\.\s*write\s*\([^)]*\)/gi, '/* document.write removed */');
        cleaned = cleaned.replace(/document\s*\.\s*writeln\s*\([^)]*\)/gi, '/* document.writeln removed */');
        
        // 🔥 移除任何包含 'document.write' 文本的行
        cleaned = cleaned.replace(/.*document\s*\.\s*write.*$/gim, '<!-- line containing document.write removed -->');
        
        this.logger.debug('Mega document.write cleanup completed', {
            originalLength: html.length,
            cleanedLength: cleaned.length,
            removedBytes: html.length - cleaned.length
        });
        
        return cleaned;
    }

    /**
     * 强力预清理 - 在sanitize-html之前彻底移除所有JavaScript执行
     */
    private aggressivePreCleanup(html: string): string {
        this.logger.debug('Applying aggressive pre-cleanup to remove all JavaScript execution');
        
        let cleaned = html;
        
        // 1. 完全移除script标签和内容
        cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '<!-- script removed -->');
        cleaned = cleaned.replace(/<script[^>]*\/>/gi, '<!-- script removed -->');
        
        // 2. 移除所有形式的document.write（包括换行、空格变体）
        cleaned = cleaned.replace(/document\s*\.\s*write\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/document\s*\.\s*writeln\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/document\s*\[\s*["']write["']\s*\]\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/document\s*\[\s*["']writeln["']\s*\]\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/window\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/self\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/top\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/parent\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(');
        
        // 3. 移除带引号的JavaScript字符串中的document.write
        cleaned = cleaned.replace(/["']([^"']*document\s*\.\s*write[^"']*)["']/gi, '""');
        
        // 4. 移除eval和其他危险函数
        cleaned = cleaned.replace(/eval\s*\(/gi, 'void(');
        cleaned = cleaned.replace(/Function\s*\(\s*["'][^"']*["']/gi, 'Function("")');
        cleaned = cleaned.replace(/setTimeout\s*\(\s*["'][^"']*["']/gi, 'setTimeout(function(){}');
        cleaned = cleaned.replace(/setInterval\s*\(\s*["'][^"']*["']/gi, 'setInterval(function(){}');
        
        // 5. 移除所有事件处理器属性
        cleaned = cleaned.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
        cleaned = cleaned.replace(/\s+on\w+\s*=\s*[^"'\s>][^\s>]*/gi, '');
        
        // 6. 移除JavaScript URL
        cleaned = cleaned.replace(/javascript\s*:/gi, 'removed:');
        cleaned = cleaned.replace(/vbscript\s*:/gi, 'removed:');
        
        // 7. 移除data:text/html URLs
        cleaned = cleaned.replace(/data\s*:\s*text\/html[^"'\s>]*/gi, 'data:text/plain,removed');
        
        this.logger.debug('Aggressive pre-cleanup completed', {
            originalLength: html.length,
            cleanedLength: cleaned.length,
            reductionBytes: html.length - cleaned.length
        });
        
        return cleaned;
    }

    /**
     * 🔥 DOM解析器重建方案 - 最彻底的解决方案
     * 完全使用DOM解析器重新构建HTML，确保没有任何JavaScript残留
     */
    private domParserRebuild(html: string): string {
        this.logger.debug('Using DOM parser to completely rebuild HTML');
        
        try {
            // 使用DOMParser解析HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 递归清理所有节点
            const cleanedBody = this.cleanDOMNode(doc.body);
            const cleanedHead = this.cleanDOMNode(doc.head);
            
            // 重新构建HTML
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
     * 递归清理DOM节点，移除所有JavaScript相关内容
     */
    private cleanDOMNode(node: any): string {
        if (!node) {
            return '';
        }

        let result = '';
        
        for (const child of Array.from(node.childNodes)) {
            const nodeType = (child as any).nodeType;
            
            // 处理元素节点
            if (nodeType === 1) { // Node.ELEMENT_NODE
                const element = child as any;
                const tagName = element.tagName.toLowerCase();
                
                // 跳过危险标签
                if (['script', 'noscript', 'object', 'embed', 'iframe'].includes(tagName)) {
                    continue;
                }
                
                // 构建安全的开始标签
                let openTag = `<${tagName}`;
                
                // 只添加安全的属性
                for (const attr of Array.from(element.attributes)) {
                    const attrName = (attr as any).name.toLowerCase();
                    const attrValue = (attr as any).value;
                    
                    // 跳过事件处理器和危险属性
                    if (attrName.startsWith('on') || 
                        attrValue.toLowerCase().includes('javascript:') ||
                        attrValue.toLowerCase().includes('document.write')) {
                        continue;
                    }
                    
                    openTag += ` ${attrName}="${attrValue.replace(/"/g, '&quot;')}"`;
                }
                
                openTag += '>';
                
                // 递归处理子节点
                const innerContent = this.cleanDOMNode(element);
                
                // 构建完整的元素
                const closeTag = `</${tagName}>`;
                result += openTag + innerContent + closeTag;
                
            } 
            // 处理文本节点
            else if (nodeType === 3) { // Node.TEXT_NODE
                const textContent = (child as any).textContent || '';
                // 移除文本中的危险内容
                const cleanText = textContent
                    .replace(/document\s*\.\s*write\s*\(/gi, 'void(')
                    .replace(/eval\s*\(/gi, 'void(');
                result += cleanText;
            }
            // 跳过其他节点类型（注释等）
        }
        
        return result;
    }

    /**
     * 轻量级清理 - 只移除最必要的危险内容
     */
    private lightCleanup(html: string): string {
        return html
            // 完全移除所有形式的document.write
            .replace(/document\s*\.\s*write\s*\(/gi, 'void(')
            .replace(/document\s*\.\s*writeln\s*\(/gi, 'void(')
            .replace(/document\s*\[\s*["']write["']\s*\]\s*\(/gi, 'void(')
            .replace(/document\s*\[\s*["']writeln["']\s*\]\s*\(/gi, 'void(')
            .replace(/window\s*\.\s*document\s*\.\s*write\s*\(/gi, 'void(')
            .replace(/window\s*\.\s*document\s*\.\s*writeln\s*\(/gi, 'void(')
            
            // 移除其他危险函数
            .replace(/eval\s*\(/gi, 'void(')
            .replace(/setTimeout\s*\(\s*["'][^"']*["']/gi, 'setTimeout(function(){}')
            .replace(/setInterval\s*\(\s*["'][^"']*["']/gi, 'setInterval(function(){}')
            .replace(/Function\s*\(\s*["'][^"']*["']/gi, 'Function("")')
            
            // 移除所有事件处理器
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            
            // 移除javascript: URL但保留其他
            .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
            .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src="#"')
            .replace(/action\s*=\s*["']javascript:[^"']*["']/gi, 'action="#"')
            
            // 移除script标签但保留结构标签和样式
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<script[^>]*\/>/gi, '')
            
            // 不移除内联样式，因为它们对布局很重要
            // 只移除明显的style标签中的危险内容
            .replace(/<style[^>]*>[\s\S]*?expression\s*\([^)]*\)[\s\S]*?<\/style>/gi, '')
            
            .trim();
    }

    /**
     * 最小化清理 - 回退方案
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
     * 验证HTML内容质量和安全性
     * @param html HTML字符串
     * @returns 验证结果，包含交互元素检测、安全检查和警告信息
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
        
        // 安全检查
        let isSecure = true;
        
        // 检查是否还有危险的JavaScript
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
        
        // 功能检查
        if (!hasInteractiveElements) {
            warnings.push('No interactive elements detected');
        }
        
        if (!hasStyles) {
            warnings.push('No styling detected - layout may be broken');
        }
        
        // 检查潜在问题
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