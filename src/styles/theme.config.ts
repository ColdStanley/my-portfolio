// theme.config.ts for SwiftApply
// ---------------------------------------------------
// SwiftApply 专用主题配置
// 所有 UI 必须引用这里的变量，禁止硬编码颜色
// ---------------------------------------------------

export const theme = {
  // ---- Brand Colors (SwiftApply 独特绿色系) ----
  primary: "#10B981",       // SwiftApply 主色：翠绿色（区别于其他项目）
  secondary: "#1F2937",     // 深灰色：用于文本和深色背景

  // ---- Accent & Neutral ----
  accent: "#F59E0B",        // 点缀色：琥珀色（用于强调元素）
  neutral: "#6B7280",       // 中性色：用于边框和次要元素

  // ---- Semantic Colors ----
  success: "#10B981",       // 成功状态：与主色保持一致
  warning: "#F59E0B",       // 警告状态：与accent保持一致
  error: "#EF4444",         // 错误状态：红色

  // ---- Background & Surface ----
  background: "#FFFFFF",    // 页面背景：纯白
  surface: "#F9FAFB",       // 卡片背景：微妙浅灰

  // ---- Text ----
  textPrimary: "#111827",   // 主要文字：深色
  textSecondary: "#6B7280", // 次要文字：中性灰

  // ---- Neutrals（层次感灰度系统）----
  neutralLight: "#F9FAFB",  // 卡片背景（微妙灰度）
  neutralDark: "#E5E7EB",   // 边框/分隔线

  // ---- Interactive States ----
  hover: {
    brightness: 105,        // hover 亮度提升
    shadow: 'shadow-md'     // hover 阴影等级
  },
  active: {
    brightness: 95,         // active 亮度降低
  }
} as const

// CSS 变量映射（用于 Tailwind 配置）
export const cssVariables = {
  '--primary': theme.primary,
  '--secondary': theme.secondary,
  '--accent': theme.accent,
  '--neutral': theme.neutral,
  '--success': theme.success,
  '--warning': theme.warning,
  '--error': theme.error,
  '--background': theme.background,
  '--surface': theme.surface,
  '--text-primary': theme.textPrimary,
  '--text-secondary': theme.textSecondary,
  '--neutral-light': theme.neutralLight,
  '--neutral-dark': theme.neutralDark,
} as const

// TypeScript 类型定义
export type ThemeColors = keyof typeof theme
export type CssVariables = keyof typeof cssVariables