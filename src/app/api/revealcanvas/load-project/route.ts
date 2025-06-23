import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectName = searchParams.get('projectName')

  if (!projectName) {
    return NextResponse.json({ error: 'Missing projectName' }, { status: 400 })
  }

  try {
    // Step 1: 查找最近的项目记录
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('name', projectName)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: '未找到该项目' }, { status: 404 })
    }

    const projectId = project.id

    // Step 2: 拉取图片
    const { data: imageRows, error: imageError } = await supabase
      .from('project_images')
      .select('base64')
      .eq('project_id', projectId)

    if (imageError) {
      return NextResponse.json({ error: '加载图片失败', detail: imageError }, { status: 500 })
    }

    // Step 3: 拉取遮罩
    const { data: maskRows, error: maskError } = await supabase
      .from('project_masks')
      .select('mask_data')
      .eq('project_id', projectId)

    if (maskError) {
      return NextResponse.json({ error: '加载遮罩失败', detail: maskError }, { status: 500 })
    }

    const images = imageRows.map(row => row.base64)
    const masks = maskRows.map(row => row.mask_data)

    return NextResponse.json({ images, masks }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: '服务器内部错误', detail: err }, { status: 500 })
  }
}
