'use client'

import PicGameUploadHeader from '@/components/picgame/picgame-upload/PicGameUploadHeader'
import UploadFormRow from '@/components/picgame/picgame-upload/UploadFormRow'
import QuoteSuggestionPanel from '@/components/picgame/picgame-upload/QuoteSuggestionPanel'

export default function PicGameUploadPage() {
  return (
    <div className="min-h-screen px-4 py-8 space-y-6 bg-gray-50">
      {/* 第1行：顶部 Header */}
      <PicGameUploadHeader />

      {/* 第2行：三列功能卡片 */}
      <UploadFormRow />

      {/* 第3+4行：提示词 + 可点选语句 */}
      <QuoteSuggestionPanel />

      {/* 🚧 第5行：滚动动效测试区域（调试用） */}
      
    </div>
  )
}
