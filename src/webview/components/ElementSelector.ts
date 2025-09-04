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
            // Skip Floating UI loading - using fallback positioning
            console.log('ℹ️ Using fallback positioning (no external dependencies)');
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
                    '.dom-agent-hover-info {' +
                        'position: fixed !important;' +
                        'background: rgba(255, 255, 255, 0.98) !important;' +
                        'color: #202124 !important;' +
                        'border: 1px solid #dadce0 !important;' +
                        'border-radius: 4px !important;' +
                        'padding: 12px !important;' +
                        'font-size: 12px !important;' +
                        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;' +
                        'z-index: 1000000 !important;' +
                        'pointer-events: none !important;' +
                        'box-shadow: 0 2px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08) !important;' +
                        'backdrop-filter: blur(8px) !important;' +
                        '-webkit-backdrop-filter: blur(8px) !important;' +
                        'max-width: 400px !important;' +
                        'min-width: 280px !important;' +
                        'line-height: 1.4 !important;' +
                        'word-wrap: break-word !important;' +
                        'overflow-wrap: break-word !important;' +
                        'transition: opacity 0.15s ease-out, transform 0.15s ease-out !important;' +
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
                var hoverInfo = null;
                var isEnabled = true;
                var currentTooltipPosition = null; // Store current tooltip position relative to element
                var scrollThrottleTimer = null; // Throttle scroll updates for performance
                var lastMousePosition = null; // Track last mouse position for stability
                var positionStabilityThreshold = 20; // Minimum pixel distance for repositioning

            // Create hover info element
            function createHoverInfo() {
                hoverInfo = document.createElement('div');
                hoverInfo.className = 'dom-agent-hover-info';
                document.body.appendChild(hoverInfo);
            }

            // Update tooltip position relative to current target element with throttling
            function updateTooltipPosition() {
                if (!hoverInfo || !currentTargetElement || !currentTooltipPosition || !isTooltipVisible) {
                    return;
                }

                // Throttle scroll updates to improve performance
                if (scrollThrottleTimer) {
                    clearTimeout(scrollThrottleTimer);
                }

                scrollThrottleTimer = setTimeout(() => {
                    console.log('📜 Updating tooltip position on scroll');
                    updateTooltipPositionNow();
                }, 16); // ~60fps throttling
            }

            function updateTooltipPositionNow() {
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

            // Update hover info with Playwright locator
            function updateHoverInfo(element, mouseEvent) {
                console.log('🔄 Updating hover info for element:', element.tagName, element.id || 'no-id');

                // Check if mouse position has changed significantly enough to warrant repositioning
                if (mouseEvent) {
                    const currentMousePos = { x: mouseEvent.clientX, y: mouseEvent.clientY };

                    if (lastMousePosition && isTooltipVisible && currentTargetElement === element) {
                        const distance = Math.sqrt(
                            Math.pow(currentMousePos.x - lastMousePosition.x, 2) +
                            Math.pow(currentMousePos.y - lastMousePosition.y, 2)
                        );

                        // Check if element position has changed significantly
                        const currentRect = element.getBoundingClientRect();
                        let elementPositionChanged = false;

                        if (currentTargetElement && currentTargetElement === element) {
                            const lastRect = currentTargetElement.getBoundingClientRect();
                            const elementDistance = Math.sqrt(
                                Math.pow(currentRect.left - lastRect.left, 2) +
                                Math.pow(currentRect.top - lastRect.top, 2)
                            );
                            elementPositionChanged = elementDistance > POSITION_CHANGE_THRESHOLD;
                        }

                        // If mouse and element haven't moved much, don't reposition
                        if (distance < positionStabilityThreshold && !elementPositionChanged) {
                            console.log('🎯 Mouse and element stable, keeping current tooltip position');
                            lastMousePosition = currentMousePos;
                            return;
                        }

                        // If mouse moved but element stayed the same, only reposition if movement is significant
                        if (distance >= positionStabilityThreshold && !elementPositionChanged) {
                            console.log('🎯 Mouse moved significantly, repositioning tooltip');
                        }
                    }

                    lastMousePosition = currentMousePos;
                }

                // Clear any existing hide timeout and scroll throttle to prevent conflicts
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                    console.log('⏸️ Cleared existing hide timeout during tooltip update');
                }

                if (scrollThrottleTimer) {
                    clearTimeout(scrollThrottleTimer);
                    scrollThrottleTimer = null;
                    console.log('⏸️ Cleared existing scroll throttle during tooltip update');
                }

                // Store current target element for relative positioning
                currentTargetElement = element;

                if (!hoverInfo) {
                    console.log('📦 Creating new hover info element');
                    createHoverInfo();
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
                hoverInfo.style.display = 'block';
                hoverInfo.style.opacity = '0';
                hoverInfo.style.visibility = 'hidden'; // Temporarily hide for measurement

                // Get actual tooltip dimensions after content is set
                const margin = 12; // Increased margin for better spacing
                const tooltipRect = hoverInfo.getBoundingClientRect();
                const tooltipWidth = Math.max(280, Math.min(tooltipRect.width || 320, 400)); // Dynamic width with limits
                const tooltipHeight = Math.max(120, tooltipRect.height || 200); // Dynamic height with min limit

                hoverInfo.style.visibility = 'visible'; // Restore visibility

                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;

                console.log('📍 Viewport:', { width: viewportWidth, height: viewportHeight, scrollX, scrollY });
                console.log('📏 Tooltip size:', { width: tooltipWidth, height: tooltipHeight });
                console.log('🎯 Element rect:', rect);

                // Smart positioning algorithm to avoid blocking the target element
                const elementCenterX = rect.left + rect.width / 2;
                const elementCenterY = rect.top + rect.height / 2;

                // Calculate available space in all directions
                const spaceAbove = rect.top;
                const spaceBelow = viewportHeight - rect.bottom;
                const spaceLeft = rect.left;
                const spaceRight = viewportWidth - rect.right;

                // Define positioning options with their viability scores
                const positions = [
                    {
                        name: 'top-center',
                        left: Math.max(margin, Math.min(elementCenterX - tooltipWidth / 2, viewportWidth - tooltipWidth - margin)),
                        top: rect.top + scrollY - tooltipHeight - margin,
                        fits: spaceAbove >= tooltipHeight + margin,
                        overlaps: false
                    },
                    {
                        name: 'bottom-center',
                        left: Math.max(margin, Math.min(elementCenterX - tooltipWidth / 2, viewportWidth - tooltipWidth - margin)),
                        top: rect.bottom + scrollY + margin,
                        fits: spaceBelow >= tooltipHeight + margin,
                        overlaps: false
                    },
                    {
                        name: 'right-center',
                        left: rect.right + scrollX + margin,
                        top: Math.max(margin, Math.min(elementCenterY - tooltipHeight / 2, viewportHeight - tooltipHeight - margin)),
                        fits: spaceRight >= tooltipWidth + margin,
                        overlaps: false
                    },
                    {
                        name: 'left-center',
                        left: rect.left + scrollX - tooltipWidth - margin,
                        top: Math.max(margin, Math.min(elementCenterY - tooltipHeight / 2, viewportHeight - tooltipHeight - margin)),
                        fits: spaceLeft >= tooltipWidth + margin,
                        overlaps: false
                    },
                    // Fallback positions that might overlap but are better than nothing
                    {
                        name: 'top-left',
                        left: rect.left + scrollX,
                        top: rect.top + scrollY - tooltipHeight - margin,
                        fits: spaceAbove >= tooltipHeight + margin && spaceLeft >= tooltipWidth,
                        overlaps: spaceLeft < tooltipWidth
                    },
                    {
                        name: 'bottom-right',
                        left: rect.right + scrollX - tooltipWidth,
                        top: rect.bottom + scrollY + margin,
                        fits: spaceBelow >= tooltipHeight + margin && spaceRight >= tooltipWidth,
                        overlaps: spaceRight < tooltipWidth
                    }
                ];

                // Find the best position
                let bestPosition = positions.find(pos => pos.fits);
                if (!bestPosition) {
                    // If no perfect fit, use the one with least overlap
                    bestPosition = positions.reduce((best, current) =>
                        (current.fits || (!best.fits && current.overlaps)) ? current : best
                    );
                }

                let left = bestPosition.left;
                let top = bestPosition.top;

                // Final viewport boundary check
                left = Math.max(margin, Math.min(left, viewportWidth - tooltipWidth - margin));
                top = Math.max(margin, Math.min(top, viewportHeight - tooltipHeight - margin));

                console.log('🎯 Selected position:', bestPosition.name, { left, top, fits: bestPosition.fits, overlaps: bestPosition.overlaps });

                // Store position info for relative positioning updates
                currentTooltipPosition = {
                    type: bestPosition.name,
                    margin: margin,
                    left: left,
                    top: top
                };

                // Apply smooth positioning with animation
                hoverInfo.style.left = left + 'px';
                hoverInfo.style.top = top + 'px';
                hoverInfo.style.display = 'block';
                hoverInfo.style.opacity = '0';
                hoverInfo.style.transform = 'scale(0.95)';

                console.log('✨ Showing hover tooltip at:', left + 'px', top + 'px');

                // Trigger animation with proper timing
                setTimeout(() => {
                    isTooltipAnimating = true; // Set animation flag
                    hoverInfo.style.opacity = '1';
                    hoverInfo.style.transform = 'scale(1)';
                    hoverInfo.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';

                    console.log('✅ Hover tooltip animation started');

                    // Record show time after animation completes
                    setTimeout(() => {
                        tooltipShowTime = Date.now(); // Record when tooltip is fully visible
                        isTooltipVisible = true;
                        isTooltipAnimating = false; // Clear animation flag
                        tooltipProtectionUntil = Date.now() + PROTECTION_BUFFER; // Set protection period

                        // Add scroll listener for relative positioning
                        window.addEventListener('scroll', updateTooltipPosition, { passive: true });
                        console.log('🎯 Tooltip fully visible, show time recorded:', tooltipShowTime);
                        console.log('🛡️ Protection period until:', tooltipProtectionUntil);
                        console.log('📜 Scroll listener added for relative positioning');
                    }, ANIMATION_DURATION); // Animation duration
                }, 10);
            }

            function hideHoverInfo() {
                // Don't hide if tooltip is currently animating or not fully visible yet
                if (isTooltipAnimating) {
                    console.log('🚫 Hide blocked: tooltip is animating');
                    return;
                }

                // Don't hide if we're still in the protection period
                if (Date.now() < tooltipProtectionUntil) {
                    console.log('🚫 Hide blocked: in protection period, remaining:', tooltipProtectionUntil - Date.now(), 'ms');
                    return;
                }

                if (hoverInfo && hoverInfo.style.display !== 'none' && !isHoveringOnTooltip && isTooltipVisible) {
                    const timeSinceShown = Date.now() - tooltipShowTime;
                    const remainingTime = Math.max(0, MIN_DISPLAY_TIME - timeSinceShown);

                    console.log('🙈 Hiding hover tooltip (shown for', timeSinceShown, 'ms, remaining:', remainingTime, 'ms)');

                    // Clear any existing hide timeout to prevent duplicates
                    if (hideTimeout) {
                        clearTimeout(hideTimeout);
                        console.log('🧹 Cleared previous hide timeout');
                    }

                    // Delay hiding to ensure minimum display time
                    hideTimeout = setTimeout(() => {
                        // Double-check conditions before hiding
                        if (hoverInfo && !isHoveringOnTooltip && isTooltipVisible &&
                            hoverInfo.style.display !== 'none') {
                            console.log('🚫 Executing hide after delay');
                            isTooltipVisible = false; // Reset visibility state
                            hoverInfo.style.opacity = '0';
                            hoverInfo.style.transform = 'scale(0.95)';
            setTimeout(() => {
                                if (hoverInfo && !isHoveringOnTooltip && hoverInfo.style.display !== 'none') {
                                    hoverInfo.style.display = 'none';
                                    isTooltipVisible = false; // Reset visibility state
                                    isTooltipAnimating = false; // Reset animation state
                                    tooltipShowTime = 0; // Reset show time
                                    tooltipProtectionUntil = 0; // Reset protection period
                                    currentTargetElement = null; // Clear target element
                                    currentTooltipPosition = null; // Clear position info

                                    // Remove scroll listener
                                    window.removeEventListener('scroll', updateTooltipPosition);
                                    console.log('✅ Hover tooltip hidden and state reset');
                                    console.log('📜 Scroll listener removed');
                                } else {
                                    console.log('⏸️ Hover tooltip hide cancelled (hovering on tooltip)');
                                }
                            }, 150);
                        } else {
                            console.log('⏸️ Hover tooltip hide cancelled (conditions changed)');
                        }
                    }, remainingTime);
                } else if (isTooltipAnimating) {
                    console.log('🚫 Hide skipped: tooltip is animating');
                } else if (!isTooltipVisible) {
                    console.log('🚫 Hide skipped: tooltip not fully visible yet');
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
                    target.closest('.dom-agent-hover-info') ||
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

                        // Only show tooltip if mouse is still within element bounds
                        if (mouseX >= currentRect.left && mouseX <= currentRect.right &&
                            mouseY >= currentRect.top && mouseY <= currentRect.bottom) {
                            console.log('🎯 Mouse hover detected on element:', target.tagName, target.id || 'no-id');
                            updateHoverInfo(target, e);
                        } else {
                            console.log('🚫 Mouse moved outside element bounds, skipping tooltip update');
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
                    target.closest('.dom-agent-hover-info') ||
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
                
                // Trigger tooltip immediately for mouseenter (no debounce)
                console.log('🎯 Mouse enter detected on element:', target.tagName, target.id || 'no-id');
                updateHoverInfo(target, e);
                
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

                // Clear hide timeout and scroll throttle if mouse is moving to another element
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

                    // Don't hide if moving to the hover info itself or its children
                    if (relatedTarget && (
                        relatedTarget.classList.contains('dom-agent-hover-info') ||
                        relatedTarget.closest('.dom-agent-hover-info') ||
                        relatedTarget.classList.contains('dom-agent-copied-notification') ||
                        relatedTarget.closest('.dom-agent-copied-notification')
                    )) {
                        isHoveringOnTooltip = true;
                        console.log('🎯 Mouse moved to tooltip, keeping visible');
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

                                hideHoverInfo();
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
            
            console.log('🎯 DOM Agent Playwright Selector Ready!');

            } // Close initElementSelector
        })(); // Close main function
        </script>`;
    }
}