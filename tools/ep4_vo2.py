"""Episode 4 voice track, v2: one take per part for the narrator, one take per character,
so each voice stays the same. Lines are cut out of each take by Whisper word timings, at the
quietest point between words, with short fades (no clicks at sentence ends).
Usage: GEMINI_API_KEY=... python3 tools/ep4_vo2.py [take names, e.g. N1 NE P OLD]  (none = all missing)
Takes are cached in public/ep4/vo/takes/; clips go to public/ep4/vo/<ID>.wav."""
import base64, json, os, re, sys, time, urllib.request, wave, difflib
import numpy as np
from scipy.signal import resample_poly
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, "tools/ep4_lines.json")))
OUT = os.path.join(ROOT, "public/ep4/vo"); TAKES = os.path.join(OUT, "takes"); os.makedirs(TAKES, exist_ok=True)
SR = 24000

STYLE = {
    "N": "Read this like a gripping mystery storyteller on a true-crime video. Measured pace, about 185 words a minute: "
         "a little quicker in the action and arguing, slower and tense in the suspense moments, with a short pause between lines. "
         "Same warm, steady voice from start to finish. No whispering. Say Musa as Moo-saa and Allah as Allaah.",
    "NE": "A young man of about 25, plain American accent. The first two lines he is wailing over his uncle's body; "
          "the last two he is still crying but speaking clearly to the Prophet. It is the same man the whole time, same voice. "
          "Real grief, not theatrical. Pause between lines.",
    "P": "A firm, blunt man in his fifties, plain American accent, speaking for an angry crowd. Real, controlled emotion. "
         "Measured pace, pause between lines. Same voice throughout.",
    "OLD": "A very old man who has just been brought back to life. Hoarse, weak, slow, but every word clear. Plain American accent.",
}
VOICE = {"N": D["voices"]["N"], "NE": D["voices"]["NE"], "P": D["voices"]["P"], "OLD": D["voices"]["OLD"]}

def takes():
    t = {}
    for l in D["lines"]:
        name = l[2] + l[0] if l[2] == "N" else l[2]
        t.setdefault(name, []).append(l)
    return t

def tts(name, lines):
    key = os.environ["GEMINI_API_KEY"]; who = lines[0][2]
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{D['model']}:generateContent?key={key}"
    text = STYLE[who] + "\n\n" + "\n".join(l[3] for l in lines)
    body = {"contents": [{"parts": [{"text": text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE[who]}}}}}
    for a in range(4):
        try:
            req = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json"})
            r = json.load(urllib.request.urlopen(req, timeout=300))
            return np.frombuffer(base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]), np.int16)
        except Exception as e:
            msg = getattr(e, "read", lambda: b"")()[:300]
            print("retry", name, a, e, msg); time.sleep(25 * (a + 1))
    raise SystemExit("TTS failed for " + name)

def rd(p):
    w = wave.open(p); return np.frombuffer(w.readframes(w.getnframes()), np.int16)
def wr(p, x):
    w = wave.open(p, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.astype(np.int16).tobytes()); w.close()

num = {"seventy thousand": "70,000", "eighty thousand": "80,000", "thirty thousand": "30,000", "a hundred thousand": "100,000", "sixty": "60", "ten": "10"}
def toks(s):
    s = s.lower().replace(",000", " thousand")
    for a, b in [("70", "seventy"), ("80", "eighty"), ("30", "thirty"), ("100", "hundred"), ("60", "sixty"), ("10", "ten"),
                 ("colour", "color"), ("plough", "plow"), ("neighbours", "neighbors"), ("bye", "by"), ("qur'an", "quran")]:
        s = re.sub(r"\b" + a + r"\b", b, s)
    return re.sub(r"[^a-z' ]", " ", s).split()

M = None
def cut(name, lines, x):
    global M
    if M is None:
        from faster_whisper import WhisperModel
        M = WhisperModel("small.en", device="cpu", compute_type="int8")
    seg, _ = M.transcribe(resample_poly(x.astype(np.float32) / 32768, 2, 3).astype(np.float32),
                          beam_size=5, word_timestamps=True, initial_prompt="Musa, Allah, Prophet")
    hw = [(w.start, w.end, (toks(w.word) or [""])[0]) for s in seg for w in s.words]
    st, own = [], []
    for k, l in enumerate(lines):
        t = toks(l[3]); st += t; own += [k] * len(t)
    sm = difflib.SequenceMatcher(None, st, [h[2] for h in hw], autojunk=False)
    m = {a + j: b + j for a, b, n in sm.get_matching_blocks() for j in range(n)}
    span = []
    for k, l in enumerate(lines):
        idx = [i for i, o in enumerate(own) if o == k]; hits = sorted(m[i] for i in idx if i in m)
        if hits:  # drop stray matches far from the line's main run
            med = hits[len(hits) // 2]; hits = [h for h in hits if abs(h - med) <= len(idx) + 3]
        span.append((hits[0], hits[-1], len(hits) / len(idx)) if hits else None)
    env = np.convolve(np.abs(x.astype(np.float32)), np.ones(240) / 240, "same")
    def quiet(a, b):  # quietest sample between a and b seconds
        a, b = int(a * SR), int(b * SR)
        return (a + int(np.argmin(env[a:b]))) / SR if b > a + 10 else (a + b) / 2 / SR
    res = {}
    for k, l in enumerate(lines):
        if span[k] is None or span[k][2] < 0.6:
            pv = span[k - 1] if k else None; nx = span[k + 1] if k + 1 < len(lines) else None
            if not (pv and nx and nx[0] - pv[1] - 1 <= len(toks(l[3])) + 2): res[l[1]] = None; continue
            span[k] = (pv[1] + 1, nx[0] - 1, 1.0)  # the words between its neighbours
        s, e = hw[span[k][0]][0], hw[span[k][1]][1]
        prev = next((span[j] for j in range(k - 1, -1, -1) if span[j]), None)
        nxt = next((span[j] for j in range(k + 1, len(lines)) if span[j]), None)
        s0 = quiet(max(hw[prev[1]][1], s - 0.6), s) if prev else max(0, s - 0.25)
        e0 = quiet(e, min(hw[nxt[0]][0], e + 0.8)) if nxt else min(len(x) / SR, e + 0.5)
        y = x[int(s0 * SR): int(e0 * SR)].astype(np.float32)
        a = np.abs(y); on = np.where(a > 350)[0]
        if len(on): y = y[max(0, on[0] - int(0.03 * SR)): on[-1] + int(0.12 * SR)]
        fi, fo = int(0.008 * SR), int(0.04 * SR)
        y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo)
        res[l[1]] = (y, span[k][2])
    return res

if __name__ == "__main__":
    T = takes(); want = sys.argv[1:] or list(T)
    for name in want:
        p = os.path.join(TAKES, name + ".wav")
        if not os.path.exists(p):
            wr(p, tts(name, T[name])); print("recorded", name)
        r = cut(name, T[name], rd(p))
        miss = [i for i, v in r.items() if v is None]
        for i, v in r.items():
            if v: wr(os.path.join(OUT, i + ".wav"), v[0])
        print("cut", name, "missing:", miss)
