import os
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastembed import TextEmbedding

model_name = os.environ.get("FASTEMBED_MODEL", "BAAI/bge-small-en-v1.5")
print(f"Loading model: {model_name}", flush=True)
model = TextEmbedding(model_name=model_name)
print("Model loaded.", flush=True)

app = FastAPI()


class EmbedRequest(BaseModel):
    texts: List[str]


@app.post("/embed")
def embed(req: EmbedRequest):
    embeddings = list(model.embed(req.texts))
    return {
        "embeddings": [e.tolist() for e in embeddings],
        "model": model_name,
        "dimensions": len(embeddings[0]) if embeddings else 0,
    }


@app.get("/health")
def health():
    return {"status": "healthy", "model": model_name}


if __name__ == "__main__":
    port = int(os.environ.get("FASTEMBED_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
