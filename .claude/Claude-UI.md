1. 设计哲学

统一框架 + 差异化风格：所有项目遵循相同的 Design System，但每个项目必须定义独特的品牌色与差异化交互。

品牌优先：主色必须体现项目独特身份，不能使用默认紫蓝渐变。

一致体验：间距、排版、阴影、圆角统一，确保整体专业度。

内容优先：UI 必须围绕内容组织，不得反客为主。信息层级通过标题/正文/辅助文字体现语义，而不是靠颜色或花哨样式。

质感导向：通过背景层次、边框、阴影和亮度微调制造高级感，而不是依赖渐变或特效。

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

Neutrals（层次感用灰度）

示例：

// theme.config.ts
export const theme = {
  primary: "#0F9D58",     // 独特品牌色（例：Google Drive 绿色）
  secondary: "#202124",   // 深灰，用于文本和背景
  accent: "#F4B400",      // 点缀（例：Google Calendar 黄）
  success: "#34A853",
  error: "#EA4335",
  neutralLight: "#F8F9FA", // 卡片背景（微妙灰度）
  neutralDark: "#E5E7EB",  // 边框/分隔线
}


配色使用规则：

Brand Primary 仅用于：主按钮、导航激活、重点强调。

页面背景、卡片、正文必须以 白/灰/黑 为主。

禁止大面积使用主题色作为背景。

hover/active 必须有亮度或阴影微调：

hover:brightness-105

active:brightness-95

hover:shadow-md → shadow-lg

4. 组件规范
Buttons
// Primary
<button className="
  px-4 py-2 rounded-md font-medium 
  bg-[color:var(--primary)] text-white
  shadow-sm hover:shadow-md
  hover:brightness-105 active:brightness-95
  transition duration-200
">
  Primary Action
</button>

// Secondary
<button className="
  px-4 py-2 rounded-md font-medium
  border border-[color:var(--primary)] text-[color:var(--primary)]
  hover:bg-[color:var(--neutralLight)]
  transition duration-200
">
  Secondary Action
</button>

Cards
<div className="
  bg-[color:var(--neutralLight)]
  rounded-lg shadow-md hover:shadow-lg
  border border-[color:var(--neutralDark)]
  transition duration-200
">
  {/* Card content */}
</div>

Navigation

顶部导航栏或侧边栏必须有 Brand Primary 高亮

活跃状态：Brand Primary 下划线或文字高亮

禁止使用玻璃态模糊背景

5. 封装规范（CRITICAL）

所有基础 UI 元素（Button、Card、Input、Dialog、Tooltip）必须封装为独立组件。

禁止在业务组件中直接拼接 Tailwind class 来复现样式。

业务组件只能使用 <Button /> <Card /> <Dialog />，不得重复写 class。

6. 交互与反馈

表单必须有 focus / hover / disabled 状态。

加载过程必须有 Skeleton 或 Spinner，不得直接显示 "Loading..."。

微交互：统一使用 transition duration-200，轻微 opacity/scale 效果。

禁止大幅炫技动画（粒子、复杂渐变、3D transform）。

质感来自：

背景层次（白+浅灰）

边框分隔（细灰线）

阴影层级（shadow-sm → shadow-lg）

亮度微调（hover/active）

7. 差异化要求（CRITICAL）

每个项目必须定义：

独特的 Brand Primary（不能和其他项目重复）。

至少一个差异化交互，且必须与核心功能相关。

示例：

SwiftApply → 横向滚动布局 / AI 流式进度展示

ReadLingua → 单词 Tooltip + 双语对照

IELTS Booster → 学习计划生成 + 左侧导航结构

禁止：纯装饰性的差异化（随机粒子、渐变背景）。

8. 响应式规范

当前阶段：桌面端优先开发，保证桌面端体验完整、布局稳定。

移动端支持：不是强制要求，可延后。只在需要时再实现 sm: / md: 断点适配。

代码要求：在未明确移动端规范前，不得预设 mobile-first class（如 sm:block hidden），所有布局以桌面端为主。

未来迁移：待进入移动端优化阶段，再在 Claude-UI.md 发布专门的移动端设计规范。

9. 禁止模式

禁止玻璃态（backdrop-blur + 半透明）。

禁止渐变按钮（改用纯色 Brand Primary）。

禁止硬编码颜色（必须引用 theme tokens）。

禁止使用 Linear-style 渐变文字。

所有封装组件必须在 theme.config.ts 中引用 color token，不得在 props 中接受裸 className 拼接

内联 class 必须迁移到封装组件 props，而不是直接移除