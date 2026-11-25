"""Re-cut Episode 4 clips by Whisper word timings (no new TTS requests).
Rebuilds each recorded batch by joining its clips, finds where every script line starts,
cuts there, and drops spoken style tags ("Firm, angry")."""
import json, os, re, wave, difflib
import numpy as np
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, "tools/ep4_lines.json"))); OUT = os.path.join(ROOT, "public/ep4/vo"); SR = 24000
M = WhisperModel("small.en", device="cpu", compute_type="int8")
num = {"70,000": "seventy thousand", "80,000": "eighty thousand", "30,000": "thirty thousand", "100,000": "a hundred thousand", "10": "ten", "60": "sixty"}
def toks(s):
    s = s.lower()
    for k, v in num.items(): s = s.replace(k, v)
    s = s.replace("colour", "color").replace("plough", "plow").replace("neighbours", "neighbors").replace("bye", "by")
    return re.sub(r"[^a-z0-9' ]", " ", s).split()
def rd(i):
    w = wave.open(os.path.join(OUT, f"{i}.wav")); return np.frombuffer(w.readframes(w.getnframes()), np.int16)
def wr(i, x):
    w = wave.open(os.path.join(OUT, f"{i}.wav"), "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.astype(np.int16).tobytes()); w.close()
groups, cur = [], []
for l in D["lines"]:
    if l[2] != "N": groups.append([l]); continue
    if cur and (cur[-1][0] != l[0] or len(cur) == 6): groups.append(cur); cur = []
    cur.append(l)
if cur: groups.append(cur)
for g in groups:
    gap = np.zeros(int(0.25 * SR), np.int16)
    x = np.concatenate(sum([[rd(l[1]), gap] for l in g], []))
    seg, _ = M.transcribe(resample_poly(x.astype(np.float32) / 32768, 2, 3).astype(np.float32), beam_size=5, word_timestamps=True, initial_prompt="Musa, Allah")
    hw = [(w.word, w.start, w.end) for s in seg for w in s.words]
    ht = [toks(w)[0] if toks(w) else "" for w, _, _ in hw]
    st, owner = [], []
    for k, l in enumerate(g):
        t = toks(l[3]); st += t; owner += [k] * len(t)
    sm = difflib.SequenceMatcher(None, st, ht, autojunk=False)
    m = {}
    for a, b, n in sm.get_matching_blocks():
        for j in range(n): m[a + j] = b + j
    if not m: print("no match", [l[1] for l in g]); continue
    starts = []
    for k in range(len(g)):
        idx = [i for i, o in enumerate(owner) if o == k]
        hits = [m[i] for i in idx if i in m]
        starts.append(min(hits) - (idx.index(next(i for i in idx if i in m)) if hits else 0) if hits else None)
    ends = []
    for k in range(len(g)):
        idx = [i for i, o in enumerate(owner) if o == k]; hits = [m[i] for i in idx if i in m]
        ends.append(max(hits) + (len(idx) - 1 - idx.index(max(i for i in idx if i in m))) if hits else None)
    if None in starts or None in ends: print("gap, kept old cut", [l[1] for l in g]); continue
    for k, l in enumerate(g):
        s0 = hw[max(0, min(starts[k], len(hw) - 1))][1]; e0 = hw[min(ends[k], len(hw) - 1)][2]
        if k > 0: s0 = max(s0 - 0.08, hw[min(ends[k - 1], len(hw) - 1)][2])
        e0 = e0 + 0.12 if k == len(g) - 1 else min(e0 + 0.12, hw[max(0, min(starts[k + 1], len(hw) - 1))][1])
        wr(l[1], x[int(max(0, s0 - 0.04) * SR): int(e0 * SR)])
    print("ok", [l[1] for l in g])
