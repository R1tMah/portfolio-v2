# backend/build_chroma.py
from vectorstore import get_retriever , PERSIST_DIR

if __name__ == "__main__":
    # this will load your docs, embed them and write to disk
    get_retriever(k=5)
    print("✅ persisted Chroma DB to", PERSIST_DIR)