# backend/vectorstore.py

import os
from pathlib import Path
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

# 1) Load your .env so OPENAI_API_KEY is available
load_dotenv()

BASE_DIR   = Path(__file__).parent
DOC_PATHS  = [ BASE_DIR / "docs" / f for f in (
    "bio.txt",
    "education.txt",
    "projects-summary.txt",
    "experience_summary.txt",
    "new_experience.txt",
    "projects.txt",
    "skills.txt",
    "contact-info.txt",
    "personal.txt",
) ]
PERSIST_DIR = BASE_DIR / "chroma_db"

# 2) Pre‑split all your docs into chunks once
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
_docs = []
for p in DOC_PATHS:
    if not p.exists():
        raise FileNotFoundError(f"Missing document: {p}")
    _docs.extend(splitter.split_documents(
        TextLoader(str(p), encoding="utf-8").load()
    ))


def get_retriever(k: int = 8):
    """Returns a fast Chroma retriever, building+persisting on first call."""
    # your embeddings credential
    emb = OpenAIEmbeddings(
        model="text-embedding-ada-002"  # or your preferred embedding model
    )

    if PERSIST_DIR.exists():
        print("i'm here!")
        # ---- fast path: load the DB off disk ----
        vectordb = Chroma(
            persist_directory=str(PERSIST_DIR),
            embedding_function=emb,
            collection_name="ritvik-kb",
        )
    else:
        # ---- slow path: embed & write to disk ----
        print("i'm gonna be here  ")
        vectordb = Chroma.from_documents(
            _docs,
            emb,
            persist_directory=str(PERSIST_DIR),
            collection_name="ritvik-kb",
        )

    return vectordb.as_retriever(search_kwargs={"k": k})
