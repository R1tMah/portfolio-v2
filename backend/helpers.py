
import os
import json
import re
import openai
import requests
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.neighbors import NearestNeighbors
from typing import List, Dict
from functools import lru_cache
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors    import NearestNeighbors


# 1) Load your OpenAI key
openai.api_key = os.getenv("OPENAI_API_KEY")

# 2) Load your CSV of “ground‐truth” vibe scores & fit KNN once
BASE_DIR = Path(__file__).parent
CSV_PATH = BASE_DIR / "vibe_scores2.csv"
CLIENT_ID     = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
weights = np.array([  # same order as your FEATURE_COLS
    3.0,   # give “upbeat” twice the importance
    2.0,   # lyrical
    2.0,   # late_night
    3.0,   # sad (downweight sadness)
    2.0,  #workout
    1.0, #romantic
    2.0, #chill
    2.0, #reflective
    0.25, #energetic
    1.0, #trap_drill
    10.0, #pop
    3.0, #rnb
    1.0, #jamaican
    4.0, #kpop
    1.0, #indie
])

df = pd.read_csv(CSV_PATH)
# assume columns: id, title, artist, <15 feature columns>
FEATURE_COLS = [c for c in df.columns if c not in ("id","title","artist","score")]
X = df[FEATURE_COLS].to_numpy()
X_weighted = X * weights   # elementwise multiply each column
_knn = NearestNeighbors(n_neighbors=10, metric="cosine")
_knn.fit(X_weighted)

CATEGORIES = [
    "upbeat", "lyrical", "late_night", "sad", "workout",
    "romantic", "chill", "reflective", "energetic", "trap_drill",
    "pop", "rnb", "dancehall_jamaican", "kpop", "indie_alt"
]

def build_prompt(artist):
    return f"""
Assign percentage values across the following 15 categories for the following artists: {artist}. 
The categories are: {", ".join(CATEGORIES)}.
Each value should be a number between 0 and 100
Give Pop artists lower lyrical scores, when I say lyrical I'm mostly talking about rap
Respond in this exact JSON format and make guesses if needed, do not say any other words or deny:
{{
  "upbeat": 0,
  "lyrical": 0,
  "late_night": 0,
  "sad": 0,
  "workout": 0,
  "romantic": 0,
  "chill": 0,
  "reflective": 0,
  "energetic": 0,
  "trap_drill": 0,
  "pop": 0,
  "rnb": 0,
  "dancehall_jamaican": 0,
  "kpop": 0,
  "indie_alt": 0
}}
"""

TIER_LIST = [
  "Drake - Tier 1 ", "Juice WRLD - Tier 1", "Travis Scott - Tier 2", "Don Toliver - Tier 2", "Daniel Caesar - Tier 2",
  "SZA - Tier 2", "Future - Tier 3", "Kanye West - Tier 3", "Bryant Barnes - Tier 3", "Kendrick Lamar - Tier 3",
  "The Weeknd - Tier 4", "Giveon - Tier 4", "d4vd - Tier 4", "Tory Lanez - Tier 5", "Young Thug - Tier 5"
]
# 3) Helper #1: run Vibematch agent
@lru_cache(maxsize=32)
def run_vibematch_agent(artists: List[str]) -> Dict[str, any]:
    prompt = f"""
I have ranked my top 15 artists: {', '.join(TIER_LIST)}
  A user gives me their 5 favorite artists:
{', '.join(artists)}

1) Rate compatibility 0–100.  Bonus Points if they're on the list, but take into account the type/genre of artists too, and make sure you look at the tiers, with 1 the best, for example, if the artist mentions Drake or Juice WRLD give a big boost to their score, as you can see here there's not that much pop involved so don't give those kind of artists high scores. Be as objective as possible and don't be afraid to give a lower score, but also don't be afraid to give out 90+ if they put a bunch of my favorite artists. Bonus points if they mention Bollywood artists too
2) Give a one‑sentence funny caption about our shared tastes, but don't reference tiers in any way and don't mention any artists that they didn't list, DO NOT REFERENCE BOLLYWOOD AT ALL, LIKE IT SHOULD NOT BE MENTIONED IN YOUR RESPONSE. DO NOT SAY ANYTHING ABOUT BOLLYWOOD. IF AN ARTIST ISN'T ON MY TIER LIST DON"T MENTION IT
Reply with only JSON and nothing else like: {{ "score":78, "caption":"…"}}
"""
    resp = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system",  "content": "You’re a music‑taste matcher."},
            {"role": "user",    "content": prompt}
        ],
        temperature=0.7,
    )
    
    text = resp.choices[0].message.content
    # extract the JSON blob
    j = re.search(r"\{.*\}", text, re.S)
    return json.loads(j.group(0))


# 4) Helper #2: extract 15‑dim feature vectors with an LLM
@lru_cache(maxsize=32)
def extract_features_with_agent(artists: List[str]) -> List[Dict[str,int]]:
    results = []
    for artist in artists:
        prompt = build_prompt(artist)

        resp = openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role":"system","content":"You output JSON only."},
                    {"role":"user",  "content":prompt}],
            temperature=0,
        )
        blob = resp.choices[0].message.content
        feat = json.loads(blob)
        results.append({
            "name":     artist,
            "features": feat
        })  # should be List[{"name":..., "features":{...}}]
    return tuple(results)


# 5) Helper #3: run KNN recommendation

def knn_recommend(feature_dicts: List[Dict[str,int]]) -> List[Dict]:
    # average the feature vectors
    mat = np.array([list(d["features"].values()) for d in feature_dicts])
    avg = mat.mean(axis=0, keepdims=True)
    dists, idxs = _knn.kneighbors(avg)
    recs = []
    for dist, idx in zip(dists[0], idxs[0]):
        row = df.iloc[idx]
        recs.append({
          "title":     row["title"],
          "artist":    row["artist"],
          "sim_score": float(1 - dist),
        })
    return recs


# 6) Helper #4: fetch album art via your /spotify/search endpoint
@lru_cache(maxsize=1)
def fetch_album_image(title: str, artist: str) -> str:
    # hits your FastAPI /spotify/search which returns [{id,name,image},...]
    url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000") + "/spotify/search"
    resp = requests.get(url, params={"q": f"{title} {artist}", "limit": 1})
    resp.raise_for_status()
    data = resp.json()
    if data and data[0].get("image"):
        return data[0]["image"]
    return None