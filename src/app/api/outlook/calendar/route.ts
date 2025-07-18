import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID
const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET
const TENANT_ID = process.env.OUTLOOK_TENANT_ID || 'common'

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
    
    const tokenBody = new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Calendars.ReadWrite offline_access'
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody
    })

    if (!response.ok) {
      return null
    }

    const tokenData = await response.json()
    return tokenData.access_token
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
}

function formatDateForOutlook(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toISOString()
}

function mapPriorityToOutlook(quadrant: string): string {
  switch (quadrant) {
    case '重要且紧急': return 'high'
    case '重要不紧急': return 'normal'
    case '不重要但紧急': return 'low'
    case '不重要不紧急': return 'low'
    default: return 'normal'
  }
}

export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json()
    
    let accessToken = request.cookies.get('outlook_access_token')?.value
    const refreshToken = request.cookies.get('outlook_refresh_token')?.value

    if (!accessToken) {
      if (!refreshToken) {
        return NextResponse.json({ 
          error: 'Not authenticated. Please connect to Outlook first.',
          requireAuth: true 
        }, { status: 401 })
      }
      
      accessToken = await refreshAccessToken(refreshToken)
      if (!accessToken) {
        return NextResponse.json({ 
          error: 'Authentication expired. Please reconnect to Outlook.',
          requireAuth: true 
        }, { status: 401 })
      }
    }

    const startDateTime = taskData.start_date ? formatDateForOutlook(taskData.start_date) : new Date().toISOString()
    const endDateTime = taskData.end_date ? formatDateForOutlook(taskData.end_date) : new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const eventBody = [
      taskData.note,
      taskData.quantitative_metric ? `Metric: ${taskData.quantitative_metric}` : '',
      `Progress: ${taskData.progress}%`,
      `Weight: ${taskData.weight}`,
      taskData.priority_quadrant ? `Priority: ${taskData.priority_quadrant}` : '',
      taskData.status ? `Status: ${taskData.status}` : ''
    ].filter(Boolean).join('\n\n')

    const event = {
      subject: taskData.title,
      body: {
        contentType: 'text',
        content: eventBody
      },
      start: {
        dateTime: startDateTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'UTC'
      },
      isAllDay: taskData.is_all_day || false,
      importance: mapPriorityToOutlook(taskData.priority_quadrant || ''),
      isReminderOn: taskData.reminder_minutes_before_start > 0,
      reminderMinutesBeforeStart: taskData.reminder_minutes_before_start || 15,
      categories: ['Task Management']
    }

    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    })

    if (!graphResponse.ok) {
      const errorData = await graphResponse.text()
      console.error('Graph API error:', errorData)
      
      if (graphResponse.status === 401) {
        return NextResponse.json({ 
          error: 'Authentication expired. Please reconnect to Outlook.',
          requireAuth: true 
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to create calendar event' 
      }, { status: 500 })
    }

    const createdEvent = await graphResponse.json()
    
    const response = NextResponse.json({ 
      success: true, 
      eventId: createdEvent.id,
      webLink: createdEvent.webLink
    })

    if (accessToken !== request.cookies.get('outlook_access_token')?.value) {
      response.cookies.set('outlook_access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600
      })
    }

    return response

  } catch (error) {
    console.error('Calendar creation error:', error)
    return NextResponse.json({ 
      error: 'Server error occurred' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('outlook_access_token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ authenticated: false })
    }

    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (response.ok) {
      return NextResponse.json({ authenticated: true })
    } else {
      return NextResponse.json({ authenticated: false })
    }

  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}