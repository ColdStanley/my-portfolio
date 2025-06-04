from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from fastapi.responses import JSONResponse
import google.generativeai as genai
import re
import os


# 配置 Gemini API Key
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

# 初始化 Gemini 模型
model = genai.GenerativeModel("models/gemini-1.5-flash")

# 初始化 FastAPI 应用
app = FastAPI()

# 设置 CORS（允许前端访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求体格式
class PromptRequest(BaseModel):
    part: str
    question: str

# ✅ 简单的内存存储（每日调用次数 + 日期）
request_counter = {
    "date": date.today(),
    "count": 0
}

DAILY_LIMIT = 50  # 可根据需求调整

@app.post("/generate")
async def generate_answer(payload: PromptRequest):
    # ✅ 每日重置计数
    if request_counter["date"] != date.today():
        request_counter["date"] = date.today()
        request_counter["count"] = 0

    # ✅ 超出限制时拒绝请求
    if request_counter["count"] >= DAILY_LIMIT:
        return JSONResponse(
            status_code=429,
            content={"error": "🛑 Daily request limit reached. Please try again tomorrow."}
        )

    # ✅ 累计请求计数
    request_counter["count"] += 1

    # 🔽 以下为原有生成逻辑（不变）
    prompt = f"""
You are a certified IELTS Speaking examiner.

Please evaluate the following IELTS Speaking question from Part {payload.part}:
"{payload.question}"

Your task is to generate answers and examiner comments for **Band 5**, **Band 6**, and **Band 7** levels.

Use the exact format below and do not skip any section:

Band 5 Answer:
<Insert Band 5 sample answer here>

Band 5 Comment:
<Explain why this would receive a Band 5>

Band 6 Answer:
<Insert Band 6 sample answer here>

Band 6 Comment:
<Explain why this would receive a Band 6>

Band 7 Answer:
<Insert Band 7 sample answer here>

Band 7 Comment:
<Explain why this would receive a Band 7>

Be concise and realistic. Keep answers within 3–5 sentences. Use authentic IELTS scoring criteria.
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        def extract_answer_and_comment(band: str):
            ans_match = re.search(fr"{band} Answer[:：]?\s*(.*?)(?=\n{band} Comment[:：])", text, re.DOTALL)
            answer = ans_match.group(1).strip() if ans_match else ""

            comment_match = re.search(fr"{band} Comment[:：]?\s*(.*?)(?=\n|$)", text, re.DOTALL)
            comment = comment_match.group(1).strip() if comment_match else ""

            return answer, comment

        b5, c5 = extract_answer_and_comment("Band 5")
        b6, c6 = extract_answer_and_comment("Band 6")
        b7, c7 = extract_answer_and_comment("Band 7")

        return {
            "band5": b5,
            "comment5": c5,
            "band6": b6,
            "comment6": c6,
            "band7": b7,
            "comment7": c7,
            "fullText": text  # 可供调试用
        }

    except Exception as e:
        return {"error": str(e)}
