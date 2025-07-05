from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.deepseek_embedding_api import router as embedding_router

app = FastAPI()

# ✅ 精确 CORS 设置：只允许本地与正式站点访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://stanleyhi.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 注册 DeepSeek 向量生成路由
app.include_router(embedding_router)
