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
    band: str  # 新增字段

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
        return JSONResponse(
            status_code=429,
            content={"error": "🛑 Daily request limit reached. Please try again tomorrow."}
        )

    request_counter["count"] += 1

    # ✅ 构造 Prompt
    if payload.band == "5":
        prompt = f"""
You are a certified IELTS Speaking examiner.

Please evaluate the following IELTS Speaking question from Part {payload.part}:
"{payload.question}"

Your task is to generate speaking answers and examiner comments for **Band 5** level.

⚠️ Instructions:
- You must include:
  1. Band 5 Answer (about 150–180 words)
  2. Band 5 Comment (based on IELTS criteria: fluency, vocabulary, grammar, pronunciation)
  3. Vocabulary Highlights (2 words + 2 phrases, each with English sentence + 中文翻译)
- Do NOT include extra explanation or intro.

📌 Return Format (Strictly follow the exact structure below):

Band 5 Answer:
(Write the answer text here. It should be around 150–180 words.)

Band 5 Comment:
(Write the comment here, based on IELTS criteria: fluency, vocabulary, grammar, pronunciation.)

Vocabulary Highlights:
1. <Word or Phrase>
   - EN: (English example sentence using the word or phrase)
   - 中文：(对应的中文翻译)
2. <Word or Phrase>
   - EN: (English example sentence using the word or phrase)
   - 中文：(对应的中文翻译)
3. <Word or Phrase>
   - EN: (English example sentence using the word or phrase)
   - 中文：(对应的中文翻译)
4. <Word or Phrase>
   - EN: (English example sentence using the word or phrase)
   - 中文：(对应的中文翻译)

⚠️ Do not add any other explanation, formatting, or introductory sentence.

        """.strip()

    elif payload.band == "6":
        prompt = f"""
You are a certified IELTS Speaking examiner.

Please evaluate the following IELTS Speaking question from Part {payload.part}:
"{payload.question}"

Your task is to generate speaking answers and examiner comments for **Band 6** level.

⚠️ Instructions:
- You must include:
  1. Band 6 Answer (about 150–180 words)
  2. Band 6 Comment (based on IELTS criteria: fluency, vocabulary, grammar, pronunciation)
  3. Vocabulary Highlights (3 words + 3 phrases, each with English sentence + 中文翻译)
- Do NOT include extra explanation or intro.

Return format:

Band 6 Answer:
<answer>

Band 6 Comment:
<comment>

Vocabulary Highlights:
1. <word>
   - EN: <example>
   - 中文：<translation>
        """.strip()

    elif payload.band == "7":
        prompt = f"""
You are a certified IELTS Speaking examiner.

Please evaluate the following IELTS Speaking question from Part {payload.part}:
"{payload.question}"

Your task is to generate speaking answers and examiner comments for **Band 7** level.

⚠️ Instructions:
- You must include:
  1. Band 7 Answer (about 150–180 words)
  2. Band 7 Comment (based on IELTS criteria: fluency, vocabulary, grammar, pronunciation)
  3. Vocabulary Highlights (4 words + 4 phrases, each with English sentence + 中文翻译)
- Do NOT include extra explanation or intro.

Return format:

Band 7 Answer:
<answer>

Band 7 Comment:
<comment>

Vocabulary Highlights:
1. <word>
   - EN: <example>
   - 中文：<translation>
        """.strip()

    else:
        return JSONResponse(status_code=400, content={"error": "Invalid band score"})

    print("==== PROMPT SENT TO GEMINI ====")
    print(prompt)

    model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    def call_gemini():
        return model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.75,
                "top_p": 0.95,
                "max_output_tokens": 1024
            }
        )

    try:
        future = executor.submit(call_gemini)
        response = future.result(timeout=20)

        text = response.text.strip()
        print("✅ Gemini 返回内容：\n", text)

        def extract_section(label: str):
            pattern = fr"{label}[:：]?\s*(.*?)(?=\n[A-Z][a-z]|Vocabulary Highlights|$)"
            match = re.search(pattern, text, re.DOTALL)
            return match.group(1).strip() if match else ""

        band = payload.band
        answer = extract_section(f"Band {band} Answer")
        comment = extract_section(f"Band {band} Comment")
        vocab_match = re.search(r"Vocabulary Highlights:\s*(.+)", text, re.DOTALL)
        vocab = vocab_match.group(1).strip() if vocab_match else ""

        return {
            f"band{band}": answer,
            f"comment{band}": comment,
            f"vocab{band}": vocab
        }
         

    except TimeoutError:
        print("⏰ Gemini 超时")
        return JSONResponse(
            status_code=504,
            content={"error": "⏰ Gemini 响应超时，请稍后再试。"}
        )
    except Exception as e:
        print("❌ 错误：", str(e))
        traceback.print_exc()
        return {"error": f"服务器错误：{str(e)}"}

@app.get("/ping")
async def ping():
    return {"status": "ok"}
