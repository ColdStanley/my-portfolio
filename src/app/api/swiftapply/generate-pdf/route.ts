import { NextRequest, NextResponse } from 'next/server'

// Environment-aware Puppeteer configuration (from JD2CV Full)
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

interface SwiftApplyPDFRequest {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    linkedin: string
    website: string
    summary: string[]
    technicalSkills: string[]
    languages: string[]
    education: Array<{
      degree: string
      institution: string
      year: string
      gpa?: string
    }>
    certificates: string[]
    customModules: Array<{
      id: string
      title: string
      content: string[]
    }>
    format: 'A4' | 'Letter'
  }
  workExperience: string
  format: 'A4' | 'Letter'
}

function generateComprehensiveHTML(data: SwiftApplyPDFRequest): string {
  const { personalInfo, workExperience } = data

  // Filter valid data - exactly matching JD2CV Full
  const validSummary = personalInfo.summary?.filter(item => item?.trim()) || []
  const validTechnicalSkills = personalInfo.technicalSkills?.filter(skill => skill?.trim()) || []
  const validLanguages = personalInfo.languages?.filter(lang => lang?.trim()) || []
  const validEducation = personalInfo.education?.filter(edu => edu?.degree || edu?.institution) || []
  const validCertificates = personalInfo.certificates?.filter(cert => cert?.trim()) || []

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${personalInfo.format || 'A4'};
      margin: 0.4in 0.55in;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      font: 11pt/1.4 system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
      color: #111;
      margin: 0;
      padding: 0;
    }

    h1 {
      font-size: 17pt;
      margin: 0;
      font-weight: 700;
      color: #111;
    }

    h2 {
      font-size: 11pt;
      margin: 12px 0 6px;
      font-weight: 700;
      color: #111;
      break-after: avoid-page;
    }

    .section {
      margin-bottom: 12px;
    }

    .section.no-break {
      page-break-inside: avoid;
    }

    /* Header Layout - Left Name, Right Contact Info */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      padding-bottom: 10px;
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

    .contact-icon {
      width: 12px;
      height: 12px;
      fill: #333;
    }

    /* Two Column Layout */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 12px;
    }

    /* Skills - North American Format */
    .skills-content {
      font-size: 10.5pt;
      line-height: 1.5;
    }

    .skills-line {
      margin-bottom: 4px;
    }

    /* Education & Certifications */
    .edu-item {
      margin-bottom: 8px;
      break-inside: avoid;
    }

    .edu-header {
      font-size: 11pt;
      margin-bottom: 2px;
    }

    .edu-degree {
      font-weight: 700;
      display: inline;
    }

    .edu-institution {
      font-weight: normal;
      display: inline;
    }

    .edu-meta {
      color: #666;
      font-size: 10pt;
      line-height: 1.2;
    }

    .cert-item {
      margin-bottom: 3px;
      font-size: 10.5pt;
      line-height: 1.3;
    }

    /* Experience - North American Standard */
    .exp {
      page-break-inside: avoid;
      margin-bottom: 12px;
      break-inside: avoid;
    }

    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 11pt;
      font-weight: 700;
      margin-bottom: 4px;
      color: #111;
    }

    .exp-title {
      font-weight: 700;
    }

    .exp-time {
      color: #666;
      font-size: 10pt;
      font-weight: normal;
      white-space: nowrap;
    }

    .exp-bullets {
      margin: 0;
      padding-left: 14px;
      list-style: none;
    }

    .exp-bullets li {
      margin-bottom: 4px;
      font-size: 10.5pt;
      line-height: 1.4;
      position: relative;
    }

    .exp-bullets li::before {
      content: "•";
      position: absolute;
      left: -14px;
      color: #111;
    }

    /* Summary */
    .summary ul {
      margin: 0;
      padding-left: 14px;
      list-style: none;
    }

    .summary li {
      margin-bottom: 4px;
      font-size: 10.5pt;
      line-height: 1.4;
      position: relative;
    }

    .summary li::before {
      content: "•";
      position: absolute;
      left: -14px;
      color: #111;
    }
  </style>
</head>
<body>
  <!-- Header - Left Name, Right Contact Info -->
  <div class="header">
    <div class="name">${personalInfo.fullName}</div>
    <div class="contacts">
      ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(item => item).length > 0 ? `
      <div class="contact-line">
        ${personalInfo.email ? `
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          ${personalInfo.email}
        </div>
        ` : ''}
        ${personalInfo.phone ? `
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          ${personalInfo.phone}
        </div>
        ` : ''}
        ${personalInfo.location ? `
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          ${personalInfo.location}
        </div>
        ` : ''}
      </div>
      ` : ''}
      ${[personalInfo.linkedin, personalInfo.website].filter(item => item).length > 0 ? `
      <div class="contact-line">
        ${personalInfo.linkedin ? `
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          ${personalInfo.linkedin}
        </div>
        ` : ''}
        ${personalInfo.website ? `
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          ${personalInfo.website}
        </div>
        ` : ''}
      </div>
      ` : ''}
    </div>
  </div>

  ${(validSummary.length > 0 || validTechnicalSkills.length > 0 || validLanguages.length > 0) ? `
  <!-- Summary and Skills - Two Column -->
  <div class="grid-2">
    <div class="section no-break">
      ${validSummary.length > 0 ? `
        <h2>Professional Summary</h2>
        <div class="summary">
          <ul>
            ${validSummary.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>

    <div class="section no-break">
      ${(validTechnicalSkills.length > 0 || validLanguages.length > 0) ? `
        <h2>Skills</h2>
        ${validTechnicalSkills.length > 0 ? `
        <div class="skills-content">
          ${(() => {
            const skillsPerLine = 5;
            const lines = [];
            for (let i = 0; i < validTechnicalSkills.length; i += skillsPerLine) {
              lines.push(validTechnicalSkills.slice(i, i + skillsPerLine).join(' · '));
            }
            return lines.map(line => `<div class="skills-line">${line}</div>`).join('');
          })()}
        </div>
        ` : ''}
        ${validLanguages.length > 0 ? `
        <div style="margin-top: 8px;">
          <h3 style="font-size: 10pt; font-weight: 600; margin-bottom: 4px; color: #111;">Languages</h3>
          <div class="skills-content">
            ${(() => {
              const skillsPerLine = 5;
              const lines = [];
              for (let i = 0; i < validLanguages.length; i += skillsPerLine) {
                lines.push(validLanguages.slice(i, i + skillsPerLine).join(' · '));
              }
              return lines.map(line => `<div class="skills-line">${line}</div>`).join('');
            })()}
          </div>
        </div>
        ` : ''}
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${(validEducation.length > 0 || validCertificates.length > 0) ? `
  <!-- Education and Certifications - Two Column -->
  <div class="grid-2">
    <div class="section no-break">
      ${validEducation.length > 0 ? `
        <h2>Education</h2>
        ${validEducation.map(edu => `
          <div class="edu-item">
            <div class="edu-header">
              <span class="edu-degree">${edu.degree}</span> — <span class="edu-institution">${edu.institution}</span>
            </div>
            <div class="edu-meta">${edu.year}${edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</div>
          </div>
        `).join('')}
      ` : ''}
    </div>

    <div class="section no-break">
      ${validCertificates.length > 0 ? `
        <h2>Certifications</h2>
        ${validCertificates.map(cert => `<div class="cert-item">${cert}</div>`).join('')}
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${workExperience ? `
  <!-- Experience Section - North American Standard -->
  <div class="section">
    <h2>Professional Experience</h2>
    ${formatProfessionalExperience(workExperience)}
  </div>
  ` : ''}

  ${personalInfo.customModules?.length > 0 ? `
  <!-- Custom Modules -->
  ${personalInfo.customModules.map(module => `
    <div class="section">
      <h2>${module.title}</h2>
      <div class="summary">
        <ul>
          ${module.content.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('')}
  ` : ''}
</body>
</html>`
}

// Helper function to format professional work experience (exactly matching JD2CV Full)
function formatProfessionalExperience(workExperience: string): string {
  if (!workExperience) return ''

  // Split by double newlines to get experience blocks
  const experienceBlocks = workExperience.split('\n\n').filter(block => block.trim())

  return experienceBlocks.map(block => {
    const lines = block.split('\n').filter(line => line.trim())
    if (lines.length === 0) return ''

    // First line is the header (company | role | time)
    const headerLine = lines[0].trim()
    const contentLines = lines.slice(1)

    // Parse header: try different formats
    let company = '', role = '', time = ''

    if (headerLine.includes(' | ')) {
      // Format: Company | Role | Time
      const parts = headerLine.split(' | ').map(p => p.trim())
      company = parts[0] || 'Unknown Company'
      role = parts[1] || ''
      time = parts[2] || ''
    } else if (headerLine.includes(' · ')) {
      // Format: Company · Role · Time
      const parts = headerLine.split(' · ').map(p => p.trim())
      company = parts[0] || 'Unknown Company'
      role = parts[1] || ''
      time = parts[2] || ''
    } else if (headerLine.includes(' – ')) {
      // Format: Company – Role or Role – Company
      const parts = headerLine.split(' – ').map(p => p.trim())
      company = parts[0] || 'Unknown Company'
      role = parts[1] || ''
    } else {
      // Single line, treat as role
      role = headerLine
      company = 'Company'
    }

    // Process bullet points
    const bullets = contentLines.map(line => {
      return line.replace(/^[•·\-\*]\s*/, '').trim()
    }).filter(line => line.length > 0)

    return `
    <div class="exp">
      <div class="exp-header">
        <div class="exp-title">${company}${role ? ` — ${role}` : ''}</div>
        ${time ? `<div class="exp-time">${time}</div>` : ''}
      </div>
      ${bullets.length > 0 ? `
      <ul class="exp-bullets">
        ${bullets.map(bullet => `<li>${bullet}</li>`).join('')}
      </ul>
      ` : ''}
    </div>
    `
  }).join('')
}

export async function POST(request: NextRequest) {
  try {
    const body: SwiftApplyPDFRequest = await request.json()
    const { personalInfo, workExperience, format } = body

    if (!personalInfo.fullName) {
      return NextResponse.json(
        { error: 'Full name is required for PDF generation' },
        { status: 400 }
      )
    }

    // Generate HTML content using JD2CV Full's exact method
    const html = generateComprehensiveHTML(body)

    // Launch Puppeteer with environment-aware configuration
    const { puppeteer, chromium, isProduction } = await getPuppeteer()

    const browser = await puppeteer.launch(
      isProduction
        ? {
            args: [
              ...chromium!.args,
              '--hide-scrollbars',
              '--disable-web-security',
            ],
            defaultViewport: chromium!.defaultViewport,
            executablePath: await chromium!.executablePath(),
            headless: chromium!.headless,
          }
        : {
            headless: 'new',
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu'
            ]
          }
    )

    const page = await browser.newPage()

    try {
      // Set content and wait for it to load
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      })

      // Generate PDF
      const pdf = await page.pdf({
        format: format,
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      })

      await browser.close()

      return new NextResponse(pdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Resume.pdf"',
          'Content-Length': pdf.length.toString()
        }
      })

    } catch (pdfError) {
      await browser.close()
      throw pdfError
    }

  } catch (error: any) {
    console.error('SwiftApply PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    )
  }
}