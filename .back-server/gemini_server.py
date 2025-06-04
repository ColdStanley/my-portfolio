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

# ✅ Ping 保活接口，放在最后
@app.get("/ping")
async def ping():
    return {"status": "ok"}
