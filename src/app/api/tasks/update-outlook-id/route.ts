import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, outlook_event_id } = body

    if (!taskId || !outlook_event_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: taskId and outlook_event_id' 
      }, { status: 400 })
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(taskId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid taskId format' 
      }, { status: 400 })
    }

    const notionApiKey = process.env.NOTION_API_KEY
    
    if (!notionApiKey) {
      console.error('NOTION_API_KEY not found in environment variables')
      return NextResponse.json({ 
        success: false, 
        error: 'Notion API key not configured' 
      }, { status: 500 })
    }

    const notion = new Client({ auth: notionApiKey })

    try {
      const existingTask = await notion.pages.retrieve({ page_id: taskId })
      
      if (!existingTask) {
        return NextResponse.json({ 
          success: false, 
          error: 'Task not found' 
        }, { status: 404 })
      }

      await notion.pages.update({
        page_id: taskId,
        properties: {
          outlook_event_id: {
            rich_text: [
              {
                text: {
                  content: outlook_event_id
                }
              }
            ]
          }
        }
      })

      console.log(`Successfully updated task ${taskId} with outlook_event_id: ${outlook_event_id}`)

      return NextResponse.json({ 
        success: true, 
        message: 'Outlook event ID updated successfully',
        taskId,
        outlook_event_id
      })

    } catch (notionError: any) {
      console.error('Notion API error:', notionError)
      
      if (notionError.code === 'object_not_found') {
        return NextResponse.json({ 
          success: false, 
          error: 'Task not found' 
        }, { status: 404 })
      }
      
      if (notionError.code === 'unauthorized') {
        return NextResponse.json({ 
          success: false, 
          error: 'Unauthorized access to Notion' 
        }, { status: 403 })
      }

      return NextResponse.json({ 
        success: false, 
        error: `Notion API error: ${notionError.message}` 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error updating outlook event ID:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update outlook event ID: ${error.message}` 
    }, { status: 500 })
  }
}