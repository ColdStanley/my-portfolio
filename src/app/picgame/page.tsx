'use client'

import PicGameHeader from '@/components/picgame/PicGameHeader'
import PicGame01 from './PicGame01'
import PicGame02 from './PicGame02'
import PicGame03 from './PicGame03'
import PicGame04 from './PicGame04'
import PicGame05 from './PicGame05'
import PicGame06 from './PicGame06'

export default function PicGameGalleryPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-10 bg-gradient-to-b from-white to-purple-50">
      {/* ✅ 顶部 Header 区块（已保留 import 调用） */}
      <PicGameHeader />

      {/* ✅ 卡片展示区域：瀑布流布局 */}
      <div className="columns-1 md:columns-2 gap-6 max-w-6xl mx-auto">
        <div className="mb-6 break-inside-avoid"><PicGame01 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame02 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame03 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame04 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame05 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame06 /></div>
      </div>
    </div>
  )
}
