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
    <div className="min-h-screen py-12 px-4 sm:px-6 md:px-10 bg-gradient-to-b from-white to-purple-50 animate-fade-in">
      {/* ✅ 顶部 Header 区块 */}
      <PicGameHeader />

      {/* ✅ 卡片展示区域：瀑布流布局 + 动画 + hover 效果 */}
      <div className="columns-1 sm:columns-1 md:columns-2 gap-6 max-w-6xl mx-auto">
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame01 /></div>
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame03 /></div>
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame04 /></div>
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame05 /></div>
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame06 /></div>
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame07 /></div>
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame08 /></div>
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame09 /></div>
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame10 /></div>
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame11 /></div>
        <div className="mb-6 break-inside-avoid animate-slide-up hover:scale-[1.01] hover:shadow-lg transition-all duration-300"><PicGame02 /></div>
      </div>

      {/* ✅ 自定义动画样式 */}
      <style jsx global>{`
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
      `}</style>
    </div>
  )
}
