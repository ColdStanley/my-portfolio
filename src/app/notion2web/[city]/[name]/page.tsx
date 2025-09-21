'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { themes, getThemeClasses } from '@/lib/themes'
import ImageModal from '@/components/ImageModal'
import VideoModal from '@/components/VideoModal'

interface NotionContent {
  id: string
  title: string
  type: string
  date: string
  content: string
  image?: string
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

  useEffect(() => {
    const userKey = `${params.city}-${params.name}`

    // First try to get config from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const apiKey = urlParams.get('apiKey')
    const dbId = urlParams.get('dbId')
    const theme = urlParams.get('theme')

    if (apiKey && dbId) {
      // Use URL parameters
      const configFromUrl = {
        apiKey,
        databaseId: dbId,
        city: params.city as string,
        name: params.name as string,
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

    // Fallback to localStorage
    const config = localStorage.getItem(`notion-${userKey}`)
    if (!config) {
      window.location.href = '/notion2web'
      return
    }

    const parsedConfig = JSON.parse(config)
    setUserConfig(parsedConfig)
    fetchNotionData(parsedConfig)
  }, [params])

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

            return {
              id: item.id,
              title: item.properties.Title?.title?.[0]?.plain_text || 'Untitled',
              type: item.properties.Type.select.name, // No fallback needed since we filtered
              date: item.properties.Date?.date?.start || '',
              content: item.properties.Content?.rich_text?.[0]?.plain_text || '',
              image: item.properties.Image?.files?.[0]?.file?.url || item.properties.Image?.files?.[0]?.external?.url || '',
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
    if (userConfig?.name) {
      const formattedName = capitalizeWords(userConfig.name)
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
  }, [userConfig?.name])

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

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getThemeClasses(currentTheme, 'background')}`}>
      {/* Header */}
      <div className={`${getThemeClasses(currentTheme, 'cardBg')} backdrop-blur-sm border-b border-gray-100/50 sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${getThemeClasses(currentTheme, 'nameGradient')} bg-clip-text text-transparent capitalize tracking-wide hover:scale-105 transition-all duration-300 cursor-default font-serif animate-pulse`}>{userConfig?.name}</h1>
              <p className="text-sm text-gray-500">{userConfig?.city}</p>
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

      {/* Content Area */}
      {viewMode === 'gallery' ? (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="masonry-container">
            {filteredContent.map((item, index) => (
              <div
                key={index}
                className={`masonry-item ${getThemeClasses(currentTheme, 'cardBg')} backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border border-gray-100/50`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">{item.title}</h3>

                {item.date && (
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{item.date}</p>
                )}

                {item.image && (
                  <div
                    className="relative overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => openImageModal(item.image!, item.title)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                )}

                {item.content && (
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
        </div>

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
              <div className="max-w-5xl max-h-[85vh] mx-auto p-6 overflow-y-auto">
                <div
                  key={currentSlide}
                  className={`${getThemeClasses(currentTheme, 'cardBg')} backdrop-blur-md rounded-2xl p-10 shadow-2xl border border-gray-100/50 transform transition-all duration-700 ease-out animate-slideIn`}
                >
                  {/* Slide Content - Same as card content */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-medium text-gray-800">{filteredContent[currentSlide]?.title}</h3>

                    {filteredContent[currentSlide]?.date && (
                      <p className="text-sm text-gray-400 uppercase tracking-wider">{filteredContent[currentSlide].date}</p>
                    )}

                    {filteredContent[currentSlide]?.image && (
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={filteredContent[currentSlide].image}
                          alt={filteredContent[currentSlide].title}
                          className="w-full max-h-96 object-cover"
                        />
                      </div>
                    )}

                    {filteredContent[currentSlide]?.content && (
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
        .masonry-container {
          columns: 3;
          column-gap: 1.5rem;
          column-fill: balance;
        }

        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1.5rem;
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

        @media (max-width: 1024px) {
          .masonry-container {
            columns: 2;
          }
        }

        @media (max-width: 640px) {
          .masonry-container {
            columns: 1;
          }
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