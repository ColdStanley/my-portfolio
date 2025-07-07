import { supabase } from '@/lib/supabaseClient'
import { getSingleEmbedding } from './deepseekEmbedding'
import { splitAndEmbedSentences } from './splitAndEmbedSentences'

interface UploadContent {
  userId: string
  work: any[]
  project: any[]
  education: any[]
  award: any[]
  skills: string[]
}

// 为每条数据生成唯一标识的哈希 key，用于 localStorage 缓存
function hashKey(type: string, raw: string) {
  return `embedding_cache:${type}:${btoa(unescape(encodeURIComponent(raw))).slice(0, 100)}`
}

export async function uploadEmbeddingsToSupabase(data: UploadContent) {
  const rows: { content_type: string; raw_text: string; user_id: string }[] = []

  data.work.forEach((w) => {
    const raw = [w.company, w.title, w.responsibilities, w.achievements]
      .filter(Boolean)
      .join(' ')
    if (raw.trim()) rows.push({ content_type: 'work', raw_text: raw, user_id: data.userId })
  })

  data.project.forEach((p) => {
    const raw = [p.title, p.description].filter(Boolean).join(' ')
    if (raw.trim()) rows.push({ content_type: 'project', raw_text: raw, user_id: data.userId })
  })

  data.education.forEach((e) => {
    const raw = [e.school, e.degree, e.major, e.description]
      .filter(Boolean)
      .join(' ')
    if (raw.trim()) rows.push({ content_type: 'education', raw_text: raw, user_id: data.userId })
  })

  data.award.forEach((a) => {
    const raw = [a.title, a.source, a.description].filter(Boolean).join(' ')
    if (raw.trim()) rows.push({ content_type: 'award', raw_text: raw, user_id: data.userId })
  })

  data.skills.forEach((s) => {
    const trimmed = s.trim()
    if (trimmed) {
      rows.push({ content_type: 'skill', raw_text: trimmed, user_id: data.userId })
    }
  })

  if (rows.length === 0) {
    console.warn('⚠️ No content to upload.')
    return
  }

  const insertPayload = []

  for (const row of rows) {
    const key = hashKey(row.content_type, row.raw_text)
    const existing = localStorage.getItem(key)

    if (existing === 'uploaded') {
      console.log(`ℹ️ Skipped cached: ${row.content_type} → ${row.raw_text.slice(0, 40)}...`)
      continue
    }

    const embedding = await getSingleEmbedding(row.raw_text)
    if (!embedding) {
      console.warn('⚠️ Failed to get embedding for:', row.raw_text)
      continue
    }

    // 新增：生成句子级 embedding
    const { sentences, embeddings } = await splitAndEmbedSentences(row.raw_text)

    insertPayload.push({
      user_id: row.user_id,
      content_type: row.content_type,
      raw_text: row.raw_text,
      embedding,
      sentence_embeddings: JSON.stringify({ sentences, embeddings }),
    })

    localStorage.setItem(key, 'uploaded') // ✅ 标记该条已上传
  }

  if (insertPayload.length === 0) {
    console.warn('⚠️ All items cached, no new embeddings uploaded.')
    return
  }

  const { error } = await supabase.from('cv_vector_data').insert(insertPayload)

  if (error) {
    console.error('❌ Supabase insert error:', error)
    throw new Error('Failed to upload embeddings to Supabase')
  }

  console.log(`✅ Uploaded ${insertPayload.length} new embeddings to Supabase.`)
}
