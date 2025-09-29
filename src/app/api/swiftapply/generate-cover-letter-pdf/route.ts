import { NextRequest, NextResponse } from 'next/server'

// Environment-aware Puppeteer configuration (independent from JD2CV)
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
  format?: 'A4' | 'Letter'
}

interface GenerateCoverLetterPDFRequest {
  coverLetterContent: string
  personalInfo: PersonalInfo
  jobTitle: string
  format?: 'A4' | 'Letter'
}

function generateCoverLetterHTML(
  content: string,
  personalInfo: PersonalInfo,
  jobTitle: string
): string {
  const today = new Date().toLocaleDateString('en-US', {
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
    <title>Cover Letter - ${personalInfo.fullName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            margin: 0.75in;
            size: ${personalInfo.format === 'Letter' ? 'letter' : 'A4'};
        }

        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
            background: white;
        }

        /* Header - matching SwiftApply style */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid #333;
        }

        .header .name {
            font-size: 17pt;
            font-weight: 700;
            color: #111;
            text-align: left;
        }

        .header .contacts {
            text-align: right;
        }

        .header .contact-line {
            font-size: 10pt;
            color: #666;
            margin-bottom: 3px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 12px;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .date {
            text-align: right;
            margin-bottom: 24px;
            font-size: 11pt;
            color: #666;
        }

        .content {
            line-height: 1.6;
            margin-bottom: 24px;
        }

        .content p {
            margin-bottom: 12px;
            text-align: justify;
        }

        .content p:last-child {
            margin-bottom: 0;
        }

        .closing {
            margin-top: 24px;
        }

        .signature-space {
            margin-top: 36px;
            margin-bottom: 12px;
        }

        .signature-line {
            border-bottom: 1px solid #333;
            width: 200px;
            margin-bottom: 6px;
        }

        .signature-name {
            font-weight: 600;
            color: #111;
        }

        @media print {
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <!-- Header - matching SwiftApply resume style -->
    <div class="header">
        <div class="name">${personalInfo.fullName}</div>
        <div class="contacts">
            <div class="contact-line">
                <div class="contact-item">${personalInfo.email}</div>
                ${personalInfo.phone ? `<div class="contact-item">${personalInfo.phone}</div>` : ''}
            </div>
            ${personalInfo.location ? `<div class="contact-line">
                <div class="contact-item">${personalInfo.location}</div>
            </div>` : ''}
            ${personalInfo.linkedin || personalInfo.website ? `<div class="contact-line">
                ${personalInfo.linkedin ? `<div class="contact-item">${personalInfo.linkedin}</div>` : ''}
                ${personalInfo.website ? `<div class="contact-item">${personalInfo.website}</div>` : ''}
            </div>` : ''}
        </div>
    </div>

    <div class="date">${today}</div>

    <div class="content">
        ${content.split('\n\n').map(paragraph =>
            paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
        ).filter(Boolean).join('\n        ')}
    </div>

    <div class="closing">
        <p>Sincerely,</p>
        <div class="signature-space">
            <div class="signature-line"></div>
            <div class="signature-name">${personalInfo.fullName}</div>
        </div>
    </div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  let browser = null

  try {
    const body: GenerateCoverLetterPDFRequest = await request.json()
    const { coverLetterContent, personalInfo, jobTitle, format = 'A4' } = body

    // Validation
    if (!coverLetterContent?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Cover letter content is required' },
        { status: 400 }
      )
    }

    if (!personalInfo?.fullName || !personalInfo?.email) {
      return NextResponse.json(
        { success: false, error: 'Personal information (name and email) is required' },
        { status: 400 }
      )
    }

    // Generate HTML
    const html = generateCoverLetterHTML(coverLetterContent, personalInfo, jobTitle)

    // Get Puppeteer configuration
    const { puppeteer, chromium, isProduction } = await getPuppeteer()

    // Launch browser
    browser = await puppeteer.launch(
      isProduction
        ? {
            args: [
              ...chromium.args,
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu'
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless
          }
        : {
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu'
            ]
          }
    )

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generate PDF with appropriate format
    const pdfFormat = format === 'Letter' ? 'letter' : 'a4'
    const pdfBuffer = await page.pdf({
      format: pdfFormat as any,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true
    })

    await browser.close()

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${personalInfo.fullName.replace(/[^a-z0-9]/gi, '_')}_CoverLetter.pdf"`
      }
    })

  } catch (error: any) {
    console.error('Cover Letter PDF generation error:', error)

    if (browser) {
      await browser.close()
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate cover letter PDF'
    }, { status: 500 })
  }
}
