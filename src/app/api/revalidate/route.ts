import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')
    const secret = searchParams.get('secret')

    // 验证密钥（可选，用于安全性）
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    if (!tag) {
      return NextResponse.json({ error: 'Tag is required' }, { status: 400 })
    }

    // 重新验证指定标签
    revalidateTag(tag)

    return NextResponse.json({ 
      message: `Revalidated tag: ${tag}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  return NextResponse.json({ 
    message: 'Revalidate API is working',
    availableTags: ['homepage-cards', 'homepage-highlights'],
    usage: 'POST /api/revalidate?tag=homepage-cards&secret=YOUR_SECRET'
  })
}