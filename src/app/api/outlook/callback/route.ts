import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID
const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET
const TENANT_ID = process.env.OUTLOOK_TENANT_ID || 'common'
const REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    console.log('Callback received:', { 
      code: !!code, 
      state, 
      error, 
      errorDescription,
      fullUrl: request.url 
    })

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(new URL('/auth/callback?error=' + error, request.url))
    }

    if (!code || state !== 'calendar_auth') {
      console.error('Invalid request:', { code: !!code, state })
      return NextResponse.redirect(new URL('/auth/callback?error=invalid_request', request.url))
    }

    console.log('Config check:', {
      CLIENT_ID: !!CLIENT_ID,
      CLIENT_SECRET: !!CLIENT_SECRET,
      REDIRECT_URI: !!REDIRECT_URI,
      TENANT_ID
    })

    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      console.error('Missing config:', { CLIENT_ID: !!CLIENT_ID, CLIENT_SECRET: !!CLIENT_SECRET, REDIRECT_URI: !!REDIRECT_URI })
      return NextResponse.redirect(new URL('/auth/callback?error=config_missing', request.url))
    }

    const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
    
    // 手动构建请求体，避免URL编码问题
    const tokenBody = [
      `client_id=${CLIENT_ID}`,
      `client_secret=${CLIENT_SECRET}`,
      `code=${code}`,
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`,
      `grant_type=authorization_code`,
      `scope=${encodeURIComponent('https://graph.microsoft.com/Calendars.ReadWrite')}`
    ].join('&')

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        url: tokenUrl,
        body: tokenBody,
        response: errorData
      })
      return NextResponse.redirect(new URL('/auth/callback?error=token_failed&details=' + encodeURIComponent(errorData), request.url))
    }

    const tokenData = await tokenResponse.json()
    
    const response = NextResponse.redirect(new URL('/auth/callback?success=true', request.url))
    
    response.cookies.set('outlook_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in
    })

    if (tokenData.refresh_token) {
      response.cookies.set('outlook_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    }

    return response

  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/auth/callback?error=server_error', request.url))
  }
}