import { test, expect, Page } from '@playwright/test'
import path from 'path'

test.describe('Settings Modal - Data Management E2E', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()

    // Navigate to SwiftApply page
    await page.goto('/swiftapply')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('should navigate to Step 3 Data Backup successfully', async () => {
    // Open settings modal (assuming there's a settings button)
    await page.click('[aria-label="Open Settings"]')

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Click on Step 3: Data Backup
    await page.click('text=Data Backup')

    // Verify we're on Step 3
    await expect(page.locator('text=Step 3 of 3')).toBeVisible()
    await expect(page.locator('text=Data Backup & Restore')).toBeVisible()

    // Verify export and import sections are visible
    await expect(page.locator('text=Export Data')).toBeVisible()
    await expect(page.locator('text=Import Data')).toBeVisible()
    await expect(page.locator('text=Export Backup File')).toBeVisible()
    await expect(page.locator('text=Select Backup File')).toBeVisible()
  })

  test('should show correct data overview when no data exists', async () => {
    // Open settings and go to Step 3
    await page.click('[aria-label="Open Settings"]')
    await page.click('text=Data Backup')

    // Check data overview shows no data
    await expect(page.locator('text=No data to export')).toBeVisible()

    // Export button should be disabled
    await expect(page.locator('text=Export Backup File')).toBeDisabled()
  })

  test('should export data successfully after adding personal info', async () => {
    // First, add some personal info
    await page.click('[aria-label="Open Settings"]')

    // Step 1: Add personal info
    await page.fill('input[type="text"]', 'John Doe')
    await page.fill('input[type="email"]', 'john@example.com')

    // Go to Step 3
    await page.click('text=Data Backup')

    // Verify data overview shows configured data
    await expect(page.locator('text=Configured')).toBeVisible()

    // Set up download listener
    const downloadPromise = page.waitForEvent('download')

    // Click export button
    await page.click('text=Export Backup File')

    // Wait for download and verify
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/swiftapply-backup-\d{4}-\d{2}-\d{2}\.json/)
  })

  test('should show success message after successful export', async () => {
    // Add some data first
    await page.click('[aria-label="Open Settings"]')
    await page.fill('input[type="text"]', 'Jane Smith')
    await page.click('text=Data Backup')

    // Mock download to avoid actual file download in test
    await page.evaluate(() => {
      // Override createObjectURL to prevent actual download
      window.URL.createObjectURL = () => 'mock-url'
    })

    // Click export
    await page.click('text=Export Backup File')

    // Verify success message appears
    await expect(page.locator('text=Data exported successfully!')).toBeVisible()

    // Success message should disappear after a few seconds
    await expect(page.locator('text=Data exported successfully!')).toBeHidden({ timeout: 4000 })
  })

  test('should import valid JSON file successfully', async () => {
    // Prepare test data file
    const testData = {
      personalInfo: {
        fullName: 'Imported User',
        email: 'imported@example.com',
        phone: '+1234567890',
        location: 'Test City',
        linkedin: '',
        website: '',
        summary: ['Imported summary'],
        technicalSkills: ['JavaScript'],
        languages: ['English'],
        education: [],
        certificates: [],
        customModules: [],
        format: 'A4'
      },
      templates: [
        {
          id: '1',
          title: 'Imported Template',
          targetRole: 'Test Role',
          content: ['Imported experience']
        }
      ],
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    // Create temporary test file
    const testFilePath = path.join(__dirname, 'test-data.json')
    const fs = require('fs')
    fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2))

    try {
      // Open settings and go to Step 3
      await page.click('[aria-label="Open Settings"]')
      await page.click('text=Data Backup')

      // Upload the test file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testFilePath)

      // Verify success message
      await expect(page.locator('text=Data imported successfully!')).toBeVisible()

      // Verify data overview updated
      await expect(page.locator('text=Configured')).toBeVisible()
      await expect(page.locator('text=1 template')).toBeVisible()

      // Go to Step 1 to verify personal info was imported
      await page.click('text=Personal Info')
      await expect(page.locator('input[value="Imported User"]')).toBeVisible()
      await expect(page.locator('input[value="imported@example.com"]')).toBeVisible()

    } finally {
      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
      }
    }
  })

  test('should show error for invalid JSON file', async () => {
    // Create invalid JSON file
    const invalidFilePath = path.join(__dirname, 'invalid-data.json')
    const fs = require('fs')
    fs.writeFileSync(invalidFilePath, 'invalid json content')

    try {
      // Open settings and go to Step 3
      await page.click('[aria-label="Open Settings"]')
      await page.click('text=Data Backup')

      // Upload invalid file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(invalidFilePath)

      // Verify error message appears
      await expect(page.locator('text=Invalid file format or corrupted data')).toBeVisible()

    } finally {
      // Clean up test file
      if (fs.existsSync(invalidFilePath)) {
        fs.unlinkSync(invalidFilePath)
      }
    }
  })

  test('should show error for empty JSON file', async () => {
    // Create empty JSON file
    const emptyFilePath = path.join(__dirname, 'empty-data.json')
    const fs = require('fs')
    fs.writeFileSync(emptyFilePath, '{}')

    try {
      // Open settings and go to Step 3
      await page.click('[aria-label="Open Settings"]')
      await page.click('text=Data Backup')

      // Upload empty file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(emptyFilePath)

      // Verify error message for no valid data
      await expect(page.locator('text=No valid data found in file')).toBeVisible()

    } finally {
      // Clean up test file
      if (fs.existsSync(emptyFilePath)) {
        fs.unlinkSync(emptyFilePath)
      }
    }
  })

  test('should complete full export-import cycle', async () => {
    // Step 1: Add initial data
    await page.click('[aria-label="Open Settings"]')
    await page.fill('input[type="text"]', 'Cycle Test User')
    await page.fill('input[type="email"]', 'cycle@example.com')

    // Add a template in Step 2
    await page.click('text=Templates')
    await page.click('text=Add Template')
    await page.fill('input[placeholder*="Software Engineer"]', 'Test Template')
    await page.fill('input[placeholder*="Senior Developer"]', 'Test Role')
    await page.fill('textarea[placeholder*="experience"]', 'Test experience content')
    await page.click('text=Save Template')

    // Step 2: Export data
    await page.click('text=Data Backup')

    const downloadPromise = page.waitForEvent('download')
    await page.click('text=Export Backup File')
    const download = await downloadPromise
    const downloadPath = await download.path()

    // Step 3: Clear data (simulate new environment)
    // Go back to personal info and clear it
    await page.click('text=Personal Info')
    await page.fill('input[type="text"]', '')
    await page.fill('input[type="email"]', '')

    // Verify data is cleared
    await page.click('text=Data Backup')
    await expect(page.locator('text=No data to export')).toBeVisible()

    // Step 4: Import the exported data
    if (downloadPath) {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(downloadPath)

      // Verify import success
      await expect(page.locator('text=Data imported successfully!')).toBeVisible()

      // Verify data is restored
      await expect(page.locator('text=Configured')).toBeVisible()
      await expect(page.locator('text=1 template')).toBeVisible()

      // Verify personal info is restored
      await page.click('text=Personal Info')
      await expect(page.locator('input[value="Cycle Test User"]')).toBeVisible()
      await expect(page.locator('input[value="cycle@example.com"]')).toBeVisible()
    }
  })
})