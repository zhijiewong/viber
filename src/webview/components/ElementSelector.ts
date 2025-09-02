/**
 * 🎯 DOM Agent Element Selector - 简单可靠的元素选择器
 * 专注于核心功能：鼠标悬停高亮 + 点击选择
 */
export class ElementSelector {
    
    /**
     * 生成简单可靠的选择器脚本
     */
    public static generateScript(): string {
        return `
        <script>
        (function() {
            console.log('🎯 DOM Agent Element Selector Loading...');
            
            // 立即检查基本环境
            console.log('✓ Document ready:', document.readyState);
            console.log('✓ Body exists:', !!document.body);
            console.log('✓ Head exists:', !!document.head);
            
            // 注入CSS样式
            const style = document.createElement('style');
            style.id = 'dom-agent-selector-styles';
            style.textContent = \`
                .dom-agent-highlight {
                    outline: 2px solid #00aaff !important;
                    outline-offset: 1px !important;
                    background: rgba(0, 170, 255, 0.1) !important;
                    cursor: crosshair !important;
                    position: relative !important;
                    z-index: 999999 !important;
                }
                
                .dom-agent-selected {
                    outline: 3px solid #ff4444 !important;
                    outline-offset: 1px !important;
                    background: rgba(255, 68, 68, 0.15) !important;
                    position: relative !important;
                    z-index: 999999 !important;
                }
                
                /* 测试元素样式 */
                .dom-agent-test-element {
                    position: fixed !important;
                    top: 10px !important;
                    left: 10px !important;
                    z-index: 999999 !important;
                    background: yellow !important;
                    color: black !important;
                    padding: 8px 12px !important;
                    border: 2px solid red !important;
                    font-size: 14px !important;
                    font-weight: bold !important;
                    border-radius: 4px !important;
                }
            \`;
            
            // 清除旧样式并添加新的
            const existingStyle = document.getElementById('dom-agent-selector-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
            document.head.appendChild(style);
            console.log('✓ Styles injected');
            
            // 显示测试元素
            const testElement = document.createElement('div');
            testElement.className = 'dom-agent-test-element';
            testElement.textContent = '✓ DOM Agent Active';
            testElement.id = 'dom-agent-test';
            document.body.appendChild(testElement);
            
            // 3秒后移除测试元素
            setTimeout(() => {
                const test = document.getElementById('dom-agent-test');
                if (test) test.remove();
            }, 3000);
            
            console.log('✓ Test element added');
            
            // 简单的事件处理
            let currentHighlight = null;
            let isEnabled = true;
            
            // 鼠标悬停事件
            document.addEventListener('mouseover', function(e) {
                if (!isEnabled) return;
                
                const target = e.target;
                
                // 跳过我们自己的元素
                if (target.id === 'dom-agent-test' || 
                    target.classList.contains('dom-agent-test-element')) {
                    return;
                }
                
                console.log('👆 Mouse over:', target.tagName, target.className);
                
                // 移除之前的高亮
                if (currentHighlight && currentHighlight !== target) {
                    currentHighlight.classList.remove('dom-agent-highlight');
                }
                
                // 添加新高亮
                target.classList.add('dom-agent-highlight');
                currentHighlight = target;
                
                e.stopPropagation();
            }, true);
            
            // 鼠标离开事件
            document.addEventListener('mouseout', function(e) {
                if (!isEnabled) return;
                
                const target = e.target;
                
                // 只移除非选中元素的高亮
                if (!target.classList.contains('dom-agent-selected')) {
                    target.classList.remove('dom-agent-highlight');
                }
                
                if (currentHighlight === target) {
                    currentHighlight = null;
                }
            }, true);
            
            // 点击选择事件
            document.addEventListener('click', function(e) {
                if (!isEnabled) return;
                
                const target = e.target;
                
                // 跳过测试元素
                if (target.id === 'dom-agent-test') return;
                
                console.log('🎯 Element selected:', target.tagName, target.className);
                
                // 清除所有选中状态
                document.querySelectorAll('.dom-agent-selected').forEach(el => {
                    el.classList.remove('dom-agent-selected');
                });
                
                // 添加选中状态
                target.classList.remove('dom-agent-highlight');
                target.classList.add('dom-agent-selected');
                
                // 获取元素信息
                const rect = target.getBoundingClientRect();
                const elementInfo = {
                    tagName: target.tagName.toLowerCase(),
                    id: target.id || null,
                    className: target.className || null,
                    textContent: target.textContent?.substring(0, 100) || null,
                    boundingBox: {
                        x: Math.round(rect.x),
                        y: Math.round(rect.y),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    },
                    attributes: {}
                };
                
                // 获取属性
                Array.from(target.attributes).forEach(attr => {
                    elementInfo.attributes[attr.name] = attr.value;
                });
                
                console.log('📊 Element info:', elementInfo);
                
                // 发送到VS Code (如果可用)
                if (typeof acquireVsCodeApi !== 'undefined') {
                    try {
                        const vscode = acquireVsCodeApi();
                        vscode.postMessage({
                            type: 'element-selected',
                            payload: { element: elementInfo }
                        });
                        console.log('📤 Sent to VS Code');
                    } catch (err) {
                        console.log('⚠️ VS Code API not available:', err);
                    }
                }
                
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, true);
            
            console.log('🎯 DOM Agent Element Selector Ready!');
            
        })();
        </script>
        `;
    }
}