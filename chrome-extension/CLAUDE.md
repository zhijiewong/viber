# Claude AI Integration Guide

## DOM Agent Chrome Extension

*Professional AI-Powered DOM Inspection and Code Generation*

---

## Table of Contents

- [Overview](#overview)
- [Claude AI Integration](#claude-ai-integration)
- [Architecture](#architecture)
- [API Configuration](#api-configuration)
- [Core Features](#core-features)
- [Implementation Details](#implementation-details)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License & Attribution](#license--attribution)

---

## Overview

DOM Agent is a sophisticated Chrome Extension that leverages Claude AI to provide intelligent DOM inspection and automated code generation capabilities. Built with modern web technologies and following Chrome Extension Manifest V3 standards, it offers developers a seamless experience for analyzing web pages and generating high-quality code.

### Key Capabilities

- **Intelligent Element Analysis**: Claude AI analyzes DOM elements and their context
- **Context-Aware Code Generation**: Generates framework-specific code with proper structure
- **Natural Language Processing**: Understands user intent and generates relevant code
- **Real-time DOM Inspection**: Live analysis with AI-powered insights
- **Multi-Framework Support**: React, Vue, Angular, Svelte, and Vanilla JavaScript

---

## Claude AI Integration

### Integration Architecture

The extension integrates Claude AI through multiple layers:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Content Script│    │ Background      │    │ Claude AI API   │
│   (DOM Capture) │◄──►│ Service Worker  │◄──►│ (Anthropic)     │
│                 │    │ (API Gateway)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Popup UI      │    │ DevTools Panel  │    │ Response        │
│   (User Input)  │    │ (Advanced UI)   │    │ Processing      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Claude API Endpoints

#### Primary Endpoints
- **Code Generation**: `/v1/messages` with code generation prompts
- **Element Analysis**: `/v1/messages` with DOM analysis prompts
- **Selector Optimization**: `/v1/messages` with selector improvement prompts

#### Request Structure
```typescript
interface ClaudeRequest {
  model: 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';
  max_tokens: number;
  temperature: number;
  system: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

#### Response Structure
```typescript
interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

---

## Architecture

### Component Architecture

```
src/
├── background/
│   ├── claude-service.ts      # Claude AI API integration
│   ├── api-client.ts         # HTTP client for API calls
│   ├── rate-limiter.ts       # API rate limiting
│   └── cache-manager.ts      # Response caching
├── content/
│   ├── dom-analyzer.ts       # DOM element analysis
│   ├── context-extractor.ts  # Context information extraction
│   └── claude-processor.ts   # Claude response processing
├── popup/
│   ├── claude-settings.tsx   # Claude configuration UI
│   └── code-preview.tsx      # Generated code display
├── devtools/
│   ├── claude-panel.tsx      # DevTools Claude integration
│   └── analysis-view.tsx     # Advanced analysis interface
└── utils/
    ├── prompt-builder.ts     # Claude prompt construction
    ├── response-parser.ts    # Claude response parsing
    └── token-counter.ts      # Token usage tracking
```

### Data Flow

1. **User Interaction** → Content Script captures DOM element
2. **Context Extraction** → Element metadata and surrounding context
3. **Prompt Construction** → Build optimized Claude prompt
4. **API Request** → Send to Claude API with rate limiting
5. **Response Processing** → Parse and format Claude response
6. **UI Update** → Display generated code to user

---

## API Configuration

### Environment Setup

#### Required Environment Variables
```bash
# .env file
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_BASE_URL=https://api.anthropic.com
CLAUDE_MODEL=claude-3-sonnet-20240229
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.7
```

#### Chrome Storage Configuration
```typescript
interface ClaudeConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retryAttempts: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}
```

### Model Selection

#### Available Models
- **Claude 3 Opus**: Most capable model for complex code generation
- **Claude 3 Sonnet**: Balanced performance and speed (recommended)
- **Claude 3 Haiku**: Fastest model for simple tasks

#### Model Configuration
```typescript
const MODEL_CONFIGS = {
  'claude-3-opus-20240229': {
    maxTokens: 4096,
    contextWindow: 200000,
    costPerToken: 0.000015,
    recommended: false
  },
  'claude-3-sonnet-20240229': {
    maxTokens: 4096,
    contextWindow: 200000,
    costPerToken: 0.000003,
    recommended: true
  },
  'claude-3-haiku-20240307': {
    maxTokens: 4096,
    contextWindow: 200000,
    costPerToken: 0.00000025,
    recommended: false
  }
};
```

---

## Core Features

### 1. Intelligent Code Generation

#### Framework-Specific Generation
```typescript
// React Component Generation
const reactPrompt = `
Generate a React functional component for this DOM element:
Element: <button class="btn btn-primary">Click me</button>
Context: This is a primary action button in a form
Requirements: Use hooks, proper TypeScript types, accessibility
`;

// Vue Component Generation
const vuePrompt = `
Generate a Vue 3 Composition API component for this element:
Element: <div class="card"><h3>Title</h3><p>Content</p></div>
Context: This is a reusable card component
Requirements: Use <script setup>, proper TypeScript, scoped styles
`;
```

#### Code Quality Optimization
- **TypeScript Integration**: Generate type-safe code
- **Best Practices**: Follow framework conventions
- **Accessibility**: Include ARIA attributes when relevant
- **Performance**: Optimize for rendering performance
- **Error Handling**: Include proper error boundaries

### 2. DOM Element Analysis

#### Element Context Extraction
```typescript
interface ElementContext {
  element: {
    tagName: string;
    attributes: Record<string, string>;
    textContent: string;
    boundingRect: DOMRect;
    computedStyles: Record<string, string>;
  };
  siblings: Array<{
    tagName: string;
    classes: string[];
    relationship: 'previous' | 'next';
  }>;
  parent: {
    tagName: string;
    classes: string[];
    id?: string;
  };
  children: Array<{
    tagName: string;
    classes: string[];
    textContent?: string;
  }>;
}
```

#### Semantic Analysis
- **Element Purpose**: Determine if it's a button, input, navigation, etc.
- **Layout Context**: Understand positioning and layout relationships
- **Content Structure**: Analyze text content and structure
- **Interactive Elements**: Identify click handlers and interactions

### 3. Selector Optimization

#### Smart Selector Generation
```typescript
const selectorStrategies = [
  {
    name: 'ID-based',
    priority: 10,
    generator: (element: Element) => `#${element.id}`
  },
  {
    name: 'Data-attribute',
    priority: 9,
    generator: (element: Element) => `[data-testid="${element.dataset.testid}"]`
  },
  {
    name: 'Class-based',
    priority: 8,
    generator: (element: Element) => `.${element.className.split(' ').join('.')}`
  },
  {
    name: 'Structural',
    priority: 7,
    generator: (element: Element) => generateStructuralSelector(element)
  }
];
```

#### Robustness Scoring
- **Stability**: How likely is the selector to break?
- **Specificity**: How unique is the selector?
- **Performance**: How fast is the selector?
- **Readability**: How easy is it to understand?

---

## Implementation Details

### Claude Service Layer

#### API Client Implementation
```typescript
class ClaudeService {
  private apiKey: string;
  private baseUrl: string;
  private rateLimiter: RateLimiter;
  private cache: CacheManager;

  async generateCode(context: ElementContext, framework: string): Promise<CodeResult> {
    const prompt = this.buildCodeGenerationPrompt(context, framework);
    const cacheKey = this.generateCacheKey(prompt);

    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // Rate limiting
    await this.rateLimiter.waitForSlot();

    try {
      const response = await this.makeAPIRequest(prompt);
      const result = this.processResponse(response);

      // Cache the result
      await this.cache.set(cacheKey, result, CACHE_TTL);

      return result;
    } catch (error) {
      this.handleAPIError(error);
      throw error;
    }
  }

  private async makeAPIRequest(prompt: string): Promise<ClaudeResponse> {
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: this.buildSystemPrompt(),
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }

    return response.json();
  }
}
```

### Prompt Engineering

#### System Prompts
```typescript
const SYSTEM_PROMPTS = {
  codeGeneration: `
You are an expert frontend developer specializing in clean, maintainable code.
Generate production-ready code that follows best practices and modern standards.
Consider accessibility, performance, and maintainability in your implementations.
`,

  selectorOptimization: `
You are a CSS selector expert focused on creating robust, maintainable selectors.
Prioritize stability and performance while maintaining readability.
Consider the DOM structure and potential changes when creating selectors.
`,

  elementAnalysis: `
You are a web accessibility and UX expert analyzing DOM elements.
Provide insights about element purpose, accessibility compliance, and user experience.
Suggest improvements for better usability and accessibility.
`
};
```

#### Context-Aware Prompts
```typescript
function buildCodeGenerationPrompt(context: ElementContext, framework: string): string {
  return `
Element Information:
- Tag: ${context.element.tagName}
- Classes: ${context.element.attributes.class || 'none'}
- Text: "${context.element.textContent?.slice(0, 100)}"
- Parent: ${context.parent.tagName}${context.parent.classes ? ` (${context.parent.classes})` : ''}

Context:
- Siblings: ${context.siblings.length} siblings
- Children: ${context.children.length} children
- Position: ${context.element.boundingRect.x}, ${context.element.boundingRect.y}

Generate a ${framework} component for this element with:
1. Proper TypeScript types
2. Accessibility attributes
3. Responsive design considerations
4. Error handling
5. Clean, readable code structure

Framework: ${framework}
  `.trim();
}
```

### Response Processing

#### Code Extraction and Formatting
```typescript
class ResponseProcessor {
  extractCode(response: ClaudeResponse): string {
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract code blocks from markdown
    const codeBlocks = content.text.match(/```[\w]*\n([\s\S]*?)\n```/g);
    if (!codeBlocks) {
      return this.cleanCode(content.text);
    }

    // Use the largest code block
    return codeBlocks
      .map(block => block.replace(/```[\w]*\n|\n```/g, ''))
      .sort((a, b) => b.length - a.length)[0];
  }

  cleanCode(code: string): string {
    return code
      .replace(/^\s*[\r\n]+/gm, '') // Remove empty lines at start
      .replace(/\s*[\r\n]+$/gm, '') // Remove empty lines at end
      .trim();
  }

  validateCode(code: string, framework: string): ValidationResult {
    // Basic syntax validation
    // Framework-specific validation
    // Import statement validation
    // TypeScript validation
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}
```

---

## Security Considerations

### API Key Management

#### Secure Storage
```typescript
class SecureStorage {
  private encryptionKey: string;

  async storeAPIKey(key: string): Promise<void> {
    const encrypted = await this.encrypt(key);
    await chrome.storage.local.set({ claudeApiKey: encrypted });
  }

  async getAPIKey(): Promise<string | null> {
    const result = await chrome.storage.local.get(['claudeApiKey']);
    if (!result.claudeApiKey) return null;

    return this.decrypt(result.claudeApiKey);
  }

  private async encrypt(text: string): Promise<string> {
    // Web Crypto API encryption
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const key = await this.getEncryptionKey();

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) },
      key,
      data
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }
}
```

#### Content Security Policy
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'",
    "sandbox": "sandbox allow-scripts allow-forms allow-popups allow-modals"
  }
}
```

### Input Validation

#### Prompt Sanitization
```typescript
class PromptSanitizer {
  sanitizeUserInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/javascript:/gi, '') // Remove JavaScript URLs
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .trim();
  }

  validateElementContext(context: ElementContext): boolean {
    // Validate element properties
    if (!context.element.tagName) return false;
    if (context.element.textContent?.length > 10000) return false;

    // Validate parent/child relationships
    if (context.children.length > 100) return false;

    return true;
  }
}
```

---

## Performance Optimization

### Caching Strategy

#### Multi-Level Caching
```typescript
class CacheManager {
  private memoryCache: Map<string, CacheEntry>;
  private storageCache: chrome.storage.StorageArea;

  constructor() {
    this.memoryCache = new Map();
    this.storageCache = chrome.storage.local;
  }

  async get(key: string): Promise<any | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data;
    }

    // Check storage cache
    const storageResult = await this.storageCache.get([key]);
    const storageEntry = storageResult[key];
    if (storageEntry && !this.isExpired(storageEntry)) {
      // Update memory cache
      this.memoryCache.set(key, storageEntry);
      return storageEntry.data;
    }

    return null;
  }

  async set(key: string, data: any, ttl: number): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Update both caches
    this.memoryCache.set(key, entry);
    await this.storageCache.set({ [key]: entry });
  }
}
```

### Rate Limiting

#### Token Bucket Implementation
```typescript
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private maxTokens: number;
  private refillRate: number;

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkTokens = () => {
        this.refill();
        if (this.tokens > 0) {
          this.tokens--;
          resolve();
        } else {
          setTimeout(checkTokens, 100); // Check again in 100ms
        }
      };
      checkTokens();
    });
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed * this.refillRate);

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
```

### Response Streaming

#### Progressive Response Handling
```typescript
class StreamingProcessor {
  async processStreamingResponse(response: Response): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body not readable');

    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              // Emit partial result for real-time updates
              this.emit('partial', fullContent);
            }
          } catch (error) {
            // Handle parsing errors
          }
        }
      }
    }

    return fullContent;
  }
}
```

---

## Error Handling

### Comprehensive Error Types

#### API Errors
```typescript
class APIError extends Error {
  constructor(public status: number, public message: string, public retryable: boolean = false) {
    super(message);
    this.name = 'APIError';
  }
}

class RateLimitError extends APIError {
  constructor(public resetTime: number) {
    super(429, 'Rate limit exceeded', true);
    this.name = 'RateLimitError';
  }
}

class AuthenticationError extends APIError {
  constructor() {
    super(401, 'Invalid API key', false);
    this.name = 'AuthenticationError';
  }
}
```

#### Error Recovery Strategies
```typescript
class ErrorHandler {
  async handleError(error: Error, context: any): Promise<any> {
    // Log the error
    this.logError(error, context);

    // Determine recovery strategy
    if (error instanceof RateLimitError) {
      return this.handleRateLimit(error);
    }

    if (error instanceof AuthenticationError) {
      return this.handleAuthError(error);
    }

    if (error instanceof APIError && error.retryable) {
      return this.retryWithBackoff(error, context);
    }

    // Show user-friendly error message
    this.showUserError(error);
  }

  private async retryWithBackoff(error: APIError, context: any, maxRetries: number = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        return await this.retryOperation(context);
      } catch (retryError) {
        if (attempt === maxRetries) throw retryError;
      }
    }
  }
}
```

---

## Development Guidelines

### Code Style

#### TypeScript Standards
```typescript
// Use strict TypeScript settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### Naming Conventions
```typescript
// Classes: PascalCase
class ClaudeService { }

// Interfaces: PascalCase with I prefix for clarity
interface IClaudeConfig { }

// Functions: camelCase
function processClaudeResponse() { }

// Constants: UPPER_SNAKE_CASE
const MAX_TOKENS = 4096;

// Private members: camelCase with underscore prefix
private _apiKey: string;
```

### Testing Strategy

#### Unit Tests
```typescript
describe('ClaudeService', () => {
  let service: ClaudeService;
  let mockAPI: jest.Mocked<APIClient>;

  beforeEach(() => {
    mockAPI = {
      makeRequest: jest.fn()
    };
    service = new ClaudeService(mockAPI);
  });

  it('should generate code successfully', async () => {
    const context = createMockElementContext();
    const expectedCode = '<button>Click me</button>';

    mockAPI.makeRequest.mockResolvedValue({
      content: [{ type: 'text', text: expectedCode }]
    });

    const result = await service.generateCode(context, 'react');

    expect(result.code).toBe(expectedCode);
    expect(mockAPI.makeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-3-sonnet-20240229'
      })
    );
  });
});
```

#### Integration Tests
```typescript
describe('Claude Integration', () => {
  it('should handle real API responses', async () => {
    const service = new ClaudeService({
      apiKey: process.env.CLAUDE_API_KEY
    });

    const context = {
      element: {
        tagName: 'button',
        textContent: 'Submit',
        attributes: { class: 'btn btn-primary' }
      }
    };

    const result = await service.generateCode(context, 'react');

    expect(result).toHaveProperty('code');
    expect(result).toHaveProperty('language', 'typescript');
    expect(result.code).toContain('React');
  });
});
```

---

## Testing

### Test Categories

#### 1. Unit Tests
- **Service Layer**: ClaudeService, APIClient, CacheManager
- **Utility Functions**: PromptBuilder, ResponseParser, TokenCounter
- **Error Handling**: ErrorHandler, RetryLogic

#### 2. Integration Tests
- **API Integration**: Real Claude API calls (with mocking)
- **Chrome Extension APIs**: Storage, Messaging, Tabs
- **DOM Manipulation**: Element selection and analysis

#### 3. End-to-End Tests
- **User Workflows**: Complete code generation flow
- **Extension Loading**: Manifest validation and loading
- **Cross-Browser**: Chrome compatibility testing

### Test Setup

#### Jest Configuration
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Test Utilities
```typescript
// Mock Chrome APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    },
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  }
};

// Mock Claude API
jest.mock('./api-client', () => ({
  APIClient: jest.fn().mockImplementation(() => ({
    makeRequest: jest.fn()
  }))
}));
```

---

## Deployment

### Build Process

#### Production Build
```bash
# Clean and build
npm run clean
npm run build:prod

# Validate build
npm run validate-build

# Package for distribution
npm run package
```

#### Build Validation
```typescript
class BuildValidator {
  validateManifest(): boolean {
    const manifest = require('../public/manifest.json');

    // Check required fields
    if (!manifest.name || !manifest.version) return false;

    // Validate permissions
    const requiredPermissions = ['activeTab', 'storage'];
    const hasRequiredPermissions = requiredPermissions.every(perm =>
      manifest.permissions?.includes(perm)
    );

    return hasRequiredPermissions;
  }

  validateBuildOutput(): boolean {
    const requiredFiles = [
      'manifest.json',
      'background.js',
      'content.js',
      'popup.html'
    ];

    return requiredFiles.every(file =>
      fs.existsSync(path.join('dist', file))
    );
  }
}
```

### Chrome Web Store Submission

#### Pre-Submission Checklist
- [ ] API keys removed from source code
- [ ] Console logs removed or conditional
- [ ] Source maps generated for debugging
- [ ] Privacy policy included
- [ ] Terms of service documented
- [ ] Screenshots and descriptions ready
- [ ] Test accounts for API access

#### Store Listing
```json
{
  "name": "DOM Agent - AI Code Generator",
  "description": "Intelligent DOM inspection and AI-powered code generation for developers",
  "detailed_description": "Transform any webpage element into production-ready code...",
  "category": "developer_tools",
  "languages": ["en"],
  "screenshots": [
    {
      "filename": "screenshot1.png",
      "description": "Main interface showing element inspection"
    }
  ]
}
```

---

## Troubleshooting

### Common Issues

#### API Connection Problems
```typescript
// Check API connectivity
async function diagnoseAPIConnection(): Promise<void> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'test-key'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      })
    });

    if (response.status === 401) {
      console.log('❌ Invalid API key');
    } else if (response.status === 429) {
      console.log('❌ Rate limit exceeded');
    } else {
      console.log('✅ API connection successful');
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}
```

#### Rate Limiting Issues
```typescript
// Monitor API usage
class UsageMonitor {
  private requests: number[] = [];

  trackRequest(): void {
    const now = Date.now();
    this.requests.push(now);

    // Remove requests older than 1 minute
    this.requests = this.requests.filter(
      timestamp => now - timestamp < 60000
    );
  }

  getRequestsPerMinute(): number {
    return this.requests.length;
  }

  isRateLimited(): boolean {
    return this.getRequestsPerMinute() > 50; // Claude's rate limit
  }
}
```

#### Element Analysis Failures
```typescript
// Debug element context extraction
function debugElementAnalysis(element: Element): void {
  console.log('Element Analysis Debug:', {
    tagName: element.tagName,
    id: element.id,
    className: element.className,
    attributes: Array.from(element.attributes).map(attr => ({
      name: attr.name,
      value: attr.value
    })),
    textContent: element.textContent?.slice(0, 100),
    boundingRect: element.getBoundingClientRect(),
    computedStyle: window.getComputedStyle(element)
  });
}
```

### Debug Tools

#### Console Commands
```javascript
// Available in Chrome DevTools Console
window.domAgent = {
  // Test Claude API connection
  testAPI: () => diagnoseAPIConnection(),

  // Clear all caches
  clearCache: () => {
    chrome.storage.local.clear();
    console.log('Cache cleared');
  },

  // Get current settings
  getSettings: () => chrome.storage.sync.get(null),

  // Enable verbose logging
  enableDebug: () => localStorage.setItem('dom-agent-debug', 'true'),

  // Disable verbose logging
  disableDebug: () => localStorage.removeItem('dom-agent-debug')
};
```

---

## Contributing

### Development Workflow

#### 1. Fork and Clone
```bash
git clone https://github.com/your-username/dom-agent-chrome.git
cd dom-agent-chrome
npm install
```

#### 2. Create Feature Branch
```bash
git checkout -b feature/claude-integration-improvements
```

#### 3. Development Setup
```bash
# Start development server
npm run dev

# Run tests
npm test

# Build and validate
npm run build
npm run validate-build
```

#### 4. Code Quality
```bash
# Lint code
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Test coverage
npm run test:coverage
```

#### 5. Submit Changes
```bash
# Commit changes
git add .
git commit -m "feat: improve Claude integration with better error handling"

# Push and create PR
git push origin feature/claude-integration-improvements
```

### Code Review Guidelines

#### Claude Integration Changes
- [ ] API error handling is comprehensive
- [ ] Rate limiting is properly implemented
- [ ] Caching strategy is efficient
- [ ] Security measures are in place
- [ ] TypeScript types are accurate
- [ ] Tests cover edge cases
- [ ] Documentation is updated

#### Pull Request Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance impact assessed

## Security
- [ ] No sensitive data exposed
- [ ] API keys properly handled
- [ ] Input validation implemented
- [ ] Rate limiting in place

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Security review passed
```

---

## License & Attribution

### License
This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.

### Attribution

#### Claude AI
This extension integrates with Claude AI, developed by Anthropic. All Claude-related functionality is subject to Anthropic's terms of service and usage policies.

```text
Claude is a product of Anthropic PBC
https://www.anthropic.com/claude
```

#### Third-Party Libraries
- **React**: MIT License
- **TypeScript**: Apache License 2.0
- **Chrome Extension APIs**: Google Chrome License

### Disclaimer
```text
This extension is not affiliated with or endorsed by Anthropic PBC.
Claude AI integration is provided as-is and may be subject to
API changes, rate limits, or service interruptions by Anthropic.
```

---

## Support

### Getting Help

#### Documentation
- [Full Documentation](https://heviber.org/docs)
- [API Reference](https://heviber.org/api)
- [Troubleshooting Guide](https://heviber.org/troubleshooting)

#### Community Support
- [GitHub Issues](https://github.com/your-username/dom-agent-chrome/issues)
- [GitHub Discussions](https://github.com/your-username/dom-agent-chrome/discussions)
- [Discord Community](https://discord.gg/dom-agent)

#### Professional Support
- Email: support@heviber.org
- Enterprise: enterprise@heviber.org

### Reporting Issues

#### Bug Reports
Please include:
- Chrome version and OS
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console logs (if applicable)

#### Feature Requests
Please include:
- Use case description
- Current workaround (if any)
- Mockups or examples (if applicable)
- Priority level

---

*This documentation is maintained by the DOM Agent development team and is subject to updates as the project evolves.*
