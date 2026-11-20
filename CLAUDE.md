# bidaya-videos — working notes

Weekly animated history series from Ibn Kathīr's *al-Bidāya wa al-Nihāya* (handle bidayah.nihayah). Remotion 4. Episode 1 v2 lives in `src/ep1v2/`.

## Series rules (from the channel owner)
- Faceless characters; Sahaba never shown. No music; real-sounding SFX kept in the background.
- Narration told as a story (no "this scholar said"), facts checked against Shamela; page refs on the end card.
- Qur'an: only the owner's own recitation, Shamela Arabic + Hilali–Khan translation + surah:verse.
- Logo watermark in a corner. Two versions: YouTube 16:9 and TikTok 9:16 (composed natively for vertical, not cropped). No part cards, no rotate-phone card.
- Never commit API keys or passwords.

## Characters (owner's rules from Episode 2 on)
- Faces: a mouth that lip-syncs and shows emotion, no eyes (`Person` props `mouth`, `mood`).
- Main characters must always look clearly distinct from everyone else; crowds and guards stay muted browns. Episode 2 cast lives in `src/ep2/cast.ts`: king with a jewelled crown, gold trim, fur collar and beard (`royal`); old evil sorcerer with hood, long white beard, faint robe symbols and a plain gnarled staff (no bright green glow or smoke) (`hood`, `longBeard`, `runes`, `staff`); the boy in pure white with a teal sash and soft light (`sash`, `aura`). Give every future main character the same treatment.

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
- Emotion (Episode 2 on): each phrase gets a short `speech_metadata` style ("tender and moved, his voice catching with pride"); split a line into phrases where the feeling changes. No breath/exhale tags at the start of a line (they sound forced). The boy's voice needs "Allāh" in the request text to say it the Arabic way; captions stay "Allah".
- Gemini TTS is capped at 100 requests/day (resets 12:00 Dubai). Record several lines per request (`<long pause>` between lines), then split at the pauses. The voice sometimes reads the tags aloud ("long pause"), and "…" pauses inside a line can look like line gaps: check every clip for a spoken "pause" and re-split by expected line length before re-recording.
- Episode 2 voices: `public/ep2/vo/` (one 48 kHz clip per line, `timeline.json` with the running order and start times, hooks H2–H7 for TikTok parts).

## Sound
- No musical booms. Use real thuds/impacts (body-fall, sack-drop, arrow-impact). Birds soft (≈0.16). Parts end in silence.

## Rendering
- Do the final text/narration/page check BEFORE the full render.
- GitHub Actions `render-chunks.yml` (12 chunks) refused to start (`startup_failure`, even for `cleanup.yml`) after ~12 heavy runs in one day. Use fewer chunks and fewer runs per day.
- Local fallback: `--browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome --concurrency=2` (Remotion cannot download its own Chrome here). ~0.25–0.75 s/frame on 2 cores.
- For small fixes, diff old vs new `timeline.json` frame by frame, re-render only the changed ranges (±30 frames) and splice them into the previous render (`/home/claude/renders/patch/splice.py`), instead of a full re-render.
- Thumbnails: `Ep1Thumb` (16:9, props line1/line2) and `Ep1ThumbV` (9:16, prop part) in `src/ep1v2/Thumb.tsx`; render with `npx remotion still`.

## Episode 3 (The Blind Man, the Leper and the Bald Man)
- Code in `src/ep3/` (kit copied from ep2, `scenes.tsx`, `animals.tsx`, `cast.ts`). Voice beats in `public/ep3/vo/` (narrator lines split into one clip per sentence for pace), data from `tools/ep3_data.py`.
- Owner's rule: a cut or clear camera move at least every 3 s (`cutCam` adds reframes every 84 frames).
- Render: edit `render-request.json` on the `ep3` branch and push; `.github/workflows/render-ep3.yml` renders both films in 6 chunks each, mixes audio, cuts the 7 TikTok parts from the 9:16 film (`public/ep3/parts.json`) and publishes to `render/Ep3-*` and `render/Ep3Vertical-*` branches.
- New sound effects: this machine can't reach sound sites. Add `name | url` lines (CC0 / public domain only) to `tools/sfx-fetch.txt` on `ep3` and push; `.github/workflows/fetch-sfx.yml` downloads them into `public/trailer/sfx/<name>.mp3` and commits. Cow = BigSoundBank #0546 (CC0), sheep = OpenGameArt "Sheep Baa" (CC0).
