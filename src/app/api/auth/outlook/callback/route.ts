import { NextRequest, NextResponse } from 'next/server'

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
  token_type: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.json({
      error: `OAuth error: ${error}`
    }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({
      error: 'Authorization code missing'
    }, { status: 400 })
  }

  const clientId = process.env.OUTLOOK_CLIENT_ID
  const clientSecret = process.env.OUTLOOK_CLIENT_SECRET
  const redirectUri = process.env.OUTLOOK_REDIRECT_URI
  const tenantId = process.env.OUTLOOK_TENANT_ID

  if (!clientId || !clientSecret || !redirectUri || !tenantId) {
    return NextResponse.json({
      error: 'OAuth configuration missing'
    }, { status: 500 })
  }

  try {
    // Exchange authorization code for tokens - exactly like n8n does
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/Calendars.ReadWrite offline_access'
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return NextResponse.json({
        error: 'Token exchange failed'
      }, { status: 500 })
    }

    const tokens: TokenResponse = await tokenResponse.json()

    // Store tokens in environment variables for now (like n8n stores them)
    // TODO: In production, store in secure database
    process.env.MICROSOFT_ACCESS_TOKEN = tokens.access_token
    process.env.MICROSOFT_REFRESH_TOKEN = tokens.refresh_token
    process.env.MICROSOFT_TOKEN_EXPIRES = String(Date.now() + (tokens.expires_in * 1000))

    console.log('Outlook OAuth tokens obtained successfully')

    // Redirect to success page or close popup
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/cestlavie?outlook_auth=success`)

  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({
      error: `OAuth callback failed: ${error.message}`
    }, { status: 500 })
  }
}