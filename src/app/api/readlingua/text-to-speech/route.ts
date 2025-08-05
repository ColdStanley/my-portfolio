import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

// Initialize Google Cloud Text-to-Speech client
const client = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT!),
})

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Configure the TTS request
    const ttsRequest = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-F', // High quality neural voice
        ssmlGender: 'FEMALE' as const,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 0.9, // Slightly slower for learning
        pitch: 0,
        volumeGainDb: 0,
      },
    }

    // Call Google TTS API
    const [response] = await client.synthesizeSpeech(ttsRequest)

    if (!response.audioContent) {
      return NextResponse.json({ error: 'No audio content generated' }, { status: 500 })
    }

    // Return audio as response
    return new NextResponse(response.audioContent as Uint8Array, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': response.audioContent.length.toString(),
      },
    })

  } catch (error) {
    console.error('Text-to-Speech error:', error)
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 })
  }
}