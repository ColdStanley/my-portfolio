from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
import traceback
import re
import google.generativeai as genai
from concurrent.futures import ThreadPoolExecutor
from pydantic import BaseModel

app = FastAPI()

# ✅ CORS 设置：允许你的 Vercel 与本地开发环境访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://my-portfolio-lyart-xi-57.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=1)

class PromptRequest(BaseModel):
    part: str
    question: str
    band: str  # '5' or '6' or '7'

DAILY_LIMIT = 50
request_counter = {
    "date": date.today(),
    "count": 0
}

@app.post("/generate")
async def generate_answer(payload: PromptRequest):
    print("📩 收到请求：", payload.dict())

    if request_counter["date"] != date.today():
        request_counter["date"] = date.today()
        request_counter["count"] = 0

    if request_counter["count"] >= DAILY_LIMIT:
        return JSONResponse(status_code=429, content={"error": "🛑 Daily request limit reached. Please try again tomorrow."})

    request_counter["count"] += 1

    # 💡 每个 band 单独定义 prompt 内容
    band_content = {
        "5": """
Band 5 Answer:
<Insert Band 5 speaking sample, 150–180 words>

Band 5 Comment:
<Insert evaluation comment based on IELTS official criteria>

Vocabulary Highlights:
1. <word>
   EN: <example>
   中文：<翻译>
2. <word>
   EN: <example>
   中文：<翻译>
3. <phrase>
   EN: <example>
   中文：<翻译>
4. <phrase>
   EN: <example>
   中文：<翻译>
""",
        "6": """
Band 6 Answer:
<Insert Band 6 speaking sample, 150–180 words>

Band 6 Comment:
<Insert evaluation comment based on IELTS official criteria>

Vocabulary Highlights:
1. <word>
   EN: <example>
   中文：<翻译>
2. <word>
   EN: <example>
   中文：<翻译>
3. <word>
   EN: <example>
   中文：<翻译>
4. <phrase>
   EN: <example>
   中文：<翻译>
5. <phrase>
   EN: <example>
   中文：<翻译>
6. <phrase>
   EN: <example>
   中文：<翻译>
""",
        "7": """
Band 7 Answer:
<Insert Band 7 speaking sample, 150–180 words>

Band 7 Comment:
<Insert evaluation comment based on IELTS official criteria>

Vocabulary Highlights:
1. <word>
   EN: <example>
   中文：<翻译>
2. <word>
   EN: <example>
   中文：<翻译>
3. <word>
   EN: <example>
   中文：<翻译>
4. <word>
   EN: <example>
   中文：<翻译>
5. <phrase>
   EN: <example>
   中文：<翻译>
6. <phrase>
   EN: <example>
   中文：<翻译>
7. <phrase>
   EN: <example>
   中文：<翻译>
8. <phrase>
   EN: <example>
   中文：<翻译>
"""
    }

    if payload.band not in band_content:
        return JSONResponse(status_code=400, content={"error": "Invalid band selected"})

    prompt = f"""
You are a certified IELTS Speaking examiner.

Please evaluate the following IELTS Speaking question from Part {payload.part}:
"{payload.question}"

Your task is to generate only Band {payload.band} response.

⚠️ Instructions:
- Answer must simulate a 1–2 minute spoken response (around 150–180 words).
- Use spoken tone and IELTS official format.
- Provide both an Answer and a Comment.
- End with Vocabulary Highlights.
- Only return Band {payload.band} result. Do not generate other band scores.

{band_content[payload.band]}
"""

    print("📤 发送给 Gemini 的 prompt：\n", prompt)

    model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    def call_gemini():
        return model.generate_content(
            prompt,
            generation_config={"temperature": 0.75, "top_p": 0.95, "max_output_tokens": 1024}
        )

    try:
        future = executor.submit(call_gemini)
        response = future.result(timeout=20)
        text = response.text.strip()
        print("✅ Gemini 返回结果：\n", text)

        def extract(label: str):
            pattern = fr"{label}[:：]?\s*(.*?)(?=\n[A-Z][a-z]+|Vocabulary Highlights|$)"
            match = re.search(pattern, text, re.DOTALL)
            return match.group(1).strip() if match else ""

        def extract_vocab():
            pattern = r"Vocabulary Highlights[:：]?\s*(.*)"
            match = re.search(pattern, text, re.DOTALL)
            return match.group(1).strip() if match else ""

        result = {
            "band": payload.band,
            "answer": extract(f"Band {payload.band} Answer"),
            "comment": extract(f"Band {payload.band} Comment"),
            "vocab": extract_vocab(),
            "fullText": text
        }

        return result

    except TimeoutError:
        print("⏰ Gemini 超时")
        return JSONResponse(status_code=504, content={"error": "⏰ Gemini 响应超时，请稍后再试。"})

    except Exception as e:
        print("❌ 错误：", str(e))
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": f"服务器错误：{str(e)}"})

@app.get("/ping")
async def ping():
    return {"status": "ok"}
