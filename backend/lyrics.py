import openai
import os
import csv
import time
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate

# 1) Load environment and OpenAI key
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


# Define the 15 vibe categories
CATEGORIES = [
    "upbeat", "lyrical", "late_night", "sad", "workout",
    "romantic", "chill", "reflective", "energetic", "trap_drill",
    "pop", "rnb", "dancehall_jamaican", "kpop", "indie_alt"
]

# Example list of songs (add more as needed)
songs = [
    ("Sky", "d4vd"),
    ("One More Dance", "d4vd"),
    ("Afterlife", "d4vd"),
    ("Where'd It Go Wrong", "d4vd"),
    ("I'd Rather Pretend", ["Bryant Barnes", "d4vd"]),
    ("Losing You", "Bryant Barnes"),
    ("Two Sides of Goodbye", "Bryant Barnes"),
    ("Want You All the time", "Bryant Barnes"),
    ("Is This Love to You", "Bryant Barnes"),
    ("Don't Want a Love Song", "Bryant Barnes"),
    ("All Life Long", "Juice WRLD"),
    ("Righteous", "Juice WRLD"),
    ("Man of the Year", "Juice WRLD"),
    ("Burn", "Juice WRLD"),
    ("Cigarettes", "Juice WRLD"),
    ("Realer N Realer", "Juice WRLD"),
    ("Maze", "Juice WRLD"),
    ("Sometimes", "Juice WRLD"),
    ("I'll Be Fine", "Juice WRLD"),
    ("Cavalier", "Juice WRLD"),
    ("Die Trying", "Drake"),
    ("Never Recover", "Drake"),
    ("Sideways", "Drake"),
    ("Doing It Wrong", "Drake"),
    ("Trust Issues", "Drake"),
    ("The Motion", "Drake"),
    ("Trophies", "Drake"),
    ("You're Mines Still", ["Yung Bleu", "Drake"]),
    ("Needle", ["Nicki Minaj", "Drake"]),
    ("Circadian Rhythm", "Drake"),
    ("Chicago Freestyle", "Drake"),
    ("Virginia Beach", "Drake"),
    ("8am in Charlotte", "Drake"),
    ("6pm in New York", "Drake"),
    ("Fear", "Drake"),
    ("The Motto", "Drake"),
    ("Energy", "Drake"),
    ("The Language", "Drake"),
    ("9", "Drake"),
    ("Teenage Fever", "Drake"),
    ("Greece", "Drake"),
    ("Cameras/ Good Ones Go Interlude", "Drake"),
    ("5AM in Toronto", "Drake"),
    ("The Ride", "Drake"),
    ("Greedy", "Drake"),
    ("Jungle", "Drake"),
    ("Fair Trade", "Drake"),
    ("Brand New", "Drake"),
    ("Last Heartbreak Song", ["Ayra Starr", "Giveon"]),
    ("Lost Me", "Giveon"),
    ("Bleeding", "Giveon"),
    ("Scarred", "Giveon"),
    ("Make You Mine", "Giveon"),
    ("Swimming Pools", "Kendrick Lamar"),
    ("Mona Lisa", ["Lil Wayne", "Kendrick Lamar"]),
    ("wacced out murals", "Kendrick Lamar"),
    ("reincarnated", "Kendrick Lamar"),
    ("XXX.", "Kendrick Lamar"),
    ("Backstreets", "Don Toliver"),
    ("Purple Rain", "Don Toliver"),
    ("Temporary", "Don Toliver"),
    ("No Comments", "Don Toliver"),
    ("Backend", "Don Toliver"),
    ("Heaven or Hell", "Don Toliver"),
    ("2AM", "Don Toliver"),
    ("Company, Pt. 2", "Don Toliver"),
    ("Diva", "Don Toliver"),
    ("Kryptonite", "Don Toliver"),
    ("I CAN'T LET GO", ["Don Toliver", "Lil Tecca"]),
    ("Saturn", "SZA"),
    ("Nobody Gets Me", "SZA"),
    ("Another Life", "SZA"),
    ("My Turn", "SZA"),
    ("Snooze", "SZA"),
    ("Scorsese Baby Daddy", "SZA"),
    ("Low", "SZA"),
    ("Kill Bill", "SZA"),
    ("ARE YOU OK?", "Daniel Caesar"),
    ("Always", "Daniel Caesar"),
    ("Let Me Go", "Daniel Caesar"),
    ("Shot my Baby", "Daniel Caesar"),
    ("Best Part", ["H.E.R.", "Daniel Caesar"]),
    ("Japanese Denim", "Daniel Caesar"),
    ("Little Rowboat", "Daniel Caesar"),
    ("Streetcar", "Daniel Caesar"),
    ("calm & patient", "Jhene Aiko"),
    ("Born Tired", "Jhene Aiko"),
    ("None of Your Concern", "Jhene Aiko"),
    ("Wake Up", ["Travis Scott", "The Weeknd"]),
    ("Yosemite", ["Travis Scott", "Gunna"]),
    ("Can't Say", ["Travis Scott", "Don Toliver"]),
    ("PBT", ["Travis Scott", "Tyla", "Vybez Kartel"]),
    ("Apple Pie", "Travis Scott"),
    ("Drugs You Should Try It", "Travis Scott"),
    ("Mile High", ["Travis Scott", "James Blake"]),
    ("darling, he lied", ["starfall", "bixby"]),
    ("Tied Up", "starfall"),
    ("cigarettes", "starfall"),
    ("Enchanted", "Taylor Swift"),
    ("How does it feel to be forgotten", "Selena Gomez"),
    ("Ojos Tristes", "Selena Gomez"),
    ("stuck like this", "starfall"),
    ("Cinderella", ["Future", "Travis Scott"]),
    ("GTA", "Future"),
    ("Accepting My Flaws", "Future"),
    ("Always Be My Fault", "Future"),
    ("Scholarships", ["Future", "Drake"]),
    ("Live From the Gutter", ["Future", "Drake"]),
    ("West Coast", "Lana Del Rey"),
    ("Diet Mountain Dew", "Lana Del Rey"),
    ("The Abyss", ["The Weeknd", "Lana Del Rey"]),
    ("Lust For Life", ["The Weeknd", "Lana Del Rey"]),
    ("Young And Beautiful", "Lana Del Rey"),
    ("Summertime Sadness", "Lana Del Rey"),
    ("Luna", "FEID"),
    ("Ansiedades", "Mora"),
    ("MIA", ["Drake", "Bad Bunny"]),
    ("Odio", ["Drake", "Romeo Santos"]),
    ("No Me Ame", ["Juice WRLD", "Anuel AA"]),
    ("Like Crazy", "Jimin"),
    ("Girl of My Dreams", ["Juice WRLD", "SUGA"]),
    ("Still With You", "Jung Kook"),
    ("Stay Alive", "Jung Kook"),
    ("Alone", "Jimin"),
    ("Cupid", "Fifty Fifty"),
    ("ETA", "New Jeans"),
    ("New Jeans", "New Jeans"),
    ("Denver", "Jack Harlow"),
    ("Churchill Downs", ["Jack Harlow", "Drake"]),
    ("Love Yourz", "J. Cole"),
    ("January 28th", "J. Cole"),
    ("Apperently", "J. Cole"),
    ("Memory Lane", "Nas"),
    ("Metro Spider", "Young Thug"),
    ("Trance", ["Young Thug", "Travis Scott"]),
    ("Broke Opps", "King Von"),
    ("War With Us", "King Von"),
    ("War", "King Von"),
    ("How it Go", "King Von"),
    ("WHERE DOES YOUR SPIRIT GO", "The Kid Laroi"),
    ("So Done", "The Kid Laroi"),
    ("Monster", ["Kanye West", "Rick Ross", "Nicki Minaj", "JAY-Z"]),
    ("Moon", "Kanye West"),
    ("Street Lights", "Kanye West"),
    ("Praise God", ["Kanye West", "Travis Scott"]),
    ("Us Against The World", "Chris Grey"),
    ("Prada and Versace", "Chris Grey"),
    ("Drive", "Weeknd"),
    ("Faith", "Weeknd"),
    ("Hardest To Love", "Weeknd"),
    ("Damage", "H.E.R"),
    ("Jungle", "H.E.R"),
    ("Every Kind of Way", "H.E.R"),
    ("Marry You", "Bruno Mars"),
    ("Talking To The Moon", "Bruno Mars"),
    ("Dandelions", "Ruth B."),
    ("The One That Got Away", "Katy Perry"),
    ("lovely", "Billie Eilish & Khalid"),
    ("Night Changes", "One Direction"),
    ("Viva La Vida", "Coldplay"),
    ("Thodi Der", "Shreya Ghoshal & Farhan Saeed"),
    ("Agar Tum Saath Ho", "Arijit Singh & Alka Yagnik"),
    ("Balam Pichkari", "Ranveer Singh & Deepika Padukone"),
    ("Sun Saathiya", "Priya Saraiya"),
    ("Kaun Tujhe", "Palak Muchhal"),
    ("Phir Kabhi", "Arijit Singh"),
    ("O Meri Jaan", "Papon"),
    ("Mohe Rang Do Laal", "Shreya Ghoshal"),
    ("Khamoshiyan", "Arijit Singh"),
    ("Aaj Se Teri", "Shreya Ghoshal"),
    ("Jeene Laga Hoon", "Atif Aslam"),
    ("Baarish", "Arijit Singh")
]


def build_prompt(title, artist):
    return f"""
Assign percentage values across the following 15 categories for the song "{title}" by {artist}. 
The categories are: {", ".join(CATEGORIES)}.
Each value should be a number between 0 and 100

Respond in this exact JSON format and make guesses if needed, do not say any other words or deny:
{{
  "title": "{title}",
  "artist": "{artist}",
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

results = []
skipped = []

for title, artist in songs:
    prompt = build_prompt(title, artist)
    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )
        print(response.choices[0])
        content = response.choices[0].message.content
        data = eval(content)  # safe if prompt structure is strict
        results.append(data)
        print(f"✅ Processed: {title} by {artist}")
        time.sleep(1.5)
    except Exception as e:
        print(f"❌ Error with {title} by {artist}: {e}")
        skipped.append((title, artist))

# Save to CSV
with open("vibe_scores2.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["title", "artist"] + CATEGORIES)
    writer.writeheader()
    writer.writerows(results)

with open("skipped_songs2.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["title", "artist"])
    writer.writerows(skipped)
print("🎵 All song scores saved to vibe_scores.csv")
