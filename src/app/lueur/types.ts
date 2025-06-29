// types.ts

// 单个高亮词结构
export interface HighlightWord {
  word: string        // 要高亮的词或短语
  note: string        // 对该词的解释
}

// ✅ 游戏用类型，结构等同于 HighlightWord，但不影响原有命名
export interface HighlightItem {
  word: string
  note: string
}


// Supabase 中一条完整的文章记录结构
export interface LueurItem {
  id: string
  title: string
  paragraphs: string   // 多段落文本，\n 分隔
  highlight_data: string  // 原始 JSON 字符串（需要解析）
  image_url: string
  created_at: string
}

// 已解析后的文章数据结构（传入组件使用）
export interface ParsedLueurItem {
  id: string
  title: string
  paragraphs: string[]
  highlightData: HighlightWord[]
  imageUrl: string
  createdAt: string
}

// 渐进式显示的阶段控制（第几步、当前段落索引、高亮词索引）
export interface RevealState {
  stage: number              // 当前点击次数
  currentParagraph: number   // 当前显示到第几段
  currentWord: number        // 当前段中显示到第几个词
}

// 一键高亮控制
export type ManualHighlightSet = Set<string>
