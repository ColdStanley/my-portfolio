import { MatchItem } from '../components/analysis/TopMatchesByTypePanel'

export function extractUnmatchedJDLines(jdText: string, matches: MatchItem[]): string[] {
  if (!jdText) return []

  const jdSentences = jdText
    .split(/(?<=[.?!])\s+/) // 按英文标点分句
    .map((s) => s.trim())
    .filter((s) => s.length > 10)

  const resumeTexts = matches.map((m) => m.content.toLowerCase())

  const scored: { sentence: string; score: number }[] = []

  for (const sentence of jdSentences) {
    const lower = sentence.toLowerCase()
    let maxOverlap = 0

    for (const resumeText of resumeTexts) {
      const overlap = computeTextOverlap(lower, resumeText)
      if (overlap > maxOverlap) {
        maxOverlap = overlap
      }
    }

    if (maxOverlap <= 0.4) {
      scored.push({ sentence, score: maxOverlap })
    }
  }

  // 排序并返回前 5 条最不相似的句子
  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map((item) => item.sentence)
}

function computeTextOverlap(a: string, b: string): number {
  const tokensA = new Set(a.split(/\W+/))
  const tokensB = new Set(b.split(/\W+/))

  const common = [...tokensA].filter((t) => tokensB.has(t))
  const union = new Set([...tokensA, ...tokensB])

  return union.size === 0 ? 0 : common.length / union.size
}
