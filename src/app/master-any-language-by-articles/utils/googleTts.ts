// Google Cloud TTS utility for French pronunciation
export const playFrenchText = async (text: string): Promise<void> => {
  try {
    const response = await fetch('/api/tts/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        language: 'fr-FR'
      })
    })

    if (!response.ok) {
      throw new Error(`TTS API failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success || !data.audio) {
      throw new Error('Invalid response from TTS API')
    }

    // Create audio element and play
    const audio = new Audio(data.audio)
    audio.volume = 0.8
    
    // Return promise that resolves when audio finishes
    return new Promise((resolve, reject) => {
      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error('Audio playback failed'))
      audio.play().catch(reject)
    })

  } catch (error) {
    console.error('Google TTS playback failed:', error)
    throw error
  }
}