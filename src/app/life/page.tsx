import LifeCardSection from '@/components/LifeCardSection'
import ComingSoonCard from '@/components/ComingSoonCard'


export default function LifePage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 bg-gray-50 dark:bg-background">
      {/* ✨ 增强版页面标题区域 */}
      <section className="text-center mb-14 max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold text-purple-700 dark:text-purple-300 mb-4 tracking-tight">
          Life
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-3">
          Small moments, stories, and experiments.
        </p>
        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed px-2">
          A space for reflection and curiosity — from quiet routines to unexpected ideas.
          Here I share things that may not be polished, but they are real.
          📓✨
        </p>
      </section>

      {/* 主体内容：左卡片，右留白 */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 max-w-7xl mx-auto">
        <LifeCardSection />

        <aside className="hidden lg:block">
                <ComingSoonCard />
              </aside>
      </div>
    </main>
  )
}
