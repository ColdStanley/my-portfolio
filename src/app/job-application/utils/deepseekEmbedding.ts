// src/app/job-application/utils/deepseekEmbedding.ts

const API_URL = 'https://api.openai.com/v1/embeddings'
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''

/**
 * Generate a short hash for the input text (used as cache key).
 */
function hashText(text: string): string {
  return btoa(unescape(encodeURIComponent(text))).slice(0, 300)
}

/**
 * Safe get from localStorage (browser only)
 */
function getFromLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Safe set to localStorage (browser only)
 */
function setToLocalStorage(key: string, value: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    console.warn('⚠️ Failed to write to localStorage:', e)
  }
}

/**
 * Get a single text embedding from OpenAI, with localStorage caching.
 * @param input The input string
 * @returns Embedding vector or null
 */
export async function getSingleEmbedding(input: string): Promise<number[] | null> {
  if (!input) return null

  const cacheKey = `jd_embedding_${hashText(input)}`
  const cached = getFromLocalStorage(cacheKey)

  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && typeof parsed[0] === 'number') {
        console.log('✅ Using cached JD embedding')
        return parsed
      }
    } catch (e) {
      console.warn('⚠️ Failed to parse cached JD embedding:', e)
    }
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input,
      model: 'text-embedding-3-small',
    }),
  })

  const data = await res.json()

  if (!res.ok || !data?.data?.[0]?.embedding) {
    console.error('❌ Failed to fetch embedding:', data)
    return null
  }

  const embedding = data.data[0].embedding

  setToLocalStorage(cacheKey, JSON.stringify(embedding))

  return embedding
}

/**
 * Batch embedding (currently not supported, fallback to single)
 */
export async function getBatchEmbeddings(inputs: string[]): Promise<number[][]> {
  console.warn('⚠️ Batch embedding not supported. Falling back to single calls.')
  const results: number[][] = []

  for (const input of inputs) {
    const vec = await getSingleEmbedding(input)
    if (vec) results.push(vec)
  }

  return results
}
