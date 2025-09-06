import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';
import { DOMSnapshot, CaptureOptions, ElementMetadata } from '../types';
import { Logger } from '../utils/logger';
import { eventBus } from '../utils/EventBus';

export class PlaywrightCapture {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private readonly logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  public async captureWebpage(url: string, options: CaptureOptions): Promise<DOMSnapshot> {
    this.logger.info('Starting webpage capture', { url, browser: options.browser });
    eventBus.emitCaptureRequested(url);

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
        timeout: options.timeout,
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
        htmlSize: snapshot.html.length,
      });

      eventBus.emitCaptureCompleted(snapshot);
      return snapshot;
    } catch (error) {
      this.logger.error('Failed to capture webpage', error);
      eventBus.emitCaptureFailed(error instanceof Error ? error : new Error(String(error)));
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
          throw new Error(`Unsupported browser type: ${String(browserType)}`);
      }

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      });
    } catch (error) {
      this.logger.error('Failed to initialize browser', error);
      throw new Error(`Failed to launch ${browserType}: ${String(error)}`);
    }
  }

  private async setupPage(page: Page, options: CaptureOptions): Promise<void> {
    // Set viewport
    await page.setViewportSize(options.viewport);

    // Allow fonts and essential resources, only block heavy media
    await page.route('**/*', async route => {
      const resourceType = route.request().resourceType();
      // Only block heavy video/audio, but allow fonts and images for proper rendering
      if (['media'].includes(resourceType)) {
        await route.abort();
      } else {
        await route.continue();
      }
    });

    // Add error handling
    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.logger.warn('Page console error', { message: msg.text() });
      }
    });

    page.on('pageerror', error => {
      this.logger.warn('Page error', { error: error.message });
    });
  }

  private async createDOMSnapshot(page: Page, url: string): Promise<DOMSnapshot> {
    this.logger.info('Creating DOM snapshot');

    // Wait for fonts to load for better visual accuracy
    try {
      await page.evaluate(() => {
        const doc = document as Document & { fonts?: { ready: Promise<void> } };
        return doc.fonts?.ready ?? Promise.resolve();
      });
    } catch (e) {
      // Ignore font loading errors, continue with capture
    }

    // Get the full HTML
    const html = await page.content();

    // Get computed styles for the page
    const css = await this.extractStyles(page);

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false, // Viewport only for better performance
    });

    // Get viewport size
    const viewport = page.viewportSize() ?? { width: 1280, height: 720 };

    // Extract element metadata
    const elements = await this.extractElementMetadata(page);

    return {
      html,
      css,
      url,
      timestamp: new Date(),
      viewport,
      elements,
      screenshot: screenshot.toString('base64'),
    };
  }

  private async extractStyles(page: Page): Promise<string> {
    try {
      // Get all stylesheets and computed styles
      const styles = await page.evaluate(async () => {
        const styleSheets: string[] = [];

        // Add base URL handling for relative URLs
        const baseUrl = document.baseURI || window.location.href;
        styleSheets.push(`/* Base URL: ${baseUrl} */`);

        // Get external stylesheets - try to fetch content instead of just linking
        const linkPromises: Promise<string>[] = [];
        Array.from(document.querySelectorAll('link[rel="stylesheet"]')).forEach(
          (linkElement: Element) => {
            const link = linkElement as HTMLLinkElement;
            if (link.href) {
              // Try to fetch the CSS content
              linkPromises.push(
                fetch(link.href)
                  .then(response => response.text())
                  .then(css => `/* External CSS from: ${link.href} */\n${css}`)
                  .catch(
                    (error: unknown) =>
                      `/* Could not load CSS from: ${link.href} - ${error instanceof Error ? error.message : String(error)} */`
                  )
              );
            }
          }
        );

        // Get rules from accessible sheets (both external and internal)
        Array.from(document.styleSheets).forEach(sheet => {
          try {
            if (sheet.cssRules) {
              const rules = Array.from(sheet.cssRules)
                .map(rule => rule.cssText)
                .join('\n');
              if (rules.trim()) {
                if (sheet.href) {
                  styleSheets.push(`/* Styles from: ${sheet.href} */\n${rules}`);
                } else {
                  styleSheets.push(`/* Inline styles */\n${rules}`);
                }
              }
            }
          } catch (e) {
            // Cross-origin restrictions
            if (sheet.href) {
              styleSheets.push(`/* Blocked by CORS: ${sheet.href} */`);
            }
          }
        });

        // Get inline styles from style tags
        Array.from(document.querySelectorAll('style')).forEach((style: HTMLStyleElement) => {
          if (style.textContent?.trim()) {
            styleSheets.push(style.textContent.trim());
          }
        });

        // Wait for external CSS to be fetched
        const externalCss = await Promise.all(linkPromises);
        styleSheets.push(...externalCss);

        // Add viewport meta tag content if exists
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          const content = (viewport as HTMLMetaElement).content;
          styleSheets.unshift(`/* Viewport: ${content} */`);
        }

        return styleSheets.join('\n\n');
      });

      // CSS will be handled by HTML processor uniformly, only extract raw styles here
      return styles;
    } catch (error) {
      this.logger.warn('Failed to extract styles', { error });
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

        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (!(node instanceof Element)) {
            continue;
          }
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
          const selector = generateCSSSelector(element);

          metadata.push({
            selector,
            boundingBox: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
            tag: element.tagName.toLowerCase(),
            ...(element.id ? { id: element.id } : {}),
            classes: Array.from(element.classList),
          });
        }

        return metadata;

        function generateCSSSelector(element: Element): string {
          if (element.id) {
            return `#${element.id}`;
          }

          const path: string[] = [];
          let current: Element | null = element;

          while (current && current.nodeType === 1) {
            // ELEMENT_NODE = 1
            let selector = current.tagName.toLowerCase();

            if (current.classList.length > 0) {
              selector += '.' + Array.from(current.classList).join('.');
            }

            // Add nth-child if there are siblings
            const parent = current.parentElement;
            if (parent) {
              const currentElement = current; // TypeScript null check helper
              const siblings = Array.from(parent.children).filter(
                (child: Element) => child.tagName === currentElement.tagName
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

  public async captureDOM(url: string, options: CaptureOptions): Promise<DOMSnapshot> {
    return this.captureWebpage(url, options);
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
