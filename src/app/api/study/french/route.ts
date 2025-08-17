import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    
    // 获取用户提供的webhook URL，如果没有则使用默认值
    const webhookUrl = body.webhookUrl || 'https://stanleyhi.app.n8n.cloud/webhook/study/french'
    
    // 安全验证：只允许特定域名的webhook
    if (!webhookUrl.startsWith('https://stanleyhi.app.n8n.cloud/webhook/')) {
      throw new Error('Invalid webhook URL. Only stanleyhi.app.n8n.cloud webhooks are allowed.')
    }
    
    // 移除webhookUrl字段，避免传递给n8n
    const { webhookUrl: _, ...requestBody } = body
    
    // Forward the request to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('n8n response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error response:', errorText)
      throw new Error(`n8n webhook failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('n8n response data:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('French webhook proxy error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process French text',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}