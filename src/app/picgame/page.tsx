'use client'

import PicGameHeader from '@/components/picgame/PicGameHeader'
import PicGame01 from './PicGame01'
import PicGame02 from './PicGame02'
import PicGame03 from './PicGame03'
import PicGame04 from './PicGame04'
import PicGame05 from './PicGame05'
import PicGame06 from './PicGame06'
import PicGame07 from './PicGame07'
import PicGame08 from './PicGame08'
import PicGame09 from './PicGame09'
import PicGame10 from './PicGame10'
import PicGame11 from './PicGame11'

export default function PicGameGalleryPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-10 bg-gradient-to-b from-white to-purple-50">
      {/* ✅ 顶部 Header 区块 */}
      <PicGameHeader />

      {/* ✅ 卡片展示区域：瀑布流布局 + 动画包装 */}
      <div className="columns-1 md:columns-2 gap-6 max-w-6xl mx-auto [animation:fade-in_0.6s_ease-in-out]">
        <div className="mb-6 break-inside-avoid"><PicGame01 /></div>
      
        <div className="mb-6 break-inside-avoid"><PicGame03 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame04 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame05 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame06 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame07 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame08 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame09 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame10 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame11 /></div>
        <div className="mb-6 break-inside-avoid"><PicGame02 /></div>
      </div>
    </div>
  )
}