'use client'

import { useState } from 'react'

interface SingleVideoData {
  title: string
  author: string
  videoUrl: string
  duration: string
  publishTime: string
  views: string          // 播放量
  danmaku: string        // 弹幕量
  likes: string          // 点赞数
  coins: string          // 投币数
  collections: string    // 收藏数
  shares: string         // 转发数
  extractTime: string
  pageUrl: string
  metaDescription: string
}

interface BilibiliSingleVideoPanelProps {
  data: SingleVideoData | null
  onDataChange: (data: SingleVideoData | null) => void
}

export default function BilibiliSingleVideoPanel({ data, onDataChange }: BilibiliSingleVideoPanelProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 使用父组件传入的数据，而不是内部state
  const parsedData = data

  const handleParse = () => {
    setError(null)
    onDataChange(null)

    if (!jsonInput.trim()) {
      setError('请粘贴视频互动统计数据')
      return
    }

    try {
      const parsedJSON = JSON.parse(jsonInput)
      onDataChange(parsedJSON)
      console.log('Parsed single video data:', parsedJSON)
    } catch (err) {
      setError('JSON格式错误，请检查数据格式')
      console.error('JSON parse error:', err)
    }
  }

  const handleClear = () => {
    setJsonInput('')
    onDataChange(null)
    setError(null)
  }

  const formatNumber = (numStr: string) => {
    const num = parseInt(numStr.replace(/[^\d]/g, ''))
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`
    }
    return num.toString()
  }

  const getEngagementRate = (likes: string, views: string) => {
    const likesNum = parseInt(likes.replace(/[^\d]/g, ''))
    const viewsNum = parseInt(views.replace(/[^\d]/g, ''))
    if (viewsNum === 0) return '0%'
    return `${((likesNum / viewsNum) * 100).toFixed(2)}%`
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">视频分析 - 深度互动数据洞察</h1>
      
      {/* JSON输入区域 */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">数据输入</h2>
          <div className="space-x-3">
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
            >
              清空
            </button>
            <button
              onClick={handleParse}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300"
            >
              解析数据
            </button>
          </div>
        </div>
        
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
          placeholder="请粘贴视频互动数据（Chrome插件生成的JSON格式）..."
        />
        
        <div className="mt-3 text-sm text-gray-500">
          <p>使用说明：</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>访问B站单个视频页面（如: www.bilibili.com/video/BV1234567890）</li>
            <li>点击"B站单视频数据提取工具(S)"Chrome插件按钮</li>
            <li>将生成的互动统计JSON数据粘贴到上方文本框</li>
            <li>点击"解析数据"查看视频深度分析洞察</li>
          </ol>
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <h3 className="text-red-800 font-medium mb-2">解析失败</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 解析结果展示 */}
      {parsedData && (
        <div className="space-y-6">
          {/* 视频基本信息 */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">视频基本信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">标题</h3>
                <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded-lg">{parsedData.title}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">作者</h3>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{parsedData.author}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">时长</h3>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{parsedData.duration}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">发布时间</h3>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{parsedData.publishTime}</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">视频链接</h3>
              <a 
                href={parsedData.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 bg-gray-50 p-3 rounded-lg block text-sm break-all"
              >
                {parsedData.videoUrl} →
              </a>
            </div>
          </div>

          {/* 详细互动数据 */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">详细互动数据</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1">播放量</h3>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(parsedData.views)}</p>
                <p className="text-xs text-blue-600">原始: {parsedData.views}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-1">点赞数</h3>
                <p className="text-2xl font-bold text-green-900">{formatNumber(parsedData.likes)}</p>
                <p className="text-xs text-green-600">互动率: {getEngagementRate(parsedData.likes, parsedData.views)}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-1">投币数</h3>
                <p className="text-2xl font-bold text-yellow-900">{formatNumber(parsedData.coins)}</p>
                <p className="text-xs text-yellow-600">原始: {parsedData.coins}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-1">收藏数</h3>
                <p className="text-2xl font-bold text-purple-900">{formatNumber(parsedData.collections)}</p>
                <p className="text-xs text-purple-600">原始: {parsedData.collections}</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
                <h3 className="font-medium text-indigo-800 mb-1">弹幕量</h3>
                <p className="text-2xl font-bold text-indigo-900">{formatNumber(parsedData.danmaku)}</p>
                <p className="text-xs text-indigo-600">原始: {parsedData.danmaku}</p>
              </div>
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg">
                <h3 className="font-medium text-pink-800 mb-1">转发数</h3>
                <p className="text-2xl font-bold text-pink-900">{formatNumber(parsedData.shares)}</p>
                <p className="text-xs text-pink-600">原始: {parsedData.shares}</p>
              </div>
            </div>
          </div>

          {/* 数据分析洞察 */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">数据分析洞察</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-3">互动指标</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">点赞率</span>
                    <span className="font-medium">{getEngagementRate(parsedData.likes, parsedData.views)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">投币率</span>
                    <span className="font-medium">{getEngagementRate(parsedData.coins, parsedData.views)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">收藏率</span>
                    <span className="font-medium">{getEngagementRate(parsedData.collections, parsedData.views)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">弹幕密度</span>
                    <span className="font-medium">{getEngagementRate(parsedData.danmaku, parsedData.views)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-3">质量评估</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">投币/点赞比</span>
                    <span className="font-medium">
                      {(parseInt(parsedData.coins) / parseInt(parsedData.likes)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">收藏/点赞比</span>
                    <span className="font-medium">
                      {(parseInt(parsedData.collections) / parseInt(parsedData.likes)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">转发/点赞比</span>
                    <span className="font-medium">
                      {(parseInt(parsedData.shares) / parseInt(parsedData.likes)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 原始数据展示（调试用） */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
            <details>
              <summary className="cursor-pointer text-lg font-semibold text-gray-800 hover:text-purple-600">
                原始数据（调试）
              </summary>
              <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(parsedData, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  )
}