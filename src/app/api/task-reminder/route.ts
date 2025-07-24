import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import EmailService from '@/utils/emailService'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY
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

async function getUpcomingTasks(): Promise<TaskData[]> {
  // Get current Toronto time
  const now = new Date()
  const torontoNow = new Date(now.getTime() - (4 * 60 * 60 * 1000)) // Subtract 4 hours for Toronto timezone
  
  // Calculate time window: 5 minutes from now
  const reminderTime = new Date(torontoNow.getTime() + (5 * 60 * 1000))
  
  // Get today's date for filtering
  const todayString = torontoNow.toISOString().split('T')[0] // "2025-07-24"

  try {
    // Get all today's tasks first
    const response = await notion.databases.query({
      database_id: process.env.NOTION_Tasks_DB_ID!,
      filter: {
        and: [
          {
            property: 'start_date',
            date: {
              equals: todayString
            }
          },
          {
            property: 'status',
            select: {
              does_not_equal: 'Completed'
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

    const allTasks: TaskData[] = response.results.map((page: any) => {
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

    // Filter tasks that should be reminded (start time is within 5 minutes)
    const upcomingTasks = allTasks.filter(task => {
      if (!task.start_date) return false
      
      // Parse Toronto timezone task start time
      const taskStartTime = new Date(task.start_date.replace(/-04:00$/, ''))
      
      // Check if task starts in approximately 5 minutes (±2 minutes window)
      const timeDiff = taskStartTime.getTime() - torontoNow.getTime()
      const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds
      const twoMinutes = 2 * 60 * 1000 // 2 minutes tolerance
      
      // Remind if task starts between 3-7 minutes from now
      return timeDiff >= (fiveMinutes - twoMinutes) && timeDiff <= (fiveMinutes + twoMinutes)
    })

    return upcomingTasks
  } catch (error) {
    console.error('Error fetching tasks from Notion:', error)
    console.error('Database ID used:', process.env.NOTION_Tasks_DB_ID)
    console.error('Today string:', todayString)
    throw new Error(`Failed to fetch tasks from Notion: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

    if (isTest) {
      // Send test email with current logic
      const emailService = new EmailService()
      await emailService.sendTestEmail()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        timestamp: new Date().toISOString()
      })
    }

    // Get upcoming tasks that need reminders (within 5 minutes)
    const upcomingTasks = await getUpcomingTasks()
    console.log(`Found ${upcomingTasks.length} upcoming tasks needing reminders`)

    if (upcomingTasks.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No upcoming tasks need reminders at this time',
        tasksCount: 0,
        timestamp: new Date().toISOString()
      })
    }

    // Send individual reminder for each upcoming task
    const emailService = new EmailService()
    let sentCount = 0

    for (const task of upcomingTasks) {
      try {
        await emailService.sendSingleTaskReminder(task)
        sentCount++
        console.log(`Sent reminder for task: ${task.title}`)
      } catch (error) {
        console.error(`Failed to send reminder for task ${task.title}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${sentCount} individual task reminders`,
      tasksCount: upcomingTasks.length,
      sentCount,
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