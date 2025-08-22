import HeroImageGrid from '@/components/HeroImageGrid'
import LatestSection from '@/components/LatestHighlightCard'
import LogoCarouselRow from '@/components/LogoCarouselRow'
import HomeCardsSection from '@/components/HomeCardsSection'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'
import PageTransition from '@/components/PageTransition'
import { CardItem, HighlightItem } from '@/types/common'

export const metadata = {
  title: "StanleyHi",
  description: "Discover Stanley's personal projects in technology, learning, and life stories, presented with a touch of creativity and music."
}

// 从服务器端获取Notion数据的函数
async function getNotionData() {
  try {
    // 构建 baseUrl - 优先使用环境变量，开发环境降级处理
    let baseUrl = ''
    
    if (process.env.NEXTAUTH_URL) {
      baseUrl = process.env.NEXTAUTH_URL
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    } else {
      // 开发环境降级：直接使用相对路径或跳过 fetch
      console.warn('No base URL configured, using fallback data')
      return {
        cards: [],
        highlights: []
      }
    }
    
    // 添加超时和重试机制
    const fetchWithTimeout = async (url: string, options: any = {}) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        return response
      } catch (error) {
        clearTimeout(timeoutId)
        throw error
      }
    }
    
    // 获取cards数据
    const cardsResponse = await fetchWithTimeout(`${baseUrl}/api/notion?pageId=cards`, {
      next: { 
        revalidate: 1800, // 30分钟重新验证
        tags: ['homepage-cards'] // 标签用于按需重新验证
      }
    })
    
    if (!cardsResponse.ok) {
      throw new Error(`Failed to fetch cards: ${cardsResponse.status}`)
    }
    
    const cardsResult = await cardsResponse.json()
    const cards: CardItem[] = cardsResult.data || []
    
    // 获取highlights数据
    const highlightsResponse = await fetchWithTimeout(`${baseUrl}/api/notion?pageId=home-latest`, {
      next: { 
        revalidate: 1800, // 30分钟重新验证
        tags: ['homepage-highlights'] // 标签用于按需重新验证
      }
    })
    
    if (!highlightsResponse.ok) {
      throw new Error(`Failed to fetch highlights: ${highlightsResponse.status}`)
    }
    
    const highlightsResult = await highlightsResponse.json()
    const allHighlights: HighlightItem[] = highlightsResult.data || []
    
    // 过滤highlights
    const highlights = allHighlights
      .filter((item: any) => item?.status === 'Published' && item?.visibleOnSite === true)
      .sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999))
    
    return {
      cards: cards.filter((item: CardItem) => item.section === 'Cards' && item.visibleOnSite === true),
      highlights
    }
  } catch (error) {
    console.error('Error fetching Notion data:', error)
    // 返回空数据而不是抛出错误，确保页面能正常加载
    return {
      cards: [],
      highlights: []
    }
  }
}

export default async function HomePage() {
  const { cards, highlights } = await getNotionData()
  
  return (
    <>
      <NewNavbar />
      <PageTransition>
        <main className="min-h-screen bg-white pt-1">
        {/* 顶部内容区域：Hero + Latest */}
        <section className="flex flex-col gap-8 items-start max-w-7xl px-6 mx-auto">
          <HeroImageGrid />
          <LatestSection initialHighlights={highlights} />
        </section>

        {/* 分割线 */}
        <hr className="my-8 border-t border-gray-200 max-w-6xl mx-auto" />

        {/* Logo 滚动行 */}
        <LogoCarouselRow />

        {/* 主体内容区 */}
        <HomeCardsSection initialCards={cards} />
      </main>
      <FooterSection />
      </PageTransition>
    </>
  )
}
