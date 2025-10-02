# Test Fixtures

This folder contains test files for automated testing.

## Required Files

### 1. test-resume.pdf
A sample resume in PDF format for testing the AI parse mode.

**How to create:**
- Use any real or mock resume
- Save as PDF
- File size: < 5MB
- Should contain: name, email, work experience, education

### 2. large-file.pdf (Optional)
A file > 5MB for testing file size limits.

**How to create:**
```bash
# macOS/Linux: Create a 6MB dummy file
dd if=/dev/zero of=large-file.pdf bs=1m count=6
```

## Usage in Tests

```typescript
const testPdfPath = path.join(__dirname, 'fixtures', 'test-resume.pdf')
await page.setInputFiles('input[type="file"]', testPdfPath)
```

## Note

Real PDF files are **not committed** to git for privacy.
Add your own test files locally before running E2E tests.
