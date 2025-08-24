'use client'

import { useState } from 'react'

interface PluginVideoData {
  title: string
  views: string
  danmaku: string
  duration: string
  publishTime: string
  link: string
  [key: string]: any // 允许其他字段
}

interface UploaderStats {
  following: string      // 关注数
  followers: string      // 粉丝数
  likes: string          // 获赞数
  totalPlays: string     // 播放数
  charging: string       // 充电人数
  certification: string  // 认证信息
}

interface PluginData {
  uploader: string
  stats: UploaderStats
  videos: PluginVideoData[]
  totalVideos: number
  extractTime: string
  pageUrl: string
}

interface BilibiliPluginPanelProps {
  data: PluginData | null
  onDataChange: (data: PluginData | null) => void
}

export default function BilibiliPluginPanel({ data, onDataChange }: BilibiliPluginPanelProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 使用父组件传入的数据，而不是内部state
  const parsedData = data

  const handleParse = () => {
    setError(null)
    onDataChange(null)

    if (!jsonInput.trim()) {
      setError('请粘贴UP主频道统计数据')
      return
    }

    try {
      const parsedJSON = JSON.parse(jsonInput)
      onDataChange(parsedJSON)
      console.log('Parsed plugin data:', parsedJSON)
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
    // 处理类似 "1.2万" 的格式
    if (numStr.includes('万')) {
      return numStr
    }
    const num = parseInt(numStr.replace(/[^\d]/g, ''))
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`
    }
    return num.toString()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">UP主分析 - 频道概览与内容统计</h1>
      
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
          placeholder="请粘贴UP主频道统计数据（Chrome插件生成的JSON格式）..."
        />
        
        <div className="mt-3 text-sm text-gray-500">
          <p>使用说明：</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>访问B站UP主页面（如: space.bilibili.com/197456791）</li>
            <li>点击"B站UP主数据提取工具"Chrome插件按钮</li>
            <li>将生成的频道统计JSON数据粘贴到上方文本框</li>
            <li>点击"解析数据"查看UP主分析报告</li>
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
          {/* UP主详细信息 */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">UP主信息</h2>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {parsedData.uploader[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{parsedData.uploader}</h3>
                  {parsedData.stats?.certification && parsedData.stats.certification !== '无认证' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {parsedData.stats.certification}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{formatNumber(parsedData.stats?.followers || '0')}</div>
                    <div className="text-xs text-gray-500">粉丝数</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">{formatNumber(parsedData.stats?.following || '0')}</div>
                    <div className="text-xs text-gray-500">关注数</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{formatNumber(parsedData.stats?.likes || '0')}</div>
                    <div className="text-xs text-gray-500">获赞数</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{formatNumber(parsedData.stats?.totalPlays || '0')}</div>
                    <div className="text-xs text-gray-500">播放数</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">{parsedData.stats?.charging || '0'}</div>
                    <div className="text-xs text-gray-500">充电人数</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-600">{parsedData.totalVideos}</div>
                    <div className="text-xs text-gray-500">视频数量</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 视频列表 */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              视频列表 (共 {parsedData.videos.length} 个)
            </h2>
            {parsedData.videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedData.videos.map((video, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-3">
                      <div className="w-24 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 line-clamp-2 text-sm">
                          {video.title}
                        </h4>
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <p>时长: {video.duration}</p>
                          <p>播放: {formatNumber(video.views)}</p>
                          {video.danmaku && video.danmaku !== '0' && (
                            <p>弹幕: {formatNumber(video.danmaku)}</p>
                          )}
                          {video.publishTime && video.publishTime !== '未知时间' && (
                            <p>发布: {video.publishTime}</p>
                          )}
                          {video.link && video.link !== '未知链接' && (
                            <a 
                              href={video.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              在B站观看 →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">暂无视频数据</p>
            )}
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