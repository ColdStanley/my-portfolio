'use client'

import PicGameHeader from '@/components/picgame/PicGameHeader'
import PicGame02 from './PicGame02'
import PicGame06 from './PicGame06'
import PicGame07 from './PicGame07'
import PicGame08 from './PicGame08'
import PicGame09 from './PicGame09'
import PicGame10 from './PicGame10'
import PicGame11 from './PicGame11'
import PicGameApology01 from './PicGameApology01'
import PicGameThanks01HappyBirthday from './PicGameThanks01HappyBirthday'
import PicGameBlessing01Graduation from './PicGameBlessing01Graduation'
import PicGameLove02RealCouple from './PicGameLove02RealCouple'
import PicGameLove03RealCoupleWine from './PicGameLove03RealCoupleWine'
import PicGameLove01AnimateAnon from './PicGameLove01AnimateAnon'
import PicGameLove04AnimateMitsumi from './PicGameLove04AnimateMitsumi'
import PicGameLove05AnimateFrieren from './PicGameLove05AnimateFrieren'
import PicGameApology02 from './PicGameApology02'

export default function PicGameGalleryPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 md:px-10 bg-gradient-to-b from-white to-purple-50 animate-fade-in scroll-smooth">
      {/* 顶部 Header 区块 */}
      <PicGameHeader />

      {/* 顶部锚点导航 */}
      <div className="text-center text-sm text-purple-600 space-x-6 mt-4 mb-10 font-medium">
        <a href="#love" className="hover:underline transition-all duration-200">❤️ Love</a>
        <a href="#sorry" className="hover:underline transition-all duration-200">🙏 Sorry</a>
        <a href="#blessing" className="hover:underline transition-all duration-200">✨ Blessing</a>
        <a href="#thanks" className="hover:underline transition-all duration-200">💜 Thanks</a>
      </div>

      {/* 分区展示区域 */}
      <section id="love" className="scroll-mt-24 py-8 mb-14 bg-white/70 rounded-xl shadow-inner backdrop-blur-md px-6 max-w-6xl mx-auto">
        <TitleBlock emoji="❤️" title="Say Love" desc="When your heart is full, let a catgirl or Miku say it for you." />
        <CardGroup components={[PicGameLove01AnimateAnon, PicGameLove04AnimateMitsumi, PicGameLove05AnimateFrieren, PicGame10, PicGameLove03RealCoupleWine, PicGameLove02RealCouple, PicGame02]} />
      </section>

      <section id="sorry" className="scroll-mt-24 py-8 mb-14 bg-purple-50/80 rounded-xl shadow-inner backdrop-blur-md px-6 max-w-6xl mx-auto">
        <TitleBlock emoji="🙏" title="Say Sorry" desc="Some apologies are better said with pixels than words." />
        <CardGroup components={[ PicGameApology01, PicGameApology02]} />
      </section>

      <section id="blessing" className="scroll-mt-24 py-8 mb-14 bg-indigo-50/70 rounded-xl shadow-inner backdrop-blur-md px-6 max-w-6xl mx-auto">
        <TitleBlock emoji="✨" title="Send Blessings" desc="Whisper magic, courage, and warmth into someone's world." />
        <CardGroup components={[PicGame06, PicGameBlessing01Graduation, PicGame07]} />
      </section>

      <section id="thanks" className="scroll-mt-24 py-8 mb-14 bg-orange-50/60 rounded-xl shadow-inner backdrop-blur-md px-6 max-w-6xl mx-auto">
        <TitleBlock emoji="💜" title="Say Thanks" desc="A little appreciation goes a long way—let your gratitude shine." />
        <CardGroup components={[PicGame08, PicGameThanks01HappyBirthday, PicGame09, PicGame11]} />
      </section>

      {/* 全局动效样式 */}
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

// ✅ 情绪标题组件
function TitleBlock({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
        <span className="text-3xl">{emoji}</span>
        <span className="animate-pulse">{title}</span>
      </h2>
      <p className="text-gray-600 italic mt-1">{desc}</p>
    </div>
  )
}

// ✅ 柔和暖感 hover 效果组件
function CardGroup({ components }: { components: React.ElementType[] }) {
  return (
    <div className="columns-1 sm:columns-1 md:columns-2 gap-6">
      {components.map((Component, index) => (
        <div
          key={index}
          className="mb-6 break-inside-avoid animate-slide-up transition-all ease-in-out duration-300 transform hover:-translate-y-[2px] hover:scale-[1.01] hover:shadow-lg hover:bg-orange-50/40 rounded-xl"
        >
          <Component />
        </div>
      ))}
    </div>
  )
}
