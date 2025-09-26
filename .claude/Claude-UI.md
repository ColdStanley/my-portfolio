1. 设计哲学

统一框架 + 差异化风格：所有项目遵循相同的 Design System，但每个项目必须定义独特的品牌色与差异化交互

品牌优先：主色必须体现项目独特身份，不能使用默认紫蓝渐变

一致体验：间距、排版、阴影、圆角统一，确保整体专业度

2. 基础 Design System
Spacing（基于 4px grid）

xs = 4px

sm = 8px

md = 16px

lg = 24px

xl = 32px

Radius

small = 4px

medium = 8px

large = 16px

Elevation (Shadow)

base: shadow-sm

card: shadow-md

overlay: shadow-lg

hover: shadow-xl

Typography

字体：Inter 或 system-ui

权重范围：400–700

标题：text-2xl font-semibold

正文：text-base text-gray-700

辅助文字：text-sm text-gray-500

3. 色彩系统（Theme Tokens）

所有颜色必须从 theme.config.ts 中引入，不允许硬编码。

每个项目必须定义：

Brand Primary（主色，独一无二）

Brand Secondary（辅助色，通常是灰阶或品牌扩展色）

Accent（点缀色）

Semantic Colors：Success / Warning / Error

示例：

// theme.config.ts
export const theme = {
  primary: "#0F9D58",    // 独特品牌色（例：Google Drive 绿色）
  secondary: "#202124", // 深色灰，用于文本和背景
  accent: "#F4B400",    // 点缀（例：Google Calendar 黄）
  success: "#34A853",
  error: "#EA4335"
}

4. 组件规范
Buttons

主按钮：Brand Primary 填充，白字

次按钮：透明背景 + Brand Primary 边框

禁止渐变按钮（保持品牌色的纯度）

<button className="px-4 py-2 rounded-md font-medium bg-[color:var(--primary)] text-white hover:opacity-90">
  Primary Action
</button>

Cards

背景：bg-white

阴影：shadow-md hover:shadow-lg

圆角：rounded-lg

内边距：16px

<div className="bg-white rounded-lg shadow-md hover:shadow-lg p-4">
  {/* Card content */}
</div>

Navigation

顶部导航栏或侧边栏必须有 Brand Primary 高亮

活跃状态：Brand Primary 下划线或文字高亮

禁止使用玻璃态模糊背景

5. 差异化要求（CRITICAL）

每个项目必须定义：

独特的 Brand Primary（不能和其他项目重复）

至少一个差异化交互（例如：

Timeline 时间轴

Masonry 瀑布流

Drag & Drop

动态背景（粒子、流动渐变）

Floating Chips / 标签系统
）

👉 这样可以保证每个项目有自己的「特色体验」，避免千篇一律的 vibe coding。

6. 响应式规范

移动端优先：所有组件必须有 sm: / md: 断点适配

桌面端：侧边栏 / 多列布局

移动端：底部导航 / 单列布局

7. 禁止模式

禁止玻璃态（backdrop-blur + 半透明）

禁止渐变按钮（改用纯色 Brand Primary）

禁止硬编码颜色（必须引用 theme tokens）

禁止使用 Linear-style 渐变文字