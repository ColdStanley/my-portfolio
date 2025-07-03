'use client'

import { useBoosterStore } from '@/app/new-ielts-speaking/store/boosterStore'

export default function BoosterSpeakingPlanCardList() {
  const plan = useBoosterStore(state => state.plan)

  // 高亮关键词并替换为链接（支持多关键词）
  function renderDescriptionWithLink(description: string, link: string) {
    const keywords = ['学习题库', '定制答案', '范文讲解']
    if (!link) return <span>{description}</span>

    const parts: (string | JSX.Element)[] = [description]
    keywords.forEach((kw) => {
      for (let i = 0; i < parts.length; i++) {
        if (typeof parts[i] === 'string' && parts[i].includes(kw)) {
          const [before, after] = (parts[i] as string).split(kw, 2)
          parts.splice(i, 1, before, (
            <a key={kw + i} href={link} className="text-purple-600 underline font-semibold">
              {kw}
            </a>
          ), after)
          break
        }
      }
    })

    return <>{parts}</>
  }

  return (
    <div className="w-full mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        {/* 左侧提示词标签 */}
        <div className="sm:w-28 text-sm font-semibold text-purple-700 pt-1 whitespace-nowrap">
          步骤/Steps
        </div>

        {/* 右侧卡片区域 */}
        <div className="flex-1 border border-gray-200 rounded-lg shadow bg-white p-4 pt-5 min-h-[200px] flex items-center">
          {plan && plan.length > 0 ? (
            <div className="text-gray-800 space-y-6 w-full">
              {plan.map((task) => (
                <p key={task.id}>
                  <strong>{task.title}</strong><br />
                  {renderDescriptionWithLink(task.description, task.link)}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              点击上方按钮后，将在此生成你的专属每日学习计划。
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
