import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

// Initialize Google Cloud TTS client
const client = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT || '{}')
})

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'fr-FR' } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Configure the synthesis request
    const request = {
      input: { text },
      voice: {
        languageCode: language,
        name: language === 'fr-FR' ? 'fr-FR-Standard-C' : 'fr-FR-Standard-A', // Use high-quality French voices
        ssmlGender: 'FEMALE' as const
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 0.85, // Slightly slower for better comprehension
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    }

    // Synthesize speech
    const [response] = await client.synthesizeSpeech(request)
    
    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS')
    }

    // Return audio as base64
    const audioBase64 = Buffer.from(response.audioContent).toString('base64')
    
    return NextResponse.json({
      success: true,
      audio: `data:audio/mp3;base64,${audioBase64}`
    })

  } catch (error) {
    console.error('Google TTS API error:', error)
    return NextResponse.json(
      { error: 'Failed to synthesize speech', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}