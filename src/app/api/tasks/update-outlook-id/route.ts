import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { getNotionDatabaseConfig } from '@/lib/getSimplifiedUserConfig'

export async function POST(request: NextRequest) {
  try {
    console.log('Update Outlook ID API: Starting request...')
    
    // 使用管理员配置（假设是你自己的账户）
    const notionApiKey = process.env.NOTION_API_KEY
    const notionTasksDbId = process.env.NOTION_TASKS_DB_ID || process.env.NOTION_Tasks_DB_ID
    
    if (!notionApiKey || !notionTasksDbId) {
      console.log('Update Outlook ID API: Missing environment variables:', { 
        hasApiKey: !!notionApiKey, 
        hasDbId: !!notionTasksDbId 
      })
      return NextResponse.json({ 
        error: 'Notion configuration not available for system operations' 
      }, { status: 500 })
    }

    const notion = new Client({
      auth: notionApiKey,
    })

    const body = await request.json()
    const { taskId, outlook_event_id } = body

    console.log('Update Outlook ID API: Received data:', { 
      taskId: taskId ? `${taskId.substring(0, 8)}...` : 'none',
      outlook_event_id: outlook_event_id ? `${outlook_event_id.substring(0, 20)}...` : 'none'
    })

    if (!taskId || !outlook_event_id) {
      return NextResponse.json({ 
        error: 'taskId and outlook_event_id are required' 
      }, { status: 400 })
    }

    // 更新Task记录，添加outlook_event_id
    await notion.pages.update({
      page_id: taskId,
      properties: {
        outlook_event_id: {
          rich_text: [{ text: { content: outlook_event_id } }]
        }
      }
    })

    console.log('Update Outlook ID API: Successfully updated task with Outlook Event ID')

    return NextResponse.json({ 
      success: true, 
      message: 'Outlook Event ID updated successfully',
      taskId,
      outlook_event_id 
    })

  } catch (error) {
    console.error('Update Outlook ID API: Error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to update Outlook Event ID: ${error.message}` 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred while updating Outlook Event ID' 
    }, { status: 500 })
  }
}