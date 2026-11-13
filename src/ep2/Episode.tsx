import React from "react";
import { AbsoluteFill, Freeze, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { sans, amiri, serif, display } from "../fonts";
import { Grain } from "../ep1/kit";
import { Abs, V, lf, wf } from "./kit";
import { ColdOpen, ThroneRoom, Road, ShadowSlap, Home, MonkTalk, Blocked } from "./p1";
import { Court, HutTalk, Beast, Healing, CompanionComes, Door, Execution, Alone } from "./p2";
import { Climb, Summit, KingToSea, Sea, Plain, Bow, ArrowShot, CrowdCry, KingTold, Trench, KingFire, Mother, Echoes } from "./p3";
import HOOKS from "./hooks.json";

// Episode 2 — The People of the Trench. One timeline, two films (16:9 and 9:16), cut to the locked voice track.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Amb = "hall" | "road" | "wind" | "sea" | "fire" | "night";
type SceneCue = { C: React.FC<any>; from: number; to: number; fade?: boolean; props?: Record<string, unknown>; amb?: Amb };
const G = 8; // a part starts a few frames before its first line
const cue = (C: React.FC<any>, from: number, to: number, props?: Record<string, unknown>, amb?: Amb): SceneCue => ({ C, from, to, props, amb });
const SCENES: SceneCue[] = [
  { C: ColdOpen, from: 0, to: lf("N02") - 5 },
  { C: ThroneRoom, from: lf("N02") - 5, to: lf("N04"), fade: true },
  { C: Road, from: lf("N04"), to: lf("N05") },
  { C: ShadowSlap, from: lf("N05"), to: lf("N06") },
  { C: Home, from: lf("N06"), to: lf("N07") },
  { C: MonkTalk, from: lf("N07"), to: lf("N08") - 3 },
  { C: Blocked, from: lf("N08") - 3, to: lf("N10") },
  // Part 2
  cue(Beast, lf("N10"), lf("N15"), undefined, "road"),
  cue(HutTalk, lf("N15"), lf("N16"), undefined, "road"),
  cue(Healing, lf("N16"), lf("N18"), undefined, "road"),
  cue(CompanionComes, lf("N18"), lf("N21"), undefined, "road"),
  cue(Court, lf("N21"), lf("N23") - G, { other: "companion", enter: true, seated: true, endOnKing: wf("N21", "question") - 24 }, "hall"),
  // Part 3
  cue(Court, lf("N23") - G, lf("N29"), { other: "companion", seated: true, holdKing: "K3" }, "hall"),
  cue(Door, lf("N29"), lf("N30"), undefined, "hall"),
  cue(Court, lf("N30"), lf("N34"), { other: "boy", enter: true }, "hall"),
  cue(Door, lf("N34"), lf("M2_echo"), undefined, "hall"),
  cue(HutTalk, lf("M2_echo"), lf("N35"), { echo: "M2_echo" }),
  cue(Court, lf("N35"), lf("N36"), { other: "monk", otherMood: "tight" }, "hall"),
  cue(Execution, lf("N36"), lf("N37"), { victim: "monk", line: "N36", word: "killed" }),
  cue(Court, lf("N37"), lf("N38"), { other: "companion", otherMood: "tight" }, "hall"),
  cue(Execution, lf("N38"), lf("N39"), { victim: "companion", line: "N38", word: "killed" }),
  cue(Alone, lf("N39"), lf("N42") - G, undefined, "hall"),
  // Part 4
  cue(Court, lf("N42") - G, lf("N45"), { other: "boy", guards: 3, guardsAt: "N44" }, "hall"),
  cue(Climb, lf("N45"), lf("N46"), undefined, "wind"),
  cue(Summit, lf("N46"), lf("N49"), undefined, "wind"),
  cue(Court, lf("N49"), lf("N52"), { other: "boy", enter: true, kingMood: "shock" }, "hall"),
  cue(KingToSea, lf("N52"), lf("N54") - G, undefined, "hall"),
  // Part 5
  cue(Court, lf("N54") - G, lf("N55"), { other: "boy", guards: 3 }, "hall"),
  cue(Sea, lf("N55"), lf("N58"), undefined, "sea"),
  cue(Court, lf("N58"), lf("N61"), { other: "boy", enter: true, kingMood: "frown" }, "hall"),
  cue(Court, lf("N61"), lf("N66") - G, { other: "boy", closer: "B10", leanAt: "N64", kingMood: "frown" }, "hall"),
  // Part 6
  cue(Court, lf("N66") - G, lf("N67"), { other: "boy" }, "hall"),
  cue(Plain, lf("N67"), lf("N69")),
  cue(Bow, lf("N69"), lf("crowd_murmur")),
  cue(ArrowShot, lf("crowd_murmur"), lf("N73")),
  cue(CrowdCry, lf("N73"), lf("NC")),
  cue(KingTold, lf("NC"), lf("N78") - G, undefined, "hall"),
  // Part 7
  cue(Trench, lf("N78") - G, lf("N79"), { mode: "dig" }, "fire"),
  cue(KingFire, lf("N79"), lf("N80"), undefined, "fire"),
  cue(Trench, lf("N80"), lf("N81"), { mode: "edge" }, "fire"),
  cue(Mother, lf("N81"), lf("N84"), undefined, "fire"),
  cue(Echoes, lf("N84"), V.total, undefined, "night"),
];
/** frames animated so far */
export const EP2_READY = SCENES[SCENES.length - 1].to;
/** TikTok parts: [first frame, last frame) of each part in the episode */
const PS = [0, lf("N10"), lf("N23") - G, lf("N42") - G, lf("N54") - G, lf("N66") - G, lf("N78") - G, EP2_READY];
export const EP2_PARTS = [1, 2, 3, 4, 5, 6, 7].map((n) => {
  const h = (HOOKS as Record<string, { frames: number; text: string }>)[String(n)];
  return { n, start: PS[n - 1], end: PS[n], hook: h ? h.frames : 0, text: h ? h.text : "" };
});

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
const AMB: Record<Amb, [string, number]> = { hall: ["gentle-fire-crackling-01", 0.1], road: ["animal-bird-03", 0.1], wind: ["blizzard-wind-01", 0.2], sea: ["ocean-ships", 0.22], fire: ["backlog-adapt-fire-burning", 0.16], night: ["night-ambience-01", 0.14] };
const one = (n: string, from: number, v: number, len = 90, fadeOut = 20): Sfx => ({ src: lib(n), from, len, vol: v, fadeOut });
const FIRST2 = lf("N10");
for (const c of SCENES) {
  if (c.from < FIRST2) continue;
  SFX.push(whoosh(c.from, 0.16));
  if (c.amb) SFX.push({ src: lib(AMB[c.amb][0]), from: c.from, len: c.to - c.from, vol: AMB[c.amb][1], fadeIn: 10, fadeOut: 10, loop: true });
}
SFX.push(
  { src: lib("monster-01"), from: lf("N10"), len: 220, vol: 0.13, fadeIn: 10, fadeOut: 60 },
  one("body-fall-01", wf("N13", "fell") + 4, 0.5), one("sand-pour-01", wf("N13", "fell") + 12, 0.22, 120, 40),
  one("own-air-swell", lf("N17"), 0.14, 150, 60),
  one("stone-door-grind-02", lf("N29") + 10, 0.3, 50), one("stone-door-grind-02", lf("N34") + 10, 0.3, 50),
  // the two killings (shadows on the wall): the blade is drawn, it falls, a body drops
  ...["N36", "N38"].flatMap((id) => { const k = wf(id, "killed") + 4; return [one("steel-spike-scrape-01", k - 36, 0.3, 34, 10), { ...whoosh(k, 0.45) }, one("body-fall-01", k + 3, 0.6, 60), one("horror-wind-whisper-04", k + 20, 0.2, 50, 30)]; }),
  // more life around the action
  ...SCENES.filter((c) => c.props && (c.props as { enter?: boolean }).enter).map((c) => ({ src: lib("footsteps-stone-01"), from: c.from, len: 54, vol: 0.22, fadeOut: 10 })),
  one("chainmail-01", lf("N44"), 0.25, 70, 20), { src: lib("marching-footsteps-01"), from: lf("N44"), len: 60, vol: 0.2, fadeOut: 15 },
  { src: lib("footsteps-sand-01"), from: lf("N18"), len: 110, vol: 0.22, fadeOut: 12, loop: true }, one("sack-drop-01", lf("N18") + 112, 0.3, 40),
  whoosh(wf("N13", "threw") + 5, 0.35), one("iron-gate-01", lf("N29") + 44, 0.3, 50), one("iron-gate-01", lf("N34") + 44, 0.3, 50),
  { src: lib("water-stream-39"), from: wf("N57", "every") - 6, len: lf("N58") - wf("N57", "every") + 6, vol: 0.25, fadeIn: 8, fadeOut: 12 },
  { src: lib("daily-20260923-hushed-crowd-walla-short"), from: lf("N67"), len: lf("K13") - lf("N67"), vol: 0.07, fadeIn: 20, fadeOut: 20, loop: true },
  one("rope-release-01", wf("N71", "shot"), 0.4, 30), one("arrow-impact-01", wf("N72", "struck"), 0.35, 30), one("crowd-ooh-01", wf("N72", "struck") + 4, 0.28, 70, 30),
  one("fire-electric-whoosh-flame-36", lf("N78") - 8, 0.3, 50), one("own-air-swell", wf("N85", "people") - 6, 0.18, 120, 50),
  { src: lib("own-rumble"), from: lf("N47"), len: 190, vol: 0.45, fadeIn: 6, fadeOut: 50 },
  one("rock-crumbling-01", lf("N47") + 6, 0.35, 120, 40), one("own-stones", lf("N48"), 0.3, 110, 40),
  { src: lib("rowing-oar-stroke-01"), from: lf("N55"), len: 170, vol: 0.24, fadeOut: 30, loop: true },
  one("flood-water-rush-01", wf("N57", "turned"), 0.4, 100, 40), one("water-swirl-36", wf("N57", "turned") + 22, 0.25, 100, 40),
  { src: lib("marching-footsteps-01"), from: lf("N67"), len: 110, vol: 0.24, fadeOut: 30 },
  one("horror-creak-17", wf("N69", "bow") - 8, 0.3, 50), { src: lib("horror-heartbeat-34"), from: lf("K13") - 10, len: lf("N71") - lf("K13") + 30, vol: 0.2, fadeIn: 10, fadeOut: 10, loop: true },
  one("arrow-flyby-01", wf("N71", "shot"), 0.5, 40),
  { src: lib("shovel-digging-earth-01"), from: lf("N78"), len: 150, vol: 0.24, fadeOut: 30 },
);
for (const e of PS.slice(2)) SFX.push({ src: lib("own-air-swell"), from: e - 130, len: 130, vol: 0.13, fadeIn: 100, fadeOut: 10 });
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

export const Ep2: React.FC<{ muted?: boolean; bare?: boolean }> = ({ muted, bare }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={Math.max(1, c.to - c.from)}>
        <Abs.Provider value={c.from}><FadeIn on={c.fade}><c.C {...(c.props ?? {})} /></FadeIn></Abs.Provider>
      </Sequence>
    ))}
    <Grain opacity={0.05} />
    {bare ? null : <Overlays />}
    {bare ? null : <Captions />}
    <Watermark />
    {muted ? null : <Html5Audio src={staticFile("ep2/voice.mp3")} />}
    {muted ? null : SFX.filter((s) => (s.len ?? 1) > 0).map((s, i) => (
      <Sequence key={`s${i}`} from={Math.max(0, s.from)} durationInFrames={Math.max(1, s.len ?? 60)}>
        <Html5Audio src={staticFile(s.src)} volume={vol(s)} loop={s.loop} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/** A TikTok part: the spoken hook over the part's first frame (text on screen from frame 1), then the part itself. */
export const Ep2Part: React.FC<{ n: number }> = ({ n }) => {
  const p = EP2_PARTS[n - 1];
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {p.hook ? (
        <Sequence durationInFrames={p.hook}>
          <AbsoluteFill style={{ transform: `scale(${1.04 + frame * 0.0012})` }}><Freeze frame={p.start + 4}><Ep2 muted bare /></Freeze></AbsoluteFill>
          <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />
          <div style={{ position: "absolute", top: v ? "30%" : "34%", width: "100%", display: "flex", justifyContent: "center" }}>
            <div style={{ fontFamily: `"${sans}"`, fontWeight: 800, fontSize: v ? 74 : 60, lineHeight: 1.2, color: "#fff", textAlign: "center", maxWidth: v ? 940 : 1500, textShadow: "0 3px 0 #000, 0 0 16px rgba(0,0,0,0.9), 0 0 4px #000" }}>{p.text}</div>
          </div>
          <Html5Audio src={staticFile(`ep2/hooks/H${n}.wav`)} />
        </Sequence>
      ) : null}
      <Sequence from={p.hook}><Sequence from={-p.start}><Ep2 /></Sequence></Sequence>
    </AbsoluteFill>
  );
};

/** The six TikTok hooks back to back (one small render; they are cut onto the parts afterwards). */
const HK = EP2_PARTS.filter((p) => p.hook);
export const EP2_HOOKS_LENGTH = HK.reduce((a, p) => a + p.hook, 0);
export const Ep2Hooks: React.FC = () => {
  let at = 0;
  return <AbsoluteFill>{HK.map((p) => { const f = at; at += p.hook; return <Sequence key={p.n} from={f} durationInFrames={p.hook}><Ep2Part n={p.n} /></Sequence>; })}</AbsoluteFill>;
};
