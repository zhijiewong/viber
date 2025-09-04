# Contributing to DOM Agent

Thank you for your interest in contributing to DOM Agent! 🎉

This document provides guidelines and information for contributors. Whether you're fixing bugs, adding features, improving documentation, or helping with testing, your contributions are welcome and appreciated.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)
- [Community](#community)

## 🤝 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **VS Code** or **Cursor IDE** 1.73.0+
- **Git** for version control
- Basic knowledge of TypeScript and VS Code extensions

### Development Setup

1. **Fork and Clone:**
   ```bash
   git clone https://github.com/your-username/dom-agent.git
   cd dom-agent
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set up Development Environment:**
   ```bash
   # Start development build with watch mode
   npm run watch
   ```

4. **Launch Extension Development Host:**
   - Open the project in Cursor IDE
   - Press `F5` to launch Extension Development Host
   - Test your changes in the new window

## 🔄 Development Workflow

### 1. Choose an Issue

- Check [GitHub Issues](https://github.com/your-username/dom-agent/issues) for open tasks
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/issue-number-description
```

### 3. Make Your Changes

- Follow the [Coding Standards](#coding-standards)
- Write tests for new functionality
- Update documentation if needed
- Ensure all tests pass

### 4. Commit Your Changes

Use conventional commit format:

```bash
# For features
git commit -m "feat: add new DOM element highlighting feature"

# For bug fixes
git commit -m "fix: resolve XPath generation issue in Firefox"

# For documentation
git commit -m "docs: update installation instructions"

# For refactoring
git commit -m "refactor: simplify HTML processing logic"
```

### 5. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

## 💻 Coding Standards

### TypeScript Guidelines

- **Strict Type Checking**: All code must pass TypeScript's strict mode
- **Interface Definitions**: Use interfaces for complex object types
- **Type Guards**: Implement proper type guards for runtime type checking
- **Generic Types**: Use generics appropriately to ensure type safety

```typescript
// ✅ Good: Proper typing
interface ElementInfo {
  tag: string;
  classes: string[];
  attributes: Record<string, string>;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// ❌ Bad: Using any
function processElement(element: any) {
  // ...
}
```

### Code Style

- **ESLint Compliance**: All code must pass ESLint checks
- **Consistent Naming**: Use camelCase for variables/functions, PascalCase for classes
- **Descriptive Names**: Choose meaningful, descriptive variable and function names
- **Single Responsibility**: Each function/class should have a single, clear purpose

```typescript
// ✅ Good: Descriptive and focused
export class ElementSelector {
  private generateCSSSelector(element: HTMLElement): string {
    // Single responsibility: generate CSS selector
  }

  private generateXPath(element: HTMLElement): string {
    // Single responsibility: generate XPath
  }
}

// ❌ Bad: Multiple responsibilities in one function
function processElement(element: HTMLElement): void {
  // Generate selector, update UI, save to database...
}
```

### Error Handling

- **Try-Catch Blocks**: Use appropriate error handling
- **Custom Errors**: Create custom error classes for specific scenarios
- **Logging**: Use the centralized logger for all logging needs
- **User-Friendly Messages**: Provide clear error messages for users

```typescript
// ✅ Good: Proper error handling
try {
  const result = await this.captureWebpage(url);
  return result;
} catch (error) {
  this.logger.error('Failed to capture webpage', { url, error });
  throw new CaptureError(`Unable to capture webpage: ${url}`);
}
```

### Performance Considerations

- **Efficient DOM Queries**: Use efficient selectors and minimize DOM traversals
- **Memory Management**: Clean up event listeners and resources properly
- **Async Operations**: Use async/await consistently for asynchronous operations
- **Bundle Size**: Be mindful of dependencies and their impact on bundle size

## 🧪 Testing Guidelines

### Test Coverage

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows
- **Minimum Coverage**: Maintain 80%+ code coverage

### Testing Best Practices

```typescript
// ✅ Good: Comprehensive test with edge cases
describe('ElementSelector', () => {
  describe('generateCSSSelector', () => {
    it('should generate ID selector for element with unique ID', () => {
      const element = createMockElement('<div id="unique-id"></div>');
      const selector = selector.generateCSSSelector(element);
      expect(selector).toBe('#unique-id');
    });

    it('should generate class selector when ID is not unique', () => {
      // Test implementation
    });

    it('should handle elements with special characters in attributes', () => {
      // Test edge cases
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/utils/validation.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 Documentation

### Documentation Standards

- **README Updates**: Keep README.md current with new features
- **Code Comments**: Add JSDoc comments for public APIs
- **Inline Comments**: Explain complex logic with clear comments
- **API Documentation**: Document all public interfaces and types

### Documentation Structure

```
docs/
├── user-guide.md          # User-facing documentation
├── api-reference.md       # Technical API documentation
├── configuration.md       # Configuration options
├── troubleshooting.md     # Common issues and solutions
└── architecture.md        # System architecture overview
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Clear Title**: Summarize the issue concisely
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, VS Code version, Node.js version
- **Screenshots/Logs**: If applicable

### Feature Requests

For feature requests, include:

- **Use Case**: Describe the problem you're trying to solve
- **Proposed Solution**: Your suggested implementation
- **Alternatives**: Other solutions you've considered
- **Mockups**: Visual representations if applicable

## 🎯 Pull Request Process

### Before Submitting

1. **Self-Review**: Check your code against the coding standards
2. **Tests Pass**: Ensure all tests pass and coverage is maintained
3. **Documentation**: Update docs for any API changes
4. **Linting**: Run ESLint and fix any issues

### PR Template

Please use the following template for pull requests:

```markdown
## Description
Brief description of the changes made

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Peer Review**: At least one maintainer reviews the PR
3. **Approval**: PR is approved and merged
4. **Release**: Changes are included in the next release

## 🌍 Community

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and community discussion
- **Email**: contact@dom-agent.dev for direct communication

### Getting Help

- **Documentation**: Check the [docs](docs/) folder first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Ask the community for help

### Recognition

Contributors are recognized in:
- **CHANGELOG.md**: Release notes
- **Contributors List**: In repository README
- **GitHub Contributors**: Automatic GitHub recognition

## 📄 License

By contributing to DOM Agent, you agree that your contributions will be licensed under the same license as the project (Apache License 2.0).

## 🙏 Thank You

Your contributions help make DOM Agent better for everyone in the developer community. We appreciate your time and effort!

---

*For questions about contributing, feel free to reach out to the maintainers or create a discussion in our [GitHub Discussions](https://github.com/your-username/dom-agent/discussions).*
