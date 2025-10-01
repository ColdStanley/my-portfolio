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

按钮层级系统（CRITICAL）

一级按钮（主要动作）
- 用途：页面或功能模块的核心操作（如"提交"、"保存"、"开始"）
- 样式：variant="primary" + 标准尺寸（text-sm + 适当padding）
- 数量限制：每个功能模块最多1个一级按钮

二级按钮（次要动作）
- 用途：支持性操作、状态切换、导航（如"预览"、"下载"、"切换"）
- 样式：variant="secondary" + 小尺寸（text-xs + px-3 py-1）
- 应用场景：工作流程中的步骤按钮、功能面板的操作按钮

// Primary（一级按钮）
<Button variant="primary" size="md">
  Customize Resume
</Button>

// Secondary（二级按钮）
<Button variant="secondary" size="sm" className="text-xs px-3 py-1">
  Confirm & Preview
</Button>

封装后的 class 规则：

Primary: bg-[var(--primary)] text-white

Secondary: border border-[var(--primary)] text-[var(--primary)]

按钮层级约束

禁止在同一视图区域使用多个一级按钮

二级按钮必须保持视觉一致性（尺寸、间距、配色）

状态按钮（如tabs）激活时可临时使用primary样式

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

菜单悬浮效果规范：

- 下拉菜单项悬浮：bg-[var(--accent)] + hover:font-medium
- 必须保持颜色一致性：与按钮本身悬浮颜色统一使用温暖黄
- 过渡动画：transition-all duration-150
- 禁止使用左侧边框等额外装饰
- 适用范围：所有下拉菜单

下拉框与模态框动画规范：

- 下拉框淡入：opacity-0 → opacity-100 + scale-95 → scale-100
- 模态框淡入：opacity-0 → opacity-100 + scale-95 → scale-100
- 动画时长：duration-300 ease-out（进入），duration-250 ease-in（退出）
- 背景遮罩：从 opacity-0 到适当透明度的渐变
- 必须支持平滑的显示/隐藏状态切换

通知（Notification）规范（CRITICAL）：

❌ 禁止使用 Toast（弹出式提示框）
✅ 必须使用右上角通知（Notification）形式

Notification 实现规则：
- 位置：固定在页面右上角（fixed top-4 right-4）
- 动画：从右侧滑入（translate-x-full → translate-x-0）
- 持续时间：3-5秒后自动消失（可点击关闭）
- 样式：
  * Success: bg-white border-l-4 border-green-500
  * Error: bg-white border-l-4 border-red-500
  * Info: bg-white border-l-4 border-blue-500
  * Warning: bg-white border-l-4 border-yellow-500
- 必须包含：图标 + 文字 + 关闭按钮
- 阴影：shadow-lg
- 圆角：rounded-lg

用户确认规范：
- 删除操作：直接删除，无需二次确认
- 重要操作（如数据清空）：可使用 Modal 确认，但禁止使用 confirm() 原生弹窗
- 操作结果：使用右上角 Notification 反馈成功/失败

质感主要来自：

背景层次（白 + 浅灰）

边框分隔（细灰线）

阴影层级（shadow-sm → shadow-lg）

亮度微调（hover/active）

6.5 可访问性与对比度规范（CRITICAL）

颜色对比度要求

所有文字与背景必须满足 WCAG AA 标准：
- 正文文字（< 18px）：对比度 ≥ 4.5:1
- 大字体（≥ 18px 或 14px bold）：对比度 ≥ 3:1
- 图标与关键 UI 元素：对比度 ≥ 3:1

颜色组合矩阵（Color Contrast Matrix）

✅ 允许组合：
- bg-primary (#111111) + text-white：对比度 16.5:1 ✓
- bg-white + text-primary (#111111)：对比度 16.5:1 ✓
- bg-accent (#F4D35E) + text-primary (#111111)：对比度 8.2:1 ✓
- bg-neutralLight + text-primary：对比度 14.3:1 ✓

❌ 禁止组合：
- bg-primary + text-primary：对比度 1:1（完全不可见）
- bg-white + text-white：对比度 1:1（完全不可见）
- bg-accent + text-white：对比度 2.1:1（不达标）

CSS 变量使用规则

Tailwind 类优先：
- 优先使用 bg-primary、text-primary 等 Tailwind 类
- 确保 tailwind.config.ts 正确映射 CSS 变量

内联样式降级：
- 当 Tailwind 类渲染失败（如背景显示为白色）时，使用内联样式：
  style={{ backgroundColor: 'var(--primary)' }}
- 适用场景：动态状态切换、Portal 组件、复杂嵌套

检查清单（Self-Check Before Commit）

必须检查：
□ 所有按钮在不同状态（default/hover/active/disabled）下文字清晰可见
□ 所有选中状态（selected/active tab）的文字与背景有足够对比度
□ 所有 Input/Textarea 的 placeholder 文字可读（不得过浅）
□ 所有 Toast/Alert 的文字与背景对比度达标
□ 禁止出现「白字白底」或「黑字黑底」
□ 禁止在 primary (#111111) 背景上使用 text-primary

状态颜色指引

Default：
- Primary Button：bg-primary + text-white
- Secondary Button：border-primary + text-primary + bg-white

Hover：
- Primary Button：bg-primary + brightness-110 + text-white
- Secondary Button：bg-primary + text-white（反转）

Active/Selected：
- Tab/Item：bg-primary + text-white（必须确保白色文字显示）
- Badge：bg-accent + text-primary

Disabled：
- 所有按钮：opacity-50 + cursor-not-allowed
- 禁止改变颜色，仅降低透明度

7. 禁止模式（CRITICAL）

❌ 玻璃态（backdrop-blur + 半透明）

❌ 渐变按钮 / 渐变文字

❌ 硬编码颜色

❌ 每个页面自定义颜色

❌ Toast 提示（必须使用右上角 Notification）

❌ confirm() / alert() 原生弹窗（必须使用自定义 Modal 或 Notification）

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