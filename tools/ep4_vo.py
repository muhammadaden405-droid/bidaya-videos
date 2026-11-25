"""Episode 4 voice track. Runs on GitHub Actions (secret GEMINI_API_KEY).
Narrator lines are recorded in batches (one request per 6 lines, split at the longest pauses);
character lines one request each. Every clip is checked with Whisper against the script.
Output: public/ep4/vo/<ID>.wav, public/ep4/vo/report.md. Lines already recorded are skipped,
so a rerun only fills gaps (delete a wav to re-record that line)."""
import base64, json, os, re, sys, time, urllib.request, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, "tools/ep4_lines.json")))
OUT = os.path.join(ROOT, "public/ep4/vo"); os.makedirs(OUT, exist_ok=True)
KEY = os.environ["GEMINI_API_KEY"]; SR = 24000; BATCH = 6
TAG = {"N": "[fast, intense, steady storyteller]", "NE": "[loud raw grief]", "P": "[firm, angry]", "OLD": "[hoarse, weak, slow]"}
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{D['model']}:generateContent?key={KEY}"

def tts(text, who):
    body = {"contents": [{"parts": [{"text": TAG[who] + " " + text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": D["voices"][who]}}}}}
    for attempt in range(3):
        try:
            req = urllib.request.Request(URL, json.dumps(body).encode(), {"Content-Type": "application/json"})
            r = json.load(urllib.request.urlopen(req, timeout=180))
            b = r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
            return np.frombuffer(base64.b64decode(b), dtype=np.int16)
        except Exception as e:
            print("retry", who, attempt, e); time.sleep(20)
    raise SystemExit("TTS failed; stopping so no quota is wasted")

def trim(x, pad=0.06):
    a = np.abs(x.astype(np.float32)); on = np.where(a > 400)[0]
    if not len(on): return x
    p = int(pad * SR); return x[max(0, on[0] - p): on[-1] + p]

def save(i, x):
    with wave.open(os.path.join(OUT, f"{i}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(trim(x).tobytes())

def split(x, n):
    """cut at the n-1 longest quiet gaps"""
    if n == 1: return [x]
    hop = int(0.02 * SR); env = np.array([np.abs(x[k:k + hop].astype(np.float32)).mean() for k in range(0, len(x), hop)])
    quiet = env < 300; gaps = []; s = None
    for k, q in enumerate(quiet):
        if q and s is None: s = k
        if not q and s is not None: gaps.append((k - s, s, k)); s = None
    gaps = sorted(sorted(g for g in gaps if g[1] > 5)[-(n - 1):], key=lambda g: g[1])
    if len(gaps) < n - 1: return None
    cuts = [0] + [((a + b) // 2) * hop for _, a, b in gaps] + [len(x)]
    return [x[cuts[k]:cuts[k + 1]] for k in range(n)]

todo = [l for l in D["lines"] if not os.path.exists(os.path.join(OUT, f"{l[1]}.wav"))]
groups, cur = [], []
for l in todo:
    if l[2] != "N": groups.append([l]); continue
    if cur and (cur[-1][0] != l[0] or len(cur) == BATCH): groups.append(cur); cur = []
    cur.append(l)
if cur: groups.append(cur)
groups.sort(key=lambda g: D["lines"].index(g[0]))
print(len(todo), "lines in", len(groups), "requests")
for g in groups:
    who = g[0][2]
    text = "\n\n".join(l[3] for l in g) if len(g) > 1 else g[0][3]
    x = tts(text, who); parts = split(x, len(g))
    if parts is None:  # fall back to one request per line
        parts = [tts(l[3], who) for l in g]
    for l, p in zip(g, parts): save(l[1], p)
    print("ok", [l[1] for l in g])

# Whisper check: every clip against its script line
from faster_whisper import WhisperModel
M = WhisperModel("small.en", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z0-9' ]", " ", s.lower().replace("musa", "moosa")).split()
rows, bad = [], 0
for p, i, who, text in D["lines"]:
    seg, _ = M.transcribe(os.path.join(OUT, f"{i}.wav"), beam_size=5, initial_prompt="Musa, Allah, Prophet")
    heard = " ".join(s.text.strip() for s in seg)
    a, b = norm(text), norm(heard)
    ok = [w for w in a if w not in ("moosa", "allah")] == [w for w in b if w not in ("moosa", "moose", "musa", "allah", "allah's")] or a == b
    dur = wave.open(os.path.join(OUT, f"{i}.wav")).getnframes() / SR
    if not ok: bad += 1
    rows.append(f"| {p} | {i} | {dur:.1f} | {'OK' if ok else 'CHECK'} | {text} | {heard} |")
open(os.path.join(OUT, "report.md"), "w").write(
    f"# Episode 4 voice check\n\n{len(rows) - bad} of {len(rows)} lines match the script word for word. Lines marked CHECK need a listen.\n\n"
    "| Part | ID | Sec | Check | Script | Heard |\n|---|---|---|---|---|---|\n" + "\n".join(rows) + "\n")
print("done;", bad, "to check")
