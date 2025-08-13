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
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #333;
      background: white;
      padding: 20px;
      width: 210mm;
      min-height: 297mm;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #000000;
      break-inside: avoid;
    }
    
    .name {
      font-size: 24px;
      font-weight: 700;
      color: #000000;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .contact {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 10px;
      color: #666;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .section {
      margin-bottom: 18px;
      break-inside: avoid;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      padding-bottom: 3px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .summary {
      font-size: 11px;
      line-height: 1.5;
    }
    
    .summary-item {
      margin-bottom: 4px;
      padding-left: 10px;
      position: relative;
    }
    
    .summary-item:before {
      content: '•';
      color: #000000;
      position: absolute;
      left: 0;
      top: 0;
    }
    
    .education-item {
      margin-bottom: 10px;
      break-inside: avoid;
    }
    
    .education-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2px;
    }
    
    .degree {
      font-weight: 600;
      color: #374151;
    }
    
    .institution {
      font-style: italic;
      color: #6b7280;
    }
    
    .year-gpa {
      font-size: 10px;
      color: #6b7280;
      white-space: nowrap;
    }
    
    .skills-section {
      margin-bottom: 15px;
    }
    
    .skill-category {
      margin-bottom: 10px;
    }
    
    .skill-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: #374151;
      font-size: 10px;
    }
    
    .skill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .skill-tag {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      color: #374151;
      border: 1px solid #e5e7eb;
    }
    
    .certificates-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .cert-item {
      font-size: 10px;
      color: #374151;
      padding-left: 10px;
      position: relative;
    }
    
    .cert-item:before {
      content: '•';
      color: #000000;
      position: absolute;
      left: 0;
    }
    
    .experience-section {
      margin-top: 10px;
    }
    
    .experience-item {
      margin-bottom: 15px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }
    
    .experience-title {
      font-size: 12px;
      font-weight: 600;
      color: #000000;
    }
    
    .experience-company {
      font-size: 11px;
      color: #6b7280;
      font-style: italic;
    }
    
    .experience-content {
      font-size: 10px;
      line-height: 1.5;
      color: #374151;
      white-space: pre-wrap;
      margin-top: 4px;
    }
    
    .optimized-badge {
      font-size: 8px;
      background: #dcfce7;
      color: #166534;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  ${config.includePersonalInfo ? `
  <!-- Header -->
  <div class="header">
    <div class="name">${personalInfo.fullName}</div>
    <div class="contact">
      ${personalInfo.email ? `<div class="contact-item">${personalInfo.email}</div>` : ''}
      ${personalInfo.phone ? `<div class="contact-item">${personalInfo.phone}</div>` : ''}
      ${personalInfo.location ? `<div class="contact-item">${personalInfo.location}</div>` : ''}
      ${personalInfo.linkedin ? `<div class="contact-item">${personalInfo.linkedin}</div>` : ''}
      ${personalInfo.website ? `<div class="contact-item">${personalInfo.website}</div>` : ''}
    </div>
  </div>
  ` : ''}

  ${(validSummary.length > 0 || validTechnicalSkills.length > 0 || validLanguages.length > 0) ? `
  <!-- Summary and Skills Row -->
  <div class="two-column">
    <div class="summary-column">
      ${validSummary.length > 0 ? `
      <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="summary">
          ${validSummary.map(item => `<div class="summary-item">${item}</div>`).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="skills-column">
      ${(validTechnicalSkills.length > 0 || validLanguages.length > 0) ? `
      <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-section">
          ${validTechnicalSkills.length > 0 ? `
          <div class="skill-category">
            <div class="skill-title">Technical Skills</div>
            <div class="skill-list">
              ${validTechnicalSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
          ` : ''}
          ${validLanguages.length > 0 ? `
          <div class="skill-category">
            <div class="skill-title">Languages</div>
            <div class="skill-list">
              ${validLanguages.map(lang => `<span class="skill-tag">${lang}</span>`).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${(validEducation.length > 0 || validCertificates.length > 0) ? `
  <!-- Education and Certificates Row -->
  <div class="two-column">
    <div class="education-column">
      ${validEducation.length > 0 ? `
      <div class="section">
        <div class="section-title">Education</div>
        ${validEducation.map(edu => `
          <div class="education-item">
            <div class="education-header">
              <div>
                <div class="degree">${edu.degree}</div>
                <div class="institution">${edu.institution}</div>
              </div>
              <div class="year-gpa">
                ${edu.year}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
    
    <div class="certificates-column">
      ${validCertificates.length > 0 ? `
      <div class="section">
        <div class="section-title">Certifications</div>
        <div class="certificates-list">
          ${validCertificates.map(cert => `<div class="cert-item">${cert}</div>`).join('')}
        </div>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${validExperiences.length > 0 ? `
  <!-- Experience Section (Full Width) -->
  <div class="experience-section">
    <div class="section">
      <div class="section-title">Professional Experience</div>
      ${validExperiences.map(exp => `
        <div class="experience-item">
          <div class="experience-header">
            <div>
              <div class="experience-title">${exp.title}</div>
            </div>
            ${exp.isOptimized ? `<div class="optimized-badge">AI Optimized</div>` : ''}
          </div>
          <div class="experience-content">${exp.content}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const body: PDFGenerationRequest = await request.json()
    const { config } = body

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
      console.log(`Generated PDF size: ${sizeInMB.toFixed(2)}MB`)

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

      const fileName = `${config.personalInfo.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_CV.pdf`

      return new NextResponse(pdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
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