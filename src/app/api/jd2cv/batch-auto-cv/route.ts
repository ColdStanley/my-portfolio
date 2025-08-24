import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { put } from '@vercel/blob'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// AI调用函数 - 复制自batch-analyze-jd
async function callAI(prompt: string, aiModel: string = 'deepseek', temperature: number = 0.3) {
  try {
    if (aiModel === 'openai') {
      return await callOpenAI(prompt, temperature)
    } else {
      // Default to DeepSeek
      return await callDeepSeek(prompt, temperature)
    }
  } catch (error) {
    console.error('AI API error:', error)
    throw new Error('Failed to analyze with AI')
  }
}

async function callOpenAI(prompt: string, temperature: number = 0.3) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

async function callDeepSeek(prompt: string, temperature: number = 0.3) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('DeepSeek API error:', error)
    throw error
  }
}

// 完全复制现有Auto CV的分析逻辑，使用HTTP调用确保一致性
const step1_AnalyzeJD = async (jd: any, userId: string) => {
  try {
    // 完全复制现有Auto CV的调用方式，但使用完整URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/jd2cv/analyze-jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jdId: jd.id,
        userId: userId
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to analyze JD')
    }
    
    const result = await response.json()
    return result
  } catch (error: any) {
    throw new Error(`Analysis failed: ${error.message}`)
  }
}

// 复制现有的 step2_ImportStarred 逻辑
const step2_ImportStarred = async (userId: string) => {
  // 从localStorage获取starred IDs (在API中需要通过请求参数传递)
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/experience?user_id=${userId}`)
  if (!response.ok) throw new Error('Failed to fetch experiences')
  
  const result = await response.json()
  const allExperiences = result.data || []
  
  // 注意：在API端无法访问localStorage，需要客户端传递starredIds
  return allExperiences
}

// 复制现有的 getEndYear 函数
const getEndYear = (timeString: string | null): number => {
  if (!timeString) return 0
  if (timeString.toLowerCase().includes('present') || 
      timeString.toLowerCase().includes('current')) {
    return new Date().getFullYear()
  }
  
  const yearMatches = timeString.match(/\d{4}/g)
  if (yearMatches && yearMatches.length > 0) {
    return parseInt(yearMatches[yearMatches.length - 1])
  }
  
  return 0
}

// 完全复制现有Auto CV的优化逻辑，使用HTTP调用确保一致性
const step3_BatchOptimize = async (experiences: any[], jd: any, userId: string) => {
  const optimizedData: any = {}
  
  for (const experience of experiences) {
    try {
      // 完全复制现有Auto CV的调用方式，但使用完整URL
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/jd2cv/optimize-cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId: experience.id,
          jdKeywords: jd.keywords_from_sentences,
          userId: userId
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to optimize experience: ${experience.title}`)
      }
      
      const result = await response.json()
      optimizedData[experience.id] = {
        originalExperience: experience,
        optimizedContent: result.data.optimizedContent,
        userKeywords: result.data.jdKeywords || [],
        isGenerated: true,
        isGenerating: false
      }
    } catch (error) {
      console.error(`Failed to optimize experience ${experience.id}:`, error)
      // 继续处理其他experience
    }
  }
  
  return { experiences, optimizedData }
}

// 复制现有的 generateModuleTitle 和 extractBullets 函数
const generateModuleTitle = (company: string, title: string, time: string) => {
  return `${company} · ${title} · ${time}`
}

const extractBullets = (content: string): string[] => {
  return content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[•·\-\*]\s*/, ''))
}

// 复制现有的 step4_BatchSendToPDF 逻辑
const step4_BatchSendToPDF = async ({ experiences, optimizedData }: any) => {
  const pdfModules = []
  
  for (const experience of experiences) {
    const optimization = optimizedData[experience.id]
    
    const draft = {
      id: `${experience.id}-optimized-${Date.now()}`,
      title: generateModuleTitle(experience.company, experience.title, experience.time),
      items: extractBullets(optimization.optimizedContent),
      sourceType: 'optimized' as const,
      sourceIds: {
        experienceId: experience.id,
        optimizationId: `${experience.id}-opt`
      },
      company: experience.company || 'Unknown Company'
    }
    
    pdfModules.push(draft)
  }
  
  return pdfModules
}

// 复制generate-pdf的HTML生成逻辑
function generatePDFHTML(data: any): string {
  const { config, experienceModules } = data
  const { personalInfo } = config

  // Filter valid data
  const validSummary = config.includeSummary ? personalInfo.summary.filter((item: string) => item.trim()) : []
  const validTechnicalSkills = config.includeSkills ? personalInfo.technicalSkills.filter((skill: string) => skill.trim()) : []
  const validLanguages = config.includeSkills ? personalInfo.languages.filter((lang: string) => lang.trim()) : []
  const validEducation = config.includeEducation ? personalInfo.education.filter((edu: any) => edu.degree || edu.institution) : []
  const validCertificates = config.includeCertificates ? personalInfo.certificates.filter((cert: string) => cert.trim()) : []
  const validExperiences = config.includeExperiences ? experienceModules.filter((exp: any) => exp.content.trim()) : []

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
      ${[personalInfo.email, personalInfo.phone, personalInfo.location].filter((item: string) => item).length > 0 ? `
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
      ${[personalInfo.linkedin, personalInfo.website].filter((item: string) => item).length > 0 ? `
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
            ${validSummary.map((item: string) => `<li>${item}</li>`).join('')}
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
        ${validEducation.map((edu: any) => `
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
        ${validCertificates.map((cert: string) => `<div class="cert-item">${cert}</div>`).join('')}
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${validExperiences.length > 0 ? `
  <!-- Experience Section - North American Standard -->
  <div class="section">
    <h2>Professional Experience</h2>
    ${validExperiences.map((exp: any) => {
      // Extract company, role, and time from title (format: company · title · time)
      const titleParts = exp.title.split(' · ')
      const company = titleParts[0] || 'Unknown Company'
      const role = titleParts[1] || exp.title
      const time = titleParts[2] || 'Present'
      
      // Convert content to bullet points
      const bullets = exp.content.split('\n').filter((line: string) => line.trim()).map((line: string) => {
        // Remove existing bullet points if any
        return line.replace(/^[•·\-\*]\s*/, '').trim()
      }).filter((line: string) => line.length > 0)
      
      return `
      <div class="exp">
        <div class="exp-header">
          <div class="exp-title">${company} — ${role}</div>
          <div class="exp-time">${time}</div>
        </div>
        <ul class="exp-bullets">
          ${bullets.map((bullet: string) => `<li>${bullet}</li>`).join('')}
        </ul>
      </div>
      `
    }).join('')}
  </div>
  ` : ''}
</body>
</html>`
}

// 复制现有Auto CV的PDF处理逻辑
const step5_GeneratePDF = async (pdfModules: any[], jd: any, config: any) => {
  try {
    // Prepare experience modules for PDF - 复制现有逻辑
    const experienceModules = pdfModules.map(module => ({
      id: module.sourceIds?.experienceId || module.id,
      title: module.title,
      company: module.company || 'Unknown Company',
      content: module.items.join('\n• '),
      isOptimized: module.sourceType === 'optimized'
    }))
    
    // 使用内部PDF生成逻辑，避免HTTP调用
    const puppeteer = require('puppeteer')
    
    const pdfRequest = {
      config,
      experienceModules,
      jdId: jd.id,
      userId: config.userId
    }
    
    // Generate HTML content - 直接嵌入HTML生成逻辑
    const html = generatePDFHTML(pdfRequest)
    
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
        throw new Error(`PDF exceeds 2MB limit: ${sizeInMB.toFixed(2)}MB`)
      }
      
      // Upload to Vercel Blob and update JD record - 复制现有逻辑
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
        
        // Update JD record with PDF info - 使用现有字段
        const { error: updateError1 } = await supabase
          .from('jd_records')
          .update({ cv_pdf_url: blob.url })
          .eq('id', jd.id)
          .eq('user_id', jd.user_id)
          
        const { error: updateError2 } = await supabase
          .from('jd_records')
          .update({ cv_pdf_filename: filename })
          .eq('id', jd.id)
          .eq('user_id', jd.user_id)
        
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
      await browser.close()
      throw pdfError
    }
    
  } catch (error: any) {
    throw new Error(`PDF generation failed: ${error.message}`)
  }
}

// 处理单个JD的完整流程 - 直接复制现有逻辑
const processSingleJD = async (jd: any, userId: string, config: any, starredExperiences: any[]) => {
  try {
    // Step 1: Analyze JD
    await step1_AnalyzeJD(jd, userId)
    
    // Step 2: 使用传入的 starredExperiences (已经排序好的)
    
    // Step 3: Batch Optimize
    const optimizedData = await step3_BatchOptimize(starredExperiences, jd, userId)
    
    // Step 4: Batch Send to PDF
    const pdfModules = await step4_BatchSendToPDF(optimizedData)
    
    // Step 5: Generate PDF
    const pdfResult = await step5_GeneratePDF(pdfModules, jd, config)
    
    return {
      success: true,
      jdId: jd.id,
      title: jd.title,
      company: jd.company,
      pdfGenerated: pdfResult.pdfGenerated,
      uploadUrl: pdfResult.uploadUrl,
      filename: pdfResult.filename,
      fileSize: pdfResult.fileSize
    }
    
  } catch (error: any) {
    console.error(`❌ [Batch Auto CV] Failed to process JD ${jd.id}:`, error)
    return {
      success: false,
      jdId: jd.id,
      title: jd.title,
      company: jd.company,
      error: error.message
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jdIds, userId, config, starredIds } = body

    if (!jdIds || !Array.isArray(jdIds) || jdIds.length === 0) {
      return NextResponse.json(
        { error: 'JD IDs array is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!config) {
      return NextResponse.json(
        { error: 'PDF config is required' },
        { status: 400 }
      )
    }

    // 获取所有指定的JD记录
    const { data: jds, error: jdError } = await supabase
      .from('jd_records')
      .select('*')
      .in('id', jdIds)
      .eq('user_id', userId)

    if (jdError || !jds || jds.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch JD records or no JDs found' },
        { status: 404 }
      )
    }

    // 获取starred experiences - 直接查询数据库避免HTTP调用
    const { data: allExperiences, error: expError } = await supabase
      .from('experience_records')
      .select('*')
      .eq('user_id', userId)
    
    if (expError || !allExperiences) {
      return NextResponse.json(
        { error: 'Failed to fetch experiences' },
        { status: 500 }
      )
    }
    
    // 使用传入的starredIds过滤和排序experiences
    const starredExperiences = allExperiences
      .filter((exp: any) => starredIds.includes(exp.id))
      .sort((a: any, b: any) => {
        const endYearA = getEndYear(a.time)
        const endYearB = getEndYear(b.time)
        return endYearB - endYearA // 最新工作经验在前
      })

    if (starredExperiences.length === 0) {
      return NextResponse.json(
        { error: 'No starred experiences found' },
        { status: 400 }
      )
    }

    // 批量处理所有JD - 并行处理优化
    console.log(`🔄 [Batch Auto CV] Starting parallel processing for ${jds.length} JDs`)
    
    const processPromises = jds.map(async (jd, i) => {
      console.log(`🔄 [Batch Auto CV] Processing JD ${i + 1}/${jds.length}: ${jd.title}`)
      return await processSingleJD(jd, userId, config, starredExperiences)
    })
    
    // 并行执行所有处理任务
    const results = await Promise.all(processPromises)

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Batch processing completed: ${successCount} succeeded, ${failureCount} failed`,
      results,
      summary: {
        total: jds.length,
        succeeded: successCount,
        failed: failureCount
      }
    })

  } catch (error: any) {
    console.error('❌ [Batch Auto CV] API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process batch Auto CV', details: error.message },
      { status: 500 }
    )
  }
}