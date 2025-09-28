// 跨页面数据传输的共享类型定义

export interface CVModuleDraft {
  id?: string                     // 可选，由存储桥生成
  title: string                   // ${company} · ${title}（${time}）格式，缺失项跳过
  items: string[]                 // 从optimizedContent拆行得到，去空行+trim+去前缀符号
  width?: number                  // 可省略，统一由Builder默认50%
  sourceType: 'manual' | 'imported' | 'optimized'         // 来源类型
  sourceIds: {                    // 追踪来源
    experienceId: string
    jdId?: string
  }
  meta?: {                        // 仅作显示/回跳使用
    jdTitle?: string
    jdCompany?: string
  }
}

// localStorage存储桥的结构
export interface CVBuilderInbox {
  drafts: CVModuleDraft[]
  lastUpdated: string
}

// 存储操作结果
export interface StorageResult {
  ok: boolean
  id?: string      // 成功时返回生成的模块ID
  error?: string   // 失败时返回错误信息
}

// JD Record type definition for Supabase jd_records table
export interface JDRecord {
  id: string
  user_id: string
  created_at: string
  updated_at: string

  // Core fields
  title: string
  company: string
  full_job_description?: string

  // Analysis results
  jd_key_sentences?: string
  keywords_from_sentences?: string
  match_score: number // 1-5 range, required

  // Classification tags
  application_stage?: string
  comment?: string

  // CV related
  cv_pdf_url?: string
  cv_pdf_filename?: string
}

// For API requests
export interface CreateJDRequest {
  title: string
  company: string
  full_job_description?: string
  application_stage?: string
  comment?: string
  match_score?: number // 1-5 range, defaults to 3
}

export interface UpdateJDRequest extends Partial<CreateJDRequest> {
  id: string
}

// JD2CV workflow stage options
export const APPLICATION_STAGES = [
  'Raw JD',
  'Applied'
] as const

export type ApplicationStage = typeof APPLICATION_STAGES[number]

// Experience Record type
export interface ExperienceRecord {
  id: string
  user_id: string
  jd_id: string | null
  company: string
  title: string
  experience: string
  keywords: string[]
  work_or_project: string | null
  time: string | null
  comment: string | null
  created_at: string
}

// JD Analysis structure
export interface JDAnalysis {
  keySentences: string[]
  keywords: {
    flat: string[]
    groups?: string[][]
  }
}

// Unified API response format
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}