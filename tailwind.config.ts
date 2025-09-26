// theme.config.ts
// ---------------------------------------------------
// 全局主题配置文件
// 所有 UI 必须引用这里的变量，禁止硬编码颜色
// 每个项目必须定义独特的 Brand Primary & Secondary
// ---------------------------------------------------

export const theme = {
  // ---- Brand Colors ----
  primary: "#0F9D58",    // Brand Primary: 主色（项目独一无二）
  secondary: "#202124",  // Brand Secondary: 辅助色（通常为中性/灰阶）

  // ---- Accent Colors ----
  accent: "#F4B400",     // Accent: 点缀色（按钮/强调元素）
  neutral: "#5F6368",    // Neutral: 中性色（边框/分隔符）

  // ---- Semantic Colors ----
  success: "#34A853",    // 成功状态 (✓)
  warning: "#FBBC05",    // 警告状态 (!)
  error: "#EA4335",      // 错误状态 (✗)

  // ---- Background ----
  background: "#FFFFFF", // 默认背景
  surface: "#F8F9FA",    // 卡片/面板背景

  // ---- Text ----
  textPrimary: "#202124",   // 主要文字
  textSecondary: "#5F6368", // 次要文字
}
