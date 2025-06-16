from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
import traceback
import re
import os
import httpx
from concurrent.futures import ThreadPoolExecutor
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://stanleyhi.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=1)

class PromptRequest(BaseModel):
    part: str
    question: str
    band: str  # 新增字段

DAILY_LIMIT = 500
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
            content={"error": "🛑 Daily request limit reached. Please try again ttttttttttomorrow."}
        )

    request_counter["count"] += 1

    # ✅ 构造 Prompt
    if payload.band == "5":
        prompt = f"""
You are a certified IELTS Speaking examiner.

Please evaluate the following IELTS Speaking question from Part {payload.part}:
"{payload.question}"

Your task is to generate speaking answers and examiner comments for **Band 5** level.

Answer Length Instructions:
You must write exactly:
- 30–40 words if this is a Part 1 question
- 150–180 words if this is a Part 2 question
- 40–60 words if this is a Part 3 question

This question is from Part {payload.part}, so your answer must follow the word limit for Part {payload.part}.

⚠️ Use a word counter before responding. Do not exceed or fall short.

⚠️ Instructions:
- You must include:
  1. Band 5 Answer 
  2. Band 5 Comment (based on IELTS criteria: fluency, vocabulary, grammar, pronunciation)
  3. Relatively Advanced Words and Phrases (2 words + 2 phrases, each with English sentence + 中文翻译, do NOT use Markdown or formatting symbols like **, *, _, etc.)
- Do NOT include extra explanation or intro.

📌 Return Format (Strictly follow the exact structure below):

Band 5 Answer:
(Write the answer text here.)

Band 5 Comment:
(Write the comment here, based on IELTS criteria: fluency, vocabulary, grammar, pronunciation.)

📌 Return Format (Strictly follow the exact structure below and do NOT use Markdown or formatting symbols like **, *, _, etc.):
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

Answer Length Instructions:
You must write exactly:
- 30–40 words if this is a Part 1 question
- 150–180 words if this is a Part 2 question
- 40–60 words if this is a Part 3 question

This question is from Part {payload.part}, so your answer must follow the word limit for Part {payload.part}.

⚠️ Use a word counter before responding. Do not exceed or fall short.

⚠️ Instructions:
- You must include:
  1. Band 6 Answer 
  2. Band 6 Comment (based on IELTS criteria: fluency, vocabulary, grammar, pronunciation)
  3. Relatively Advanced Words and Phrases (3 words + 3 phrases, each with English sentence + 中文翻译, do NOT use Markdown or formatting symbols like **, *, _, etc.)
- Do NOT include extra explanation or intro.

Return format:

Band 6 Answer:
<answer>

Band 6 Comment:
<comment>

📌 Return Format (Strictly follow the exact structure below and do NOT use Markdown or formatting symbols like **, *, _, etc.):
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

    elif payload.band == "7":
        prompt = f"""
You are a certified IELTS Speaking examiner.

Please evaluate the following IELTS Speaking question from Part {payload.part}:
"{payload.question}"

Your task is to generate speaking answers and examiner comments for **Band 7** level.

Answer Length Instructions:
You must write exactly:
- 30–40 words if this is a Part 1 question
- 150–180 words if this is a Part 2 question
- 40–60 words if this is a Part 3 question

This question is from Part {payload.part}, so your answer must follow the word limit for Part {payload.part}.

⚠️ Use a word counter before responding. Do not exceed or fall short.
⚠️ Instructions:
- You must include:
  1. Band 7 Answer 
  2. Band 7 Comment (based on IELTS criteria: fluency, vocabulary, grammar, pronunciation)
  3. Relatively Advanced Words and Phrases (4 words + 4 phrases, each with English sentence + 中文翻译, do NOT use Markdown or formatting symbols like **, *, _, etc.)
- Do NOT include extra explanation or intro.

Return format:

Band 7 Answer:
<answer>

Band 7 Comment:
<comment>


📌 Return Format (Strictly follow the exact structure below and do NOT use Markdown or formatting symbols like **, *, _, etc.):
Vocabulary Highlights:
1. <word>
   - EN: <example>
   - 中文：<translation>
        """.strip()

    else:
        return JSONResponse(status_code=400, content={"error": "Invalid band score"})

    print("==== PROMPT SENT TO DEEPSEEK ====")
    print(prompt)

    def call_deepseek():
        api_key = os.getenv("DEEPSEEK_API_KEY")
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload_data = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "You are a certified IELTS Speaking examiner."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 1024
        }

        with httpx.Client(timeout=20.0) as client:
            response = client.post("https://api.deepseek.com/v1/chat/completions", headers=headers, json=payload_data)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

    try:
        future = executor.submit(call_deepseek)
        response_text = future.result(timeout=20)
        text = response_text.strip()
        print("✅ DeepSeek 返回内容：\n", text)

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
        print("⏰ DeepSeek 超时")
        return JSONResponse(
            status_code=504,
            content={"error": "⏰ DeepSeek 响应超时，请稍后再试。"}
        )
    except Exception as e:
        print("❌ 错误：", str(e))
        traceback.print_exc()
        return {"error": f"服务器错误：{str(e)}"}

@app.get("/ping")
async def ping():
    return {"status": "ok"}
