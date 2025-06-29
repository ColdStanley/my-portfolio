import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const questionId = searchParams.get('questionId')

  if (!questionId) {
    return NextResponse.json({ error: 'Missing questionId' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('ielts_speaking_data')
    .select('id, part, topic_tag, question_text, created_time, band_data')
    .eq('id', questionId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Data not found' }, { status: 404 })
  }

  const answers = [6, 7, 8].map((band) => {
    const bandKey = `band${band}`
    const bandData = data.band_data?.[bandKey] || {}

    return {
      level: `Band ${band}`,
      text: bandData.text || '',
      bandHighlightWords: bandData.highlight_words || [],
      bandHighlightNotes: bandData.highlight_notes || [],
      grammar: bandData.grammar || [], // ✅ 新增字段：grammar
    }
  })

  return NextResponse.json({
    id: data.id,
    part: data.part,
    topic_tag: data.topic_tag,
    question: data.question_text,
    created_time: data.created_time,
    answers,
  })
}
