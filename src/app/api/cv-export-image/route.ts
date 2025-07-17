import { NextRequest } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const html = body.html

    if (!html || typeof html !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing HTML content' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, sans-serif;
              background: white;
              color: black;
            }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' })

    const buffer = 480
    const { width, height } = await page.evaluate(() => {
      const el = document.body
      const rect = el.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    })

    await page.setViewport({
      width: Math.ceil(width + buffer), // ✅ 防止右侧被截断
      height: Math.ceil(height),
      deviceScaleFactor: 2,
    })

    const screenshot = await page.screenshot({ type: 'png' })
    await browser.close()

    return new Response(screenshot, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename=cv_export.png',
      },
    })
  } catch (e) {
    console.error('Export Error:', e)
    return new Response(JSON.stringify({ error: 'Export failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
