#!/usr/bin/env python3
"""Cut the Episode 4 Shorts from the rendered 9:16 film and append each Short's channel card.

usage: python3 tools/ep4_shorts.py <Ep4Vertical.mp4> <cards dir with card_<Name>.mp4> <out dir>
The frame ranges and teases live in src/ep4/Shorts.tsx (EP4_SHORTS); the cards are rendered from the
Ep4ShortCard-<Name> compositions. The story stretch fades to black over its last 8 frames (audio over the
last 5) so the cut into the card never feels like an error.
"""
import re, subprocess, sys, pathlib

FPS = 30
film, cards, out = sys.argv[1], pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3])
src = pathlib.Path(__file__).resolve().parent.parent / "src/ep4/Shorts.tsx"
defs = re.findall(r'id: "Ep4Short-(\w+)", segs: (\[\[.*?\]\]),', src.read_text())
out.mkdir(parents=True, exist_ok=True)
for name, segs in defs:
    segs = [tuple(map(int, s)) for s in re.findall(r"\[(\d+), (\d+)\]", segs)]
    fc, cat = [], ""
    for i, (a, b) in enumerate(segs):
        fc.append(f"[0:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS[v{i}]")
        fc.append(f"[0:a]atrim=start={a / FPS:.4f}:end={b / FPS:.4f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo[a{i}]")
        cat += f"[v{i}][a{i}]"
    n = sum(b - a for a, b in segs)
    fc.append(f"{cat}concat=n={len(segs)}:v=1:a=1[sv][sa]")
    fc.append(f"[sv]fade=t=out:start_frame={n - 8}:nb_frames=8[sv2]")
    fc.append(f"[sa]afade=t=out:st={(n - 5) / FPS:.4f}:d={5 / FPS:.4f}[sa2]")
    fc.append("[1:a]aformat=sample_rates=48000:channel_layouts=stereo[ca]")
    fc.append("[sv2][sa2][1:v][ca]concat=n=2:v=1:a=1[v][a]")
    dst = out / f"Ep4Short-{name}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", film, "-i", str(cards / f"card_{name}.mp4"), "-filter_complex", ";".join(fc),
                    "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(dst)], check=True)
    print(dst, f"{(n + 105) / FPS:.1f}s")
