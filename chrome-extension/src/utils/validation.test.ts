import { ValidationUtils } from './validation';

describe('ValidationUtils', () => {
  describe('isValidUrl', () => {
    it('should validate valid HTTP URLs', () => {
      const result = ValidationUtils.isValidUrl('https://example.com');
      expect(result.isValid).toBe(true);
    });

    it('should validate valid HTTPS URLs', () => {
      const result = ValidationUtils.isValidUrl('https://example.com/path');
      expect(result.isValid).toBe(true);
    });

    it('should validate localhost URLs', () => {
      const result = ValidationUtils.isValidUrl('http://localhost:3000');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const result = ValidationUtils.isValidUrl('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid URL format');
    });

    it('should reject empty strings', () => {
      const result = ValidationUtils.isValidUrl('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('URL is required');
    });

    it('should reject non-HTTP protocols', () => {
      const result = ValidationUtils.isValidUrl('ftp://example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must use HTTP or HTTPS');
    });
  });

  describe('isValidCssSelector', () => {
    it('should validate simple selectors', () => {
      const result = ValidationUtils.isValidCssSelector('.my-class');
      expect(result.isValid).toBe(true);
    });

    it('should validate ID selectors', () => {
      const result = ValidationUtils.isValidCssSelector('#my-id');
      expect(result.isValid).toBe(true);
    });

    it('should validate complex selectors', () => {
      const result = ValidationUtils.isValidCssSelector('div.container > .item:first-child');
      expect(result.isValid).toBe(true);
    });

    it('should reject dangerous characters', () => {
      const result = ValidationUtils.isValidCssSelector('div[onclick="alert(1)"]');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('invalid characters');
    });

    it('should reject empty selectors', () => {
      const result = ValidationUtils.isValidCssSelector('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('CSS selector is required');
    });
  });

  describe('isValidXPath', () => {
    it('should validate absolute XPath', () => {
      const result = ValidationUtils.isValidXPath('/html/body/div');
      expect(result.isValid).toBe(true);
    });

    it('should validate relative XPath', () => {
      const result = ValidationUtils.isValidXPath('//div[@class="container"]');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid XPath', () => {
      const result = ValidationUtils.isValidXPath('invalid-xpath');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must start with');
    });
  });

  describe('isValidTagName', () => {
    it('should validate standard HTML tags', () => {
      const result = ValidationUtils.isValidTagName('div');
      expect(result.isValid).toBe(true);
    });

    it('should validate custom elements', () => {
      const result = ValidationUtils.isValidTagName('my-component');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid tag names', () => {
      const result = ValidationUtils.isValidTagName('123invalid');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid tag name format');
    });
  });

  describe('isValidClassName', () => {
    it('should validate standard class names', () => {
      const result = ValidationUtils.isValidClassName('my-class');
      expect(result.isValid).toBe(true);
    });

    it('should validate class names with numbers', () => {
      const result = ValidationUtils.isValidClassName('class123');
      expect(result.isValid).toBe(true);
    });

    it('should validate class names with hyphens and underscores', () => {
      const result = ValidationUtils.isValidClassName('my_class-name');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid class names', () => {
      const result = ValidationUtils.isValidClassName('123invalid');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid class name format');
    });
  });

  describe('isValidId', () => {
    it('should validate standard IDs', () => {
      const result = ValidationUtils.isValidId('my-id');
      expect(result.isValid).toBe(true);
    });

    it('should validate IDs with numbers', () => {
      const result = ValidationUtils.isValidId('id123');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid IDs', () => {
      const result = ValidationUtils.isValidId('123invalid');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid ID format');
    });
  });

  describe('isValidFramework', () => {
    it('should validate supported frameworks', () => {
      const frameworks = ['react', 'vue', 'angular', 'vanilla', 'svelte', 'preact'];

      frameworks.forEach(framework => {
        const result = ValidationUtils.isValidFramework(framework);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject unsupported frameworks', () => {
      const result = ValidationUtils.isValidFramework('unsupported');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported framework');
    });

    it('should handle case insensitive validation', () => {
      const result = ValidationUtils.isValidFramework('REACT');
      expect(result.isValid).toBe(true);
    });
  });

  describe('isValidCodeGenType', () => {
    it('should validate supported code generation types', () => {
      const types = ['component', 'test', 'selector', 'page-object', 'utility'];

      types.forEach(type => {
        const result = ValidationUtils.isValidCodeGenType(type);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject unsupported types', () => {
      const result = ValidationUtils.isValidCodeGenType('unsupported');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported type');
    });
  });

  describe('isValidViewport', () => {
    it('should validate standard viewport sizes', () => {
      const result = ValidationUtils.isValidViewport({ width: 1920, height: 1080 });
      expect(result.isValid).toBe(true);
    });

    it('should reject zero dimensions', () => {
      const result = ValidationUtils.isValidViewport({ width: 0, height: 100 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be positive');
    });

    it('should reject negative dimensions', () => {
      const result = ValidationUtils.isValidViewport({ width: -100, height: 100 });
      expect(result.isValid).toBe(false);
    });

    it('should reject oversized dimensions', () => {
      const result = ValidationUtils.isValidViewport({ width: 10000, height: 10000 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too large');
    });
  });

  describe('isValidTimeout', () => {
    it('should validate reasonable timeouts', () => {
      const result = ValidationUtils.isValidTimeout(30000);
      expect(result.isValid).toBe(true);
    });

    it('should reject too short timeouts', () => {
      const result = ValidationUtils.isValidTimeout(500);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 1000ms');
    });

    it('should reject too long timeouts', () => {
      const result = ValidationUtils.isValidTimeout(400000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot exceed 5 minutes');
    });
  });

  describe('normalizeUrl', () => {
    it('should add https protocol when missing', () => {
      const result = ValidationUtils.normalizeUrl('example.com');
      expect(result).toBe('https://example.com');
    });

    it('should preserve existing protocols', () => {
      const result = ValidationUtils.normalizeUrl('http://example.com');
      expect(result).toBe('http://example.com');
    });

    it('should remove trailing slashes', () => {
      const result = ValidationUtils.normalizeUrl('https://example.com/');
      expect(result).toBe('https://example.com');
    });

    it('should handle localhost URLs', () => {
      const result = ValidationUtils.normalizeUrl('localhost:3000');
      expect(result).toBe('https://localhost:3000');
    });
  });

  describe('validatePermissions', () => {
    it('should validate standard Chrome permissions', () => {
      const permissions = ['activeTab', 'storage', 'scripting'];
      const result = ValidationUtils.validatePermissions(permissions);
      expect(result.isValid).toBe(true);
    });

    it('should validate host permissions', () => {
      const permissions = ['https://example.com/*'];
      const result = ValidationUtils.validatePermissions(permissions);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid permissions', () => {
      const permissions = ['invalid-permission'];
      const result = ValidationUtils.validatePermissions(permissions);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid permission');
    });
  });
});
