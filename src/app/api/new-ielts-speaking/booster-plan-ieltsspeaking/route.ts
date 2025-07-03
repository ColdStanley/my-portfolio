import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt } = body

    console.log('[booster-plan] received prompt:', prompt)

    if (!prompt) {
      return NextResponse.json({ error: '❌ 缺少 prompt 字段' }, { status: 400 })
    }

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `🛑 模型请求失败: ${errText}` }, { status: 500 })
    }

    const result = await res.json()
    const content = result.choices?.[0]?.message?.content || ''

    console.log('[模型原始回复]', content)

    // ✅ 提取 JSON 格式部分 + fallback
    let jsonText = ''
    const match = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (match) {
      jsonText = match[1]
    } else {
      jsonText = content.trim()
    }

    console.log('[💡 提取 JSON]', jsonText)

    const parsed = JSON.parse(jsonText)

    return NextResponse.json({
      goal: parsed.goal || '',
      key_points: parsed.key_points || [],
      steps: parsed.steps || [],
    })
    
  } catch (err) {
    console.error('💥 系统错误:', err)
    return NextResponse.json({ error: '💥 系统错误，稍后再试' }, { status: 500 })
  }
}
