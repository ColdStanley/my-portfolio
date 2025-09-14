import { NextRequest, NextResponse } from 'next/server'

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

export async function POST(request: NextRequest) {
  const refreshToken = process.env.MICROSOFT_REFRESH_TOKEN

  if (!refreshToken) {
    return NextResponse.json({
      error: 'No refresh token available. Please re-authorize.'
    }, { status: 401 })
  }

  const clientId = process.env.OUTLOOK_CLIENT_ID
  const clientSecret = process.env.OUTLOOK_CLIENT_SECRET
  const tenantId = process.env.OUTLOOK_TENANT_ID

  if (!clientId || !clientSecret || !tenantId) {
    return NextResponse.json({
      error: 'OAuth configuration missing'
    }, { status: 500 })
  }

  try {
    // Refresh access token - exactly like n8n does automatically
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/Calendars.ReadWrite offline_access'
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token refresh failed:', errorText)
      return NextResponse.json({
        error: 'Token refresh failed. Please re-authorize.',
        needsReauth: true
      }, { status: 401 })
    }

    const tokens: TokenResponse = await tokenResponse.json()

    // Update stored tokens
    process.env.MICROSOFT_ACCESS_TOKEN = tokens.access_token
    if (tokens.refresh_token) {
      process.env.MICROSOFT_REFRESH_TOKEN = tokens.refresh_token
    }
    process.env.MICROSOFT_TOKEN_EXPIRES = String(Date.now() + (tokens.expires_in * 1000))

    console.log('Outlook access token refreshed successfully')

    return NextResponse.json({
      success: true,
      access_token: tokens.access_token
    })

  } catch (error: any) {
    console.error('Token refresh error:', error)
    return NextResponse.json({
      error: `Token refresh failed: ${error.message}`,
      needsReauth: true
    }, { status: 500 })
  }
}