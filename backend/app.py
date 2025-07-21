# backend/app.py

import os
import re
import json
import openai
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from langchain.chains import ConversationalRetrievalChain
from langchain_community.chat_models import ChatOpenAI
from .vectorstore import get_retriever
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate

# 1) Load environment and OpenAI key
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# 2) Create FastAPI app & apply CORS once
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "https://ritvikmaha.netlify.app"],  # during dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
template = """You are Ritvik’s personal AI assistant. Use the retrieved documents to answer the user as if you are Ritvik Mahapatra himself. Be concise and factual. Don't say Answer:, just respond with the answer"""
qa_prompt = PromptTemplate.from_template(template + "\n\nQuestion: {question}\n\n{context}")
# 3) Models for /chat
class ChatRequest(BaseModel):
    question: str
    chat_history: List[tuple[str, str]] = []

class ChatResponse(BaseModel):
    answer: str
    chat_history: List[tuple[str, str]]

# 4) Models for /vibematch
class VibeMatchReq(BaseModel):
    artists: List[str]

class VibeMatchRes(BaseModel):
    score: int
    caption: str

# 5) Initialize your retrieval‑augmented chain
llm_model = ChatOpenAI(model_name="gpt-4", temperature=0)
retriever  = get_retriever(k=5)
chat_chain = ConversationalRetrievalChain.from_llm(llm_model, retriever,return_source_documents=True,  combine_docs_chain_kwargs={"prompt": qa_prompt})

# 6) /chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    result = await chat_chain.acall({
        "question": req.question,
        "chat_history": req.chat_history
    })
    print(result.keys())
    for doc in result["source_documents"]:
        print(doc.metadata["source"])
    return ChatResponse(
        answer       = result["answer"],
        chat_history = result["chat_history"]
    )

# 7) Pre‑baked tier list for VibeMatch
TIER_LIST = [
  "Drake - Tier 1 ", "Juice WRLD - Tier 1", "Travis Scott - Tier 2", "Don Toliver - Tier 2", "Daniel Caesar - Tier 2",
  "SZA - Tier 2", "Future - Tier 3", "Kanye West - Tier 3", "Bryant Barnes - Tier 3", "Kendrick Lamar - Tier 3",
  "The Weeknd - Tier 4", "Giveon - Tier 4", "d4vd - Tier 4", "Tory Lanez - Tier 5", "Young Thug - Tier 5"
]

# 8) /vibematch endpoint
@app.post("/vibematch", response_model=VibeMatchRes)
async def vibematch(req: VibeMatchReq):
    prompt = f"""
I have ranked my top 15 artists: {', '.join(TIER_LIST)}

User's 5 favorites: {', '.join(req.artists)}

1) Rate compatibility 0–100.  Bonus Points if they're on the list, but take into account the type/genre of artists too, and make sure you look at the tiers, with 1 the best. Be as objective as possible and don't be afraid to give a lower score, but also don't be afraid to give out 90+ if they put a bunch of my favorite artists. Bonus points if they mention Bollywood artists too
2) Give a one‑sentence funny caption about our shared tastes, but don't reference tiers in any way and don't mention any artists that they didn't list.
Reply JSON like: {{ "score":78, "caption":"…"}}
"""
    completion = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
          {"role":"system","content":"You’re a music‑taste matcher."},
          {"role":"user","content":prompt}
        ],
        temperature=0.7
    )
    text = completion.choices[0].message.content
    data = json.loads(re.search(r"\{.*\}", text, re.S).group(0))
    return VibeMatchRes(score=data["score"], caption=data["caption"])

# 9) (Optional) Serve your Angular build under "/" after building:
#    Make sure you run: `ng build --configuration production`
#    and adjust the folder name to match your project.
# app.mount(
#     "/",
#     StaticFiles(directory="dist/your-app-name", html=True),
#     name="static",
# )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
