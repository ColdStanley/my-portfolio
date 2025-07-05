// src/app/job-application/utils/deepseekSupabaseUploader.ts

import { supabase } from '@/lib/supabaseClient'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const EMBEDDING_MODEL = 'deepseek-embedding'

interface UploadContent {
  userId: string
  work: any[]
  project: any[]
  education: any[]
  award: any[]
  skills: string[]
}

interface EmbeddingResponse {
  data: number[][]
}

async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch('https://api.deepseek.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  })

  if (!response.ok) {
    console.error('❌ DeepSeek embedding failed:', await response.text())
    throw new Error('Failed to fetch embeddings')
  }

  const result = (await response.json()) as EmbeddingResponse
  return result.data
}

export async function uploadEmbeddingsToSupabase(data: UploadContent) {
  const rows: { content_type: string; raw_text: string; user_id: string }[] = []

  data.work.forEach((w) => {
    const raw = [w.company, w.title, w.responsibilities, w.achievements]
      .filter(Boolean)
      .join(' ')
    rows.push({ content_type: 'work', raw_text: raw, user_id: data.userId })
  })

  data.project.forEach((p) => {
    const raw = [p.title, p.description].filter(Boolean).join(' ')
    rows.push({ content_type: 'project', raw_text: raw, user_id: data.userId })
  })

  data.education.forEach((e) => {
    const raw = [e.school, e.degree, e.major, e.description]
      .filter(Boolean)
      .join(' ')
    rows.push({ content_type: 'education', raw_text: raw, user_id: data.userId })
  })

  data.award.forEach((a) => {
    const raw = [a.title, a.source, a.description].filter(Boolean).join(' ')
    rows.push({ content_type: 'award', raw_text: raw, user_id: data.userId })
  })

  data.skills.forEach((s) => {
    if (s && s.trim()) {
      rows.push({ content_type: 'skill', raw_text: s.trim(), user_id: data.userId })
    }
  })

  if (rows.length === 0) {
    console.warn('⚠️ No content to upload')
    return
  }

  const embeddings = await getEmbeddings(rows.map((r) => r.raw_text))

  const insertPayload = rows.map((r, idx) => ({
    user_id: r.user_id,
    content_type: r.content_type,
    raw_text: r.raw_text,
    embedding: embeddings[idx],
  }))

  const { error } = await supabase.from('cv_vector_data').insert(insertPayload)

  if (error) {
    console.error('❌ Supabase insert error:', error)
    throw new Error('Failed to upload embeddings to Supabase')
  }

  console.log(`✅ Uploaded ${insertPayload.length} embeddings to Supabase`)
}
