import { NextRequest, NextResponse } from 'next/server'
import { encWbi } from '@/utils/bilibiliWbi'

// ====== 内存缓存 ======
const cache = new Map<string, { timestamp: number; data: any }>()
const CACHE_TTL = 60 * 1000 // 60秒

// ====== 成功模式学习 ======
const successPatterns = new Map<string, SuccessPattern>()

const saveSuccessPattern = (mid: string, endpoint: string, delay: number, userAgent: string) => {
  successPatterns.set(mid, {
    lastSuccessTime: Date.now(),
    endpoint,
    delayUsed: delay,
    userAgent
  })
  console.log(`✅ Success pattern saved for ${mid}: ${endpoint} with ${delay}ms delay`)
}

const getSuccessPattern = (mid: string): SuccessPattern | null => {
  const pattern = successPatterns.get(mid)
  if (pattern && Date.now() - pattern.lastSuccessTime < 24 * 60 * 60 * 1000) { // 24小时内有效
    return pattern
  }
  return null
}

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 随机User-Agent池
const getUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]
  return userAgents[Math.floor(Math.random() * userAgents.length)]
}

// 成功模式记录
interface SuccessPattern {
  lastSuccessTime: number
  endpoint: string
  delayUsed: number
  userAgent: string
}

// 智能重试策略 - 指数退避 + 随机延迟
async function fetchWithRetry(url: string, retries = 3, baseDelay = 20000) {
  const delayProgression = [baseDelay, baseDelay * 2, baseDelay * 4] // 20s, 40s, 80s
  
  for (let i = 0; i < retries; i++) {
    try {
      if (i > 0) {
        // 指数退避 + 随机延迟 (±50%)
        const baseWait = delayProgression[i - 1] || delayProgression[delayProgression.length - 1]
        const randomFactor = 0.5 + Math.random() // 0.5-1.5倍
        const actualDelay = Math.floor(baseWait * randomFactor)
        
        console.log(`Retry ${i}, waiting ${actualDelay}ms (${Math.round(actualDelay/1000)}s)...`)
        await delay(actualDelay)
      }
      
      const userAgent = getUserAgent()
      console.log(`Using User-Agent: ${userAgent.split(' ')[0]}...`)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Referer': 'https://www.bilibili.com/',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log(`API Response Code: ${data.code}, Message: ${data.message || 'success'}`)
      
      // 特殊错误码处理
      if (data.code === -799) {
        console.log('Rate limit hit, will retry with longer delay...')
        continue
      }
      
      if (data.code === -403) {
        throw new Error('访问被拒绝，可能需要登录或该UP主设置了隐私保护')
      }
      
      if (data.code !== 0) {
        throw new Error(`B站API错误: ${data.message || data.code}`)
      }
      
      return data
      
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error)
      if (i === retries - 1) {
        throw error
      }
    }
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mid = searchParams.get('mid')
  
  if (!mid) {
    return NextResponse.json({ error: 'Missing mid parameter' }, { status: 400 })
  }

  // ====== 缓存检查 ======
  const cached = cache.get(mid)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`⚡ Returning cached result for mid=${mid}`)
    return NextResponse.json(cached.data)
  }
  
  try {
    // 获取UP主基本信息
    const userInfoUrl = `https://api.bilibili.com/x/space/acc/info?mid=${mid}`
    const userInfo = await fetchWithRetry(userInfoUrl)
    
    // 固定 WBI key（每天更新一次）
    const imgKey = "7cd084941338484aae1ad9425b84077c"
    const subKey = "4932caff0ff746eab6f01bf08b70ac45"
    
    // ====== 智能端点选择：优先使用成功模式 ======
    const successPattern = getSuccessPattern(mid)
    
    const videoEndpoints = [
      {
        name: 'Fallback-1',
        url: () => `https://api.bilibili.com/x/space/arc/search?mid=${mid}&ps=25&pn=1&order=pubdate`
      },
      {
        name: 'Fallback-2', 
        url: () => `https://api.bilibili.com/x/space/arc/search?mid=${mid}&ps=25&pn=1`
      },
      {
        name: 'WBI',
        url: () => {
          const { query } = encWbi(
            { mid, ps: 25, pn: 1, order: "pubdate" },
            imgKey,
            subKey
          )
          return `https://api.bilibili.com/x/space/wbi/arc/search?${query}`
        }
      }
    ]
    
    // 如果有成功模式，优先使用该端点
    if (successPattern) {
      console.log(`🎯 Using learned success pattern: ${successPattern.endpoint} (last success: ${new Date(successPattern.lastSuccessTime).toLocaleString()})`)
      const preferredEndpoint = videoEndpoints.find(e => e.name === successPattern.endpoint)
      if (preferredEndpoint) {
        // 将成功端点移到第一位
        const otherEndpoints = videoEndpoints.filter(e => e.name !== successPattern.endpoint)
        videoEndpoints.splice(0, videoEndpoints.length, preferredEndpoint, ...otherEndpoints)
      }
    }
    
    let videosData: any = null
    let lastError: any = null
    let successEndpoint: string = ''
    let usedDelay: number = 0
    
    for (const endpoint of videoEndpoints) {
      try {
        const url = endpoint.url()

        const startTime = Date.now()
        const data = await fetchWithRetry(url)
        usedDelay = Date.now() - startTime

        if (data) {
          videosData = data
          lastError = null
          successEndpoint = endpoint.name
          console.log(`✅ ${endpoint.name} API success!`)
          
          // 保存成功模式
          saveSuccessPattern(mid, endpoint.name, usedDelay, 'recent')
          break
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name} API failed:`, error)
        lastError = error
        continue
      }
    }
    
    if (!videosData) {
      throw new Error(`All video endpoints failed. Last error: ${lastError || 'unknown'}`)
    }
    
    // 兼容 WBI 和 Fallback 的不同返回结构
    const videoList =
      videosData?.data?.list?.vlist ||   // Fallback 返回
      videosData?.data?.list?.videos || [] // WBI 返回
    
    const result = {
      userInfo: {
        name: userInfo?.data?.name || 'Unknown',
        face: userInfo?.data?.face || '',
        fans: userInfo?.data?.follower || 0,
        following: userInfo?.data?.following || 0,
        sign: userInfo?.data?.sign || ''
      },
      videos: videoList.map((video: any) => ({
        title: video.title || '',
        description: video.description || video.desc || '',
        length: video.length || '0:00',
        play: video.play || video.stat?.view || 0,
        video_review: video.video_review || video.stat?.danmaku || 0,
        reply: video.reply || 0,
        favorite: video.favorite || 0,
        coin: video.coin || 0,
        like: video.like || 0,
        created: video.created || video.pubdate || 0,
        author: video.author || video.owner?.name || '',
        mid: video.mid || video.owner?.mid || '',
        tname: video.tname || ''
      })),
      total: videosData?.data?.page?.count || videosData?.data?.page?.total || 0,
      debug: {
        userInfoReceived: !!userInfo?.data,
        videosReceived: !!videosData?.data,
        rawUserInfo: userInfo,
        rawVideosData: videosData
      }
    }

    // 写入缓存
    cache.set(mid, { timestamp: Date.now(), data: result })
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Failed to fetch bilibili data:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch data', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
