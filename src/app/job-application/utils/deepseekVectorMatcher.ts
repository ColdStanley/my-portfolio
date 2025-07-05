import { supabase } from '@/lib/supabaseClient'

const DEEPSEEK_EMBEDDING_URL = 'https://api.deepseek.com/v1/embeddings'
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''

interface RawVectorItem {
  id: string
  user_id: string
  content_type: string
  raw_text: string
  embedding: number[]
}

interface MatchDetail {
  content: string
  similarity: number
  contentType: string
}

export interface VectorMatchResult {
  matches: MatchDetail[]
  overallScore: number
}

/**
 * 使用 DeepSeek API 将 JD 编码为 embedding 向量
 */
async function getEmbeddingFromJD(jdText: string): Promise<number[]> {
  const res = await fetch(DEEPSEEK_EMBEDDING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      input: [jdText],
      model: 'deepseek-embedding',
    }),
  })

  if (!res.ok) {
    throw new Error('❌ Failed to get embedding from DeepSeek')
  }

  const data = await res.json()
  return data.data[0].embedding
}

/**
 * 计算余弦相似度
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * 向量匹配主函数：给定 JD，返回相似度 Top K 的内容（仅限当前用户）
 */
export async function matchJDWithVector(
  jdText: string,
  topK = 20,
  userId?: string
): Promise<VectorMatchResult> {
  const jdEmbedding = await getEmbeddingFromJD(jdText)

  const query = supabase
    .from('cv_vector_data')
    .select('id, user_id, content_type, raw_text, embedding')

  if (userId) {
    query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error || !data) {
    throw new Error('❌ Failed to load vector data from Supabase')
  }

  const matches: MatchDetail[] = (data as RawVectorItem[]).map((item) => {
    const similarity = cosineSimilarity(jdEmbedding, item.embedding)
    return {
      content: item.raw_text,
      similarity: parseFloat(similarity.toFixed(4)),
      contentType: item.content_type,
    }
  })

  const topMatches = matches.sort((a, b) => b.similarity - a.similarity).slice(0, topK)

  const overallScore =
    topMatches.length > 0
      ? parseFloat(
          (
            topMatches.reduce((sum, m) => sum + m.similarity, 0) / topMatches.length
          ).toFixed(4)
        )
      : 0

  return {
    matches: topMatches,
    overallScore,
  }
}
