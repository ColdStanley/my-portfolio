import TechnologyCardSection from '@/components/TechnologyCardSection'
import ComingSoonCard from '@/components/ComingSoonCard'


export default function TechnologyPage() {
  return (
  <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 bg-gray-50 dark:bg-background">
    <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-300 text-center mb-12">
      Technology
    </h1>

    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 max-w-7xl mx-auto">
      {/* 左侧：卡片区域 */}
      <TechnologyCardSection />

      {/* 右侧：预留扩展 */}
      <aside className="hidden lg:block">
        <ComingSoonCard />
      </aside>
    </div>
  </main>
)

}
