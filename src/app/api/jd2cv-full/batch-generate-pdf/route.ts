import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { put } from '@vercel/blob'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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
    userId: string
  }
  experienceModules: Array<{
    id: string
    title: string
    company: string
    content: string
    isOptimized: boolean
  }>
  jdId: string
}

/**
 * Generate comprehensive HTML for PDF
 * 复制自 generate-pdf 的逻辑
 */
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
  ${config.includePersonalInfo ? `
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
  ` : ''}

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

  ${validExperiences.length > 0 ? `
  <!-- Experience Section - North American Standard -->
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
        <div class="exp-header">
          <div class="exp-title">${company} — ${role}</div>
          <div class="exp-time">${time}</div>
        </div>
        <ul class="exp-bullets">
          ${bullets.map(bullet => `<li>${bullet}</li>`).join('')}
        </ul>
      </div>
      `
    }).join('')}
  </div>
  ` : ''}
</body>
</html>`
}

// 批量生成单个JD的PDF的核心逻辑
// 优化版本：接受共享的browser实例
async function generateSingleJDPDF(jd: any, pdfModules: any[], config: any, sharedBrowser?: any) {
  let browser = sharedBrowser
  let shouldCloseBrowser = false
  
  try {
    // 准备experience modules
    const experienceModules = pdfModules.map(module => ({
      id: module.sourceIds?.experienceId || module.id,
      title: module.title,
      company: module.company || 'Unknown Company',
      content: module.items.join('\n• '),
      isOptimized: module.sourceType === 'optimized'
    }))

    const pdfRequest: PDFGenerationRequest = {
      config,
      experienceModules,
      jdId: jd.id
    }

    // Generate HTML content
    const html = generateComprehensiveHTML(pdfRequest)

    // 如果没有共享browser，创建新的（向后兼容）
    if (!browser) {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      })
      shouldCloseBrowser = true
    }

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

      // 关闭页面但保留browser（如果是共享的）
      await page.close()
      
      // 只有非共享browser才需要关闭
      if (shouldCloseBrowser) {
        await browser.close()
      }

      // Check file size (should be < 2MB for reasonable download)
      const sizeInMB = pdf.length / (1024 * 1024)

      if (sizeInMB > 2) {
        throw new Error(`PDF exceeds 2MB limit: ${sizeInMB.toFixed(2)}MB`)
      }

      // Upload PDF to Vercel Blob and update JD record
      try {
        // Generate filename
        const safeName = (config.personalInfo.fullName || 'CV').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
        const filename = `${safeName}_CV_${timestamp}.pdf`

        // Upload to Vercel Blob
        const blob = await put(filename, pdf, {
          access: 'public',
          contentType: 'application/pdf'
        })

        // Update JD record with PDF info
        const { error: updateError1 } = await supabase
          .from('jd_records')
          .update({ cv_pdf_url: blob.url })
          .eq('id', jd.id)
          .eq('user_id', config.userId)

        const { error: updateError2 } = await supabase
          .from('jd_records')
          .update({ cv_pdf_filename: filename })
          .eq('id', jd.id)
          .eq('user_id', config.userId)

        if (updateError1 || updateError2) {
          console.error('PDF record update error:', updateError1 || updateError2)
        }

        return {
          success: true,
          jdId: jd.id,
          pdfGenerated: true,
          fileSize: `${sizeInMB.toFixed(2)}MB`,
          uploadUrl: blob.url,
          filename
        }
      } catch (uploadError) {
        console.error('PDF upload error:', uploadError)
        throw uploadError
      }

    } catch (pdfError) {
      // 错误时也要正确处理browser关闭
      if (page) {
        await page.close()
      }
      if (shouldCloseBrowser && browser) {
        await browser.close()
      }
      throw pdfError
    }

  } catch (error: any) {
    return {
      success: false,
      jdId: jd.id,
      error: error.message
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jdsData, config } = body

    if (!jdsData || !Array.isArray(jdsData) || jdsData.length === 0) {
      return NextResponse.json(
        { error: 'JDs data array is required' },
        { status: 400 }
      )
    }

    if (!config) {
      return NextResponse.json(
        { error: 'PDF config is required' },
        { status: 400 }
      )
    }

    if (!config.personalInfo.fullName) {
      return NextResponse.json(
        { error: 'Full name is required for PDF generation' },
        { status: 400 }
      )
    }

    // 批量生成所有JD的PDF - 性能优化版本
    
    // 创建共享browser实例
    const sharedBrowser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
    
    try {
      // 并行处理所有PDF生成
      const pdfPromises = jdsData.map(async (jdData) => {
        return await generateSingleJDPDF(jdData.jd, jdData.pdfModules, config, sharedBrowser)
      })
      
      // 等待所有PDF生成完成
      const results = await Promise.all(pdfPromises)
      
      // 关闭共享browser
      await sharedBrowser.close()
      
      const successCount = results.filter(r => r.success).length
      const failureCount = results.filter(r => !r.success).length
      
    } catch (error) {
      // 错误时关闭共享browser
      await sharedBrowser.close()
      throw error
    }

    return NextResponse.json({
      success: true,
      message: `Batch PDF generation completed: ${successCount} succeeded, ${failureCount} failed`,
      results,
      summary: {
        total: jdsData.length,
        succeeded: successCount,
        failed: failureCount
      }
    })

  } catch (error: any) {
    console.error('❌ [Batch Generate PDF] API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process batch PDF generation', details: error.message },
      { status: 500 }
    )
  }
}