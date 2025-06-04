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

# ✅ 允许来自你的 Vercel 前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://my-portfolio-lyart-xi-57.vercel.app","http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=1)

class PromptRequest(BaseModel):
    part: str
    question: str

DAILY_LIMIT = 50
request_counter = {
    "date": date.today(),
    "count": 0
}

@app.post("/generate")
async def generate_answer(payload: PromptRequest):
    print("📩 收到请求：", payload.dict())

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

    prompt = f"""



You are a certified IELTS Speaking examiner.

Please evaluate the following IELTS Speaking question from Part {payload.part}:
"{payload.question}"

Your task is to generate speaking answers and examiner comments for **Band 5**, **Band 6**, and **Band 7** levels.

⚠️ Instructions:
- Follow the exact structure below.
- You must include both an **Answer** and a **Comment** section for each band score.
- Do NOT include any extra sections such as vocabulary lists or explanations.
- This is a **Part 2 (Long Turn)** question. Each answer should simulate a **1–2 minute** spoken response (around **150–180 words**).
- The speaking sample should be structured with a **clear beginning, development with details/examples, and a brief ending or reflection**.
- Maintain **natural spoken tone**, use appropriate **connectors**, and vary **sentence structures**.
- Comments must be based on IELTS official criteria (fluency & coherence, lexical resource, grammatical range & accuracy, pronunciation).
- At the end of each Band Comment, include the following section **in bilingual format** (English + Chinese):
Vocabulary Highlights:
- Band 5: 2 impressive words + 2 impressive phrases, each with 1 English example sentence and its Chinese translation.
- Band 6: 3 impressive words + 3 impressive phrases, each with 1 English example sentence and its Chinese translation.
- Band 7: 4 impressive words + 4 impressive phrases, each with 1 English example sentence and its Chinese translation.

---

Band 5 Answer:
<Insert Band 5 speaking sample, 3–5 sentences>

Band 5 Comment:
<Insert evaluation comment based on IELTS official criteria>

Vocabulary Highlights:
1. <fancy word 1>
   - EN: <example sentence>
   - 中文：<中文翻译>
2. <fancy word 2>
   - EN: <example sentence>
   - 中文：<中文翻译>
3. <fancy phrase 1>
   - EN: <example sentence>
   - 中文：<中文翻译>
4. <fancy phrase 2>
   - EN: <example sentence>
   - 中文：<中文翻译>

   
Band 6 Answer:
<Insert Band 6 speaking sample, 3–5 sentences>

Band 6 Comment:
<Insert evaluation comment based on IELTS official criteria>

Vocabulary Highlights:
1. <fancy word 1>
   - EN: <example sentence>
   - 中文：<中文翻译>
2. <fancy word 2>
   - EN: <example sentence>
   - 中文：<中文翻译>
3. <fancy word 3>
   - EN: <example sentence>
   - 中文：<中文翻译>
4. <fancy phrase 1>
   - EN: <example sentence>
   - 中文：<中文翻译>
5. <fancy phrase 2>
   - EN: <example sentence>
   - 中文：<中文翻译>
6. <fancy phrase 3>
   - EN: <example sentence>
   - 中文：<中文翻译>



Band 7 Answer:
<Insert Band 7 speaking sample, 3–5 sentences>

Band 7 Comment:
<Insert evaluation comment based on IELTS official criteria>

Vocabulary Highlights:
1. <fancy word 1>
   - EN: <example sentence>
   - 中文：<中文翻译>
2. <fancy word 2>
   - EN: <example sentence>
   - 中文：<中文翻译>
3. <fancy word 3>
   - EN: <example sentence>
   - 中文：<中文翻译>
4. <fancy word 4>
   - EN: <example sentence>
   - 中文：<中文翻译>
5. <fancy phrase 1>
   - EN: <example sentence>
   - 中文：<中文翻译>
6. <fancy phrase 2>
   - EN: <example sentence>
   - 中文：<中文翻译>
7. <fancy phrase 3>
   - EN: <example sentence>
   - 中文：<中文翻译>
8. <fancy phrase 4>
   - EN: <example sentence>
   - 中文：<中文翻译>


Only return the content in this format. Do not include any introduction or extra commentary.

Be concise, realistic, and follow IELTS Speaking band descriptors.





"""

    # ✅ 打印到控制台
    print("==== PROMPT SENT TO GEMINI ====")
    print(prompt)

    model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    print("📤 正在发送 prompt 给 Gemini ...")

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
        print("✅ Gemini 原始返回：\n", text)

        def extract_section(band: str, label: str):
            pattern = fr"{band} {label}[:：]?\s*(.*?)(?=\nBand \d+ (Answer|Comment)|\Z)"
            match = re.search(pattern, text, re.DOTALL)
            return match.group(1).strip() if match else ""

        result = {
            "band5": extract_section("Band 5", "Answer"),
            "comment5": extract_section("Band 5", "Comment"),
            "band6": extract_section("Band 6", "Answer"),
            "comment6": extract_section("Band 6", "Comment"),
            "band7": extract_section("Band 7", "Answer"),
            "comment7": extract_section("Band 7", "Comment"),
            "fullText": text
        }

        print("🧩 提取后的结构：", result)
        return result

    except TimeoutError:
        print("⏰ Gemini 超时！")
        return JSONResponse(
            status_code=504,
            content={"error": "⏰ Gemini 响应超时，请稍后再试。"}
        )
    except Exception as e:
        print("❌ 异常发生：", str(e))
        traceback.print_exc()
        return {"error": f"服务器错误：{str(e)}"}

# ✅ Ping 保活接口
@app.get("/ping")
async def ping():
    return {"status": "ok"}
