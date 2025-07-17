import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  const { imageUrl, description, quotes, type = 'uncategorized' } = await req.json()

  try {
    const title = `PicGame_${Date.now()}`
    const safeImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`
    const webUrl = `https://stanleyhi.com/feelink/user-view/${title}`

    // Try to get current user, but allow anonymous users
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    // Insert into Supabase
    const { data, error } = await supabase
      .from('feelink_quotes')
      .insert([
        {
          user_id: userId,
          image_url: safeImageUrl,
          description: description || '',
          quotes: quotes || '',
          type: type,
          web_url: webUrl
        }
      ])
      .select('id, web_url')
      .single()

    if (error) {
      console.error('❌ Supabase 写入失败:', error)
      return NextResponse.json({ error: 'Supabase 写入失败' }, { status: 500 })
    }

    return NextResponse.json({ 
      title,
      id: data.id,
      web_url: data.web_url
    })

  } catch (error) {
    console.error('❌ 保存失败:', error)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}