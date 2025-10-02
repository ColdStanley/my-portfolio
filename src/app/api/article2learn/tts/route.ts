import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

// 初始化 Google Cloud TTS 客户端
const credentials = JSON.parse(process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT || '{}')
const client = new TextToSpeechClient({ credentials })

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // 根据语言选择语音
    let voiceConfig
    if (language === 'Français') {
      voiceConfig = {
        languageCode: 'fr-FR',
        name: 'fr-FR-Neural2-A', // 法语自然女声
        ssmlGender: 'FEMALE',
      }
    } else {
      // 默认英语
      voiceConfig = {
        languageCode: 'en-US',
        name: 'en-US-Neural2-F', // 英语自然女声
        ssmlGender: 'FEMALE',
      }
    }

    // 调用 Google Cloud TTS API
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
      },
    })

    const audioContent = response.audioContent as Buffer

    return new NextResponse(audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioContent.length.toString(),
      },
    })
  } catch (error) {
    console.error('TTS Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
