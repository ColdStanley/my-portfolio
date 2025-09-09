import { NextRequest, NextResponse } from 'next/server'
import puppeteer from "puppeteer-core"

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
}

interface GeneratePDFRequest {
  personalInfo: PersonalInfo
  aiGeneratedExperience: string
  format: 'A4' | 'Letter'
  jobTitle?: string
}

// POST /api/ai-agent-gala/jd2cv2/generate-pdf
export async function POST(request: NextRequest) {
  try {
    const body: GeneratePDFRequest = await request.json()
    const { personalInfo, aiGeneratedExperience, format = 'A4', jobTitle } = body

    // Validate required fields
    if (!personalInfo?.fullName) {
      return NextResponse.json(
        { error: 'Personal information with full name is required' },
        { status: 400 }
      )
    }

    if (!personalInfo?.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!aiGeneratedExperience) {
      return NextResponse.json(
        { error: 'AI generated experience is required' },
        { status: 400 }
      )
    }


    // Generate HTML content
    const htmlContent = generateResumeHTML(personalInfo, aiGeneratedExperience, format)

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

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${personalInfo.fullName.replace(/[^a-z0-9]/gi, '_')}_${jobTitle?.replace(/[^a-z0-9]/gi, '_') || 'Position'}_Resume.pdf"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    )
  }
}

// Convert markdown formatting to HTML
function convertMarkdownToHTML(text: string): string {
  return text
    // Convert **bold** to <strong>bold</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>italic</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert line breaks to <br> tags
    .replace(/\n/g, '<br>')
}

// Parse AI experience text into company sections
function parseExperienceIntoSections(aiText: string): string[] {
  try {
    // Strategy 1: Split by company headers (bold company name pattern)
    // Look for patterns like: **Company Name | Position | Date Range**
    let sections = aiText.split(/\n\n(?=\*\*.*?\|.*?\|.*?\*\*)/)
    
    if (sections.length > 1) {
      return sections.filter(section => section.trim().length > 0)
    }
    
    // Strategy 2: Split by double line breaks (paragraph separation)
    sections = aiText.split(/\n\n+/)
    
    if (sections.length > 2) {
      return sections.filter(section => section.trim().length > 50) // Filter out short fragments
    }
    
    // Strategy 3: Split by company/position indicators
    sections = aiText.split(/(?=\n[A-Z][^a-z]*?\s*\|)/)
    
    if (sections.length > 1) {
      return sections.filter(section => section.trim().length > 0)
    }
    
    // Fallback: return as single section if parsing fails
    return [aiText]
    
  } catch (error) {
    console.error('Experience parsing failed:', error)
    return [aiText] // Fallback to single section
  }
}

function generateResumeHTML(personalInfo: PersonalInfo, aiExperience: string, format: string): string {
  // Parse AI experience into sections and convert markdown
  const experienceSections = parseExperienceIntoSections(aiExperience)
  const formattedExperienceSections = experienceSections.map(section => convertMarkdownToHTML(section))
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
      padding: 30px;
      background: white;
    }
    
    .header {
      text-align: center;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }
    
    .contact-info {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 10px;
      color: #6b7280;
    }
    
    .contact-info span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .contact-info svg {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #6366f1;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .summary-list, .skills-list, .languages-list, .certificates-list {
      list-style: none;
    }
    
    .summary-list li {
      margin-bottom: 8px;
      padding-left: 15px;
      position: relative;
    }
    
    .summary-list li:before {
      content: '•';
      color: #6366f1;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    
    .skills-grid, .languages-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-tag, .language-tag {
      background: #f3f4f6;
      color: #374151;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 10px;
      border: 1px solid #e5e7eb;
    }
    
    .education-item {
      margin-bottom: 12px;
      padding-left: 15px;
      position: relative;
    }
    
    .education-item:before {
      content: '';
      position: absolute;
      left: 0;
      top: 2px;
      width: 12px;
      height: 12px;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDEyTDIuNSA3TDEwIDJMMTcuNSA3TDEwIDEyWiIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yLjUgMTNMMTAgMThMMTcuNSAxMyIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=');
      background-size: contain;
      background-repeat: no-repeat;
    }
    
    .education-title {
      font-weight: 600;
      color: #1f2937;
    }
    
    .education-details {
      color: #6b7280;
      font-size: 10px;
    }
    
    .certificates-list li {
      margin-bottom: 6px;
      padding-left: 15px;
      position: relative;
    }
    
    .certificates-list li:before {
      content: '';
      position: absolute;
      left: 0;
      top: 2px;
      width: 12px;
      height: 12px;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkuMDQ5IDIuOTI3QzkuMzY1IDIuMTI3IDEwLjYzNSAyLjEyNyAxMC45NTEgMi45MjdMMTIuNDA0IDYuNTA2TDE2LjM2IDcuMjE3QzE3LjIyMSA3LjM4OSAxNy41OTggOC40NzQgMTYuOTY5IDkuMDc5TDE0LjEwMyAxMS44MzZMMTQuNzY2IDE1Ljc2N0MxNC45MjIgMTYuNjIyIDE0LjAxIDE3LjI3MSAxMy4yMzcgMTYuODU1TDEwIDEzLjM0N0w2Ljc2MyAxNi44NTRDNS45OSAxNy4yNyA1LjA3OCAxNi42MjEgNS4yMzQgMTUuNzY2TDUuODk3IDExLjgzNkwzLjAzMSA5LjA3OUMyLjQwMiA4LjQ3NCAyLjc3OSA3LjM4OSAzLjY0IDcuMjE3TDcuNTk2IDYuNTA2TDkuMDQ5IDIuOTI3WiIgc3Ryb2tlPSIjZjU5ZTBiIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSIjZmVmM2M3Ii8+Cjwvc3ZnPgo=');
      background-size: contain;
      background-repeat: no-repeat;
    }
    
    .ai-experience {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      font-family: inherit;
      line-height: 1.6;
    }
    
    .experience-company {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 8px;
      padding-bottom: 8px;
    }
    
    .experience-company:not(:last-child) {
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 12px;
    }
    
    .ai-experience strong {
      font-weight: 700;
      color: #1f2937;
    }
    
    .ai-experience em {
      font-style: italic;
      color: #374151;
    }
    
    .two-column-container {
      display: flex;
      gap: 20px;
      margin-bottom: 25px;
    }
    
    .column {
      flex: 1;
    }
    
    .column .section {
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="resume">
    <!-- Header -->
    <div class="header">
      <h1>${personalInfo.fullName}</h1>
      <div class="contact-info">
        ${personalInfo.email ? `<span>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
          </svg>
          ${personalInfo.email}
        </span>` : ''}
        ${personalInfo.phone ? `<span>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
          </svg>
          ${personalInfo.phone}
        </span>` : ''}
        ${personalInfo.location ? `<span>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
          </svg>
          ${personalInfo.location}
        </span>` : ''}
        ${personalInfo.linkedin ? `<span>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
          </svg>
          ${personalInfo.linkedin}
        </span>` : ''}
        ${personalInfo.website ? `<span>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"/>
          </svg>
          ${personalInfo.website}
        </span>` : ''}
      </div>
    </div>

    <!-- Professional Summary -->
    ${personalInfo.summary.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Professional Summary</h2>
      <ul class="summary-list">
        ${personalInfo.summary.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <!-- Professional Experience -->
    <div class="section">
      <h2 class="section-title">Professional Experience</h2>
      <div class="ai-experience">
        ${formattedExperienceSections.map(section => `
          <div class="experience-company">
            ${section}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Technical Skills & Languages (Two Column Layout) -->
    ${(personalInfo.technicalSkills.length > 0 || personalInfo.languages.length > 0) ? `
    <div class="two-column-container">
      <div class="column">
        ${personalInfo.technicalSkills.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Technical Skills</h2>
          <div class="skills-grid">
            ${personalInfo.technicalSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
        ` : ''}
      </div>
      <div class="column">
        ${personalInfo.languages.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Languages</h2>
          <div class="languages-grid">
            ${personalInfo.languages.map(lang => `<span class="language-tag">${lang}</span>`).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Education & Certifications (Two Column Layout) -->
    ${(personalInfo.education.length > 0 || personalInfo.certificates.length > 0) ? `
    <div class="two-column-container">
      <div class="column">
        ${personalInfo.education.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Education</h2>
          ${personalInfo.education.map(edu => `
            <div class="education-item">
              <div class="education-title">${edu.degree}</div>
              <div class="education-details">
                ${edu.institution} • ${edu.year}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
      <div class="column">
        ${personalInfo.certificates.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Certifications</h2>
          <ul class="certificates-list">
            ${personalInfo.certificates.map(cert => `<li>${cert}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Custom Modules -->
    ${personalInfo.customModules.map(module => `
    <div class="section">
      <h2 class="section-title">${module.title}</h2>
      <ul class="summary-list">
        ${module.content.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
    `).join('')}
  </div>
</body>
</html>
  `
}