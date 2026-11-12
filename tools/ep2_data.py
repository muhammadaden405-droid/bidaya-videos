"""Episode 2 data for Remotion, from the locked voice track (public/ep2/vo/timeline.json):
src/ep2/vo.json = line frames, word-by-word captions, and a per-frame mouth-open curve for every character line."""
import json, re, shutil, unicodedata
from pathlib import Path
import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
VO = ROOT / "public/ep2/vo"
tl = json.load(open(VO / "timeline.json"))
LABEL = {"The king": "THE KING", "The boy": "THE BOY", "The monk": "THE MONK", "The companion": "THE KING'S COMPANION", "The sorcerer": "THE SORCERER"}
ECHO = {"M2_echo": ("THE MONK", "You will be tested. And if you are tested, do not lead them to me."), "K3_echo": ("THE KING", "You have a lord other than me?"), "B5_echo": ("THE BOY", "My Lord, and your Lord, is Allah.")}

def ntok(w):
    w = unicodedata.normalize("NFKD", w); w = "".join(c for c in w if not unicodedata.combining(c))
    return len([t for t in re.sub(r"[^a-z' ]+", " ", w.lower().replace("’", "'")).split() if t.strip("'")])

lines, caps, mouth = {}, [], {}
for e in tl["timeline"]:
    f0 = round(e["start"] * FPS); f1 = round((e["start"] + e["dur"]) * FPS)
    lines[e["id"]] = {"f0": f0, "f1": f1, "kind": e["kind"]}
    text = e.get("text") or (ECHO[e["id"]][1] if e["id"] in ECHO else None)
    if not text: continue
    who = LABEL.get(e.get("who")) if e["kind"] == "C" else (ECHO[e["id"]][0] if e["id"] in ECHO else None)
    disp = text.replace('"', "").split()
    counts = [ntok(w) for w in disp]; ws = e.get("words") or []
    times = []
    if sum(counts) == len(ws) and ws:
        k = 0
        for c in counts:
            times.append(ws[k][1] if c else (times[-1] if times else 0.0)); k += c
    else:
        d = e["dur"] / (0.94 if e["kind"] == "ECHO" else 1.0)
        times = [d * 0.85 * i / max(1, len(disp)) for i in range(len(disp))]
    # short caption groups: break after punctuation or at 6 words
    group = []
    def flush(end_t):
        if not group: return
        caps.append({"from": f0 + round(group[0][1] * FPS), "to": f0 + round(end_t * FPS), "who": who, "words": [{"t": f0 + round(t * FPS), "w": w} for w, t in group]})
        group.clear()
    for i, (w, t) in enumerate(zip(disp, times)):
        group.append((w, t))
        last = i == len(disp) - 1
        if last: flush(e["dur"] + 0.15)
        elif len(group) >= 6 or (re.search(r"[.?!:…;,—]$", w) and len(group) >= 3): flush(times[i + 1])
    if e["kind"] in ("C", "ECHO"):
        sr, x = wavfile.read(VO / e["file"]); x = x.astype(np.float32) / 32768
        if x.ndim > 1: x = x.mean(axis=1)
        n = int(sr / FPS); env = np.array([np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, len(x), n)])
        env = np.clip(env / (np.percentile(env, 95) + 1e-6), 0, 1)
        mouth[e["id"]] = [round(float(v), 2) for v in env]
for a, b in zip(caps, caps[1:]): a["to"] = min(a["to"], b["from"])
json.dump({"fps": FPS, "total": round(tl["total"] * FPS), "lines": lines, "caps": caps, "mouth": mouth}, open(ROOT / "src/ep2/vo.json", "w"))
print(len(lines), "lines,", len(caps), "caption groups,", len(mouth), "mouth curves; total frames", round(tl["total"] * FPS))

# a soft, real-sounding slap (short filtered noise burst with a quick decay), since none is in the library
rng = np.random.default_rng(7); sr = 48000; n = int(sr * 0.22); t = np.arange(n) / sr
noise = rng.standard_normal(n); k = np.ones(24) / 24; body = np.convolve(noise, k, "same")
y = (0.75 * (noise - np.convolve(noise, np.ones(6) / 6, "same")) * np.exp(-t / 0.012) + 1.6 * body * np.exp(-t / 0.045)) * np.minimum(1, t / 0.001)
(ROOT / "public/ep2/sfx").mkdir(parents=True, exist_ok=True)
wavfile.write(ROOT / "public/ep2/sfx/slap.wav", sr, (np.clip(y / np.abs(y).max() * 0.8, -1, 1) * 32767).astype(np.int16))
