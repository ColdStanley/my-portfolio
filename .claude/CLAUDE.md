# CLAUDE.md

## 1. 回答规则（Claude 使用方式）
- 如何回答（简洁/完整代码/Note 格式说明等）
- 每个回答必须基于代码，而不是推测或者猜测

## 2. 全局强制规范（CRITICAL）
- 必须遵守的红线（Streaming、独立 API、状态管理、禁止 reload、禁止多重滚动）

## 3. 设计规范引用（UI 指向）
- 明确指向 Claude-UI.md
- 定义全局要求：所有 UI 必须基于 Design System
- 禁止硬编码颜色，必须使用 theme tokens
- **说明：示例色值仅为演示。实际品牌色必须读取项目内的 `theme.config.ts`，全站保持唯一品牌色，不允许 Claude 自行决定颜色。**

## 4. 架构 & 工程规范
- 项目目录结构、命名规范、TypeScript 类型约束
- API 错误处理、全局错误边界
- 环境变量与安全性

## 5. 性能与可维护性
- Code Splitting、Lazy loading
- 状态保存策略
- Logging/Monitoring 的基本要求

---

## 设计哲学

- **统一框架 + 差异化风格**：所有项目遵循相同的 Design System，但全站只允许一个 `theme.config.ts` 定义品牌色。  
- **品牌优先**：主色必须体现站点独特身份，不允许默认紫蓝渐变。  
- **一致体验**：间距、排版、阴影、圆角统一，确保整体专业度。  
- **内容优先**：UI 围绕内容组织，而不是靠花哨颜色。  
- **质感导向**：通过背景层次、边框、阴影制造高级感，而不是渐变或玻璃态。  

---

## 色彩系统（Theme Tokens）

- 所有颜色必须从 `theme.config.ts` 中引入  
- 全站主色（Brand Primary）= **#111111 黑色**  
- 点缀色（Accent）= **#F4D35E 温暖黄**  
- 辅助灰阶、背景、文本 = `theme.config.ts`  

禁止：
- ❌ 硬编码颜色  
- ❌ 紫色系、渐变背景、玻璃态效果  
- ❌ 每个项目自定颜色  

---

## 封装规范（CRITICAL）

- Button、Card、Input、Dialog、Tooltip 必须封装  
- 业务组件只能调用封装组件  
- 所有 className 必须走 token，不得直接拼接颜色  

