import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const part = searchParams.get('part')

    console.log('✅ [supabase-list-questions] received part:', part)

    // ✅ 使用你实际存在的字段
    let query = supabase
      .from('ielts_speaking_data')
      .select('id, part, question_text')

    // 如果 created_time 字段存在，可以开启排序
    // .order('created_time', { ascending: false })

    if (part) {
      query = query.eq('part', part)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Supabase query error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ [supabase-list-questions] fetched ${data?.length} items`)
    console.log('🔍 Sample row:', data?.[0])

    const formatted = data?.map((item) => ({
      id: item.id, // ← 使用数据库主键
      part: item.part,
      questionText: item.question_text,
    }))

    return NextResponse.json({ items: formatted })
  } catch (err: any) {
    console.error('❌ [supabase-list-questions] route crash:', err)
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
