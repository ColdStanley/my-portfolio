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

# 设置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求体数据格式
class PromptRequest(BaseModel):
    part: str
    question: str

# 简单的调用次数限制
request_counter = {
    "date": date.today(),
    "count": 0
}
DAILY_LIMIT = 50

@app.post("/generate")
async def generate_answer(payload: PromptRequest):
    # 每日重置调用次数
    if request_counter["date"] != date.today():
        request_counter["date"] = date.today()
        request_counter["count"] = 0

    if request_counter["count"] >= DAILY_LIMIT:
        return JSONResponse(
            status_code=429,
            content={"error": "🛑 Daily request limit reached. Please try again tomorrow."}
        )

    request_counter["count"] += 1

    # Prompt（去除 Vocabulary 板块）
    prompt = f"""
You are a certified IELTS Speaking examiner.

Please evaluate the following IELTS Speaking question from Part {payload.part}:
"{payload.question}"

Your task is to generate speaking answers and examiner comments for **Band 5**, **Band 6**, and **Band 7** levels.

⚠️ Instructions:
- Follow the exact structure below.
- You must include both an **Answer** and a **Comment** section for each band score.
- Do NOT include any extra sections such as vocabulary lists or explanations.

---

Band 5 Answer:
<Insert Band 5 speaking sample, 3–5 sentences>

Band 5 Comment:
<Insert evaluation comment based on IELTS official criteria>

---

Band 6 Answer:
<Insert Band 6 speaking sample, 3–5 sentences>

Band 6 Comment:
<Insert evaluation comment based on IELTS official criteria>

---

Band 7 Answer:
<Insert Band 7 speaking sample, 3–5 sentences>

Band 7 Comment:
<Insert evaluation comment based on IELTS official criteria>

---

Only return the content in this format. Do not include any introduction or extra commentary.

Be concise, realistic, and follow IELTS Speaking band descriptors.
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.75,
                "top_p": 0.95,
                "max_output_tokens": 1024
            }
        )
        text = response.text.strip()

        # 稳定提取每个区块内容
        def extract_section(band: str, label: str):
            pattern = fr"{band} {label}[:：]?\s*(.*?)(?=\nBand \d+ (Answer|Comment)|\Z)"
            match = re.search(pattern, text, re.DOTALL)
            return match.group(1).strip() if match else ""

        return {
            "band5": extract_section("Band 5", "Answer"),
            "comment5": extract_section("Band 5", "Comment"),
            "band6": extract_section("Band 6", "Answer"),
            "comment6": extract_section("Band 6", "Comment"),
            "band7": extract_section("Band 7", "Answer"),
            "comment7": extract_section("Band 7", "Comment"),
            "fullText": text
        }

    except Exception as e:
        return {"error": str(e)}
