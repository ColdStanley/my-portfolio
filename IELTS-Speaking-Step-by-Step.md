# IELTS Speaking Step by Step 项目设计

## 项目概述

借助大模型（ChatGPT & DeepSeek），从雅思口语出题开始，一步一步引导用户完成雅思口语的练习。

## 核心流程设计

### AI引导学习的4个步骤

**1. AI出题**
- 根据IELTS标准生成适合的题目
- Part 1: 个人信息、日常话题
- Part 2: 话题卡（描述类题目）
- Part 3: 抽象讨论、深度分析

**2. AI题目分析**
- 解析题目核心要求和关键词
- 说明评分要点和答题思路
- 提供题目背景和出题意图分析

**3. AI提问引导**
- 通过启发式问题帮用户构思内容
- 引导用户思考相关经历、观点、例子
- 激发灵感，让用户有素材可说

**4. AI个性化建议**
- 基于用户的内容想法提供具体建议
- 推荐回答框架和逻辑结构
- 提供实用连接词和高分表达
- 针对性的语法和词汇优化建议

**（后续步骤待开发）**
- 录音练习与语音分析
- 实时反馈与改进建议
- 多轮练习与进步追踪

### 各Part具体流程

#### Part 1 引导流程
- AI出题 → AI题目分析 → AI提问引导 → AI个性化建议 → 用户录音回答 → AI分析语音 → 提供改进建议 → 再次练习

#### Part 2 结构化训练
- 话题卡生成 → AI题目分析 → AI提问引导 → AI个性化建议 → 1分钟准备计时 → 2分钟录音 → AI逐句分析 → 词汇/语法优化建议

#### Part 3 深度讨论
- 基于Part 2话题延伸 → AI题目分析 → AI提问引导 → AI个性化建议 → 用户回答 → 批判性思维指导

## 技术实现方案

### 实时语音识别API选择

#### 推荐方案（按优先级）

**1. OpenAI Whisper API（推荐）**
- **优势**：准确度极高，支持多语言，噪音处理好
- **成本**：$0.006/分钟，性价比高
- **实现**：POST音频文件到API，返回转录文本
- **延迟**：~2-3秒处理时间

**2. Web Speech API（浏览器原生）**
- **优势**：免费，实时性最好，无服务器成本
- **缺点**：准确度一般，依赖浏览器支持
- **适用**：快速原型，降低成本

**3. Azure Speech Services**
- **优势**：实时流式识别，发音评分功能
- **成本**：$1/小时（标准版）
- **特色**：专门的发音评估API，适合语言学习

**4. Google Cloud Speech-to-Text**
- **优势**：准确度高，实时流式
- **成本**：$0.024/分钟（标准模型）
- **特色**：支持说话者分离

#### 推荐技术栈
- **前端录音**：MediaRecorder API
- **实时处理**：WebSocket + Whisper API
- **备用方案**：Web Speech API（降级处理）
- **音频格式**：WAV/MP3，16kHz采样率

#### 实现策略
1. 用户说话时实时录音
2. 按段落分块发送到Whisper API
3. 返回转录文本实时显示
4. 结束后完整分析语法/词汇

## AI智能分析功能

### 语音处理
- 实时语音识别（Web Speech API）
- 发音准确度评分
- 语速、停顿分析
- 语音转文字准确率提升

### AI智能分析
- 语法错误检测与修正
- 词汇丰富度评估
- 流利度打分
- 逻辑结构分析
- 个性化改进建议

### 渐进式学习路径
- 难度递增的题目推荐
- 弱项针对性练习
- 历史表现追踪
- 学习进度可视化

### 用户体验优化
- 模拟真实考试环境
- 计时器与倒计时
- 录音回放功能
- 一键重新录制
- 离线练习支持

## 前端开发方案

### 开发测试时数据保存
- **localStorage**：保存用户学习进度、步骤结果
- **Zustand store**：管理当前会话状态和UI状态
- **Mock AI API**：模拟AI返回，快速测试界面交互

### 技术栈
- **框架**：Next.js 15 + TypeScript
- **状态管理**：Zustand with persist middleware
- **样式**：Tailwind CSS（紫色主题）
- **布局**：Dashboard + Learning 双标签页

### 组件架构
```
/ielts-speaking-step-by-step/
├── page.tsx                    # 主页面（标签切换）
├── store/
│   └── useIELTSStepStore.ts   # Zustand 状态管理
└── components/
    ├── DashboardTab.tsx        # 总览页面
    ├── LearningTab.tsx         # 学习页面
    └── StepComponent.tsx       # 步骤组件（核心）
```

### 数据结构
```typescript
interface StepResult {
  content: string      // AI返回内容
  timestamp: Date      // 完成时间
  prompt?: string      // 使用的prompt
}

interface PartProgress {
  currentStep: number           // 当前步骤
  stepResults: Record<number, StepResult>  // 各步骤结果
  isCompleted: boolean         // 是否完成
}
```

### Mock AI 响应
- 当前实现了4个步骤的模拟响应
- 步骤2-4会自动引用前面步骤的内容
- 1秒延迟模拟真实API调用

## 技术决策记录

- **语音识别首选**：OpenAI Whisper API（性价比和准确度最佳）
- **实时性需求**：WebSocket + 分块处理
- **降级方案**：Web Speech API作为备选
- **前端优先开发**：使用 localStorage + Mock API 进行快速迭代