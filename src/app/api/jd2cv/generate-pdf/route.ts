import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface PDFGenerationRequest {
  config: {
    format: 'A4' | 'Letter'
    includePersonalInfo: boolean
    includeSummary: boolean
    includeSkills: boolean
    includeEducation: boolean
    includeCertificates: boolean
    includeExperiences: boolean
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
    }
  }
  experienceModules: Array<{
    id: string
    title: string
    company: string
    content: string
    isOptimized: boolean
  }>
}

function generateComprehensiveHTML(data: PDFGenerationRequest): string {
  const { config, experienceModules } = data
  const { personalInfo } = config

  // Filter valid data
  const validSummary = config.includeSummary ? personalInfo.summary.filter(item => item.trim()) : []
  const validTechnicalSkills = config.includeSkills ? personalInfo.technicalSkills.filter(skill => skill.trim()) : []
  const validLanguages = config.includeSkills ? personalInfo.languages.filter(lang => lang.trim()) : []
  const validEducation = config.includeEducation ? personalInfo.education.filter(edu => edu.degree || edu.institution) : []
  const validCertificates = config.includeCertificates ? personalInfo.certificates.filter(cert => cert.trim()) : []
  const validExperiences = config.includeExperiences ? experienceModules.filter(exp => exp.content.trim()) : []


  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${config.format};
      margin: 18mm 16mm;
    }
    
    * {
      box-sizing: border-box;
    }
    
    html, body {
      font: 11.5pt/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
      color: #111;
      margin: 0;
      padding: 0;
    }
    
    h1 {
      font-size: 22pt;
      margin: 0 0 2mm;
      letter-spacing: .2px;
      font-weight: 700;
    }
    
    h2 {
      font-size: 12pt;
      margin: 8mm 0 3mm;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 2mm;
      text-transform: uppercase;
      letter-spacing: .6px;
      font-weight: 700;
      break-after: avoid-page;
    }
    
    .section {
      page-break-inside: avoid;
    }
    
    /* Header Layout */
    .header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 10mm;
      margin-bottom: 6mm;
    }
    
    .header .name {
      flex: 1;
    }
    
    .header .contacts {
      text-align: right;
      font-size: 10pt;
      line-height: 1.4;
      color: #444;
    }
    
    .header .contacts a {
      color: #444;
      text-decoration: none;
    }
    
    /* Two Column Layout */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6mm;
    }
    
    /* Summary & Skills */
    .summary ul, .skills ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    
    .summary li, .skills li {
      margin: 0 0 2mm;
    }
    
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 6px;
    }
    
    .chip {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 10pt;
      color: #333;
    }
    
    /* Education & Certifications */
    .edu, .certs {
      margin-top: 2mm;
    }
    
    .edu-item, .cert-item {
      margin: 0 0 2mm;
      break-inside: avoid;
    }
    
    .meta {
      color: #555;
      font-size: 10pt;
    }
    
    /* Experience */
    .exp {
      page-break-inside: avoid;
      margin: 0 0 6mm;
      break-inside: avoid;
    }
    
    .exp-hd {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 6mm;
    }
    
    .exp-left {
      font-weight: 600;
    }
    
    .exp-left .role {
      font-weight: 600;
    }
    
    .exp-left .company {
      font-weight: 600;
    }
    
    .exp-right {
      color: #555;
      font-size: 10pt;
      white-space: nowrap;
    }
    
    .exp-bullets {
      margin: 1.5mm 0 0;
      padding: 0 0 0 4.5mm;
      list-style: none;
    }
    
    .exp-bullets li {
      margin: 0 0 2mm;
    }
    
    .exp-bullets li::before {
      content: "• ";
      margin-left: -4.5mm;
    }
    
    /* Experience section container */
    .experience-section {
      margin-top: 2mm;
    }
    
    .experience-section .section {
      break-inside: auto;
    }
  </style>
</head>
<body>
  ${config.includePersonalInfo ? `
  <!-- Header -->
  <div class="header">
    <div class="name">
      <h1>${personalInfo.fullName}</h1>
    </div>
    <div class="contacts">
      <div>
        ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter(item => item).join(' · ')}
      </div>
      ${personalInfo.linkedin || personalInfo.website ? `<div>
        ${[personalInfo.linkedin, personalInfo.website].filter(item => item).join(' · ')}
      </div>` : ''}
    </div>
  </div>
  ` : ''}

  ${(validSummary.length > 0 || validTechnicalSkills.length > 0 || validLanguages.length > 0) ? `
  <!-- Summary and Skills Row -->
  <div class="grid-2">
    <div class="summary section">
      ${validSummary.length > 0 ? `
        <h2>Professional Summary</h2>
        <ul>
          ${validSummary.map(item => `<li>${item}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
    
    <div class="skills section">
      ${(validTechnicalSkills.length > 0 || validLanguages.length > 0) ? `
        <h2>Skills</h2>
        <div class="chips">
          ${validTechnicalSkills.map(skill => `<span class="chip">${skill}</span>`).join('')}
          ${validLanguages.map(lang => `<span class="chip">${lang}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${(validEducation.length > 0 || validCertificates.length > 0) ? `
  <!-- Education and Certifications Row -->
  <div class="grid-2">
    <div class="section">
      ${validEducation.length > 0 ? `
        <h2>Education</h2>
        <div class="edu">
          ${validEducation.map(edu => `
            <div class="edu-item">
              <div><strong>${edu.degree}</strong> — ${edu.institution}</div>
              <div class="meta">${edu.year}${edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="section">
      ${validCertificates.length > 0 ? `
        <h2>Certifications</h2>
        <div class="certs">
          ${validCertificates.map(cert => `<div class="cert-item">${cert}</div>`).join('')}
        </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${validExperiences.length > 0 ? `
  <!-- Experience Section -->
  <div class="experience-section">
    <div class="section">
      <h2>Professional Experience</h2>
      ${validExperiences.map(exp => {
        // Extract company, role, and time from title (format: company · title · time)
        const titleParts = exp.title.split(' · ')
        const company = titleParts[0] || 'Unknown Company'
        const role = titleParts[1] || exp.title
        const time = titleParts[2] || 'Present'
        
        // Convert content to bullet points
        const bullets = exp.content.split('\n').filter(line => line.trim()).map(line => {
          // Remove existing bullet points if any
          return line.replace(/^[•·\-\*]\s*/, '').trim()
        }).filter(line => line.length > 0)
        
        return `
        <div class="exp">
          <div class="exp-hd">
            <div class="exp-left">
              <span class="company">${company}</span> · <span class="role">${role}</span>
            </div>
            <div class="exp-right">${time}</div>
          </div>
          <ul class="exp-bullets">
            ${bullets.map(bullet => `<li>${bullet}</li>`).join('')}
          </ul>
        </div>
        `
      }).join('')}
    </div>
  </div>
  ` : ''}
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const body: PDFGenerationRequest = await request.json()
    const { config, experienceModules } = body

    if (!config.personalInfo.fullName) {
      return NextResponse.json(
        { error: 'Full name is required for PDF generation' },
        { status: 400 }
      )
    }

    // Generate HTML content
    const html = generateComprehensiveHTML(body)

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()

    try {
      // Set content and wait for it to load
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      })

      // Generate PDF
      const pdf = await page.pdf({
        format: config.format,
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      })

      await browser.close()

      // Check file size (should be < 2MB for reasonable download)
      const sizeInMB = pdf.length / (1024 * 1024)

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

      return new NextResponse(pdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="CV.pdf"',
          'Content-Length': pdf.length.toString()
        }
      })

    } catch (pdfError) {
      await browser.close()
      throw pdfError
    }

  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    )
  }
}