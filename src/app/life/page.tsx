import LifeCardSection from '@/components/LifeCardSection'

export default function LifePage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 bg-gray-50 dark:bg-background">
      <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-300 text-center mb-12">
        Life
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 max-w-7xl mx-auto">
        {/* 左侧：卡片 */}
        <LifeCardSection />

        {/* 右侧：占位 */}
        <aside className="hidden lg:block">
          <div className="h-full w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm italic">
            Coming soon: Reflections, Stories, Audio Diary, and More...
          </div>
        </aside>
      </div>
    </main>
  )
}
