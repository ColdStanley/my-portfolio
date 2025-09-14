import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.OUTLOOK_CLIENT_ID
  const redirectUri = process.env.OUTLOOK_REDIRECT_URI
  const tenantId = process.env.OUTLOOK_TENANT_ID

  if (!clientId || !redirectUri || !tenantId) {
    return NextResponse.json({
      error: 'OAuth configuration missing'
    }, { status: 500 })
  }

  // Microsoft OAuth2 authorization URL - exactly like n8n
  const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`)
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'https://graph.microsoft.com/Calendars.ReadWrite offline_access')
  authUrl.searchParams.set('response_mode', 'query')

  return NextResponse.redirect(authUrl.toString())
}