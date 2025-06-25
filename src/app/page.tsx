import HeroImageGrid from '@/components/HeroImageGrid'
import LatestSection from '@/components/LatestHighlightCard'
import LogoCarouselRow from '@/components/LogoCarouselRow'
import HomeCardsSection from '@/components/HomeCardsSection'

export const metadata = {
  title: "StanleyHi",
  description: "Discover Stanley's personal projects in technology, learning, and life stories, presented with a touch of creativity and music."
}


export default function HomePage() {
  return (
    <main className="min-h-screen bg-white pt-1">
      {/* 顶部内容区域：Hero + Latest */}
<section className="flex flex-col gap-8 items-start max-w-7xl px-6 mx-auto">
        <HeroImageGrid />
        <LatestSection />
      </section>

      {/* 分割线 */}
      <hr className="my-8 border-t border-gray-200 max-w-6xl mx-auto" />

      {/* Logo 滚动行 */}
      <LogoCarouselRow />

      {/* 主体内容区 */}
      <HomeCardsSection />
    </main>
  )
}
