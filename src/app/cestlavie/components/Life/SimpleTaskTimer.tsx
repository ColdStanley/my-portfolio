'use client'

import { useState, useEffect, useCallback } from 'react'

interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  actual_start?: string
  actual_end?: string
}

interface SimpleTaskTimerProps {
  task: TaskRecord
  extendedEndTime?: string
  onTimeExpired: (task: TaskRecord) => void
  onTaskStart: (task: TaskRecord) => void
  onTaskEnd: (task: TaskRecord) => void
  displayOnly?: boolean
}

export default function SimpleTaskTimer({
  task,
  extendedEndTime,
  onTaskStart,
  onTaskEnd,
  onTimeExpired,
  displayOnly = false
}: SimpleTaskTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00')
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0)

  const isStarted = !!task.actual_start && !task.actual_end
  const isCompleted = task.status === 'Completed' || !!task.actual_end

  // 温暖鼓励文案数组
  const encouragingMessages = [
    "Growing with every moment",
    "Keep going, you're growing", 
    "Time nurtures greatness",
    "Trust the process",
    "Small steps, big growth"
  ]

  const overtimeMessages = [
    "Time for fresh growth",
    "Every ending is a new beginning", 
    "Gentle rest, then bloom again",
    "Growth continues beyond time",
    "Your effort still matters"
  ]

  const formatTime = useCallback((totalSeconds: number): string => {
    if (totalSeconds <= 0) return '00:00:00'
    
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const calculateTimeLeft = useCallback((endTime: string): number => {
    // Parse current time as local time string
    const now = new Date()
    const nowStr = now.getFullYear() + '-' +
                   String(now.getMonth() + 1).padStart(2, '0') + '-' +
                   String(now.getDate()).padStart(2, '0') + 'T' +
                   String(now.getHours()).padStart(2, '0') + ':' +
                   String(now.getMinutes()).padStart(2, '0') + ':' +
                   String(now.getSeconds()).padStart(2, '0')
    
    // Parse both times as local time (no timezone conversion)
    const nowTime = new Date(nowStr).getTime()
    const endTimeObj = new Date(endTime.replace('Z', '')).getTime()
    
    return Math.floor((endTimeObj - nowTime) / 1000)
  }, [])

  // Calculate progress for candle animation
  const calculateProgress = useCallback(() => {
    if (!isStarted) return 0
    
    const endTime = extendedEndTime || task.end_date
    if (!endTime) return 0
    
    const startTime = task.actual_start
    if (!startTime) return 0
    
    const now = new Date()
    const startTimeMs = new Date(startTime.replace('-04:00', '')).getTime()
    const endTimeMs = new Date(endTime.replace('-04:00', '')).getTime()
    const nowMs = now.getTime()
    
    const totalDuration = endTimeMs - startTimeMs
    const elapsed = nowMs - startTimeMs
    
    if (totalDuration <= 0) return 1
    const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1)
    
    return progress
  }, [isStarted, extendedEndTime, task.end_date, task.actual_start])

  // Update countdown and progress
  useEffect(() => {
    if (!isStarted) {
      setTimeLeft('00:00:00')
      setIsExpired(false)
      setProgress(0)
      return
    }

    const endTime = extendedEndTime || task.end_date
    if (!endTime) return

    const updateCountdown = () => {
      const secondsLeft = calculateTimeLeft(endTime)
      const currentProgress = calculateProgress()
      
      setProgress(currentProgress)
      
      if (secondsLeft <= 0) {
        setTimeLeft('00:00:00')
        if (!isExpired) {
          setIsExpired(true)
          onTimeExpired(task)
        }
        return
      }
      
      setTimeLeft(formatTime(secondsLeft))
      setIsExpired(false)
    }

    // Initial update
    updateCountdown()

    // Set up interval
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [isStarted, extendedEndTime, task.end_date, task, onTimeExpired, calculateTimeLeft, formatTime, isExpired, calculateProgress])

  // 重置文案索引当状态改变时
  useEffect(() => {
    setCurrentMessageIndex(0)
  }, [isExpired])

  // 文案轮播定时器
  useEffect(() => {
    if (!isStarted) return

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        const messages = isExpired ? overtimeMessages : encouragingMessages
        return (prev + 1) % messages.length
      })
    }, 5000) // 每5秒切换一次

    return () => clearInterval(messageInterval)
  }, [isStarted, isExpired])

  const handleStart = () => {
    onTaskStart(task)
  }

  const handleEnd = () => {
    onTaskEnd(task)
  }

  // Don't show anything for completed tasks
  if (isCompleted) {
    return null
  }

  // For display only mode, only show countdown for started tasks
  if (displayOnly) {
    if (!isStarted) return null
    
    // 计算植物生长的状态
    const growthProgress = progress // 0-1的进度
    const growthStage = isExpired ? 'wilting' : 'growing' // 超时时枯萎
    
    // 植物各部分的生长高度和透明度
    const stemHeight = Math.max(growthProgress * 20, 2) // 茎干高度 2-20px
    const leaf1Scale = Math.min(growthProgress * 2, 1) // 第一片叶子
    const leaf2Scale = Math.min(Math.max((growthProgress - 0.3) * 2, 0), 1) // 第二片叶子
    const leaf3Scale = Math.min(Math.max((growthProgress - 0.6) * 2, 0), 1) // 第三片叶子
    const flowerScale = Math.min(Math.max((growthProgress - 0.8) * 3, 0), 1) // 花朵
    
    // 获取当前显示的文案
    const currentMessages = isExpired ? overtimeMessages : encouragingMessages
    const currentMessage = currentMessages[currentMessageIndex]

    return (
      <div className="relative w-20 h-20 flex flex-col items-center justify-end mt-2">
        {/* 土壤基底 */}
        <div className="absolute bottom-0 w-16 h-2 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-b-lg opacity-80"></div>
        
        {/* 植物生长SVG */}
        <svg width="80" height="48" viewBox="0 0 80 48" className="absolute">
          {/* 茎干 */}
          <rect
            x="39"
            y={48 - stemHeight - 2}
            width="2"
            height={stemHeight}
            fill="url(#stemGradient)"
            opacity={growthStage === 'wilting' ? 0.6 : 1}
            className="transition-all duration-1000 ease-out"
            style={{
              transformOrigin: '40px 46px',
              animation: growthStage === 'growing' ? 'gentleSway 3s ease-in-out infinite' : 'none'
            }}
          />
          
          {/* 第一片叶子 (左侧) */}
          <ellipse
            cx="32"
            cy={48 - stemHeight * 0.3 - 2}
            rx={4 * leaf1Scale}
            ry={2 * leaf1Scale}
            fill="url(#leafGradient)"
            opacity={growthStage === 'wilting' ? 0.4 : leaf1Scale}
            className="transition-all duration-1000 ease-out"
            style={{
              transformOrigin: '36px ' + (48 - stemHeight * 0.3 - 2) + 'px',
              animation: leaf1Scale > 0 && growthStage === 'growing' ? 'leafRustle 4s ease-in-out infinite' : 'none'
            }}
          />
          
          {/* 第二片叶子 (右侧) */}
          <ellipse
            cx="48"
            cy={48 - stemHeight * 0.6 - 2}
            rx={4 * leaf2Scale}
            ry={2 * leaf2Scale}
            fill="url(#leafGradient)"
            opacity={growthStage === 'wilting' ? 0.4 : leaf2Scale}
            className="transition-all duration-1000 ease-out"
            style={{
              transformOrigin: '44px ' + (48 - stemHeight * 0.6 - 2) + 'px',
              animation: leaf2Scale > 0 && growthStage === 'growing' ? 'leafRustle 4s ease-in-out infinite 0.5s' : 'none'
            }}
          />
          
          {/* 第三片叶子 (左上) */}
          <ellipse
            cx="34"
            cy={48 - stemHeight * 0.8 - 2}
            rx={3.5 * leaf3Scale}
            ry={2 * leaf3Scale}
            fill="url(#leafGradient)"
            opacity={growthStage === 'wilting' ? 0.4 : leaf3Scale}
            className="transition-all duration-1000 ease-out"
            style={{
              transformOrigin: '37px ' + (48 - stemHeight * 0.8 - 2) + 'px',
              animation: leaf3Scale > 0 && growthStage === 'growing' ? 'leafRustle 4s ease-in-out infinite 1s' : 'none'
            }}
          />
          
          {/* 花朵 */}
          {flowerScale > 0 && (
            <g transform={`translate(40, ${48 - stemHeight - 8}) scale(${flowerScale})`}>
              {/* 花瓣 */}
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <ellipse
                  key={`petal-${i}`}
                  cx={3 * Math.cos((angle * Math.PI) / 180)}
                  cy={3 * Math.sin((angle * Math.PI) / 180)}
                  rx="2"
                  ry="4"
                  fill={growthStage === 'wilting' ? "#dc2626" : "#ec4899"}
                  opacity={growthStage === 'wilting' ? 0.6 : 0.9}
                  transform={`rotate(${angle})`}
                  style={{
                    animation: growthStage === 'growing' ? 'petalGlow 2s ease-in-out infinite' : 'none'
                  }}
                />
              ))}
              {/* 花心 */}
              <circle
                cx="0"
                cy="0"
                r="1.5"
                fill={growthStage === 'wilting' ? "#fbbf24" : "#fbbf24"}
                opacity={growthStage === 'wilting' ? 0.7 : 1}
                style={{
                  animation: growthStage === 'growing' ? 'centerPulse 1.5s ease-in-out infinite' : 'none'
                }}
              />
            </g>
          )}
          
          {/* 生长光效 */}
          {growthStage === 'growing' && (
            <circle
              cx="40"
              cy="24"
              r="15"
              fill="none"
              stroke="url(#growthAura)"
              strokeWidth="1"
              opacity="0.3"
              className="animate-pulse"
            />
          )}
          
          {/* 超时枯萎效果 */}
          {isExpired && (
            <g>
              {/* 枯萎粒子 */}
              {[...Array(5)].map((_, i) => (
                <circle
                  key={`wilt-${i}`}
                  cx={35 + i * 2}
                  cy={42 - i}
                  r="0.5"
                  fill="#92400e"
                  opacity="0.6"
                  className="animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </g>
          )}
          
          {/* 渐变定义 */}
          <defs>
            <linearGradient id="stemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={growthStage === 'wilting' ? "#92400e" : "#22c55e"} />
              <stop offset="50%" stopColor={growthStage === 'wilting' ? "#a3a3a3" : "#16a34a"} />
              <stop offset="100%" stopColor={growthStage === 'wilting' ? "#525252" : "#15803d"} />
            </linearGradient>
            
            <radialGradient id="leafGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor={growthStage === 'wilting' ? "#fbbf24" : "#4ade80"} />
              <stop offset="50%" stopColor={growthStage === 'wilting' ? "#f59e0b" : "#22c55e"} />
              <stop offset="100%" stopColor={growthStage === 'wilting' ? "#92400e" : "#16a34a"} />
            </radialGradient>
            
            <radialGradient id="growthAura" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#16a34a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#15803d" stopOpacity="0.1" />
            </radialGradient>
          </defs>
        </svg>
        
        {/* 全局CSS样式 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes gentleSway {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(1deg); }
              75% { transform: rotate(-1deg); }
            }
            @keyframes leafRustle {
              0%, 100% { transform: rotate(0deg) scale(1); }
              25% { transform: rotate(2deg) scale(1.05); }
              75% { transform: rotate(-2deg) scale(0.98); }
            }
            @keyframes petalGlow {
              0%, 100% { filter: brightness(1); }
              50% { filter: brightness(1.2) drop-shadow(0 0 3px #ec4899); }
            }
            @keyframes centerPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.2); }
            }
            @keyframes messageSlideIn {
              0% { opacity: 0; transform: translateY(8px) scale(0.95); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes messageSlideOut {
              0% { opacity: 1; transform: translateY(0) scale(1); }
              100% { opacity: 0; transform: translateY(-8px) scale(0.95); }
            }
          `
        }} />

        {/* 温暖鼓励文案 */}
        <div 
          key={currentMessageIndex} // 强制重新渲染以触发动画
          className="absolute -bottom-6 left-10 transform -translate-x-1/2 text-center text-xs font-medium"
          style={{
            animation: 'messageSlideIn 0.8s ease-out forwards',
            fontSize: '9px',
            lineHeight: '1.1',
            color: isExpired ? '#dc2626' : '#7c3aed',
            width: '120px'
          }}
        >
          {currentMessage}
        </div>
      </div>
    )
  }

  // Show Start button for not started tasks
  if (!isStarted) {
    return (
      <button
        onClick={handleStart}
        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium"
      >
        Start Task
      </button>
    )
  }

  // Show countdown and End button for started tasks
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-mono text-purple-700 bg-purple-100 px-2 py-1 rounded">
        {timeLeft}
      </div>
      <button
        onClick={handleEnd}
        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium"
      >
        End Task
      </button>
    </div>
  )
}