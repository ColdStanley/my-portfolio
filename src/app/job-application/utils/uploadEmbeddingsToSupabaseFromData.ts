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

// ✅ 去重工具：句子级文本去重
function deduplicateSentences(text: string): string {
  const sentences = text
    .split(/(?<=[.。!?！？””\n])\s*/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const seen = new Set<string>()
  const unique = sentences.filter((s) => {
    if (seen.has(s)) return false
    seen.add(s)
    return true
  })

  return unique.join(' ')
}

export async function uploadEmbeddingsToSupabaseFromData(data: UploadContent) {
  const userId = data.userId

  // 🧹 删除当前用户每个类型的旧向量
  const contentTypes = ['work', 'project', 'education', 'award', 'skill']

  for (const type of contentTypes) {
    const { error: deleteError } = await supabase
      .from('cv_vector_data')
      .delete()
      .eq('user_id', userId)
      .eq('content_type', type)

    if (deleteError) {
      console.warn(`⚠️ 删除 ${type} 类型旧向量失败:`, deleteError)
    } else {
      console.log(`🧹 清理成功: ${type} 向量已删除`)
    }
  }

  const rows: { content_type: string; raw_text: string; user_id: string }[] = []

  data.work?.forEach((w) => {
    const raw = [w.company, w.title, w.responsibilities, w.achievements].filter(Boolean).join(' ')
    const clean = deduplicateSentences(raw)
    if (clean.trim()) rows.push({ content_type: 'work', raw_text: clean, user_id: userId })
  })

  data.project?.forEach((p) => {
    const raw = [p.title, p.description].filter(Boolean).join(' ')
    const clean = deduplicateSentences(raw)
    if (clean.trim()) rows.push({ content_type: 'project', raw_text: clean, user_id: userId })
  })

  data.education?.forEach((e) => {
    const raw = [e.school, e.degree, e.major, e.description].filter(Boolean).join(' ')
    const clean = deduplicateSentences(raw)
    if (clean.trim()) rows.push({ content_type: 'education', raw_text: clean, user_id: userId })
  })

  data.award?.forEach((a) => {
    const raw = [a.title, a.source, a.description].filter(Boolean).join(' ')
    const clean = deduplicateSentences(raw)
    if (clean.trim()) rows.push({ content_type: 'award', raw_text: clean, user_id: userId })
  })

  data.skills?.forEach((s) => {
    const trimmed = s.trim()
    if (trimmed) rows.push({ content_type: 'skill', raw_text: trimmed, user_id: userId })
  })

  const insertPayload = []

  for (const row of rows) {
    const embedding = await getSingleEmbedding(row.raw_text)
    if (!embedding) {
      console.warn('⚠️ 无法获取 embedding:', row.raw_text)
      continue
    }

    const { sentences, embeddings } = await splitAndEmbedSentences(row.raw_text)

    insertPayload.push({
      user_id: row.user_id,
      content_type: row.content_type,
      raw_text: row.raw_text,
      embedding,
      sentence_embeddings: {
        sentences,
        embeddings,
      },
    })
  }

  if (insertPayload.length === 0) {
    console.warn('⚠️ 无需上传，未找到有效新记录')
    return
  }

  const { error } = await supabase.from('cv_vector_data').insert(insertPayload)
  if (error) throw new Error('❌ 向量上传失败: ' + JSON.stringify(error, null, 2))

  console.log(`✅ 成功上传 ${insertPayload.length} 条向量记录到 Supabase`)
}
