# 🎯 DOM Agent 测试指南

## 📋 重构完成 - 新架构测试

### 🚀 快速测试步骤

1. **启动VS Code**
   - 打开DOM Agent项目文件夹
   - 按 `F5` 或运行 "Run Extension" 调试配置

2. **确认Extension加载**
   ```
   期待的控制台输出：
   🚀 DOM Agent extension is activating...
   ✅ DOM Agent extension activated successfully
   ```
   
   以及VS Code右下角通知：
   ```
   🎯 DOM Agent is ready!
   ```

3. **使用DOM Agent**
   - 按 `Ctrl+Shift+P` 打开命令面板
   - 输入 "DOM Agent: Open URL"
   - 输入任意网址 (如: https://example.com)

4. **测试选择器功能**
   
   **立即应该看到：**
   - 🟨 **黄色横幅** "✓ DOM Agent Active" 显示3秒
   
   **浏览器控制台应该显示：**
   ```
   🎯 DOM Agent Element Selector Loading...
   ✓ Document ready: complete
   ✓ Body exists: true
   ✓ Head exists: true  
   ✓ Styles injected
   ✓ Test element added
   🎯 DOM Agent Element Selector Ready!
   ```
   
   **交互测试：**
   - 移动鼠标到页面元素上 → 应该显示🔵蓝色outline高亮
   - 点击任意元素 → 应该显示🔴红色选中状态
   - 控制台应该显示：
     ```
     👆 Mouse over: DIV some-class
     🎯 Element selected: DIV some-class
     📊 Element info: {...}
     📤 Sent to VS Code
     ```

## 🛠️ 故障排除

### 如果看不到选择器功能：

1. **检查Extension是否加载**
   - 查看VS Code控制台是否有DOM Agent的启动日志
   - 确认看到 "🎯 DOM Agent is ready!" 通知

2. **检查Webview是否正确显示**
   - 确认DOM Agent webview panel已打开
   - 检查webview中是否显示了网页内容

3. **检查浏览器控制台**
   - 打开webview的开发者工具（右键 → "检查"）
   - 查看是否有上述的DOM Agent日志输出
   - 检查是否有JavaScript错误

4. **检查编译输出**
   - 确认 `out/extension.js` 文件存在且是最新的
   - 运行 `npm run compile` 重新编译

## 🏗️ 架构说明

### 新架构特点：
- ✅ **ElementSelector类** - 独立的选择器逻辑，不依赖HTML处理
- ✅ **简化的处理流程** - HTML清理与脚本注入完全分离
- ✅ **丰富的调试信息** - 每个步骤都有详细日志
- ✅ **即时视觉反馈** - 测试元素立即显示功能状态
- ✅ **VS Code集成** - 选中元素信息直接发送到VS Code

### 如果一切正常，你会看到：
1. 🟨 黄色测试横幅（证明JavaScript执行正常）
2. 🔵 蓝色高亮框（证明鼠标事件工作正常）  
3. 🔴 红色选中框（证明点击事件工作正常）
4. 📝 详细的控制台日志（证明所有功能正常）

---

**如果仍然有问题，请查看控制台错误信息！** 🔍