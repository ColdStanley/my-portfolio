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

    // Get stored access token (like n8n uses)
    let accessToken = process.env.MICROSOFT_ACCESS_TOKEN
    const tokenExpires = process.env.MICROSOFT_TOKEN_EXPIRES

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No Outlook authorization found. Please authorize first.',
        needsAuth: true
      }, { status: 401 })
    }

    // Check if token is expired and refresh if needed (like n8n does automatically)
    if (tokenExpires && Date.now() > parseInt(tokenExpires)) {
      console.log('Access token expired, refreshing...')

      const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/outlook/refresh`, {
        method: 'POST'
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        accessToken = refreshData.access_token
      } else {
        return NextResponse.json({
          success: false,
          error: 'Token expired and refresh failed. Please re-authorize.',
          needsAuth: true
        }, { status: 401 })
      }
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
  // Ensure dates are in proper ISO format with timezone
  const startDate = new Date(taskData.start_date).toISOString()
  const endDate = new Date(taskData.end_date).toISOString()

  const eventData = {
    subject: taskData.title,
    start: {
      dateTime: startDate,
      timeZone: 'UTC'
    },
    end: {
      dateTime: endDate,
      timeZone: 'UTC'
    },
    body: {
      content: taskData.note || '',
      contentType: 'text'
    }
  }

  console.log('Creating Outlook event:', JSON.stringify(eventData, null, 2))

  // Use /me endpoint with user token (exactly like n8n)
  const response = await fetch(`${OUTLOOK_API_BASE}/me/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify(eventData)
  })

  if (!response.ok) {
    const errorDetails = await response.text()
    console.error('Outlook API Error Details:', errorDetails)
    throw new Error(`Failed to create Outlook event: ${response.statusText} - ${errorDetails}`)
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

  // Ensure dates are in proper ISO format with timezone
  const startDate = new Date(taskData.start_date).toISOString()
  const endDate = new Date(taskData.end_date).toISOString()

  const eventData = {
    subject: taskData.title,
    start: {
      dateTime: startDate,
      timeZone: 'UTC'
    },
    end: {
      dateTime: endDate,
      timeZone: 'UTC'
    },
    body: {
      content: taskData.note || '',
      contentType: 'text'
    }
  }

  // Use /me endpoint with user token (exactly like n8n)
  const response = await fetch(`${OUTLOOK_API_BASE}/me/events/${taskData.outlook_event_id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(eventData)
  })

  if (!response.ok) {
    const errorDetails = await response.text()
    console.error('Outlook API Update Error Details:', errorDetails)
    throw new Error(`Failed to update Outlook event: ${response.statusText} - ${errorDetails}`)
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

  // Use /me endpoint with user token (exactly like n8n)
  const response = await fetch(`${OUTLOOK_API_BASE}/me/events/${taskData.outlook_event_id}`, {
    method: 'DELETE',
    headers
  })

  if (!response.ok) {
    const errorDetails = await response.text()
    console.error('Outlook API Delete Error Details:', errorDetails)
    throw new Error(`Failed to delete Outlook event: ${response.statusText} - ${errorDetails}`)
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