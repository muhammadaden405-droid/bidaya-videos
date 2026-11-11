"""Episode 1 v2 timeline: public/ep1v2/p1..p8.m4a + recitation -> src/ep1v2/timeline.json, tools/ep1v2_parts.json.
Scenes start on anchor phrases of the narration; beats inside a scene are phrases too.
Usage: python3 tools/ep1v2_timeline.py [parts]   e.g. "1" to build only TikTok part 1 (for previews)."""
import json, re, sys, subprocess
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import ep1_timeline as base   # norm, words_of, whisper (cached), align, gain

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
GAP = 18
END = 240
REC_VERSES = [0.0, 7.4, 13.35, 20.0, 27.8]
VO = Path("/home/claude/ep1/vo2")

# (scene, anchor, transition, props, beats)
CUES = {
  1: [
    ("HookSilhouette", "Elephants don't kneel", "cut", {}, []),
    ("KneelWide", "But one morning", "cut", {}, ["one did"]),
    ("Beating", "They struck its head", "cut", {"mode": "axes"}, []),
    ("Beating", "They drove iron hooks", "cut", {"mode": "hooks"}, []),
    ("TowardKaaba", "It would not take one step", "fade", {}, []),
    ("TurnTest", "Turn it toward Yemen", "cut", {"mode": "run"}, ["it got up and ran"]),
    ("TurnTest", "Turn it back toward Makkah", "cut", {"mode": "again"}, ["it knelt again"]),
    ("TitleReveal", "How did a war elephant", "fade", {}, ["the edge of Makkah"]),
    ("Trench", "It started years earlier", "flash", {}, ["A king named"]),
    ("Escape", "Only one man escaped", "fade", {}, []),
    ("Caesar", "and he didn't stop until", "fade", {}, ["But I will write"]),
    ("Armada", "And the Negus of Abyssinia answered", "fade", {}, []),
  ],
  2: [
    ("Landing", "Seventy thousand", "cut", {}, ["Their commander"]),
    ("AbrahaSpot", "And in his army", "cut", {}, []),
    ("SeaRide2", "Dhū Nuwās came out", "fade", {}, ["He turned his horse"]),
    ("Throne2", "Aryāṭ took Yemen", "fade", {}, []),
    ("Split", "Then Abraha rose", "fade", {}, ["As the two sides"]),
    ("Duel2", "Aryāṭ was tall", "cut", {}, ["Aryāṭ was tall", "Abraha was short", "And behind Abraha", "Aryāṭ raised his spear", "and struck"]),
  ],
  3: [
    ("Wound", "The spear missed", "flash", {}, ["From that day", "his eyebrow", "His eye.", "His nose", "His lip"]),
    ("Charge", "Then ʿAtwada charged", "cut", {}, [0, "Aryāṭ's whole army"]),
    ("Negus2", "But when the Negus heard", "fade", {}, ["he was furious"]),
    ("SoilAndLetter", "Abraha did something", "fade", {}, ["He filled a leather bag", "and sent it"]),
    ("LetterRead", "O King", "fade", {"lines": 6}, []),
    ("Negus2", "The Negus was satisfied", "fade", {"pleased": True}, []),
    ("Ambition", "Abraha had survived", "fade", {}, []),
  ],
  4: [
    ("ChurchRise", "In Ṣanʿāʾ, Abraha built", "cut", {}, ["He forced the people"]),
    ("Treasures", "He hauled marble", "fade", {}, []),
    ("LetterRead", "Then he wrote to the Negus", "fade", {"lines": 5}, []),
    ("NewsByFire", "The Arabs heard about", "fade", {}, ["And one man from the tribe"]),
    ("Sneak", "He travelled to", "fade", {}, ["slipped into", "and went home"]),
    ("Vow", "Who did this", "cut", {}, ["Abraha swore", "And he took the elephant"]),
  ],
  5: [
    ("TribesFight", "When the Arabs heard", "cut", {}, ["They were crushed", "Dhū Nafar was taken"]),
    ("Plead", "When Abraha was about to kill him, Dhū Nafar", "cut", {}, ["O King, don't kill me", "Abraha spared him"]),
    ("Plead", "In the land of Khathʿam", "fade", {"green": True, "chained": False}, ["Don't kill me", "So Abraha spared him"]),
    ("Guide", "Now Nufayl marched", "fade", {"guide": "nufayl"}, []),
    ("Thaqif", "At al-Ṭāʾif", "fade", {}, ["O King, we are your servants", "Our shrine"]),
    ("Guide", "Their guide, Abū Righāl", "fade", {"guide": "abuRighal"}, []),
    ("Stoned", "There, Abū Righāl died", "fade", {}, ["and the Arabs stoned"]),
    ("Herds", "Abraha's horsemen raided", "fade", {}, []),
    ("MakkahAlone", "Quraysh knew they could not", "fade", {}, []),
  ],
  6: [
    ("Envoy", "Abraha sent a messenger", "cut", {}, ["Ḥunāṭa found", "ʿAbd al-Muṭṭalib answered"]),
    ("Camp", "He went to Abraha's camp", "fade", {}, ["Through Unays"]),
    ("Tent", "ʿAbd al-Muṭṭalib was the most handsome", "fade", {"focus": [("two", "What do you want"), ("chief", "I want the king"), ("abraha", "Abraha stared"), ("chief", "ʿAbd al-Muṭṭalib said"), ("abraha", "It will not be protected"), ("chief", "That is your affair"), ("two", "And Abraha gave him back")]}, ["so he stepped down", "sat beside him"]),
    ("RingPrayer", "That night", "fade", {}, ["Then he led Quraysh"]),
  ],
  7: [
    ("Whisper2", "In the morning", "cut", {}, ["took hold of its ear", "And the elephant knelt", "Nufayl ran"]),
    ("Refusals", "They beat it", "cut", {}, ["Toward Yemen", "Toward Syria", "Toward the east", "Toward Makkah"]),
    ("Birds2", "Then Allah sent birds", "flash", {}, ["Every man they struck"]),
    ("Rout", "The army fled", "fade", {}, ["They died at every"]),
    ("Litter2", "Abraha himself was struck", "fade", {}, []),
    ("Beggars2", "Years later", "fade", {}, []),
    ("Light", "And in that same year", "fade", {"mode": "dawn"}, []),
    ("Light", "This was not a victory", "fade", {"mode": "house"}, []),
  ],
  8: [
    ("Torn", "As for al-Qullays", "fade", {}, ["And the Kaʿbah still stands"]),
  ],
}

BED = lambda src, v, loop=True: (src, 0, v, None, 15, 20, loop)
HIT = lambda src, at, v: (src, at, v, None, 0, 0, False)
SFX = {
  "HookSilhouette": [BED("blizzard-wind-01", 0.2), HIT("own-elephant-rumble", 6, 0.5), ("footsteps-sand-01", 0, 0.12, None, 10, 10, True)],
  "KneelWide": [BED("blizzard-wind-01", 0.14), BED("daily-20260923-hushed-crowd-walla-short", 0.08), HIT("own-air-swell", "b0-44", 0.4), HIT("own-impact", "b0+8", 0.75), HIT("own-rumble", "b0+8", 0.5), HIT("own-elephant-rumble", "b0+12", 0.5)],
  "Beating": [BED("angry-crowd-01", 0.22), ("impact-slam-35", 6, 0.5, None, 0, 0, True), HIT("own-elephant-rumble", 10, 0.5)],
  "TowardKaaba": [BED("blizzard-wind-01", 0.18), HIT("own-elephant-rumble", 20, 0.35)],
  "TurnTest": [BED("angry-crowd-01", 0.14), HIT("own-elephant-rumble", "b0-10", 0.45), ("marching-footsteps-01", "b0", 0.25, None, 0, 15, True), HIT("own-impact", "b0+8", 0.0)],
  "TitleReveal": [BED("blizzard-wind-01", 0.18), HIT("own-air-swell", "b0-48", 0.4), HIT("own-impact", "b0", 0.6), HIT("own-rumble", "b0", 0.4)],
  "Trench": [HIT("fire-electric-whoosh-flame-36", 0, 0.6), BED("backlog-adapt-fire-burning", 0.35), BED("distant-bonfire-fire-crackling-01", 0.3), HIT("crowd-groan-01", "b0+20", 0.18)],
  "Escape": [BED("own-hooves", 0.5), BED("blizzard-wind-01", 0.15), BED("night-ambience-01", 0.12)],
  "Caesar": [BED("daily-20260923-hushed-crowd-walla-short", 0.08), BED("gentle-fire-crackling-01", 0.08), HIT("footsteps-stone-01", 0, 0.2), HIT("scroll-unroll-01", "b0", 0.35), HIT("sack-drop-01", "b0+8", 0.2)],
  "Landing": [BED("ocean-ships", 0.35), BED("marching-footsteps-01", 0.22), ("chainmail-01", "b0", 0.25, None, 0, 0, False)],
  "AbrahaSpot": [BED("blizzard-wind-01", 0.15), HIT("own-air-swell", 0, 0.3), HIT("own-impact", "end-24", 0.35)],
  "SeaRide2": [("angry-crowd-01", 0, 0.35, "b0", 0, 15, True), HIT("own-impact", 2, 0.5), ("own-hooves", "b0", 0.45, None, 0, 40, True), BED("flood-water-rush-01", 0.3), HIT("water-swirl-36", "end-60", 0.5)],
  "Throne2": [BED("daily-20260923-hushed-crowd-walla-short", 0.1), BED("gentle-fire-crackling-01", 0.1)],
  "Split": [BED("marching-footsteps-01", 0.18), BED("blizzard-wind-01", 0.12), ("own-hooves", "b0", 0.3, 130, 10, 30, True)],
  "Duel2": [BED("blizzard-wind-01", 0.2), HIT("chainmail-01", "b1", 0.25), HIT("steel-spike-scrape-01", "b3", 0.45), HIT("own-air-swell", "b4-44", 0.5), HIT("own-impact", "b4", 0.8)],
  "Wound": [HIT("own-impact", 0, 0.8), HIT("body-fall-01", 6, 0.3), BED("blizzard-wind-01", 0.15), HIT("own-air-swell", "b0-40", 0.35), HIT("own-impact", "b0", 0.5)],
  "Charge": [HIT("arrow-flyby-01", "b0", 0.5), HIT("body-fall-01", "b0+26", 0.6), HIT("own-impact", "b0+14", 0.5), ("marching-footsteps-01", "b1", 0.25, None, 10, 30, True), HIT("crowd-ooh-01", "b1+10", 0.2)],
  "Negus2": [BED("daily-20260923-hushed-crowd-walla-short", 0.1), BED("gentle-fire-crackling-01", 0.1), HIT("own-impact", "b0+10", 0.45)],
  "SoilAndLetter": [BED("blizzard-wind-01", 0.12), ("sand-pour-01", "b0", 0.4, "b1", 5, 10, True), HIT("sack-drop-01", "b1-6", 0.35), ("own-hooves", "b1", 0.45, None, 10, 20, True)],
  "LetterRead": [("marker-writing-01", 0, 0.25, None, 5, 15, True), BED("gentle-fire-crackling-01", 0.14), HIT("paper-fabric-crumple-36", 0, 0.2)],
  "Ambition": [BED("gentle-fire-crackling-01", 0.1), HIT("own-air-swell", "end-60", 0.45), BED("blizzard-wind-01", 0.08)],
  "ChurchRise": [BED("busy-market-crowd-murmur-walla-01", 0.07), ("hammer-01", "b0", 0.18, None, 10, 20, True), ("chisel-01", "b0+20", 0.16, None, 10, 20, True), HIT("own-air-swell", "b0-40", 0.3)],
  "Treasures": [BED("daily-20260923-hushed-crowd-walla-short", 0.05), HIT("own-air-swell", 0, 0.25)],
  "NewsByFire": [BED("night-ambience-01", 0.25), BED("gentle-fire-crackling-01", 0.25), HIT("own-impact", "b0", 0.35)],
  "Sneak": [BED("night-ambience-01", 0.3), BED("grasshopper-01", 0.08), ("footsteps-stone-01", 0, 0.18, "b0", 5, 10, True), HIT("door-creak-01", "b0", 0.35), ("footsteps-stone-01", "b1", 0.3, None, 5, 30, True)],
  "Vow": [BED("gentle-fire-crackling-01", 0.1), HIT("own-impact", "b0", 0.5), ("angry-crowd-01", "b0+10", 0.12, "b1", 20, 20, True), HIT("own-air-swell", "b1-44", 0.45), HIT("own-elephant-rumble", "b1+6", 0.6), HIT("own-rumble", "b1+6", 0.45)],
  "TribesFight": [BED("angry-crowd-01", 0.3), HIT("own-impact", "b0", 0.6), HIT("chainmail-01", "b0+8", 0.3), HIT("crowd-groan-01", "b0+20", 0.25), HIT("chainmail-01", "b1", 0.35)],
  "Plead": [BED("blizzard-wind-01", 0.1), HIT("chainmail-01", 0, 0.25)],
  "Guide": [BED("marching-footsteps-01", 0.2), BED("blizzard-wind-01", 0.1), HIT("own-elephant-rumble", 20, 0.25)],
  "Thaqif": [BED("animal-bird-03", 0.1), BED("blizzard-wind-01", 0.06), BED("marching-footsteps-01", 0.08)],
  "Stoned": [BED("blizzard-wind-01", 0.16), ("own-stones", "b0", 0.18, None, 20, 20, True)],
  "Herds": [BED("own-hooves", 0.4), BED("camel-grumble-01", 0.25), BED("angry-crowd-01", 0.1)],
  "MakkahAlone": [BED("blizzard-wind-01", 0.22), HIT("own-air-swell", "end-60", 0.4), HIT("own-rumble", 10, 0.3)],
  "Envoy": [("own-hooves", 0, 0.3, "b0", 10, 15, True), BED("busy-market-crowd-murmur-walla-01", 0.05), BED("blizzard-wind-01", 0.06)],
  "Camp": [BED("night-ambience-01", 0.25), BED("gentle-fire-crackling-01", 0.14), HIT("chainmail-01", 20, 0.15), HIT("own-elephant-rumble", "b0", 0.3)],
  "Tent": [BED("daily-20260923-hushed-crowd-walla-short", 0.07), BED("gentle-fire-crackling-01", 0.08), ("footsteps-stone-01", 0, 0.22, 70, 5, 10, True)],
  "RingPrayer": [BED("night-ambience-01", 0.3), BED("grasshopper-01", 0.1), BED("gentle-fire-crackling-01", 0.1), ("footsteps-sand-01", "b0", 0.25, None, 10, 30, True), HIT("own-air-swell", "end-60", 0.35)],
  "Whisper2": [BED("blizzard-wind-01", 0.1), BED("daily-20260923-hushed-crowd-walla-short", 0.06), HIT("own-air-swell", "b1-44", 0.35), HIT("own-impact", "b1+8", 0.7), HIT("own-elephant-rumble", "b1+10", 0.5), ("footsteps-sand-01", "b2", 0.35, None, 0, 20, True)],
  "Refusals": [("angry-crowd-01", 0, 0.25, "b0", 10, 10, True), ("impact-slam-35", 4, 0.45, "b0", 0, 0, True), HIT("own-elephant-rumble", 10, 0.45), ("marching-footsteps-01", "b0", 0.2, "b3", 5, 10, True), HIT("own-impact", "b3+18", 0.75), HIT("own-rumble", "b3+18", 0.5)],
  "Birds2": [("own-wings", 0, 0.6, None, 40, 30, True), ("animal-bird-03", 0, 0.3, None, 30, 30, True), HIT("own-rumble", 20, 0.35), ("own-stones", "b0", 0.55, None, 10, 30, True), HIT("crowd-groan-01", "b0+20", 0.3), ("angry-crowd-01", "b0+40", 0.18, None, 20, 20, True)],
  "Rout": [("angry-crowd-01", 0, 0.28, "b0", 10, 20, True), BED("own-wings", 0.22), ("marching-footsteps-01", 0, 0.25, "b0", 5, 20, True), HIT("body-fall-01", 40, 0.35), ("blizzard-wind-01", "b0", 0.2, None, 20, 20, True)],
  "Litter2": [BED("blizzard-wind-01", 0.15), BED("footsteps-sand-01", 0.18)],
  "Beggars2": [BED("busy-market-crowd-murmur-walla-01", 0.12)],
  "Light": [BED("night-ambience-01", 0.12), ("animal-bird-03", "end-150", 0.15, None, 40, 20, True)],
  "Torn": [("chisel-01", 0, 0.18, "b0", 10, 15, True), ("hammer-01", 15, 0.14, "b0", 10, 15, True), HIT("rock-crumbling-01", 30, 0.3), HIT("own-air-swell", "b0-48", 0.3), ("blizzard-wind-01", "b0", 0.08, None, 30, 40, True)],
  "Armada": [BED("ocean-ships", 0.5), ("rowing-oar-stroke-01", 0, 0.25, None, 10, 20, True), BED("blizzard-wind-01", 0.1), HIT("own-air-swell", "end-50", 0.45)],
}
# the "again" drop gets its impact (TurnTest is shared, so add it by mode)
MODE_SFX = {("TurnTest", "again"): [HIT("own-impact", "b0+8", 0.75), HIT("own-rumble", "b0+8", 0.5)]}
CLIFF = None  # parts end on silence, not a boom

# Sound pass 2: no more "booms" across the rhythm. Heavy physical moments get real thuds, blows get a
# sharp impact, everything else that used the synthetic boom/rumble loses it; beatings are irregular hits.
THUD = [HIT("body-fall-01", 0, 0.8), HIT("sack-drop-01", 2, 0.55)]
BLOW = [HIT("arrow-impact-01", 0, 0.6)]
DROPS = {("KneelWide", "b0+8"), ("Whisper2", "b1+8"), ("Refusals", "b3+18"), ("TurnTest", "b0+8")}
BLOWS = {("Duel2", "b4"), ("Wound", 0), ("Charge", "b0+14")}
def _shift(at, d):
    if isinstance(at, int): return at + d
    m = re.match(r"(b\d|end)([+-]\d+)?", at); return f"{m.group(1)}{int(m.group(2) or 0) + d:+d}"
def _pass2(name, cues):
    out = []
    for c in cues:
        src, at = c[0], c[1]
        if src == "own-impact":
            if (name, at) in DROPS: out += [(t[0], _shift(at, t[1]), t[2], None, 0, 0, False) for t in THUD]
            elif (name, at) in BLOWS: out += [(t[0], _shift(at, t[1]), t[2], None, 0, 0, False) for t in BLOW]
            continue
        if src == "own-rumble":
            if (name, at) in DROPS: out.append((src, at, 0.2, None, 0, 0, False))
            continue
        if src == "own-wings": out.append(("blizzard-wind-01", at, 0.2, c[3], 30, 30, True)); continue
        if src == "impact-slam-35" and c[6]:  # looping beat → four irregular blows
            out += [("impact-slam-35", o, 0.3, None, 0, 0, False) for o in (8, 27, 52, 66)]; continue
        if src == "animal-bird-03" and name == "Birds2": out.append((src, at, 0.16, c[3], 30, 30, True)); continue
        if src == "own-stones" and name == "Birds2": out.append((src, at, 0.28, c[3], 15, 30, True)); continue
        out.append(c)
    return out
SFX = {k: _pass2(k, v) for k, v in SFX.items()}
MODE_SFX = {k: _pass2(k[0], v) for k, v in MODE_SFX.items()}
SFX["Birds2"].append(BED("blizzard-wind-01", 0.2))
LEVEL = 0.6

def main(only=None):
    texts = [open(VO / f"p{i}.plain.txt").read().replace("\n", " ") for i in range(1, 9)]
    pub = ROOT / "public" / "ep1v2"
    t = 0
    scenes, audio, sfx, caps, parts = [], [], [], [], []
    todo = [int(x) for x in only.split(",")] if only else list(range(1, 9))
    for pi in todo:
        txt = texts[pi - 1]
        if pi == 8:  # recitation before the closing lines
            rec = ROOT / "public/ep1/recitation-105.m4a"
            rl = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(rec)], capture_output=True, text=True).stdout)
            audio.append({"src": "ep1/recitation-105.m4a", "from": t + 10})
            scenes.append({"scene": "Recitation", "from": t, "len": int((rl + 1.2) * FPS), "trans": "fade", "props": {"b": [int(v * FPS) + 10 for v in REC_VERSES]}})
            t += 10 + int((rl + 1.0) * FPS)
        ws, dur = base.whisper(pub / f"p{pi}.m4a")
        sw = base.words_of(txt)
        times, ratio = base.align(sw, ws)
        b0 = t
        audio.append({"src": f"ep1v2/p{pi}.m4a", "from": b0})
        fr = lambda sec: b0 + int(round(sec * FPS))
        nsw = [base.norm(w) for w in sw]
        def find(phrase, after=0):
            ph = [p for p in (base.norm(w) for w in base.words_of(phrase)) if p]
            for i in range(after, len(nsw)):
                j, k = i, 0
                while j < len(nsw) and k < len(ph):
                    if not nsw[j]: j += 1; continue
                    if nsw[j] != ph[k]: break
                    j += 1; k += 1
                if k == len(ph): return i
            raise SystemExit(f"anchor not found in part {pi}: {phrase!r}")
        cues = CUES.get(pi, [])
        idx, cur = [], 0
        for c in cues:
            i = find(c[1], cur); idx.append(i); cur = i
        part_end = fr(dur) + GAP
        for ci, (name, _, trans, props, beats) in enumerate(cues):
            st = b0 if ci == 0 else fr(times[idx[ci]]) - 4
            en = (fr(times[idx[ci + 1]]) - 4) if ci + 1 < len(cues) else part_end
            ln = en - st
            b = [bt if isinstance(bt, int) else fr(times[find(bt, idx[ci])]) - st for bt in beats]
            pr = dict(props)
            if b: pr["b"] = b
            if "focus" in pr:
                pr["focus"] = [[fr(times[find(ph, idx[ci])]) - st, v] for v, ph in pr["focus"]]
            scenes.append({"scene": name, "from": st, "len": ln, "trans": trans, "props": pr})
            for s in SFX.get(name, []) + MODE_SFX.get((name, props.get("mode")), []):
                src, a, v, ln2, fi, fo, loop = s
                if v <= 0: continue
                def res(x):
                    if isinstance(x, int): return x
                    m = re.match(r"(b(\d)|end)([+-]\d+)?", x)
                    if m.group(2) and int(m.group(2)) >= len(b): return None
                    return (b[int(m.group(2))] if m.group(2) else ln) + int(m.group(3) or 0)
                off = res(a)
                if off is None: continue
                L = (res(ln2) - off) if isinstance(ln2, str) else (ln2 or ln - off)
                if L <= 0: continue
                sfx.append({"src": src, "from": st + max(0, off), "len": L, "vol": round(v * base.gain(src) * LEVEL, 4), "fadeIn": fi, "fadeOut": fo, "loop": loop})
        # captions: short punchy groups (≤ 4 words, break at punctuation) — used by both formats
        grp = []
        for i, w in enumerate(sw):
            grp.append(i)
            brk = re.search(r"[.!?…:,—]\W*$", w) is not None
            if len(grp) >= 4 or brk or i == len(sw) - 1:
                a0 = fr(times[grp[0]]); a1 = fr(times[i + 1]) if i + 1 < len(sw) else fr(dur)
                caps.append({"from": a0, "to": max(a1, a0 + 12), "words": [{"t": fr(times[k]), "w": sw[k]} for k in grp]})
                grp = []
        if pi <= 6 and CLIFF:
            sfx.append({"src": CLIFF[0], "from": fr(dur) - 2, "vol": round(CLIFF[1] * base.gain(CLIFF[0]) * LEVEL, 4)})
        parts.append({"part": pi, "start": b0, "end": part_end})
        print(f"part {pi}: align {ratio:.2f}  {b0/FPS:6.1f}s -> {part_end/FPS:6.1f}s")
        t = part_end
    if not only or "8" in only.split(","):
        scenes.append({"scene": "EndCard2", "from": t, "len": END, "trans": "fade"})
        parts[-1]["end"] = t + END  # part 7 on TikTok includes the recitation, closing and sources
        t += END
    caps.sort(key=lambda c: c["from"])
    for i in range(len(caps) - 1): caps[i]["to"] = min(caps[i]["to"], caps[i + 1]["from"])
    json.dump({"total": t, "scenes": scenes, "audio": audio, "sfx": sfx, "captions": caps}, open(ROOT / "src/ep1v2/timeline.json", "w"), ensure_ascii=False)
    # TikTok part 7 = parts 7 + 8 (+ recitation)
    tik = [p for p in parts if p["part"] <= 7]
    if len(parts) == 8: tik[-1]["end"] = parts[-1]["end"]
    json.dump(tik, open(ROOT / "tools/ep1v2_parts.json", "w"), indent=1)
    print("total", round(t / FPS, 1), "s")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
