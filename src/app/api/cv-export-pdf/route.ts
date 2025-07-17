import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()
        
    const convertToBase64 = async (imageMap: any[]) => {
      return await Promise.all(imageMap.map(async (file: any) => {
        try {
          const response = await fetch(file.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const buffer = await response.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          const mimeType = response.headers.get('content-type') || 'image/png'
          return { ...file, base64: `data:${mimeType};base64,${base64}` }
        } catch (error) {
          return { ...file, base64: null }
        }
      }))
    }
    
    for (const item of data.jd || []) {
      if (item.jd_responsibilities_mindmap && item.jd_responsibilities_mindmap.length > 0) {
        item.jd_responsibilities_mindmap = await convertToBase64(item.jd_responsibilities_mindmap)
      }
      if (item.jd_requirements_mindmap && item.jd_requirements_mindmap.length > 0) {
        item.jd_requirements_mindmap = await convertToBase64(item.jd_requirements_mindmap)
      }
    }
    
    const formatDisplayTime = (dateStr: string) => {
      if (!dateStr) return ''
      const parts = dateStr.split(' - ')
      if (parts.length === 2) {
        const startYear = new Date(parts[0].trim()).getFullYear()
        const endYear = new Date(parts[1].trim()).getFullYear()
        return `${startYear} - ${endYear}`
      }
      const year = new Date(dateStr).getFullYear()
      return year.toString() || dateStr
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; padding: 2rem; width: 1600px; height: auto; overflow: hidden; }
          .container { width: 100%; margin: 0; }
          .mb-8 { margin-bottom: 2rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .grid { display: grid; }
          .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
          .gap-6 { gap: 1.5rem; }
          .gap-4 { gap: 1rem; }
          .gap-8 { gap: 2rem; }
          .bg-white { background: white; }
          .rounded-lg { border-radius: 0.5rem; }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
          .border { border: 1px solid #e5e7eb; }
          .border-purple-200 { border-color: #e9d5ff; }
          .p-6 { padding: 1.5rem; }
          .p-4 { padding: 1rem; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .items-start { align-items: flex-start; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .h-full { height: 100%; }
          .w-1-3 { width: 33.333333%; }
          .w-2-3 { width: 66.666667%; }
          .w-full { width: 100%; }
          .w-80 { width: 20rem; }
          .flex-1 { flex: 1 1 0%; }
          .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .text-purple-900 { color: #581c87; }
          .text-purple-800 { color: #6b21a8; }
          .text-purple-700 { color: #7c3aed; }
          .text-gray-900 { color: #111827; }
          .text-gray-700 { color: #374151; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-500 { color: #6b7280; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bg-purple-100 { background-color: #f3e8ff; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .leading-relaxed { line-height: 1.625; }
          .whitespace-pre-wrap { white-space: pre-wrap; }
          .max-h-80 { max-height: 20rem; }
          .space-y-4 > * + * { margin-top: 1rem; }
          .border-2 { border-width: 2px; }
          .border-purple-300 { border-color: #c4b5fd; }
          .bg-gradient-purple { background: linear-gradient(to right, #8b5cf6, #7c3aed); }
          .rounded-xl { border-radius: 0.75rem; }
          img { max-width: 100%; height: auto; border-radius: 0.25rem; }
        </style>
      </head>
      <body>
        <div class="container">
          ${data.jd && data.jd.length > 0 ? `
            <div class="mb-8">
              <h1 class="text-2xl font-bold text-purple-900 mb-6">Job Description Breakdown & Match</h1>
              ${data.jd.map((item: any) => `
                <div class="mb-8">
                  <div class="bg-white rounded-lg shadow-sm border-2 border-purple-300 p-4 mb-6">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <h3 class="text-lg font-bold text-purple-900 mb-1">${item.position_title || 'Untitled Position'}</h3>
                        <p class="text-sm text-gray-600">${item.company || 'Unknown Company'}</p>
                      </div>
                      <div class="bg-gradient-purple px-8 py-4 rounded-xl shadow-lg">
                        <div class="text-center text-2xl font-bold text-white">
                          Fit Score: ${item.fit_score || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-8">
                    <div class="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
                      <h4 class="text-lg font-semibold text-purple-700 mb-4">Responsibilities Breakdown</h4>
                      ${item.jd_responsibilities_mindmap && item.jd_responsibilities_mindmap.length > 0 ? `
                        <div class="space-y-4">
                          ${item.jd_responsibilities_mindmap.map((file: any) => 
                            file.base64 
                              ? `<img src="${file.base64}" alt="${file.name}" class="w-full rounded max-h-80 object-contain shadow-sm" />`
                              : `<div class="text-sm text-gray-500">Image: ${file.name}</div>`
                          ).join('')}
                        </div>
                      ` : '<div class="text-sm text-gray-500">No mindmap available</div>'}
                    </div>
                    <div class="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
                      <h4 class="text-lg font-semibold text-purple-700 mb-4">Requirements Breakdown</h4>
                      ${item.jd_requirements_mindmap && item.jd_requirements_mindmap.length > 0 ? `
                        <div class="space-y-4">
                          ${item.jd_requirements_mindmap.map((file: any) => 
                            file.base64 
                              ? `<img src="${file.base64}" alt="${file.name}" class="w-full rounded max-h-80 object-contain shadow-sm" />`
                              : `<div class="text-sm text-gray-500">Image: ${file.name}</div>`
                          ).join('')}
                        </div>
                      ` : '<div class="text-sm text-gray-500">No mindmap available</div>'}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${data.cv && Object.values(data.cv).some((arr: any) => arr?.length > 0) ? `
            <div>
              <h1 class="text-2xl font-bold text-purple-900 mb-6">Customized CV</h1>
              
              ${(data.cv.Summary?.length > 0 || data.cv.Education?.length > 0) ? `
                <div class="grid grid-cols-2 gap-6 mb-6">
                  ${data.cv.Summary?.length > 0 ? `
                    <div class="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
                      <div class="flex h-full">
                        <div class="flex items-center justify-center w-1-3">
                          <div class="text-xl font-bold text-gray-900">${data.cv.Summary[0].firm || ''}</div>
                        </div>
                        <div class="w-2-3 flex items-center">
                          <div class="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed text-right w-full">${data.cv.Summary[0].responsibilities_summary || ''}</div>
                        </div>
                      </div>
                    </div>
                  ` : ''}
                  ${data.cv.Education?.length > 0 ? `
                    <div class="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
                      <h3 class="text-lg font-semibold text-purple-900 mb-2">${data.cv.Education[0].cv_component || 'Education'}</h3>
                      <div class="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">${data.cv.Education[0].responsibilities_summary || ''}</div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
              
              ${data.cv['Awards & Certificates']?.length > 0 ? `
                <div class="mb-6">
                  <h2 class="text-2xl font-bold text-purple-900 mb-6">Awards & Certificates</h2>
                  <div class="grid grid-cols-4 gap-4 mb-6">
                    ${data.cv['Awards & Certificates'].map((item: any) => `
                      <div class="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
                        <div class="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">${item.responsibilities_summary || ''}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              
              ${data.cv.Work?.length > 0 ? `
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-purple-800 mb-4">Work Experience</h2>
                  ${data.cv.Work.map((item: any) => `
                    <div class="bg-white rounded-lg shadow-sm border border-purple-200 p-6 mb-4">
                      <div class="flex justify-between items-start mb-4">
                        <h3 class="text-lg font-semibold text-purple-900">${item.firm || 'Untitled Firm'}</h3>
                        <span class="text-sm text-gray-500">${formatDisplayTime(item.time)}</span>
                      </div>
                      <div class="mb-4">
                        <h4 class="text-sm font-medium text-purple-700 mb-2">Responsibilities</h4>
                        <div class="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">${item.responsibilities_text || 'No responsibilities content available'}</div>
                      </div>
                      <div>
                        <h4 class="text-sm font-medium text-purple-700 mb-2">Achievements</h4>
                        <div class="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">${item.achievements_text || 'No achievements content available'}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${data.cv.Project?.length > 0 ? `
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-purple-800 mb-4">Projects</h2>
                  ${data.cv.Project.map((item: any) => `
                    <div class="bg-white rounded-lg shadow-sm border border-purple-200 p-6 mb-4">
                      <div class="flex justify-between items-start mb-4">
                        <h3 class="text-lg font-semibold text-purple-900">${item.firm || 'Untitled Project'}</h3>
                        <span class="text-sm text-gray-500">${formatDisplayTime(item.time)}</span>
                      </div>
                      <div class="mb-4">
                        <h4 class="text-sm font-medium text-purple-700 mb-2">Responsibilities</h4>
                        <div class="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">${item.responsibilities_text || 'No responsibilities content available'}</div>
                      </div>
                      <div>
                        <h4 class="text-sm font-medium text-purple-700 mb-2">Achievements</h4>
                        <div class="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">${item.achievements_text || 'No achievements content available'}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${data.cv['Closing Sentences']?.length > 0 ? `
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-purple-800 mb-4">Closing Sentences</h2>
                  ${data.cv['Closing Sentences'].map((item: any) => `
                    <div class="bg-white rounded-lg shadow-sm border border-purple-200 p-6 mb-4">
                      <div class="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">${item.responsibilities_summary || ''}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    })
    
    const page = await browser.newPage()
    await page.setViewport({ width: 1600, height: 1600 })
    await page.setContent(html, { waitUntil: 'networkidle2' })
    
    await page.evaluate(() => {
      return Promise.all(Array.from(document.images, img => {
        if (img.complete) return Promise.resolve()
        return new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          setTimeout(reject, 10000)
        })
      }))
    })
    
    const contentHeight = await page.evaluate(() => document.body.scrollHeight)
    const finalHeight = Math.max(contentHeight + 100, 1600)
    
    const pdf = await page.pdf({
      width: '1600px',
      height: `${finalHeight}px`,
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      pageRanges: '1'
    })
    
    await browser.close()

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=cv-preview.pdf'
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}