/**
 * DOM Agent Element Selector - Playwright-style locators with clipboard integration
 * Mimics Playwright's Pick Locator functionality
 */
export class ElementSelector {
    
    /**
     * Generate Playwright-style element selector with clipboard integration
     */
    public static generateScript(): string {
        return `<script id="dom-agent-element-selector" data-dom-agent="true">
        (function() {
            // Load Floating UI
            var floatingUIScript = document.createElement('script');
            floatingUIScript.src = 'https://unpkg.com/@floating-ui/dom@1.6.12/dist/floating-ui.dom.umd.min.js';
            floatingUIScript.onload = function() {
                console.log('✅ Floating UI loaded successfully');
                initElementSelector();
            };
            floatingUIScript.onerror = function() {
                console.warn('⚠️ Failed to load Floating UI, using fallback positioning');
                initElementSelector();
            };
            document.head.appendChild(floatingUIScript);

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
                    '.dom-agent-hover-info {' +
                        'position: fixed !important;' +
                        'background: white !important;' +
                        'color: #202124 !important;' +
                        'border: 1px solid #e0e0e0 !important;' +
                        'padding: 8px !important;' +
                        'border-radius: 8px !important;' +
                        'font-size: 12px !important;' +
                        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;' +
                        'z-index: 1000000 !important;' +
                        'pointer-events: none !important;' +
                        'box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;' +
                        'max-width: 320px !important;' +
                        'min-width: 280px !important;' +
                        'line-height: 1.4 !important;' +
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
                var hoverInfo = null;
                var isEnabled = true;

            // Create hover info element
            function createHoverInfo() {
                hoverInfo = document.createElement('div');
                hoverInfo.className = 'dom-agent-hover-info';
                document.body.appendChild(hoverInfo);
            }

            // Update hover info with Playwright locator
            function updateHoverInfo(element) {
                if (!hoverInfo) createHoverInfo();

                var rect = element.getBoundingClientRect();
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
                
                // Build rich hover info HTML
                var html = '<div style="padding: 8px; max-width: 300px;">';

                // Element tag and primary locator
                html += '<div style="font-weight: bold; color: #1a73e8; margin-bottom: 6px; font-size: 12px;">&lt;' + tag + '&gt;</div>';
                html += '<div style="font-family: monospace; font-size: 11px; background: rgba(26, 115, 232, 0.1); padding: 4px 6px; border-radius: 3px; margin-bottom: 8px; word-break: break-all;">' + locators.primary + '</div>';

                // Alternative locators
                if (locators.alternatives && locators.alternatives.length > 1) {
                    html += '<div style="font-size: 10px; color: #5f6368; margin-bottom: 4px;">Alternatives:</div>';
                    var altCount = 0;
                    locators.alternatives.forEach(function(alt) {
                        if (alt.locator !== locators.primary && altCount < 2) {
                            html += '<div style="font-size: 9px; color: #5f6368; margin-bottom: 2px;">• ' + alt.type + '</div>';
                            altCount++;
                        }
                    });
                }

                // Basic info section
                html += '<div style="border-top: 1px solid #e0e0e0; padding-top: 6px; margin-top: 6px;">';
                if (id !== 'none') html += '<div style="font-size: 10px; margin-bottom: 2px;"><span style="color: #5f6368;">ID:</span> ' + id + '</div>';
                if (className !== 'none') html += '<div style="font-size: 10px; margin-bottom: 2px;"><span style="color: #5f6368;">Classes:</span> ' + className + '</div>';
                html += '<div style="font-size: 10px; margin-bottom: 2px;"><span style="color: #5f6368;">Size:</span> ' + dimensions + '</div>';
                if (text !== 'none') html += '<div style="font-size: 10px;"><span style="color: #5f6368;">Text:</span> ' + text + '</div>';
                html += '</div>';

                // Action hint
                html += '<div style="font-size: 9px; color: #5f6368; margin-top: 6px; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 4px;">🎯 Click to copy locator</div>';

                html += '</div>';

                hoverInfo.innerHTML = html;

                // Use Floating UI for smart positioning
                if (typeof window.FloatingUIDOM !== 'undefined' && window.FloatingUIDOM.computePosition) {
                    // Use Floating UI
                    window.FloatingUIDOM.computePosition(element, hoverInfo, {
                        placement: 'top-start',
                        middleware: [
                            window.FloatingUIDOM.offset(8),
                            window.FloatingUIDOM.flip({
                                fallbackPlacements: ['bottom-start', 'top-end', 'bottom-end', 'right-start', 'left-start']
                            }),
                            window.FloatingUIDOM.shift({ padding: 8 }),
                            window.FloatingUIDOM.size({
                                apply: function({ availableWidth, availableHeight }) {
                                    Object.assign(hoverInfo.style, {
                                        maxWidth: Math.min(320, availableWidth) + 'px',
                                        maxHeight: Math.min(400, availableHeight) + 'px'
                                    });
                                }
                            })
                        ]
                    }).then(({ x, y }) => {
                        // Apply smooth positioning with animation
                        hoverInfo.style.left = x + 'px';
                        hoverInfo.style.top = y + 'px';
                        hoverInfo.style.display = 'block';
                        hoverInfo.style.opacity = '0';
                        hoverInfo.style.transform = 'scale(0.95)';

                        // Trigger animation
                        setTimeout(() => {
                            hoverInfo.style.opacity = '1';
                            hoverInfo.style.transform = 'scale(1)';
                            hoverInfo.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
                        }, 10);
                    });
                } else {
                    // Fallback positioning when Floating UI is not available
                    const margin = 8;
                    const tooltipWidth = 320;
                    const tooltipHeight = 180;

                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;

                    let left = Math.max(margin, Math.min(rect.left + window.scrollX, viewportWidth - tooltipWidth - margin));
                    let top = rect.top + window.scrollY - tooltipHeight - margin;

                    // If above doesn't fit, try below
                    if (top < margin) {
                        top = rect.bottom + window.scrollY + margin;
                    }

                    // Ensure tooltip stays in viewport
                    left = Math.max(margin, Math.min(left, viewportWidth - tooltipWidth - margin));
                    top = Math.max(margin, Math.min(top, viewportHeight - tooltipHeight - margin));

                    // Apply smooth positioning with animation
                    hoverInfo.style.left = left + 'px';
                    hoverInfo.style.top = top + 'px';
                    hoverInfo.style.display = 'block';
                    hoverInfo.style.opacity = '0';
                    hoverInfo.style.transform = 'scale(0.95)';

                    // Trigger animation
                    setTimeout(() => {
                        hoverInfo.style.opacity = '1';
                        hoverInfo.style.transform = 'scale(1)';
                        hoverInfo.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
                    }, 10);
                }
            }

            function hideHoverInfo() {
                if (hoverInfo && hoverInfo.style.display !== 'none') {
                    hoverInfo.style.opacity = '0';
                    hoverInfo.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        if (hoverInfo) {
                            hoverInfo.style.display = 'none';
                        }
                    }, 150);
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

            // Mouse over event
            document.addEventListener('mouseover', function(e) {
                if (!isEnabled) return;

                var target = e.target;

                // Skip if hovering over our own elements
                if (
                    target.closest('.dom-agent-toolbar') ||
                    target.closest('.dom-agent-hover-info') ||
                    target.classList.contains('dom-agent-copied-notification') ||
                    target.closest('.dom-agent-copied-notification')
                ) {
                    return;
                }



                if (currentHighlight && currentHighlight !== target) {
                    currentHighlight.classList.remove('dom-agent-highlight');
                }

                target.classList.add('dom-agent-highlight');
                currentHighlight = target;

                updateHoverInfo(target);
                e.stopPropagation();
            }, true);
            
            // Mouse out event
            document.addEventListener('mouseout', function(e) {
                if (!isEnabled) return;

                var target = e.target;
                var relatedTarget = e.relatedTarget;

                // Don't hide if moving to the hover info itself or its children
                if (relatedTarget && (
                    relatedTarget.classList.contains('dom-agent-hover-info') ||
                    relatedTarget.closest('.dom-agent-hover-info')
                )) {
                    return;
                }

                if (!target.classList.contains('dom-agent-selected')) {
                    target.classList.remove('dom-agent-highlight');
                }

                if (currentHighlight === target) {
                    currentHighlight = null;
                }

                // Only hide hover info if not moving to it
                if (!relatedTarget || !relatedTarget.closest || !relatedTarget.closest('.dom-agent-hover-info')) {
                    hideHoverInfo();
                }
            }, true);
            
            // Click event - copy locator to clipboard
            document.addEventListener('click', function(e) {
                if (!isEnabled) return;

                var target = e.target;

                if (
                    target.closest('.dom-agent-toolbar') ||
                    target.classList.contains('dom-agent-hover-info') ||
                    target.classList.contains('dom-agent-copied-notification')) {
                    return;
                }

                console.log('🎯 Element clicked for locator generation:', target.tagName);

                hideHoverInfo();

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
            }

            console.log('🎯 DOM Agent Playwright Selector Ready!');

            } // Close initElementSelector
        })(); // Close main function
        </script>`;
    }
}