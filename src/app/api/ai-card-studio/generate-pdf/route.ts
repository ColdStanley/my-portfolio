import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { remark } from 'remark'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

interface GeneratePDFRequest {
  cardName: string
  aiContent: string
  generatedAt?: string
}

// Convert markdown to HTML using the same processing pipeline as the frontend
async function convertMarkdownToHTML(markdownContent: string): Promise<string> {
  const result = await remark()
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(markdownContent)
  
  return String(result)
}


async function generateAICardHTML(data: GeneratePDFRequest): Promise<string> {
  const { cardName, aiContent, generatedAt } = data
  const timestamp = generatedAt || new Date().toLocaleString()
  
  // Convert entire markdown content to HTML in one go for better processing
  const htmlContent = await convertMarkdownToHTML(aiContent)

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
      line-height: 1.7;
      color: #333;
      font-size: 12px;
      background: white;
    }
    
    .document {
      max-width: 100%;
      padding: 40px;
      background: white;
      min-height: 100vh;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 25px;
      margin-bottom: 35px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 12px;
    }
    
    
    .content-section {
      margin-bottom: 30px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .content-wrapper {
      background: #f8fafc;
      padding: 25px;
      border-radius: 12px;
      font-family: inherit;
      line-height: 1.7;
    }
    
    /* Markdown styling to match frontend ReactMarkdown components */
    .content-wrapper h1 {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 12px;
      margin-top: 16px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
    }
    
    .content-wrapper h1:first-child {
      margin-top: 0;
    }
    
    .content-wrapper h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
      margin-top: 12px;
    }
    
    .content-wrapper h2:first-child {
      margin-top: 0;
    }
    
    .content-wrapper h3 {
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 8px;
      margin-top: 8px;
    }
    
    .content-wrapper h3:first-child {
      margin-top: 0;
    }
    
    .content-wrapper h4 {
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 4px;
      margin-top: 8px;
    }
    
    .content-wrapper h4:first-child {
      margin-top: 0;
    }
    
    .content-wrapper p {
      color: #4b5563;
      margin-bottom: 12px;
      line-height: 1.6;
    }
    
    .content-wrapper ul, .content-wrapper ol {
      margin-bottom: 12px;
      color: #4b5563;
      padding-left: 20px;
    }
    
    .content-wrapper li {
      margin-bottom: 4px;
      line-height: 1.6;
    }
    
    .content-wrapper code {
      background: #f3f4f6;
      color: #1f2937;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
    }
    
    .content-wrapper pre {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 12px;
      overflow-x: auto;
      border: 1px solid #e5e7eb;
      margin: 12px 0;
    }
    
    .content-wrapper pre code {
      background: none;
      padding: 0;
      font-size: 11px;
      color: #1f2937;
    }
    
    .content-wrapper blockquote {
      border-left: 4px solid #a855f7;
      padding-left: 12px;
      font-style: italic;
      color: #4b5563;
      margin-bottom: 8px;
    }
    
    .content-wrapper strong {
      font-weight: 600;
      color: #1f2937;
    }
    
    .content-wrapper em {
      font-style: italic;
    }
    
    .content-wrapper a {
      color: #7c3aed;
      text-decoration: underline;
      word-break: break-word;
    }
    
    .content-wrapper hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 16px 0;
    }
    
    .content-wrapper table {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      border-collapse: separate;
      border-spacing: 0;
      margin: 12px 0;
      font-size: 11px;
    }
    
    .content-wrapper thead {
      background: #f9fafb;
    }
    
    .content-wrapper th {
      padding: 8px 12px;
      text-align: left;
      font-weight: 500;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      font-size: 11px;
    }
    
    .content-wrapper td {
      padding: 8px 12px;
      color: #4b5563;
      border-bottom: 1px solid #f3f4f6;
      font-size: 11px;
    }
    
    .content-wrapper tr:last-child td {
      border-bottom: none;
    }
    
    .content-wrapper del {
      text-decoration: line-through;
      color: #6b7280;
    }
    
    .content-wrapper sup {
      font-size: 9px;
    }
    
    .content-wrapper sub {
      font-size: 9px;
    }
    
    .content-wrapper input[type="checkbox"] {
      margin-right: 8px;
      border-radius: 2px;
      border: 1px solid #d1d5db;
      color: #7c3aed;
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
  try {
    const body: GeneratePDFRequest = await request.json()
    const { cardName, aiContent } = body

    // Basic validation
    if (!cardName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Card name is required' },
        { status: 400 }
      )
    }

    if (!aiContent?.trim()) {
      return NextResponse.json(
        { success: false, error: 'AI content is required' },
        { status: 400 }
      )
    }

    // Generate HTML content
    const htmlContent = await generateAICardHTML(body)

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'a4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    await browser.close()

    // Generate filename
    const cleanCardName = cardName.replace(/[^a-z0-9]/gi, '_')
    const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const filename = `${cleanCardName}_${timestamp}.pdf`

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
    console.error('AI Card PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    )
  }
}