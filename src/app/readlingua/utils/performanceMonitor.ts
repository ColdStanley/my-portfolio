// 性能监控工具
// 帮助测试和验证ReadLingua的性能优化效果

interface PerformanceMetrics {
  renderCount: number
  lastRenderTime: number
  totalRenderTime: number
  averageRenderTime: number
  cacheHitCount: number
  cacheMissCount: number
  cacheHitRate: number
}

class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>()
  
  // 记录组件渲染
  recordRender(componentName: string, renderTime?: number) {
    const now = Date.now()
    const actualRenderTime = renderTime || now
    
    const existing = this.metrics.get(componentName) || {
      renderCount: 0,
      lastRenderTime: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      cacheHitCount: 0,
      cacheMissCount: 0,
      cacheHitRate: 0
    }
    
    existing.renderCount++
    existing.lastRenderTime = actualRenderTime
    existing.totalRenderTime += (actualRenderTime - existing.lastRenderTime)
    existing.averageRenderTime = existing.totalRenderTime / existing.renderCount
    
    this.metrics.set(componentName, existing)
  }
  
  // 记录缓存命中/未命中
  recordCacheHit(componentName: string) {
    const existing = this.metrics.get(componentName) || {
      renderCount: 0,
      lastRenderTime: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      cacheHitCount: 0,
      cacheMissCount: 0,
      cacheHitRate: 0
    }
    
    existing.cacheHitCount++
    existing.cacheHitRate = existing.cacheHitCount / (existing.cacheHitCount + existing.cacheMissCount) * 100
    
    this.metrics.set(componentName, existing)
  }
  
  recordCacheMiss(componentName: string) {
    const existing = this.metrics.get(componentName) || {
      renderCount: 0,
      lastRenderTime: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      cacheHitCount: 0,
      cacheMissCount: 0,
      cacheHitRate: 0
    }
    
    existing.cacheMissCount++
    existing.cacheHitRate = existing.cacheHitCount / (existing.cacheHitCount + existing.cacheMissCount) * 100
    
    this.metrics.set(componentName, existing)
  }
  
  // 获取性能报告
  getReport(): Record<string, PerformanceMetrics> {
    const report: Record<string, PerformanceMetrics> = {}
    this.metrics.forEach((value, key) => {
      report[key] = { ...value }
    })
    return report
  }
  
  // 清空统计数据
  reset() {
    this.metrics.clear()
  }
  
  // 获取摘要
  getSummary() {
    const report = this.getReport()
    const components = Object.keys(report)
    
    if (components.length === 0) {
      return {
        totalComponents: 0,
        totalRenders: 0,
        averageRenderTime: 0,
        bestPerformer: null,
        worstPerformer: null,
        overallCacheHitRate: 0
      }
    }
    
    const totalRenders = components.reduce((sum, comp) => sum + report[comp].renderCount, 0)
    const totalRenderTime = components.reduce((sum, comp) => sum + report[comp].totalRenderTime, 0)
    const totalCacheHits = components.reduce((sum, comp) => sum + report[comp].cacheHitCount, 0)
    const totalCacheAttempts = components.reduce((sum, comp) => 
      sum + report[comp].cacheHitCount + report[comp].cacheMissCount, 0)
    
    const bestPerformer = components.reduce((best, current) => 
      report[current].averageRenderTime < report[best].averageRenderTime ? current : best)
    
    const worstPerformer = components.reduce((worst, current) => 
      report[current].averageRenderTime > report[worst].averageRenderTime ? current : worst)
    
    return {
      totalComponents: components.length,
      totalRenders,
      averageRenderTime: totalRenderTime / totalRenders || 0,
      bestPerformer: bestPerformer ? {
        name: bestPerformer,
        averageRenderTime: report[bestPerformer].averageRenderTime
      } : null,
      worstPerformer: worstPerformer ? {
        name: worstPerformer,
        averageRenderTime: report[worstPerformer].averageRenderTime
      } : null,
      overallCacheHitRate: totalCacheAttempts > 0 ? (totalCacheHits / totalCacheAttempts * 100) : 0
    }
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// React Hook用于在组件中记录渲染性能
export const useRenderPerformance = (componentName: string) => {
  if (typeof window === 'undefined') {
    return {
      recordCacheHit: () => {},
      recordCacheMiss: () => {}
    }
  }
  
  const startTime = Date.now()
  
  // 模拟useEffect行为
  setTimeout(() => {
    const endTime = Date.now()
    performanceMonitor.recordRender(componentName, endTime - startTime)
  }, 0)
  
  return {
    recordCacheHit: () => performanceMonitor.recordCacheHit(componentName),
    recordCacheMiss: () => performanceMonitor.recordCacheMiss(componentName)
  }
}

// 导出类型
export type { PerformanceMetrics }