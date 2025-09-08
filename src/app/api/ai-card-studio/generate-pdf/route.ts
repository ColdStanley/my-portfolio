import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { marked } from 'marked'

interface GeneratePDFRequest {
  cardName: string
  aiContent: string
  generatedAt?: string
}

// Convert markdown to HTML using marked library
function convertMarkdownToHTML(markdownContent: string): string {
  try {
    console.log('Converting markdown, length:', markdownContent.length)
    
    // Configure marked for better compatibility
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false
    })
    
    const result = marked(markdownContent) as string
    console.log('Markdown converted successfully, HTML length:', result.length)
    return result
  } catch (error) {
    console.error('Markdown conversion error:', error)
    // Fallback to basic text
    return `<p>${markdownContent.replace(/\n/g, '<br>')}</p>`
  }
}


function generateAICardHTML(data: GeneratePDFRequest): string {
  const { cardName, aiContent, generatedAt } = data
  const timestamp = generatedAt || new Date().toLocaleString()
  
  // Convert entire markdown content to HTML in one go for better processing
  const htmlContent = convertMarkdownToHTML(aiContent)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cardName} - AI Generated Content</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      font-size: 14px;
      background: white;
      margin: 0;
      padding: 0;
    }
    
    .document {
      max-width: 100%;
      padding: 30px;
      background: white;
      min-height: 100vh;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
    
    .content-wrapper {
      background: white;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-family: inherit;
      line-height: 1.6;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    /* Clean markdown styling */
    .content-wrapper h1, .content-wrapper h2, .content-wrapper h3, .content-wrapper h4, .content-wrapper h5, .content-wrapper h6 {
      color: #1f2937;
      font-weight: 600;
      margin: 16px 0 8px 0;
      line-height: 1.3;
    }
    
    .content-wrapper h1 { font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    .content-wrapper h2 { font-size: 20px; }
    .content-wrapper h3 { font-size: 18px; }
    .content-wrapper h4 { font-size: 16px; }
    .content-wrapper h5 { font-size: 14px; }
    .content-wrapper h6 { font-size: 14px; }
    
    .content-wrapper p {
      color: #1f2937;
      margin: 12px 0;
      line-height: 1.6;
      font-size: 14px;
    }
    
    .content-wrapper ul, .content-wrapper ol {
      margin: 12px 0;
      padding-left: 24px;
      color: #1f2937;
      font-size: 14px;
    }
    
    .content-wrapper li {
      margin: 4px 0;
      line-height: 1.6;
      color: #1f2937;
      font-size: 14px;
    }
    
    .content-wrapper strong {
      font-weight: 700;
      color: #1f2937;
    }
    
    .content-wrapper em {
      font-style: italic;
    }
    
    .content-wrapper code {
      background: #f1f5f9;
      color: #1e293b;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
    
    .content-wrapper pre {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px;
      margin: 16px 0;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .content-wrapper pre code {
      background: none;
      padding: 0;
      border-radius: 0;
    }
    
    .content-wrapper blockquote {
      border-left: 4px solid #7c3aed;
      padding-left: 16px;
      margin: 16px 0;
      color: #6b7280;
      font-style: italic;
    }
    
    .content-wrapper a {
      color: #7c3aed;
      text-decoration: underline;
    }
    
    .content-wrapper hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 24px 0;
    }
    
    .content-wrapper table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13px;
    }
    
    .content-wrapper th, .content-wrapper td {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      text-align: left;
    }
    
    .content-wrapper th {
      background: #f8fafc;
      font-weight: 600;
      color: #374151;
    }
    
    .content-wrapper td {
      color: #1f2937;
      font-size: 13px;
    }
    
    .content-wrapper img {
      max-width: 100%;
      height: auto;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: right;
      font-size: 10px;
      color: #9ca3af;
    }
    
    /* Print optimizations */
    @media print {
      body { 
        font-size: 11px; 
      }
      .document { 
        padding: 20px; 
      }
      .content-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="document">
    <!-- Header -->
    <div class="header">
      <h1>${cardName}</h1>
    </div>

    <!-- AI Content -->
    <div class="content-wrapper">
      ${htmlContent}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>By AI Card Studio | Stanley Hi ${timestamp}</p>
    </div>
  </div>
</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  console.log('=== PDF Generation Request Started ===')
  
  try {
    const body: GeneratePDFRequest = await request.json()
    console.log('Request body:', { cardName: body.cardName, contentLength: body.aiContent?.length })
    
    const { cardName, aiContent } = body

    // Basic validation
    if (!cardName?.trim()) {
      console.log('Error: Card name missing')
      return NextResponse.json(
        { success: false, error: 'Card name is required' },
        { status: 400 }
      )
    }

    if (!aiContent?.trim()) {
      console.log('Error: AI content missing')
      return NextResponse.json(
        { success: false, error: 'AI content is required' },
        { status: 400 }
      )
    }

    console.log('Generating HTML content...')
    // Generate HTML content
    const htmlContent = generateAICardHTML(body)
    console.log('HTML content generated, length:', htmlContent.length)

    console.log('Launching Puppeteer...')
    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-extensions',
        '--no-first-run',
        '--disable-default-apps'
      ],
      timeout: 30000  // 30 seconds launch timeout
    })

    console.log('Creating new page...')
    const page = await browser.newPage()
    
    console.log('Setting page content...')
    // Set content and wait for rendering - use simpler wait strategy
    await page.setContent(htmlContent, { 
      waitUntil: 'load',
      timeout: 10000
    })
    
    console.log('Content set, proceeding to PDF generation...')
    // Minimal wait - PDF generation should be fast
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Generating PDF...')
    const pdfBuffer = await page.pdf({
      format: 'a4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '15mm',
        right: '15mm', 
        bottom: '15mm',
        left: '15mm'
      },
      displayHeaderFooter: false,
      timeout: 10000  // 10 seconds timeout
    })

    console.log('PDF generated, size:', pdfBuffer.length)
    await browser.close()
    console.log('Browser closed')

    // Generate filename
    const cleanCardName = cardName.replace(/[^a-z0-9]/gi, '_')
    const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const filename = `${cleanCardName}_${timestamp}.pdf`
    console.log('Generated filename:', filename)

    console.log('Returning PDF response...')
    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error: any) {
    console.error('=== PDF Generation Error ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('================================')
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate PDF', 
        details: error.message,
        type: error.constructor.name 
      },
      { status: 500 }
    )
  }
}