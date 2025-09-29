1. 回答规则
回答风格：简明扼要，直击重点
格式要求：需要分块时，用 Note 格式分隔；禁止只给思路不写代码。

代码规范：所有代码必须严格遵循 TypeScript 类型，不允许使用 any。

自检要求：Claude 在回答前必须检查：

是否引用了 theme tokens（禁止硬编码颜色）。

是否触碰了 CRITICAL 禁区（Streaming、独立 API、状态管理、禁止 reload、禁止多重滚动）。

2. 全局强制规范（CRITICAL）

必须遵守的红线：

Streaming

独立 API

状态管理

禁止 reload

禁止多重滚动

3. 设计规范引用（UI 指向）

所有 UI 规范必须基于 Design System → 详见 Claude-UI.md

禁止硬编码颜色，必须使用 theme tokens

示例色值仅为演示，实际品牌色必须读取项目内的 theme.config.ts

全站保持唯一品牌色，不允许 Claude 自行决定颜色

4. 架构 & 工程规范

项目目录结构、命名规范、TypeScript 类型约束

API 错误处理、全局错误边界

环境变量与安全性

所有 fetch 请求必须走封装的 API 客户端，不允许直接写 fetch()

简洁优先：避免过度工程化，优先选择简单直接的解决方案

5. UI & 设计规范

统一框架 + 差异化风格：所有项目遵循相同的 Design System，全站只允许一个 theme.config.ts 定义品牌色

品牌优先：主色必须体现站点独特身份，不允许默认紫蓝渐变

一致体验：间距、排版、阴影、圆角统一，确保整体专业度

内容优先：UI 围绕内容组织，而不是靠花哨颜色

质感导向：通过背景层次、边框、阴影制造高级感，而不是渐变或玻璃态

6. 色彩系统（Theme Tokens）

所有颜色必须从 theme.config.ts 中引入

全站主色（Brand Primary）= #111111 黑色

点缀色（Accent）= #F4D35E 温暖黄

辅助灰阶、背景、文本 = theme.config.ts

禁止：
❌ 硬编码颜色
❌ 紫色系、渐变背景、玻璃态效果
❌ 每个项目自定颜色

7. 封装规范（CRITICAL）

Button、Card、Input、Dialog、Tooltip 必须封装

业务组件只能调用封装组件

所有 className 必须走 token，不得直接拼接颜色

8. 性能与可维护性

Code Splitting、Lazy loading 必须使用

状态保存策略必须明确（localStorage / Zustand / Supabase）

Logging & Monitoring 必须遵循统一接口，避免散落式 console.log

避免过度优化：仅在确有性能问题时才添加复杂的优化机制（如防抖、缓存等）

9. 测试与质量保证

单元测试：Vitest + Testing Library

E2E 测试：Playwright 或 Cypress

Lint & Format：必须跑 pnpm lint && pnpm format

CI/CD：所有测试必须通过才能合并

新增测试要求（中小团队最佳实践）：

所有新功能必须附带对应测试用例（单元测试或 E2E 测试至少覆盖其主要逻辑）。

提交 PR 前必须跑通本地测试：

pnpm test
pnpm test:e2e


禁止仅依赖手工测试，必须保证自动化测试通过。

10. 注意事项（DO NOT）

❌ 禁止硬编码颜色
❌ 禁止 reload 页面
❌ 禁止多重滚动
❌ 禁止绕过封装组件直接写 UI
❌ 禁止 any 类型
❌ 禁止手动 fetch，必须走封装的 API 客户端
❌ 禁止过度工程化（如不必要的防抖、复杂状态管理、过度抽象）