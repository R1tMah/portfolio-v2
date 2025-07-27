# backend/app.py
from .helpers import (
  run_vibematch_agent,
  extract_features_with_agent,
  knn_recommend,
  fetch_album_image,
)
import os
import re
import json
import openai
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from langchain.chains import ConversationalRetrievalChain
from langchain_community.chat_models import ChatOpenAI
from .vectorstore import get_retriever
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
import requests
import time
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors    import NearestNeighbors
from fastapi             import FastAPI
from pydantic            import BaseModel
from typing              import List
from pathlib import Path
from typing import Any, List
from pydantic import BaseModel


'''
BASE = Path(__file__).parent
CSV_PATH = BASE / "vibe_scores2.csv"
df = pd.read_csv(CSV_PATH)
df_encoded = df.drop(["title", 'artist'], axis =1)
print(df_encoded.head())
scaler = StandardScaler()
X = scaler.fit_transform(df_encoded.values)
nn = NearestNeighbors(
    n_neighbors=5,
    metric="cosine",
    algorithm="auto"
).fit(X)
'''
HERE = Path(__file__).resolve().parent
env_path = HERE / ".env"
print(f"🔍 Loading env from: {env_path}")
# 1) Load environment and OpenAI key
load_dotenv()
CLIENT_ID     = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
print("🔑 SPOTIFY_CLIENT_ID:", CLIENT_ID)
print("🔑 SPOTIFY_CLIENT_SECRET:", CLIENT_SECRET and "••••••••")


openai.api_key = os.getenv("OPENAI_API_KEY")
_token: str = None
_token_expires_at = 0

def get_spotify_token():
    global _token, _token_expires_at
    if _token is None or time.time() >= _token_expires_at:
        resp = requests.post(
          "https://accounts.spotify.com/api/token",
          data={"grant_type":"client_credentials"},
          auth=(CLIENT_ID, CLIENT_SECRET)
        )
        resp.raise_for_status()
        js = resp.json()
        _token = js["access_token"]
        _token_expires_at = time.time() + js["expires_in"] - 60
    return _token

# 2) Create FastAPI app & apply CORS once
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "https://ritvik-mahapatra.netlify.app"],  # during dev
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

class PrefRequest(BaseModel):
    preferences: List[float]   # length‑15 list of percentages

class Recommendation(BaseModel):
    id:               str
    score:            float
    title:            str
    artist:           str
    upbeat:           int
    lyrical:          int
    late_night:       int
    sad:              int
    workout:          int
    romantic:         int
    chill:            int
    reflective:       int
    energetic:        int
    trap_drill:       int
    pop:              int
    rnb:              int
    dancehall_jamaican: int
    kpop:             int
    indie_alt:        int

class RecommendationResponse(BaseModel):
    recommendations: List[Recommendation]
class PrefResponse(BaseModel):
    recommendations: List[Recommendation]

class ArtistFeatures(BaseModel):
    name: str
    features: Dict[str,int]

class RecOut(BaseModel):
    title:        str
    artist:       str
    album_image:  str
    sim_score:    float

class VibeRecResponse(BaseModel):
    score:           int
    caption:         str
    recommendations: List[RecOut]
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

    1) Rate compatibility 0–100.  Bonus Points if they're on the list, but take into account the type/genre of artists too, and make sure you look at the tiers, with 1 the best, for example, if the artist mentions Drake or Juice WRLD give a big boost to their score, as you can see here there's not that much pop involved so don't give those kind of artists high scores. Be as objective as possible and don't be afraid to give a lower score, but also don't be afraid to give out 90+ if they put a bunch of my favorite artists. Bonus points if they mention Bollywood artists too
    2) Give a one‑sentence funny caption about our shared tastes, but don't reference tiers in any way and don't mention any artists that they didn't list, DO NOT REFERENCE BOLLYWOOD AT ALL, LIKE IT SHOULD NOT BE MENTIONED IN YOUR RESPONSE. DO NOT SAY ANYTHING ABOUT BOLLYWOOD.
    Reply with only JSON and nothing else like: {{ "score":78, "caption":"…"}}
"""
    completion = openai.chat.completions.create(
        model="gpt-4",
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
@app.get("/spotify/search")
def spotify_search(q: str, limit: int = 10):
    token = get_spotify_token()
    print(CLIENT_ID)
    resp = requests.get(
      "https://api.spotify.com/v1/search",
      headers={"Authorization": f"Bearer {token}"},
      params={"q": q, "type": "artist", "limit": limit}
    )
    if not resp.ok:
        raise HTTPException(resp.status_code, resp.text)
    data = resp.json()["artists"]["items"]
    # return only the bits you care about:
    return [
      { "id": a["id"], "name": a["name"], "image": a["images"][0]["url"] if a["images"] else None }
      for a in data
    ]

@app.post("/recommend", response_model=PrefResponse)
def recommend(req: PrefRequest):
    # turn into 2D array and scale
    user_vec = scaler.transform([req.preferences])  # shape (1,15)

    # find neighbors: distances shape (1,k), indices shape (1,k)
    distances, indices = nn.kneighbors(user_vec, n_neighbors=5)
    recs = []
    for dist, idx in zip(distances[0], indices[0]):
        row = df.iloc[idx]
        recs.append({
            "id":             str(row.name),
            "score":          1 - dist,       # for cosine, dist=0→identical
            **row.to_dict()
        })
    return RecommendationResponse(recommendations=recs)


@app.post("/vibe-and-recommend", response_model=VibeRecResponse)
def vibe_and_recommend(req: VibeMatchReq):
    artists = tuple(req.artists)                       # now a List[str]

    # 1) Run your tuple‑safe vibematch agent:
    vm = run_vibematch_agent(artists)

    # 2) Extract features for each artist (returns list of dicts with a "features" key)
    feats     = list(extract_features_with_agent(artists))    # e.g. [ {"name":"Drake","features":{…}}, … ]

    # 3) Run KNN on *just* the feature vectors
    raw_recs       = knn_recommend(feats) 

    # 4) Enrich with album art and pack into your RecOut schema
    recs = []
    for r in raw_recs:
        img = fetch_album_image(r["title"], r["artist"])
        recs.append(RecOut(
            title      = r["title"],
            artist     = r["artist"],
            album_image= img,
            sim_score  = r["sim_score"],
        ))

    return VibeRecResponse(
        score           = vm["score"],
        caption         = vm["caption"],
        recommendations = recs,
    )



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
