// 跨页面数据传输的共享类型定义

export interface CVModuleDraft {
  id?: string                     // 可选，由存储桥生成
  title: string                   // ${company} · ${title}（${time}）格式，缺失项跳过
  items: string[]                 // 从optimizedContent拆行得到，去空行+trim+去前缀符号
  width?: number                  // 可省略，统一由Builder默认50%
  sourceType: 'optimized'         // 固定标识
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