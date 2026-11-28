import React from "react";
import { AbsoluteFill, Freeze, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { sans, amiri, serif, display } from "../fonts";
import { Grain } from "../ep1/kit";
import { Abs, V, lf, iv, ease, useShot } from "./kit";
import { Doorstep, Accusation, Doubt, NoTrace, Split, Elder, ToMusa, Plead, Family, Silence, Answer, AnyCow, Questions, Search, Haggle, Ruling, Pearls, Reward, Gold, Slaughter, Revival, Suspects, Reveal, Inherit } from "./scenes";
import { TopSplit, TopCrowd, TopStrike } from "./overhead";
import { Land3D } from "./three";

// Episode 4 — The Dead Man Who Named His Killer. One timeline, two films (16:9 and 9:16), cut to the locked voice
// track (src/ep4/vo.json). Seven TikTok parts; each part ends on a door slam, then loops back into its own first frame.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Cue = { C: React.FC<any>; from: number; to: number; props?: Record<string, unknown> };
type Part = { n: number; start: number; end: number; lastLine: string };
const P = (V as unknown as { parts: Part[] }).parts;
const ps = (n: number) => P[n - 1].start, pe = (n: number) => P[n - 1].end;
const VERSE_AT = V.lines["N162"].f1 + 6;
const REC_LEN = 28.6, REC_SPLIT = 13.2; // the owner's recitation of al-Baqarah 2:72–73 (public/ep4/recitation.mp3); 73 begins at 13.2 s
const REC_AT = 18;
const VERSE_LEN = REC_AT + Math.ceil(REC_LEN * 30) + 30;
const END_LEN = 150;
const OUT = VERSE_AT + VERSE_LEN;
export const EP4_LEN = OUT + END_LEN;
const SCENES: Cue[] = [
  // Part 1
  { C: Doorstep, from: 0, to: lf("N1_04") },
  { C: Accusation, from: lf("N1_04"), to: lf("N1_06") },
  { C: Doubt, from: lf("N1_06"), to: lf("N1_15") },
  { C: NoTrace, from: lf("N1_15"), to: lf("N1_17") },
  { C: Split, from: lf("N1_17"), to: lf("N1_18") },
  { C: TopSplit, from: lf("N1_18"), to: lf("N1_19") },
  { C: Split, from: lf("N1_19"), to: pe(1), props: { reachAt: "N1_19", apart: true } },
  // Part 2
  { C: Split, from: ps(2), to: lf("N30"), props: { drawn: true, killerLine: "N27" } },
  { C: Elder, from: lf("N30"), to: lf("N31") },
  { C: ToMusa, from: lf("N31"), to: lf("N35") },
  { C: Plead, from: lf("N35"), to: lf("N36") },
  { C: Family, from: lf("N36"), to: lf("N37") },
  { C: Silence, from: lf("N37"), to: lf("N39"), props: { flareAt: "N37" } },
  { C: TopCrowd, from: lf("N39"), to: lf("N40") },
  { C: Silence, from: lf("N40"), to: pe(2), props: { cuts: ["N41", "N42", "N43", "N44"] } },
  // Part 3
  { C: Silence, from: ps(3), to: lf("N52"), props: { flareAt: "N45b", cuts: ["N45b", "N47", "N48"] } },
  { C: Answer, from: lf("N52"), to: lf("N62") },
  { C: AnyCow, from: lf("N62"), to: pe(3) },
  // Part 4
  { C: Questions, from: ps(4), to: pe(4) },
  // Part 5
  { C: Search, from: ps(5), to: lf("N90") },
  { C: Land3D, from: lf("N90"), to: lf("N92"), props: { shot: "farms" } },
  { C: Search, from: lf("N92"), to: lf("N99") },
  { C: Haggle, from: lf("N99"), to: lf("N108") },
  { C: Ruling, from: lf("N108"), to: pe(5) },
  // Part 6
  { C: Pearls, from: ps(6), to: lf("N130") },
  { C: Reward, from: lf("N130"), to: lf("N131d") },
  { C: Gold, from: lf("N131d"), to: lf("N138") },
  { C: Slaughter, from: lf("N138"), to: pe(6) },
  // Part 7
  { C: TopStrike, from: ps(7), to: lf("N142b") },
  { C: Revival, from: lf("N142b"), to: lf("N143a") },
  { C: Suspects, from: lf("N143a"), to: lf("OLD1") },
  { C: Reveal, from: lf("OLD1"), to: lf("N154") },
  { C: Inherit, from: lf("N154"), to: lf("N159") },
  { C: Land3D, from: lf("N159"), to: VERSE_AT, props: { shot: "dawn" } },
];
export const EP4_PARTS = P.map((p) => ({ n: p.n, start: p.start, end: p.n === 7 ? EP4_LEN : p.end }));

// ───────── sound (no music; real sounds kept in the background; parts end in silence) ─────────
type Sfx = { src: string; from: number; len?: number; vol: number; fadeIn?: number; fadeOut?: number; loop?: boolean };
const lib = (n: string) => `trailer/sfx/${n}.mp3`;
const one = (n: string, from: number, v: number, len = 90, fadeOut = 20): Sfx => ({ src: lib(n), from, len, vol: v, fadeOut });
const bed = (n: string, from: number, to: number, v: number): Sfx => ({ src: lib(n), from, len: to - from, vol: v, fadeIn: 12, fadeOut: 12, loop: true });
// Ambience: real recorded beds (BigSoundBank CC0, processed into public/ep4/sfx), one continuous bed per run of
// scenes that share it, so nothing restarts at a cut. Foley one-shots on top. No whooshes, swells or crowd "ooh"s.
const amb = (n: string) => `ep4/sfx/${n}.mp3`;
const AMB: Record<string, { file: string; vol: number }> = {
  wind: { file: "amb-wind", vol: 0.32 }, murmur: { file: "amb-murmur", vol: 0.22 }, birds: { file: "amb-dawn", vol: 0.22 },
  night: { file: "amb-night", vol: 0.45 }, room: { file: "amb-dawn", vol: 0.08 },
};
const ambFor = (c: Cue): string[] => {
  const shot = (c.props as { shot?: string } | undefined)?.shot;
  if (c.C === Land3D) return shot === "night" ? ["night", "wind"] : shot === "dusk" ? ["wind"] : ["wind", "birds"];
  if (c.C === NoTrace) return ["night", "wind"];
  if (c.C === Pearls || c.C === Reward) return ["room"];
  if ([AnyCow, Search, Haggle, Ruling, Gold].includes(c.C)) return ["wind", "birds"];
  if (c.C === Suspects) return [];
  if (c.C === TopCrowd || c.C === Slaughter) return ["wind"];
  if (c.C === Doorstep) return ["birds", "wind"];
  return ["wind", "murmur"];
};
const SFX: Sfx[] = [];
// Owner: the background beds hurt the ears, so they are off (foley one-shots stay).
const USE_AMB = false;
if (USE_AMB) for (const key of Object.keys(AMB)) {
  let run: [number, number] | null = null;
  const flush = () => { if (run) SFX.push({ src: amb(AMB[key].file), from: run[0], len: run[1] - run[0], vol: AMB[key].vol, fadeIn: 18, fadeOut: 18, loop: true }); run = null; };
  for (const c of SCENES) {
    if (ambFor(c).includes(key)) run = run && run[1] >= c.from - 1 ? [run[0], c.to] : (flush(), [c.from, c.to]);
    else flush();
  }
  flush();
}
// Owner: keep the soft whoosh on every scene change (not at part starts).
for (const c of SCENES) if (c.from > 0 && !P.some((p) => p.start === c.from)) SFX.push({ src: lib("short-video-whoosh-01"), from: c.from - 3, len: 30, vol: 0.14 });
const fx = (n: string, from: number, v: number, len = 60, fadeOut = 12): Sfx => ({ src: amb(n), from, len, vol: v, fadeOut });
for (const p of P) if (p.n < 7) SFX.push(fx("door-slam", V.lines[p.lastLine].f1 + 4, 0.7, 44, 8));
const strike = Math.round(ps(7) + 0.7 * (lf("N142b") - ps(7)));
SFX.push(
  fx("door-open", 0, 0.45, 60), one("horror-heartbeat-34", lf("N1_16"), 0.22, 70), one("steel-spike-scrape-01", lf("N1_19") + 4, 0.28, 40), one("chainmail-01", lf("N1_19") + 8, 0.2, 40),
  one("steel-spike-scrape-01", ps(2) + 2, 0.22, 40), { src: amb("steps"), from: lf("N33"), len: lf("N35") - lf("N33"), vol: 0.3, fadeIn: 8, fadeOut: 10, loop: true },
  one("horror-heartbeat-34", lf("N42"), 0.18, 80),
  one("sack-drop-01", lf("N57") - 14, 0.14, 24, 8), one("cow-moo-a", lf("N62") + 10, 0.22, 70),
  one("cow-moo-b", lf("N68b") + 6, 0.16, 60),
  { src: amb("steps"), from: ps(5), len: lf("N90") - ps(5), vol: 0.3, fadeIn: 8, fadeOut: 10, loop: true }, ...["N92", "N93", "N94"].map((id) => one("sack-drop-01", lf(id) + 8, 0.26, 30, 8)),
  one("sack-drop-01", lf("N95"), 0.2, 24, 8), one("cow-moo-a", lf("N96") + 6, 0.26, 80),
  ...["N102", "N104", "N106"].map((id) => one("sack-drop-01", lf(id), 0.18, 26, 8)), { src: amb("steps"), from: lf("N108"), len: lf("N109") - lf("N108"), vol: 0.3, fadeIn: 6, fadeOut: 8, loop: true },
  one("cow-moo-b", lf("N131") + 14, 0.22, 70),
  fx("coins-pour", lf("N133"), 0.4, 150, 30), fx("coins-pour", lf("N135") + 10, 0.45, 150, 30),
  fx("cloth", strike - 10, 0.5, 70), one("sack-drop-01", strike, 0.16, 24, 8), fx("cloth", lf("N142b") + 10, 0.55, 70),
  bed("horror-heartbeat-34", lf("N143a"), lf("OLD1"), 0.24), one("sack-drop-01", lf("N147"), 0.26, 26, 8),
  fx("cloth", lf("N148") + 4, 0.45, 70), fx("coins-drop", lf("N156"), 0.35, 110, 30),
);
const vol = (s: Sfx) => (f: number) => {
  const len = s.len ?? 99999;
  return s.vol * (s.fadeIn ? Math.min(1, f / s.fadeIn) : 1) * (s.fadeOut ? Math.min(1, Math.max(0, (len - f) / s.fadeOut)) : 1);
};

// ───────── on-screen text ─────────
const nextF = (id: string) => { const f0 = V.lines[id].f0; let b = Infinity; for (const l of Object.values(V.lines)) if (l.f0 > f0 && l.f0 < b) b = l.f0; return b; };
const BIG: [number, number][] = [
  [lf("N1_15"), lf("N1_16")], [lf("N42"), lf("N44") - 2], [lf("N54"), lf("N57") - 2],
  ...["N68b", "N78", "N87b"].map((id) => [lf(id) - 2, nextF(id) - 2] as [number, number]),
  [lf("N95"), lf("N96") - 2], [lf("N97"), lf("N99")], [lf("N101"), lf("N106") + 25], [lf("N133"), lf("N137") + 40],
  [lf("N142b") + 8, lf("N143") - 4], [lf("N147"), lf("N148") - 2], [lf("N158"), lf("N159")],
];
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const cap = V.caps.find((c) => frame >= c.from && frame < c.to);
  if (!cap || (frame >= lf("N143a") && frame < lf("OLD1")) || BIG.some(([a, b]) => frame >= a && frame < b)) return null;
  const pop = interpolate(frame, [cap.from, cap.from + 5], [0.86, 1], clamp);
  return (
    <div style={{ position: "absolute", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", ...(v ? { top: "70%" } : { bottom: 64 }) }}>
      {cap.who ? <div style={{ fontFamily: serif, fontWeight: 700, fontSize: v ? 38 : 32, letterSpacing: v ? 8 : 7, color: "#ffd27a", marginBottom: 4, textShadow: "0 2px 0 #000, 0 0 10px #000, 0 0 4px #000" }}>{cap.who}</div> : null}
      <div style={{ fontFamily: `"${sans}", "${amiri}"`, fontWeight: 800, fontSize: v ? 70 : 50, lineHeight: 1.16, color: "#fff", textAlign: "center", maxWidth: v ? 960 : 1500, transform: `scale(${pop})`, textShadow: "0 3px 0 #000, 0 0 14px rgba(0,0,0,0.85), 0 0 4px #000" }}>
        {cap.words.map((w, i) => {
          const on = frame >= w.t;
          const cur = on && (i === cap.words.length - 1 || frame < cap.words[i + 1].t);
          return <span key={i} style={{ color: cur ? "#ffc83a" : "#fff", opacity: on ? 1 : 0.55 }}>{w.w}{" "}</span>;
        })}
      </div>
    </div>
  );
};
/** the open question pinned at the top until the dead man answers it (keeps every part an open loop) */
export const Pinned: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  if (frame >= lf("N143a")) return null;
  const pulse = 1 + 0.03 * Math.sin(frame * 0.15);
  return (
    <div style={{ position: "absolute", top: v ? 250 : 26, left: v ? 0 : 36, width: v ? "100%" : undefined, textAlign: "center" }}>
      <span style={{ display: "inline-block", transform: `scale(${pulse})`, fontFamily: sans, fontWeight: 900, fontSize: v ? 46 : 34, color: "#fff", background: "rgba(150,10,10,0.82)", padding: v ? "8px 24px" : "6px 18px", borderRadius: 12, letterSpacing: 1 }}>WHO KILLED THE OLD MAN?</span>
    </div>
  );
};
export const Watermark: React.FC = () => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  return <Img src={staticFile("logo.png")} style={{ position: "absolute", top: v ? 330 : 28, right: 32, width: v ? 110 : 100, opacity: 0.9, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />;
};
export const MovingMark: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  if (frame >= OUT) return null;
  const tx = 0.5 + 0.5 * Math.sin(frame * 0.0041 + 1.3), ty = 0.5 + 0.5 * Math.sin(frame * 0.0067);
  return <div style={{ position: "absolute", left: ((v ? 0.06 : 0.05) + tx * (v ? 0.5 : 0.68)) * width, top: (0.2 + ty * (v ? 0.4 : 0.36)) * height, fontFamily: serif, fontSize: v ? 40 : 36, letterSpacing: 2, color: "#fff", opacity: 0.28, textShadow: "0 1px 3px rgba(0,0,0,0.6)", pointerEvents: "none" }}>@bidayah.nihayah</div>;
};
/** al-Baqarah 2:72–73: Arabic from Shamela, Hilali–Khan translation (the owner's recitation is laid under it) */
const Verse: React.FC = () => {
  const { frame } = useShot();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const o = iv(frame, [0, 16], [0, 1], ease);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1d1a2c 0%, #0b0a12 80%)", opacity: o, alignItems: "center", justifyContent: "center", padding: v ? 60 : 160 }}>
      <div dir="rtl" style={{ fontFamily: amiri, fontSize: v ? 62 : 58, lineHeight: 1.9, color: "#f6e7c1", textAlign: "center", transform: `scale(${1 + frame * 0.00012})` }}>
        <span style={{ opacity: frame < REC_AT + REC_SPLIT * 30 ? 1 : 0.45, transition: "none" }}>وَإِذۡ قَتَلۡتُمۡ نَفۡسࣰا فَٱدَّٰرَءۡتُمۡ فِیهَاۖ وَٱللَّهُ مُخۡرِجࣱ مَّا كُنتُمۡ تَكۡتُمُونَ ﴿٧٢﴾ </span>
        <span style={{ opacity: frame < REC_AT + REC_SPLIT * 30 ? 0.45 : 1 }}>فَقُلۡنَا ٱضۡرِبُوهُ بِبَعۡضِهَاۚ كَذَٰلِكَ یُحۡیِ ٱللَّهُ ٱلۡمَوۡتَىٰ وَیُرِیكُمۡ ءَایَٰتِهِۦ لَعَلَّكُمۡ تَعۡقِلُونَ ﴿٧٣﴾</span>
      </div>
      <div style={{ fontFamily: serif, fontSize: v ? 34 : 30, lineHeight: 1.45, color: "#e9dcc0", textAlign: "center", marginTop: 26, opacity: iv(frame, [30, 50], [0, 1]) }}>
        And (remember) when you killed a man and fell into dispute among yourselves as to the crime. But Allah brought forth that which you were hiding. So We said: "Strike him (the dead man) with a piece of it (the cow)." Thus Allah brings the dead to life and shows you His Ayat (proofs, evidences, verses, lessons, signs, revelations, etc.) so that you may understand.
      </div>
      <div style={{ fontFamily: serif, fontSize: v ? 32 : 28, letterSpacing: 2, color: "#c9a560", marginTop: 22 }}>Sūrat al-Baqarah 2:72–73</div>
    </AbsoluteFill>
  );
};
const EndCard: React.FC = () => {
  const { frame } = useShot();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const o = iv(frame, [0, 14], [0, 1], ease);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #f3e6c8 0%, #e2cfa4 70%, #c9b384 100%)", opacity: o, alignItems: "center", justifyContent: "center", padding: v ? 70 : 140 }}>
      <Img src={staticFile("logo.png")} style={{ width: v ? 200 : 160, marginBottom: 22 }} />
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: v ? 52 : 56, letterSpacing: 4, color: "#3a2a1a", textAlign: "center" }}>THE DEAD MAN WHO NAMED HIS KILLER</div>
      <div style={{ fontFamily: serif, fontSize: v ? 36 : 34, lineHeight: 1.4, color: "#4a3824", textAlign: "center", marginTop: 22 }}>
        Source: al-Bidāya wa al-Nihāya, Ibn Kathīr<br />vol. 1, pp. 341–343 · Sūrat al-Baqarah 2:67–73
      </div>
      <div style={{ fontFamily: serif, fontSize: v ? 30 : 28, lineHeight: 1.4, color: "#5a4630", textAlign: "center", marginTop: 14 }}>
        Details from the reports of ʿUbayda, Abū al-ʿĀliya and al-Suddī in Tafsīr Ibn Kathīr (1/190–193).<br />Ibn Kathīr: they come from the People of the Book — neither believed nor denied.
      </div>
      <div style={{ fontFamily: serif, fontSize: v ? 38 : 36, letterSpacing: 2, color: "#7a5a2a", marginTop: 30 }}>@bidayah.nihayah</div>
    </AbsoluteFill>
  );
};
const Scenes: React.FC = () => (
  <>
    {SCENES.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={Math.max(1, c.to - c.from)}>
        <Abs.Provider value={c.from}><c.C {...(c.props ?? {})} /></Abs.Provider>
      </Sequence>
    ))}
    <Sequence from={VERSE_AT} durationInFrames={VERSE_LEN}><Verse /></Sequence>
    <Sequence from={OUT} durationInFrames={END_LEN}><EndCard /></Sequence>
  </>
);
/** each part ends: door slam, black, then its own first frame comes back so the TikTok loop is seamless */
const PartTails: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {P.filter((p) => p.n < 7).map((p) => {
        const t0 = V.lines[p.lastLine].f1 + 4;
        const black = iv(frame, [t0, t0 + 6, p.end - 12, p.end - 2], [0, 1, 1, 0]);
        return (
          <React.Fragment key={p.n}>
            <Sequence from={p.end - 12} durationInFrames={12}><Freeze frame={p.start + 1}><Scenes /></Freeze></Sequence>
            {black > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: black }} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

export const Ep4: React.FC<{ muted?: boolean }> = ({ muted }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Scenes />
    <Grain opacity={0.05} />
    <PartTails />
    <Pinned />
    <Captions />
    <Watermark />
    <MovingMark />
    {muted ? null : <Html5Audio src={staticFile("ep4/voice.mp3")} />}
    {muted ? null : <Sequence from={VERSE_AT + REC_AT} durationInFrames={Math.ceil(REC_LEN * 30) + 10}><Html5Audio src={staticFile("ep4/recitation.mp3")} /></Sequence>}
    {muted ? null : SFX.filter((s) => (s.len ?? 1) > 0).map((s, i) => (
      <Sequence key={`s${i}`} from={Math.max(0, s.from)} durationInFrames={Math.max(1, s.len ?? 60)}>
        <Html5Audio src={staticFile(s.src)} volume={vol(s)} loop={s.loop} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
export const Ep4Part: React.FC<{ n: number }> = ({ n }) => {
  const p = EP4_PARTS[n - 1];
  return <AbsoluteFill style={{ backgroundColor: "#000" }}><Sequence from={-p.start}><Ep4 /></Sequence></AbsoluteFill>;
};
