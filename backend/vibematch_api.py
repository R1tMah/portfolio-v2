

from fastapi import FastAPI
from pydantic import BaseModel
import openai
from fastapi.middleware.cors import CORSMiddleware

openai.api_key = "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"

class VibeMatchRequest(BaseModel):
    artists: list[str]   # exactly 5 from the user

class VibeMatchResponse(BaseModel):
    score: int
    caption: str



app = FastAPI()

# 1) Add this CORS middleware block right after app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # or ["*"] during dev
    allow_methods=["*"],                      # allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)
# Pre‑baked tier list of your top 15–20 artists
TIER_LIST = [
  "Drake - Tier 1", "Juice WRLD - Tier 1", "Travis Scott - Tier 2", "Don Toliver - Tier 2", "Daniel Caesar - Tier 2", "SZA - Tier 2", "Future - Tier 2", "Kanye West - Tier 3", "Bryant Barnes - Tier 3", "Kendrick Lamar - Tier 3", "The Weeknd - Tier 3", "Giveon - Tier 4", "Tory Lanez - Tier 4", "Young Thug - Tier 4"
]

class VibeMatchRequest(BaseModel):
    artists: list[str]

class VibeMatchResponse(BaseModel):
    score: int
    caption: str

@app.post("/vibematch", response_model=VibeMatchResponse)
async def vibematch(req: VibeMatchRequest):
    prompt = f"""
    I have ranked my top 15 artists as follows:
    {', '.join(TIER_LIST)}

    A user gives me their 5 favorite artists:
    {', '.join(req.artists)}



    1) On a 0–100 scale, how compatible is their taste with mine? Make sure you look at the penalty artists too. Bonus Points if they're on the list, but take into account the type/genre of artists too, and make sure you look at the tiers, with 1 the best. Be as objective as possible and don't be afraid to give a lower score, but don't be too harsh.
    2) Give a one‑sentence funny caption about our shared tastes, but don't reference tiers in any way and don't mention any artists that they didn't list.
    Reply in JSON like:
    {{ "score": 78, "caption": "We both jam to slow jams—but I like a little more bass 😎" }}
    """
    completion =  openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role":"system","content":"You’re a music‑taste matcher."},
                  {"role":"user","content":prompt}],
        temperature=0.7
    )
    # Parse the assistant’s JSON response
    import json, re
    text = completion.choices[0].message.content
    # Simple JSON‑extraction
    obj = json.loads(re.search(r"\{.*\}", text, re.S).group(0))
    return VibeMatchResponse(score=obj["score"], caption=obj["caption"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)