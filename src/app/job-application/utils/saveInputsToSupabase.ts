import { supabase } from '@/lib/supabaseClient'
import { buildInputsJSON } from './buildInputsJSON'
import { uploadEmbeddingsToSupabaseFromData } from './uploadEmbeddingsToSupabaseFromData'

/**
 * 将当前用户填写内容保存到 Supabase 表：cv_builder_data
 * 并同步向量数据到表：cv_vector_data
 * 若已存在同一 user_id，则覆盖记录
 * @param userId 匿名或登录用户 ID
 * @param title 简历标题（如“前端岗简历”）
 */
export async function saveInputsToSupabase(userId: string, title = 'Untitled Resume') {
  const inputs_json = buildInputsJSON()

  const { data, error } = await supabase
    .from('cv_builder_data')
    .upsert(
      [
        {
          user_id: userId,
          title,
          data: inputs_json,
        },
      ],
      {
        onConflict: 'user_id',
      }
    )
    .select()

  if (error) {
    console.error('❌ 保存失败:', JSON.stringify(error, null, 2))
    return
  }

  console.log('✅ 保存成功:', data)

  // ✅ 保存成功后，自动写入向量数据
  try {
    await uploadEmbeddingsToSupabaseFromData({
      userId,
      work: inputs_json.workExperience,
      project: inputs_json.projects,
      education: inputs_json.education,
      award: inputs_json.awards,
      skills: inputs_json.skills,
    })
    console.log('✅ 向量数据同步成功')
  } catch (err) {
    console.error('❌ 向量数据同步失败:', err)
  }
}
