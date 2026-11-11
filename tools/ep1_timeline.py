"""Build src/ep1/timeline.json for Episode 1 from the narration's word timings.

Inputs : public/ep1/p1..p6.m4a (narration per TikTok part; p6 = closing after the recitation),
         public/ep1/recitation-105.m4a, /home/claude/ep1/script.md (the approved script).
Output : src/ep1/timeline.json, and tools/ep1_parts.json (TikTok split points).
Scenes start on anchor phrases of the script; beats inside a scene are also phrases.
"""
import json, re, subprocess, unicodedata, difflib, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
ROTATE = 80           # rotate-your-phone card
GAP = 24              # breath between parts
END = 300             # end card
REC_VERSES = [0.0, 6.8, 12.8, 19.3, 27.25]  # verse starts inside the cleaned recitation (s)

def norm(w):
    w = unicodedata.normalize("NFKD", w)
    w = "".join(c for c in w if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", w.lower())

def script_parts():
    s = open("/home/claude/ep1/script.md").read()
    parts = re.split(r"\n## TikTok Part \d[^\n]*\n", s)[1:]
    out = []
    for i, p in enumerate(parts):
        p = p.split(">>> CLIFFHANGER")[0]
        lines = [l.strip() for l in p.split("\n") if l.strip() and not l.strip().startswith(("[", "#", "---"))]
        txt = " ".join(lines)
        if i == 4:
            a, b = txt.split("As for al-Qullays")
            out += [a, "As for al-Qullays" + b]
        else:
            out.append(txt)
    return out

def words_of(txt):
    return [w for w in re.split(r"\s+", txt.replace("—", " — ").replace("…", "… ")) if w and w not in ("—",)]

def whisper(path):
    from faster_whisper import WhisperModel
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32)
    m = WhisperModel("small", compute_type="int8")
    segs, _ = m.transcribe(a, language="en", word_timestamps=True)
    ws = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
    return ws, len(a) / 16000

def align(script_words, wh):
    a = [norm(w) for w in script_words]
    b = [norm(w[0]) for w in wh]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    t = [None] * len(a)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            t[blk.a + k] = wh[blk.b + k][1]
    # interpolate gaps
    known = [i for i, v in enumerate(t) if v is not None]
    for i in range(len(t)):
        if t[i] is None:
            lo = max([k for k in known if k < i], default=None)
            hi = min([k for k in known if k > i], default=None)
            if lo is None: t[i] = t[hi] if hi is not None else 0
            elif hi is None: t[i] = t[lo] + 0.3 * (i - lo)
            else: t[i] = t[lo] + (t[hi] - t[lo]) * (i - lo) / (hi - lo)
    return t, sm.ratio()

# ---------------- cue sheet ----------------
# (scene, anchor phrase, transition, props, [beat phrases or ints])
CUES = [
  [  # part 1
    ("ColdOpen", "The biggest animal", "black", {}, ["Still… it knelt"]),
    ("MapScene", "To understand why", "fade", {}, ["Before Islam", "attacked the Christians", "One man escaped", "The emperor wrote", "And the Negus answered"]),
    ("Fleet", "with seventy thousand soldiers", "fade", {}, []),
    ("AbrahaIntro", "Among them was a man", "cut", {}, []),
    ("SeaRide", "Dhū Nuwās met them", "fade", {}, []),
    ("AryatThrone", "Aryāṭ entered Yemen", "fade", {}, []),
    ("TwoArmies", "Years passed", "fade", {}, ["As the two sides"]),
    ("Duel", "Abraha was short", "cut", {}, ["Abraha was short", "Aryāṭ was tall", "Behind Abraha", "Aryāṭ raised his spear"]),
  ],
  [  # part 2
    ("DuelAftermath", "The blade split", "flash", {}, ["And then ʿAtwada leapt", "Aryāṭ's whole army"]),
    ("NegusCourt", "But far away", "fade", {}, ["When the Negus heard"]),
    ("SoilBag", "So Abraha did something", "fade", {}, ["O King, Aryāṭ was"]),
    ("NegusCourt", "The Negus was pleased", "fade", {"pleased": True}, []),
    ("Church", "Abraha had survived", "fade", {}, []),
    ("Letter", "Then he wrote to the Negus", "fade", {}, []),
    ("Kinani", "The Arabs heard", "fade", {}, ["slipped into al-Qullays", "and went home"]),
    ("Rage", "Abraha was told", "fade", {}, ["Abraha's face darkened", "And he took the elephant"]),
  ],
  [  # part 3
    ("March", "An army was marching", "black", {}, []),
    ("Battle", "A Yemeni noble", "fade", {}, ["They fought Abraha", "and were crushed"]),
    ("Prisoner", "Dhū Nafar was dragged", "fade", {}, ["O King, do not kill me", "Abraha spared him"]),
    ("Prisoner", "In the land of Khathʿam", "fade", {"green": True, "chained": False}, ["O King, do not kill me", "So Abraha let him go"]),
    ("GuideMarch", "and Nufayl marched", "fade", {}, []),
    ("Taif", "At al-Ṭāʾif", "fade", {}, ["O King, we are your servants", "Their shrine was"]),
    ("GuideMarch", "Their guide, Abū Righāl", "fade", {"guide": "abuRighal"}, []),
    ("Grave", "There, Abū Righāl died", "fade", {}, []),
    ("Raid", "From al-Mughammis", "fade", {}, []),
    ("MakkahWatch", "Among them were two hundred", "fade", {}, ["And Abraha sent a messenger"]),
  ],
  [  # part 4
    ("KaabaMeet", "The man who came to destroy", "black", {}, ["Ḥunāṭa found"]),
    ("CampNight", "ʿAbd al-Muṭṭalib went to the camp", "fade", {}, ["But he sent word to Unays"]),
    ("RoyalTent", "ʿAbd al-Muṭṭalib was the most handsome", "fade", {"focus": [("two", "Through his interpreter"), ("chief", "I need the king"), ("abraha", "Abraha stared"), ("chief", "ʿAbd al-Muṭṭalib answered"), ("abraha", "It will not be protected"), ("chief", "That is up to you"), ("two", "And Abraha gave him back")]}, [0, "So Abraha came down", "and seated him at his side"]),
    ("Exodus", "That night", "fade", {}, []),
    ("KaabaNight", "Then he took hold of the ring", "fade", {}, ["O Allah", "Then he let go of the ring"]),
    ("EmptyDawn", "The city was empty", "fade", {}, ["And in the morning"]),
  ],
  [  # part 5
    ("Whisper", "The elephant's name was", "black", {}, ["He took hold of its ear", "And the elephant knelt", "Nufayl ran"]),
    ("Refuse", "They beat the elephant", "cut", {}, [0, "They turned it toward Yemen", "Toward Syria", "Toward the east", "Then they turned it toward Makkah"]),
    ("Birds", "Then Allah sent birds", "flash", {}, ["None of them was struck"]),
    ("Flee", "They ran back down the road", "fade", {}, []),
    ("Litter", "Abraha himself was struck", "fade", {}, []),
    ("Beggars", "Years later", "fade", {}, []),
    ("BirthLight", "And Ibn Kathīr writes", "fade", {}, []),
    ("HouseLight", "It was not a victory", "fade", {}, []),
  ],
  [  # part 6 (after the recitation)
    ("Ruins", "As for al-Qullays", "fade", {}, ["And the Kaʿbah still stands"]),
  ],
]

# sound: per scene list of (src, at, vol, len_or_None(=scene), fadeIn, fadeOut, loop)
# `at` = frame offset in the scene, or "bN" for beat N, or "end-K"
BED = lambda src, v, loop=True: (src, 0, v, None, 20, 20, loop)
SFX = {
  "ColdOpen": [BED("blizzard-wind-01", 0.16), ("marching-footsteps-01", 0, 0.12, None, 20, 30, True), ("own-elephant-rumble", "b0", 0.5, None, 0, 0, False), ("own-impact", "b0", 0.45, None, 0, 0, False), ("angry-crowd-01", "b0+30", 0.1, None, 20, 20, True)],
  "MapScene": [("scroll-unroll-01", 0, 0.35, None, 0, 0, False), ("gentle-fire-crackling-01", "b1", 0.18, 90, 10, 30, False), ("footsteps-sand-01", "b2", 0.2, 80, 10, 30, True), ("paper-fabric-crumple-36", "b3", 0.2, None, 0, 0, False), ("ocean-ships", "b4", 0.25, None, 20, 20, True)],
  "Fleet": [BED("ocean-ships", 0.45), ("rowing-oar-stroke-01", 10, 0.2, None, 10, 20, True)],
  "AbrahaIntro": [BED("blizzard-wind-01", 0.12), ("own-air-swell", 0, 0.25, None, 0, 0, False)],
  "SeaRide": [("own-hooves", 0, 0.4, None, 10, 40, True), BED("flood-water-rush-01", 0.3), ("water-swirl-36", "end-50", 0.5, None, 0, 0, False)],
  "AryatThrone": [BED("daily-20260923-hushed-crowd-walla-short", 0.1), BED("gentle-fire-crackling-01", 0.1)],
  "TwoArmies": [BED("marching-footsteps-01", 0.15), BED("blizzard-wind-01", 0.1), ("own-hooves", "b0", 0.3, 130, 10, 30, True), ("chainmail-01", 20, 0.2, None, 0, 0, False)],
  "Duel": [BED("blizzard-wind-01", 0.2), ("chainmail-01", "b1", 0.25, None, 0, 0, False), ("steel-spike-scrape-01", "b3", 0.45, None, 0, 0, False), ("own-air-swell", "end-48", 0.55, None, 0, 0, False), ("own-impact", "end-2", 0.75, None, 0, 0, False)],
  "DuelAftermath": [BED("blizzard-wind-01", 0.15), ("arrow-flyby-01", "b0", 0.4, None, 0, 0, False), ("body-fall-01", "b0+24", 0.6, None, 0, 0, False), ("crowd-ooh-01", "b1", 0.25, None, 0, 0, False), ("marching-footsteps-01", "b1", 0.15, 120, 10, 40, True)],
  "NegusCourt": [BED("daily-20260923-hushed-crowd-walla-short", 0.1), BED("gentle-fire-crackling-01", 0.08), ("own-impact", "b0", 0.3, None, 0, 0, False)],
  "SoilBag": [("sand-pour-01", 10, 0.35, "b0", 10, 15, True), BED("blizzard-wind-01", 0.1), ("camel-grumble-01", "b0+10", 0.35, None, 0, 0, False), ("footsteps-sand-01", "b0", 0.25, None, 10, 20, True)],
  "Church": [("hammer-01", 0, 0.15, None, 10, 20, True), ("chisel-01", 25, 0.15, None, 10, 20, True), ("hand-saw-01", 60, 0.08, None, 10, 20, True), BED("busy-market-crowd-murmur-walla-01", 0.08)],
  "Letter": [("marker-writing-01", 0, 0.22, None, 5, 15, True), BED("gentle-fire-crackling-01", 0.12)],
  "Kinani": [BED("night-ambience-01", 0.3), BED("grasshopper-01", 0.08), ("footsteps-stone-01", 0, 0.18, "b0", 5, 10, True), ("door-creak-01", "b0", 0.35, None, 0, 0, False), ("footsteps-stone-01", "b1", 0.3, None, 5, 30, True)],
  "Rage": [BED("gentle-fire-crackling-01", 0.1), ("own-impact", "b0", 0.45, None, 0, 0, False), ("angry-crowd-01", "b0+10", 0.12, "b1", 20, 20, True), ("chainmail-01", "b0+40", 0.2, None, 0, 0, False), ("own-elephant-rumble", "b1+8", 0.55, None, 0, 0, False), ("own-rumble", "end-40", 0.5, None, 0, 0, False)],
  "March": [BED("marching-footsteps-01", 0.25), BED("blizzard-wind-01", 0.12), ("own-elephant-rumble", 30, 0.25, None, 0, 0, False)],
  "Battle": [BED("angry-crowd-01", 0.3), ("own-hooves", 0, 0.2, "b0", 10, 10, True), ("own-impact", "b0", 0.6, None, 0, 0, False), ("steel-spike-scrape-01", "b0+4", 0.3, None, 0, 0, False), ("chainmail-01", "b0+10", 0.3, None, 0, 0, False), ("crowd-groan-01", "b1", 0.3, None, 0, 0, False)],
  "Prisoner": [("chainmail-01", 0, 0.3, None, 0, 0, False), BED("blizzard-wind-01", 0.1), ("chainmail-01", "b0", 0.2, None, 0, 0, False)],
  "GuideMarch": [BED("marching-footsteps-01", 0.2), BED("blizzard-wind-01", 0.1)],
  "Taif": [BED("animal-bird-03", 0.1), BED("blizzard-wind-01", 0.06), BED("marching-footsteps-01", 0.08)],
  "Grave": [BED("blizzard-wind-01", 0.16), ("own-stones", 20, 0.12, None, 20, 20, True)],
  "Raid": [BED("own-hooves", 0.4), BED("camel-grumble-01", 0.25), BED("angry-crowd-01", 0.1)],
  "MakkahWatch": [BED("blizzard-wind-01", 0.15), ("own-hooves", "b0", 0.25, None, 20, 20, True)],
  "KaabaMeet": [BED("busy-market-crowd-murmur-walla-01", 0.06), BED("blizzard-wind-01", 0.07)],
  "CampNight": [BED("night-ambience-01", 0.25), BED("gentle-fire-crackling-01", 0.14), ("chainmail-01", 30, 0.15, None, 0, 0, False), ("own-elephant-rumble", "b0", 0.3, None, 0, 0, False)],
  "RoyalTent": [BED("daily-20260923-hushed-crowd-walla-short", 0.07), BED("gentle-fire-crackling-01", 0.08), ("footsteps-stone-01", 0, 0.22, 70, 5, 10, True)],
  "Exodus": [BED("footsteps-sand-01", 0.2), ("camel-grumble-01", 40, 0.2, None, 0, 0, False), BED("blizzard-wind-01", 0.1)],
  "KaabaNight": [BED("night-ambience-01", 0.3), BED("grasshopper-01", 0.1), BED("gentle-fire-crackling-01", 0.1)],
  "EmptyDawn": [BED("blizzard-wind-01", 0.14), ("own-rumble", "b0", 0.45, None, 0, 0, False), ("marching-footsteps-01", "b0+20", 0.12, None, 30, 20, True)],
  "Whisper": [BED("blizzard-wind-01", 0.1), ("own-elephant-rumble", "b1", 0.45, None, 0, 0, False), ("own-impact", "b1+20", 0.35, None, 0, 0, False), ("footsteps-sand-01", "b2", 0.35, None, 0, 20, True)],
  "Refuse": [BED("angry-crowd-01", 0.22), ("own-elephant-rumble", 10, 0.35, None, 0, 0, False), ("marching-footsteps-01", "b1", 0.18, None, 10, 20, False), ("own-impact", "b4+10", 0.5, None, 0, 0, False), ("own-elephant-rumble", "b4+10", 0.4, None, 0, 0, False)],
  "Birds": [("own-wings", 0, 0.55, None, 40, 30, True), ("animal-bird-03", 0, 0.3, None, 30, 30, True), ("own-rumble", 20, 0.35, None, 0, 0, False), ("own-stones", "b0", 0.55, None, 10, 30, True), ("crowd-groan-01", "b0+20", 0.3, None, 0, 0, False), ("angry-crowd-01", "b0+40", 0.18, None, 20, 20, True)],
  "Flee": [BED("angry-crowd-01", 0.28), BED("own-wings", 0.25), BED("marching-footsteps-01", 0.25), ("body-fall-01", 40, 0.4, None, 0, 0, False)],
  "Litter": [BED("blizzard-wind-01", 0.15), BED("footsteps-sand-01", 0.18)],
  "Beggars": [BED("busy-market-crowd-murmur-walla-01", 0.12)],
  "BirthLight": [BED("night-ambience-01", 0.15), ("animal-bird-03", "end-150", 0.15, None, 40, 20, True)],
  "HouseLight": [BED("blizzard-wind-01", 0.07), BED("animal-bird-03", 0.07)],
  "Recitation": [BED("night-ambience-01", 0.05)],
  "Ruins": [("chisel-01", 0, 0.18, "b0", 10, 15, True), ("hammer-01", 15, 0.14, "b0", 10, 15, True), ("rock-crumbling-01", 30, 0.3, None, 0, 0, False), ("own-air-swell", "b0-48", 0.3, None, 0, 0, False), ("blizzard-wind-01", "b0", 0.08, None, 30, 40, True)],
}
CLIFF = ("own-impact", 0.5)  # sting at the end of each TikTok part

def main():
    texts = script_parts()
    pub = ROOT / "public" / "ep1"
    t = ROTATE
    scenes, audio, sfx, caps, parts = [], [], [], [], []
    scenes.append({"scene": "RotateCard", "from": 0, "len": ROTATE, "trans": "cut"})
    report = []
    for pi, txt in enumerate(texts):
        if pi == 5:  # the recitation goes before the closing part
            rec_len = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(pub / "recitation-105.m4a")], capture_output=True, text=True).stdout)
            start = t + 10
            audio.append({"src": "ep1/recitation-105.m4a", "from": start})
            scenes.append({"scene": "Recitation", "from": t, "len": int((rec_len + 1.2) * FPS), "trans": "fade", "props": {"b": [int(v * FPS) + 10 for v in REC_VERSES]}})
            for s in SFX["Recitation"]:
                sfx.append({"src": s[0], "from": t, "len": int((rec_len + 1.2) * FPS), "vol": s[2], "fadeIn": 20, "fadeOut": 20, "loop": True})
            t = start + int((rec_len + 1.0) * FPS)
        f = pub / f"p{pi + 1}.m4a"
        ws, dur = whisper(f)
        sw = words_of(txt)
        times, ratio = align(sw, ws)
        report.append((pi + 1, round(ratio, 3), round(dur, 1), len(sw), len(ws)))
        base = t
        audio.append({"src": f"ep1/p{pi + 1}.m4a", "from": base})
        fr = lambda sec: base + int(round(sec * FPS))
        nsw = [norm(w) for w in sw]

        def find(phrase, after=0):
            ph = [norm(w) for w in words_of(phrase)]
            ph = [p for p in ph if p]
            for i in range(after, len(nsw)):
                j, k = i, 0
                while j < len(nsw) and k < len(ph):
                    if not nsw[j]: j += 1; continue
                    if nsw[j] != ph[k]: break
                    j += 1; k += 1
                if k == len(ph): return i
            raise SystemExit(f"anchor not found in part {pi + 1}: {phrase!r}")

        cues = CUES[pi]
        idx, cursor = [], 0
        for c in cues:
            i = find(c[1], cursor); idx.append(i); cursor = i
        part_end = fr(dur) + GAP
        for ci, c in enumerate(cues):
            name, _, trans, props, beats = c
            st = fr(times[idx[ci]]) - (8 if ci else 0)
            if ci == 0: st = base - (6 if pi else 0)
            en = (fr(times[idx[ci + 1]]) - 8) if ci + 1 < len(cues) else part_end
            ln = en - st
            b = []
            for bt in beats:
                b.append(bt if isinstance(bt, int) else fr(times[find(bt, idx[ci])]) - st)
            pr = dict(props)
            if "focus" in pr:
                pr["focus"] = [[fr(times[find(ph, idx[ci])]) - st, v] for v, ph in pr["focus"]]
            if b: pr["b"] = b
            scenes.append({"scene": name, "from": st, "len": ln, "trans": trans, "props": pr})
            for s in SFX.get(name, []):
                src, a, v, ln2, fi, fo, loop = s
                def resolve(x):
                    if isinstance(x, int): return x
                    m = re.match(r"(b(\d)|end)([+-]\d+)?", x)
                    o = int(m.group(3) or 0)
                    return (b[int(m.group(2))] if m.group(2) else ln) + o
                off = resolve(a)
                L = (resolve(ln2) - off) if isinstance(ln2, str) else (ln2 if ln2 else ln - off)
                if L <= 0: continue
                sfx.append({"src": src, "from": st + off, "len": L, "vol": v, "fadeIn": fi, "fadeOut": fo, "loop": loop})
        # captions: sentence-ish groups of ≤ 7 words
        grp = []
        for i, w in enumerate(sw):
            grp.append(i)
            end_sent = re.search(r"[.!?…:]\W*$", w) is not None
            if len(grp) >= 7 or end_sent or i == len(sw) - 1:
                a0 = fr(times[grp[0]])
                a1 = fr(times[i + 1]) if i + 1 < len(sw) else fr(dur)
                caps.append({"from": a0, "to": max(a1, a0 + 20), "words": [{"t": fr(times[k]), "w": sw[k]} for k in grp]})
                grp = []
        if pi < 4:
            sfx.append({"src": CLIFF[0], "from": fr(dur) - 2, "vol": CLIFF[1]})
            parts.append({"part": pi + 1, "start": base - 6 if pi else 0, "end": part_end})
        t = part_end
    parts.append({"part": 5, "start": parts[-1]["end"], "end": t + END})
    scenes.append({"scene": "EndCard", "from": t, "len": END, "trans": "fade"})
    total = t + END
    # captions must not overlap
    caps.sort(key=lambda c: c["from"])
    for i in range(len(caps) - 1):
        caps[i]["to"] = min(caps[i]["to"], caps[i + 1]["from"])
    json.dump({"total": total, "scenes": scenes, "audio": audio, "sfx": sfx, "captions": caps}, open(ROOT / "src/ep1/timeline.json", "w"), ensure_ascii=False)
    json.dump(parts, open(ROOT / "tools/ep1_parts.json", "w"), indent=1)
    print("alignment (part, ratio, dur, script words, heard words):", report)
    print("total", total, "frames =", round(total / FPS, 1), "s")
    for p in parts: print(f"part {p['part']}: {p['start']/FPS:7.1f}s -> {p['end']/FPS:7.1f}s  ({(p['end']-p['start'])/FPS:5.1f}s)")

if __name__ == "__main__":
    main()
