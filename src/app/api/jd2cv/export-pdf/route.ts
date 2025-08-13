import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface ExportRequest {
  modules: any[]
  format: 'A4' | 'Letter'
  title?: string
  contentHeight?: number // Height in mm
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json()
    const { modules, format, title, contentHeight } = body

    if (!modules || modules.length === 0) {
      return NextResponse.json(
        { error: 'No modules provided for export' },
        { status: 400 }
      )
    }

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

    // Generate HTML content for PDF
    const htmlContent = generatePDFHTML(modules, format, title)
    
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    })

    // Configure PDF options for variable height
    const finalHeight = contentHeight ? Math.max(contentHeight + 24, 100) : 297 // Add body padding space, min 100mm
    const pdfOptions: any = {
      width: '210mm', // A4 width
      height: `${finalHeight}mm`,
      margin: {
        top: '0mm',
        bottom: '0mm', 
        left: '0mm',
        right: '0mm'
      },
      printBackground: false, // Text-only for ATS parsing
      preferCSSPageSize: true,
      scale: 1,
      displayHeaderFooter: false
    }

    // Generate PDF buffer
    const pdfBuffer = await page.pdf(pdfOptions)
    
    await browser.close()

    // Check file size (should be < 1MB)
    const sizeInMB = pdfBuffer.length / (1024 * 1024)
    console.log(`PDF size: ${sizeInMB.toFixed(2)}MB`)

    if (sizeInMB > 1) {
      return NextResponse.json(
        { 
          error: 'PDF exceeds 1MB limit', 
          actualSize: `${sizeInMB.toFixed(2)}MB`,
          suggestion: 'Consider reducing content or splitting into multiple pages'
        },
        { status: 413 }
      )
    }

    // Return PDF as response
    const fileName = title ? `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` : 'cv.pdf'
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function generatePDFHTML(modules: any[], format: string, title?: string): string {
  // Group modules back into rows for PDF (maintain row structure)
  const modulesByRow = modules.reduce((acc, module) => {
    // Try to extract row info from module metadata or use a default
    const rowId = module.rowId || 'row-1'
    if (!acc[rowId]) {
      acc[rowId] = []
    }
    acc[rowId].push(module)
    return acc
  }, {} as Record<string, any[]>)

  // Generate HTML for each row
  const rowElements = Object.entries(modulesByRow).map(([rowId, rowModules]) => {
    const moduleElements = rowModules.map(module => {
      const span = module.span || 6
      const items = (module.items || []).filter((item: string) => item.trim().length > 0)
      const showTitle = module.showTitle !== false
      const styleClasses = getModuleStyleClasses(module.style)
      
      return `
        <div class="module-container avoid-break" style="grid-column: span ${span};">
          <div class="module-content ${styleClasses}">
            ${showTitle && module.title ? `<h3 class="print-title">${escapeHTML(module.title)}</h3>` : ''}
            ${items.length > 0 ? `
              <ul class="module-items">
                ${items.map((item: string) => `
                  <li class="print-content print-bullet">${escapeHTML(item)}</li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        </div>
      `
    }).join('')

    return `
      <div class="cv-row" style="display: grid; grid-template-columns: repeat(12, 1fr); column-gap: 12px; margin-bottom: 8px;">
        ${moduleElements}
      </div>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(title || 'CV')}</title>
    <style>
        /* Print-specific styles */
        @page {
            size: ${format};
            margin: 0;
        }
        
        /* Global no-break rules */
        * {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
        }
        
        body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
            color: #000;
            line-height: 1.4;
            margin: 0;
            padding: 12mm;
            background: white;
        }
        
        .cv-row {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            column-gap: 12px;
            margin-bottom: 8px;
        }
        
        .module-container {
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .module-content {
            padding: 4px;
        }
        
        .print-title {
            font-size: 14px;
            line-height: 1.3;
            font-weight: 600;
            margin: 0 0 6px 0;
            color: #000;
        }
        
        .print-content {
            font-size: 11px;
            line-height: 1.45;
            font-weight: 400;
            margin: 0 0 3px 0;
            color: #000;
        }
        
        .module-items {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .print-bullet {
            margin: 0 0 2px 0;
            padding-left: 12px;
            position: relative;
            list-style: none;
        }
        
        .print-bullet:before {
            content: "• ";
            position: absolute;
            left: 0;
            top: 0;
            color: #666;
        }
        
        /* Module style classes for PDF */
        .style-left-rule {
            border-left: 2px solid #6b7280;
            padding-left: 12px;
        }
        
        .style-shaded-box {
            background-color: #f3f4f6;
        }
        
        .style-highlight {
            background-color: #fef3cd;
        }
        
        .style-border-thin {
            border: 1px solid #d1d5db;
            border-radius: 4px;
        }
        
        .style-border-thick {
            border: 2px solid #9ca3af;
            border-radius: 4px;
        }
        
        .style-padding-4 { padding: 2px; }
        .style-padding-8 { padding: 4px; }
        .style-padding-12 { padding: 6px; }
    </style>
</head>
<body>
    ${rowElements}
</body>
</html>
  `
}

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getModuleStyleClasses(style?: any): string {
  if (!style) return 'style-padding-8'
  
  let classes = []
  
  // Background
  if (style.background === 'left-rule') classes.push('style-left-rule')
  if (style.background === 'shaded-box') classes.push('style-shaded-box')  
  if (style.background === 'highlight') classes.push('style-highlight')
  
  // Border
  if (style.border === 'thin') classes.push('style-border-thin')
  if (style.border === 'thick') classes.push('style-border-thick')
  
  // Padding
  if (style.padding === 4) classes.push('style-padding-4')
  else if (style.padding === 12) classes.push('style-padding-12')
  else classes.push('style-padding-8')
  
  return classes.join(' ')
}