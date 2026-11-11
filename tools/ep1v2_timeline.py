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
  "Armada": [BED("ocean-ships", 0.5), ("rowing-oar-stroke-01", 0, 0.25, None, 10, 20, True), BED("blizzard-wind-01", 0.1), HIT("own-air-swell", "end-50", 0.45)],
}
# the "again" drop gets its impact (TurnTest is shared, so add it by mode)
MODE_SFX = {("TurnTest", "again"): [HIT("own-impact", "b0+8", 0.75), HIT("own-rumble", "b0+8", 0.5)]}
CLIFF = ("own-impact", 0.6)
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
        if pi <= 6:
            sfx.append({"src": CLIFF[0], "from": fr(dur) - 2, "vol": round(CLIFF[1] * base.gain(CLIFF[0]) * LEVEL, 4)})
        parts.append({"part": pi, "start": b0, "end": part_end})
        print(f"part {pi}: align {ratio:.2f}  {b0/FPS:6.1f}s -> {part_end/FPS:6.1f}s")
        t = part_end
    if not only or "8" in only.split(","):
        scenes.append({"scene": "EndCard", "from": t, "len": END, "trans": "fade"})
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
