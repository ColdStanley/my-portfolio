import { NextRequest, NextResponse } from 'next/server'

// Environment-aware Puppeteer configuration
const getPuppeteer = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: use @sparticuz/chromium
    const puppeteer = await import('puppeteer-core')
    const chromium = await import('@sparticuz/chromium')
    return { puppeteer: puppeteer.default, chromium: chromium.default, isProduction: true }
  } else {
    // Development: use regular puppeteer
    const puppeteer = await import('puppeteer')
    return { puppeteer: puppeteer.default, chromium: null, isProduction: false }
  }
}

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin?: string
  website?: string
}

interface JDInfo {
  title: string
  company: string
  description: string
}

interface GenerateCoverLetterPDFRequest {
  coverLetterContent: string
  personalInfo: PersonalInfo
  jdInfo: JDInfo
  format: 'A4' | 'Letter'
}

// Clean AI-generated content to remove duplicate salutations and closings
function cleanCoverLetterContent(content: string): string {
  let cleanedContent = content.trim()
  
  // Remove common salutations from the beginning
  cleanedContent = cleanedContent.replace(/^(Dear\s+[^,\n]+,?\s*\n?)/gmi, '')
  cleanedContent = cleanedContent.replace(/^(Hello\s+[^,\n]+,?\s*\n?)/gmi, '')
  cleanedContent = cleanedContent.replace(/^(Hi\s+[^,\n]+,?\s*\n?)/gmi, '')
  cleanedContent = cleanedContent.replace(/^(To\s+whom\s+it\s+may\s+concern,?\s*\n?)/gmi, '')
  
  // Remove common closings from the end
  cleanedContent = cleanedContent.replace(/\n?\s*(Sincerely,?\s*[^\n]*(\n.*)*?)$/gmi, '')
  cleanedContent = cleanedContent.replace(/\n?\s*(Best\s+regards?,?\s*[^\n]*(\n.*)*?)$/gmi, '')
  cleanedContent = cleanedContent.replace(/\n?\s*(Yours\s+truly,?\s*[^\n]*(\n.*)*?)$/gmi, '')
  cleanedContent = cleanedContent.replace(/\n?\s*(Thank\s+you,?\s*[^\n]*(\n.*)*?)$/gmi, '')
  cleanedContent = cleanedContent.replace(/\n?\s*(Best,?\s*[^\n]*(\n.*)*?)$/gmi, '')
  
  // Clean up any extra whitespace
  cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n')
  cleanedContent = cleanedContent.trim()
  
  return cleanedContent
}

function generateCoverLetterHTML(
  coverLetterContent: string, 
  personalInfo: PersonalInfo, 
  jdInfo: JDInfo, 
  format: string
): string {
  // Clean the AI-generated content first
  const cleanedContent = cleanCoverLetterContent(coverLetterContent)
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo.fullName} - Cover Letter</title>
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
      font-size: 11px;
    }
    
    .cover-letter {
      max-width: 100%;
      padding: 40px;
      background: white;
      min-height: 100vh;
    }
    
    .letter-header {
      margin-bottom: 40px;
    }
    
    .sender-info {
      text-align: right;
      margin-bottom: 20px;
      color: #1f2937;
    }
    
    .sender-name {
      font-size: 14px;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 4px;
    }
    
    .sender-contact {
      font-size: 10px;
      color: #6b7280;
      line-height: 1.4;
    }
    
    .date {
      text-align: right;
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 30px;
    }
    
    .recipient-info {
      color: #1f2937;
      font-size: 11px;
      line-height: 1.5;
      margin-bottom: 30px;
    }
    
    .recipient-title {
      font-weight: 600;
    }
    
    .company-name {
      font-weight: 600;
      color: #6366f1;
    }
    
    .letter-body {
      color: #1f2937;
      font-size: 11px;
      line-height: 1.7;
    }
    
    .salutation {
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    .letter-content {
      margin-bottom: 25px;
      text-align: justify;
    }
    
    .letter-content p {
      margin-bottom: 12px;
    }
    
    .closing {
      margin-top: 30px;
    }
    
    .closing-phrase {
      margin-bottom: 50px;
    }
    
    .signature-name {
      font-weight: 600;
      color: #6366f1;
    }
    
    /* Professional touches */
    .letter-header::after {
      content: '';
      display: block;
      width: 60px;
      height: 2px;
      background: linear-gradient(to right, #6366f1, #8b5cf6);
      margin: 20px 0;
    }
    
    @media print {
      .cover-letter {
        padding: 30px;
      }
    }
  </style>
</head>
<body>
  <div class="cover-letter">
    <!-- Letter Header -->
    <div class="letter-header">
      <!-- Sender Info (Top Right) -->
      <div class="sender-info">
        <div class="sender-name">${personalInfo.fullName}</div>
        <div class="sender-contact">
          ${personalInfo.email}<br/>
          ${personalInfo.phone ? `${personalInfo.phone}<br/>` : ''}
          ${personalInfo.location ? `${personalInfo.location}<br/>` : ''}
          ${personalInfo.linkedin ? `${personalInfo.linkedin}<br/>` : ''}
          ${personalInfo.website ? `${personalInfo.website}` : ''}
        </div>
      </div>
      
      <!-- Date -->
      <div class="date">${currentDate}</div>
      
      <!-- Recipient Info -->
      <div class="recipient-info">
        <div class="recipient-title">Hiring Manager</div>
        <div class="company-name">${jdInfo.company}</div>
        <div>${jdInfo.title} Position</div>
      </div>
    </div>

    <!-- Letter Body -->
    <div class="letter-body">
      <div class="salutation">Dear Hiring Manager,</div>
      
      <div class="letter-content">
        ${cleanedContent.split('\n').map(paragraph => 
          paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
        ).join('')}
      </div>
      
      <div class="closing">
        <div class="closing-phrase">Sincerely,</div>
        <div class="signature-name">${personalInfo.fullName}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCoverLetterPDFRequest = await request.json()
    const { coverLetterContent, personalInfo, jdInfo, format = 'A4' } = body

    // Validation
    if (!coverLetterContent) {
      return NextResponse.json(
        { error: 'Cover letter content is required' },
        { status: 400 }
      )
    }

    if (!personalInfo?.fullName || !personalInfo?.email) {
      return NextResponse.json(
        { error: 'Personal information (name and email) is required' },
        { status: 400 }
      )
    }

    if (!jdInfo?.title || !jdInfo?.company) {
      return NextResponse.json(
        { error: 'Job information (title and company) is required' },
        { status: 400 }
      )
    }

    // Generate HTML content for Cover Letter
    const htmlContent = generateCoverLetterHTML(
      coverLetterContent,
      personalInfo,
      jdInfo,
      format
    )

    // Generate PDF using environment-aware Puppeteer
    const { puppeteer, chromium, isProduction } = await getPuppeteer()
    
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: isProduction ? await chromium.executablePath() : undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        ...(isProduction ? chromium.args : [])
      ]
    })

    const page = await browser.newPage()
    
    // Set page size based on format
    const pageFormat = format === 'Letter' ? 'letter' : 'a4'
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: pageFormat as any,
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
    const cleanName = personalInfo.fullName.replace(/[^a-z0-9]/gi, '_')
    const cleanCompany = jdInfo.company.replace(/[^a-z0-9]/gi, '_')
    const cleanPosition = jdInfo.title.replace(/[^a-z0-9]/gi, '_')
    const filename = `${cleanName}_${cleanCompany}_${cleanPosition}_CoverLetter.pdf`

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
    console.error('Cover Letter PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Cover Letter PDF', details: error.message },
      { status: 500 }
    )
  }
}