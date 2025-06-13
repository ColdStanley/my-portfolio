import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'png'
    const filename = `PicGame_${timestamp}.${ext}`

    // 👇 官方推荐的写法，直接使用 File 对象
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    })
console.log('📦 blob =', blob)

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('❌ Upload Error:', error)
    return NextResponse.json({ error: 'Unexpected Error' }, { status: 500 })
  }
}
