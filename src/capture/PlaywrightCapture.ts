import { chromium, firefox, webkit, Browser, BrowserContext, Page, ElementHandle } from 'playwright';
import { DOMSnapshot, CaptureOptions, ElementMetadata, BoundingBox } from '../types';
import { Logger } from '../utils/logger';
import { DomSerializer } from './DomSerializer';

export class PlaywrightCapture {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private readonly logger: Logger;
    private readonly domSerializer: DomSerializer;

    constructor() {
        this.logger = new Logger();
        this.domSerializer = new DomSerializer();
    }

    public async captureWebpage(url: string, options: CaptureOptions): Promise<DOMSnapshot> {
        this.logger.info('Starting webpage capture', { url, browser: options.browser });

        try {
            await this.initializeBrowser(options.browser);
            
            if (!this.context) {
                throw new Error('Browser context not initialized');
            }

            const page = await this.context.newPage();
            await this.setupPage(page, options);

            // Navigate to the URL
            this.logger.info('Navigating to URL', { url });
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: options.timeout 
            });

            // Wait for any specified selector
            if (options.waitForSelector) {
                this.logger.info('Waiting for selector', { selector: options.waitForSelector });
                await page.waitForSelector(options.waitForSelector, { timeout: 5000 });
            }

            // Additional wait for dynamic content
            await page.waitForTimeout(1000);

            // Capture DOM snapshot
            const snapshot = await this.createDOMSnapshot(page, url);
            
            this.logger.info('DOM snapshot created successfully', { 
                elements: snapshot.elements.length,
                htmlSize: snapshot.html.length 
            });

            return snapshot;

        } catch (error) {
            this.logger.error('Failed to capture webpage', error);
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    private async initializeBrowser(browserType: 'chromium' | 'firefox' | 'webkit'): Promise<void> {
        this.logger.info('Initializing browser', { browserType });

        try {
            switch (browserType) {
                case 'chromium':
                    this.browser = await chromium.launch({ headless: true });
                    break;
                case 'firefox':
                    this.browser = await firefox.launch({ headless: true });
                    break;
                case 'webkit':
                    this.browser = await webkit.launch({ headless: true });
                    break;
                default:
                    throw new Error(`Unsupported browser type: ${browserType}`);
            }

            this.context = await this.browser.newContext({
                viewport: { width: 1280, height: 720 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            });

        } catch (error) {
            this.logger.error('Failed to initialize browser', error);
            throw new Error(`Failed to launch ${browserType}: ${error}`);
        }
    }

    private async setupPage(page: Page, options: CaptureOptions): Promise<void> {
        // Set viewport
        await page.setViewportSize(options.viewport);

        // Block unnecessary resources for faster loading
        await page.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            if (['font', 'media'].includes(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        // Add error handling
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                this.logger.warn('Page console error', { message: msg.text() });
            }
        });

        page.on('pageerror', (error) => {
            this.logger.warn('Page error', { error: error.message });
        });
    }

    private async createDOMSnapshot(page: Page, url: string): Promise<DOMSnapshot> {
        this.logger.info('Creating DOM snapshot');

        // Get the full HTML
        const html = await page.content();
        
        // Get computed styles for the page
        const css = await this.extractStyles(page);
        
        // Take screenshot
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: false // Viewport only for better performance
        });

        // Get viewport size
        const viewport = page.viewportSize() || { width: 1280, height: 720 };

        // Extract element metadata
        const elements = await this.extractElementMetadata(page);

        return {
            html,
            css,
            url,
            timestamp: new Date(),
            viewport,
            elements,
            screenshot: screenshot.toString('base64')
        };
    }

    private async extractStyles(page: Page): Promise<string> {
        try {
            // Get all stylesheets and computed styles
            const styles = await page.evaluate(() => {
                const styleSheets: string[] = [];
                
                // Get external stylesheets
                Array.from(document.styleSheets).forEach(sheet => {
                    try {
                        if (sheet.href) {
                            // For external sheets, we'll capture the href
                            styleSheets.push(`/* External: ${sheet.href} */`);
                        }
                        
                        // Get rules from accessible sheets
                        if (sheet.cssRules) {
                            Array.from(sheet.cssRules).forEach(rule => {
                                styleSheets.push(rule.cssText);
                            });
                        }
                    } catch (e) {
                        // Cross-origin restrictions
                        styleSheets.push(`/* Blocked by CORS: ${sheet.href || 'inline'} */`);
                    }
                });

                // Get inline styles
                Array.from(document.querySelectorAll('style')).forEach(style => {
                    if (style.textContent) {
                        styleSheets.push(style.textContent);
                    }
                });

                return styleSheets.join('\n\n');
            });

            return styles;
        } catch (error) {
            this.logger.warn('Failed to extract styles', error);
            return '';
        }
    }

    private async extractElementMetadata(page: Page): Promise<ElementMetadata[]> {
        this.logger.info('Extracting element metadata');

        try {
            const elements = await page.evaluate(() => {
                const metadata: ElementMetadata[] = [];
                const walker = document.createTreeWalker(
                    document.body,
                    1, // NodeFilter.SHOW_ELEMENT
                    null
                );

                let node: any;
                while ((node = walker.nextNode())) {
                    const element = node;
                    
                    // Skip script and style elements
                    if (['SCRIPT', 'STYLE', 'META', 'LINK'].includes(element.tagName)) {
                        continue;
                    }

                    const rect = element.getBoundingClientRect();
                    
                    // Skip invisible elements
                    if (rect.width === 0 || rect.height === 0) {
                        continue;
                    }

                    // Generate CSS selector
                    const selector = this.generateCSSSelector(element);
                    
                    metadata.push({
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
                    });
                }

                return metadata;

                function generateCSSSelector(element: any): string {
                    if (element.id) {
                        return `#${element.id}`;
                    }

                    const path: string[] = [];
                    let current = element;

                    while (current && current.nodeType === 1) { // ELEMENT_NODE = 1
                        let selector = current.tagName.toLowerCase();
                        
                        if (current.classList.length > 0) {
                            selector += '.' + Array.from(current.classList).join('.');
                        }
                        
                        // Add nth-child if there are siblings
                        const parent = current.parentElement;
                        if (parent) {
                            const siblings = Array.from(parent.children).filter(
                                (child: any) => child.tagName === current.tagName
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
            });

            this.logger.info('Element metadata extracted', { count: elements.length });
            return elements;

        } catch (error) {
            this.logger.error('Failed to extract element metadata', error);
            return [];
        }
    }

    public async cleanup(): Promise<void> {
        try {
            if (this.context) {
                await this.context.close();
                this.context = null;
            }
            
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            
            this.logger.info('Playwright cleanup completed');
        } catch (error) {
            this.logger.error('Failed to cleanup Playwright resources', error);
        }
    }
}