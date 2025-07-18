import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID
const TENANT_ID = process.env.OUTLOOK_TENANT_ID || 'common'
const REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI
const SCOPES = 'https://graph.microsoft.com/Calendars.ReadWrite'

export async function GET(request: NextRequest) {
  try {
    if (!CLIENT_ID || !REDIRECT_URI) {
      return NextResponse.json({ 
        error: 'Outlook OAuth configuration missing' 
      }, { status: 500 })
    }

    const authUrl = new URL(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`)
    
    authUrl.searchParams.append('client_id', CLIENT_ID)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.append('scope', SCOPES)
    authUrl.searchParams.append('response_mode', 'query')
    authUrl.searchParams.append('state', 'calendar_auth')

    return NextResponse.json({ authUrl: authUrl.toString() })

  } catch (error) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json({ 
      error: 'Failed to generate authentication URL' 
    }, { status: 500 })
  }
}