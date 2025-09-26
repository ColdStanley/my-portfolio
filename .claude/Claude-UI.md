1. 全局原则

所有 UI 必须基于 Design System

不得硬编码颜色，必须使用 theme tokens

说明：本文件中所有色值仅为示例。实际颜色必须从项目内的 theme.config.ts 读取。

2. 设计哲学

统一框架 + 差异化风格
全站共享同一 Design System，但品牌色必须由 theme.config.ts 定义。

品牌优先
主色必须体现站点独特身份（当前全站 Brand Primary = #111111 黑色，Accent = #F4D35E 温暖黄）。

一致体验
间距、排版、阴影、圆角统一，确保整体专业度。

内容优先
UI 围绕内容组织，而不是靠花哨颜色或渐变。

质感导向
通过背景层次、边框、阴影制造高级感，不依赖玻璃态或渐变。

3. 基础 Design System
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

字重：400–700

标题：text-2xl font-semibold

正文：text-base text-gray-700

辅助文字：text-sm text-gray-500

4. 色彩系统（Theme Tokens）

所有颜色必须从 theme.config.ts 引入。
当前站点品牌色：

Brand Primary = #111111 黑色

Brand Secondary = #9CA3AF 灰色

Accent = #F4D35E 温暖黄

Success / Warning / Error = 已在 theme.config.ts 定义

Neutrals（层次灰）= neutralLight / neutralDark

使用规则

主色（primary）：仅用于按钮、导航激活、重点强调

页面背景：白色或浅灰

卡片背景：浅灰

点缀色（accent）：仅用于小范围强调，不得大面积使用

hover/active：必须通过亮度和阴影调整实现

hover: brightness-105 shadow-md

active: brightness-95

5. 组件规范
Buttons
// Primary
<Button variant="primary">
  Primary Action
</Button>

// Secondary
<Button variant="secondary">
  Secondary Action
</Button>


封装后的 class 规则：

Primary: bg-[var(--primary)] text-white

Secondary: border border-[var(--primary)] text-[var(--primary)]

Cards
<Card>
  {/* Content */}
</Card>


封装后的 class 规则：

bg-[var(--neutralLight)] rounded-lg shadow-md border border-[var(--neutralDark)]

Navigation

活跃状态必须使用 Brand Primary 高亮（文字或下划线）

禁止使用玻璃态模糊背景

Input
<Input placeholder="Type here..." />


封装后的 class 规则（需通过 theme token 注入）：

w-full px-md py-sm

rounded-medium border border-[var(--neutralDark)]

bg-[var(--neutralLight)] text-base text-[var(--neutralDark)]

transition duration-200

状态样式

默认：背景 = neutralLight，边框 = neutralDark，文字 = neutralDark

hover：brightness-105 shadow-sm

focus：border-[var(--primary)] shadow-md outline-none

disabled：bg-[var(--neutralDark)]/10 text-[var(--neutralDark)]/50 cursor-not-allowed

error：border-[var(--error)] text-[var(--error)]，下方可显示 <p className="text-sm text-[var(--error)] mt-xs">Error message</p>

类型扩展

Text / Password / Email / Number：统一由 Input 封装，通过 type 控制

Textarea：继承 Input 样式，增加 min-h-[120px] resize-y

6. 交互与反馈

表单必须有 focus / hover / disabled 状态

加载必须有 Skeleton 或 Spinner

微交互统一：transition duration-200

质感主要来自：

背景层次（白 + 浅灰）

边框分隔（细灰线）

阴影层级（shadow-sm → shadow-lg）

亮度微调（hover/active）

7. 禁止模式（CRITICAL）

❌ 玻璃态（backdrop-blur + 半透明）

❌ 渐变按钮 / 渐变文字

❌ 硬编码颜色

❌ 每个页面自定义颜色

8. 响应式规范

当前阶段：桌面端优先开发

移动端支持：非强制，可延后

不得预设 mobile-first class，直到进入移动端优化阶段

9. 高级感增强补充

为避免单调并提升质感，所有组件需增加以下元素：

9.1 层次与结构

Section Header：增加细分隔线（border-b border-[var(--neutralDark)]/20 + padding）。

卡片背景比主背景略深，内部再用浅色分隔线。

9.2 Input 升级

内阴影：shadow-inner，增强嵌入感。

Label + Helper Text：统一排版（text-sm label + text-xs 辅助文字）。

支持左侧 icon 插槽 + 右侧状态提示。

Focus Ring：ring-2 ring-[var(--primary)]/40，更有层次感。

9.3 Button 升级

Hover：亮度提升 + 阴影 (brightness-105 shadow-md)。

Active：下压感 (translate-y-[1px] shadow-sm)。

支持 icon 插槽，不影响文字居中。

9.4 Card 升级

圆角：统一 rounded-large。

Hover：轻微浮起 (shadow-lg translate-y-[-1px])。

Header/Footer：背景可略浅，形成分区。

9.5 全局微交互

所有交互均加 transition-all duration-200 ease-in-out。

Focus/hover 状态必须有明确视觉反馈。