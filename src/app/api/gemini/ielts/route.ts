import { NextResponse } from 'next/server'

// 替换为你的实际 Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

export async function POST(req: Request) {
  const { part, question } = await req.json()

  if (!part || !question) {
    return NextResponse.json({ error: 'Missing part or question' }, { status: 400 })
  }

  const prompt = `
You are an IELTS examiner. For the following IELTS Speaking ${part} question:
"${question}"
Provide three sample answers:
- A Band 5 version
- A Band 6 version
- A Band 7 version
Give each version in 2-3 sentences. Label each clearly.
  `

  try {
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const json = await geminiRes.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // 简单分割处理回答（可进一步优化）
    const band5 = /(?<=Band 5[:：\-\n]?)(.*?)(?=Band 6[:：\-\n]?)/is.exec(text)?.[1]?.trim() || ''
    const band6 = /(?<=Band 6[:：\-\n]?)(.*?)(?=Band 7[:：\-\n]?)/is.exec(text)?.[1]?.trim() || ''
    const band7 = /(?<=Band 7[:：\-\n]?)(.*)/is.exec(text)?.[1]?.trim() || ''

    return NextResponse.json({ band5, band6, band7 })
  } catch (err) {
    console.error('❌ Gemini API failed:', err)
    return NextResponse.json({ error: 'Gemini API failed' }, { status: 500 })
  }
}
