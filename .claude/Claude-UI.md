👌 明白了，你要的是 **完整版 `Claude-UI.md`**，而且和 `theme.config.ts`、`CLAUDE.md` **严格对齐**，保证以后 Claude Code 不会再乱搞颜色。

我帮你最小修订，保留原有设计框架，只改动必要的地方：

---

# ✅ Claude-UI.md（修订版）

````md
# Claude-UI.md

## 1. 全局原则
- 所有 UI 必须基于 Design System
- 不得硬编码颜色，必须使用 theme tokens
- **说明：本文件中所有色值仅为示例。实际颜色必须从项目内的 `theme.config.ts` 读取。**

---

## 2. 设计哲学
- **统一框架 + 差异化风格**  
  全站共享同一 Design System，但品牌色必须由 `theme.config.ts` 定义。  
- **品牌优先**  
  主色必须体现站点独特身份（当前全站 Brand Primary = `#111111` 黑色，Accent = `#F4D35E` 温暖黄）。  
- **一致体验**  
  间距、排版、阴影、圆角统一，确保整体专业度。  
- **内容优先**  
  UI 围绕内容组织，而不是靠花哨颜色或渐变。  
- **质感导向**  
  通过背景层次、边框、阴影制造高级感，不依赖玻璃态或渐变。  

---

## 3. 基础 Design System

### Spacing（基于 4px grid）
- xs = 4px  
- sm = 8px  
- md = 16px  
- lg = 24px  
- xl = 32px  

### Radius
- small = 4px  
- medium = 8px  
- large = 16px  

### Elevation (Shadow)
- base: shadow-sm  
- card: shadow-md  
- overlay: shadow-lg  
- hover: shadow-xl  

### Typography
- 字体：Inter 或 system-ui  
- 字重：400–700  
- 标题：`text-2xl font-semibold`  
- 正文：`text-base text-gray-700`  
- 辅助文字：`text-sm text-gray-500`  

---

## 4. 色彩系统（Theme Tokens）

所有颜色必须从 `theme.config.ts` 引入。  
当前站点品牌色：  

- Brand Primary = **#111111 黑色**  
- Brand Secondary = **#9CA3AF 灰色**  
- Accent = **#F4D35E 温暖黄**  
- Success / Warning / Error = 已在 `theme.config.ts` 定义  
- Neutrals（层次灰）= `neutralLight` / `neutralDark`  

### 使用规则
- 主色（primary）：仅用于按钮、导航激活、重点强调  
- 页面背景：白色或浅灰  
- 卡片背景：浅灰  
- 点缀色（accent）：仅用于小范围强调，不得大面积使用  
- hover/active：必须通过亮度和阴影调整实现  
  - hover: `brightness-105 shadow-md`  
  - active: `brightness-95`  

---

## 5. 组件规范

### Buttons
```tsx
// Primary
<Button variant="primary">
  Primary Action
</Button>

// Secondary
<Button variant="secondary">
  Secondary Action
</Button>
````

封装后的 class 规则：

* Primary: `bg-[var(--primary)] text-white`
* Secondary: `border border-[var(--primary)] text-[var(--primary)]`

### Cards

```tsx
<Card>
  {/* Content */}
</Card>
```

封装后的 class 规则：

* `bg-[var(--neutralLight)] rounded-lg shadow-md border border-[var(--neutralDark)]`

### Navigation

* 活跃状态必须使用 Brand Primary 高亮（文字或下划线）
* 禁止使用玻璃态模糊背景

---

## 6. 交互与反馈

* 表单必须有 focus / hover / disabled 状态
* 加载必须有 Skeleton 或 Spinner
* 微交互统一：`transition duration-200`
* 质感主要来自：

  * 背景层次（白 + 浅灰）
  * 边框分隔（细灰线）
  * 阴影层级（shadow-sm → shadow-lg）
  * 亮度微调（hover/active）

---

## 7. 禁止模式（CRITICAL）

* ❌ 玻璃态（backdrop-blur + 半透明）
* ❌ 渐变按钮 / 渐变文字
* ❌ 硬编码颜色
* ❌ 每个页面自定义颜色

---

## 8. 响应式规范

* 当前阶段：桌面端优先开发
* 移动端支持：非强制，可延后
* 不得预设 mobile-first class，直到进入移动端优化阶段

```

---

✅ 这样：  
- `theme.config.ts` 定义唯一品牌色（黑+白+温暖黄）  
- `CLAUDE.md` 强调：必须读取 `theme.config.ts`，不能乱来  
- `Claude-UI.md` 提供执行细则，禁止玻璃态/渐变/硬编码  

