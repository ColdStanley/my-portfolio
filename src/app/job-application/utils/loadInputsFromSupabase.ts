import { supabase } from '@/lib/supabaseClient'
import { useJobAppInputStore } from '../store/useJobAppInputStore'

/**
 * 从 Supabase 中加载当前用户最新保存的数据，并写入 Zustand store
 * @param userId 登录用户的 uuid（必须为合法 uuid）
 */
export async function loadInputsFromSupabase(userId: string) {
  if (!userId || userId.length < 10) {
    console.warn('⚠️ 用户 ID 非法，取消加载')
    return
  }

  const { data, error } = await supabase
    .from('cv_builder_data')
    .select('data')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    console.warn('⚠️ 未找到用户数据或查询失败:', error)
    return
  }

  const resumeData = data.data

  // ✅ 回填到 Zustand（字段名必须对齐前端状态结构）
  useJobAppInputStore.setState({
    basic: resumeData.basic || {
      name: '',
      email: '',
      location: '',
      linkedin: '',
      portfolio: '',
    },
    education: resumeData.education || [],
    awards: resumeData.awards || [],
    workExperience: resumeData.workExperience || [], // ✅ 确保为 camelCase
    projects: resumeData.projects || [],
    skills: resumeData.skills || [],
  })

  console.log('✅ 成功加载并写入状态')
}
