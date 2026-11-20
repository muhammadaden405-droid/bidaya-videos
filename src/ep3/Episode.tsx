import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { sans, amiri, serif, display } from "../fonts";
import { Grain } from "../ep1/kit";
import { Abs, V, lf, wf, iv, ease, useShot } from "./kit";
import { VillageWide, LeperAlone, BaldMarket, BlindPath, AngelSent, Wish, Valleys, Gate, Verdict, Ending } from "./scenes";

// Episode 3 — The Blind Man, the Leper and the Bald Man. One timeline, two films (16:9 and 9:16), cut to the locked voice track.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Amb = "day" | "dusk" | "night";
type SceneCue = { C: React.FC<any>; from: number; to: number; props?: Record<string, unknown>; amb?: Amb };
const END_LEN = 150;
const OUT = V.total + 20;
const SCENES: SceneCue[] = [
  { C: Gate, from: 0, to: lf("N03_a"), props: { who: "leper", cold: true }, amb: "dusk" },
  { C: Valleys, from: lf("N03_a"), to: lf("N04"), props: { mode: "tease" }, amb: "day" },
  { C: VillageWide, from: lf("N04"), to: lf("N05_a"), amb: "day" },
  { C: LeperAlone, from: lf("N05_a"), to: lf("N06"), amb: "day" },
  { C: BaldMarket, from: lf("N06"), to: lf("N07"), amb: "day" },
  { C: BlindPath, from: lf("N07"), to: lf("N08"), amb: "day" },
  { C: AngelSent, from: lf("N08"), to: lf("N09"), amb: "day" },
  { C: Wish, from: lf("N09"), to: lf("N16"), props: { who: "leper" }, amb: "day" },
  { C: Wish, from: lf("N16"), to: lf("N22"), props: { who: "bald" }, amb: "dusk" },
  { C: Wish, from: lf("N22"), to: lf("N28_a"), props: { who: "blind" }, amb: "day" },
  { C: Valleys, from: lf("N28_a"), to: lf("N33"), props: { mode: "grow" }, amb: "day" },
  { C: Gate, from: lf("N33"), to: lf("N41"), props: { who: "leper" }, amb: "dusk" },
  { C: Gate, from: lf("N41"), to: lf("N47"), props: { who: "bald" }, amb: "dusk" },
  { C: Gate, from: lf("N47"), to: lf("N52_a"), props: { who: "blind" }, amb: "day" },
  { C: Verdict, from: lf("N52_a"), to: lf("N54_a"), amb: "day" },
  { C: Ending, from: lf("N54_a"), to: OUT, amb: "night" },
];
const G = 8; // a part starts a few frames before its first line
/** TikTok parts: [first frame, last frame) of each part in the episode (each is ≤ about a minute) */
const PS = [0, lf("N09") - G, lf("N16") - G, lf("N22") - G, lf("N33") - G, lf("N41") - G, lf("N48") - G, OUT + END_LEN];
const HOOKS = ["He lied to an angel's face.", "An angel asked him: what do you want most?", "People turned away from him. Then a stranger came.", "He couldn't see. Then he could.", "A beggar came to a rich man.", "Two men got rich. Would they remember?", "The last man. The last test."];
export const EP3_LEN = OUT + END_LEN;
export const EP3_PARTS = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ n, start: PS[n - 1], end: PS[n], text: HOOKS[n - 1] }));

// ───────── sound ─────────
type Sfx = { src: string; from: number; len?: number; vol: number; fadeIn?: number; fadeOut?: number; loop?: boolean };
const lib = (n: string) => `trailer/sfx/${n}.mp3`;
const whoosh = (from: number, vol = 0.18): Sfx => ({ src: lib("short-video-whoosh-01"), from: from - 3, len: 30, vol });
const one = (n: string, from: number, v: number, len = 90, fadeOut = 20): Sfx => ({ src: lib(n), from, len, vol: v, fadeOut });
const AMB: Record<Amb, [string, number]> = { day: ["animal-bird-03", 0.1], dusk: ["blizzard-wind-01", 0.08], night: ["night-ambience-01", 0.12] };
const SFX: Sfx[] = [];
for (const c of SCENES) {
  if (c.from > 0) SFX.push(whoosh(c.from, 0.2));
  if (c.amb) SFX.push({ src: lib(AMB[c.amb][0]), from: c.from, len: c.to - c.from, vol: AMB[c.amb][1], fadeIn: 10, fadeOut: 10, loop: true });
}
const heals = [wf("N12_a", "gone"), wf("N18", "grew"), wf("N25", "sight")];
SFX.push(
  ...heals.map((h) => one("own-air-swell", h - 30, 0.22, 90, 40)),
  // the gifts, and the herds multiplying
  one("camel-grumble-01", lf("N14") + 8, 0.35, 70), { src: lib("own-hooves"), from: lf("N29"), len: lf("N31") - lf("N29"), vol: 0.22, fadeIn: 20, fadeOut: 30, loop: true },
  one("camel-grumble-01", lf("N28_a") + 10, 0.3, 60), one("camel-grumble-01", lf("N33") + 20, 0.22, 60),
  // the traveller walks up to each man
  ...["N34_a", "N42", "N48"].map((id) => ({ src: lib("footsteps-sand-01"), from: lf(id), len: 80, vol: 0.24, fadeOut: 12, loop: true })),
  // the two curses: a low rumble and wind; then the shadow falls over the two valleys
  ...[wf("N40", "may"), wf("N45", "may")].flatMap((k) => [one("own-rumble", k - 4, 0.35, 120, 50), one("horror-wind-whisper-04", k + 6, 0.2, 60, 30)]),
  one("own-air-swell", wf("N53", "pleased") - 20, 0.2, 100, 40), one("own-rumble", wf("N53", "angry"), 0.22, 90, 40),
  // both lies together over the split screen: the bald man's line under the leper's
  { src: "ep3/vo/B4.wav", from: lf("L1_3"), len: 200, vol: 0.75, fadeOut: 20 },
);
for (const e of PS.slice(2, 7)) SFX.push({ src: lib("own-air-swell"), from: e - 110, len: 110, vol: 0.12, fadeIn: 80, fadeOut: 10 });
const vol = (s: Sfx) => (f: number) => {
  const len = s.len ?? 99999;
  return s.vol * (s.fadeIn ? Math.min(1, f / s.fadeIn) : 1) * (s.fadeOut ? Math.min(1, Math.max(0, (len - f) / s.fadeOut)) : 1);
};

// ───────── on-screen text ─────────
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const cap = V.caps.find((c) => frame >= c.from && frame < c.to);
  if (!cap) return null;
  const pop = interpolate(frame, [cap.from, cap.from + 5], [0.86, 1], clamp);
  return (
    <div style={{ position: "absolute", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", ...(v ? { top: "72%" } : { bottom: 64 }) }}>
      {cap.who ? <div style={{ fontFamily: serif, fontWeight: 700, fontSize: v ? 38 : 32, letterSpacing: v ? 8 : 7, color: "#ffd27a", marginBottom: 4, textShadow: "0 2px 0 #000, 0 0 10px #000, 0 0 4px #000" }}>{cap.who}</div> : null}
      <div style={{ fontFamily: `"${sans}", "${amiri}"`, fontWeight: 800, fontSize: v ? 68 : 48, lineHeight: 1.18, color: "#fff", textAlign: "center", maxWidth: v ? 940 : 1500, transform: `scale(${pop})`, textShadow: "0 3px 0 #000, 0 0 14px rgba(0,0,0,0.85), 0 0 4px #000" }}>
        {cap.words.map((w, i) => {
          const on = frame >= w.t;
          const cur = on && (i === cap.words.length - 1 || frame < cap.words[i + 1].t);
          return <span key={i} style={{ color: cur ? "#ffc83a" : "#fff", opacity: on ? 1 : 0.55 }}>{w.w}{" "}</span>;
        })}
      </div>
    </div>
  );
};
/** the hook from the very first frame, the title over the first village shot, and the closing question */
const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const hook = interpolate(frame, [0, 3, 80, 92], [0.001, 1, 1, 0], clamp);
  const t0 = lf("N04") - 2;
  const title = interpolate(frame, [t0, t0 + 10, t0 + 70, t0 + 82], [0, 1, 1, 0], clamp);
  const q0 = wf("N57_b", "what") - 4;
  // 9:16 only: each TikTok part's text hook on screen from its first frame (the parts are cut from the vertical film)
  const part = v ? EP3_PARTS.slice(1).find((p) => frame >= p.start && frame < p.start + 86) : undefined;
  const ph = part ? interpolate(frame - part.start, [0, 3, 75, 86], [0.001, 1, 1, 0], clamp) : 0;
  const q = interpolate(frame, [q0, q0 + 10, OUT - 6, OUT], [0, 1, 1, 0], clamp);
  return (
    <>
      {hook > 0 ? <div style={{ position: "absolute", top: v ? 300 : 70, width: "100%", textAlign: "center", fontFamily: sans, fontWeight: 800, fontSize: v ? 72 : 58, color: "#fff", opacity: hook, textShadow: "0 3px 0 #000, 0 0 16px rgba(0,0,0,0.9)" }}>He lied to an angel's face.</div> : null}
      {ph > 0 && part ? <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: sans, fontWeight: 800, fontSize: 70, color: "#fff", opacity: ph, padding: "0 50px", boxSizing: "border-box", textShadow: "0 3px 0 #000, 0 0 16px rgba(0,0,0,0.9)" }}>{part.text}</div> : null}
      {title > 0 ? (
        <div style={{ position: "absolute", top: v ? 330 : 96, width: "100%", textAlign: "center", opacity: title, transform: `scale(${0.96 + 0.04 * title})` }}>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: v ? 64 : 76, letterSpacing: 5, color: "#f6dfae", textShadow: "0 4px 18px #000, 0 0 3px #000", padding: "0 40px" }}>THE BLIND MAN, THE LEPER AND THE BALD MAN</div>
          <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: v ? 40 : 38, color: "#fff3d6", marginTop: 8, textShadow: "0 2px 10px #000" }}>A story told by the Prophet ﷺ</div>
        </div>
      ) : null}
      {q > 0 ? (
        <div style={{ position: "absolute", top: v ? 360 : 110, width: "100%", textAlign: "center", opacity: q }}>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: v ? 76 : 66, color: "#fff", textShadow: "0 3px 0 #000, 0 0 16px rgba(0,0,0,0.9)", padding: "0 50px" }}>What would you have asked for?</div>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: v ? 50 : 42, color: "#ffd27a", marginTop: 14, textShadow: "0 2px 0 #000, 0 0 12px #000" }}>Tell us in the comments 👇</div>
        </div>
      ) : null}
    </>
  );
};
const Watermark: React.FC = () => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  return <Img src={staticFile("logo.png")} style={{ position: "absolute", top: v ? 150 : 28, right: 32, width: v ? 120 : 100, opacity: 0.9, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />;
};
const MovingMark: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  if (frame >= OUT) return null;
  const tx = 0.5 + 0.5 * Math.sin(frame * 0.0041 + 1.3);
  const ty = 0.5 + 0.5 * Math.sin(frame * 0.0067);
  return <div style={{ position: "absolute", left: ((v ? 0.06 : 0.05) + tx * (v ? 0.5 : 0.68)) * width, top: (0.2 + ty * (v ? 0.4 : 0.36)) * height, fontFamily: serif, fontSize: v ? 40 : 36, letterSpacing: 2, color: "#fff", opacity: 0.3, textShadow: "0 1px 3px rgba(0,0,0,0.6)", pointerEvents: "none" }}>@bidayah.nihayah</div>;
};
const EndCard: React.FC = () => {
  const { frame } = useShot();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const o = iv(frame, [0, 14], [0, 1], ease);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #f3e6c8 0%, #e2cfa4 70%, #c9b384 100%)", opacity: o, alignItems: "center", justifyContent: "center", padding: v ? 70 : 140 }}>
      <Img src={staticFile("logo.png")} style={{ width: v ? 210 : 170, marginBottom: 26 }} />
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: v ? 52 : 58, letterSpacing: 4, color: "#3a2a1a", textAlign: "center" }}>THE BLIND MAN, THE LEPER AND THE BALD MAN</div>
      <div style={{ fontFamily: serif, fontSize: v ? 40 : 38, lineHeight: 1.4, color: "#4a3824", textAlign: "center", marginTop: 26 }}>
        Source: al-Bidāya wa al-Nihāya, Ibn Kathīr<br />vol. 2, pp. 164–165
      </div>
      <div style={{ fontFamily: serif, fontSize: v ? 34 : 32, lineHeight: 1.4, color: "#5a4630", textAlign: "center", marginTop: 14 }}>
        The hadith of Abū Hurayra, from the Prophet ﷺ:<br />Ṣaḥīḥ al-Bukhārī and Ṣaḥīḥ Muslim
      </div>
      <div style={{ fontFamily: serif, fontSize: v ? 38 : 36, letterSpacing: 2, color: "#7a5a2a", marginTop: 36 }}>@bidayah.nihayah</div>
    </AbsoluteFill>
  );
};

export const Ep3: React.FC<{ muted?: boolean }> = ({ muted }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={Math.max(1, c.to - c.from)}>
        <Abs.Provider value={c.from}><c.C {...(c.props ?? {})} /></Abs.Provider>
      </Sequence>
    ))}
    <Sequence from={OUT} durationInFrames={END_LEN}><EndCard /></Sequence>
    <Grain opacity={0.05} />
    <Overlays />
    <Captions />
    <Watermark />
    <MovingMark />
    {muted ? null : <Html5Audio src={staticFile("ep3/voice.mp3")} />}
    {muted ? null : SFX.filter((s) => (s.len ?? 1) > 0).map((s, i) => (
      <Sequence key={`s${i}`} from={Math.max(0, s.from)} durationInFrames={Math.max(1, s.len ?? 60)}>
        <Html5Audio src={staticFile(s.src)} volume={vol(s)} loop={s.loop} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/** A TikTok part: the part itself, with its text hook on screen from frame 1 (no spoken hook). */
export const Ep3Part: React.FC<{ n: number }> = ({ n }) => {
  const p = EP3_PARTS[n - 1];
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const o = n === 1 ? 0 : interpolate(frame, [0, 3, 75, 86], [0.001, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence from={-p.start}><Ep3 /></Sequence>
      {o > 0 ? <div style={{ position: "absolute", top: v ? 300 : 70, width: "100%", textAlign: "center", fontFamily: sans, fontWeight: 800, fontSize: v ? 70 : 58, color: "#fff", opacity: o, padding: "0 50px", boxSizing: "border-box", textShadow: "0 3px 0 #000, 0 0 16px rgba(0,0,0,0.9)" }}>{p.text}</div> : null}
    </AbsoluteFill>
  );
};
