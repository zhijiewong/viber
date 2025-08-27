import { ElementInfo, BoundingBox } from '../types';
import { Logger } from '../utils/logger';

export class ElementInspector {
    private readonly logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    public analyzeElement(element: ElementInfo): ElementAnalysis {
        this.logger.debug('Analyzing element', { tag: element.tag, id: element.id });

        return {
            basic: this.getBasicInfo(element),
            selectors: this.getSelectors(element),
            styling: this.getStyleInfo(element),
            accessibility: this.getAccessibilityInfo(element),
            positioning: this.getPositioningInfo(element),
            metadata: this.getMetadata(element)
        };
    }

    public generateTestSelectors(element: ElementInfo): TestSelectors {
        return {
            playwright: this.generatePlaywrightSelectors(element),
            cypress: this.generateCypressSelectors(element),
            selenium: this.generateSeleniumSelectors(element)
        };
    }

    public suggestImprovements(element: ElementInfo): string[] {
        const suggestions: string[] = [];

        // ID suggestions
        if (!element.id && element.tag !== 'div' && element.tag !== 'span') {
            suggestions.push(`Consider adding an 'id' attribute for better targeting`);
        }

        // Class suggestions
        if (element.classes.length === 0) {
            suggestions.push(`Consider adding CSS classes for styling and selection`);
        }

        // Accessibility suggestions
        if (this.isInteractiveElement(element.tag) && !element.attributes['aria-label'] && !element.textContent) {
            suggestions.push(`Add 'aria-label' for better accessibility`);
        }

        // Form element suggestions
        if (element.tag === 'input' && !element.attributes['name']) {
            suggestions.push(`Add 'name' attribute for form handling`);
        }

        // Link suggestions
        if (element.tag === 'a' && !element.attributes['title']) {
            suggestions.push(`Consider adding 'title' attribute for better UX`);
        }

        // Image suggestions
        if (element.tag === 'img' && !element.attributes['alt']) {
            suggestions.push(`Add 'alt' attribute for accessibility`);
        }

        return suggestions;
    }

    private getBasicInfo(element: ElementInfo): BasicInfo {
        return {
            tag: element.tag,
            id: element.id || undefined,
            classes: element.classes,
            textContent: element.textContent,
            hasChildren: this.hasChildren(element),
            isVisible: this.isVisible(element),
            elementType: this.categorizeElement(element.tag)
        };
    }

    private getSelectors(element: ElementInfo): SelectorInfo {
        return {
            css: element.cssSelector,
            xpath: element.xpath,
            alternatives: this.generateAlternativeSelectors(element),
            specificity: this.calculateSpecificity(element.cssSelector),
            reliability: this.assessSelectorReliability(element)
        };
    }

    private getStyleInfo(element: ElementInfo): StyleInfo {
        const styles = element.computedStyles;
        
        return {
            display: styles.display || 'block',
            position: styles.position || 'static',
            dimensions: {
                width: styles.width || 'auto',
                height: styles.height || 'auto'
            },
            spacing: {
                margin: styles.margin || '0',
                padding: styles.padding || '0'
            },
            colors: {
                background: styles.background || 'transparent',
                color: styles.color || 'inherit'
            },
            typography: {
                fontSize: styles['font-size'] || 'inherit',
                fontFamily: styles['font-family'] || 'inherit'
            },
            layout: {
                float: styles.float || 'none',
                clear: styles.clear || 'none',
                overflow: styles.overflow || 'visible'
            }
        };
    }

    private getAccessibilityInfo(element: ElementInfo): AccessibilityInfo {
        const attrs = element.attributes;
        
        return {
            role: attrs.role || undefined,
            ariaLabel: attrs['aria-label'] || undefined,
            ariaDescribedBy: attrs['aria-describedby'] || undefined,
            tabIndex: attrs.tabindex ? parseInt(attrs.tabindex) : undefined,
            isInteractive: this.isInteractiveElement(element.tag),
            hasAccessibleName: !!(attrs['aria-label'] || element.textContent || attrs.title),
            issues: this.findAccessibilityIssues(element)
        };
    }

    private getPositioningInfo(element: ElementInfo): PositioningInfo {
        const box = element.boundingBox;
        
        return {
            boundingBox: box,
            center: {
                x: box.x + box.width / 2,
                y: box.y + box.height / 2
            },
            area: box.width * box.height,
            aspectRatio: box.height !== 0 ? (box.width / box.height) : 0,
            isInViewport: this.isInViewport(box),
            coordinates: {
                topLeft: { x: box.x, y: box.y },
                topRight: { x: box.x + box.width, y: box.y },
                bottomLeft: { x: box.x, y: box.y + box.height },
                bottomRight: { x: box.x + box.width, y: box.y + box.height }
            }
        };
    }

    private getMetadata(element: ElementInfo): ElementMetadata {
        return {
            tagCategory: this.categorizeElement(element.tag),
            semanticMeaning: this.getSemanticMeaning(element.tag),
            commonUseCase: this.getCommonUseCase(element.tag),
            htmlSpec: this.getHtmlSpecInfo(element.tag),
            browserSupport: this.getBrowserSupport(element.tag)
        };
    }

    private generatePlaywrightSelectors(element: ElementInfo): PlaywrightSelectors {
        const selectors: string[] = [];
        
        if (element.id) {
            selectors.push(`page.locator('#${element.id}')`);
        }
        
        if (element.textContent) {
            selectors.push(`page.getByText('${element.textContent.substring(0, 50)}')`);
        }
        
        if (element.attributes.role) {
            selectors.push(`page.getByRole('${element.attributes.role}')`);
        }
        
        if (element.attributes['aria-label']) {
            selectors.push(`page.getByLabel('${element.attributes['aria-label']}')`);
        }
        
        selectors.push(`page.locator('${element.cssSelector}')`);
        
        return {
            recommended: selectors[0] || `page.locator('${element.cssSelector}')`,
            alternatives: selectors,
            waitFor: `await ${selectors[0] || `page.locator('${element.cssSelector}')`}.waitFor()`,
            click: `await ${selectors[0] || `page.locator('${element.cssSelector}')`}.click()`,
            text: element.textContent ? `await expect(${selectors[0]}).toHaveText('${element.textContent}')` : ''
        };
    }

    private generateCypressSelectors(element: ElementInfo): CypressSelectors {
        const selectors: string[] = [];
        
        if (element.id) {
            selectors.push(`cy.get('#${element.id}')`);
        }
        
        if (element.attributes['data-testid'] || element.attributes['data-cy']) {
            const testId = element.attributes['data-testid'] || element.attributes['data-cy'];
            selectors.push(`cy.get('[data-testid="${testId}"]')`);
        }
        
        if (element.textContent) {
            selectors.push(`cy.contains('${element.textContent.substring(0, 50)}')`);
        }
        
        selectors.push(`cy.get('${element.cssSelector}')`);
        
        return {
            recommended: selectors[0] || `cy.get('${element.cssSelector}')`,
            alternatives: selectors,
            click: `${selectors[0] || `cy.get('${element.cssSelector}')`}.click()`,
            type: element.tag === 'input' ? `${selectors[0]}.type('text')` : '',
            should: `${selectors[0]}.should('be.visible')`
        };
    }

    private generateSeleniumSelectors(element: ElementInfo): SeleniumSelectors {
        const selectors: string[] = [];
        
        if (element.id) {
            selectors.push(`driver.find_element(By.ID, '${element.id}')`);
        }
        
        if (element.classes.length > 0) {
            selectors.push(`driver.find_element(By.CLASS_NAME, '${element.classes[0]}')`);
        }
        
        selectors.push(`driver.find_element(By.CSS_SELECTOR, '${element.cssSelector}')`);
        selectors.push(`driver.find_element(By.XPATH, '${element.xpath}')`);
        
        return {
            recommended: selectors[0] || `driver.find_element(By.CSS_SELECTOR, '${element.cssSelector}')`,
            alternatives: selectors,
            click: `${selectors[0]}.click()`,
            sendKeys: element.tag === 'input' ? `${selectors[0]}.send_keys('text')` : '',
            getText: `${selectors[0]}.text`
        };
    }

    private generateAlternativeSelectors(element: ElementInfo): string[] {
        const alternatives: string[] = [];
        
        if (element.id) {
            alternatives.push(`#${element.id}`);
        }
        
        if (element.classes.length > 0) {
            alternatives.push(`.${element.classes.join('.')}`);
            alternatives.push(`.${element.classes[0]}`);
        }
        
        if (element.attributes.name) {
            alternatives.push(`[name="${element.attributes.name}"]`);
        }
        
        if (element.attributes.type) {
            alternatives.push(`${element.tag}[type="${element.attributes.type}"]`);
        }
        
        alternatives.push(element.tag);
        
        return alternatives;
    }

    private calculateSpecificity(selector: string): number {
        let specificity = 0;
        
        // Count IDs
        specificity += (selector.match(/#/g) || []).length * 100;
        
        // Count classes, attributes, pseudo-classes
        specificity += (selector.match(/\.|:|\[/g) || []).length * 10;
        
        // Count element names
        specificity += (selector.match(/\b[a-z]+\b/gi) || []).length;
        
        return specificity;
    }

    private assessSelectorReliability(element: ElementInfo): 'high' | 'medium' | 'low' {
        if (element.id) return 'high';
        if (element.classes.length > 0 && element.attributes.name) return 'high';
        if (element.classes.length > 0) return 'medium';
        if (element.attributes.name || element.attributes.type) return 'medium';
        return 'low';
    }

    private hasChildren(element: ElementInfo): boolean {
        // This would need to be determined during DOM capture
        // For now, assume elements with text content might have children
        return element.textContent.length > 0;
    }

    private isVisible(element: ElementInfo): boolean {
        const styles = element.computedStyles;
        return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
    }

    private categorizeElement(tag: string): ElementCategory {
        const categories: Record<string, ElementCategory> = {
            'div': 'container',
            'span': 'inline',
            'p': 'text',
            'h1': 'heading', 'h2': 'heading', 'h3': 'heading', 'h4': 'heading', 'h5': 'heading', 'h6': 'heading',
            'a': 'link',
            'img': 'media',
            'video': 'media',
            'audio': 'media',
            'input': 'form',
            'button': 'form',
            'select': 'form',
            'textarea': 'form',
            'form': 'form',
            'nav': 'navigation',
            'header': 'semantic',
            'footer': 'semantic',
            'article': 'semantic',
            'section': 'semantic',
            'aside': 'semantic',
            'main': 'semantic',
            'ul': 'list', 'ol': 'list', 'li': 'list',
            'table': 'table', 'tr': 'table', 'td': 'table', 'th': 'table'
        };
        
        return categories[tag] || 'other';
    }

    private isInteractiveElement(tag: string): boolean {
        return ['button', 'a', 'input', 'select', 'textarea', 'details', 'summary'].includes(tag);
    }

    private findAccessibilityIssues(element: ElementInfo): string[] {
        const issues: string[] = [];
        
        if (this.isInteractiveElement(element.tag) && !element.attributes['aria-label'] && !element.textContent) {
            issues.push('Interactive element lacks accessible name');
        }
        
        if (element.tag === 'img' && !element.attributes.alt) {
            issues.push('Image missing alt attribute');
        }
        
        if (element.tag === 'input' && element.attributes.type !== 'submit' && !element.attributes['aria-label'] && !element.attributes.placeholder) {
            issues.push('Form input lacks label');
        }
        
        return issues;
    }

    private isInViewport(box: BoundingBox): boolean {
        // Assuming standard viewport size - in real implementation, this would be dynamic
        return box.x >= 0 && box.y >= 0 && box.x + box.width <= 1280 && box.y + box.height <= 720;
    }

    private getSemanticMeaning(tag: string): string {
        const meanings: Record<string, string> = {
            'header': 'Represents introductory content',
            'nav': 'Navigation links',
            'main': 'Main content of the document',
            'article': 'Self-contained composition',
            'section': 'Thematic grouping of content',
            'aside': 'Content aside from main content',
            'footer': 'Footer for its nearest sectioning content',
            'h1': 'Most important heading',
            'h2': 'Second-level heading',
            'h3': 'Third-level heading',
            'p': 'Paragraph of text',
            'a': 'Hyperlink to another resource',
            'img': 'Embedded image',
            'button': 'Clickable button',
            'input': 'Input control'
        };
        
        return meanings[tag] || 'Generic element';
    }

    private getCommonUseCase(tag: string): string {
        const useCases: Record<string, string> = {
            'div': 'Layout container, styling wrapper',
            'span': 'Inline styling, small text modifications',
            'button': 'User actions, form submissions',
            'input': 'Data entry, user input',
            'a': 'Navigation, external links',
            'img': 'Visual content, illustrations',
            'p': 'Text content, paragraphs',
            'h1': 'Page title, main heading'
        };
        
        return useCases[tag] || 'Various purposes';
    }

    private getHtmlSpecInfo(tag: string): string {
        return `HTML ${this.getHtmlVersion(tag)} element`;
    }

    private getHtmlVersion(tag: string): string {
        const html5Elements = ['article', 'aside', 'footer', 'header', 'main', 'nav', 'section', 'figure', 'figcaption'];
        return html5Elements.includes(tag) ? '5' : '4/5';
    }

    private getBrowserSupport(tag: string): string {
        const html5Elements = ['article', 'aside', 'footer', 'header', 'main', 'nav', 'section'];
        if (html5Elements.includes(tag)) {
            return 'IE9+, All modern browsers';
        }
        return 'All browsers';
    }
}

// Type definitions for the analysis results
export interface ElementAnalysis {
    basic: BasicInfo;
    selectors: SelectorInfo;
    styling: StyleInfo;
    accessibility: AccessibilityInfo;
    positioning: PositioningInfo;
    metadata: ElementMetadata;
}

export interface BasicInfo {
    tag: string;
    id?: string | undefined;
    classes: string[];
    textContent: string;
    hasChildren: boolean;
    isVisible: boolean;
    elementType: ElementCategory;
}

export interface SelectorInfo {
    css: string;
    xpath: string;
    alternatives: string[];
    specificity: number;
    reliability: 'high' | 'medium' | 'low';
}

export interface StyleInfo {
    display: string;
    position: string;
    dimensions: { width: string; height: string };
    spacing: { margin: string; padding: string };
    colors: { background: string; color: string };
    typography: { fontSize: string; fontFamily: string };
    layout: { float: string; clear: string; overflow: string };
}

export interface AccessibilityInfo {
    role?: string | undefined;
    ariaLabel?: string | undefined;
    ariaDescribedBy?: string | undefined;
    tabIndex?: number | undefined;
    isInteractive: boolean;
    hasAccessibleName: boolean;
    issues: string[];
}

export interface PositioningInfo {
    boundingBox: BoundingBox;
    center: { x: number; y: number };
    area: number;
    aspectRatio: number;
    isInViewport: boolean;
    coordinates: {
        topLeft: { x: number; y: number };
        topRight: { x: number; y: number };
        bottomLeft: { x: number; y: number };
        bottomRight: { x: number; y: number };
    };
}

export interface ElementMetadata {
    tagCategory: ElementCategory;
    semanticMeaning: string;
    commonUseCase: string;
    htmlSpec: string;
    browserSupport: string;
}

export interface TestSelectors {
    playwright: PlaywrightSelectors;
    cypress: CypressSelectors;
    selenium: SeleniumSelectors;
}

export interface PlaywrightSelectors {
    recommended: string;
    alternatives: string[];
    waitFor: string;
    click: string;
    text: string;
}

export interface CypressSelectors {
    recommended: string;
    alternatives: string[];
    click: string;
    type: string;
    should: string;
}

export interface SeleniumSelectors {
    recommended: string;
    alternatives: string[];
    click: string;
    sendKeys: string;
    getText: string;
}

export type ElementCategory = 'container' | 'inline' | 'text' | 'heading' | 'link' | 'media' | 'form' | 'navigation' | 'semantic' | 'list' | 'table' | 'other';