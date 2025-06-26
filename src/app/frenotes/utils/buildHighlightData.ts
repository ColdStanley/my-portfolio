// utils/buildHighlightData.ts

export interface FlexibleFrenotesItem {
  [key: string]: string | null | undefined
}

/**
 * 提取所有 core_expressionX 字段并排序（按长度降序）
 */
export function parseHighlightWords(item: FlexibleFrenotesItem): string[] {
  const expressions: string[] = []

  for (let i = 1; i <= 20; i++) {
    const expr = item[`core_expression${i}`]
    if (expr) {
      expressions.push(expr)
    } else {
      break // 如果中间断了就认为结束（如只填了1~5）
    }
  }

  return expressions.sort((a, b) => b.length - a.length)
}

/**
 * 动态匹配 core_expressionX 和 expression_usageX 成对关系
 */
export function parseHighlightNotes(item: FlexibleFrenotesItem): Record<string, string> {
  const map: Record<string, string> = {}

  for (let i = 1; i <= 20; i++) {
    const expr = item[`core_expression${i}`]
    const usage = item[`expression_usage${i}`]

    if (expr && usage) {
      map[expr.toLowerCase()] = usage
    } else if (!expr && !usage) {
      break // 同时为空视为配对结束
    }
  }

  return map
}
