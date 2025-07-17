import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  // 🛑 检查参数是否提供
  if (!id) {
    return NextResponse.json({ error: '❌ 缺少参数 id' }, { status: 400 })
  }

  try {
    // 🔍 查询 Supabase 数据库
    // 先尝试通过ID查询
    let { data, error } = await supabase
      .from('feelink_quotes')
      .select('*')
      .eq('id', id)
      .single()

    // 如果没找到，尝试通过web_url中的title查询
    if (!data || error) {
      const { data: titleData, error: titleError } = await supabase
        .from('feelink_quotes')
        .select('*')
        .like('web_url', `%${id}%`)
        .single()

      if (titleError || !titleData) {
        return NextResponse.json({ error: '❌ 未找到对应记录' }, { status: 404 })
      }
      
      data = titleData
    }

    const rawUrl = data.image_url || ''
    const imageUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

    // ✅ 返回 JSON 数据
    return NextResponse.json({
      id: data.id,
      imageUrl,
      description: data.description || '',
      quotes: data.quotes || '',
      type: data.type || '',
      webUrl: data.web_url || '',
      createdAt: data.created_at
    })

  } catch (error) {
    console.error('❌ 查询失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}