export interface BoosterPromptParams {
  currentScore: number
  targetScore: number
}

export function buildBoosterPrompt({ currentScore, targetScore }: BoosterPromptParams): string {
  const jsonInstruction = `\n\n请以以下 JSON 格式返回内容：\n\n\`\`\`json\n{
  "goal": "string",
  "key_points": ["string", "string", "string"],
  "steps": ["string", "string", "string"]
}\n\`\`\``

  return `你是一位经验丰富的雅思口语老师。

一位学生目前的雅思口语成绩是 Band ${currentScore}，目标是提升到 Band ${targetScore}。

请分析他需要提升的能力，并制定一个个性化的学习计划，内容包括以下三部分：

1. 提升目标（goal）—— 请从雅思口语四个维度（流利性与连贯性、词汇多样性、语法多样性及准确性、发音）出发，首先简要评价该学生在当前 Band ${currentScore} 下各个维度已具备的能力和表现；然后指出要达到 Band ${targetScore}，需要重点提升的维度及其理由；
2. 关键知识点（key_points）—— 请分别从以下四个方面给出具体的提升重点：
- 词汇多样性：列出 1～2 个必须掌握的能力，并提供${currentScore}的典型句子与${targetScore}下更高阶表达的对比示例，突出用词变化；
- 语法多样性与准确性：列出 1～2 个必须掌握的语法结构，并以类似方式对比当前句子和优化后的句子；
- 流利性与连贯性：说明目标分数下应具备的流畅表达能力，如话语衔接、句间过渡等；
- 发音：指出发音方面的关键改进点，如音节重音、连读、语调变化等；
请确保每个方面都明确对应一个或多个语言点，并使用清晰的条列方式表述。
3. 具体行动步骤（steps）—— 请制定一个为期 1 个月的学习计划，帮助学生从当前分数逐步接近目标分数。请遵循以下结构输出：

- 先简要描述这个月的整体提升重点与训练节奏；
- 然后详细列出第 1 周的学习安排，每天 1 项任务，共 7 天；
- 每项任务应明确所针对的能力维度（词汇、语法、流利性与连贯性或发音），并以“任务 + 方法”结构表述（**方法部分无需列出工具或平台，仅描述做法或练习方式**）；
- 最后，请指出学生**今天就可以开始的任务**，给出具体执行建议，帮助他们立即行动。

请尽量在任务描述中使用如下关键词：“学习题库”、“词汇”、“句型”、“定制答案”、“范文”等，以便系统自动匹配推荐资源。


请使用简体中文回答。` + jsonInstruction
}
