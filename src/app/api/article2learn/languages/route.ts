import { NextRequest, NextResponse } from 'next/server'
import { getLanguageOptions } from '@/app/article2learn/utils/notionClient'

export async function GET(request: NextRequest) {
  try {
    const languageOptions = await getLanguageOptions()
    return NextResponse.json(languageOptions)
  } catch (error) {
    console.error('Error fetching language options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch language options' },
      { status: 500 }
    )
  }
}
