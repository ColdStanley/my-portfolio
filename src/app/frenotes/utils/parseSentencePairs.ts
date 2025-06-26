export function parseSentencePairs(raw: string): [string, string][] {
  const lines = raw.split('\n').map(line => line.trim()).filter(Boolean)
  const result: [string, string][] = []
  for (let i = 0; i < lines.length; i += 2) {
    result.push([lines[i], lines[i + 1] || ''])
  }
  return result
}
