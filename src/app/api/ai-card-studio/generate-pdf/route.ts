import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface GeneratePDFRequest {
  cardName: string
  aiContent: string
  generatedAt?: string
}

// Convert markdown formatting to HTML (borrowed logic from JD2CV, adapted for AI content)
function convertMarkdownToHTML(text: string): string {
  return text
    // Convert **bold** to <strong>bold</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>italic</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert line breaks to <br> tags
    .replace(/\n/g, '<br>')
    // Convert URLs to clickable links
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #6366f1; text-decoration: underline;">$1</a>')
}

// Split AI content into logical sections for better PDF layout
function parseAIContentIntoSections(aiContent: string): string[] {
  // Strategy 1: Split by double line breaks (paragraph separation)
  let sections = aiContent.split(/\n\n+/)
  
  if (sections.length > 1) {
    return sections
      .map(section => section.trim())
      .filter(section => section.length > 20) // Filter out very short fragments
  }
  
  // Strategy 2: Split by single line breaks if no paragraph breaks found
  sections = aiContent.split(/\n/)
  
  if (sections.length > 3) {
    return sections
      .map(section => section.trim())
      .filter(section => section.length > 10)
  }
  
  // Fallback: return as single section
  return [aiContent]
}

function generateAICardHTML(data: GeneratePDFRequest): string {
  const { cardName, aiContent, generatedAt } = data
  const timestamp = generatedAt || new Date().toLocaleString()
  
  // Parse and format AI content
  const contentSections = parseAIContentIntoSections(aiContent)
  const formattedSections = contentSections.map(section => convertMarkdownToHTML(section))

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
    
    .content-wrapper strong {
      font-weight: 700;
      color: #1f2937;
    }
    
    .content-wrapper em {
      font-style: italic;
      color: #374151;
    }
    
    .content-wrapper a {
      color: #6366f1;
      text-decoration: underline;
      word-break: break-word;
    }
    
    .content-wrapper a:hover {
      color: #4f46e5;
    }
    
    .section-divider {
      border-bottom: 1px solid #e5e7eb;
      margin: 20px 0;
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
      ${formattedSections.map((section, index) => `
        <div class="content-section">
          ${section}
          ${index < formattedSections.length - 1 ? '<div class="section-divider"></div>' : ''}
        </div>
      `).join('')}
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
    const htmlContent = generateAICardHTML(body)

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
    return new NextResponse(pdfBuffer, {
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