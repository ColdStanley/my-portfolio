'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FeelinkTemplate {
  id: string
  name: string
  imageUrl: string
  quotes: string
  description: string
  category: string
  webUrl: string
}

interface FeelinkTemplateCardProps {
  template: FeelinkTemplate
}

export default function FeelinkTemplateCard({ template }: FeelinkTemplateCardProps) {
  const [isClicked, setIsClicked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // 计算quotes在图片内的位置
  const quotePosition = useMemo(() => {
    // 基于模板名称hash计算一个稳定的位置
    const hash = template.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    // 确保quotes显示在图片内部的安全区域
    const x = 15 + (Math.abs(hash) % 60) // 15-75% 横向位置
    const y = 15 + (Math.abs(hash >> 8) % 60) // 15-75% 纵向位置
    
    return { x, y }
  }, [template.name])

  return (
    <div className="relative w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* 图片容器 */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          src={template.imageUrl}
          alt={template.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* 加载状态 */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}
        
        {/* Quotes覆盖层 - 点击时显示 */}
        <AnimatePresence>
          {isClicked && imageLoaded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px) saturate(120%)',
                WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              }}
            >
              {/* Quotes文本 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-center max-w-[280px]"
                style={{
                  position: 'absolute',
                  left: `${quotePosition.x}%`,
                  top: `${quotePosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <p 
                  className="text-sm md:text-base font-medium leading-relaxed"
                  style={{
                    color: '#1a1a1a',
                    textShadow: '0 1px 3px rgba(255,255,255,0.8), 0 0 8px rgba(255,255,255,0.4)',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
                  }}
                >
                  {template.quotes}
                </p>
              </motion.div>
              
              {/* 关闭提示 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="absolute top-4 right-4 text-white/80 text-sm"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                点击关闭
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 点击区域 */}
        <button
          onClick={() => setIsClicked(!isClicked)}
          className="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 hover:bg-black/5"
          aria-label={`查看 ${template.name} 的quotes`}
        />
      </div>
      
      {/* 描述区域 */}
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-gray-800 mb-2 capitalize">
          {template.name.replace(/([A-Z])/g, ' $1').trim()}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {typeof template.description === 'string' 
            ? template.description 
            : template.description
          }
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-block px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full capitalize">
            {template.category}
          </span>
          <button
            onClick={() => setIsClicked(!isClicked)}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
          >
            {isClicked ? '隐藏' : '查看quotes'}
          </button>
        </div>
      </div>
    </div>
  )
}