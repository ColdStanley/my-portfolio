/**
 * 统一的项目配置管理
 * 解决各模块使用不同项目ID的问题
 */

export const PROJECT_CONFIG = {
  // 主要产品映射
  PRODUCTS: {
    CESTLAVIE: 'cestlavie',
    IELTS_SPEAKING: 'ielts-speaking', 
    FEELINK: 'feelink',
    JOB_APPLICATION: 'job-application',
    NOTION_WRITER: 'notion-writer',
    FRENOTES: 'frenotes',
    LUEUR: 'lueur',
    ENGLISH_READING: 'english-reading'
  } as const,

  // 模块到产品的映射（用于路由模块）
  MODULE_MAPPING: {
    '/cestlavie': 'cestlavie',
    '/new-ielts-speaking': 'ielts-speaking',
    '/ielts-speaking': 'ielts-speaking',
    '/feelink': 'feelink',
    '/job-application': 'job-application',
    '/notion-writer': 'notion-writer',
    '/frenotes': 'frenotes',
    '/lueur': 'lueur',
    '/ielts-reading': 'english-reading'
  } as const,

  // 根据路径获取产品ID
  getProductIdFromPath: (pathname: string): string => {
    // 精确匹配
    if (PROJECT_CONFIG.MODULE_MAPPING[pathname as keyof typeof PROJECT_CONFIG.MODULE_MAPPING]) {
      return PROJECT_CONFIG.MODULE_MAPPING[pathname as keyof typeof PROJECT_CONFIG.MODULE_MAPPING];
    }
    
    // 模糊匹配（用于子路径）
    for (const [path, productId] of Object.entries(PROJECT_CONFIG.MODULE_MAPPING)) {
      if (pathname.startsWith(path)) {
        return productId;
      }
    }
    
    // 默认返回主产品
    return PROJECT_CONFIG.PRODUCTS.CESTLAVIE;
  },

  // 默认会员等级
  DEFAULT_MEMBERSHIP_TIER: 'registered' as const
} as const;

export type ProductId = typeof PROJECT_CONFIG.PRODUCTS[keyof typeof PROJECT_CONFIG.PRODUCTS];
export type MembershipTier = 'guest' | 'registered' | 'pro' | 'vip' | 'admin';