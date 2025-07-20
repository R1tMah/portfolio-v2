# backend/chatbot_api.py
import os
import openai
from fastapi import FastAPI
from pydantic import BaseModel
from langchain.chains import ConversationalRetrievalChain
from langchain.chat_models import ChatOpenAI
from .vectorstore import get_retriever # <-- import your ready‑to‑go retriever
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # or ["*"] to allow all origins
    allow_credentials=True,
    allow_methods=["*"],    # <-- this allows OPTIONS, GET, POST, etc.
    allow_headers=["*"],
)
model     = ChatOpenAI(model_name="gpt-4", temperature=0)
retriever = get_retriever(k=3)
chain     = ConversationalRetrievalChain.from_llm(model, retriever)

class ChatRequest(BaseModel):
    question: str
    chat_history: list[tuple[str,str]] = []

class ChatResponse(BaseModel):
    answer: str
    chat_history: list[tuple[str,str]]

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    result = await chain.acall({
        "question": req.question,
        "chat_history": req.chat_history
    })
    return ChatResponse(
      answer=result["answer"],
      chat_history=result["chat_history"]
    )
