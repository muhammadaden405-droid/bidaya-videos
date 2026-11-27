"""Build each part's voice track from its continuous take (natural flow, no chopping).
Removes the spoken instruction, keeps the take's own pauses, adds extra silence only after the
big suspense lines, drops in the character lines at their places. Writes public/ep4/vo/part<P>.wav
and public/ep4/vo/timeline.json (start time of every line in its part)."""
import json, os, sys
import numpy as np
sys.argv = sys.argv[:1] + [a for a in sys.argv[1:]]
import ep4_vo2 as V
SR = V.SR
CAP_PRE, CAP_POST = 0.12, 0.30  # most a natural gap can be: 0.42 s
LONG = {"N1_01": .3, "N1_03": .4, "N1_08": .5, "N1_11": .3, "N1_15": .4, "N1_17": .3, "N23": .5, "N39": .5, "N43": .4, "N44": .6, "N48": .5, "N54": .4,
        "N55": .4, "N66": .6, "N81": .3, "N88": .6, "N87b": .3, "N68b": .2, "N91": .3, "N96": .4, "N116": .6, "N130": .4, "N137": .4, "N141": .6,
        "N143": .4, "N143b": 1.6, "OLD1": .8, "N147": .5, "N147a": .5, "N148": .4, "N159": .3}
T = V.takes(); tl = json.load(open(os.path.join(V.OUT, "timeline.json"))) if os.path.exists(os.path.join(V.OUT, "timeline.json")) else {}
for p in (sys.argv[1:] or "1234567"):
    lines = [l for l in V.D["lines"] if l[0] == p]
    x = V.rd(os.path.join(V.TAKES, f"N{p}.wav")); nl = T[f"N{p}"]
    r = V.cut(f"N{p}", nl, x)
    env = np.convolve(np.abs(x.astype(np.float32)), np.ones(240) / 240, "same")
    def quiet(a, b):
        a, b = int(a * SR), int(b * SR); return a + int(np.argmin(env[a:b])) if b > a + 10 else (a + b) // 2
    se = [(r[l[1]][2], r[l[1]][3]) for l in nl]
    bnd = [quiet(max(0, se[0][0] - .3), se[0][0])] + [quiet(se[k - 1][1], se[k][0]) for k in range(1, len(nl))] + [min(len(x), int((se[-1][1] + .4) * SR))]
    seg = {}
    for k, l in enumerate(nl):  # keep the line's own sound, cap the silence around it
        a = max(bnd[k], int((se[k][0] - CAP_PRE) * SR)); b = min(bnd[k + 1], int((se[k][1] + CAP_POST) * SR))
        if a > bnd[k]: a = bnd[k] + int(np.argmin(env[bnd[k]:a + 1])) if False else a
        seg[l[1]] = x[a:b].astype(np.float32)
        f = int(.006 * SR); seg[l[1]][:f] *= np.linspace(0, 1, f); seg[l[1]][-f:] *= np.linspace(1, 0, f)
    out, t, starts = [], 0.0, []
    for l in lines:
        y = seg[l[1]] if l[2] == "N" else np.concatenate([np.zeros(int(.12 * SR)), V.rd(os.path.join(V.OUT, l[1] + ".wav")).astype(np.float32), np.zeros(int(.18 * SR))])
        starts.append([l[1], round(t, 2)]); out.append(y); t += len(y) / SR
        g = LONG.get(l[1], 0)
        if g: out.append(np.zeros(int(g * SR))); t += g
    y = np.concatenate(out); f = int(.01 * SR); y[:f] *= np.linspace(0, 1, f); y[-4 * f:] *= np.linspace(1, 0, 4 * f)
    V.wr(os.path.join(V.OUT, f"part{p}.wav"), y); tl[p] = starts
    w = sum(len(l[3].split()) for l in nl); print("part", p, round(len(y) / SR, 1), "s,", round(w / sum(e - s for s, e in se) * 60), "wpm (speech only)")
json.dump(tl, open(os.path.join(V.OUT, "timeline.json"), "w"), indent=0)
