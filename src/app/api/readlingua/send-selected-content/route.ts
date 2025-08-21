import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface SelectedEmailContent {
  id: string
  content: string
  type: 'query_response' | 'ai_response' | 'user_query'
  source: 'query_history'
  timestamp: string
  queryId?: string
}

interface ReadLinguaEmailData {
  selectedContents: SelectedEmailContent[]
  userEmail: string
}

export async function POST(request: NextRequest) {
  try {
    const data: ReadLinguaEmailData = await request.json()
    
    if (!data.userEmail) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    if (!data.selectedContents || data.selectedContents.length === 0) {
      return NextResponse.json({ error: 'No content selected' }, { status: 400 })
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Generate email content
    const emailHTML = generateReadLinguaEmailHTML(data)
    const emailSubject = `📚 ReadLingua - Selected Learning Content - ${new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`

    // Send email
    await transporter.sendMail({
      from: `"ReadLingua" <${process.env.SMTP_FROM}>`,
      to: data.userEmail,
      subject: emailSubject,
      html: emailHTML,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Selected content sent successfully' 
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ 
      error: 'Failed to send email' 
    }, { status: 500 })
  }
}

function generateReadLinguaEmailHTML(data: ReadLinguaEmailData): string {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReadLingua - Selected Learning Content</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
            color: white;
            padding: 32px 24px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .header .logo {
            font-size: 32px;
        }
        
        .header .website {
            opacity: 0.9;
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 4px;
        }
        
        .header .date {
            opacity: 0.8;
            font-size: 14px;
        }
        
        .content {
            padding: 32px 24px;
        }
        
        .section {
            margin-bottom: 32px;
        }
        
        .section:last-child {
            margin-bottom: 0;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .content-item {
            background: #f8fafc;
            border-left: 4px solid #8b5cf6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
            transition: all 0.2s ease;
        }
        
        .content-item:last-child {
            margin-bottom: 0;
        }
        
        .content-item:hover {
            background: #f1f5f9;
        }
        
        .content-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        
        .content-type {
            background: #e0e7ff;
            color: #5b21b6;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }
        
        .content-body {
            font-size: 15px;
            line-height: 1.6;
            color: #1f2937;
            margin-bottom: 12px;
            word-wrap: break-word;
        }
        
        .content-timestamp {
            font-size: 12px;
            color: #9ca3af;
            text-align: right;
        }
        
        .footer {
            background: #f9fafb;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        
        .footer .website-link {
            color: #8b5cf6;
            text-decoration: none;
            font-weight: 600;
        }
        
        .footer .website-link:hover {
            text-decoration: underline;
        }
        
        .stats {
            background: #fef3f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .stats-text {
            font-size: 14px;
            color: #b91c1c;
            font-weight: 600;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .header {
                padding: 24px 16px;
            }
            
            .content {
                padding: 24px 16px;
            }
            
            .content-item {
                padding: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <span class="logo">📚</span>
                ReadLingua
            </h1>
            <div class="website">www.stanleyhi.com</div>
            <div class="date">${currentDate}</div>
        </div>
        
        <div class="content">
            <div class="stats">
                <div class="stats-text">
                    📋 ${data.selectedContents.length} Selected Learning Content${data.selectedContents.length > 1 ? 's' : ''}
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">
                    📖 Selected Learning Content
                </h2>
                
                ${data.selectedContents.map((content, index) => `
                    <div class="content-item">
                        <div class="content-header">
                            <span>Content #${index + 1}</span>
                            <span class="content-type">${formatContentType(content.type)}</span>
                        </div>
                        <div class="content-body">
                            ${formatText(content.content)}
                        </div>
                        <div class="content-timestamp">
                            Selected: ${formatTimestamp(content.timestamp)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by ReadLingua • <a href="https://www.stanleyhi.com" class="website-link">www.stanleyhi.com</a></p>
            <p>Continue your language learning journey 🚀</p>
        </div>
    </div>
</body>
</html>
  `
}

function formatContentType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'ai_response': 'AI Response',
    'query_response': 'Query Response', 
    'user_query': 'User Query'
  }
  return typeMap[type] || 'Content'
}

function formatText(text: string): string {
  if (!text) return ''
  
  // Convert markdown-style formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/^\* /gm, '• ')
    .replace(/^(\d+)\. /gm, '$1. ')
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Unknown time'
  }
}