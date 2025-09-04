/**
 * DOM Agent Element Selector - Playwright-style locators with clipboard integration
 * Mimics Playwright's Pick Locator functionality
 */
export class ElementSelector {
    
    /**
     * Generate Playwright-style element selector with clipboard integration
     */
    public static generateScript(): string {
        return `<script src="https://unpkg.com/@floating-ui/dom@1.7.4/dist/floating-ui.dom.umd.min.js"></script>
        <script id="dom-agent-element-selector" data-dom-agent="true">
        (function() {
            // Load Floating UI library dynamically
            console.log('🎯 Loading Floating UI for tooltip positioning');

            // Check if Floating UI is available
            if (typeof computePosition === 'undefined') {
                console.warn('⚠️ Floating UI not available, falling back to custom positioning');
                initElementSelector();
                return;
            }

            console.log('✅ Floating UI loaded successfully');
            initElementSelector();

            function initElementSelector() {
            // Inject CSS styles for highlighting
                var style = document.createElement('style');
            style.id = 'dom-agent-selector-styles';
                style.setAttribute('data-dom-agent', 'true');
                style.textContent =
                    '.dom-agent-highlight {' +
                        'outline: 2px solid #1a73e8 !important;' +
                        'outline-offset: -2px !important;' +
                    'background: rgba(26, 115, 232, 0.1) !important;' +
                        'cursor: crosshair !important;' +
                        'position: relative !important;' +
                        'z-index: 999999 !important;' +
                    'box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;' +
                        'transition: all 0.1s ease !important;' +
                    '}' +
                    '.dom-agent-selected {' +
                        'outline: 3px solid #ea4335 !important;' +
                        'outline-offset: -3px !important;' +
                    'background: rgba(234, 67, 53, 0.1) !important;' +
                        'position: relative !important;' +
                        'z-index: 999999 !important;' +
                    'box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.2) !important;' +
                    '}' +
                    '.dom-agent-unified-panel {' +
                        'position: absolute !important;' +
                        'background: rgba(255, 255, 255, 0.95) !important;' +
                        'color: #202124 !important;' +
                        'border: 1px solid #dadce0 !important;' +
                        'border-radius: 8px !important;' +
                        'padding: 16px !important;' +
                        'font-size: 13px !important;' +
                        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;' +
                        'z-index: 1000000 !important;' +
                        'pointer-events: auto !important;' +
                        'box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1) !important;' +
                        'backdrop-filter: blur(12px) !important;' +
                        '-webkit-backdrop-filter: blur(12px) !important;' +
                        'max-width: 320px !important;' +
                        'min-width: 280px !important;' +
                        'line-height: 1.5 !important;' +
                        'word-wrap: break-word !important;' +
                        'overflow-wrap: break-word !important;' +
                        'transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;' +
                        'transform: translateY(-10px) scale(0.95) !important;' +
                        'opacity: 0 !important;' +
                        'visibility: hidden !important;' +
                    '}' +
                    '.dom-agent-unified-panel.visible {' +
                        'transform: translateY(0) scale(1) !important;' +
                        'opacity: 1 !important;' +
                        'visibility: visible !important;' +
                    '}' +
                    '.dom-agent-panel-header {' +
                        'display: flex !important;' +
                        'align-items: center !important;' +
                        'margin-bottom: 12px !important;' +
                        'padding-bottom: 8px !important;' +
                        'border-bottom: 1px solid #e8eaed !important;' +
                    '}' +
                    '.dom-agent-panel-icon {' +
                        'width: 20px !important;' +
                        'height: 20px !important;' +
                        'margin-right: 8px !important;' +
                        'background: #1a73e8 !important;' +
                        'border-radius: 4px !important;' +
                        'display: flex !important;' +
                        'align-items: center !important;' +
                        'justify-content: center !important;' +
                        'color: white !important;' +
                        'font-weight: bold !important;' +
                        'font-size: 12px !important;' +
                    '}' +
                    '.dom-agent-panel-title {' +
                        'font-weight: 600 !important;' +
                        'font-size: 14px !important;' +
                        'color: #202124 !important;' +
                        'flex: 1 !important;' +
                    '}' +
                    '.dom-agent-panel-status {' +
                        'font-size: 11px !important;' +
                        'color: #5f6368 !important;' +
                        'background: #f1f3f4 !important;' +
                        'padding: 2px 6px !important;' +
                        'border-radius: 3px !important;' +
                    '}' +
                    '.dom-agent-panel-content {' +
                        'margin-bottom: 12px !important;' +
                    '}' +
                    '.dom-agent-locator {' +
                        'background: #f8f9fa !important;' +
                        'border: 1px solid #e8eaed !important;' +
                        'border-radius: 6px !important;' +
                        'padding: 8px 12px !important;' +
                        'font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace !important;' +
                        'font-size: 11px !important;' +
                        'color: #202124 !important;' +
                        'margin-bottom: 8px !important;' +
                        'word-break: break-all !important;' +
                        'cursor: pointer !important;' +
                        'transition: background-color 0.2s ease !important;' +
                    '}' +
                    '.dom-agent-locator:hover {' +
                        'background: #e8eaed !important;' +
                    '}' +
                    '.dom-agent-panel-actions {' +
                        'display: flex !important;' +
                        'gap: 8px !important;' +
                    '}' +
                    '.dom-agent-panel-btn {' +
                        'background: #1a73e8 !important;' +
                        'color: white !important;' +
                        'border: none !important;' +
                        'padding: 6px 12px !important;' +
                        'border-radius: 4px !important;' +
                        'font-size: 11px !important;' +
                        'cursor: pointer !important;' +
                        'transition: background-color 0.2s ease !important;' +
                        'flex: 1 !important;' +
                    '}' +
                    '.dom-agent-panel-btn:hover {' +
                        'background: #1557b0 !important;' +
                    '}' +
                    '.dom-agent-panel-btn.secondary {' +
                        'background: #f1f3f4 !important;' +
                        'color: #3c4043 !important;' +
                    '}' +
                    '.dom-agent-panel-btn.secondary:hover {' +
                        'background: #e8eaed !important;' +
                    '}' +
                    '.dom-agent-hover-info {' +
                        'display: none !important;' + /* 隐藏旧的悬浮框 */
                    '}' +
                    '.dom-agent-copied-notification {' +
                        'position: fixed !important;' +
                        'top: 70px !important;' +
                        'right: 20px !important;' +
                        'background: #1e8e3e !important;' +
                        'color: white !important;' +
                    'padding: 8px 16px !important;' +
                    'border-radius: 4px !important;' +
                    'font-size: 12px !important;' +
                        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;' +
                        'z-index: 10001 !important;' +
                        'opacity: 0 !important;' +
                        'transition: opacity 0.3s ease !important;' +
                    'box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;' +
                    '}';

            // Remove existing styles first
            var existingStyle = document.getElementById('dom-agent-selector-styles');
                if (existingStyle) {
                    existingStyle.remove();
                }

                document.head.appendChild(style);

            
            // Playwright-style locator generators
            var PlaywrightLocatorGenerator = {
                generateLocators: function(element) {
                    var locators = {
                        alternatives: []
                    };

                    // Priority 1: getByRole
                    var role = this.generateRoleLocator(element);
                    if (role) {
                        locators.role = role;
                        locators.alternatives.push({
                            type: 'role',
                            locator: role,
                            description: 'By ARIA role (most accessible)',
                            priority: 1
                        });
                    }

                    // Priority 2: getByTestId
                    var testId = this.generateTestIdLocator(element);
                    if (testId) {
                        locators.testId = testId;
                        locators.alternatives.push({
                            type: 'testId',
                            locator: testId,
                            description: 'By test ID (most stable)',
                            priority: 2
                        });
                    }

                    // Priority 3: getByPlaceholder
                    var placeholder = this.generatePlaceholderLocator(element);
                    if (placeholder) {
                        locators.placeholder = placeholder;
                        locators.alternatives.push({
                            type: 'placeholder',
                            locator: placeholder,
                            description: 'By placeholder text',
                            priority: 3
                        });
                    }

                    // Priority 4: getByText
                    var text = this.generateTextLocator(element);
                    if (text) {
                        locators.text = text;
                        locators.alternatives.push({
                            type: 'text',
                            locator: text,
                            description: 'By visible text',
                            priority: 4
                        });
                    }

                    // Priority 5: getByLabel
                    var label = this.generateLabelLocator(element);
                    if (label) {
                        locators.label = label;
                        locators.alternatives.push({
                            type: 'label',
                            locator: label,
                            description: 'By associated label',
                            priority: 5
                        });
                    }

                    // Priority 6: getByAltText
                    var altText = this.generateAltTextLocator(element);
                    if (altText) {
                        locators.altText = altText;
                        locators.alternatives.push({
                            type: 'altText',
                            locator: altText,
                            description: 'By alt text',
                            priority: 6
                        });
                    }

                    // Priority 7: getByTitle
                    var title = this.generateTitleLocator(element);
                    if (title) {
                        locators.title = title;
                        locators.alternatives.push({
                            type: 'title',
                            locator: title,
                            description: 'By title attribute',
                            priority: 7
                        });
                    }

                    // Fallback: CSS selector
                    var css = this.generateCSSLocator(element);
                    locators.css = css;
                    locators.alternatives.push({
                        type: 'css',
                        locator: css,
                        description: 'By CSS selector',
                        priority: 8
                    });

                    // Set primary locator
                    locators.primary = locators.role || locators.testId || locators.placeholder || 
                                      locators.text || locators.label || locators.altText || 
                                      locators.title || locators.css;

                    return locators;
                },

                generateRoleLocator: function(element) {
                    var role = element.getAttribute('role') || this.getImplicitRole(element);
                    if (!role) return null;

                    var accessibleName = this.getAccessibleName(element);
                    if (accessibleName) {
                        return 'page.getByRole(\\'' + role + '\\', { name: \\'' + this.escapeString(accessibleName) + '\\' })';
                    }

                    return 'page.getByRole(\\'' + role + '\\')';
                },

                generateTestIdLocator: function(element) {
                    var testId = element.getAttribute('data-testid') || 
                                  element.getAttribute('data-test-id') ||
                                  element.getAttribute('data-cy') ||
                                  element.getAttribute('data-test');
                    
                    if (testId) {
                        return 'page.getByTestId(\\'' + this.escapeString(testId) + '\\')';
                    }
                    return null;
                },

                generatePlaceholderLocator: function(element) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        var placeholder = element.getAttribute('placeholder');
                        if (placeholder && placeholder.trim()) {
                            return 'page.getByPlaceholder(\\'' + this.escapeString(placeholder.trim()) + '\\')';
                        }
                    }
                    return null;
                },

                generateTextLocator: function(element) {
                    var text = this.getElementText(element);
                    if (!text || text.length > 50) return null;

                    return 'page.getByText(\\'' + this.escapeString(text) + '\\')';
                },

                generateLabelLocator: function(element) {
                    var labelText = this.getLabelText(element);
                    if (labelText) {
                        return 'page.getByLabel(\\'' + this.escapeString(labelText) + '\\')';
                    }
                    return null;
                },

                generateAltTextLocator: function(element) {
                    if (element.tagName === 'IMG') {
                        var alt = element.getAttribute('alt');
                        if (alt && alt.trim()) {
                            return 'page.getByAltText(\\'' + this.escapeString(alt.trim()) + '\\')';
                        }
                    }
                    return null;
                },

                generateTitleLocator: function(element) {
                    var title = element.getAttribute('title');
                    if (title && title.trim()) {
                        return 'page.getByTitle(\\'' + this.escapeString(title.trim()) + '\\')';
                    }
                    return null;
                },

                generateCSSLocator: function(element) {
                    if (element.id && /^[a-zA-Z][\\\\w-]*$/.test(element.id)) {
                        return 'page.locator(\\\'#' + element.id + '\\')';
                    }

                    var path = this.generateCSSPath(element);
                    return 'page.locator(\\'' + path + '\\')';
                },

                getImplicitRole: function(element) {
                    var roleMap = {
                        'button': 'button',
                        'a': element.getAttribute('href') ? 'link' : null,
                        'input': this.getInputRole(element),
                        'textarea': 'textbox',
                        'select': 'combobox',
                        'h1': 'heading',
                        'h2': 'heading',
                        'h3': 'heading',
                        'h4': 'heading',
                        'h5': 'heading',
                        'h6': 'heading'
                    };

                    return roleMap[element.tagName.toLowerCase()] || null;
                },

                getInputRole: function(element) {
                    var type = (element.getAttribute('type') || 'text').toLowerCase();
                    var roleMap = {
                        'button': 'button',
                        'submit': 'button',
                        'checkbox': 'checkbox',
                        'radio': 'radio',
                        'text': 'textbox',
                        'password': 'textbox',
                        'email': 'textbox',
                        'search': 'searchbox'
                    };
                    return roleMap[type] || 'textbox';
                },

                getAccessibleName: function(element) {
                    var ariaLabel = element.getAttribute('aria-label');
                    if (ariaLabel && ariaLabel.trim()) {
                        return ariaLabel.trim();
                    }

                    var labelText = this.getLabelText(element);
                    if (labelText) return labelText;

                    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
                        var text = this.getElementText(element);
                        if (text) return text;
                    }

                    if (element.tagName === 'IMG') {
                        var alt = element.getAttribute('alt');
                        if (alt && alt.trim()) return alt.trim();
                    }

                    var title = element.getAttribute('title');
                    if (title && title.trim()) return title.trim();

                    return null;
                },

                getLabelText: function(element) {
                    if (element.id) {
                        var label = document.querySelector('label[for="' + element.id + '"]');
                        if (label) {
                            var text = this.getElementText(label);
                            if (text) return text;
                        }
                    }

                    var parentLabel = element.closest('label');
                    if (parentLabel) {
                        var text = this.getElementText(parentLabel);
                        if (text) return text;
                    }

                    return null;
                },

                getElementText: function(element) {
                    if (!element || !element.textContent) return null;
                    
                    var text = element.textContent.trim();
                    if (!text || text.length === 0) return null;
                    
                    var cleanText = text.replace(/\\\\s+/g, ' ').trim();
                    if (cleanText.length === 0 || cleanText.length > 100) return null;
                    
                    return cleanText;
                },

                generateCSSPath: function(element) {
                    var path = [];
                    var current = element;

                    while (current && current !== document.body) {
                        var selector = current.tagName.toLowerCase();
                        
                        if (current.id && /^[a-zA-Z][\\\\w-]*$/.test(current.id)) {
                            selector = '#' + current.id;
                            path.unshift(selector);
                            break;
                        }

                        var parent = current.parentElement;
                        if (parent) {
                            var siblings = Array.from(parent.children).filter(function(sibling) {
                                return sibling.tagName === current.tagName;
                            });
                            if (siblings.length > 1) {
                                var index = siblings.indexOf(current) + 1;
                                selector += ':nth-child(' + index + ')';
                            }
                        }

                        path.unshift(selector);
                        current = parent;

                        if (path.length >= 4) break;
                    }

                    return path.join(' > ');
                },

                escapeString: function(str) {
                    return str.replace(/'/g, "\\\\\\'").replace(/"/g, '\\\\\\"');
                }
            };
            
            // Event handling
                var currentHighlight = null;
                var currentTargetElement = null; // Track current target element for relative positioning
                var unifiedPanel = null; // New unified panel element
                var isEnabled = true;
                var currentTooltipPosition = null; // Store current tooltip position relative to element
                var scrollThrottleTimer = null; // Throttle scroll updates for performance
                var lastMousePosition = null; // Track last mouse position for stability
                var positionStabilityThreshold = 20; // Minimum pixel distance for repositioning
                var cleanupAutoUpdate = null; // Floating UI auto-update cleanup function

            // Create unified panel element
            function createUnifiedPanel() {
                unifiedPanel = document.createElement('div');
                unifiedPanel.className = 'dom-agent-unified-panel';
                unifiedPanel.id = 'dom-agent-unified-panel';
                unifiedPanel.innerHTML =
                    '<div class="dom-agent-panel-header">' +
                        '<div class="dom-agent-panel-icon">🎯</div>' +
                        '<div class="dom-agent-panel-title">Element Inspector</div>' +
                        '<div class="dom-agent-panel-status" id="panel-status">Ready</div>' +
                    '</div>' +
                    '<div class="dom-agent-panel-content" id="panel-content">' +
                        '<div style="color: #5f6368; font-size: 12px; text-align: center; padding: 20px;">' +
                            'Hover over an element to inspect' +
                        '</div>' +
                    '</div>' +
                    '<div class="dom-agent-panel-actions" id="panel-actions" style="display: none;">' +
                        '<button class="dom-agent-panel-btn" onclick="copyLocator()">Copy Locator</button>' +
                        '<button class="dom-agent-panel-btn secondary" onclick="clearSelection()">Clear</button>' +
                    '</div>';
                document.body.appendChild(unifiedPanel);

                // Add click handlers for locator copying
                unifiedPanel.addEventListener('click', function(e) {
                    if (e.target.classList.contains('dom-agent-locator')) {
                        var locator = e.target.textContent;
                        copyToClipboard(locator, 'Locator');
                    }
                });

                // Add global functions for button clicks
                window.copyLocator = function() {
                    if (currentTargetElement) {
                        var locators = PlaywrightLocatorGenerator.generateLocators(currentTargetElement);
                        copyToClipboard(locators.primary, 'Playwright Locator');
                    }
                };

                window.clearSelection = function() {
                    // Clear all selected states
                    var selectedElements = document.querySelectorAll('.dom-agent-selected');
                    for (var i = 0; i < selectedElements.length; i++) {
                        selectedElements[i].classList.remove('dom-agent-selected');
                        selectedElements[i].classList.remove('dom-agent-highlight');
                    }
                    hideUnifiedPanel();
                };
            }

            // Update tooltip position using Floating UI
            function updateTooltipPosition() {
                if (!hoverInfo || !currentTargetElement || !isTooltipVisible) {
                    return;
                }

                // Use Floating UI to compute position automatically
                if (typeof computePosition !== 'undefined') {
                    console.log('🎯 Using Floating UI to update tooltip position');
                    computePosition(currentTargetElement, hoverInfo, {
                        placement: 'top',
                        middleware: [
                            offset(8), // 8px offset from element
                            flip(), // Flip to opposite side if needed
                            shift({ padding: 8 }) // Keep within viewport with 8px padding
                        ]
                    }).then(({ x, y }) => {
                        hoverInfo.style.left = x + 'px';
                        hoverInfo.style.top = y + 'px';
                        console.log('✅ Tooltip positioned at:', { x, y });
                    }).catch(error => {
                        console.error('❌ Floating UI positioning error:', error);
                        // Fallback to manual positioning
                        updateTooltipPositionManual();
                    });
                } else {
                    // Fallback to manual positioning if Floating UI is not available
                    updateTooltipPositionManual();
                }
            }

            // Fallback manual positioning (original logic)
            function updateTooltipPositionManual() {
                if (!hoverInfo || !currentTargetElement || !currentTooltipPosition || !isTooltipVisible) {
                    return;
                }

                const rect = currentTargetElement.getBoundingClientRect();
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;

                // Calculate new position based on stored relative position
                let newLeft, newTop;

                switch (currentTooltipPosition.type) {
                    case 'top-center':
                        newLeft = rect.left + rect.width / 2 + scrollX - hoverInfo.offsetWidth / 2;
                        newTop = rect.top + scrollY - hoverInfo.offsetHeight - currentTooltipPosition.margin;
                        break;
                    case 'bottom-center':
                        newLeft = rect.left + rect.width / 2 + scrollX - hoverInfo.offsetWidth / 2;
                        newTop = rect.bottom + scrollY + currentTooltipPosition.margin;
                        break;
                    case 'right-center':
                        newLeft = rect.right + scrollX + currentTooltipPosition.margin;
                        newTop = rect.top + rect.height / 2 + scrollY - hoverInfo.offsetHeight / 2;
                        break;
                    case 'left-center':
                        newLeft = rect.left + scrollX - hoverInfo.offsetWidth - currentTooltipPosition.margin;
                        newTop = rect.top + rect.height / 2 + scrollY - hoverInfo.offsetHeight / 2;
                        break;
                    case 'top-left':
                        newLeft = rect.left + scrollX;
                        newTop = rect.top + scrollY - hoverInfo.offsetHeight - currentTooltipPosition.margin;
                        break;
                    case 'bottom-right':
                        newLeft = rect.right + scrollX - hoverInfo.offsetWidth;
                        newTop = rect.bottom + scrollY + currentTooltipPosition.margin;
                        break;
                    default:
                        return; // Unknown position type
                }

                // Apply viewport bounds
                const margin = currentTooltipPosition.margin;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                newLeft = Math.max(margin, Math.min(newLeft, viewportWidth - hoverInfo.offsetWidth - margin));
                newTop = Math.max(margin, Math.min(newTop, viewportHeight - hoverInfo.offsetHeight - margin));

                // Update position without animation for smooth scrolling
                hoverInfo.style.left = newLeft + 'px';
                hoverInfo.style.top = newTop + 'px';
            }

            // Update unified panel with element information and position
            function updateUnifiedPanel(element, mouseEvent) {
                console.log('🔄 Updating unified panel for element:', element.tagName, element.id || 'no-id');

                // Store current target element
                currentTargetElement = element;

                if (!unifiedPanel) {
                    console.log('📦 Creating new unified panel element');
                    createUnifiedPanel();
                }

                var rect = element.getBoundingClientRect();
                console.log('📐 Element rect:', rect);
                var locators = PlaywrightLocatorGenerator.generateLocators(element);

                // Get element details
                var tag = element.tagName.toLowerCase();
                var id = element.id || 'none';
                var classes = Array.from(element.classList).filter(function(cls) {
                    return !cls.startsWith('dom-agent-');
                });
                var className = classes.length > 0 ? classes.join(', ') : 'none';
                var text = element.textContent ? element.textContent.trim().substring(0, 50) + '...' : 'none';
                var dimensions = Math.round(rect.width) + 'px × ' + Math.round(rect.height) + 'px';

                // Update panel status
                var statusElement = document.getElementById('panel-status');
                if (statusElement) {
                    statusElement.textContent = 'Inspecting';
                    statusElement.style.color = '#1a73e8';
                }

                // Build panel content HTML
                var contentHtml = '<div style="margin-bottom: 12px;">';
                contentHtml += '<div style="font-weight: 600; color: #1a73e8; margin-bottom: 8px; font-size: 14px;">&lt;' + tag + '&gt;</div>';

                // Primary locator
                contentHtml += '<div class="dom-agent-locator" title="Click to copy">' + locators.primary + '</div>';

                // Alternative locators
                if (locators.alternatives && locators.alternatives.length > 1) {
                    contentHtml += '<div style="font-size: 11px; color: #5f6368; margin-bottom: 6px;">Alternative locators:</div>';
                    var altCount = 0;
                    locators.alternatives.forEach(function(alt) {
                        if (alt.locator !== locators.primary && altCount < 2) {
                            contentHtml += '<div class="dom-agent-locator" style="font-size: 10px; margin-bottom: 4px;" title="Click to copy">' + alt.locator + '</div>';
                            altCount++;
                        }
                    });
                }

                // Element details
                contentHtml += '<div style="border-top: 1px solid #e8eaed; padding-top: 8px; margin-top: 8px;">';
                if (id !== 'none') contentHtml += '<div style="font-size: 11px; margin-bottom: 3px;"><span style="color: #5f6368;">ID:</span> ' + id + '</div>';
                if (className !== 'none') contentHtml += '<div style="font-size: 11px; margin-bottom: 3px;"><span style="color: #5f6368;">Classes:</span> ' + className + '</div>';
                contentHtml += '<div style="font-size: 11px; margin-bottom: 3px;"><span style="color: #5f6368;">Size:</span> ' + dimensions + '</div>';
                if (text !== 'none') contentHtml += '<div style="font-size: 11px;"><span style="color: #5f6368;">Text:</span> ' + text + '</div>';
                contentHtml += '</div>';
                contentHtml += '</div>';

                // Update panel content
                var contentElement = document.getElementById('panel-content');
                if (contentElement) {
                    contentElement.innerHTML = contentHtml;
                }

                // Show actions
                var actionsElement = document.getElementById('panel-actions');
                if (actionsElement) {
                    actionsElement.style.display = 'flex';
                }

                // Position panel relative to element using Floating UI
                updatePanelPosition(element);

                // Setup auto-update to follow element movements
                if (typeof autoUpdate !== 'undefined' && typeof computePosition !== 'undefined') {
                    // Clean up previous auto-update
                    if (cleanupAutoUpdate) {
                        cleanupAutoUpdate();
                        cleanupAutoUpdate = null;
                    }

                    // Setup new auto-update to follow element
                    cleanupAutoUpdate = autoUpdate(element, unifiedPanel, () => {
                        updatePanelPosition(element);
                    });
                    console.log('🔄 Auto-update enabled: panel will follow element movements');
                }

                // Show panel with animation
                unifiedPanel.classList.add('visible');
                console.log('✨ Showing unified panel following element');
            }

            // Update panel position relative to target element
            function updatePanelPosition(element) {
                if (!unifiedPanel || !element) return;

                // Use Floating UI to compute optimal position
                if (typeof computePosition !== 'undefined') {
                    console.log('🎯 Using Floating UI to position panel relative to element');

                    computePosition(element, unifiedPanel, {
                        placement: 'bottom-start', // Try bottom first, then flip
                        middleware: [
                            offset(12), // 12px offset from element
                            flip({
                                fallbackPlacements: ['bottom-end', 'top-start', 'top-end', 'right-start', 'left-start'],
                                padding: 8 // Keep 8px from viewport edges
                            }),
                            shift({
                                padding: 8, // Keep 8px from viewport edges
                                limiter: {
                                    fn: (middlewareArguments) => {
                                        // Custom limiter to keep panel within reasonable bounds
                                        const { x, y, placement } = middlewareArguments;
                                        return {
                                            x: Math.max(8, Math.min(x, window.innerWidth - unifiedPanel.offsetWidth - 8)),
                                            y: Math.max(8, Math.min(y, window.innerHeight - unifiedPanel.offsetHeight - 8)),
                                            data: { placement }
                                        };
                                    }
                                }
                            })
                        ]
                    }).then(({ x, y, placement }) => {
                        unifiedPanel.style.left = x + 'px';
                        unifiedPanel.style.top = y + 'px';
                        console.log('✅ Panel positioned at:', { x, y, placement });

                        // Update panel arrow/pointer if needed (could add later)
                        // unifiedPanel.setAttribute('data-placement', placement);
                    }).catch(error => {
                        console.error('❌ Floating UI positioning error:', error);
                        // Fallback to manual positioning
                        updatePanelPositionManual(element);
                    });
                } else {
                    // Fallback if Floating UI is not available
                    updatePanelPositionManual(element);
                }
            }

            // Manual positioning fallback
            function updatePanelPositionManual(element) {
                if (!unifiedPanel || !element) return;

                const rect = element.getBoundingClientRect();
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;
                const margin = 12;

                // Try to position below the element first
                let left = rect.left + scrollX;
                let top = rect.bottom + scrollY + margin;

                // Check if it fits below
                if (top + unifiedPanel.offsetHeight > window.innerHeight + scrollY) {
                    // Try above the element
                    top = rect.top + scrollY - unifiedPanel.offsetHeight - margin;
                    if (top < scrollY) {
                        // Try to the right
                        left = rect.right + scrollX + margin;
                        top = rect.top + scrollY;
                        if (left + unifiedPanel.offsetWidth > window.innerWidth + scrollX) {
                            // Try to the left
                            left = rect.left + scrollX - unifiedPanel.offsetWidth - margin;
                        }
                    }
                }

                // Apply viewport bounds
                left = Math.max(8, Math.min(left, window.innerWidth + scrollX - unifiedPanel.offsetWidth - 8));
                top = Math.max(8, Math.min(top, window.innerHeight + scrollY - unifiedPanel.offsetHeight - 8));

                unifiedPanel.style.left = left + 'px';
                unifiedPanel.style.top = top + 'px';
                console.log('📍 Manual panel position:', { left, top });
            }

            function hideUnifiedPanel() {
                if (unifiedPanel && unifiedPanel.classList.contains('visible')) {
                    console.log('🙈 Hiding unified panel');

                    // Clean up auto-update
                    if (cleanupAutoUpdate) {
                        cleanupAutoUpdate();
                        cleanupAutoUpdate = null;
                        console.log('🔄 Auto-update cleaned up');
                    }

                    // Update status
                    var statusElement = document.getElementById('panel-status');
                    if (statusElement) {
                        statusElement.textContent = 'Ready';
                        statusElement.style.color = '#5f6368';
                    }

                    // Reset content
                    var contentElement = document.getElementById('panel-content');
                    if (contentElement) {
                        contentElement.innerHTML = '<div style="color: #5f6368; font-size: 12px; text-align: center; padding: 20px;">Hover over an element to inspect</div>';
                    }

                    // Hide actions
                    var actionsElement = document.getElementById('panel-actions');
                    if (actionsElement) {
                        actionsElement.style.display = 'none';
                    }

                    // Hide panel with animation
                    unifiedPanel.classList.remove('visible');

                    // Clear current target
                    currentTargetElement = null;
                    console.log('✅ Unified panel hidden and state reset');
                }
            }

            // Copy to clipboard with notification
            function copyToClipboard(text, type) {
                type = type || 'Locator';
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).then(function() {
                            showNotification(type + ' copied!');
                            console.log('✅ Copied to clipboard:', text);
                        }).catch(function(error) {
                            console.error('❌ Failed to copy to clipboard:', error);
                            showNotification('Copy failed', 'error');
                        });
                    } else if (window.vscode) {
                        // Fallback: use VS Code API
                        var vscode = window.vscode;
                        vscode.postMessage({
                            type: 'copy-to-clipboard',
                            payload: { text: text, type: type }
                        });
                        showNotification(type + ' copied!');

                    } else {
                        // Fallback: create temporary textarea
                        var textarea = document.createElement('textarea');
                        textarea.value = text;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        showNotification(type + ' copied!');
                    }
                } catch (error) {
                    console.error('❌ Failed to copy to clipboard:', error);
                    showNotification('Copy failed', 'error');
                }
            }

            function showNotification(message, type) {
                var notification = document.createElement('div');
                notification.className = 'dom-agent-copied-notification';
                notification.textContent = message;
                
                if (type === 'error') {
                    notification.style.background = '#ea4335';
                }
                
                document.body.appendChild(notification);
                
                setTimeout(function() { notification.style.opacity = '1'; }, 10);
                setTimeout(function() {
                    notification.style.opacity = '0';
                    setTimeout(function() { 
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, 2000);
            }

            // Improved mouse over event with better stability
            let hoverTimeout = null;
            let hideTimeout = null;
            let isHoveringOnTooltip = false;
            let tooltipShowTime = 0; // Track when tooltip was fully shown (after animation)
            let isTooltipVisible = false; // Track tooltip visibility state
            let isTooltipAnimating = false; // Track if tooltip is currently animating
            let tooltipProtectionUntil = 0; // Track protection period end time
            const MIN_DISPLAY_TIME = 300; // Minimum display time in milliseconds
            const ANIMATION_DURATION = 150; // Animation duration in milliseconds
            const PROTECTION_BUFFER = 200; // Additional protection time after animation
            const HOVER_DEBOUNCE_DELAY = 100; // Increased debounce delay for better stability
            const POSITION_CHANGE_THRESHOLD = 30; // Minimum pixel change to trigger repositioning
            const TOOLTIP_STICKINESS_DELAY = 150; // Delay before hiding tooltip when mouse leaves element

            document.addEventListener('mouseover', function(e) {
                if (!isEnabled) return;
                
                var target = e.target;

                // Clear any existing timeout
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                }

                // Skip if hovering over our own elements - but don't skip toolbar
                if (
                    target.closest('.dom-agent-unified-panel') ||
                    target.classList.contains('dom-agent-copied-notification') ||
                    target.closest('.dom-agent-copied-notification')
                ) {
                    isHoveringOnTooltip = true;
                    return;
                }
                
                isHoveringOnTooltip = false;

                // Skip if target is not a valid element (less restrictive filtering)
                if (!target || target.nodeType !== Node.ELEMENT_NODE ||
                    target.tagName === 'SCRIPT' || target.tagName === 'STYLE' ||
                    target.tagName === 'LINK' || target.tagName === 'META' ||
                    target.tagName === 'TITLE' || target.tagName === 'HEAD' ||
                    target.tagName === 'HTML') {
                    return;
                }

                // Skip very small elements that are hard to hover
                const rect = target.getBoundingClientRect();
                if (rect.width < 3 || rect.height < 3) {
                    return;
                }

                // Remove previous highlight
                if (currentHighlight && currentHighlight !== target) {
                    currentHighlight.classList.remove('dom-agent-highlight');
                }
                
                // Add new highlight
                target.classList.add('dom-agent-highlight');
                currentHighlight = target;
                
                // Update hover info with optimized delay for better performance and stability
                hoverTimeout = setTimeout(() => {
                    // Double-check we're still hovering on the same element and not on tooltip
                    if (currentHighlight === target && !isHoveringOnTooltip) {
                        // Additional check: ensure mouse is still over the element
                        const currentRect = target.getBoundingClientRect();
                        const mouseX = e.clientX;
                        const mouseY = e.clientY;

                        // Only show panel if mouse is still within element bounds
                        if (mouseX >= currentRect.left && mouseX <= currentRect.right &&
                            mouseY >= currentRect.top && mouseY <= currentRect.bottom) {
                            console.log('🎯 Mouse hover detected on element:', target.tagName, target.id || 'no-id');
                            updateUnifiedPanel(target, e);
                        } else {
                            console.log('🚫 Mouse moved outside element bounds, skipping panel update');
                        }
                    }
                }, HOVER_DEBOUNCE_DELAY); // Reduced delay for better responsiveness
                
                e.stopPropagation();
            }, true);
            
            // Add mouseenter as backup for better hover detection
            document.addEventListener('mouseenter', function(e) {
                if (!isEnabled) return;
                
                var target = e.target;

                // Skip if hovering over our own elements
                if (
                    target.closest('.dom-agent-unified-panel') ||
                    target.classList.contains('dom-agent-copied-notification') ||
                    target.closest('.dom-agent-copied-notification')
                ) {
                    isHoveringOnTooltip = true;
                    return;
                }
                
                isHoveringOnTooltip = false;

                // Skip if target is not a valid element
                if (!target || target.nodeType !== Node.ELEMENT_NODE ||
                    target.tagName === 'SCRIPT' || target.tagName === 'STYLE' ||
                    target.tagName === 'LINK' || target.tagName === 'META' ||
                    target.tagName === 'TITLE' || target.tagName === 'HEAD' ||
                    target.tagName === 'HTML') {
                    return;
                }

                // Add highlight immediately for mouseenter
                if (currentHighlight && currentHighlight !== target) {
                    currentHighlight.classList.remove('dom-agent-highlight');
                }
                target.classList.add('dom-agent-highlight');
                currentHighlight = target;
                
                // Trigger panel immediately for mouseenter (no debounce)
                console.log('🎯 Mouse enter detected on element:', target.tagName, target.id || 'no-id');
                updateUnifiedPanel(target, e);
                
                e.stopPropagation();
            }, true);
            
            // Improved mouse out event with better stability and debouncing
            let mouseoutDebounce = null;
            const MOUSEOUT_DEBOUNCE_DELAY = 100; // 100ms debounce for mouseout

            document.addEventListener('mouseout', function(e) {
                if (!isEnabled) return;
                
                var target = e.target;
                var relatedTarget = e.relatedTarget;

                // Clear existing debounce timeout
                if (mouseoutDebounce) {
                    clearTimeout(mouseoutDebounce);
                }

                // Debounce mouseout to prevent rapid firing during fast mouse movement
                // Only process mouseout if we're not currently showing a tooltip
                mouseoutDebounce = setTimeout(() => {
                    // Don't process mouseout if tooltip is animating or visible
                    if (isTooltipAnimating || isTooltipVisible) {
                        console.log('🚫 Mouseout skipped: tooltip is active');
                        return;
                    }
                    console.log('👆 Mouseout event processed for:', target.tagName, target.id || 'no-id');

                                    // Clear hover timeout if leaving the element
                if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null;
                }

                // Clear hide timeout, scroll throttle, and Floating UI cleanup if mouse is moving to another element
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                    console.log('⏸️ Hide timeout cleared due to mouse movement');
                }

                if (scrollThrottleTimer) {
                    clearTimeout(scrollThrottleTimer);
                    scrollThrottleTimer = null;
                    console.log('⏸️ Scroll throttle cleared due to mouse movement');
                }

                // Clean up auto-update when moving to different element
                if (cleanupAutoUpdate) {
                    cleanupAutoUpdate();
                    cleanupAutoUpdate = null;
                    console.log('⏸️ Floating UI autoUpdate cleared due to mouse movement');
                }

                    // Don't hide if moving to the unified panel itself or its children
                    if (relatedTarget && (
                        relatedTarget.classList.contains('dom-agent-unified-panel') ||
                        relatedTarget.closest('.dom-agent-unified-panel') ||
                        relatedTarget.classList.contains('dom-agent-copied-notification') ||
                        relatedTarget.closest('.dom-agent-copied-notification')
                    )) {
                        isHoveringOnTooltip = true;
                        console.log('🎯 Mouse moved to panel, keeping visible');
                        return;
                    }

                    isHoveringOnTooltip = false;

                    // Remove highlight only if not selected and not moving to a valid element
                if (!target.classList.contains('dom-agent-selected')) {
                    target.classList.remove('dom-agent-highlight');
                }
                
                if (currentHighlight === target) {
                    currentHighlight = null;
                }
                
                    // Only hide if mouse has actually left the element area (not just moving between elements)
                    if (!relatedTarget || (!relatedTarget.closest || !relatedTarget.closest('.dom-agent-hover-info'))) {
                        console.log('🏃 Mouse left element area, scheduling hide with stickiness delay');

                        // Use stickiness delay to prevent tooltip from disappearing too quickly
                        setTimeout(() => {
                            const now = Date.now();
                            if (!isHoveringOnTooltip && !isTooltipAnimating && now >= tooltipProtectionUntil) {
                                // Additional check: ensure mouse is still outside the element
                                if (currentTargetElement) {
                                    const rect = currentTargetElement.getBoundingClientRect();
                                    const mouseX = e.clientX;
                                    const mouseY = e.clientY;

                                    // If mouse is still near the element, don't hide
                                    const margin = 10; // 10px margin of stickiness
                                    if (mouseX >= rect.left - margin && mouseX <= rect.right + margin &&
                                        mouseY >= rect.top - margin && mouseY <= rect.bottom + margin) {
                                        console.log('🎯 Mouse still near element, keeping tooltip visible');
                                        return;
                                    }
                                }

                                hideUnifiedPanel();
                            } else {
                                if (isTooltipAnimating) {
                                    console.log('⏸️ Hide delayed: waiting for animation to complete');
                                } else if (now < tooltipProtectionUntil) {
                                    console.log('⏸️ Hide delayed: in protection period, remaining:', tooltipProtectionUntil - now, 'ms');
                                }
                            }
                        }, TOOLTIP_STICKINESS_DELAY);
                    }

                }, MOUSEOUT_DEBOUNCE_DELAY);
            }, true);
            
            // Click event - copy locator to clipboard
            document.addEventListener('click', function(e) {
                if (!isEnabled) return;
                
                var target = e.target;

                if (
                    target.closest('.dom-agent-toolbar') ||
                    target.classList.contains('dom-agent-copied-notification')) {
                    return;
                }

                console.log('🎯 Element clicked for locator generation:', target.tagName);

                // Clear all selected states
                var selectedElements = document.querySelectorAll('.dom-agent-selected');
                for (var i = 0; i < selectedElements.length; i++) {
                    selectedElements[i].classList.remove('dom-agent-selected');
                    selectedElements[i].classList.remove('dom-agent-highlight');
                }

                // Add selected state
                target.classList.remove('dom-agent-highlight');
                target.classList.add('dom-agent-selected');
                
                // Generate Playwright locators
                var locators = PlaywrightLocatorGenerator.generateLocators(target);
                console.log('📊 Generated Playwright locators:', locators);

                // Copy primary locator to clipboard
                copyToClipboard(locators.primary, 'Playwright Locator');

                // Create element info for selection
                var rect = target.getBoundingClientRect();
                var classes = [];
                for (var j = 0; j < target.classList.length; j++) {
                    if (!target.classList[j].startsWith('dom-agent-')) {
                        classes.push(target.classList[j]);
                    }
                }
                
                var elementInfo = {
                    tag: target.tagName.toLowerCase(),
                    tagName: target.tagName.toLowerCase(),
                    id: target.id || '',
                    classes: classes,
                    className: classes.join(' '),
                    textContent: target.textContent ? target.textContent.trim().substring(0, 100) : '',
                    attributes: {},
                    playwrightLocators: locators,
                    cssSelector: locators.css,
                    boundingBox: {
                        x: Math.round(rect.x),
                        y: Math.round(rect.y),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    }
                };
                
                // Get attributes
                for (var k = 0; k < target.attributes.length; k++) {
                    var attr = target.attributes[k];
                    elementInfo.attributes[attr.name] = attr.value;
                }

                // Send to VS Code
                if (window.vscode && window.vscode.postMessage) {
                    window.vscode.postMessage({
                            type: 'element-selected',
                            payload: { element: elementInfo }
                        });
                }

                // Element selected - locator copied to clipboard
                
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, true);
            
            console.log('🎯 DOM Agent Playwright Selector Ready!');

            } // Close initElementSelector
        })(); // Close main function
        </script>`;
    }
}