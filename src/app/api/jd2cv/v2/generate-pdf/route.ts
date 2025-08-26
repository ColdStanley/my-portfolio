import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface Education {
  degree: string
  institution: string
  year: string
  gpa?: string
}

interface CustomModule {
  id: string
  title: string
  content: string[]
}

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  summary: string[]
  technicalSkills: string[]
  languages: string[]
  education: Education[]
  certificates: string[]
  customModules: CustomModule[]
}

interface JDInfo {
  title: string
  company: string
  description: string
}

interface GeneratePDFRequest {
  personalInfo: PersonalInfo
  aiGeneratedExperience: string
  format: 'A4' | 'Letter'
  jobTitle: string
}

function generateResumeHTML(data: GeneratePDFRequest): string {
  const { personalInfo, aiGeneratedExperience, format } = data

  // Filter valid data
  const validSummary = personalInfo.summary.filter(item => item.trim())
  const validTechnicalSkills = personalInfo.technicalSkills.filter(skill => skill.trim())
  const validLanguages = personalInfo.languages.filter(lang => lang.trim())
  const validEducation = personalInfo.education.filter(edu => edu.degree || edu.institution)
  const validCertificates = personalInfo.certificates.filter(cert => cert.trim())
  const validCustomModules = personalInfo.customModules.filter(module => 
    module.title.trim() && module.content.some(item => item.trim())
  )

  // Parse AI experience into bullet points
  const experienceBullets = aiGeneratedExperience
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[•·\-\*]\s*/, '').trim())
    .filter(line => line.length > 0)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo.fullName} - Resume</title>
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
    
    .resume {
      max-width: 100%;
      padding: 40px;
      background: white;
      min-height: 100vh;
    }
    
    .resume-header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 20px;
    }
    
    .resume-name {
      font-size: 24px;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 8px;
    }
    
    .resume-contact {
      font-size: 11px;
      color: #6b7280;
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
    }
    
    .two-column-container {
      display: flex;
      gap: 30px;
      margin-bottom: 25px;
    }
    
    .column {
      flex: 1;
    }
    
    /* Summary */
    .summary-content {
      font-size: 11px;
      line-height: 1.6;
    }
    
    .summary-item {
      margin-bottom: 8px;
      padding-left: 15px;
      position: relative;
    }
    
    .summary-item::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #6366f1;
      font-weight: bold;
    }
    
    /* Skills */
    .skills-content {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-item {
      background: #f3f4f6;
      color: #374151;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
    }
    
    /* Education */
    .education-item {
      margin-bottom: 15px;
      padding: 10px;
      background: #f9fafb;
      border-left: 3px solid #6366f1;
    }
    
    .education-degree {
      font-weight: 700;
      color: #111827;
      font-size: 12px;
    }
    
    .education-institution {
      color: #6b7280;
      font-size: 11px;
      margin-top: 2px;
    }
    
    .education-year {
      color: #9ca3af;
      font-size: 10px;
      margin-top: 2px;
    }
    
    /* Certificates */
    .certificate-item {
      margin-bottom: 5px;
      padding: 5px 10px;
      background: #fef3c7;
      border-radius: 4px;
      font-size: 11px;
      color: #92400e;
    }
    
    /* Experience */
    .experience-content {
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #6366f1;
    }
    
    .experience-item {
      margin-bottom: 8px;
      padding-left: 15px;
      position: relative;
      font-size: 11px;
      line-height: 1.5;
    }
    
    .experience-item::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #6366f1;
      font-weight: bold;
    }
    
    /* Custom Modules */
    .custom-module {
      margin-bottom: 20px;
      padding: 15px;
      background: #f1f5f9;
      border-radius: 8px;
      border-left: 4px solid #8b5cf6;
    }
    
    .custom-module-title {
      font-size: 13px;
      font-weight: 700;
      color: #8b5cf6;
      margin-bottom: 8px;
    }
    
    .custom-module-item {
      margin-bottom: 5px;
      padding-left: 15px;
      position: relative;
      font-size: 11px;
      line-height: 1.4;
    }
    
    .custom-module-item::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #8b5cf6;
      font-weight: bold;
    }
    
    @media print {
      .resume {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="resume">
    <!-- Header -->
    <div class="resume-header">
      <div class="resume-name">${personalInfo.fullName}</div>
      <div class="resume-contact">
        ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
        ${personalInfo.phone ? `<span>${personalInfo.phone}</span>` : ''}
        ${personalInfo.location ? `<span>${personalInfo.location}</span>` : ''}
        ${personalInfo.linkedin ? `<span>${personalInfo.linkedin}</span>` : ''}
        ${personalInfo.website ? `<span>${personalInfo.website}</span>` : ''}
      </div>
    </div>

    <!-- Professional Summary -->
    ${validSummary.length > 0 ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <div class="summary-content">
        ${validSummary.map(item => `<div class="summary-item">${item}</div>`).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Two Column Layout: Technical Skills + Languages, Education + Certifications -->
    ${(validTechnicalSkills.length > 0 || validLanguages.length > 0 || validEducation.length > 0 || validCertificates.length > 0) ? `
    <div class="two-column-container">
      <div class="column">
        ${(validTechnicalSkills.length > 0 || validLanguages.length > 0) ? `
        <div class="section">
          <div class="section-title">Skills</div>
          ${validTechnicalSkills.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">Technical Skills</div>
            <div class="skills-content">
              ${validTechnicalSkills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
            </div>
          </div>
          ` : ''}
          ${validLanguages.length > 0 ? `
          <div>
            <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">Languages</div>
            <div class="skills-content">
              ${validLanguages.map(lang => `<span class="skill-item">${lang}</span>`).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        ` : ''}
      </div>
      
      <div class="column">
        ${validEducation.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${validEducation.map(edu => `
            <div class="education-item">
              <div class="education-degree">${edu.degree}</div>
              <div class="education-institution">${edu.institution}</div>
              <div class="education-year">${edu.year}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${validCertificates.length > 0 ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          ${validCertificates.map(cert => `<div class="certificate-item">${cert}</div>`).join('')}
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Custom Modules -->
    ${validCustomModules.map(module => `
      <div class="section">
        <div class="section-title">${module.title}</div>
        <div class="custom-module">
          ${module.content.filter(item => item.trim()).map(item => 
            `<div class="custom-module-item">${item}</div>`
          ).join('')}
        </div>
      </div>
    `).join('')}

    <!-- Experience -->
    ${experienceBullets.length > 0 ? `
    <div class="section">
      <div class="section-title">Professional Experience</div>
      <div class="experience-content">
        ${experienceBullets.map(bullet => `<div class="experience-item">${bullet}</div>`).join('')}
      </div>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePDFRequest = await request.json()
    const { personalInfo, aiGeneratedExperience, format = 'A4' } = body

    // Basic validation
    if (!personalInfo?.fullName || !personalInfo?.email) {
      return NextResponse.json(
        { success: false, error: 'Personal information (name and email) is required' },
        { status: 400 }
      )
    }

    if (!aiGeneratedExperience) {
      return NextResponse.json(
        { success: false, error: 'AI generated experience content is required' },
        { status: 400 }
      )
    }

    // Generate HTML content
    const htmlContent = generateResumeHTML(body)

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
    const cleanJobTitle = body.jobTitle ? body.jobTitle.replace(/[^a-z0-9]/gi, '_') : 'Resume'
    const filename = `${cleanName}_${cleanJobTitle}_Resume.pdf`

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
    console.error('Resume PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Resume PDF', details: error.message },
      { status: 500 }
    )
  }
}