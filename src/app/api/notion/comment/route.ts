import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export async function PATCH(request: NextRequest) {
  try {
    const { pageId, comment, apiKey } = await request.json()

    if (!pageId || !comment || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: pageId, comment, apiKey' },
        { status: 400 }
      )
    }

    const notion = new Client({
      auth: apiKey,
    })

    // Get current page to read existing comments
    const page = await notion.pages.retrieve({ page_id: pageId })

    if (!('properties' in page)) {
      return NextResponse.json(
        { error: 'Page properties not found' },
        { status: 400 }
      )
    }

    // Get existing comments
    const existingComments = page.properties.Comment
    let currentComments: string[] = []

    if (existingComments && existingComments.type === 'rich_text') {
      const richTextContent = existingComments.rich_text
        .map((text: any) => text.plain_text)
        .join('')

      if (richTextContent.trim()) {
        currentComments = richTextContent.split('\n').filter(c => c.trim())
      }
    }

    // Add new comment
    const updatedComments = [...currentComments, comment]
    const commentsText = updatedComments.join('\n')

    // Update the page with new comments
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Comment: {
          rich_text: [
            {
              text: {
                content: commentsText,
              },
            },
          ],
        },
      },
    })

    return NextResponse.json({
      success: true,
      comments: updatedComments
    })

  } catch (error: any) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment: ' + error.message },
      { status: 500 }
    )
  }
}