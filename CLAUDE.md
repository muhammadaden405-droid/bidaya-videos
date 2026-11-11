# bidaya-videos — working notes

Weekly animated history series from Ibn Kathīr's *al-Bidāya wa al-Nihāya* (handle bidayah.nihayah). Remotion 4. Episode 1 v2 lives in `src/ep1v2/`.

## Series rules (from the channel owner)
- Faceless characters; Sahaba never shown. No music; real-sounding SFX kept in the background.
- Narration told as a story (no "this scholar said"), facts checked against Shamela; page refs on the end card.
- Qur'an: only the owner's own recitation, Shamela Arabic + Hilali–Khan translation + surah:verse.
- Logo watermark in a corner. Two versions: YouTube 16:9 and TikTok 9:16 (composed natively for vertical, not cropped). No part cards, no rotate-phone card.
- Never commit API keys or passwords.

## Animation checklist (all were real mistakes in Episode 1)
- Seat characters by the hips: `SITC` / `SITG` poses, `seatY()`, `ThroneSeat`; shadow at the hips. Nobody floats on thrones, carpets, campfires, litters, elephants (`Mahout`) or horses (`RIDE`, rider slot `translate(-6,-208)`).
- Consistent scale: driver full size, no giants (Aryāṭ `sy ≤ 1.05`), litter body not shrunk. No camera cuts or position wrapping that make figures pop in size.
- Walk cycles only while the figure actually moves; gallop = 0 once a horse stops.
- Speakers face their listener (use `flip`).
- No invented regalia (Dhū Nuwās has no crown).
- Abraha: `scarred()` outfit only from the duel onward; the wound reads as a scar, not just hands over the face.
- Thumbnails: the elephant never has its back to the Kaaba.

## Narration checklist
- Gemini TTS (voice "American narrator A") can change or invent words: Whisper every take and diff it against the script before use (e.g. "protected for me" vs "from me").
- Say who speaks before a quote; keep sentences logically connected.
- `.plain.txt` caption text must match what is actually spoken (e.g. "Then" vs "And"); rebuild `tools/ep1v2_timeline.py` after any change.

## Sound
- No musical booms. Use real thuds/impacts (body-fall, sack-drop, arrow-impact). Birds soft (≈0.16). Parts end in silence.

## Rendering
- Do the final text/narration/page check BEFORE the full render.
- GitHub Actions `render-chunks.yml` (12 chunks) refused to start (`startup_failure`, even for `cleanup.yml`) after ~12 heavy runs in one day. Use fewer chunks and fewer runs per day.
- Local fallback: `--browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome --concurrency=2` (Remotion cannot download its own Chrome here). ~0.25–0.75 s/frame on 2 cores.
- For small fixes, diff old vs new `timeline.json` frame by frame, re-render only the changed ranges (±30 frames) and splice them into the previous render (`/home/claude/renders/patch/splice.py`), instead of a full re-render.
- Thumbnails: `Ep1Thumb` (16:9, props line1/line2) and `Ep1ThumbV` (9:16, prop part) in `src/ep1v2/Thumb.tsx`; render with `npx remotion still`.
