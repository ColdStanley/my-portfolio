export type Language = 'english' | 'french'

// TTS utility with Google TTS fallback
export const playText = async (text: string, language: Language, rate: number = 0.8) => {
  try {
    // First try Google TTS API
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.audioContent) {
        // Play the audio from Google TTS
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`)
        await audio.play()
        return true
      }
    }
  } catch (error) {
    console.warn('Google TTS failed, falling back to browser TTS:', error)
  }

  // Fallback to browser speechSynthesis
  return playWithBrowserTTS(text, language, rate)
}

// Browser TTS fallback
const playWithBrowserTTS = (text: string, language: Language, rate: number = 0.8): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'french' ? 'fr-FR' : 'en-US'
      utterance.rate = rate
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onend = () => resolve(true)
      utterance.onerror = () => resolve(false)
      
      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Browser TTS failed:', error)
      resolve(false)
    }
  })
}

// Check if voices are available for the language
export const checkVoiceAvailability = (language: Language): boolean => {
  const voices = speechSynthesis.getVoices()
  const langCode = language === 'french' ? 'fr' : 'en'
  return voices.some(voice => voice.lang.startsWith(langCode))
}