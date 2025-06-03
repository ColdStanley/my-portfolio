from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

# 配置 Gemini API Key
genai.configure(api_key="AIzaSyAazU3hutjFc2d4Po0YSDCYJ2ENGgQNSWU")

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

@app.post("/generate")
async def generate_answer(payload: PromptRequest):
    prompt = f"""
You are an IELTS Speaking examiner.

For the IELTS Speaking {payload.part} question:
"{payload.question}"

Please generate answers and explanations for 3 different band scores in the following **strict** format:

Band 5 Answer:
<Your sample answer for Band 5>

Band 5 Comment:
<Why this answer would be rated Band 5>

Band 6 Answer:
<Your sample answer for Band 6>

Band 6 Comment:
<Why this answer would be rated Band 6>

Band 7 Answer:
<Your sample answer for Band 7>

Band 7 Comment:
<Why this answer would be rated Band 7>
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        import re

        def extract_answer_and_comment(band: str):
            # 提取答案
            ans_match = re.search(fr"{band} Answer[:：]?\s*(.*?)(?=\n{band} Comment[:：])", text, re.DOTALL)
            answer = ans_match.group(1).strip() if ans_match else ""

            # 提取注释
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
