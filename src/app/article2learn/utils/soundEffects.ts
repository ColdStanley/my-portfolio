/**
 * Sound effects using Web Audio API (no files needed)
 */

/**
 * Play a pleasant ascending tone for correct matches (C → E → G chord)
 */
export const playCorrectSound = (): void => {
  const ctx = new AudioContext()

  const playTone = (freq: number, delay: number): void => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.value = freq
    osc.type = 'sine'

    gain.gain.setValueAtTime(0.3, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.1)

    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + 0.1)
  }

  playTone(523, 0)    // C5
  playTone(659, 0.05) // E5
  playTone(784, 0.1)  // G5
}

/**
 * Play a low warning tone for incorrect matches
 */
export const playErrorSound = (): void => {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.frequency.value = 220 // A3 low tone
  osc.type = 'sawtooth'

  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

  osc.start()
  osc.stop(ctx.currentTime + 0.2)
}
