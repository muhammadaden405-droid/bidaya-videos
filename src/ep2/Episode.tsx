import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { sans, amiri, serif, display } from "../fonts";
import { Grain } from "../ep1/kit";
import { Abs, V, lf, wf } from "./kit";
import { ColdOpen, ThroneRoom, Road, ShadowSlap, Home, MonkTalk, Blocked } from "./p1";

// Episode 2 — The People of the Trench. One timeline, two films (16:9 and 9:16), cut to the locked voice track.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type SceneCue = { C: React.FC; from: number; to: number; fade?: boolean };
const SCENES: SceneCue[] = [
  { C: ColdOpen, from: 0, to: lf("N02") - 5 },
  { C: ThroneRoom, from: lf("N02") - 5, to: lf("N04"), fade: true },
  { C: Road, from: lf("N04"), to: lf("N05") },
  { C: ShadowSlap, from: lf("N05"), to: lf("N06") },
  { C: Home, from: lf("N06"), to: lf("N07") },
  { C: MonkTalk, from: lf("N07"), to: lf("N08") - 3 },
  { C: Blocked, from: lf("N08") - 3, to: lf("N10") },
];
/** frames animated so far (grows as parts are built) */
export const EP2_READY = SCENES[SCENES.length - 1].to;

type Sfx = { src: string; from: number; len?: number; vol: number; fadeIn?: number; fadeOut?: number; loop?: boolean };
const lib = (n: string) => `trailer/sfx/${n}.mp3`;
const whoosh = (from: number, vol = 0.2): Sfx => ({ src: lib("short-video-whoosh-01"), from: from - 3, len: 30, vol });
const every = wf("N04", "every");
const blocked = wf("N08", "something");
const SFX: Sfx[] = [
  { src: lib("fire-electric-whoosh-flame-36"), from: 0, len: 40, vol: 0.28, fadeOut: 20 },
  { src: lib("gentle-fire-crackling-01"), from: 0, len: lf("N02") - 24, vol: 0.12, fadeOut: 6, loop: true },
  { src: lib("horror-wind-whisper-04"), from: lf("N02") - 26, len: 30, vol: 0.22, fadeOut: 12 },
  whoosh(lf("N02") - 5, 0.26),
  { src: lib("gentle-fire-crackling-01"), from: lf("N02") - 5, len: lf("N04") - lf("N02") + 5, vol: 0.1, fadeIn: 10, fadeOut: 10, loop: true },
  { src: lib("footsteps-stone-01"), from: lf("N03") + 4, len: 56, vol: 0.2, fadeOut: 8 },
  whoosh(lf("N03")), whoosh(lf("N04")),
  { src: lib("animal-bird-03"), from: lf("N04"), len: lf("N05") - lf("N04"), vol: 0.12, fadeIn: 15, fadeOut: 15, loop: true },
  { src: lib("footsteps-sand-01"), from: lf("N04"), len: wf("N04", "stopped") - lf("N04"), vol: 0.24, fadeOut: 12, loop: true },
  ...[0, 1, 2, 3, 4].filter((d) => every + d * 20 < lf("N05") - 6).map((d) => whoosh(every + d * 20, 0.18)),
  whoosh(lf("N05")),
  { src: lib("gentle-fire-crackling-01"), from: lf("N05"), len: lf("N07") - lf("N05"), vol: 0.1, fadeIn: 8, fadeOut: 8, loop: true },
  { src: "ep2/sfx/slap.wav", from: wf("N05", "beat"), len: 12, vol: 0.5 },
  whoosh(lf("S2") - 2, 0.16), whoosh(lf("N06")),
  { src: "ep2/sfx/slap.wav", from: wf("N06", "beat"), len: 12, vol: 0.3 },
  whoosh(lf("N07")),
  { src: lib("animal-bird-03"), from: lf("N07"), len: lf("N08") - lf("N07"), vol: 0.1, fadeIn: 15, fadeOut: 15, loop: true },
  whoosh(lf("M1") - 2, 0.14), whoosh(wf("M1", "say"), 0.12), whoosh(wf("M1", "and") - 4, 0.12), whoosh(wf("M1", "say", 1), 0.12),
  whoosh(lf("N08") - 3),
  { src: lib("footsteps-sand-01"), from: lf("N08"), len: blocked - 4 - lf("N08"), vol: 0.24, fadeOut: 6, loop: true },
  { src: lib("own-rumble"), from: blocked - 12, len: lf("N10") - blocked + 12, vol: 0.3, fadeIn: 20, fadeOut: 30 },
  { src: lib("monster-01"), from: blocked + 10, len: 90, vol: 0.1, fadeIn: 10, fadeOut: 40 },
  { src: lib("blizzard-wind-01"), from: lf("N10") - 150, len: 150, vol: 0.22, fadeIn: 110, fadeOut: 14 },
];
const vol = (s: Sfx) => (f: number) => {
  const len = s.len ?? 99999;
  return s.vol * (s.fadeIn ? Math.min(1, f / s.fadeIn) : 1) * (s.fadeOut ? Math.min(1, Math.max(0, (len - f) / s.fadeOut)) : 1);
};

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

/** on-screen text from the very first frame, then the title over the first shot of Part 1 (no separate card) */
const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const hook = interpolate(frame, [0, 4, 96, 110], [0.001, 1, 1, 0], clamp);
  const t0 = lf("N02") - 2;
  const title = interpolate(frame, [t0, t0 + 10, t0 + 52, t0 + 64], [0, 1, 1, 0], clamp);
  return (
    <>
      {hook > 0 ? <div style={{ position: "absolute", top: v ? 300 : 70, width: "100%", textAlign: "center", fontFamily: serif, fontStyle: "italic", fontSize: v ? 58 : 50, color: "#ffe9c2", opacity: hook, textShadow: "0 2px 12px #000" }}>A sorcerer asked a king for a boy…</div> : null}
      {title > 0 ? (
        <div style={{ position: "absolute", top: v ? 330 : 96, width: "100%", textAlign: "center", opacity: title, transform: `scale(${0.96 + 0.04 * title})` }}>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: v ? 74 : 82, letterSpacing: 6, color: "#f6dfae", textShadow: "0 4px 18px #000, 0 0 3px #000" }}>THE PEOPLE OF THE TRENCH</div>
          <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: v ? 40 : 38, color: "#fff3d6", marginTop: 8, textShadow: "0 2px 10px #000" }}>A story told by the Prophet ﷺ</div>
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
const FadeIn: React.FC<{ on?: boolean; children: React.ReactNode }> = ({ on, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: on ? interpolate(f, [0, 10], [0, 1], clamp) : 1 }}>{children}</AbsoluteFill>;
};

export const Ep2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={Math.max(1, c.to - c.from)}>
        <Abs.Provider value={c.from}><FadeIn on={c.fade}><c.C /></FadeIn></Abs.Provider>
      </Sequence>
    ))}
    <Grain opacity={0.05} />
    <Overlays />
    <Captions />
    <Watermark />
    <Html5Audio src={staticFile("ep2/voice.mp3")} />
    {SFX.filter((s) => (s.len ?? 1) > 0).map((s, i) => (
      <Sequence key={`s${i}`} from={Math.max(0, s.from)} durationInFrames={Math.max(1, s.len ?? 60)}>
        <Html5Audio src={staticFile(s.src)} volume={vol(s)} loop={s.loop} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
