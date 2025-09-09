export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ValidationUtils {
  /**
   * Validates if a string is a valid URL
   */
  public static isValidUrl(url: string): ValidationResult {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    try {
      const urlObj = new URL(url);

      // Check if it's a valid HTTP/HTTPS URL
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
      }

      // Check for localhost/development URLs
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' || urlObj.hostname === '0.0.0.0') {
        return { isValid: true };
      }

      // Basic domain validation
      if (!urlObj.hostname.includes('.')) {
        return { isValid: false, error: 'Invalid domain name' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Validates if a string is a valid CSS selector
   */
  public static isValidCssSelector(selector: string): ValidationResult {
    if (!selector || typeof selector !== 'string') {
      return { isValid: false, error: 'CSS selector is required' };
    }

    // Check for empty or whitespace-only selectors
    if (selector.trim().length === 0) {
      return { isValid: false, error: 'CSS selector cannot be empty' };
    }

    // Check for dangerous characters that could indicate XSS
    // Note: > is allowed as it's a valid CSS child combinator
    const dangerousChars = /[<{}]/;
    if (dangerousChars.test(selector)) {
      return { isValid: false, error: 'CSS selector contains invalid characters' };
    }

    // Check for potentially dangerous JavaScript in attribute selectors
    const dangerousJsPattern = /\[.*?(javascript|on\w+|eval|alert|confirm|prompt).*?\]/i;
    if (dangerousJsPattern.test(selector)) {
      return { isValid: false, error: 'CSS selector contains invalid characters' };
    }

    // For CSS selectors, we'll be more permissive and focus on blocking dangerous content
    // rather than trying to validate every possible valid CSS selector syntax
    // This allows for complex selectors while still blocking XSS attempts

    return { isValid: true };
  }

  /**
   * Validates if a string is a valid XPath expression
   */
  public static isValidXPath(xpath: string): ValidationResult {
    if (!xpath || typeof xpath !== 'string') {
      return { isValid: false, error: 'XPath is required' };
    }

    // Basic XPath validation
    if (!xpath.startsWith('/') && !xpath.startsWith('//') && !xpath.startsWith('.')) {
      return { isValid: false, error: 'XPath must start with /, //, or .' };
    }

    return { isValid: true };
  }

  /**
   * Validates element tag name
   */
  public static isValidTagName(tagName: string): ValidationResult {
    if (!tagName || typeof tagName !== 'string') {
      return { isValid: false, error: 'Tag name is required' };
    }

    // HTML tag name validation (including custom elements with hyphens)
    const validTagRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/i;
    if (!validTagRegex.test(tagName)) {
      return { isValid: false, error: 'Invalid tag name format' };
    }

    return { isValid: true };
  }

  /**
   * Validates CSS class name
   */
  public static isValidClassName(className: string): ValidationResult {
    if (!className || typeof className !== 'string') {
      return { isValid: false, error: 'Class name is required' };
    }

    // CSS class name validation
    const validClassRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
    if (!validClassRegex.test(className)) {
      return { isValid: false, error: 'Invalid class name format' };
    }

    return { isValid: true };
  }

  /**
   * Validates ID attribute
   */
  public static isValidId(id: string): ValidationResult {
    if (!id || typeof id !== 'string') {
      return { isValid: false, error: 'ID is required' };
    }

    // HTML ID validation
    const validIdRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
    if (!validIdRegex.test(id)) {
      return { isValid: false, error: 'Invalid ID format' };
    }

    return { isValid: true };
  }

  /**
   * Validates framework name for code generation
   */
  public static isValidFramework(framework: string): ValidationResult {
    const validFrameworks = ['react', 'vue', 'angular', 'vanilla', 'svelte', 'preact'];

    if (!framework || typeof framework !== 'string') {
      return { isValid: false, error: 'Framework is required' };
    }

    if (!validFrameworks.includes(framework.toLowerCase())) {
      return { isValid: false, error: `Unsupported framework. Supported: ${validFrameworks.join(', ')}` };
    }

    return { isValid: true };
  }

  /**
   * Validates code generation type
   */
  public static isValidCodeGenType(type: string): ValidationResult {
    const validTypes = ['component', 'test', 'selector', 'page-object', 'utility'];

    if (!type || typeof type !== 'string') {
      return { isValid: false, error: 'Code generation type is required' };
    }

    if (!validTypes.includes(type.toLowerCase())) {
      return { isValid: false, error: `Unsupported type. Supported: ${validTypes.join(', ')}` };
    }

    return { isValid: true };
  }

  /**
   * Validates viewport dimensions
   */
  public static isValidViewport(viewport: { width: number; height: number }): ValidationResult {
    if (!viewport || typeof viewport !== 'object') {
      return { isValid: false, error: 'Viewport is required' };
    }

    const { width, height } = viewport;

    if (typeof width !== 'number' || typeof height !== 'number') {
      return { isValid: false, error: 'Viewport width and height must be numbers' };
    }

    if (width <= 0 || height <= 0) {
      return { isValid: false, error: 'Viewport dimensions must be positive' };
    }

    if (width > 7680 || height > 4320) {
      return { isValid: false, error: 'Viewport dimensions are too large (max 7680x4320)' };
    }

    return { isValid: true };
  }

  /**
   * Validates timeout value
   */
  public static isValidTimeout(timeout: number): ValidationResult {
    if (typeof timeout !== 'number') {
      return { isValid: false, error: 'Timeout must be a number' };
    }

    if (timeout < 1000) {
      return { isValid: false, error: 'Timeout must be at least 1000ms' };
    }

    if (timeout > 300000) { // 5 minutes
      return { isValid: false, error: 'Timeout cannot exceed 5 minutes' };
    }

    return { isValid: true };
  }

  /**
   * Sanitizes and normalizes a URL
   */
  public static normalizeUrl(url: string): string {
    if (!url) return url;

    // Remove leading/trailing whitespace
    url = url.trim();

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Remove trailing slash unless it's the root path
    if (url.endsWith('/') && !url.endsWith('://')) {
      url = url.slice(0, -1);
    }

    return url;
  }

  /**
   * Validates Chrome extension permissions
   */
  public static validatePermissions(requestedPermissions: string[]): ValidationResult {
    const validPermissions = [
      'activeTab',
      'storage',
      'scripting',
      'tabs',
      'contextMenus',
      'notifications',
      'clipboardWrite'
    ];

    const hostPermissions = [
      'http://*/*',
      'https://*/*',
      'file://*/*'
    ];

    for (const permission of requestedPermissions) {
      if (!validPermissions.includes(permission) && !hostPermissions.some(hp => permission.match(hp.replace('*', '.*')))) {
        return { isValid: false, error: `Invalid permission: ${permission}` };
      }
    }

    return { isValid: true };
  }
}

