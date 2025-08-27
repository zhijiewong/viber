# DOM Agent 🔍

Interactive DOM inspection and AI-powered code generation extension for Cursor IDE and VS Code.

## Features

- 🌐 **URL Inspection**: Capture and inspect any webpage DOM structure
- 🔧 **Dev Server Detection**: Auto-detect and inspect local development servers
- 🎯 **Interactive Selection**: Click-to-select DOM elements with visual feedback
- 📋 **Smart Clipboard**: Copy element data in multiple formats (JSON, CSS, XPath)
- 🤖 **AI Code Generation**: Generate React, Vue, Angular, or vanilla JS components from selected elements
- 📱 **Cursor Native**: Leverages Cursor's built-in AI for enhanced code suggestions

## Quick Start

### Prerequisites

- Cursor IDE or VS Code 1.73.0 or higher
- Node.js 18+ (for Playwright browser automation)

### Installation & Development

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd dom-agent
   npm install
   ```

2. **Build the extension:**
   ```bash
   npm run compile-dev
   ```

3. **Launch development:**
   - Open the project in Cursor IDE
   - Press `F5` to launch the Extension Development Host
   - The extension will be active in the new window

### Testing the Extension

1. **Open a webpage:**
   - Command Palette: `DOM Agent: Open URL in DOM Agent`
   - Enter any URL (e.g., `https://github.com`, `localhost:3000`)

2. **Auto-detect dev servers:**
   - Command Palette: `DOM Agent: Detect Local Dev Server`
   - Automatically finds running servers on common ports

3. **Inspect elements:**
   - Click on any element in the captured DOM
   - View detailed information in the inspector panel
   - Copy selectors, generate code, or export data

## Commands

| Command | Description |
|---------|-------------|
| `DOM Agent: Open URL` | Capture and inspect any webpage |
| `DOM Agent: Detect Local Dev Server` | Find and inspect running development servers |
| `DOM Agent: Generate Code from Selection` | Create component code from selected DOM elements |

## Architecture

```
DOM Agent Extension
├── Commands (URL input, dev detection, code generation)
├── Webview (Interactive DOM visualization)
├── Playwright Capture (DOM snapshots + metadata)
├── Element Inspector (CSS selectors, XPath, positioning)
├── AI Integration (Code generation with Cursor native AI)
└── Clipboard Manager (Multi-format data export)
```

## Code Generation

Generate production-ready code from DOM elements:

- **React Components**: TSX with TypeScript interfaces
- **Vue Components**: SFC with Composition API
- **Angular Components**: Component + template
- **Vanilla JavaScript**: Pure DOM manipulation
- **Test Code**: Playwright/Cypress test selectors

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `domAgent.defaultBrowser` | `chromium` | Browser for DOM capture |
| `domAgent.aiProvider` | `cursor-native` | AI provider for code generation |
| `domAgent.autoDetectDevServer` | `true` | Auto-detect local servers |

## Development

### Project Structure

```
src/
├── commands/           # Extension commands
├── webview/           # DOM visualization UI
├── capture/           # Playwright integration
├── inspector/         # Element analysis
├── utils/             # Shared utilities
├── types/             # TypeScript definitions
└── extension.ts       # Main entry point
```

### Building

```bash
# Development build
npm run compile-dev

# Production build
npm run compile

# Watch mode
npm run watch

# Package extension
npm run package
```

### Testing

```bash
# Run tests
npm test

# Lint code
npm run lint
```

## Roadmap

### Phase 1 ✅ - Core Structure
- [x] Extension setup and commands
- [x] TypeScript configuration
- [x] Basic webview foundation

### Phase 2 🚧 - DOM Capture
- [ ] Playwright integration
- [ ] DOM serialization with metadata
- [ ] Screenshot capture
- [ ] Error handling and loading states

### Phase 3 📋 - Interactive UI
- [ ] Webview DOM rendering
- [ ] Element highlighting and selection
- [ ] Inspector panel with detailed info
- [ ] Responsive layout

### Phase 4 🤖 - AI Features
- [ ] Code generation templates
- [ ] Cursor AI integration
- [ ] Component extraction
- [ ] Test generation

### Phase 5 🎨 - Polish
- [ ] Better error handling
- [ ] Performance optimization
- [ ] Documentation and examples
- [ ] Marketplace publishing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/dom-agent/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/dom-agent/discussions)
- 📧 **Email**: support@dom-agent.dev

---

Built with ❤️ for the Cursor IDE community