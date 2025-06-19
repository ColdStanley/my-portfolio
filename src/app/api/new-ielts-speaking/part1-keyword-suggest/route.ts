import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing question.' }, { status: 400 })
    }

    const prompt = `
You are helping students prepare for the IELTS Speaking Part 1.

Given the question: "${question}"

Generate 5–6 relevant, diverse, and helpful topic keywords that would guide the student to develop a natural spoken answer.

The keywords should be short, specific noun phrases like: "spicy food", "summer weather", "watching comedies", etc.

Return the result **only** as a JSON array like this:
["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
`

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
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

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || '[]'

    let keywords: string[] = []

    try {
      keywords = JSON.parse(content)
    } catch (e) {
      console.warn('解析关键词失败，返回原始内容：', content)
      return NextResponse.json({ keywords: [] }) // 返回空数组避免报错
    }

    return NextResponse.json({ keywords })
  } catch (err) {
    console.error('关键词生成接口出错', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
