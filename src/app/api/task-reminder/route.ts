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

// Get tasks for a specific date
async function getTasksForDate(targetDate: string): Promise<TaskData[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_Tasks_DB_ID!,
      filter: {
        and: [
          {
            property: 'start_date',
            date: {
              equals: targetDate
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
    throw new Error(`Failed to fetch tasks from Notion: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get completed tasks for a specific date
async function getCompletedTasksForDate(targetDate: string): Promise<TaskData[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_Tasks_DB_ID!,
      filter: {
        and: [
          {
            property: 'start_date',
            date: {
              equals: targetDate
            }
          },
          {
            property: 'status',
            select: {
              equals: 'Completed'
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
        status: properties.status?.select?.name || 'Completed',
        start_date: properties.start_date?.date?.start || undefined,
        end_date: properties.end_date?.date?.start || properties.start_date?.date?.end || undefined,
        priority_quadrant: properties.priority_quadrant?.select?.name || undefined,
        plan: properties.plan?.relation?.map((rel: any) => rel.id) || [],
        note: properties.note?.rich_text?.[0]?.plain_text || undefined
      }
    })

    return tasks
  } catch (error) {
    console.error('Error fetching completed tasks from Notion:', error)
    throw new Error(`Failed to fetch completed tasks from Notion: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Determine current time of day and email type
function determineEmailType(): 'morning' | 'midday' | 'evening' | 'night' {
  // Get current Toronto time
  const now = new Date()
  const torontoTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Toronto"}))
  const hour = torontoTime.getHours()

  // Determine email type based on hour
  if (hour >= 7 && hour < 10) {
    return 'morning'    // 8:00 - Morning Overview
  } else if (hour >= 11 && hour < 14) {
    return 'midday'     // 12:00 - Midday Check
  } else if (hour >= 17 && hour < 20) {
    return 'evening'    // 18:00 - Evening Summary
  } else if (hour >= 22 || hour < 2) {
    return 'night'      // 23:00 - Tomorrow Preview
  } else {
    return 'morning'    // Default fallback
  }
}

// Get today's and tomorrow's date strings
function getDateStrings() {
  const now = new Date()
  const torontoTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Toronto"}))
  
  const today = torontoTime.toLocaleDateString("en-CA", {timeZone: "America/Toronto"})
  
  const tomorrow = new Date(torontoTime)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toLocaleDateString("en-CA", {timeZone: "America/Toronto"})
  
  return { today, tomorrow: tomorrowStr }
}

export async function GET(request: NextRequest) {
  try {
    console.log('New scheduled email reminder called at:', new Date().toISOString())

    // Check if this is a test request
    const { searchParams } = new URL(request.url)
    const isTest = searchParams.get('test') === 'true'
    const forceType = searchParams.get('type') as 'morning' | 'midday' | 'evening' | 'night' | null

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

    // Determine what type of email to send
    const emailType = forceType || determineEmailType()
    const { today, tomorrow } = getDateStrings()
    
    console.log(`Email type: ${emailType}, Today: ${today}, Tomorrow: ${tomorrow}`)

    const emailService = new EmailService()
    let result

    switch (emailType) {
      case 'morning':
        // 8:00 AM - Today's task overview + motivation
        const todayTasks = await getTasksForDate(today)
        result = await emailService.sendMorningOverview(todayTasks, today)
        break

      case 'midday':
        // 12:00 PM - Morning completion + afternoon tasks
        const morningTasks = await getTasksForDate(today)
        const morningCompleted = await getCompletedTasksForDate(today)
        result = await emailService.sendMiddayCheck(morningTasks, morningCompleted, today)
        break

      case 'evening':
        // 6:00 PM - Day summary + evening tasks
        const dayTasks = await getTasksForDate(today)
        const dayCompleted = await getCompletedTasksForDate(today)
        result = await emailService.sendEveningSummary(dayTasks, dayCompleted, today)
        break

      case 'night':
        // 11:00 PM - Tomorrow's task preview
        const tomorrowTasks = await getTasksForDate(tomorrow)
        result = await emailService.sendTomorrowPreview(tomorrowTasks, tomorrow)
        break

      default:
        throw new Error(`Unknown email type: ${emailType}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: `${emailType} email sent successfully`,
      emailType,
      today,
      tomorrow,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in scheduled email reminder:', error)
    
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