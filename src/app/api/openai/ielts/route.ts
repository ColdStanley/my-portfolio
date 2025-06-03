import { NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export async function POST(req: Request) {
  const { part, question } = await req.json()

  if (!part || !question) {
    return NextResponse.json({ error: 'Missing part or question' }, { status: 400 })
  }

  const prompt = `
You are an IELTS Speaking examiner.

Your task is to generate three realistic sample answers to the following IELTS Speaking ${part} question:

"${question}"

Provide the answers in this format:

Band 5:
...

Band 6:
...

Band 7:
...

Each answer should be 2–3 sentences long. Do not include explanations. Only return the labeled answers.
`.trim()

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a professional IELTS Speaking examiner.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    })

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content || ''

    if (!text.trim()) {
      return NextResponse.json({
        band5: '', band6: '', band7: '',
        fullText: '[OpenAI did not return any content. Try rewording your question.]'
      })
    }

    const band5 = text.match(/Band 5[:：\-]?\s*(.*?)(?=Band 6[:：\-])/is)?.[1]?.trim() || ''
    const band6 = text.match(/Band 6[:：\-]?\s*(.*?)(?=Band 7[:：\-])/is)?.[1]?.trim() || ''
    const band7 = text.match(/Band 7[:：\-]?\s*(.*)/is)?.[1]?.trim() || ''

    return NextResponse.json({ band5, band6, band7, fullText: text })
  } catch (err) {
    console.error('❌ OpenAI API error:', err)
    return NextResponse.json({ error: 'OpenAI API call failed' }, { status: 500 })
  }
}
