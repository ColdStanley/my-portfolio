import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

// Function to detect language from text (simple heuristic)
function detectLanguage(text: string): 'english' | 'french' | 'other' {
  // French language indicators
  const frenchPatterns = [
    /\b(le|la|les|un|une|des|du|de|à|et|est|sur|avec|ce|cette|dans|pour|par|mais|comme|tout|tous|bien|être|avoir)\b/gi,
    /[àâäéèêëïîôöùûüÿç]/g,
    /\b(oui|non|bonjour|merci|au revoir|français|france)\b/gi
  ]
  
  let frenchScore = 0
  for (const pattern of frenchPatterns) {
    const matches = text.match(pattern)
    frenchScore += matches ? matches.length : 0
  }
  
  // English language indicators
  const englishPatterns = [
    /\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by|from|this|that|these|those|is|are|was|were|have|has|had)\b/gi,
    /\b(hello|hi|yes|no|thank you|goodbye|english)\b/gi
  ]
  
  let englishScore = 0
  for (const pattern of englishPatterns) {
    const matches = text.match(pattern)
    englishScore += matches ? matches.length : 0
  }
  
  // Determine language based on scores
  if (frenchScore > englishScore && frenchScore > 0) {
    return 'french'
  } else if (englishScore > 0) {
    return 'english'
  } else {
    return 'other'
  }
}

// Function to call Google TTS API for English (British accent)
async function synthesizeEnglishSpeech(text: string): Promise<Uint8Array> {
  // For English, use British accent with Google Translate TTS
  const response = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&tl=en-GB&client=tw-ob&q=${encodeURIComponent(text)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://translate.google.com/'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Failed to generate English speech: ${response.status} ${response.statusText}`)
  }
  
  const audioBuffer = await response.arrayBuffer()
  return new Uint8Array(audioBuffer)
}

// Function to call Google Cloud TTS API for French
async function synthesizeFrenchSpeech(text: string): Promise<Uint8Array> {
  
  if (!process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT) {
    throw new Error('Google Cloud Service Account not configured')
  }
  let credentials
  try {
    credentials = JSON.parse(process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT)
  } catch (parseError) {
    throw new Error('Invalid service account JSON format')
  }
  const client = new TextToSpeechClient({
    credentials: credentials,
  })

  const ttsRequest = {
    input: { text },
    voice: {
      languageCode: 'fr-FR',
      name: 'fr-FR-Neural2-B', // High quality French neural voice
      ssmlGender: 'MALE' as const, // Fixed: fr-FR-Neural2-B is a male voice
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
      speakingRate: 0.9,
      pitch: 0,
      volumeGainDb: 0,
    },
  }

  
  try {
    const [response] = await client.synthesizeSpeech(ttsRequest)
    
    if (!response.audioContent) {
      throw new Error('No audio content generated for French')
    }
    return response.audioContent as Uint8Array
  } catch (ttsError) {
    throw new Error(`Google Cloud TTS failed: ${ttsError.message || ttsError}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Use provided language or fallback to detection (but prefer provided language)
    let targetLanguage = language
    if (!targetLanguage) {
      targetLanguage = detectLanguage(text)
    }
    
    // Only support English and French
    if (targetLanguage !== 'english' && targetLanguage !== 'french') {
      return NextResponse.json({ 
        error: 'Language not supported. Only English and French pronunciation are available.' 
      }, { status: 400 })
    }

    let audioContent: Uint8Array

    try {
      if (targetLanguage === 'english') {
        audioContent = await synthesizeEnglishSpeech(text)
      } else {
        audioContent = await synthesizeFrenchSpeech(text)
      }
    } catch (error) {
      return NextResponse.json({ 
        error: `Failed to generate ${targetLanguage} speech` 
      }, { status: 500 })
    }

    // Return audio as response
    return new NextResponse(audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioContent.length.toString(),
      },
    })

  } catch (error) {
    console.error('Text-to-Speech error:', error)
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 })
  }
}