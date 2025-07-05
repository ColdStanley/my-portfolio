// src/app/job-application/utils/deepseekEmbedding.ts

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = 'https://api.deepseek.com/v1/embeddings'
const MODEL_NAME = 'deepseek-embedding'

if (!API_KEY) {
  console.warn('⚠️ 缺少 DeepSeek API Key，请在 .env.local 中配置 DEEPSEEK_API_KEY')
}

/**
 * 获取单条文本的 embedding 向量
 * @param input 要编码的文本内容
 * @returns 向量数组（float[]）或 null
 */
export async function getSingleEmbedding(input: string): Promise<number[] | null> {
  if (!API_KEY || !input) return null

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      input,
    }),
  })

  const data = await res.json()

  if (!res.ok || !data?.data?.[0]?.embedding) {
    console.error('❌ 获取单条向量失败:', data)
    return null
  }

  return data.data[0].embedding
}

/**
 * 批量获取多个文本的 embedding 向量
 * @param inputs 文本数组
 * @returns 向量数组（每条对应一个文本）
 */
export async function getBatchEmbeddings(inputs: string[]): Promise<number[][]> {
  if (!API_KEY || !Array.isArray(inputs) || inputs.length === 0) return []

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      input: inputs,
    }),
  })

  const data = await res.json()

  if (!res.ok || !data?.data?.length) {
    console.error('❌ 批量获取向量失败:', data)
    return []
  }

  return data.data.map((item: any) => item.embedding)
}
