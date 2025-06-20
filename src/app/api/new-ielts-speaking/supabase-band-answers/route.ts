import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const questionText = searchParams.get('questionId')

  if (!questionText) {
    return NextResponse.json({ error: 'Missing questionId' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('ielts_speaking_data')
    .select('*')
    .eq('question_text', questionText)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })
  }

  const answers = [
    {
      band: 6,
      text: data.band6_text,
      keywords: (data.band6_highlight_words || '').split(',').map((w: string) => w.trim()),
      explanations: parseExplanation(data.band6_highlight_notes),
    },
    {
      band: 7,
      text: data.band7_text,
      keywords: (data.band7_highlight_words || '').split(',').map((w: string) => w.trim()),
      explanations: parseExplanation(data.band7_highlight_notes),
    },
    {
      band: 8,
      text: data.band8_text,
      keywords: (data.band8_highlight_words || '').split(',').map((w: string) => w.trim()),
      explanations: parseExplanation(data.band8_highlight_notes),
    },
  ]

  return NextResponse.json({ answers })
}

// 将解释内容拆成词 + 解释结构
function parseExplanation(noteText: string | null): Record<string, string> {
  if (!noteText) return {}

  const lines = noteText.split('\n')
  const explanations: Record<string, string> = {}

  for (const line of lines) {
    const [key, value] = line.split(':').map((s) => s.trim())
    if (key && value) {
      explanations[key] = value
    }
  }

  return explanations
}
