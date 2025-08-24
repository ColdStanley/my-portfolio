import crypto from "crypto"

function getMixinKey(orig: string) {
  // 固定顺序下标
  const mixinKeyEncTab = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
    27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
    37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
    22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52]
  let str = ""
  mixinKeyEncTab.forEach(i => {
    str += orig[i]
  })
  return str.slice(0, 32)
}

export function encWbi(params: Record<string, any>, imgKey: string, subKey: string) {
  const mixinKey = getMixinKey(imgKey + subKey)
  const currTime = Math.floor(Date.now() / 1000)
  const query = { ...params, wts: currTime }

  // 按 key 排序 & 过滤特殊符号
  const querystring = Object.keys(query)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(query[k].toString().replace(/[!'()*]/g, ""))}`)
    .join("&")

  const wbiSign = crypto.createHash("md5").update(querystring + mixinKey).digest("hex")

  return { query: querystring + "&w_rid=" + wbiSign }
}

// 缓存WBI keys
let wbiKeysCache: { imgKey: string; subKey: string; timestamp: number } | null = null
const WBI_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时

export async function getWbiKeys(): Promise<{ imgKey: string; subKey: string }> {
  // 检查缓存是否有效
  if (wbiKeysCache && Date.now() - wbiKeysCache.timestamp < WBI_CACHE_DURATION) {
    return { imgKey: wbiKeysCache.imgKey, subKey: wbiKeysCache.subKey }
  }

  try {
    const response = await fetch('https://api.bilibili.com/x/web-interface/nav', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/'
      }
    })
    
    const data = await response.json()
    
    if (data.code !== 0) {
      throw new Error(`Failed to get WBI keys: ${data.message}`)
    }

    const imgUrl = data.data.wbi_img.img_url
    const subUrl = data.data.wbi_img.sub_url
    
    // 提取key部分（去掉URL前缀和后缀）
    const imgKey = imgUrl.substring(imgUrl.lastIndexOf('/') + 1).split('.')[0]
    const subKey = subUrl.substring(subUrl.lastIndexOf('/') + 1).split('.')[0]
    
    // 更新缓存
    wbiKeysCache = {
      imgKey,
      subKey,
      timestamp: Date.now()
    }
    
    console.log('WBI keys updated:', { imgKey, subKey })
    
    return { imgKey, subKey }
    
  } catch (error) {
    console.error('Failed to fetch WBI keys:', error)
    // 如果获取失败且有旧缓存，使用旧缓存
    if (wbiKeysCache) {
      console.log('Using cached WBI keys due to fetch failure')
      return { imgKey: wbiKeysCache.imgKey, subKey: wbiKeysCache.subKey }
    }
    throw error
  }
}