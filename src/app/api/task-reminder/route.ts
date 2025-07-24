import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import EmailService from '@/utils/emailService'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN
})

interface NotionTask {
  id: string
  properties: {
    [key: string]: any
  }
}

interface TaskData {
  id: string
  title: string
  status: string
  start_date?: string
  end_date?: string
  priority_quadrant?: string
  plan?: string[]
  note?: string
}

async function getTodaysTasks(): Promise<TaskData[]> {
  try {
    // Get today's date in Toronto timezone (YYYY-MM-DD format)
    const today = new Date()
    const torontoDate = new Date(today.getTime() - (4 * 60 * 60 * 1000)) // Subtract 4 hours for Toronto timezone
    const todayString = torontoDate.toISOString().split('T')[0] // "2025-07-24"

    const response = await notion.databases.query({
      database_id: process.env.NOTION_TASK_DB_ID!,
      filter: {
        and: [
          {
            property: 'start_date',
            date: {
              equals: todayString
            }
          }
        ]
      },
      sorts: [
        {
          property: 'start_date',
          direction: 'ascending'
        }
      ]
    })

    const tasks: TaskData[] = response.results.map((page: any) => {
      const properties = page.properties
      
      return {
        id: page.id,
        title: properties.title?.title?.[0]?.plain_text || 'Untitled Task',
        status: properties.status?.select?.name || 'Not Started',
        start_date: properties.start_date?.date?.start || undefined,
        end_date: properties.end_date?.date?.start || properties.start_date?.date?.end || undefined,
        priority_quadrant: properties.priority_quadrant?.select?.name || undefined,
        plan: properties.plan?.relation?.map((rel: any) => rel.id) || [],
        note: properties.note?.rich_text?.[0]?.plain_text || undefined
      }
    })

    return tasks
  } catch (error) {
    console.error('Error fetching tasks from Notion:', error)
    throw new Error('Failed to fetch tasks from Notion')
  }
}

function determineTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  // Get current Toronto time
  const now = new Date()
  const torontoTime = new Date(now.getTime() - (4 * 60 * 60 * 1000))
  const hour = torontoTime.getHours()

  if (hour >= 6 && hour < 12) {
    return 'morning'
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon'
  } else {
    return 'evening'
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Task reminder API called at:', new Date().toISOString())

    // Check if this is a test request
    const { searchParams } = new URL(request.url)
    const isTest = searchParams.get('test') === 'true'
    const forceTimeOfDay = searchParams.get('time') as 'morning' | 'afternoon' | 'evening' | null

    if (isTest) {
      // Send test email
      const emailService = new EmailService()
      await emailService.sendTestEmail()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        timestamp: new Date().toISOString()
      })
    }

    // Get today's tasks from Notion
    const tasks = await getTodaysTasks()
    console.log(`Found ${tasks.length} tasks for today`)

    // Determine time of day (or use forced value for testing)
    const timeOfDay = forceTimeOfDay || determineTimeOfDay()
    console.log(`Sending ${timeOfDay} reminder email`)

    // Send reminder email
    const emailService = new EmailService()
    await emailService.sendTaskReminder(tasks, timeOfDay)

    return NextResponse.json({ 
      success: true, 
      message: `${timeOfDay} reminder email sent successfully`,
      tasksCount: tasks.length,
      timeOfDay,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in task reminder API:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request)
}