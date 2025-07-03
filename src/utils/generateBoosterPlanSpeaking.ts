import { DailyTask } from '@/app/new-ielts-speaking/store/boosterStore'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ✅ 匹配关键词 → 返回最相关的资源链接（若无匹配，返回默认链接）
async function findMatchingLink(stepText: string): Promise<string> {
  const { data, error } = await supabase
    .from('booster_resource_links_speaking')
    .select('url, keywords, active')
    .eq('active', true)

  if (error || !data) {
    console.warn('🔍 查询资源链接失败:', error)
    return '/new-ielts-speaking'
  }

  for (const item of data) {
    if (!item.keywords || !Array.isArray(item.keywords)) continue
    // 👇 添加调试信息
  console.log('🧪 StepText:', stepText)
  console.log('🧪 Matching against:', item.keywords)

    if (item.keywords.some((kw: string) => stepText.includes(kw))) {
      return item.url
    }
  }

  return '/new-ielts-speaking'
}

// ✅ 构造任务卡片（无 day 和 title）
export async function generateBoosterPlanSpeaking(steps: string[]): Promise<DailyTask[]> {
  const results: DailyTask[] = []

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const link = await findMatchingLink(step)

    results.push({
      id: `task-${i + 1}`,
      title: '', // 已废弃标题功能，如需展示可更改为可读文本
      description: step,
      link,
    } as DailyTask) // 👈 若 boosterStore 仍定义有 day 字段，可临时 cast
  }

  return results
}
