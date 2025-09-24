import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// Helper function to generate HTML content for PDF
function generateResumeHTML(personalInfo: any, workExperience: string, format: string = 'A4'): string {
  const pageSize = format === 'A4' ? 'A4' : 'Letter'

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume - ${personalInfo.fullName || 'Resume'}</title>
        <style>
            @page {
                size: ${pageSize};
                margin: 0.75in;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Georgia', 'Times New Roman', serif;
                font-size: 11pt;
                line-height: 1.4;
                color: #333;
                background: #fff;
            }

            .resume-container {
                max-width: 100%;
                margin: 0 auto;
                background: white;
            }

            .header {
                text-align: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid #6B46C1;
            }

            .name {
                font-size: 24pt;
                font-weight: bold;
                color: #6B46C1;
                margin-bottom: 0.5rem;
            }

            .contact-info {
                font-size: 10pt;
                color: #666;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 1rem;
            }

            .contact-item {
                white-space: nowrap;
            }

            .section {
                margin-bottom: 1.5rem;
            }

            .section-title {
                font-size: 14pt;
                font-weight: bold;
                color: #6B46C1;
                margin-bottom: 0.75rem;
                padding-bottom: 0.25rem;
                border-bottom: 1px solid #E5E7EB;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .summary {
                font-size: 11pt;
                line-height: 1.5;
                text-align: justify;
            }

            .work-experience {
                font-size: 11pt;
                line-height: 1.4;
            }

            .work-experience h3 {
                font-size: 12pt;
                font-weight: bold;
                color: #374151;
                margin-bottom: 0.25rem;
            }

            .work-experience h4 {
                font-size: 11pt;
                font-weight: bold;
                color: #6B46C1;
                margin-bottom: 0.5rem;
            }

            .work-experience ul {
                margin-left: 1rem;
                margin-bottom: 1rem;
            }

            .work-experience li {
                margin-bottom: 0.25rem;
                list-style-type: disc;
            }

            .skills-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 0.5rem;
            }

            .skill-category {
                margin-bottom: 0.5rem;
            }

            .skill-category-title {
                font-weight: bold;
                color: #6B46C1;
                font-size: 10pt;
                margin-bottom: 0.25rem;
            }

            .skill-list {
                font-size: 10pt;
                color: #666;
                line-height: 1.3;
            }

            .education-item {
                margin-bottom: 0.75rem;
            }

            .education-degree {
                font-weight: bold;
                color: #374151;
            }

            .education-school {
                color: #6B46C1;
                font-style: italic;
            }

            .education-year {
                color: #666;
                font-size: 10pt;
            }

            .certificates {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 0.5rem;
            }

            .certificate-item {
                font-size: 10pt;
                color: #374151;
            }

            .page-break {
                page-break-before: always;
            }

            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="resume-container">
            <!-- Header -->
            <div class="header">
                <div class="name">${personalInfo.fullName || 'Your Name'}</div>
                <div class="contact-info">
                    ${personalInfo.email ? `<div class="contact-item">${personalInfo.email}</div>` : ''}
                    ${personalInfo.phone ? `<div class="contact-item">${personalInfo.phone}</div>` : ''}
                    ${personalInfo.location ? `<div class="contact-item">${personalInfo.location}</div>` : ''}
                    ${personalInfo.linkedin ? `<div class="contact-item">${personalInfo.linkedin}</div>` : ''}
                    ${personalInfo.website ? `<div class="contact-item">${personalInfo.website}</div>` : ''}
                </div>
            </div>

            <!-- Summary -->
            ${personalInfo.summary && personalInfo.summary.length > 0 ? `
            <div class="section">
                <div class="section-title">Professional Summary</div>
                <div class="summary">
                    ${personalInfo.summary.join(' ')}
                </div>
            </div>
            ` : ''}

            <!-- Work Experience -->
            <div class="section">
                <div class="section-title">Work Experience</div>
                <div class="work-experience">
                    ${formatWorkExperience(workExperience)}
                </div>
            </div>

            <!-- Technical Skills -->
            ${personalInfo.technicalSkills && personalInfo.technicalSkills.length > 0 ? `
            <div class="section">
                <div class="section-title">Technical Skills</div>
                <div class="skill-list">${personalInfo.technicalSkills.join(' • ')}</div>
            </div>
            ` : ''}

            <!-- Education -->
            ${personalInfo.education && personalInfo.education.length > 0 ? `
            <div class="section">
                <div class="section-title">Education</div>
                ${personalInfo.education.map((edu: any) => `
                    <div class="education-item">
                        <div class="education-degree">${edu.degree || ''}</div>
                        <div class="education-school">${edu.school || ''}</div>
                        <div class="education-year">${edu.year || ''}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Certificates -->
            ${personalInfo.certificates && personalInfo.certificates.length > 0 ? `
            <div class="section">
                <div class="section-title">Certifications</div>
                <div class="certificates">
                    ${personalInfo.certificates.map((cert: any) => `
                        <div class="certificate-item">${cert}</div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Languages -->
            ${personalInfo.languages && personalInfo.languages.length > 0 ? `
            <div class="section">
                <div class="section-title">Languages</div>
                <div class="skill-list">${personalInfo.languages.join(' • ')}</div>
            </div>
            ` : ''}
        </div>
    </body>
    </html>
  `
}

// Helper function to format work experience markdown to HTML
function formatWorkExperience(workExperience: string): string {
  if (!workExperience) return ''

  return workExperience
    // Convert **text** to <h4>text</h4> (for job titles)
    .replace(/\*\*([^*]+)\*\*/g, '<h4>$1</h4>')
    // Convert bullet points to list items
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive list items in <ul> tags
    .replace(/(<li>.*<\/li>)/gs, (match) => {
      const items = match.match(/<li>.*?<\/li>/g) || []
      if (items.length > 0) {
        return `<ul>${items.join('')}</ul>`
      }
      return match
    })
    // Convert line breaks to paragraphs
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

export async function POST(request: NextRequest) {
  try {
    const { personalInfo, workExperience, format = 'A4' } = await request.json()

    if (!personalInfo) {
      return NextResponse.json({ error: 'Missing personal information' }, { status: 400 })
    }

    if (!workExperience) {
      return NextResponse.json({ error: 'Missing work experience' }, { status: 400 })
    }

    // Generate HTML content
    const htmlContent = generateResumeHTML(personalInfo, workExperience, format)

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })

    try {
      const page = await browser.newPage()

      // Set content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      })

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: format as any,
        printBackground: true,
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in'
        }
      })

      await browser.close()

      // Return PDF as blob
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="resume.pdf"`
        }
      })

    } catch (error) {
      await browser.close()
      throw error
    }

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: (error as Error).message },
      { status: 500 }
    )
  }
}