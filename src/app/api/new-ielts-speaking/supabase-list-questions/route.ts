import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const part = searchParams.get('part')

  const query = supabase
    .from('ielts_speaking_data')
    .select('title, part, question_text')
    .order('created_time', { ascending: false })

  if (part) {
    query.eq('part', part)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 返回字段名称统一映射给前端使用（title 映射为 id）
  const formatted = data?.map((item) => ({
    id: item.title,
    part: item.part,
    questionText: item.question_text,
  }))

  return NextResponse.json({ items: formatted })
}
