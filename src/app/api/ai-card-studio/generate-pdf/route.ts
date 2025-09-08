import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// Enhanced structured data interface (matching frontend parser)
interface ParsedContent {
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'blockquote' | 'table' | 'hr' | 'image'
  level?: number  // for headings (1-6)
  content: string
  items?: string[]  // for lists
  language?: string  // for code blocks
  inline?: boolean   // for inline code
  listType?: 'ordered' | 'unordered'  // for lists
  src?: string  // for images
  alt?: string  // for images
  headers?: string[]  // for tables
  rows?: string[][]  // for tables
}

interface GeneratePDFRequest {
  cardName: string
  parsedContent: ParsedContent[]
  generatedAt?: string
}

// Process inline formatting (bold, italic, code, links)
function processInlineFormatting(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic  
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

// Enhanced HTML conversion for Info Card & AI Tool Card content
function convertStructuredContentToHTML(content: ParsedContent[]): string {
  return content.map(item => {
    switch (item.type) {
      case 'heading':
        const level = Math.min(Math.max(item.level || 1, 1), 6)
        return `<h${level}>${processInlineFormatting(item.content)}</h${level}>`
        
      case 'paragraph':
        return `<p>${processInlineFormatting(item.content)}</p>`
        
      case 'list':
        if (item.items && item.items.length > 0) {
          const listItems = item.items.map(listItem => 
            `<li>${processInlineFormatting(listItem)}</li>`
          ).join('')
          const listTag = item.listType === 'ordered' ? 'ol' : 'ul'
          return `<${listTag}>${listItems}</${listTag}>`
        }
        return ''
        
      case 'code':
        if (item.inline) {
          return `<code>${item.content}</code>`
        } else {
          return `<pre><code${item.language ? ` class="language-${item.language}"` : ''}>${item.content}</code></pre>`
        }
        
      case 'blockquote':
        return `<blockquote>${processInlineFormatting(item.content)}</blockquote>`
        
      case 'table':
        if (item.headers && item.rows) {
          const headerRow = item.headers.map(h => `<th>${processInlineFormatting(h)}</th>`).join('')
          const bodyRows = item.rows.map(row => 
            `<tr>${row.map(cell => `<td>${processInlineFormatting(cell)}</td>`).join('')}</tr>`
          ).join('')
          return `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`
        }
        return ''
        
      case 'image':
        return `<img src="${item.src}" alt="${item.alt || ''}" />`
        
      case 'hr':
        return '<hr>'
        
      default:
        return `<p>${processInlineFormatting(item.content || '')}</p>`
    }
  }).join('')
}


function generateAICardHTML(data: GeneratePDFRequest): string {
  const { cardName, parsedContent, generatedAt } = data
  const timestamp = generatedAt || new Date().toLocaleString()
  
  // Convert structured content to HTML (no more markdown parsing)
  const htmlContent = convertStructuredContentToHTML(parsedContent)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cardName} - AI Generated Content</title>
  <style>
    /* Professional PDF Styling - Based on JD2CV Full */
    @page {
      size: A4;
      margin: 0.6in 0.75in;
    }
    
    * {
      box-sizing: border-box;
    }
    
    html, body {
      font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", "WenQuanYi Zen Hei", "WenQuanYi Micro Hei", sans-serif;
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
      page-break-inside: avoid;
    }
    
    /* Professional content styling - matching frontend display */
    h1, h2, h3, h4, h5, h6 {
      color: #1f2937;
      font-weight: 600;
      margin: 12pt 0 6pt 0;
      line-height: 1.3;
      break-after: avoid-page;
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
      break-inside: avoid;
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
      break-inside: avoid;
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
      break-inside: avoid;
    }
    
    pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-size: 9pt;
    }
    
    blockquote {
      border-left: 3pt solid #8b5cf6;
      padding-left: 12pt;
      margin: 12pt 0;
      color: #6b7280;
      font-style: italic;
      break-inside: avoid;
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
      break-inside: avoid;
    }
    
    th, td {
      border: 1pt solid #e5e7eb;
      padding: 6pt 8pt;
      text-align: left;
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

    <!-- AI Content - Direct rendering without wrapper -->
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
}

export async function POST(request: NextRequest) {
  console.log('=== PDF Generation Request Started ===')
  
  try {
    const body: GeneratePDFRequest = await request.json()
    console.log('Request body:', { cardName: body.cardName, contentLength: body.parsedContent?.length })
    
    const { cardName, parsedContent } = body

    // Enhanced validation for structured data
    if (!cardName?.trim()) {
      console.log('Error: Card name missing')
      return NextResponse.json(
        { success: false, error: 'Card name is required' },
        { status: 400 }
      )
    }

    if (!parsedContent || !Array.isArray(parsedContent) || parsedContent.length === 0) {
      console.log('Error: Parsed content missing or invalid')
      return NextResponse.json(
        { success: false, error: 'Content is required for PDF generation' },
        { status: 400 }
      )
    }

    console.log('Generating HTML content...')
    // Generate HTML content
    const htmlContent = generateAICardHTML(body)
    console.log('HTML content generated, length:', htmlContent.length)
    
    // Debug: Check if Chinese characters are in HTML
    console.log('Content preview:', htmlContent.substring(320, 400))
    console.log('Contains Chinese chars:', /[\u4e00-\u9fff]/.test(htmlContent))

    console.log('Launching Puppeteer...')
    // Generate PDF using Puppeteer - JD2CV improved configuration
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning',
        '--disable-features=VizDisplayCompositor',
        '--force-color-profile=generic-rgb'
      ]
    })

    const page = await browser.newPage()

    try {
      console.log('Setting page content...')
      
      // Set user agent to ensure proper font loading
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      
      // JD2CV improvement: Better wait strategy
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',  // Wait for network to be idle
        timeout: 30000
      })
      
      // Force font loading completion
      await page.evaluate(() => document.fonts.ready)

      console.log('Generating PDF...')
      // JD2CV improvement: Use CSS @page for sizing, no manual margins
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,  // Use CSS @page settings
        margin: { top: 0, right: 0, bottom: 0, left: 0 }  // CSS controls margins
      })

      await browser.close()

      // JD2CV improvement: File size validation
      const sizeInMB = pdfBuffer.length / (1024 * 1024)
      console.log('PDF generated, size:', `${sizeInMB.toFixed(2)}MB`)

      if (sizeInMB > 2) {
        return NextResponse.json(
          { 
            error: 'PDF exceeds 2MB limit', 
            actualSize: `${sizeInMB.toFixed(2)}MB`,
            suggestion: 'Consider reducing content length'
          },
          { status: 413 }
        )
      }

      // Generate filename (no double cleaning - remove frontend duplication)
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
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'no-cache'
        }
      })

    } catch (pdfError) {
      await browser.close()
      throw pdfError
    }

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