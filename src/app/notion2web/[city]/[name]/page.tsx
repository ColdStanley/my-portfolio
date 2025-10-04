'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { themes, getThemeClasses } from '@/lib/themes'
import ImageModal from '@/components/ImageModal'
import VideoModal from '@/components/VideoModal'
import { RichTextRenderer, parseRichText } from '@/lib/richTextParser'
import Masonry from 'react-masonry-css'

interface NotionContent {
  id: string
  title: string
  type: string
  date: string
  content: string
  richContent?: any[]
  images: string[]
  link?: string
  order?: number
  comments?: string[]
}

export default function UserWebsitePage() {
  const params = useParams()
  const [notionData, setNotionData] = useState<NotionContent[]>([])
  const [activeTab, setActiveTab] = useState('')
  const [tabs, setTabs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [userConfig, setUserConfig] = useState<any>(null)
  const [configError, setConfigError] = useState(false)
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: '',
    alt: ''
  })
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  })
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({})
  const [submittingComments, setSubmittingComments] = useState<{ [key: string]: boolean }>({})
  const [viewMode, setViewMode] = useState<'gallery' | 'presentation'>('gallery')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({})
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const themeMenuRef = useRef<HTMLDivElement>(null)

  // Helper function to extract primary background color from theme
  const getThemeIndicatorColor = (themeId: string): string => {
    const commentButtonClasses = getThemeClasses(themeId, 'commentButton')
    // Extract the primary bg- class from commentButton (e.g., "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400")
    const bgMatch = commentButtonClasses.match(/bg-(\w+-\d+)/)
    return bgMatch ? `bg-${bgMatch[1]}` : 'bg-purple-600' // fallback
  }

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    const userKey = `${params.city}-${params.name}`
    const updatedConfig = { ...userConfig, theme: newTheme }

    setUserConfig(updatedConfig)
    localStorage.setItem(`notion-${userKey}`, JSON.stringify(updatedConfig))
    setIsThemeMenuOpen(false)
  }

  useEffect(() => {
    const loadConfig = async () => {
      const userKey = `${params.city}-${params.name}`

      // First try to get config from URL parameters (for backward compatibility)
      const urlParams = new URLSearchParams(window.location.search)
      const apiKey = urlParams.get('apiKey')
      const dbId = urlParams.get('dbId')
      const theme = urlParams.get('theme')

      if (apiKey && dbId) {
        // Check if we have existing config in localStorage first
        const existingConfig = localStorage.getItem(`notion-${userKey}`)
        let originalName = params.name as string
        let originalCity = params.city as string

        if (existingConfig) {
          const parsed = JSON.parse(existingConfig)
          originalName = parsed.name || params.name as string
          originalCity = parsed.city || params.city as string
        }

        // Use URL parameters with preserved original names
        const configFromUrl = {
          apiKey,
          databaseId: dbId,
          city: originalCity,
          name: originalName,
          theme: theme || 'pink'
        }

        // Save to localStorage for future use
        localStorage.setItem(`notion-${userKey}`, JSON.stringify(configFromUrl))

        // Clean URL parameters for security
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, document.title, cleanUrl)

        setUserConfig(configFromUrl)
        fetchNotionData(configFromUrl)
        return
      }

      // Try to get config from server (no localStorage fallback)
      try {
        console.log('Attempting to load config from server for:', params.city, params.name)
        const response = await fetch(`/api/notion/config?city=${encodeURIComponent(params.city as string)}&name=${encodeURIComponent(params.name as string)}`)
        const result = await response.json()

        console.log('Server response:', result)

        if (result.success && result.config) {
          const serverConfig = result.config
          console.log('Successfully loaded config from server:', serverConfig)

          // Save to localStorage as backup for theme persistence
          localStorage.setItem(`notion-${userKey}`, JSON.stringify(serverConfig))

          setUserConfig(serverConfig)
          fetchNotionData(serverConfig)
          return
        } else {
          console.log('Server returned unsuccessful or no config:', result)
        }
      } catch (error) {
        console.error('Error loading config from server:', error)
      }

      // No fallback - if server fails, show error
      console.log('Server config load failed, showing error')
      setConfigError(true)
      setLoading(false)
    }

    loadConfig()
  }, [params])

  // Handle click outside theme menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotionData = async (config: any) => {
    try {
      const response = await fetch('/api/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: config.apiKey,
          databaseId: config.databaseId
        })
      })

      const data = await response.json()

      if (data.results) {
        const processedData = data.results
          .filter((item: any) => item.properties.Type?.select?.name) // Only include items with valid Type
          .map((item: any) => {
            // 处理评论字段 - 从富文本中解析多行评论
            const commentText = item.properties.Comment?.rich_text?.[0]?.plain_text || ''
            const comments = commentText ? commentText.split('\n').filter((comment: string) => comment.trim()) : []

            // Parse rich text content
            const richTextContent = item.properties.Content?.rich_text || []
            const { plainText } = parseRichText(richTextContent)

            return {
              id: item.id,
              title: item.properties.Title?.title?.[0]?.plain_text || 'Untitled',
              type: item.properties.Type.select.name, // No fallback needed since we filtered
              date: item.properties.Date?.date?.start || '',
              content: plainText,
              richContent: richTextContent,
              images: item.properties.Image?.files?.map((file: any) =>
                file.file?.url || file.external?.url
              ).filter(Boolean) || [],
              link: item.properties.Link?.url || '',
              order: item.properties.Order?.number || 999,
              comments: comments
            }
          })

        setNotionData(processedData)

        // Extract unique types for tabs
        const uniqueTypes = [...new Set(processedData.map((item: NotionContent) => item.type))] as string[]
        setTabs(uniqueTypes)
        setActiveTab(uniqueTypes[0] || '')
      }
    } catch (error) {
      console.error('Error fetching Notion data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContent = notionData
    .filter(item => item.type === activeTab)
    .sort((a, b) => (a.order || 999) - (b.order || 999))
  const currentTheme = userConfig?.theme || 'pink'

  // Masonry breakpoint configuration
  const breakpointColumnsObj = {
    default: 3,
    1024: 2,
    640: 1
  }

  // 首字母大写工具函数
  const capitalizeWords = (str: string): string => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // 动态更新浏览器标题
  useEffect(() => {
    console.log('Title update effect triggered, userConfig:', userConfig)
    const displayName = userConfig?.displayName || userConfig?.name
    if (displayName) {
      const formattedName = capitalizeWords(displayName)
      const newTitle = `${formattedName}'s Portfolio`
      console.log('Setting document title to:', newTitle)

      // 设置document.title
      document.title = newTitle

      // 同时更新head中的title标签（强制更新）
      const titleElement = document.querySelector('title')
      if (titleElement) {
        titleElement.textContent = newTitle
      }

      // 如果title标签不存在，创建一个
      if (!titleElement) {
        const newTitleElement = document.createElement('title')
        newTitleElement.textContent = newTitle
        document.head.appendChild(newTitleElement)
      }
    }

    // 可选：在组件卸载时恢复默认标题
    return () => {
      document.title = "Stanley's Portfolio"
      const titleElement = document.querySelector('title')
      if (titleElement) {
        titleElement.textContent = "Stanley's Portfolio"
      }
    }
  }, [userConfig?.displayName, userConfig?.name])

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (viewMode !== 'presentation') return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setCurrentSlide(prev => Math.max(0, prev - 1))
          break
        case 'ArrowRight':
        case ' ': // Space bar
          e.preventDefault()
          setCurrentSlide(prev => Math.min(filteredContent.length - 1, prev + 1))
          break
        case 'Escape':
          e.preventDefault()
          setViewMode('gallery')
          break
        case 'Home':
          e.preventDefault()
          setCurrentSlide(0)
          break
        case 'End':
          e.preventDefault()
          setCurrentSlide(filteredContent.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, filteredContent.length])

  // Reset slide when switching tabs or modes
  useEffect(() => {
    setCurrentSlide(0)
  }, [activeTab, viewMode])

  // Touch gesture support for presentation mode
  useEffect(() => {
    if (viewMode !== 'presentation') return

    let touchStartX = 0
    let touchEndX = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX
      handleSwipe()
    }

    const handleSwipe = () => {
      const swipeThreshold = 50
      const swipeDistance = touchStartX - touchEndX

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          // Swipe left - next slide
          setCurrentSlide(prev => Math.min(filteredContent.length - 1, prev + 1))
        } else {
          // Swipe right - previous slide
          setCurrentSlide(prev => Math.max(0, prev - 1))
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [viewMode, filteredContent.length])

  const openImageModal = (src: string, alt: string) => {
    setImageModal({ isOpen: true, src, alt })
  }

  const closeImageModal = () => {
    setImageModal({ isOpen: false, src: '', alt: '' })
  }

  const openVideoModal = (url: string, title: string) => {
    setVideoModal({ isOpen: true, url, title })
  }

  const closeVideoModal = () => {
    setVideoModal({ isOpen: false, url: '', title: '' })
  }

  const isVideoUrl = (url: string) => {
    return url.includes('youtube.com/watch') ||
           url.includes('youtu.be/') ||
           url.includes('vimeo.com/') ||
           url.includes('bilibili.com/video/') ||
           url.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i)
  }

  const submitComment = async (cardId: string) => {
    if (!newComments[cardId]?.trim() || !userConfig) return

    setSubmittingComments(prev => ({ ...prev, [cardId]: true }))

    try {
      const response = await fetch('/api/notion/comment', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageId: cardId,
          comment: newComments[cardId].trim(),
          apiKey: userConfig.apiKey
        })
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setNotionData(prev => prev.map(item =>
          item.id === cardId
            ? { ...item, comments: result.comments }
            : item
        ))

        // Clear input
        setNewComments(prev => ({ ...prev, [cardId]: '' }))
      } else {
        alert('Failed to submit comment: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Failed to submit comment')
    } finally {
      setSubmittingComments(prev => ({ ...prev, [cardId]: false }))
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses(currentTheme, 'background')} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-12 h-12 bg-gradient-to-r ${getThemeClasses(currentTheme, 'accent')} rounded-full animate-pulse mb-4 mx-auto`}></div>
          <p className="text-gray-600">Loading your website...</p>
        </div>
      </div>
    )
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-100/50">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-gray-800 mb-2">Configuration Not Found</h2>
            <p className="text-gray-600 mb-6">
              This website hasn't been created yet or the configuration doesn't exist.
            </p>
            <a
              href="/notion2web"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Create Your Website
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses(currentTheme, 'background')}`}>
      {/* Header */}
      <div className={`${getThemeClasses(currentTheme, 'cardBg')} backdrop-blur-sm border-b border-gray-100/50 sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${getThemeClasses(currentTheme, 'nameGradient')} bg-clip-text text-transparent capitalize tracking-wide hover:scale-105 transition-all duration-300 cursor-default font-serif animate-pulse`}>{userConfig?.displayName || userConfig?.name}</h1>
              <p className="text-sm text-gray-500">{userConfig?.displayCity || userConfig?.city}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Tab Navigation */}
              <nav className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-2xl p-1 border border-gray-100/50">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform ${
                      activeTab === tab
                        ? `bg-gradient-to-r ${getThemeClasses(currentTheme, 'tabActive')} text-white shadow-lg scale-105`
                        : `text-gray-600 ${getThemeClasses(currentTheme, 'tabHover')}`
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                {/* Theme Selection */}
                <div className="relative" ref={themeMenuRef}>
                  <button
                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                    className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                      isThemeMenuOpen
                        ? `bg-gradient-to-r ${getThemeClasses(currentTheme, 'tabActive')} text-white shadow-lg`
                        : `bg-white/60 backdrop-blur-sm text-gray-600 ${getThemeClasses(currentTheme, 'tabHover')} border border-gray-100/50`
                    }`}
                    title="Change Theme"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H11l3 7-3 7h10a2 2 0 002-2V7a2 2 0 00-2-2z"/>
                    </svg>
                  </button>

                  {/* Theme Dropdown */}
                  {isThemeMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-dropdown">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Choose Theme</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.values(themes).map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            className={`relative p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                              currentTheme === theme.id
                                ? 'border-gray-400 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-full h-6 rounded-lg bg-gradient-to-r ${theme.accent} mb-2`}></div>
                            <p className="text-xs font-medium text-gray-700">{theme.name}</p>
                            {currentTheme === theme.id && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* View Mode Toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'gallery' ? 'presentation' : 'gallery')}
                className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                  viewMode === 'presentation'
                    ? `bg-gradient-to-r ${getThemeClasses(currentTheme, 'tabActive')} text-white shadow-lg`
                    : `bg-white/60 backdrop-blur-sm text-gray-600 ${getThemeClasses(currentTheme, 'tabHover')} border border-gray-100/50`
                }`}
                title={viewMode === 'gallery' ? 'Switch to Presentation Mode' : 'Switch to Gallery Mode'}
              >
                {viewMode === 'gallery' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5"/>
                    <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5"/>
                    <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="18" rx="2" strokeWidth="1.5"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h8M8 16h8"/>
                  </svg>
                )}
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'gallery' ? (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex -ml-6 w-auto"
            columnClassName="pl-6"
          >
            {filteredContent.map((item, index) => (
              <div
                key={index}
                className={`masonry-card mb-6 ${getThemeClasses(currentTheme, 'cardBg')} backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border border-gray-100/50`}
                style={{
                  animationDelay: index < 20 ? `${index * 100}ms` : '0ms'
                }}
              >
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>

                {item.date && (
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{item.date}</p>
                )}

                {item.images && item.images.length > 0 && (
                  <div className="relative">
                    <div
                      className="relative overflow-hidden rounded-xl cursor-pointer group"
                      onClick={() => openImageModal(item.images[imageIndices[item.id] || 0], item.title)}
                    >
                      <img
                        src={item.images[imageIndices[item.id] || 0]}
                        alt={item.title}
                        className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>

                    {item.images.length > 1 && (
                      <div className="flex gap-2 mt-3 justify-center">
                        {item.images.map((_, imgIndex) => (
                          <button
                            key={imgIndex}
                            onClick={() => setImageIndices(prev => ({ ...prev, [item.id]: imgIndex }))}
                            className={`h-1 rounded-full transition-all duration-300 ${
                              imgIndex === (imageIndices[item.id] || 0)
                                ? `w-8 ${getThemeIndicatorColor(currentTheme)}`
                                : 'w-4 bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(item.richContent && item.richContent.length > 0) ? (
                  <div className="text-gray-600 leading-relaxed">
                    <RichTextRenderer richText={item.richContent} theme={currentTheme} />
                  </div>
                ) : item.content && (
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </div>
                )}

{item.link && (
                  <div>
                    {(() => {
                      const url = item.link

                      // Check if it's a video URL
                      if (isVideoUrl(url)) {
                        // YouTube video
                        if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
                          const videoId = url.includes('youtu.be/')
                            ? url.split('youtu.be/')[1].split('?')[0]
                            : url.split('v=')[1]?.split('&')[0]

                          if (videoId) {
                            return (
                              <div
                                className="relative aspect-video w-full rounded-xl overflow-hidden cursor-pointer group"
                                onClick={() => openVideoModal(url, item.title)}
                              >
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title="YouTube video"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full pointer-events-none"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                            )
                          }
                        }

                        // Vimeo video
                        if (url.includes('vimeo.com/')) {
                          const videoId = url.split('vimeo.com/')[1].split('?')[0]
                          if (videoId) {
                            return (
                              <div
                                className="relative aspect-video w-full rounded-xl overflow-hidden cursor-pointer group"
                                onClick={() => openVideoModal(url, item.title)}
                              >
                                <iframe
                                  src={`https://player.vimeo.com/video/${videoId}`}
                                  title="Vimeo video"
                                  allow="autoplay; fullscreen; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full pointer-events-none"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                            )
                          }
                        }

                        // Direct video files
                        if (url.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i)) {
                          return (
                            <div
                              className="relative w-full rounded-xl overflow-hidden cursor-pointer group"
                              onClick={() => openVideoModal(url, item.title)}
                            >
                              <video
                                controls
                                className="w-full h-auto pointer-events-none"
                                preload="metadata"
                              >
                                <source src={url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>
                          )
                        }

                        // Bilibili video
                        if (url.includes('bilibili.com/video/')) {
                          const bvMatch = url.match(/\/video\/(BV\w+)/)
                          if (bvMatch) {
                            const bvid = bvMatch[1]
                            return (
                              <div
                                className="relative aspect-video w-full rounded-xl overflow-hidden cursor-pointer group"
                                onClick={() => openVideoModal(url, item.title)}
                              >
                                <iframe
                                  src={`https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=0`}
                                  title="Bilibili video"
                                  allowFullScreen
                                  className="w-full h-full border-0 pointer-events-none"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                            )
                          }
                        }
                      }

                      // Default link
                      return (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 ${getThemeClasses(currentTheme, 'linkColor')} text-sm font-medium transition-colors duration-200`}
                        >
                          View Link
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )
                    })()}
                  </div>
                )}

                {/* Comments Section */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  {/* Existing Comments */}
                  {item.comments && item.comments.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Comments</h4>
                      {item.comments.map((comment, commentIndex) => (
                        <div key={commentIndex} className={`${getThemeClasses(currentTheme, 'commentBg')} backdrop-blur-sm rounded-lg p-3 text-sm text-gray-600`}>
                          {comment}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Comment Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newComments[item.id] || ''}
                      onChange={(e) => setNewComments(prev => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="Add a comment..."
                      className={`flex-1 px-3 py-2 text-sm border ${getThemeClasses(currentTheme, 'commentBorder')} rounded-lg ${getThemeClasses(currentTheme, 'commentInputFocus')} focus:ring-2 ${getThemeClasses(currentTheme, 'commentInputRing')} bg-white/70 backdrop-blur-sm transition-all duration-200`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          submitComment(item.id)
                        }
                      }}
                      disabled={submittingComments[item.id]}
                    />
                    <button
                      onClick={() => submitComment(item.id)}
                      disabled={!newComments[item.id]?.trim() || submittingComments[item.id]}
                      className={`px-3 py-2 ${getThemeClasses(currentTheme, 'commentButton')} text-white rounded-lg transition-all duration-200 flex items-center gap-1 text-sm font-medium`}
                    >
                      {submittingComments[item.id] ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </Masonry>

          {filteredContent.length === 0 && (
            <div className="text-center py-16">
              <div className={`w-24 h-24 bg-gradient-to-r ${getThemeClasses(currentTheme, 'accent')} opacity-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-500">No content available for {activeTab}</p>
            </div>
          )}
        </div>
      ) : (
        /* Presentation Mode */
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn" style={{backdropFilter: 'blur(8px)'}}>
          {filteredContent.length > 0 && (
            <>
              {/* Current Slide */}
              <div className="w-[90vw] h-[80vh] max-w-6xl mx-auto p-6 flex items-center justify-center">
                <div className="w-full h-full flex flex-col justify-center">
                  <div
                    key={currentSlide}
                    className={`${getThemeClasses(currentTheme, 'cardBg')} backdrop-blur-md rounded-2xl p-10 shadow-2xl border border-gray-100/50 transform transition-all duration-700 ease-out animate-slideIn h-full overflow-y-auto`}
                  >
                  {/* Slide Content - Same as card content */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-medium text-gray-800">{filteredContent[currentSlide]?.title}</h3>

                    {filteredContent[currentSlide]?.date && (
                      <p className="text-sm text-gray-400 uppercase tracking-wider">{filteredContent[currentSlide].date}</p>
                    )}

                    {filteredContent[currentSlide]?.images && filteredContent[currentSlide]?.images.length > 0 && (
                      <div className="relative">
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={filteredContent[currentSlide].images[imageIndices[filteredContent[currentSlide].id] || 0]}
                            alt={filteredContent[currentSlide].title}
                            className="w-full max-h-96 object-contain"
                          />
                        </div>

                        {filteredContent[currentSlide].images.length > 1 && (
                          <div className="flex gap-2 mt-4 justify-center">
                            {filteredContent[currentSlide].images.map((_, imgIndex) => (
                              <button
                                key={imgIndex}
                                onClick={() => setImageIndices(prev => ({ ...prev, [filteredContent[currentSlide].id]: imgIndex }))}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  imgIndex === (imageIndices[filteredContent[currentSlide].id] || 0)
                                    ? `w-10 ${getThemeIndicatorColor(currentTheme)}`
                                    : 'w-5 bg-gray-300 hover:bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {(filteredContent[currentSlide]?.richContent && filteredContent[currentSlide]?.richContent.length > 0) ? (
                      <div className="text-gray-600 leading-relaxed text-lg">
                        <RichTextRenderer richText={filteredContent[currentSlide].richContent} theme={currentTheme} />
                      </div>
                    ) : filteredContent[currentSlide]?.content && (
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                        {filteredContent[currentSlide].content}
                      </div>
                    )}

                    {filteredContent[currentSlide]?.link && (
                      <div>
                        {(() => {
                          const url = filteredContent[currentSlide].link

                          // Check if it's a video URL
                          if (isVideoUrl(url)) {
                            // YouTube video
                            if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
                              const videoId = url.includes('youtu.be/')
                                ? url.split('youtu.be/')[1].split('?')[0]
                                : url.split('v=')[1]?.split('&')[0]

                              if (videoId) {
                                return (
                                  <div
                                    className="relative aspect-video w-full rounded-xl overflow-hidden cursor-pointer group"
                                    onClick={() => openVideoModal(url, filteredContent[currentSlide].title)}
                                  >
                                    <iframe
                                      src={`https://www.youtube.com/embed/${videoId}`}
                                      title="YouTube video"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      className="w-full h-full pointer-events-none"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                  </div>
                                )
                              }
                            }

                            // Vimeo video
                            if (url.includes('vimeo.com/')) {
                              const videoId = url.split('vimeo.com/')[1].split('?')[0]
                              if (videoId) {
                                return (
                                  <div
                                    className="relative aspect-video w-full rounded-xl overflow-hidden cursor-pointer group"
                                    onClick={() => openVideoModal(url, filteredContent[currentSlide].title)}
                                  >
                                    <iframe
                                      src={`https://player.vimeo.com/video/${videoId}`}
                                      title="Vimeo video"
                                      allow="autoplay; fullscreen; picture-in-picture"
                                      allowFullScreen
                                      className="w-full h-full pointer-events-none"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                  </div>
                                )
                              }
                            }

                            // Direct video files
                            if (url.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i)) {
                              return (
                                <div
                                  className="relative w-full rounded-xl overflow-hidden cursor-pointer group"
                                  onClick={() => openVideoModal(url, filteredContent[currentSlide].title)}
                                >
                                  <video
                                    controls
                                    className="w-full h-auto pointer-events-none"
                                    preload="metadata"
                                  >
                                    <source src={url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                </div>
                              )
                            }

                            // Bilibili video
                            if (url.includes('bilibili.com/video/')) {
                              const bvMatch = url.match(/\/video\/(BV\w+)/)
                              if (bvMatch) {
                                const bvid = bvMatch[1]
                                return (
                                  <div
                                    className="relative aspect-video w-full rounded-xl overflow-hidden cursor-pointer group"
                                    onClick={() => openVideoModal(url, filteredContent[currentSlide].title)}
                                  >
                                    <iframe
                                      src={`https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=0`}
                                      title="Bilibili video"
                                      allowFullScreen
                                      className="w-full h-full border-0 pointer-events-none"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                  </div>
                                )
                              }
                            }
                          }

                          // Default link
                          return (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 ${getThemeClasses(currentTheme, 'linkColor')} text-lg font-medium transition-colors duration-200`}
                            >
                              View Link
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )
                        })()}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="fixed left-6 top-1/2 transform -translate-y-1/2 p-3 bg-black/40 backdrop-blur-sm rounded-full text-white shadow-lg transition-all duration-300 hover:bg-black/60 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setCurrentSlide(Math.min(filteredContent.length - 1, currentSlide + 1))}
                disabled={currentSlide === filteredContent.length - 1}
                className="fixed right-6 top-1/2 transform -translate-y-1/2 p-3 bg-black/40 backdrop-blur-sm rounded-full text-white shadow-lg transition-all duration-300 hover:bg-black/60 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setViewMode('gallery')}
                className="fixed top-6 right-6 p-2.5 bg-black/40 backdrop-blur-sm rounded-full text-white shadow-lg transition-all duration-300 hover:bg-black/60 hover:scale-110 hover:rotate-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Slide Counter */}
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white shadow-lg text-xs">
                {currentSlide + 1} / {filteredContent.length}
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .masonry-card {
          break-inside: avoid;
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

      `}</style>

      {/* Modals */}
      <ImageModal
        src={imageModal.src}
        alt={imageModal.alt}
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
      />
      <VideoModal
        url={videoModal.url}
        title={videoModal.title}
        isOpen={videoModal.isOpen}
        onClose={closeVideoModal}
      />
    </div>
  )
}