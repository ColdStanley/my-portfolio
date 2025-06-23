import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { projectName, images, masks } = body

    if (!projectName || !images?.length || !masks) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 })
    }

    // Step 1: 插入 projects 表
    const projectId = uuidv4()
    const { error: projectError } = await supabase
      .from('projects')
      .insert([{ id: projectId, name: projectName }])

    if (projectError) {
      return NextResponse.json({ error: '创建项目失败', detail: projectError }, { status: 500 })
    }

    // Step 2: 插入 images
    const imageRows = images.map((base64: string) => ({
      id: uuidv4(),
      project_id: projectId,
      base64,
    }))
    const { error: imageError } = await supabase
      .from('project_images')
      .insert(imageRows)

    if (imageError) {
      return NextResponse.json({ error: '保存图片失败', detail: imageError }, { status: 500 })
    }

    // Step 3: 插入 masks
    const maskRows = masks.map((mask: any) => ({
      id: uuidv4(),
      project_id: projectId,
      mask_data: mask,
    }))
    const { error: maskError } = await supabase
      .from('project_masks')
      .insert(maskRows)

    if (maskError) {
      return NextResponse.json({ error: '保存遮罩失败', detail: maskError }, { status: 500 })
    }

    return NextResponse.json({ success: true, projectId }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: '服务器内部错误', detail: err }, { status: 500 })
  }
}
