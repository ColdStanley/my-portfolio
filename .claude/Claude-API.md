## Architecture Overview
Next.js 15 portfolio with TypeScript, Zustand, Supabase, modular components

## AI Streaming Response (MANDATORY)
```ts
await aiApi.processQueryStream(
  { query, model, prompt },
  (chunk: string) => {
    fullResponse += chunk
    updateUI({ response: fullResponse, isLoading: true })
  },
  () => updateUI({ isLoading: false })
)
Independent AI API Principles

❌ 不允许共享 API

❌ 不允许跨项目依赖

✅ 每个项目必须有 /api/[project]/generate/route.ts

✅ 每个 API 都必须：

自定义 system prompt

支持 DeepSeek 默认，OpenAI 可选

支持 Streaming

项目特定的 error handling

合理 token 限制