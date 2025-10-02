# AI Parse Mode 测试指南

## 快速开始

### 1. 手动测试（5 分钟）

```bash
npm run dev
```

访问 http://localhost:3000/swiftapply

**测试步骤：**
1. 点击右上角 "Setup" 按钮（应该有脉动动画）
2. 点击 "Upload PDF"
3. 上传一个测试简历（PDF 或 DOCX）
4. 等待解析完成
5. 输入目标角色，如 "Software Engineer"
6. 点击 "Generate"
7. 等待模板生成
8. 点击 "Save & Finish"
9. 刷新页面，检查数据是否保存

**验证点：**
- ✅ Console 有详细日志（`[Parse Resume]`, `[Generate Templates]`, `[AI Mode]`）
- ✅ 错误时显示红色提示
- ✅ 保存后 localStorage 有数据

---

### 2. 自动化测试（推荐）

#### 运行测试（无需准备文件）

```bash
# 运行所有 AI Parse Mode 测试（推荐：只跑 chromium）
npx playwright test ai-parse-mode.e2e.test.ts --project=chromium

# 运行所有浏览器（chromium, firefox, webkit）
npx playwright test ai-parse-mode.e2e.test.ts

# 运行单个测试
npx playwright test ai-parse-mode.e2e.test.ts -g "Regression"

# 带浏览器界面运行（方便调试）
npx playwright test ai-parse-mode.e2e.test.ts --headed --project=chromium

# 慢速模式（方便观察每一步）
npx playwright test ai-parse-mode.e2e.test.ts --headed --slow-mo=1000 --project=chromium

# 查看测试报告
npx playwright show-report
```

**✅ 测试已通过验证：**
```
✓ AI Parse Mode - API Error Handling
✓ AI Parse Mode - File Size Limit
✓ Regression - Manual Input Still Works
✓ New User - Pulse Animation
✓ Dropdown - Click Outside to Close
```

**注意：** 测试使用虚拟文件（Buffer）和 Mock API，无需准备真实简历文件。

---

## 测试用例说明

### Test 1: Complete Flow（完整流程）
**目的：** 验证从上传到保存的完整流程

**需要：**
- 真实的 OpenAI 和 DeepSeek API Keys
- 测试简历文件

**跳过原因：** 需要真实 API，成本较高，建议手动测试

---

### Test 2: File Size Limit（文件大小限制）
**目的：** 验证 > 5MB 文件被拒绝

**技术点：**
```typescript
// Mock API 响应
await page.route('**/api/swiftapply/parse-resume', async (route) => {
  await route.fulfill({
    status: 400,
    body: JSON.stringify({ error: 'File size exceeds 5MB limit' })
  })
})
```

**学习：** `page.route()` 用于拦截和模拟网络请求

---

### Test 3: API Error Handling（API 错误处理）
**目的：** 验证 API 失败时显示友好提示

**验证点：**
- 错误信息显示（`.text-error` class）
- 用户可以关闭并重试

---

### Test 4: Regression Test（回归测试）
**目的：** 确保新功能未破坏 Manual Input 模式

**验证点：**
- 点击 "Manual Input" 打开原 SettingsModal
- 表单可正常填写

---

### Test 5: New User UI（新用户界面）
**目的：** 验证新用户看到脉动动画

**技术点：**
```typescript
const hasAnimation = await setupButton.evaluate((el) => {
  return el.className.includes('animate-pulse')
})
```

**学习：** `evaluate()` 在浏览器上下文执行 JavaScript

---

### Test 6: Dropdown Close（下拉菜单关闭）
**目的：** 验证点击外部区域关闭菜单

**验证点：**
- 点击外部 → 菜单消失
- `not.toBeVisible()` 断言

---

## Playwright 核心概念

### 1. 选择器（Selectors）

```typescript
// 推荐：语义化选择器
page.locator('button:has-text("Setup")')
page.locator('text=Upload PDF')

// CSS 选择器
page.locator('input[type="file"]')
page.locator('.text-error')

// 模糊匹配
page.locator('input[placeholder*="Software"]')
```

### 2. 等待策略（Waiting）

```typescript
// 等待元素出现
await page.waitForSelector('text=Parsing Complete', { timeout: 30000 })

// 固定延迟（尽量避免）
await page.waitForTimeout(1000)

// 等待网络请求完成（推荐）
await page.waitForResponse(response =>
  response.url().includes('/api/parse-resume')
)
```

### 3. 断言（Assertions）

```typescript
// 元素可见性
await expect(element).toBeVisible()
await expect(element).not.toBeVisible()

// 值检查
await expect(input).toHaveValue('Test User')

// 数量检查
expect(templates.length).toBeGreaterThan(0)

// 属性检查
expect(template).toHaveProperty('title')
```

### 4. Mock API（模拟请求）

```typescript
await page.route('**/api/endpoint', async (route) => {
  // 方式 1: 返回自定义响应
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true })
  })

  // 方式 2: 继续原请求
  await route.continue()

  // 方式 3: 中止请求
  await route.abort()
})
```

### 5. 浏览器交互

```typescript
// localStorage 操作
await page.evaluate(() => {
  localStorage.setItem('key', 'value')
  return localStorage.getItem('key')
})

// Console 监听
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('Browser Error:', msg.text())
  }
})

// 截图（调试用）
await page.screenshot({ path: 'screenshot.png' })
```

---

## 调试技巧

### 1. 运行单个测试
```bash
npx playwright test -g "Regression"
```

### 2. 可视化模式
```bash
npx playwright test --headed --slow-mo=1000
```

### 3. 调试器
```typescript
test('debug test', async ({ page }) => {
  await page.pause() // 暂停并打开调试器
})
```

### 4. 查看测试报告
```bash
npx playwright show-report
```

---

## 常见问题

### Q1: 测试超时
**原因：** API 响应慢或元素未出现

**解决：**
```typescript
await page.waitForSelector('text=xxx', { timeout: 30000 })
```

### Q2: 元素找不到
**原因：** 选择器不正确或元素未渲染

**解决：**
```bash
# 查看页面 HTML
await page.screenshot({ path: 'debug.png', fullPage: true })
```

### Q3: Mock 不生效
**原因：** route 设置在请求之后

**解决：** 在操作前先设置 `page.route()`

---

## 推荐测试流程

### 开发阶段
1. 手动测试 1 次（验证功能）
2. 检查 Console 日志
3. 测试 1-2 个错误场景

### 提交前
1. 运行回归测试（Test 4）
2. 手动测试完整流程 1 次

### CI/CD（可选）
1. 运行所有自动化测试
2. 生成测试报告

---

## 学习资源

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright 选择器指南](https://playwright.dev/docs/selectors)
- [Playwright API 参考](https://playwright.dev/docs/api/class-playwright)

---

**总结：**
- 手动测试覆盖核心流程（5 分钟）
- 自动化测试确保回归（1 分钟）
- Mock API 避免真实 API 消耗
- 渐进式学习，从简单测试开始
