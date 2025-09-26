// theme.config.ts
// ---------------------------------------------------
// 全站统一主题配置
// 所有 UI 必须引用这里的变量，禁止硬编码颜色
// ---------------------------------------------------

export const theme = {
  // ---- Brand Colors (Monocle风格，简约+轻奢+优雅) ----
  primary: "#111111",       // 主色：深黑（排版感、高级）
  secondary: "#9CA3AF",     // 辅助灰：中性灰（文本/次要元素）
  accent: "#F4D35E",        // 点缀色：温暖黄（增加能量）

  // ---- Semantic Colors ----
  success: "#34A853",       // 成功：绿色
  warning: "#F4B400",       // 警告：黄色
  error: "#EA4335",         // 错误：红色

  // ---- Background & Surface ----
  background: "#FFFFFF",    // 页面背景：纯白
  surface: "#F8F8F8",       // 卡片背景：微妙灰

  // ---- Text ----
  textPrimary: "#111111",   // 主要文字
  textSecondary: "#6B7280", // 次要文字

  // ---- Neutrals（层次感灰度系统）----
  neutralLight: "#F9FAFB",  // 最浅灰（背景/底色）
  neutralDark: "#E5E7EB",   // 保留，避免 break change
  neutralMid: "#9CA3AF",    // 新增，中灰，用于分隔/边框

  // ---- Interactive States ----
  hover: {
    brightness: 105,
    shadow: "shadow-md",
  },
  active: {
    brightness: 95,
  },
  focus: {
    ring: "#11111166", // 主色 + 40% 透明度
  },

  // ---- Shadows (统一阴影等级) ----
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.15)",
    xl: "0 20px 25px rgba(0,0,0,0.2)",
    inner: "inset 0 2px 4px rgba(0,0,0,0.05)",
  },
} as const

// CSS 变量映射（用于 Tailwind 配置）
export const cssVariables = {
  "--primary": theme.primary,
  "--secondary": theme.secondary,
  "--accent": theme.accent,
  "--success": theme.success,
  "--warning": theme.warning,
  "--error": theme.error,
  "--background": theme.background,
  "--surface": theme.surface,
  "--text-primary": theme.textPrimary,
  "--text-secondary": theme.textSecondary,
  "--neutral-light": theme.neutralLight,
  "--neutral-dark": theme.neutralDark,
  "--neutral-mid": theme.neutralMid,
  "--focus-ring": theme.focus.ring,
} as const

export type ThemeColors = keyof typeof theme
export type CssVariables = keyof typeof cssVariables
