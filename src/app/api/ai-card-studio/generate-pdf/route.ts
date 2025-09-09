import { NextRequest, NextResponse } from 'next/server'
import MarkdownIt from 'markdown-it'

// Vercel runtime configuration
export const runtime = 'nodejs'
export const maxDuration = 45  // 45 seconds for PDF generation with Chinese font loading

// Unified Puppeteer configuration for all environments
const getPuppeteer = async () => {
  const puppeteer = await import('puppeteer-core')
  const chromium = await import('@sparticuz/chromium')
  return { puppeteer: puppeteer.default, chromium: chromium.default }
}

interface GeneratePDFRequest {
  cardName: string
  content: string  // Raw markdown content
  generatedAt?: string
}

// 处理 POST 请求
export async function POST(req: NextRequest) {
  let browser: any = null
  
  try {
    const body: GeneratePDFRequest = await req.json()
    const { cardName, content, generatedAt } = body

    // Validation
    if (!cardName?.trim()) {
      return NextResponse.json({ error: 'Card name is required' }, { status: 400 })
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required for PDF generation' }, { status: 400 })
    }

    // Convert markdown to HTML using markdown-it
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      breaks: true  // Preserve line breaks
    })
    const htmlContent = md.render(content)

    // 2. Generate complete HTML document with enhanced styling
    const timestamp = generatedAt || new Date().toLocaleString()
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${cardName} - AI Generated Content</title>
          <!-- Google Fonts for Chinese support -->
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            /* Professional PDF Styling - Enhanced for line break preservation */
            @page {
              size: A4;
              margin: 0.6in 0.75in;
            }
            
            * {
              box-sizing: border-box;
            }
            
            html, body {
              font-family: "Noto Sans SC", "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Microsoft YaHei", "Arial Unicode MS", "Helvetica", "Arial", sans-serif;
              font-size: 11pt;
              line-height: 1.6;
              color: #1f2937;
              margin: 0;
              padding: 0;
              background: white;
            }
            
            .document {
              max-width: 100%;
              padding: 0;
              background: white;
              min-height: 100vh;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 1px solid #374151;
            }
            
            .header h1 {
              font-size: 16pt;
              font-weight: 700;
              color: #1f2937;
              margin: 0;
              text-align: left;
            }
            
            .timestamp {
              font-size: 9pt;
              color: #6b7280;
              white-space: nowrap;
            }
            
            .content-wrapper {
              background: white;
              padding: 0;
              margin: 0;
              word-wrap: break-word;
              overflow-wrap: break-word;
              white-space: pre-wrap; /* CRITICAL: Preserve whitespace and line breaks */
            }
            
            /* Enhanced content styling - preserving line breaks */
            h1, h2, h3, h4, h5, h6 {
              color: #1f2937;
              font-weight: 600;
              margin: 12pt 0 6pt 0;
              line-height: 1.3;
              break-after: avoid-page;
              white-space: pre-wrap;
            }
            
            h1 { font-size: 14pt; font-weight: 700; margin-top: 0; }
            h2 { font-size: 12pt; font-weight: 600; }
            h3 { font-size: 11pt; font-weight: 600; }
            h4 { font-size: 11pt; font-weight: 500; }
            h5 { font-size: 10pt; font-weight: 500; }
            h6 { font-size: 10pt; font-weight: 500; }
            
            p {
              color: #4b5563;
              margin: 8pt 0;
              line-height: 1.6;
              font-size: 10.5pt;
              white-space: pre-wrap; /* CRITICAL: Preserve line breaks in paragraphs */
              break-inside: auto; /* Allow breaking for long content */
            }
            
            ul, ol {
              margin: 8pt 0;
              padding-left: 16pt;
              color: #4b5563;
              font-size: 10.5pt;
            }
            
            ul {
              list-style: none;
            }
            
            ol {
              list-style: decimal;
              padding-left: 20pt;
            }
            
            ul li, ol li {
              margin: 3pt 0;
              line-height: 1.6;
              color: #4b5563;
              font-size: 10.5pt;
              position: relative;
              white-space: pre-wrap; /* CRITICAL: Preserve line breaks in list items */
              break-inside: auto;
            }
            
            ul li::before {
              content: "•";
              position: absolute;
              left: -12pt;
              color: #1f2937;
            }
            
            strong {
              font-weight: 700;
              color: #1f2937;
            }
            
            em {
              font-style: italic;
            }
            
            code {
              background: #f3f4f6;
              color: #374151;
              padding: 1pt 3pt;
              border-radius: 2pt;
              font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
              font-size: 9.5pt;
              white-space: pre-wrap;
            }
            
            pre {
              background: #f9fafb;
              border: 1pt solid #e5e7eb;
              border-radius: 4pt;
              padding: 12pt;
              margin: 12pt 0;
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
              break-inside: auto;
            }
            
            pre code {
              background: none;
              padding: 0;
              border-radius: 0;
              font-size: 9pt;
              white-space: pre-wrap;
            }
            
            blockquote {
              border-left: 3pt solid #8b5cf6;
              padding-left: 12pt;
              margin: 12pt 0;
              color: #6b7280;
              font-style: italic;
              white-space: pre-wrap;
              break-inside: auto;
            }
            
            a {
              color: #8b5cf6;
              text-decoration: underline;
            }
            
            hr {
              border: none;
              border-top: 1pt solid #e5e7eb;
              margin: 16pt 0;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12pt 0;
              font-size: 9.5pt;
              break-inside: auto;
            }
            
            th, td {
              border: 1pt solid #e5e7eb;
              padding: 6pt 8pt;
              text-align: left;
              white-space: pre-wrap;
            }
            
            th {
              background: #f8fafc;
              font-weight: 600;
              color: #374151;
            }
            
            td {
              color: #4b5563;
              font-size: 9.5pt;
            }
            
            img {
              max-width: 100%;
              height: auto;
            }
            
            .footer {
              margin-top: 24pt;
              padding-top: 12pt;
              border-top: 1pt solid #e5e7eb;
              text-align: center;
              font-size: 8pt;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="document">
            <!-- Header - Professional Layout -->
            <div class="header">
              <h1>${cardName}</h1>
              <div class="timestamp">${timestamp}</div>
            </div>

            <!-- AI Content - Enhanced rendering with line break preservation -->
            <div class="content-wrapper">
              ${htmlContent}
            </div>

            <!-- Footer - Clean and minimal -->
            <div class="footer">
              <p>Generated by AI Card Studio</p>
            </div>
          </div>
        </body>
      </html>
    `

    // 3. Unified Puppeteer configuration
    console.log('Launching browser...')
    const { puppeteer, chromium } = await getPuppeteer()
    
    // Determine configuration based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production - use @sparticuz/chromium
      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--font-render-hinting=none',
          '--disable-font-subpixel-positioning',
          '--disable-lcd-text'
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true
      })
    } else {
      // Development - use system Chrome/Chromium or bundled browser
      try {
        // Try to find system Chrome first
        const possiblePaths = [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
          '/usr/bin/google-chrome',
          '/usr/bin/chromium-browser'
        ]
        
        let executablePath = null
        for (const path of possiblePaths) {
          try {
            require('fs').accessSync(path)
            executablePath = path
            break
          } catch (e) {
            continue
          }
        }
        
        browser = await puppeteer.launch({
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--font-render-hinting=none',
            '--disable-font-subpixel-positioning',
            '--disable-lcd-text'
          ],
          executablePath, // null will use bundled Chromium if available
          headless: 'new',
          ignoreHTTPSErrors: true
        })
      } catch (devError) {
        console.error('Development browser launch failed:', devError)
        throw new Error('Could not launch browser in development environment')
      }
    }

    const page = await browser.newPage()

    // Optimized for Vercel serverless environment
    console.log('Setting content...')
    await page.setContent(fullHtml, { 
      waitUntil: 'networkidle0',
      timeout: 10000  // Reduced timeout for serverless
    })
    
    // Enhanced font loading for Chinese fonts
    await page.evaluateOnNewDocument(() => {
      // Preload Chinese font
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = 'https://fonts.gstatic.com/s/notosanssc/v36/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5HE.woff2';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Wait for fonts to load with extended timeout for Chinese fonts
    await Promise.race([
      page.evaluate(async () => {
        await document.fonts.ready;
        // Additional check to ensure Chinese fonts are loaded
        await document.fonts.load('12px "Noto Sans SC"');
        return true;
      }),
      new Promise(resolve => setTimeout(resolve, 8000))  // Increased to 8s for Chinese fonts
    ])

    // 4. Generate PDF optimized for Vercel
    console.log('Generating PDF...')
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    })

    await browser.close()
    browser = null

    // 5. Return PDF binary data (filename controlled by frontend)
    console.log('PDF generated successfully')
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error: any) {
    console.error('PDF generation error:', error)
    
    // Ensure browser is closed 11
    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Error closing browser:', closeError)
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to generate PDF', 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}