import { supabase } from '@/lib/supabaseClient'

export interface MatchResult {
  jdSentence: string
  bestMatch: string
  similarity: number
  contentType: string  // ✅ 新增字段
}

/**
 * 计算余弦相似度
 */
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return dot / (magA * magB)
}

/**
 * JD 句子级别向量匹配分析（带 contentType）
 * @param jdSentences 本地状态中的 JD 句子数组（含 embedding）
 * @param userId 当前用户 ID（用于 Supabase 查询）
 */
export async function matchJDWithResumeSentences(
  jdSentences: { sentence: string; embedding: number[] }[],
  userId: string
): Promise<MatchResult[]> {
  const { data, error } = await supabase
    .from('cv_vector_data')
    .select('sentence_embeddings, content_type')
    .eq('user_id', userId)

  if (error || !data) {
    console.error('❌ Failed to fetch sentence embeddings from Supabase:', error)
    return []
  }

  const allResumeSentences: {
    sentence: string
    embedding: number[]
    contentType: string
  }[] = []

  for (const row of data) {
    const se = row.sentence_embeddings
    const type = row.content_type

    if (!se?.sentences || !se?.embeddings) continue

    for (let i = 0; i < se.sentences.length; i++) {
      const s = se.sentences[i]
      const emb = se.embeddings[i]
      if (s && Array.isArray(emb)) {
        allResumeSentences.push({ sentence: s, embedding: emb, contentType: type || 'unknown' })
      }
    }
  }

  if (allResumeSentences.length === 0) {
    console.warn('⚠️ No resume sentences available for matching')
    return []
  }

  const results: MatchResult[] = []

  for (const jdItem of jdSentences) {
    let bestMatch = ''
    let bestScore = -1
    let bestType = 'unknown'

    for (const resumeItem of allResumeSentences) {
      const score = cosineSimilarity(jdItem.embedding, resumeItem.embedding)
      if (score > bestScore) {
        bestScore = score
        bestMatch = resumeItem.sentence
        bestType = resumeItem.contentType
      }
    }

    results.push({
      jdSentence: jdItem.sentence,
      bestMatch: bestMatch || '[No matching sentence found]',
      similarity: bestScore >= 0 ? bestScore : 0,
      contentType: bestType,
    })
  }

  return results
}
