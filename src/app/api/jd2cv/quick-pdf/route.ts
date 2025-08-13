import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface QuickPDFData {
  fullName: string
  summary: string[]
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  education: Array<{
    degree: string
    institution: string
    year: string
    gpa?: string
  }>
  certificates: string[]
  technicalSkills: string[]
  languages: string[]
}

interface CVModule {
  id: string
  title: string
  items: string[]
  span: number
  sourceType: string
  showTitle?: boolean
  rowId: string
}

function generateHTML(pdfData: QuickPDFData, modules: CVModule[]): string {
  const { 
    fullName, 
    summary, 
    email, 
    phone, 
    location, 
    linkedin, 
    website, 
    education, 
    certificates, 
    technicalSkills, 
    languages 
  } = pdfData

  // Filter non-empty data with type safety
  const validEducation = Array.isArray(education) ? education.filter(edu => edu.degree || edu.institution) : []
  const validCertificates = Array.isArray(certificates) ? certificates.filter(cert => cert.trim()) : []
  const validTechnicalSkills = Array.isArray(technicalSkills) ? technicalSkills.filter(skill => skill.trim()) : []
  const validLanguages = Array.isArray(languages) ? languages.filter(lang => lang.trim()) : []
  const validSummary = Array.isArray(summary) ? summary.filter(item => item.trim()) : []
  const validModules = modules.filter(module => 
    module.title || (module.items && module.items.some(item => item.trim()))
  )

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
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
    
    .summary {
      font-size: 11px;
      line-height: 1.5;
      text-align: justify;
    }
    
    .education-item {
      margin-bottom: 10px;
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
    
    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
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
      gap: 8px;
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
      padding-left: 8px;
      position: relative;
    }
    
    .cert-item:before {
      content: '•';
      color: #000000;
      position: absolute;
      left: 0;
    }
    
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
    }
    
    .row-1,
    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .experience-section {
      margin-top: 10px;
    }
    
    .experience-modules {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .experience-module {
      break-inside: avoid;
      margin-bottom: 12px;
    }
    
    .module-title {
      font-size: 12px;
      font-weight: 600;
      color: #000000;
      margin-bottom: 6px;
    }
    
    .module-items {
      list-style: none;
    }
    
    .module-item {
      font-size: 10px;
      line-height: 1.4;
      margin-bottom: 4px;
      padding-left: 10px;
      position: relative;
      color: #374151;
    }
    
    .module-item:before {
      content: '•';
      color: #000000;
      position: absolute;
      left: 0;
      top: 0;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="name">${fullName}</div>
    <div class="contact">
      ${email ? `<div class="contact-item">${email}</div>` : ''}
      ${phone ? `<div class="contact-item">${phone}</div>` : ''}
      ${location ? `<div class="contact-item">${location}</div>` : ''}
      ${linkedin ? `<div class="contact-item">${linkedin}</div>` : ''}
      ${website ? `<div class="contact-item">${website}</div>` : ''}
    </div>
  </div>

  <!-- Row 1: Summary / Skills -->
  <div class="row-1">
    <div class="summary-column">
      ${validSummary.length > 0 ? `
      <div class="section">
        <div class="section-title">Professional Summary</div>
        <ul class="module-items">
          ${validSummary.map(item => `<li class="module-item">${item}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
    
    <div class="skills-column">
      ${validTechnicalSkills.length > 0 || validLanguages.length > 0 ? `
      <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-grid">
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

  <!-- Row 2: Education / Certificates -->
  <div class="row-2">
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

  <!-- Experience Section (Full Width) -->
  ${validModules.length > 0 ? `
  <div class="experience-section">
    <div class="section">
      <div class="section-title">Experience</div>
      <div class="experience-modules">
        ${validModules.map(module => `
          <div class="experience-module">
            ${module.title && module.showTitle !== false ? `<div class="module-title">${module.title}</div>` : ''}
            ${module.items && module.items.length > 0 ? `
            <ul class="module-items">
              ${module.items.filter(item => item.trim()).map(item => 
                `<li class="module-item">${item}</li>`
              ).join('')}
            </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  ` : ''}
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdfData, modules, format = 'A4' } = body

    if (!pdfData || !pdfData.fullName) {
      return NextResponse.json(
        { error: 'PDF data with full name is required' },
        { status: 400 }
      )
    }

    // Generate HTML content
    const html = generateHTML(pdfData, modules || [])

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    })

    try {
      const page = await browser.newPage()
      
      // Set content and wait for it to load
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      })

      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      })

      await browser.close()

      return new NextResponse(pdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${pdfData.fullName.replace(/\s+/g, '_')}_CV.pdf"`
        }
      })

    } catch (pdfError) {
      await browser.close()
      throw pdfError
    }

  } catch (error: any) {
    console.error('Quick PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    )
  }
}