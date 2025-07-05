// src/app/job-application/utils/deepseekEmbedding.ts

const API_URL = 'https://my-portfolio-rlb6.onrender.com/generate-embedding'

/**
 * 获取单条文本的 embedding 向量
 * @param input 要编码的文本内容
 * @returns 向量数组（float[]）或 null
 */
export async function getSingleEmbedding(input: string): Promise<number[] | null> {
  if (!input) return null

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  })

  const data = await res.json()

  if (!res.ok || !data?.embedding) {
    console.error('❌ 获取单条向量失败:', data)
    return null
  }

  return data.embedding
}

/**
 * 批量获取多个文本的 embedding 向量（当前不支持，保留原结构）
 * @param inputs 文本数组
 * @returns 向量数组（每条对应一个文本）
 */
export async function getBatchEmbeddings(inputs: string[]): Promise<number[][]> {
  console.warn('⚠️ 当前部署仅支持单条 embedding，如需批量请扩展后端支持')
  const results: number[][] = []

  for (const input of inputs) {
    const vec = await getSingleEmbedding(input)
    if (vec) results.push(vec)
  }

  return results
}
