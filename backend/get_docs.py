# test_retriever.py
from vectorstore import get_retriever
from dotenv import load_dotenv
import os

load_dotenv()  
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY")[:4] + "…")  # sanity‑check

r = get_retriever(k=5)
print("Calling get_relevant_documents…")
docs = r.get_relevant_documents("hello world")
print("Returned", len(docs), "docs")
for d in docs[:2]:
    print(" •", d.page_content[:80].replace("\n"," "), "…")