import { NextRequest, NextResponse } from 'next/server'

const OUTLOOK_API_BASE = 'https://graph.microsoft.com/v1.0'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, taskData } = body

    if (!action || !taskData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: action and taskData'
      }, { status: 400 })
    }

    // Get environment variables
    const accessToken = process.env.MICROSOFT_ACCESS_TOKEN
    const calendarId = process.env.MICROSOFT_CALENDAR_ID

    if (!accessToken || !calendarId) {
      return NextResponse.json({
        success: false,
        error: 'Microsoft Graph API not configured'
      }, { status: 500 })
    }

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }

    let result

    switch (action) {
      case 'create':
        result = await createOutlookEvent(taskData, headers, calendarId)
        break
      case 'update':
        result = await updateOutlookEvent(taskData, headers, calendarId)
        break
      case 'delete':
        result = await deleteOutlookEvent(taskData, headers, calendarId)
        break
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Must be create, update, or delete'
        }, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Outlook sync error:', error)
    return NextResponse.json({
      success: false,
      error: `Outlook sync failed: ${error.message}`
    }, { status: 500 })
  }
}

async function createOutlookEvent(taskData: any, headers: any, calendarId: string) {
  const eventData = {
    subject: taskData.title,
    start: { dateTime: taskData.start_date },
    end: { dateTime: taskData.end_date },
    body: { content: taskData.note || '' }
  }

  const response = await fetch(`${OUTLOOK_API_BASE}/me/calendars/${calendarId}/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify(eventData)
  })

  if (!response.ok) {
    throw new Error(`Failed to create Outlook event: ${response.statusText}`)
  }

  const event = await response.json()

  // Update task with outlook_event_id
  await updateTaskOutlookId(taskData.id, event.id)

  return {
    success: true,
    message: 'Outlook event created successfully',
    outlookEventId: event.id
  }
}

async function updateOutlookEvent(taskData: any, headers: any, calendarId: string) {
  if (!taskData.outlook_event_id) {
    throw new Error('Task does not have an outlook_event_id')
  }

  const eventData = {
    subject: taskData.title,
    start: { dateTime: taskData.start_date },
    end: { dateTime: taskData.end_date },
    body: { content: taskData.note || '' }
  }

  const response = await fetch(`${OUTLOOK_API_BASE}/me/calendars/${calendarId}/events/${taskData.outlook_event_id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(eventData)
  })

  if (!response.ok) {
    throw new Error(`Failed to update Outlook event: ${response.statusText}`)
  }

  return {
    success: true,
    message: 'Outlook event updated successfully'
  }
}

async function deleteOutlookEvent(taskData: any, headers: any, calendarId: string) {
  if (!taskData.outlook_event_id) {
    throw new Error('Task does not have an outlook_event_id')
  }

  const response = await fetch(`${OUTLOOK_API_BASE}/me/calendars/${calendarId}/events/${taskData.outlook_event_id}`, {
    method: 'DELETE',
    headers
  })

  if (!response.ok) {
    throw new Error(`Failed to delete Outlook event: ${response.statusText}`)
  }

  return {
    success: true,
    message: 'Outlook event deleted successfully'
  }
}

async function updateTaskOutlookId(taskId: string, outlookEventId: string) {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/tasks/update-outlook-id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, outlook_event_id: outlookEventId })
  })

  if (!response.ok) {
    console.error('Failed to update task outlook_event_id')
  }
}