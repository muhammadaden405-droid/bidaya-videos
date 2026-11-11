# Mix the episode's audio from timeline.json with numpy (same linear gains Remotion uses) to check levels.
import json, subprocess, numpy as np, sys, functools
R = "/home/claude/bidaya-videos/"
SR = int(__import__("os").environ.get("SR", "24000")); FPS = 30
T = json.load(open(R + "src/ep1/timeline.json"))
@functools.lru_cache(None)
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
n = int(T["total"] / FPS * SR) + SR
voice = np.zeros(n); fx = np.zeros(n)
for a in T["audio"]:
    x = load(R + "public/" + a["src"]) * a.get("vol", 1); s = int(a["from"] / FPS * SR); voice[s:s + len(x)] += x[: n - s]
for e in T["sfx"]:
    x = load(R + "public/trailer/sfx/" + e["src"] + ".mp3")
    L = int((e.get("len") or 10**6) / FPS * SR)
    if e.get("loop"):
        L = min(L, n); x = np.tile(x, L // len(x) + 1)[:L]
    else:
        x = x[:L]
    L = len(x); f = np.arange(L) / SR * FPS
    g = np.full(L, e["vol"])
    if e.get("fadeIn"): g *= np.minimum(1, f / e["fadeIn"])
    if e.get("fadeOut") and e.get("len"): g *= np.clip((e["len"] - f) / e["fadeOut"], 0, 1)
    s = int(e["from"] / FPS * SR); fx[s:s + L] += (x * g)[: n - s]
def rms(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
w = SR * 5
print("window  voice  fx  (dB RMS, 5 s)")
loud = []
for i in range(0, n - w, w):
    v, f_ = rms(voice[i:i + w]), rms(fx[i:i + w])
    loud.append((f_ - v, i / SR))
    print(f"{i/SR:6.0f}s {v:6.1f} {f_:6.1f} {'  <-- fx loud' if f_ > v - 10 else ''}")
pk = np.abs(fx).max(); print("fx peak", pk)
if len(sys.argv) > 1:
    mix = voice + fx
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", sys.argv[1]], input=mix.astype(np.float32).tobytes())
