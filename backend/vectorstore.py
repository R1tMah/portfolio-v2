# backend/vectorstore.py

import os
from pathlib import Path
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings    import OpenAIEmbeddings
from langchain.text_splitter           import RecursiveCharacterTextSplitter
from langchain_community.vectorstores  import Chroma

# 1) Load your env (so OPENAI_API_KEY is available)
load_dotenv()

# 2) Point at your docs
BASE_DIR = Path(__file__).parent
DOC_PATHS = [
  BASE_DIR / "bio.txt",
  BASE_DIR / "education.txt",
  BASE_DIR / "projects-summary.txt",
  BASE_DIR / "experience_summary.txt",
  BASE_DIR / "new_experience.txt",
  BASE_DIR / "projects.txt",
  BASE_DIR / "skills.txt",
  BASE_DIR / "contact-info.txt",
  BASE_DIR / "personal.txt",
]

# 3) Read & split into LangChain Documents
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = []
for p in DOC_PATHS:
    if not p.exists():
        raise FileNotFoundError(f"Missing document: {p}")

    docs.extend(splitter.split_documents(TextLoader(str(p), encoding="utf-8").load()))

# 4) Create your OpenAIEmbeddings
emb = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))

# 5) Build (or load) a Chroma vectorstore via LangChain
vectordb = Chroma.from_documents(
    documents=docs,
    embedding=emb,
    collection_name="ritvik_kb",            # name must be ASCII
    persist_directory=str(BASE_DIR / "chroma_db")  # optional, for persistence
)

# 6) Expose the retriever method you actually need
def get_retriever(k: int = 8):
    return vectordb.as_retriever(
      search_type="mmr",               # use MMR instead of pure similarity
      search_kwargs={
        "fetch_k": 20,                 # grab 10 candidates
        "lambda_mult": 0.5,            # trade‑off between relevance vs diversity
        "k": k                         # then return your top-3 diverse hits
      }
    )
