import { NextRequest, NextResponse } from 'next/server'

// Function to get access token using service account
async function getAccessToken() {
  const serviceAccountJson = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT
  if (!serviceAccountJson) {
    throw new Error('Google Cloud service account not configured')
  }

  const serviceAccount = JSON.parse(serviceAccountJson)
  
  // Create JWT for service account authentication
  const now = Math.floor(Date.now() / 1000)
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }
  
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }

  // Simple base64url encode
  const base64UrlEncode = (obj: any) => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  // Create unsigned token
  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`
  
  // Sign with private key (simplified - in production use proper crypto library)
  const crypto = require('crypto')
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(serviceAccount.private_key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const jwt = `${unsignedToken}.${signature}`

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error('Failed to get access token')
  }

  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'en' } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Get access token
    const accessToken = await getAccessToken()

    // Map language codes and set language-specific speaking rates
    const languageCode = language === 'french' ? 'fr-FR' : 'en-US'
    const voiceName = language === 'french' ? 'fr-FR-Neural2-A' : 'en-US-Neural2-F'
    
    // Language-specific speaking rates
    const speakingRate = language === 'french' ? 0.8 : 1.1

    // Call Google Cloud Text-to-Speech API
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode,
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speakingRate,
          pitch: 0.0,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Google TTS API error:', error)
      return NextResponse.json({ error: 'TTS service unavailable' }, { status: 500 })
    }

    const data = await response.json()
    
    // Return the base64 encoded audio
    return NextResponse.json({ 
      audioContent: data.audioContent,
      success: true 
    })

  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}