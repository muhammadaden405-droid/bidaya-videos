"""Episode 4 data: joins the 7 part voice tracks into one episode track and writes src/ep4/vo.json
(line frames, word-by-word captions, mouth curves for character lines, part boundaries).
Run after tools/ep4_mix.py. Needs faster-whisper (word timings)."""
import json, os, re, subprocess, wave
import numpy as np
from scipy.signal import resample_poly
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO = os.path.join(ROOT, "public/ep4/vo"); FPS = 30; SR = 24000
TAIL = 1.3  # seconds after each part's last line: the door slam, then silence (parts end in silence)
D = json.load(open(os.path.join(ROOT, "tools/ep4_lines.json")))
TL = json.load(open(os.path.join(VO, "timeline.json")))
WHO = {"NE": "THE NEPHEW", "P": "THE PEOPLE", "OLD": "THE DEAD MAN"}
# captions show the Arabic names properly (the voice text spells them for the TTS)
def disp(t): return t.replace("Musa", "Mūsā").replace("...", "…")
def toks(s):
    s = s.lower().replace(",000", " thousand").replace("…", " ")
    s = re.sub(r"\b(70|80|30|60|10|100)\b", lambda m: {"70": "seventy", "80": "eighty", "30": "thirty", "60": "sixty", "10": "ten", "100": "hundred"}[m.group(1)], s)
    s = s.replace("colour", "color").replace("plough", "plow").replace("mūsā", "musa")
    return [w for w in re.sub(r"[^a-z' ]", " ", s).split() if w.strip("'")]
def rd(p):
    w = wave.open(p); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768

from faster_whisper import WhisperModel
M = WhisperModel("small.en", device="cpu", compute_type="int8")
text = {l[1]: l[3] for l in D["lines"]}; spk = {l[1]: l[2] for l in D["lines"]}
lines, caps, mouth, parts, audio = {}, [], {}, [], []
t0 = 0.0
for p in "1234567":
    x = rd(os.path.join(VO, f"part{p}.wav")); dur = len(x) / SR
    seg, _ = M.transcribe(resample_poly(x, 2, 3).astype(np.float32), beam_size=5, word_timestamps=True, condition_on_previous_text=False)
    heard = [(w.start, w.end, w.word.strip()) for s in seg for w in s.words]
    order = TL[p]
    for k, (i, s) in enumerate(order):
        e = order[k + 1][1] if k + 1 < len(order) else dur
        f0 = round((t0 + s) * FPS); f1 = round((t0 + e) * FPS) - 2
        lines[i] = {"f0": f0, "f1": f1, "kind": "N" if spk[i] == "N" else "C", "part": int(p)}
        words = disp(text[i]).replace('"', "").split()
        hw = [h for h in heard if s - 0.05 <= h[0] < e - 0.05]
        counts = [len(toks(w)) for w in words]
        if hw and sum(counts) == sum(len(toks(h[2])) or 1 for h in hw) and len(hw) == sum(counts):
            times, j = [], 0
            for c in counts: times.append(hw[j][0] if c else (times[-1] if times else s)); j += c
        else:  # spread over the line's speech by word length (Whisper splits numbers and names differently)
            sp = [hw[0][0], hw[-1][1]] if hw else [s, e - 0.2]
            L = [max(2, len(w)) for w in words]; acc = np.cumsum([0] + L[:-1]) / max(1, sum(L))
            times = [sp[0] + a * (sp[1] - sp[0]) for a in acc]
        group = []
        def flush(end_t):
            if group:
                caps.append({"from": round((t0 + group[0][1]) * FPS), "to": round((t0 + end_t) * FPS), "who": WHO.get(spk[i]),
                             "words": [{"t": round((t0 + t) * FPS), "w": w} for w, t in group]}); group.clear()
        for n, (w, t) in enumerate(zip(words, times)):
            group.append((w, t))
            if n == len(words) - 1: flush(e - 0.05)
            elif len(group) >= 5 or (re.search(r"[.?!:…;,—]$", w) and len(group) >= 2): flush(times[n + 1])
        if spk[i] != "N":
            y = x[int(s * SR): int(e * SR)]; n = SR // FPS
            env = np.array([np.sqrt(np.mean(y[a:a + n] ** 2)) for a in range(0, len(y), n)])
            mouth[i] = [round(float(v), 2) for v in np.clip(env / (np.percentile(env, 95) + 1e-6), 0, 1)]
    end = t0 + dur + TAIL
    parts.append({"n": int(p), "start": round(t0 * FPS), "end": round(end * FPS), "lastLine": order[-1][0]})
    audio.append(np.concatenate([x, np.zeros(int(TAIL * SR), np.float32)])); t0 = end
for a, b in zip(caps, caps[1:]): a["to"] = min(a["to"], b["from"])
y = np.concatenate(audio)
w = wave.open(os.path.join(VO, "_ep.wav"), "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(VO, "_ep.wav"), "-ar", "48000", "-b:a", "192k", os.path.join(ROOT, "public/ep4/voice.mp3")], check=True)
os.remove(os.path.join(VO, "_ep.wav"))
os.makedirs(os.path.join(ROOT, "src/ep4"), exist_ok=True)
json.dump({"fps": FPS, "total": round(t0 * FPS), "lines": lines, "caps": caps, "mouth": mouth, "parts": parts}, open(os.path.join(ROOT, "src/ep4/vo.json"), "w"))
json.dump(parts, open(os.path.join(ROOT, "public/ep4/parts.json"), "w"))
print("frames", round(t0 * FPS), "lines", len(lines), "caps", len(caps), [(q["n"], round((q["end"] - q["start"]) / FPS, 1)) for q in parts])
