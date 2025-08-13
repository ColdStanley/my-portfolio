// 跨页面共享的工具函数
import { CVModuleDraft, CVBuilderInbox, StorageResult } from './types'

/**
 * 从优化内容中提取条目列表
 * @param text 原始优化内容文本
 * @returns 处理后的条目数组
 */
export function extractBullets(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [''] // 兜底返回空项，保持与CV Builder一致
  }

  // 1. 按换行符拆分
  const rawLines = text.split('\n')
  
  // 2. 处理每一行
  const processedItems: string[] = []
  
  for (const line of rawLines) {
    // 去掉开头的项目符号: ^(\s*[-*•·]|\d+\.)\s*
    const cleanLine = line.replace(/^\s*([-*•·]|\d+\.)\s*/g, '').trim()
    
    // 跳过空行
    if (cleanLine.length === 0) continue
    
    // 处理嵌套列表（缩进>=2个空格的行）
    if (line.match(/^\s{2,}/)) {
      // 如果是缩进行且前面有内容，用分号连接到上一项
      if (processedItems.length > 0) {
        processedItems[processedItems.length - 1] += '; ' + cleanLine
      } else {
        // 如果开头就是缩进行，直接作为第一项
        processedItems.push(cleanLine)
      }
    } else {
      // 普通行直接添加
      processedItems.push(cleanLine)
    }
  }
  
  // 3. 最终过滤和兜底处理
  const finalItems = processedItems
    .map(item => item.trim())
    .filter(item => item.length >= 2) // 只保留长度>=2的有效内容
  
  // 兜底：如果没有有效项，返回空字符串数组
  return finalItems.length > 0 ? finalItems : ['']
}

/**
 * 生成模块标题
 * @param company 公司名称
 * @param title 职位标题
 * @param time 时间信息
 * @returns 格式化的标题字符串
 */
export function generateModuleTitle(company?: string, title?: string, time?: string): string {
  const parts = [company, title, time].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : 'Experience'
}

/**
 * 生成唯一模块ID
 * @returns 基于时间戳的唯一ID
 */
export function generateModuleId(): string {
  return `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// localStorage存储桥常量
const CVBUILDER_INBOX_KEY = 'cvbuilder_inbox'

/**
 * 发送模块草稿到One Click PDF收件箱
 * @param draft 模块草稿数据
 * @returns 操作结果，包含成功标识和生成的模块ID
 */
export function sendToOneClickPDFInbox(draft: CVModuleDraft): StorageResult {
  try {
    // 生成唯一ID用于后续focus
    const moduleId = generateModuleId()
    const draftWithId = { ...draft, id: moduleId }
    
    // 读取现有inbox数据
    const existingData = localStorage.getItem(CVBUILDER_INBOX_KEY)
    let inbox: CVBuilderInbox
    
    if (existingData) {
      try {
        inbox = JSON.parse(existingData)
        // 确保数据结构正确
        if (!Array.isArray(inbox.drafts)) {
          inbox = { drafts: [], lastUpdated: new Date().toISOString() }
        }
      } catch {
        // 解析失败，重新初始化
        inbox = { drafts: [], lastUpdated: new Date().toISOString() }
      }
    } else {
      // 首次创建
      inbox = { drafts: [], lastUpdated: new Date().toISOString() }
    }
    
    // 添加新草稿
    inbox.drafts.push(draftWithId)
    inbox.lastUpdated = new Date().toISOString()
    
    // 写入localStorage
    localStorage.setItem(CVBUILDER_INBOX_KEY, JSON.stringify(inbox))
    
    return {
      ok: true,
      id: moduleId
    }
  } catch (error) {
    // localStorage写入失败（通常是容量满了）
    return {
      ok: false,
      error: 'Storage seems full. Clear Inbox and try again.'
    }
  }
}

// Backward compatibility alias
export const sendToCVBuilderInbox = sendToOneClickPDFInbox

/**
 * 从CV Builder收件箱读取并清空草稿
 * @returns 所有待处理的草稿数组
 */
export function ingestInboxAndClear(): CVModuleDraft[] {
  try {
    const existingData = localStorage.getItem(CVBUILDER_INBOX_KEY)
    
    if (!existingData) {
      return [] // 没有待处理数据
    }
    
    const inbox: CVBuilderInbox = JSON.parse(existingData)
    const drafts = Array.isArray(inbox.drafts) ? inbox.drafts : []
    
    // 清空inbox
    localStorage.removeItem(CVBUILDER_INBOX_KEY)
    
    return drafts
  } catch (error) {
    console.error('Failed to ingest inbox data:', error)
    // 清理损坏的数据
    localStorage.removeItem(CVBUILDER_INBOX_KEY)
    return []
  }
}

/**
 * 清空CV Builder收件箱（用于容量满时的紧急清理）
 */
export function clearCVBuilderInbox(): void {
  try {
    localStorage.removeItem(CVBUILDER_INBOX_KEY)
  } catch (error) {
    console.error('Failed to clear inbox:', error)
  }
}

/**
 * 获取收件箱状态信息（用于调试）
 * @returns 收件箱信息
 */
export function getInboxInfo(): { count: number; sizeMB: number } {
  try {
    const existingData = localStorage.getItem(CVBUILDER_INBOX_KEY)
    if (!existingData) {
      return { count: 0, sizeMB: 0 }
    }
    
    const inbox: CVBuilderInbox = JSON.parse(existingData)
    const count = Array.isArray(inbox.drafts) ? inbox.drafts.length : 0
    const sizeMB = new Blob([existingData]).size / (1024 * 1024)
    
    return { count, sizeMB: Math.round(sizeMB * 100) / 100 }
  } catch {
    return { count: 0, sizeMB: 0 }
  }
}

/**
 * 检查是否存在重复的模块草稿
 * @param draft 待检查的草稿
 * @returns 是否存在疑似重复
 */
export function checkDuplicateDraft(draft: CVModuleDraft): boolean {
  try {
    // 检查inbox中的重复
    const existingInboxData = localStorage.getItem(CVBUILDER_INBOX_KEY)
    if (existingInboxData) {
      const inbox: CVBuilderInbox = JSON.parse(existingInboxData)
      if (Array.isArray(inbox.drafts)) {
        for (const existingDraft of inbox.drafts) {
          if (isDuplicateDraft(draft, existingDraft)) {
            return true
          }
        }
      }
    }

    // 检查已存储的CV模块中的重复
    const cvBuilderData = localStorage.getItem('cv-builder-data')
    if (cvBuilderData) {
      const data = JSON.parse(cvBuilderData)
      if (Array.isArray(data.modules)) {
        for (const existingModule of data.modules) {
          // 将CVModule转换为CVModuleDraft格式进行比较
          const existingDraft: CVModuleDraft = {
            title: existingModule.title,
            items: existingModule.items,
            sourceType: existingModule.sourceType || 'manual',
            sourceIds: existingModule.sourceIds || { experienceId: existingModule.sourceId || '' },
            meta: existingModule.meta
          }
          if (isDuplicateDraft(draft, existingDraft)) {
            return true
          }
        }
      }
    }

    return false
  } catch (error) {
    console.error('Error checking duplicate draft:', error)
    return false
  }
}

/**
 * 判断两个草稿是否重复
 * @param draft1 草稿1
 * @param draft2 草稿2
 * @returns 是否重复
 */
function isDuplicateDraft(draft1: CVModuleDraft, draft2: CVModuleDraft): boolean {
  // 条件1: sourceIds完全相同
  const sameSourceIds = (
    draft1.sourceIds.experienceId === draft2.sourceIds.experienceId &&
    draft1.sourceIds.jdId === draft2.sourceIds.jdId
  )

  // 条件2: items逐项完全一致（先trim再比较）
  const sameItems = (
    draft1.items.length === draft2.items.length &&
    draft1.items.every((item, index) => 
      item.trim() === draft2.items[index]?.trim()
    )
  )

  // 双条件精确匹配
  return sameSourceIds && sameItems
}