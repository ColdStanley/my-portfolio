import { supabase } from '@/lib/supabaseClient'
import { getSingleEmbedding } from './deepseekEmbedding'

interface RawVectorItem {
  id: string
  user_id: string
  content_type: string
  raw_text: string
  embedding: number[]
}

export interface MatchDetail {
  content: string
  matchedJD: string
  similarity: number
  contentType: string
}

export interface VectorMatchResult {
  matches: MatchDetail[]
  overallScore: number
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
 * 将 JD 文本按句拆分为数组（用于匹配来源追踪）
 */
function splitJDToSentences(jdText: string): string[] {
  return jdText
    .split(/(?<=[.。!?！？””])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/**
 * 主函数：匹配 JD 向量和简历向量，返回匹配结果（带来源 JD）
 */
export async function matchJDWithVector(
  jdText: string,
  topK = 20,
  userId?: string,
  embedding?: number[]
): Promise<VectorMatchResult> {
  const jdEmbedding = embedding || (await getSingleEmbedding(jdText))

  if (!jdEmbedding) {
    throw new Error('❌ 无法获取 JD 的向量')
  }

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

  const jdSentences = splitJDToSentences(jdText)
  const jdSentenceEmbeddings = await Promise.all(jdSentences.map(getSingleEmbedding))

  const matches: MatchDetail[] = (data as RawVectorItem[]).map((item) => {
    const similarity = cosineSimilarity(jdEmbedding, item.embedding)

    let bestJD = ''
    let bestSim = -1
    jdSentenceEmbeddings.forEach((sentVec, idx) => {
      if (sentVec) {
        const sim = cosineSimilarity(item.embedding, sentVec)
        if (sim > bestSim) {
          bestSim = sim
          bestJD = jdSentences[idx]
        }
      }
    })

    return {
      content: item.raw_text,
      matchedJD: bestJD,
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
