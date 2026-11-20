"""Episode 3 data. Step 1 (needs the recording workspace ~/vo3 and faster-whisper): copy the tightened beat clips
into public/ep3/vo, add word timings and caption text, write public/ep3/vo/timeline.json and public/ep3/voice.mp3.
Step 2: src/ep3/vo.json = line frames, word-by-word captions and mouth curves (same format as Episode 2)."""
import json, re, shutil, sys, unicodedata, wave
from pathlib import Path
import numpy as np
from scipy.io import wavfile
ROOT = Path(__file__).resolve().parent.parent; FPS = 30; VO = ROOT / "public/ep3/vo"
WS = Path.home() / "vo3"
WHO = {"L": "THE LEPER", "B": "THE BALD MAN", "BL": "THE BLIND MAN"}
def pre(i): return "BL" if i.startswith("BL") else ("N" if i.startswith("N") else i[0])
def toks(s):
    s = unicodedata.normalize("NFKD", s); s = "".join(c for c in s if not unicodedata.combining(c))
    return [t for t in re.sub(r"[^a-z0-9' ]+", " ", s.lower().replace("colour", "color")).split() if t.strip("'")]
if "--build" in sys.argv:
    sys.path.insert(0, str(WS)); from lines import lines
    from faster_whisper import WhisperModel
    from scipy.signal import resample_poly
    M = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=2)
    TEXT = {i: t for i, v, s, t in lines}
    tl = json.load(open(WS / "timeline.json"))["timeline"]
    # per parent line: its beats, in order (split narrator lines are N12_a, N12_b …)
    out = []; seen = {}
    groups = {}
    for e in tl:
        base = e["clip"].split("_")[0]; groups.setdefault((base, e["id"].split("_")[1] if "_" in e["id"] and not e["clip"].count("_") else ""), []).append(e)
    for e in tl:
        clip = e["clip"]; base = clip.split("_")[0]
        seen[e["id"]] = 1
        shutil.copy(WS / "tight" / f"{clip}.wav", VO / f"{clip}.wav")
        sr, x = wavfile.read(VO / f"{clip}.wav"); x = x.astype(np.float32) / 32768
        seg, _ = M.transcribe(resample_poly(x, 16000, sr), word_timestamps=True, beam_size=5, initial_prompt="Allah, leper, sheep, colour")
        ws = [(q.word.strip(), round(q.start, 3)) for z in seg for q in z.words]
        is_echo = e["id"] != clip and not clip.startswith("NS") and pre(clip) != "N"
        kind = "N" if pre(clip) == "N" else ("ECHO" if is_echo else "C")
        out.append({"id": e["id"], "clip": clip, "base": base, "kind": kind, "who": WHO.get(pre(clip)), "start": e["start"], "dur": e["dur"], "file": f"{clip}.wav", "heard": ws})
    # caption text: the script's own words, sliced across a line's split beats by the number of words heard in each
    byb = {}
    for o in out:
        if o["kind"] != "ECHO" and not o["clip"].startswith("NS"): byb.setdefault(o["base"], []).append(o)
    for base, beats in byb.items():
        clips = []; [clips.append(b["clip"]) for b in beats if b["clip"] not in clips]
        disp = TEXT[base].replace("...", "… ").split()
        n_script = sum(len(toks(w)) for w in disp); heard = [len(toks(" ".join(w for w, _ in next(b for b in beats if b["clip"] == c)["heard"]))) for c in clips]
        parts = {}
        if sum(heard) != n_script: print("note: word count", base, heard, n_script, "- slicing by heard counts, last beat takes the rest")
        if True:
            k = 0
            for c, h in zip(clips, heard):
                got = []; n = 0
                while k < len(disp) and (n < h or not toks(disp[k])):
                    got.append(disp[k]); n += len(toks(disp[k])); k += 1
                parts[c] = " ".join(got)
            if k < len(disp): parts[clips[-1]] = (parts[clips[-1]] + " " + " ".join(disp[k:])).strip()
        if False:
            print("WARN word count", base, heard, n_script); [parts.__setitem__(c, " ".join(w for w, _ in next(b for b in beats if b["clip"] == c)["heard"])) for c in clips]
        for b in beats: b["text"] = parts[b["clip"]]
    ref = {o["clip"]: o.get("text") for o in out if o.get("text")}
    for o in out:
        if o["clip"].startswith("NS"): o["text"] = "He said:"
        if not o.get("text"): o["text"] = ref.get(o["clip"]) or TEXT[o["base"]]
        o["words"] = [[w, t] for w, t in o["heard"]]; del o["heard"]
    tot = json.load(open(WS / "timeline.json"))["total"]
    json.dump({"total": tot, "timeline": out}, open(VO / "timeline.json", "w"), indent=1)
    shutil.copy(WS / "ep3_voice_track.mp3", ROOT / "public/ep3/voice.mp3")
    print("beats", len(out))
tl = json.load(open(VO / "timeline.json"))
def ntok(w): return len(toks(w))
lines, caps, mouth = {}, [], {}
for e in tl["timeline"]:
    f0 = round(e["start"] * FPS); f1 = round((e["start"] + e["dur"]) * FPS)
    lines[e["id"]] = {"f0": f0, "f1": f1, "kind": e["kind"]}
    who = e["who"] if e["kind"] in ("C", "ECHO") else None
    disp = e["text"].replace('"', "").split(); counts = [ntok(w) for w in disp]; ws = e["words"]
    if sum(counts) == len(ws) and ws:
        times, k = [], 0
        for c in counts: times.append(ws[k][1] if c else (times[-1] if times else 0.0)); k += c
    else:
        times = [e["dur"] * 0.85 * i / max(1, len(disp)) for i in range(len(disp))]
    group = []
    def flush(end_t):
        if group: caps.append({"from": f0 + round(group[0][1] * FPS), "to": f0 + round(end_t * FPS), "who": who, "words": [{"t": f0 + round(t * FPS), "w": w} for w, t in group]}); group.clear()
    for i, (w, t) in enumerate(zip(disp, times)):
        group.append((w, t))
        if i == len(disp) - 1: flush(e["dur"] + 0.15)
        elif len(group) >= 6 or (re.search(r"[.?!:…;,—]$", w) and len(group) >= 3): flush(times[i + 1])
    if e["kind"] in ("C", "ECHO"):
        sr, x = wavfile.read(VO / e["file"]); x = x.astype(np.float32) / 32768
        n = int(sr / FPS); env = np.array([np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, len(x), n)])
        mouth[e["id"]] = [round(float(v), 2) for v in np.clip(env / (np.percentile(env, 95) + 1e-6), 0, 1)]
for a, b in zip(caps, caps[1:]): a["to"] = min(a["to"], b["from"])
json.dump({"fps": FPS, "total": round(tl["total"] * FPS), "lines": lines, "caps": caps, "mouth": mouth}, open(ROOT / "src/ep3/vo.json", "w"))
print(len(lines), "lines,", len(caps), "caption groups,", len(mouth), "mouth curves; total frames", round(tl["total"] * FPS))
