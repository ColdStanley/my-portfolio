import { NextRequest, NextResponse } from 'next/server'
import { getActivePrompts } from '@/app/article2learn/utils/notionClient'

export async function GET(request: NextRequest) {
  try {
    const prompts = await getActivePrompts()
    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}
