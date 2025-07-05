from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.deepseek_embedding_api import router as embedding_router

app = FastAPI()

# ✅ CORS 设置：允许前端访问（包括本地和生产环境）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可改为 ["https://your-site.com"] 更严格
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 注册 DeepSeek 向量生成路由
app.include_router(embedding_router)
