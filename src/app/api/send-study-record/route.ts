import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface StudyData {
  question?: {
    part: string
    content: string
    analysis: string
  }
  userAnswer?: {
    content: string
    analysis: string
  }
  askAIQueries?: Array<{
    question: string
    response: string
    timestamp: string
  }>
  userEmail: string
}

export async function POST(request: NextRequest) {
  try {
    const data: StudyData = await request.json()
    
    if (!data.userEmail) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
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
    const emailHTML = generateEmailHTML(data)
    const emailSubject = `✨ IELTS Study Record - ${new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`

    // Send email
    await transporter.sendMail({
      from: `"AI Agent Gala" <${process.env.SMTP_FROM}>`,
      to: data.userEmail,
      subject: emailSubject,
      html: emailHTML,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Study record sent successfully' 
    })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ 
      error: 'Failed to send email' 
    }, { status: 500 })
  }
}

function generateEmailHTML(data: StudyData): string {
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
    <title>IELTS Study Record</title>
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
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .header p {
            opacity: 0.9;
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
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .question-box, .answer-box {
            background: #f8fafc;
            border-left: 4px solid #8b5cf6;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 12px;
        }
        
        .analysis, .feedback {
            background: #fefefe;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .qa-pair {
            background: #fafafa;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            border-left: 3px solid #d1d5db;
        }
        
        .qa-pair:last-child {
            margin-bottom: 0;
        }
        
        .question-text {
            font-weight: 600;
            color: #4b5563;
            margin-bottom: 8px;
        }
        
        .answer-text {
            color: #6b7280;
            font-size: 14px;
        }
        
        .empty-state {
            text-align: center;
            color: #9ca3af;
            font-style: italic;
            padding: 24px;
        }
        
        .footer {
            background: #f9fafb;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            font-size: 12px;
            color: #6b7280;
        }
        
        .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 24px 0;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 IELTS Study Record</h1>
            <p>${currentDate}</p>
        </div>
        
        <div class="content">
            ${data.question ? `
            <div class="section">
                <h2 class="section-title">🎯 Generated Question</h2>
                <div class="question-box">
                    <strong>Part ${data.question.part}</strong><br>
                    ${data.question.content}
                </div>
                ${data.question.analysis ? `
                <div class="analysis">
                    <strong>Analysis:</strong><br>
                    ${formatText(data.question.analysis)}
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            ${data.userAnswer ? `
            <div class="section">
                <h2 class="section-title">🎤 Your Response</h2>
                <div class="answer-box">
                    ${formatText(data.userAnswer.content)}
                </div>
                ${data.userAnswer.analysis ? `
                <div class="feedback">
                    <strong>AI Feedback:</strong><br>
                    ${formatText(data.userAnswer.analysis)}
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            ${data.askAIQueries && data.askAIQueries.length > 0 ? `
            <div class="section">
                <h2 class="section-title">💭 AI Conversations</h2>
                ${data.askAIQueries.map(query => `
                    <div class="qa-pair">
                        <div class="question-text">Q: ${query.question}</div>
                        <div class="answer-text">${formatText(query.response)}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${!data.question && !data.userAnswer && (!data.askAIQueries || data.askAIQueries.length === 0) ? `
            <div class="empty-state">
                <p>No study activities recorded in this session</p>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>Generated by AI Agent Gala • Continue your IELTS journey 🚀</p>
        </div>
    </div>
</body>
</html>
  `
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