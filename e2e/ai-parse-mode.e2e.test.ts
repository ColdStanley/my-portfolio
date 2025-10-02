/**
 * AI Parse Mode E2E Tests
 *
 * 测试目标：验证 AI 简历解析功能的完整流程
 *
 * 学习要点：
 * 1. Playwright 基础用法（page.goto, page.click, page.fill）
 * 2. 文件上传测试（page.setInputFiles）
 * 3. 等待策略（waitForSelector, waitForTimeout）
 * 4. localStorage 数据验证（page.evaluate）
 * 5. Mock API 请求（page.route）
 */

import { test, expect } from '@playwright/test'
import path from 'path'

// 测试前准备：清空 localStorage
test.beforeEach(async ({ page }) => {
  await page.goto('/swiftapply')

  // 清空所有数据，模拟新用户
  await page.evaluate(() => {
    localStorage.clear()
  })

  // 刷新页面使状态生效
  await page.reload()
})

/**
 * 测试 1: 完整的 AI Parse 流程（Happy Path）
 *
 * 步骤：
 * 1. 点击 Setup 按钮
 * 2. 选择 "Upload PDF"
 * 3. 上传测试简历文件
 * 4. 等待解析完成
 * 5. 输入目标角色
 * 6. 生成模板
 * 7. 保存并关闭
 * 8. 验证数据已存储
 */
test('AI Parse Mode - Complete Flow', async ({ page }) => {
  // 跳过：需要真实 API Keys 和测试文件
  test.skip(true, 'Requires real API keys and test PDF file')

  // Step 1: 点击 Setup 按钮
  await page.goto('/swiftapply')

  // 查找包含 "Setup" 文字的按钮并点击
  // :has-text() 是 Playwright 的选择器，匹配包含指定文本的元素
  await page.click('button:has-text("Setup")')

  // Step 2: 选择 "Upload PDF" 选项
  // 等待下拉菜单出现（因为有动画）
  await page.waitForSelector('text=Upload PDF', { timeout: 2000 })
  await page.click('text=Upload PDF')

  // Step 3: 上传测试文件
  // 需要准备一个真实的测试简历文件
  const testPdfPath = path.join(__dirname, 'fixtures', 'test-resume.pdf')

  // setInputFiles 用于文件上传
  // input[type="file"] 是文件选择器
  await page.setInputFiles('input[type="file"]', testPdfPath)

  // Step 4: 等待解析完成
  // waitForSelector 会等待元素出现（最多 30 秒）
  await page.waitForSelector('text=Parsing Complete', { timeout: 30000 })

  // 验证进度条到达 Step 3
  // 短暂延迟等待自动跳转完成
  await page.waitForTimeout(1000)

  const step3Active = await page.locator('.bg-primary:has-text("3")').isVisible()
  expect(step3Active).toBe(true)

  // Step 5: 输入目标角色
  // placeholder 是模糊匹配，*= 表示包含
  const roleInput = page.locator('input[placeholder*="Software Engineer"]')
  await roleInput.fill('Frontend Developer')

  // Step 6: 生成模板
  await page.click('button:has-text("Generate")')

  // 等待 API 请求完成（可能需要 5-15 秒）
  await page.waitForSelector('text=Frontend Developer', { timeout: 20000 })

  // 验证模板卡片显示
  const templateCard = await page.locator('div:has-text("bullet points")').count()
  expect(templateCard).toBeGreaterThan(0)

  // Step 7: 保存并关闭
  await page.click('button:has-text("Save & Finish")')

  // 等待 Modal 关闭
  await page.waitForTimeout(500)

  // Step 8: 验证数据已保存到 localStorage
  // page.evaluate 在浏览器上下文中执行代码
  const savedTemplates = await page.evaluate(() => {
    const data = localStorage.getItem('swiftapply-templates')
    return data ? JSON.parse(data) : []
  })

  expect(savedTemplates.length).toBeGreaterThan(0)
  expect(savedTemplates[0]).toHaveProperty('title')
  expect(savedTemplates[0]).toHaveProperty('targetRole')
  expect(savedTemplates[0]).toHaveProperty('content')

  console.log('✓ Saved templates:', savedTemplates.length)
})

/**
 * 测试 2: 文件大小限制
 *
 * 验证：上传超过 5MB 的文件应该被拒绝
 */
test('AI Parse Mode - File Size Limit', async ({ page }) => {
  // Mock API 响应，模拟文件过大错误
  // page.route 拦截网络请求
  await page.route('**/api/swiftapply/parse-resume', async (route) => {
    // 返回自定义响应
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'File size exceeds 5MB limit' })
    })
  })

  await page.goto('/swiftapply')
  await page.click('button:has-text("Setup")')
  await page.waitForSelector('text=Upload PDF')
  await page.click('text=Upload PDF')

  // 创建一个虚拟文件（无需真实文件，因为 API 已被 mock）
  // 使用 Buffer 创建一个小文件用于测试
  const buffer = Buffer.from('dummy pdf content')
  await page.setInputFiles('input[type="file"]', {
    name: 'large-file.pdf',
    mimeType: 'application/pdf',
    buffer: buffer
  })

  // 验证错误提示显示
  // class 选择器，text-error 是错误提示的样式
  const errorMessage = page.locator('.text-error:has-text("5MB")')
  await expect(errorMessage).toBeVisible({ timeout: 5000 })

  console.log('✓ File size error displayed correctly')
})

/**
 * 测试 3: API 错误处理
 *
 * 验证：当 API 返回错误时，显示友好提示
 */
test('AI Parse Mode - API Error Handling', async ({ page }) => {
  // Mock API 失败
  await page.route('**/api/swiftapply/parse-resume', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Failed to parse resume' })
    })
  })

  await page.goto('/swiftapply')
  await page.click('button:has-text("Setup")')
  await page.waitForSelector('text=Upload PDF')
  await page.click('text=Upload PDF')

  // 使用虚拟文件
  const buffer = Buffer.from('dummy pdf content')
  await page.setInputFiles('input[type="file"]', {
    name: 'test-resume.pdf',
    mimeType: 'application/pdf',
    buffer: buffer
  })

  // 验证错误提示
  const errorMessage = page.locator('.text-error')
  await expect(errorMessage).toBeVisible({ timeout: 5000 })

  console.log('✓ API error handled gracefully')
})

/**
 * 测试 4: 回归测试 - Manual Input 模式仍正常
 *
 * 验证：新功能未破坏原有的手动输入模式
 */
test('Regression - Manual Input Still Works', async ({ page }) => {
  await page.goto('/swiftapply')

  // 点击 Setup
  await page.click('button:has-text("Setup")')

  // 选择 Manual Input
  await page.waitForSelector('text=Manual Input')
  await page.click('text=Manual Input')

  // 验证原 SettingsModal 打开
  // 检查 Step 1 标题是否显示
  const personalInfoTitle = page.locator('h3:has-text("Basic Information")')
  await expect(personalInfoTitle).toBeVisible({ timeout: 3000 })

  // 填写基本信息
  await page.fill('input[type="text"]', 'Test User')
  await page.fill('input[type="email"]', 'test@example.com')

  // 验证输入成功
  const nameInput = page.locator('input[type="text"]').first()
  await expect(nameInput).toHaveValue('Test User')

  console.log('✓ Manual Input mode works correctly')
})

/**
 * 测试 5: 新用户 UI 提示
 *
 * 验证：新用户访问时，Setup 按钮有脉动动画
 */
test('New User - Pulse Animation', async ({ page }) => {
  // localStorage 已在 beforeEach 清空，模拟新用户
  await page.goto('/swiftapply')

  // 检查 Setup 按钮是否有 animate-pulse class
  const setupButton = page.locator('button:has-text("Setup")')

  // getByRole 是推荐的选择器方式（更符合可访问性）
  const hasAnimation = await setupButton.evaluate((el) => {
    return el.className.includes('animate-pulse')
  })

  expect(hasAnimation).toBe(true)
  console.log('✓ New user sees pulse animation')
})

/**
 * 测试 6: Dropdown 点击外部关闭
 *
 * 验证：点击下拉菜单外部区域，菜单自动关闭
 */
test('Dropdown - Click Outside to Close', async ({ page }) => {
  await page.goto('/swiftapply')

  // 打开下拉菜单
  await page.click('button:has-text("Setup")')
  await page.waitForSelector('text=Upload PDF')

  // 验证菜单可见
  const dropdown = page.locator('text=Upload PDF')
  await expect(dropdown).toBeVisible()

  // 点击外部区域（例如页面标题）
  await page.click('h1:has-text("SwiftApply")')

  // 等待菜单关闭
  await page.waitForTimeout(300)

  // 验证菜单已隐藏
  await expect(dropdown).not.toBeVisible()

  console.log('✓ Dropdown closes when clicking outside')
})

/**
 * 学习总结：
 *
 * 1. test() - 定义测试用例
 * 2. test.beforeEach() - 每个测试前的准备工作
 * 3. page.goto() - 访问页面
 * 4. page.click() - 点击元素
 * 5. page.fill() - 填写表单
 * 6. page.setInputFiles() - 上传文件
 * 7. page.waitForSelector() - 等待元素出现
 * 8. page.locator() - 查找元素
 * 9. page.evaluate() - 在浏览器执行代码
 * 10. page.route() - Mock API 请求
 * 11. expect() - 断言验证
 *
 * 常用选择器：
 * - 'button:has-text("xxx")' - 包含文字的按钮
 * - 'text=xxx' - 包含文字的任意元素
 * - 'input[type="text"]' - CSS 选择器
 * - '.class-name' - class 选择器
 * - 'input[placeholder*="xxx"]' - 属性包含匹配
 */
