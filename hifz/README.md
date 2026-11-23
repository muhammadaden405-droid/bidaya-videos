# Hifz – Qur'an memorization app

A phone-first, offline web app for memorizing the Qur'an page by page (604-page Madinah Mushaf).

- **Today**: your daily pages as cards you tick off, a tip from the scholars before you start, and a hadith and duʿāʾ when you finish.
- **Mushaf**: read the lesson pages, hide the text to test yourself, and listen with per-verse repeat.
- **Progress**: juz-by-juz page map, revision list, activity, and your goal date with projected finish dates.
- **Recitations**: 12 reciters from EveryAyah.com, saved inside the app for offline listening or downloaded as MP3.
- Works offline once opened, and can be installed to the home screen. Progress is stored on the device; use the backup link to move it.

## Sources
- Qur'an text: Tanzil Quran Text (Uthmani), © Tanzil Project, https://tanzil.net. The copyright notice is kept in `data/quran.json`.
- Page boundaries: Madinah Mushaf (604 pages), from fawazahmed0/quran-api.
- Recitations: https://everyayah.com, streamed and cached by the app.
- Fonts: Amiri Quran (SIL Open Font License, see `fonts/OFL-amiri-quran.txt`), Figtree (SIL OFL).
- Hadith and scholars' words were checked against al-Maktabah al-Shāmilah.

`index.src.html` is the source; `build.py` fills in the surah names and verses to produce `index.html`.

## Qur'an AI recitation checker
Optional, downloaded once from Settings (about 105 MB) and run on the phone:
- Model: [tarteel-ai/whisper-base-ar-quran](https://huggingface.co/tarteel-ai/whisper-base-ar-quran) (Apache-2.0), ONNX export by aaqibhabib, loaded from Hugging Face.
- Runtime: Transformers.js (Apache-2.0) and ONNX Runtime Web (MIT), bundled in `ai/`.
- `data/qsimple.json`: Tanzil's simple-script Qur'an text (tanzil.net, used verbatim with attribution), word-aligned to the Uthmani text by `build_ai.py` so the model can double-check a word before calling it a mistake.
