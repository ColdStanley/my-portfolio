interface RuleBasedMatchResult {
  score: number
  matched: string[]
  missing: string[]
}

/**
 * 执行基于关键词的匹配分析
 * @param jdText 粘贴的 JD 原文
 * @param contents 用户勾选的内容（字符串数组）
 * @returns 匹配分数（百分比）、匹配项、未匹配项
 */
export function keywordsRuleBasedMatch(
  jdText: string,
  contents: string[]
): RuleBasedMatchResult {
  // 🧪 调试内容类型
  console.log('🧪 contents =', contents)
  console.log('🧪 typeof contents =', typeof contents)
  console.log('🧪 Array.isArray(contents) =', Array.isArray(contents))

  const jdLower = jdText.toLowerCase()

  const matched = contents.filter((text) =>
    jdLower.includes(text.toLowerCase())
  )

  const missing = contents.filter((text) =>
    !jdLower.includes(text.toLowerCase())
  )

  const score =
    contents.length > 0 ? Math.round((matched.length / contents.length) * 100) : 0

  return { score, matched, missing }
}
