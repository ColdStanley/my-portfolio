import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PartType = 'part1' | 'part2' | 'part3'
export type TabType = 'dashboard' | 'learning'

// Category data for Part 1 question generation
export interface CategoryItem {
  id: string
  label: string
  placeholder: string
}

export interface Category {
  id: string
  label: string
  items: CategoryItem[]
}

// Part 1 Categories
export const PART1_CATEGORIES: Category[] = [
  {
    id: 'topic',
    label: 'Topic',
    items: [
      { id: 'people', label: 'People', placeholder: 'people' },
      { id: 'places', label: 'Places', placeholder: 'places' },
      { id: 'objects', label: 'Objects', placeholder: 'objects' },
      { id: 'activities', label: 'Activities', placeholder: 'activities' },
      { id: 'experiences', label: 'Experiences', placeholder: 'experiences' },
      { id: 'daily-life', label: 'Daily Life', placeholder: 'daily-life' }
    ]
  },
  {
    id: 'function',
    label: 'Function',
    items: [
      { id: 'habit', label: 'Habit', placeholder: 'habit' },
      { id: 'experience', label: 'Experience', placeholder: 'experience' },
      { id: 'preference', label: 'Preference', placeholder: 'preference' },
      { id: 'opinion', label: 'Opinion', placeholder: 'opinion' },
      { id: 'comparison', label: 'Comparison', placeholder: 'comparison' }
    ]
  },
  {
    id: 'time',
    label: 'Time',
    items: [
      { id: 'current', label: 'Current', placeholder: 'current' },
      { id: 'past', label: 'Past', placeholder: 'past' },
      { id: 'change', label: 'Change', placeholder: 'change' },
      { id: 'future', label: 'Future', placeholder: 'future' }
    ]
  }
]

// Category selection state
export interface CategorySelection {
  categoryId: string
  itemId: string
}

interface StepResult {
  content: string
  timestamp: Date
  prompt?: string
  duration?: number
  voice_practice?: boolean
  practice_count?: number
  band_level?: string // For Step 7 optimization results
}

// Prompt Templates for each step of each part
export interface PromptTemplates {
  step1: string
  step2: string
  step3: string
  step4_band6: string
  step4_band7: string
  step4_band8: string
  step5: string
  step6: string
  step7_band6: string
  step7_band7: string
  step7_band8: string
}

export interface PromptTemplatesByPart {
  part1: PromptTemplates
  part2: PromptTemplates
  part3: PromptTemplates
}

interface PartProgress {
  currentStep: number
  stepResults: Record<number, StepResult>
  isCompleted: boolean
}

interface IELTSStepStore {
  // UI State
  activeTab: TabType
  activePart: PartType
  selectedAiModel: 'deepseek' | 'openai'
  isPracticeExpanded: boolean
  setActiveTab: (tab: TabType) => void
  setActivePart: (part: PartType) => void
  setSelectedAiModel: (model: 'deepseek' | 'openai') => void
  togglePracticeExpanded: () => void
  
  // Category Selection State (for Part 1 Step 1)
  categorySelection: CategorySelection | null
  setCategorySelection: (selection: CategorySelection | null) => void
  
  // Progress State
  progress: Record<PartType, PartProgress>
  isLoading: boolean
  
  // Step Actions
  setStepResult: (part: PartType, step: number, result: StepResult) => Promise<void>
  getStepResult: (part: PartType, step: number) => StepResult | undefined
  getCurrentStep: (part: PartType) => number
  goToNextStep: (part: PartType) => void
  resetPartProgress: (part: PartType) => void
  
  // Data Sync
  loadPartProgress: (part: PartType) => Promise<void>
  savePartProgress: (part: PartType) => Promise<void>
  
  // AI Generation
  generateAIResponse: (part: PartType, step: number, userInput?: string, customPrompt?: string) => Promise<string>
  
  // User Management
  getUserId: () => string
  
  // Prompt Templates
  promptTemplatesByPart: PromptTemplatesByPart
  getCurrentPromptTemplates: (part: PartType) => PromptTemplates
  setPromptTemplate: (part: PartType, stepKey: keyof PromptTemplates, template: string) => void
  resetPromptTemplates: (part: PartType) => void
  getPromptForStep: (part: PartType, step: number | string) => string
}

const initialPartProgress: PartProgress = {
  currentStep: 1,
  stepResults: {},
  isCompleted: false
}

// Default prompt templates for each part and step
const DEFAULT_PROMPT_TEMPLATES_MAP: PromptTemplatesByPart = {
  part1: {
    step1: `你是一名雅思口语考官，请根据以下典型类型生成一道雅思口语 Part 1 题目。
要求：
1. 题目必须自然、地道，符合雅思口语真实考试的 Part 1 风格；
2. 问句长度适中（8–15 个英文单词），不使用生僻表达；
3. 不要输出任何解释或额外信息，只输出题目本身。`,
    step2: `请从以下五个角度分析这道 IELTS Speaking Part 1 题目，帮助考生理解题目结构与答题要求：

分析角度如下：

评分标准映射：这道题主要对应雅思口语的哪些评分维度？考察学生的哪些语言能力？

题型结构识别：这属于哪种类型的问句？是否需要理由、举例或扩展？

话题分类：这道题属于哪类常见话题（如：食物、兴趣、日常生活等）？

答题策略建议：学生应该如何组织答案？推荐什么样的回答结构？

常见错误提醒：学生在回答此类问题时容易出现哪些典型错误？如何避免？`,
    step3: `你是一位雅思口语老师，正在帮助学生准备 IELTS Speaking Part 1。
学生常常面对题目却不知道说什么、想不出内容。
你的任务是：针对上述题目，生成一组有启发性的引导问题，帮助学生联想生活经历、扩展思路。

请分为两个部分输出：

记忆激活提示问题（3–5 个）
帮助学生回忆与这个话题有关的具体场景、经历、情感。
问题应通俗易懂，贴近日常生活，能够激发学生回忆素材。

多角度内容引导（3–5 个）
每个角度包含一个分类标签（如：频率、原因、过程、比较、影响），以及一个引导问题。
问题应有助于拓展回答的深度与宽度。

❗请注意：不要生成答案；不要解释题目；只输出问题，引导学生思考即可。`,
    step4: `你是一位雅思口语老师，正在帮助学生构建回答思路。学生已经写下了关键词，但不知道怎么组织回答。
请根据上述题目和学生输入，生成一组极简的"挖空回答框架"，帮助学生自行表达。

要求：
- 每行只保留句子主干结构，中间用 ______ 留空
- 不生成答案，不提示内容，不举例
- 总共输出 4–5 行，必须极简
- 符合 IELTS Part 1 回答风格`,
    step4_band6: `你是一位雅思口语老师，正在帮助学生构建回答思路。学生已经写下了关键词，但不知道怎么组织回答。
请根据下面这道题和学生输入，生成一组极简"挖空回答框架"，该框架符合雅思口语6分标准，帮助学生自行表达。

要求：
- 每行只保留句子主干结构，中间用 ______ 留空
- 不生成答案，不提示内容，不举例
- 总共输出 4–5 行，必须极简
- 符合 IELTS Part 1 回答风格`,
    step4_band7: `你是一位雅思口语老师，正在帮助学生构建回答思路。学生已经写下了关键词，但不知道怎么组织回答。
请根据下面这道题和学生输入，生成一组极简"挖空回答框架"，该框架符合雅思口语7分标准，帮助学生自行表达。

要求：
- 每行只保留句子主干结构，中间用 ______ 留空
- 不生成答案，不提示内容，不举例
- 总共输出 4–5 行，必须极简
- 符合 IELTS Part 1 回答风格`,
    step4_band8: `你是一位雅思口语老师，正在帮助学生构建回答思路。学生已经写下了关键词，但不知道怎么组织回答。
请根据下面这道题和学生输入，生成一组极简"挖空回答框架"，该框架符合雅思口语8分标准，帮助学生自行表达。

要求：
- 每行只保留句子主干结构，中间用 ______ 留空
- 不生成答案，不提示内容，不举例
- 总共输出 4–5 行，必须极简
- 符合 IELTS Part 1 回答风格`,
    step5: "这是语音练习步骤，无需AI调用。",
    step6: `你是一位雅思口语教师。
学生刚刚回答了一道 IELTS Speaking Part 1 题目，口语转录成了文字。

你的任务是：从5个固定维度对这段回答进行结构化分析，指出表达中存在的问题或可以改进的地方。

❗注意事项：
不要给出评分；不要直接修改或优化原句；每个维度请单独编号输出，表达要简洁、清晰；

分析的5个维度：
1- 内容完整性：回答是否完整覆盖题意？是否包含理由、细节或例子？
2- 句式多样性：是否使用了不同类型的句子（如：从句、并列句）？是否都是简单句？
3- 词汇多样性：是否出现重复用词？是否有具体、描述性或话题相关的词？
4- 语法准确性：是否存在常见语法错误？如时态错误、主谓不一致等？
5- 连贯与衔接性：句子之间是否自然衔接？是否缺少过渡词或逻辑跳跃？`,
    step7_band6: `你是一位雅思口语老师，正在帮助学生提升回答质量。
以下是某位学生对一条 IELTS Speaking Part 1 题目的回答（通过语音转录而成），请你完成两步任务：

第一步：优化回答：请根据题目 + 学生原始回答，生成一个符合 雅思口语 Band 6 水准 的回答。要求：
回答结构自然，句式有一定多样性；
词汇有适度拓展，避免重复；
要符合 Band 6 的真实水平。

第二步：解释为什么是 Band 6
从以下 3 个维度出发，解释为什么你的优化版本符合 Band 6 要求：
内容完整性与连贯性（是否回答了题目，有展开和逻辑）
词汇资源（是否使用了基础词汇以外的表达）
语法结构（是否使用了基本复合句、语法基本准确）
请将优化后的回答和 3 点解释。`,
    step7_band7: `你是一位雅思口语老师，正在帮助学生提升回答质量。
以下是某位学生对一条 IELTS Speaking Part 1 题目的回答（通过语音转录而成），请你完成两步任务：

第一步：优化回答：请根据题目 + 学生原始回答，生成一个符合 雅思口语 Band 7 水准 的回答。要求：
回答结构自然，句式有一定多样性；
词汇有适度拓展，避免重复；
要符合 Band 7 的真实水平。

第二步：解释为什么是 Band 7
从以下 3 个维度出发，解释为什么你的优化版本符合 Band 7 要求：
内容完整性与连贯性（是否回答了题目，有展开和逻辑）
词汇资源（是否使用了基础词汇以外的表达）
语法结构（是否使用了基本复合句、语法基本准确）
请将优化后的回答和 3 点解释。`,
    step7_band8: `你是一位雅思口语老师，正在帮助学生提升回答质量。
以下是某位学生对一条 IELTS Speaking Part 1 题目的回答（通过语音转录而成），请你完成两步任务：

第一步：优化回答：请根据题目 + 学生原始回答，生成一个符合 雅思口语 Band 8 水准 的回答。要求：
回答结构自然，句式有一定多样性；
词汇有适度拓展，避免重复；
要符合 Band 8 的真实水平。

第二步：解释为什么是 Band 8
从以下 3 个维度出发，解释为什么你的优化版本符合 Band 8 要求：
内容完整性与连贯性（是否回答了题目，有展开和逻辑）
词汇资源（是否使用了基础词汇以外的表达）
语法结构（是否使用了基本复合句、语法基本准确）
请将优化后的回答和 3 点解释。`
  },
  part2: {
    step1: "Generate IELTS Speaking Part 2 cue cards with topics like 'Describe a person you admire', 'Describe a place you visited', etc. Provide 3-4 complete cue cards with bullet points.",
    step2: `请从以下五个角度分析这道 IELTS Speaking Part 2 题目，帮助考生理解题目结构与答题要求：

分析角度如下：

评分标准映射：这道题主要对应雅思口语的哪些评分维度？考察学生的哪些语言能力？

题型结构识别：这属于哪种类型的问句？是否需要理由、举例或扩展？

话题分类：这道题属于哪类常见话题（如：食物、兴趣、日常生活等）？

答题策略建议：学生应该如何组织答案？推荐什么样的回答结构？

常见错误提醒：学生在回答此类问题时容易出现哪些典型错误？如何避免？`,
    step3: `你是一位雅思口语老师，正在帮助学生准备 IELTS Speaking Part 2。
学生常常面对题目却不知道说什么、想不出内容。
你的任务是：针对上述题目，生成一组有启发性的引导问题，帮助学生联想生活经历、扩展思路。

请分为两个部分输出：

记忆激活提示问题（3–5 个）
帮助学生回忆与这个话题有关的具体场景、经历、情感。
问题应通俗易懂，贴近日常生活，能够激发学生回忆素材。

多角度内容引导（3–5 个）
每个角度包含一个分类标签（如：频率、原因、过程、比较、影响），以及一个引导问题。
问题应有助于拓展回答的深度与宽度。

❗请注意：不要生成答案；不要解释题目；只输出问题，引导学生思考即可。`,
    step4: `你是一位雅思口语老师，正在帮助学生构建回答思路。学生已经写下了关键词，但不知道怎么组织回答。
请根据上述题目和学生输入，生成一组极简的"挖空回答框架"，帮助学生自行表达。

要求：
- 每行只保留句子主干结构，中间用 ______ 留空
- 不生成答案，不提示内容，不举例
- 总共输出 4–5 行，必须极简
- 符合 IELTS Part 2 回答风格`,
    step4_band6: `你是一位雅思口语老师，正在帮助学生构建回答思路。学生已经写下了关键词，但不知道怎么组织回答。
请根据下面这道题和学生输入，生成一组极简"挖空回答框架"，该框架符合雅思口语6分标准，帮助学生自行表达。

要求：
- 每行只保留句子主干结构，中间用 ______ 留空
- 不生成答案，不提示内容，不举例
- 总共输出 4–5 行，必须极简
- 符合 IELTS Part 2 回答风格`,
    step4_band7: `你是一位雅思口语老师，正在帮助学生构建回答思路。学生已经写下了关键词，但不知道怎么组织回答。
请根据下面这道题和学生输入，生成一组极简"挖空回答框架"，该框架符合雅思口语7分标准，帮助学生自行表达。

要求：
- 每行只保留句子主干结构，中间用 ______ 留空
- 不生成答案，不提示内容，不举例
- 总共输出 4–5 行，必须极简
- 符合 IELTS Part 2 回答风格`,
    step4_band8: `你是一位雅思口语老师，正在帮助学生构建回答思路。学生已经写下了关键词，但不知道怎么组织回答。
请根据下面这道题和学生输入，生成一组极简"挖空回答框架"，该框架符合雅思口语8分标准，帮助学生自行表达。

要求：
- 每行只保留句子主干结构，中间用 ______ 留空
- 不生成答案，不提示内容，不举例
- 总共输出 4–5 行，必须极简
- 符合 IELTS Part 2 回答风格`,
    step5: "这是语音练习步骤，无需AI调用。",
    step6: `你是一位雅思口语教师。
学生刚刚回答了一道 IELTS Speaking Part 2 题目，口语转录成了文字。

你的任务是：从5个固定维度对这段回答进行结构化分析，指出表达中存在的问题或可以改进的地方。

❗注意事项：
不要给出评分；不要直接修改或优化原句；每个维度请单独编号输出，表达要简洁、清晰；

分析的5个维度：
1- 内容完整性：回答是否完整覆盖题意？是否包含理由、细节或例子？
2- 句式多样性：是否使用了不同类型的句子（如：从句、并列句）？是否都是简单句？
3- 词汇多样性：是否出现重复用词？是否有具体、描述性或话题相关的词？
4- 语法准确性：是否存在常见语法错误？如时态错误、主谓不一致等？
5- 连贯与衔接性：句子之间是否自然衔接？是否缺少过渡词或逻辑跳跃？`,
    step7_band6: `你是一位雅思口语老师，正在帮助学生提升回答质量。
以下是某位学生对一条 IELTS Speaking Part 2 题目的回答（通过语音转录而成），请你完成两步任务：

第一步：优化回答：请根据题目 + 学生原始回答，生成一个符合 雅思口语 Band 6 水准 的回答。要求：
回答结构自然，句式有一定多样性；
词汇有适度拓展，避免重复；
要符合 Band 6 的真实水平。

第二步：解释为什么是 Band 6
从以下 3 个维度出发，解释为什么你的优化版本符合 Band 6 要求：
内容完整性与连贯性（是否回答了题目，有展开和逻辑）
词汇资源（是否使用了基础词汇以外的表达）
语法结构（是否使用了基本复合句、语法基本准确）
请将优化后的回答和 3 点解释。`,
    step7_band7: `你是一位雅思口语老师，正在帮助学生提升回答质量。
以下是某位学生对一条 IELTS Speaking Part 2 题目的回答（通过语音转录而成），请你完成两步任务：

第一步：优化回答：请根据题目 + 学生原始回答，生成一个符合 雅思口语 Band 7 水准 的回答。要求：
回答结构自然，句式有一定多样性；
词汇有适度拓展，避免重复；
要符合 Band 7 的真实水平。

第二步：解释为什么是 Band 7
从以下 3 个维度出发，解释为什么你的优化版本符合 Band 7 要求：
内容完整性与连贯性（是否回答了题目，有展开和逻辑）
词汇资源（是否使用了基础词汇以外的表达）
语法结构（是否使用了基本复合句、语法基本准确）
请将优化后的回答和 3 点解释。`,
    step7_band8: `你是一位雅思口语老师，正在帮助学生提升回答质量。
以下是某位学生对一条 IELTS Speaking Part 2 题目的回答（通过语音转录而成），请你完成两步任务：

第一步：优化回答：请根据题目 + 学生原始回答，生成一个符合 雅思口语 Band 8 水准 的回答。要求：
回答结构自然，句式有一定多样性；
词汇有适度拓展，避免重复；
要符合 Band 8 的真实水平。

第二步：解释为什么是 Band 8
从以下 3 个维度出发，解释为什么你的优化版本符合 Band 8 要求：
内容完整性与连贯性（是否回答了题目，有展开和逻辑）
词汇资源（是否使用了基础词汇以外的表达）
语法结构（是否使用了基本复合句、语法基本准确）
请将优化后的回答和 3 点解释。`
  },
  part3: {
    step1: "Generate IELTS Speaking Part 3 discussion questions that relate to the Part 2 topic. Focus on abstract concepts, comparisons, predictions about the future, and analytical questions.",
    step2: `请从以下五个角度分析这道 IELTS Speaking Part 3 题目，帮助考生理解题目结构与答题要求：

分析角度如下：

评分标准映射：这道题主要对应雅思口语的哪些评分维度？考察学生的哪些语言能力？

题型结构识别：这属于哪种类型的问句？是否需要理由、举例或扩展？

话题分类：这道题属于哪类常见话题（如：食物、兴趣、日常生活等）？

答题策略建议：学生应该如何组织答案？推荐什么样的回答结构？

常见错误提醒：学生在回答此类问题时容易出现哪些典型错误？如何避免？`,
    step3: `你是一位雅思口语老师，正在帮助学生准备 IELTS Speaking Part 3。
学生常常面对题目却不知道说什么、想不出内容。
你的任务是：针对上述题目，生成一组有启发性的引导问题，帮助学生联想生活经历、扩展思路。

请分为两个部分输出：

记忆激活提示问题（3–5 个）
帮助学生回忆与这个话题有关的具体场景、经历、情感。
问题应通俗易懂，贴近日常生活，能够激发学生回忆素材。

多角度内容引导（3–5 个）
每个角度包含一个分类标签（如：频率、原因、过程、比较、影响），以及一个引导问题。
问题应有助于拓展回答的深度与宽度。

❗请注意：不要生成答案；不要解释题目；只输出问题，引导学生思考即可。`,
    step4: `你是一位雅思口语老师，正在帮助学生构建回答思路。学生已经写下了关键词，但不知道怎么组织回答。
请根据上述题目和学生输入，生成一组极简的"挖空回答框架"，帮助学生自行表达。

要求：
- 每行只保留句子主干结构，中间用 ______ 留空
- 不生成答案，不提示内容，不举例
- 总共输出 4–5 行，必须极简
- 符合 IELTS Part 3 回答风格`,
    step5: "这是语音练习步骤，无需AI调用。",
    step6: `你是一位雅思口语教师。
学生刚刚回答了一道 IELTS Speaking Part 3 题目，口语转录成了文字。

你的任务是：从5个固定维度对这段回答进行结构化分析，指出表达中存在的问题或可以改进的地方。

❗注意事项：
不要给出评分；不要直接修改或优化原句；每个维度请单独编号输出，表达要简洁、清晰；

分析的5个维度：
1- 内容完整性：回答是否完整覆盖题意？是否包含理由、细节或例子？
2- 句式多样性：是否使用了不同类型的句子（如：从句、并列句）？是否都是简单句？
3- 词汇多样性：是否出现重复用词？是否有具体、描述性或话题相关的词？
4- 语法准确性：是否存在常见语法错误？如时态错误、主谓不一致等？
5- 连贯与衔接性：句子之间是否自然衔接？是否缺少过渡词或逻辑跳跃？`,
    step7_band6: `你是一位雅思口语老师，正在帮助学生提升回答质量。
以下是某位学生对一条 IELTS Speaking Part 3 题目的回答（通过语音转录而成），请你完成两步任务：

第一步：优化回答：请根据题目 + 学生原始回答，生成一个符合 雅思口语 Band 6 水准 的回答。要求：
回答结构自然，句式有一定多样性；
词汇有适度拓展，避免重复；
要符合 Band 6 的真实水平。

第二步：解释为什么是 Band 6
从以下 3 个维度出发，解释为什么你的优化版本符合 Band 6 要求：
内容完整性与连贯性（是否回答了题目，有展开和逻辑）
词汇资源（是否使用了基础词汇以外的表达）
语法结构（是否使用了基本复合句、语法基本准确）
请将优化后的回答和 3 点解释。`,
    step7_band7: `你是一位雅思口语老师，正在帮助学生提升回答质量。
以下是某位学生对一条 IELTS Speaking Part 3 题目的回答（通过语音转录而成），请你完成两步任务：

第一步：优化回答：请根据题目 + 学生原始回答，生成一个符合 雅思口语 Band 7 水准 的回答。要求：
回答结构自然，句式有一定多样性；
词汇有适度拓展，避免重复；
要符合 Band 7 的真实水平。

第二步：解释为什么是 Band 7
从以下 3 个维度出发，解释为什么你的优化版本符合 Band 7 要求：
内容完整性与连贯性（是否回答了题目，有展开和逻辑）
词汇资源（是否使用了基础词汇以外的表达）
语法结构（是否使用了基本复合句、语法基本准确）
请将优化后的回答和 3 点解释。`,
    step7_band8: `你是一位雅思口语老师，正在帮助学生提升回答质量。
以下是某位学生对一条 IELTS Speaking Part 3 题目的回答（通过语音转录而成），请你完成两步任务：

第一步：优化回答：请根据题目 + 学生原始回答，生成一个符合 雅思口语 Band 8 水准 的回答。要求：
回答结构自然，句式有一定多样性；
词汇有适度拓展，避免重复；
要符合 Band 8 的真实水平。

第二步：解释为什么是 Band 8
从以下 3 个维度出发，解释为什么你的优化版本符合 Band 8 要求：
内容完整性与连贯性（是否回答了题目，有展开和逻辑）
词汇资源（是否使用了基础词汇以外的表达）
语法结构（是否使用了基本复合句、语法基本准确）
请将优化后的回答和 3 点解释。`
  }
}

// LocalStorage key for prompt templates by part
const IELTS_PROMPT_STORAGE_KEY = 'ielts_step_prompt_templates_by_part'
const IELTS_PROMPT_VERSION_KEY = 'ielts_step_prompt_version'
const CURRENT_PROMPT_VERSION = '1.3' // Fixed getPromptForStep type support

// Load prompt templates by part from localStorage
const loadPromptTemplatesByPartFromStorage = (): PromptTemplatesByPart => {
  if (typeof window === 'undefined') return DEFAULT_PROMPT_TEMPLATES_MAP
  
  try {
    // Check version first
    const storedVersion = localStorage.getItem(IELTS_PROMPT_VERSION_KEY)
    if (storedVersion !== CURRENT_PROMPT_VERSION) {
      console.log('IELTS prompt templates version mismatch, using defaults')
      // Update version and save defaults
      localStorage.setItem(IELTS_PROMPT_VERSION_KEY, CURRENT_PROMPT_VERSION)
      savePromptTemplatesByPartToStorage(DEFAULT_PROMPT_TEMPLATES_MAP)
      return DEFAULT_PROMPT_TEMPLATES_MAP
    }
    
    const stored = localStorage.getItem(IELTS_PROMPT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to ensure all parts have templates
      const merged = { ...DEFAULT_PROMPT_TEMPLATES_MAP }
      Object.keys(parsed).forEach(partKey => {
        if (merged[partKey as keyof PromptTemplatesByPart]) {
          merged[partKey as keyof PromptTemplatesByPart] = {
            ...merged[partKey as keyof PromptTemplatesByPart],
            ...parsed[partKey]
          }
        }
      })
      return merged
    }
  } catch (error) {
    console.warn('Failed to load IELTS prompt templates from localStorage:', error)
  }
  
  // Set version and save defaults
  localStorage.setItem(IELTS_PROMPT_VERSION_KEY, CURRENT_PROMPT_VERSION)
  savePromptTemplatesByPartToStorage(DEFAULT_PROMPT_TEMPLATES_MAP)
  return DEFAULT_PROMPT_TEMPLATES_MAP
}

// Save prompt templates by part to localStorage
const savePromptTemplatesByPartToStorage = (templates: PromptTemplatesByPart) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(IELTS_PROMPT_STORAGE_KEY, JSON.stringify(templates))
    localStorage.setItem(IELTS_PROMPT_VERSION_KEY, CURRENT_PROMPT_VERSION)
  } catch (error) {
    console.warn('Failed to save IELTS prompt templates to localStorage:', error)
  }
}

// Helper function to generate UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Helper function to get user ID (anonymous or authenticated)
const getUserId = (): string => {
  // Check if there's an authenticated user
  // For now, use anonymous UUID stored in localStorage
  
  let userId = localStorage.getItem('ielts-anonymous-user-id')
  
  // Check if existing userId is valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  if (!userId || !uuidRegex.test(userId)) {
    userId = generateUUID() // Generate proper UUID format
    localStorage.setItem('ielts-anonymous-user-id', userId)
    console.log('Generated new user ID:', userId)
  } else {
    console.log('Using existing user ID:', userId)
  }
  return userId
}

export const useIELTSStepStore = create<IELTSStepStore>()(
  persist(
    (set, get) => ({
      // UI State
      activeTab: 'learning',
      activePart: 'part1',
      selectedAiModel: 'deepseek',
      isPracticeExpanded: true,
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActivePart: (part) => set({ activePart: part }),
      setSelectedAiModel: (model) => set({ selectedAiModel: model }),
      togglePracticeExpanded: () => set((state) => ({ isPracticeExpanded: !state.isPracticeExpanded })),
      
      // Category Selection State
      categorySelection: null,
      setCategorySelection: (selection) => set({ categorySelection: selection }),
      
      // Progress State
      progress: {
        part1: { ...initialPartProgress },
        part2: { ...initialPartProgress },
        part3: { ...initialPartProgress }
      },
      isLoading: false,
      
      // Prompt Templates by Part
      promptTemplatesByPart: loadPromptTemplatesByPartFromStorage(),
      
      // Step Actions
      setStepResult: async (part, step, result) => {
        // Update local state immediately
        set((state) => ({
          progress: {
            ...state.progress,
            [part]: {
              ...state.progress[part],
              stepResults: {
                ...state.progress[part].stepResults,
                [step]: result
              }
            }
          }
        }))
        
        // Save to Supabase
        try {
          const response = await fetch('/api/ielts-speaking-step-by-step/step-result-simple', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: getUserId(),
              part,
              step,
              result: {
                ...result,
                timestamp: result.timestamp instanceof Date ? result.timestamp.toISOString() : result.timestamp
              }
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to save step result to server:', response.status, errorData)
          }
        } catch (error) {
          console.error('Error saving step result:', error)
        }
      },
      
      getStepResult: (part, step) => {
        const state = get()
        return state.progress[part]?.stepResults[step]
      },
      
      getCurrentStep: (part) => {
        const state = get()
        return state.progress[part]?.currentStep || 1
      },
      
      goToNextStep: (part) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [part]: {
              ...state.progress[part],
              currentStep: Math.min(state.progress[part].currentStep + 1, 8) // 支持到第8步
            }
          }
        })),
      
      resetPartProgress: (part) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [part]: { ...initialPartProgress }
          }
        })),
      
      // Data Sync
      loadPartProgress: async (part) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`/api/ielts-speaking-step-by-step/sessions?userId=${getUserId()}&part=${part}`)
          if (response.ok) {
            const data = await response.json()
            set((state) => ({
              progress: {
                ...state.progress,
                [part]: {
                  currentStep: data.current_step || 1,
                  stepResults: data.step_results || {},
                  isCompleted: data.is_completed || false
                }
              }
            }))
          }
        } catch (error) {
          console.error('Error loading part progress:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      savePartProgress: async (part) => {
        const state = get()
        const partData = state.progress[part]
        
        try {
          const response = await fetch('/api/ielts-speaking-step-by-step/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: getUserId(),
              part,
              currentStep: partData.currentStep,
              stepResults: partData.stepResults,
              isCompleted: partData.isCompleted
            })
          })
          
          if (!response.ok) {
            console.error('Failed to save part progress')
          }
        } catch (error) {
          console.error('Error saving part progress:', error)
        }
      },
      
      // AI Generation
      generateAIResponse: async (part, step, userInput?, customPrompt?) => {
        const state = get()
        const partProgress = state.progress[part]
        
        // Collect previous steps for context
        const previousSteps = []
        for (let i = 1; i < step; i++) {
          const stepResult = partProgress.stepResults[i]
          if (stepResult) {
            previousSteps.push(stepResult)
          }
        }
        
        try {
          const response = await fetch('/api/ielts-speaking-step-by-step/ai-generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              part,
              step,
              previousSteps,
              userInput,
              aiModel: state.selectedAiModel,
              customPrompt
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to generate AI response')
          }
          
          const data = await response.json()
          return data.content
        } catch (error) {
          console.error('Error generating AI response:', error)
          throw error
        }
      },
      
      // User Management
      getUserId,
      
      // Prompt Template Methods
      getCurrentPromptTemplates: (part) => {
        const state = get()
        return state.promptTemplatesByPart[part] || DEFAULT_PROMPT_TEMPLATES_MAP[part]
      },
      
      setPromptTemplate: (part, stepKey, template) => set((state) => {
        const newTemplatesByPart = {
          ...state.promptTemplatesByPart,
          [part]: {
            ...state.promptTemplatesByPart[part],
            [stepKey]: template
          }
        }
        
        // Save to localStorage whenever templates are updated
        savePromptTemplatesByPartToStorage(newTemplatesByPart)
        return { promptTemplatesByPart: newTemplatesByPart }
      }),
      
      resetPromptTemplates: (part) => set((state) => {
        const newTemplatesByPart = {
          ...state.promptTemplatesByPart,
          [part]: DEFAULT_PROMPT_TEMPLATES_MAP[part]
        }
        
        // Save to localStorage
        savePromptTemplatesByPartToStorage(newTemplatesByPart)
        return { promptTemplatesByPart: newTemplatesByPart }
      }),
      
      getPromptForStep: (part, step) => {
        const state = get()
        const templates = state.promptTemplatesByPart[part] || DEFAULT_PROMPT_TEMPLATES_MAP[part]
        
        // Handle step as string (for step4_band6, step7_band6, etc.)
        if (typeof step === 'string') {
          const stepKey = step as keyof PromptTemplates
          const result = templates[stepKey]
          if (result) {
            return result
          }
          console.warn(`Missing template for ${part} ${step}, using default`)
          return DEFAULT_PROMPT_TEMPLATES_MAP[part][stepKey] || `Default prompt for ${part} ${step}`
        }
        
        // Handle regular numeric steps
        const stepKey = `step${step}` as keyof PromptTemplates
        const result = templates[stepKey]
        if (result) {
          return result
        }
        console.warn(`Missing template for ${part} step ${step}, using default`)
        return DEFAULT_PROMPT_TEMPLATES_MAP[part][stepKey] || `Default prompt for ${part} step ${step}`
      }
    }),
    {
      name: 'ielts-step-storage-v5', // Changed name to force fresh start with step7 templates
      partialize: (state) => ({ 
        progress: state.progress, 
        activePart: state.activePart,
        selectedAiModel: state.selectedAiModel,
        isPracticeExpanded: state.isPracticeExpanded,
        promptTemplatesByPart: state.promptTemplatesByPart,
        categorySelection: state.categorySelection
      })
    }
  )
)