import { supabase } from '@/lib/supabaseClient'
import { buildInputsJSON } from './buildInputsJSON'

/**
 * 将当前用户填写内容保存到 Supabase 表：cv_builder_data
 * 若已存在同一 user_id，则覆盖该记录
 * @param userId 匿名或登录用户 ID
 * @param title 可选简历标题（如“前端岗简历”）
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
        onConflict: 'user_id', // ⚠️ 确保表中 user_id 是唯一或有唯一约束
      }
    )
    .select()

  if (error) {
    console.error('❌ 保存失败:', JSON.stringify(error, null, 2))
  } else {
    console.log('✅ 保存成功:', data)
  }
}
