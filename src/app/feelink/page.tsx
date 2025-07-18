'use client'

import { useState, useEffect } from 'react'
import FeelinkHeader from '@/components/feelink/FeelinkHeader'
import FeelinkTemplateCard from '@/components/feelink/FeelinkTemplateCard'

interface FeelinkTemplate {
  id: string
  name: string
  imageUrl: string
  quotes: string
  description: string
  category: string
  section: string
  webUrl: string
  createdAt: string
}

interface TemplatesBySection {
  love: FeelinkTemplate[]
  sorry: FeelinkTemplate[]
  blessing: FeelinkTemplate[]
  thanks: FeelinkTemplate[]
}

export default function FeelinkPage() {
  const [templates, setTemplates] = useState<TemplatesBySection>({
    love: [],
    sorry: [],
    blessing: [],
    thanks: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/feelink/templates')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || '获取模板失败')
      }

      setTemplates(data.templatesBySection)
      setError(null)
    } catch (err) {
      console.error('❌ 获取模板失败:', err)
      setError(err instanceof Error ? err.message : '获取模板失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载模板中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">加载模板时出错: {error}</p>
          <button
            onClick={fetchTemplates}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 md:px-10 bg-gradient-to-b from-white to-purple-50 animate-fade-in scroll-smooth">
      {/* 顶部 Header 区块 */}
      <FeelinkHeader />

      {/* 滚动引导箭头 */}
      <div className="mt-6 mb-4 text-center text-purple-400 text-2xl animate-bounce">
        ↓
      </div>

      {/* Love Section */}
      <section id="love" className="scroll-mt-24 py-8 mb-14 bg-white/70 rounded-xl shadow-inner backdrop-blur-md px-6">
        <TitleBlock 
          emoji="❤️" 
          title="Say Love" 
          desc="When your heart is full, let a catgirl or Miku say it for you." 
          count={templates.love.length}
        />
        <TemplateGrid templates={templates.love} />
      </section>

      {/* Sorry Section */}
      <section id="sorry" className="scroll-mt-24 py-8 mb-14 bg-purple-50/80 rounded-xl shadow-inner backdrop-blur-md px-6">
        <TitleBlock 
          emoji="🙏" 
          title="Say Sorry" 
          desc="Some apologies are better said with pixels than words." 
          count={templates.sorry.length}
        />
        <TemplateGrid templates={templates.sorry} />
      </section>

      {/* Blessing Section */}
      <section id="blessing" className="scroll-mt-24 py-8 mb-14 bg-indigo-50/70 rounded-xl shadow-inner backdrop-blur-md px-6">
        <TitleBlock 
          emoji="✨" 
          title="Send Blessings" 
          desc="Whisper magic, courage, and warmth into someone's world." 
          count={templates.blessing.length}
        />
        <TemplateGrid templates={templates.blessing} />
      </section>

      {/* Thanks Section */}
      <section id="thanks" className="scroll-mt-24 py-8 mb-14 bg-orange-50/60 rounded-xl shadow-inner backdrop-blur-md px-6">
        <TitleBlock 
          emoji="💜" 
          title="Say Thanks" 
          desc="A little appreciation goes a long way—let your gratitude shine." 
          count={templates.thanks.length}
        />
        <TemplateGrid templates={templates.thanks} />
      </section>

      {/* 全局动效样式 */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-in-out;
        }

        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-in-out;
        }

        .animate-bounce {
          animation: bounce 1.5s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

// 情绪标题组件
function TitleBlock({ emoji, title, desc, count }: { emoji: string; title: string; desc: string; count: number }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
        <span className="text-3xl">{emoji}</span>
        <span className="animate-pulse">{title}</span>
        <span className="text-lg font-normal text-purple-600">({count})</span>
      </h2>
      <p className="text-gray-600 italic mt-1">{desc}</p>
    </div>
  )
}

// 模板网格组件
function TemplateGrid({ templates }: { templates: FeelinkTemplate[] }) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>暂无模板</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template, index) => (
        <div
          key={template.id}
          className="animate-slide-up transition-all ease-in-out duration-300 transform hover:-translate-y-[2px] hover:scale-[1.01]"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <FeelinkTemplateCard template={template} />
        </div>
      ))}
    </div>
  )
}