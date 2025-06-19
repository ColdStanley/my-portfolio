interface PromptParams {
  part: 'Part 1' | 'Part 2' | 'Part 3'
  questionText: string
  keywords: string[]
  userInput: string
}

export function buildPrompt({ part, questionText, keywords, userInput }: PromptParams): string {
  const keywordStr = keywords.join(', ')

  const jsonInstruction = `\n\nRespond in the following JSON format:\n\n\u0060\u0060\u0060json\n{\n  "band6": "...",
  "band7": "...",
  "band8": "..."
}\n\u0060\u0060\u0060`

  switch (part) {
    case 'Part 1':
      return `You are an IELTS Speaking examiner. Here is a Part 1 question:\n\n"${questionText}"\n\nThe user has shared the following keywords: ${keywordStr}.\nTheir thoughts in Chinese: "${userInput}"\n\nGenerate answers for Band 6, Band 7, and Band 8 levels.\n\n- Band 6: Use basic vocabulary with occasional repetition. Sentences may have minor errors but remain understandable. Length: 20–40 words.\n- Band 7: Use more accurate grammar and a wider range of vocabulary. Occasional misuse is allowed. Length: 30–50 words.\n- Band 8: Use rich and precise vocabulary, natural idiomatic expressions, and highly varied grammar structures. No noticeable lexical or grammatical issues. Length: 35–55 words.` + jsonInstruction

    case 'Part 2':
      return `You are an IELTS Speaking coach. The Part 2 topic is:\n\n"${questionText}"\n\nThe user provided these keywords: ${keywordStr}\nTheir thoughts in Chinese: "${userInput}"\n\nGenerate Band 6, Band 7, and Band 8 responses.\n\n- Band 6: Basic vocabulary with frequent repetition, simple grammar with some errors. Still understandable. Length: 160–180 words.\n- Band 7: More accurate grammar and diverse vocabulary. Occasional inappropriate word use. Length: 170–190 words.\n- Band 8: Advanced vocabulary with idiomatic expressions, highly diverse sentence structures, and near-perfect grammar. Length: 180–210 words.` + jsonInstruction

    case 'Part 3':
      return `You are an IELTS Speaking tutor. Here's a Part 3 question:\n\n"${questionText}"\n\nThe user suggested these keywords: ${keywordStr}\nTheir thoughts in Chinese: "${userInput}"\n\nPlease generate Band 6, Band 7, and Band 8 answers.\n\n- Band 6: Basic vocabulary with some repetition. Simple grammar with occasional mistakes. Length: 60–80 words.\n- Band 7: Good grammar and vocabulary variety. Mostly accurate with few mistakes. Length: 70–90 words.\n- Band 8: Fluent and idiomatic vocabulary, structurally varied and grammatically accurate. Length: 80–100 words.` + jsonInstruction

    default:
      return ''
  }
}
