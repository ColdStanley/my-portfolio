'use server'

import { getSingleEmbedding } from './deepseekEmbedding'

/**
 * 将文本按句拆分并生成每句的 embedding
 * 返回句子数组和对应的 embedding 向量数组
 */
export async function splitAndEmbedSentences(text: string): Promise<{
  sentences: string[]
  embeddings: number[][]
}> {
  const sentences = text
    .split(/(?<=[.!?\u3002\uff01\uff1f])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter((s) => s.split(/\s+/).length >= 5) // ✅ 改为：单词数不少于 5

  const embeddings: number[][] = []

  for (const sentence of sentences) {
    const emb = await getSingleEmbedding(sentence)
    if (emb) embeddings.push(emb)
  }

  return { sentences, embeddings }
}
