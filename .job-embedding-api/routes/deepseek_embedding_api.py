from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests

router = APIRouter()

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
DEEPSEEK_URL = "https://api.deepseek.com/v1/embeddings"

class EmbeddingRequest(BaseModel):
    input: str

@router.post("/generate-embedding")
async def generate_embedding(req: EmbeddingRequest):
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "input": [req.input],
        "model": "deepseek-embedding"
    }

    response = requests.post(DEEPSEEK_URL, headers=headers, json=payload)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to call DeepSeek API")

    data = response.json()
    return {"embedding": data["data"][0]["embedding"]}
