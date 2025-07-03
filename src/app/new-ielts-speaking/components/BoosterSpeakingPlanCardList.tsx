'use client'

import { useBoosterStore } from '@/app/new-ielts-speaking/store/boosterStore'

export default function BoosterSpeakingPlanCardList() {
  const plan = useBoosterStore(state => state.plan)

  // 高亮关键词并替换为链接
  function renderDescriptionWithLink(description: string, link: string) {
    const keywords = ['学习题库', '定制答案', '范文讲解']
    if (!link) return <span>{description}</span>

    const match = keywords.find((kw) => description.includes(kw))
    if (!match) return <span>{description}</span>

    const [before, after] = description.split(match)

    return (
      <>
        {before}
        <a href={link} className="text-purple-600 underline font-semibold">
          {match}
        </a>
        {after}
      </>
    )
  }

  return (
    <div className="w-full mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        {/* 左侧提示词标签 */}
        <div className="sm:w-28 text-sm font-semibold text-purple-700 pt-1 whitespace-nowrap">
          🗓️ 学习计划
        </div>

        {/* 右侧卡片区域 */}
        <div className="flex-1 space-y-4">
          {plan && plan.length > 0 ? (
            plan.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow p-4 border border-gray-200"
              >
                <h4 className="text-base font-bold text-purple-700 mb-1">
                  {task.title}
                </h4>
                <p className="text-gray-800">
                  {renderDescriptionWithLink(task.description, task.link)}
                </p>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-gray-500 text-sm">
                点击上方按钮后，将在此生成你的专属每日学习计划。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
