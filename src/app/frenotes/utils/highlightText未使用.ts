import { FrenotesItem } from '../types/frenotes'

export function highlightText(text: string, item: FrenotesItem): string {
  const expressions = [
    { word: item.core_expression1, note: item.expression_usage1 },
    { word: item.core_expression2, note: item.expression_usage2 },
    { word: item.core_expression3, note: item.expression_usage3 },
  ].filter(entry => entry.word && entry.note) as { word: string; note: string }[]

  // 按长度降序，优先替换长词，防止嵌套误替换
  expressions.sort((a, b) => b.word.length - a.word.length)

  let highlighted = text

  expressions.forEach(({ word, note }) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    const safeNote = note.replace(/"/g, '&quot;').replace(/\n/g, '<br/>')

    // 标准结构：<mark data-note="...">词语</mark>
    const replacement = `<mark data-note="${safeNote}">$1</mark>`
    highlighted = highlighted.replace(regex, replacement)
  })

  return highlighted
}
