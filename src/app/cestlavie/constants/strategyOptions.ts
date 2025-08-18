/**
 * Strategy category options - unified across all components
 */
export const STRATEGY_CATEGORY_OPTIONS = [
  'Career', 
  'Health', 
  'Finance', 
  'Personal', 
  'Learning', 
  'Relationships'
] as const

export type StrategyCategoryType = typeof STRATEGY_CATEGORY_OPTIONS[number]