# CLAUDE.md

## 1. 回答规则（Claude 使用方式）
- 如何回答（简洁/完整代码/Note 格式说明等）

## 2. 全局强制规范（CRITICAL）
- 必须遵守的红线（Streaming、独立 API、状态管理、禁止 reload、禁止多重滚动）

## 3. 设计规范引用（UI 指向）
- 明确指向 Claude-UI.md
- 定义全局要求：所有 UI 必须基于 Design System
- 禁止硬编码颜色，必须使用 theme tokens

## 4. 架构 & 工程规范
- 项目目录结构、命名规范、TypeScript 类型约束
- API 错误处理、全局错误边界
- 环境变量与安全性

## 5. 性能与可维护性
- Code Splitting、Lazy loading
- 状态保存策略
- Logging/Monitoring 的基本要求
