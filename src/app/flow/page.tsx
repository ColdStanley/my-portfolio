'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Play, Pause, RotateCcw, Clock } from 'lucide-react'

export default function FlowPage() {
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [hasImages, setHasImages] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(1)
  const [playTime, setPlayTime] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [showMetronome, setShowMetronome] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [isMetronomeActive, setIsMetronomeActive] = useState(false)
  const [metronomeSound, setMetronomeSound] = useState(true)
  const [metronomeVolume, setMetronomeVolume] = useState(0.7)
  const [metronomeTone, setMetronomeTone] = useState<'high' | 'mid' | 'low'>('mid')
  const [beatCount, setBeatCount] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize Audio Context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // Play metronome beat sound
  const playMetronomeBeat = useCallback((isAccent: boolean = false) => {
    if (!metronomeSound) return

    try {
      const audioContext = initAudioContext()
      
      // Resume context if suspended (required for user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Set frequency based on tone and accent
      const frequencies = { high: 1200, mid: 800, low: 400 }
      const baseFreq = frequencies[metronomeTone]
      oscillator.frequency.setValueAtTime(
        isAccent ? baseFreq * 1.5 : baseFreq, 
        audioContext.currentTime
      )
      
      // Set volume
      gainNode.gain.setValueAtTime(metronomeVolume * (isAccent ? 1.2 : 1), audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      // Play for 100ms
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log('Audio context error:', error)
    }
  }, [metronomeSound, metronomeVolume, metronomeTone, initAudioContext])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const imageFileList = Array.from(files).filter(file => file.type.startsWith('image/'))
    if (imageFileList.length === 0) return

    // Create URLs for new images
    const newUrls = imageFileList.map(file => URL.createObjectURL(file))
    
    // Add to existing images
    setImageFiles(prev => [...prev, ...imageFileList])
    setImageUrls(prev => [...prev, ...newUrls])
    setHasImages(true)
    
    // Reset playback state
    setScrollOffset(0)
    setIsPlaying(false)
    setPlayTime(0)
  }, [])

  const removeImage = useCallback((index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImageUrls(prev => {
      // Cleanup old URL
      URL.revokeObjectURL(prev[index])
      const newUrls = prev.filter((_, i) => i !== index)
      setHasImages(newUrls.length > 0)
      return newUrls
    })
    
    // Reset playback
    setScrollOffset(0)
    setIsPlaying(false)
    setPlayTime(0)
  }, [])

  const clearAllImages = useCallback(() => {
    // Cleanup all URLs
    imageUrls.forEach(url => URL.revokeObjectURL(url))
    
    setImageFiles([])
    setImageUrls([])
    setHasImages(false)
    setScrollOffset(0)
    setIsPlaying(false)
    setPlayTime(0)
  }, [imageUrls])

  const startMetronome = useCallback(() => {
    if (metronomeIntervalRef.current || !showMetronome) return
    
    const interval = 60000 / bpm // Convert BPM to milliseconds
    setBeatCount(0) // Reset beat counter
    
    metronomeIntervalRef.current = setInterval(() => {
      setBeatCount(prev => {
        const newCount = (prev + 1) % 4 // 4/4 time signature
        const isAccent = newCount === 0 // First beat is accented
        
        // Play sound
        playMetronomeBeat(isAccent)
        
        // Visual flash
        setIsMetronomeActive(true)
        setTimeout(() => setIsMetronomeActive(false), 100)
        
        return newCount
      })
    }, interval)
  }, [bpm, showMetronome, playMetronomeBeat])

  const stopMetronome = useCallback(() => {
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current)
      metronomeIntervalRef.current = null
    }
    setIsMetronomeActive(false)
  }, [])

  const startScrolling = useCallback(() => {
    if (scrollIntervalRef.current) return
    
    scrollIntervalRef.current = setInterval(() => {
      setScrollOffset(prev => prev + scrollSpeed)
    }, 16) // 60fps

    playTimeIntervalRef.current = setInterval(() => {
      setPlayTime(prev => prev + 1)
    }, 1000)

    // Start metronome if enabled
    if (showMetronome) {
      startMetronome()
    }
  }, [scrollSpeed, showMetronome, startMetronome])

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
    if (playTimeIntervalRef.current) {
      clearInterval(playTimeIntervalRef.current)
      playTimeIntervalRef.current = null
    }
    // Stop metronome when stopping playback
    stopMetronome()
  }, [stopMetronome])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopScrolling()
    } else {
      startScrolling()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, startScrolling, stopScrolling])

  const resetPosition = useCallback(() => {
    setScrollOffset(0)
    setIsPlaying(false)
    stopScrolling()
    setPlayTime(0)
  }, [stopScrolling])

  // Handle metronome BPM change - restart if active
  const handleBpmChange = useCallback((newBpm: number) => {
    setBpm(newBpm)
    if (metronomeIntervalRef.current && showMetronome) {
      stopMetronome()
      startMetronome()
    }
  }, [showMetronome, stopMetronome, startMetronome])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              F
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Flow
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <Clock size={16} />
            <span>{formatTime(playTime)}</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="pt-20 h-screen flex">
        {/* Left 70% - Image Area */}
        <div className="w-[70%] p-4 flex flex-col gap-4">
          {/* Thumbnails Preview - Show when has images */}
          {hasImages && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-purple-600">
                  Sheet Music Pages ({imageFiles.length})
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors flex items-center gap-1"
                  >
                    <Upload size={12} />
                    Add More
                  </button>
                  <button
                    onClick={clearAllImages}
                    className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              {/* Thumbnail Grid */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative flex-shrink-0 group">
                    <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-purple-300 transition-colors">
                      <img
                        src={url}
                        alt={`Page ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    >
                      ×
                    </button>
                    {/* Page number */}
                    <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5 rounded-b-lg">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Display Area */}
          <div className="flex-1 bg-white/90 backdrop-blur-md rounded-xl shadow-xl overflow-hidden relative">
            {!hasImages ? (
              /* Upload Zone */
              <div className="h-full flex flex-col items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6">
                    ♪
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Your Sheet Music</h2>
                  <p className="text-gray-600 mb-8">Upload one or multiple images of your sheet music and let them flow at your perfect tempo</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <Upload size={20} />
                    Choose Image Files
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-3">
                    ✨ Tip: You can select multiple images at once
                  </p>
                </div>
              </div>
            ) : (
              /* Multi-Image Display with Continuous Scrolling */
              <div className="h-full overflow-hidden relative">
                <div
                  className="transition-transform duration-75 ease-linear"
                  style={{
                    transform: `translateY(-${scrollOffset}px)`
                  }}
                >
                  {imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Sheet Music Page ${index + 1}`}
                      className="w-full block object-contain"
                      style={{ minHeight: 'auto' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 30% - Control Panel */}
        <div className="w-[30%] p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
            {/* Play Controls */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={togglePlay}
                disabled={!hasImages}
                className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button
                onClick={resetPosition}
                disabled={!hasImages}
                className="w-12 h-12 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-full flex items-center justify-center border border-purple-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            {/* Time Display */}
            <div className="mb-6 text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {formatTime(playTime)}
              </div>
              <div className="text-sm text-purple-400">Playing Time</div>
            </div>

            {/* Speed Control */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-purple-600 flex items-center gap-1">
                  ♪ Tempo
                </span>
                <span className="text-sm text-purple-600 font-bold">{scrollSpeed}x</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-xs">♪</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                  className="flex-1 accent-purple-600"
                />
                <span className="text-purple-400 text-sm">♫</span>
              </div>
            </div>

            {/* Metronome Control */}
            <div className="mb-6">
              {/* Metronome Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showMetronome}
                        onChange={(e) => setShowMetronome(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        showMetronome 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-600' 
                          : 'border-gray-300 group-hover:border-purple-400'
                      }`}>
                        {showMetronome && (
                          <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      🎵 Metronome
                    </span>
                  </label>
                  
                  {/* Sound Toggle */}
                  {showMetronome && (
                    <button
                      onClick={() => setMetronomeSound(!metronomeSound)}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        metronomeSound 
                          ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={metronomeSound ? 'Mute sound' : 'Enable sound'}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        {metronomeSound ? (
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.795l-4.618-3.36c-.357-.26-.806-.394-1.264-.394H2a1 1 0 01-1-1V7a1 1 0 011-1h.5c.458 0 .907-.134 1.264-.394l4.618-3.36a1 1 0 011.001-.17zM14.657 2.929a1 1 0 011.414 0A9.97 9.97 0 0119 10a9.97 9.97 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.795l-4.618-3.36c-.357-.26-.806-.394-1.264-.394H2a1 1 0 01-1-1V7a1 1 0 011-1h.5c.458 0 .907-.134 1.264-.394l4.618-3.36a1 1 0 011.001-.17zM15 8.25a.75.75 0 01.75.75c0 .414.336.75.75.75a.75.75 0 010 1.5.75.75 0 01-.75.75.75.75 0 01-.75-.75.75.75 0 01-.75-.75.75.75 0 01.75-.75z" clipRule="evenodd" />
                        )}
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Premium Beat Indicator */}
                <div className="flex items-center gap-2">
                  {/* Beat Counter */}
                  {showMetronome && (
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((beat) => (
                        <div
                          key={beat}
                          className={`w-2 h-2 rounded-full transition-all duration-150 ${
                            beatCount === beat
                              ? isMetronomeActive
                                ? 'bg-purple-600 scale-150 shadow-md shadow-purple-300'
                                : 'bg-purple-400 scale-125'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Main Beat Indicator */}
                  <div className={`w-6 h-6 rounded-full transition-all duration-100 shadow-inner ${
                    isMetronomeActive && showMetronome 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 scale-125 shadow-lg shadow-purple-300' 
                      : 'bg-gradient-to-r from-gray-200 to-gray-300'
                  }`}>
                    <div className={`w-full h-full rounded-full transition-all duration-100 ${
                      isMetronomeActive && showMetronome 
                        ? 'bg-gradient-to-t from-white/30 to-transparent' 
                        : 'bg-gradient-to-t from-white/50 to-transparent'
                    }`} />
                  </div>
                </div>
              </div>
              
              {showMetronome && (
                <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 rounded-xl p-4 border border-purple-100/50 backdrop-blur-sm">
                  {/* BPM Control */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-700 uppercase tracking-wider">Tempo</span>
                      <div className="text-center">
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{bpm}</span>
                        <div className="text-xs text-purple-400 font-medium">BPM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 text-xs font-medium">60</span>
                      <div className="flex-1 relative">
                        <input
                          type="range"
                          min="60"
                          max="200"
                          step="1"
                          value={bpm}
                          onChange={(e) => handleBpmChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full outline-none slider-thumb"
                          style={{
                            background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${((bpm - 60) / 140) * 100}%, rgb(226 232 240) ${((bpm - 60) / 140) * 100}%, rgb(226 232 240) 100%)`
                          }}
                        />
                      </div>
                      <span className="text-purple-400 text-xs font-medium">200</span>
                    </div>
                  </div>

                  {metronomeSound && (
                    <>
                      {/* Volume Control */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-purple-700 uppercase tracking-wider">Volume</span>
                          <span className="text-sm text-purple-600 font-semibold">{Math.round(metronomeVolume * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 text-xs">🔈</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={metronomeVolume}
                            onChange={(e) => setMetronomeVolume(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full outline-none slider-thumb"
                            style={{
                              background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${metronomeVolume * 100}%, rgb(226 232 240) ${metronomeVolume * 100}%, rgb(226 232 240) 100%)`
                            }}
                          />
                          <span className="text-purple-400 text-xs">🔊</span>
                        </div>
                      </div>

                      {/* Tone Selection */}
                      <div>
                        <span className="text-xs font-medium text-purple-700 uppercase tracking-wider mb-2 block">Tone</span>
                        <div className="flex gap-2">
                          {[
                            { key: 'low', label: 'Low', freq: '400Hz' },
                            { key: 'mid', label: 'Mid', freq: '800Hz' },
                            { key: 'high', label: 'High', freq: '1200Hz' }
                          ].map((tone) => (
                            <button
                              key={tone.key}
                              onClick={() => setMetronomeTone(tone.key as 'high' | 'mid' | 'low')}
                              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                metronomeTone === tone.key
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                                  : 'bg-white/70 text-purple-600 hover:bg-white/90 border border-purple-200'
                              }`}
                            >
                              <div>{tone.label}</div>
                              <div className="text-xs opacity-75">{tone.freq}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* File Info & Actions */}
            <div className="pt-4 border-t border-purple-100">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                      fileInputRef.current.click()
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-lg font-medium border border-purple-200 transition-all duration-300 text-sm flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  Add Images
                </button>
                
                {hasImages && (
                  <button
                    onClick={clearAllImages}
                    className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium border border-red-200 transition-all duration-300 text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Info */}
          <div className="mt-4 text-center text-purple-300 text-sm">
            {hasImages ? `${imageFiles.length} pages loaded` : 'No images loaded'}
          </div>
        </div>
      </div>
    </div>
  )
}