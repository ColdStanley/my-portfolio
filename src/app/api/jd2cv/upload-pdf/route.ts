import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const pageId = formData.get('pageId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!pageId) {
      return NextResponse.json(
        { error: 'No page ID provided' },
        { status: 400 }
      )
    }

    if (!process.env.NOTION_JD2CV_DB_ID) {
      console.error('NOTION_JD2CV_DB_ID not found in environment variables')
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload file to a temporary storage service (you'll need to implement this)
    // For now, this is a placeholder - you'll need to use a service like Vercel Blob
    // or upload directly to Notion
    
    // Create a temporary URL for the file
    // This is a simplified example - in practice, you'd upload to blob storage first
    const fileUrl = `data:${file.type};base64,${buffer.toString('base64')}`

    // Update the Notion page with the PDF file
    await notion.pages.update({
      page_id: pageId,
      properties: {
        cv_pdf: {
          files: [
            {
              name: file.name,
              type: 'external',
              external: {
                url: fileUrl
              }
            }
          ]
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'PDF uploaded successfully',
      fileName: file.name
    })
  } catch (error: any) {
    console.error('Error uploading PDF:', error)
    return NextResponse.json(
      { error: 'Failed to upload PDF', details: error?.message },
      { status: 500 }
    )
  }
}