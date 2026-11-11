import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Person, STAND, SIT, Pose, Outfit, blend } from "./Rig";
import { amiri, serif } from "../fonts";

// Trailer — next week's episode: The People of the Trench (Aṣḥāb al-Ukhdūd).
// Source: al-Bidāya wa al-Nihāya (ed. al-Turkī) 3/23–29, the hadith of Ṣuhayb (Aḥmad, Muslim).
// Faceless characters; the trench is shown only as fire and glow, never anyone in it.

export const W = 1920;
export const H = 1080;
export type Cam = { x: number; y: number; zoom: number };

export const Layer: React.FC<{ d: number; cam: Cam; children: React.ReactNode }> = ({ d, cam, children }) => {
  const s = 1 + (cam.zoom - 1) * d;
  return (
    <AbsoluteFill style={{ transform: `translate(${-cam.x * d}px, ${-cam.y * d}px) scale(${s})`, transformOrigin: "50% 58%" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: "visible" }}>{children}</svg>
    </AbsoluteFill>
  );
};

export const KING: Outfit = { skin: "#a8724f", robe: "#3d1d4f", robeShade: "#2a1238", crown: true, cape: "#7a1420" };
export const GUARD: Outfit = { skin: "#8d5a3b", robe: "#3b3026", robeShade: "#251d17", wrap: "#5a1a14", spear: true, shield: "#5a3a20" };
export const BOY: Outfit = { skin: "#b07a56", robe: "#efe6d2", robeShade: "#cfc3a8", wrap: "#f6f0e2" };
export const FOLK = (i: number): Outfit => ({
  skin: ["#8d5a3b", "#a06b48", "#7a4b30", "#b07a56"][i % 4],
  robe: ["#4a3a2e", "#5b4636", "#3d342c", "#64503c"][i % 4],
  robeShade: "#2a211b",
  wrap: ["#7a6a55", "#3a2e26", "#8a7a62", undefined][i % 4],
});

export const Torch: React.FC<{ x: number; y: number; frame: number; seed: number }> = ({ x, y, frame, seed }) => {
  const f = 1 + 0.12 * Math.sin(frame * 0.5 + seed) + 0.06 * Math.sin(frame * 1.3 + seed);
  return (
    <g>
      <defs>
        <radialGradient id={`tg${seed}`}>
          <stop offset="0" stopColor="#ffb347" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffb347" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y - 30} r={170 * f} fill={`url(#tg${seed})`} />
      <rect x={x - 6} y={y - 20} width={12} height={60} fill="#3a2416" />
      <path d={`M ${x - 14} ${y - 20} Q ${x} ${y - 70 * f} ${x + 14} ${y - 20} Z`} fill="#ffb347" />
      <path d={`M ${x - 7} ${y - 20} Q ${x} ${y - 45 * f} ${x + 7} ${y - 20} Z`} fill="#fff1b8" />
    </g>
  );
};

export const Palace: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => (
  <>
    <Layer d={0.25} cam={cam}>
      <rect x={-400} y={-200} width={2800} height={1400} fill="#24152e" />
      {new Array(7).fill(0).map((_, i) => (
        <path key={i} d={`M ${-140 + i * 340} 820 L ${-140 + i * 340} 360 Q ${30 + i * 340} 200 ${200 + i * 340} 360 L ${200 + i * 340} 820 Z`} fill="#1a0f22" />
      ))}
    </Layer>
    <Layer d={0.55} cam={cam}>
      {new Array(6).fill(0).map((_, i) => (
        <g key={i}>
          <rect x={-200 + i * 460} y={160} width={90} height={700} fill="#3a2440" />
          <rect x={-215 + i * 460} y={150} width={120} height={30} fill="#4a3050" />
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => <Torch key={i} x={40 + i * 620} y={430} frame={frame} seed={i * 2} />)}
    </Layer>
    <Layer d={1} cam={cam}>
      <rect x={-800} y={840} width={3600} height={500} fill="#3b2a30" />
      <path d="M -800 840 L 2800 840" stroke="#5a4048" strokeWidth={6} />
      <rect x={760} y={760} width={400} height={90} fill="#4a3038" />
      <rect x={720} y={830} width={480} height={30} fill="#5a3a44" />
    </Layer>
  </>
);

// Shot 1 — the king on his throne leans forward and demands an answer.
export const KingShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cam: Cam = { x: 0, y: interpolate(frame, [0, durationInFrames], [0, -30]), zoom: interpolate(frame, [0, durationInFrames], [1.0, 1.25], { easing: Easing.inOut(Easing.sin) }) };
  const t = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const king = blend(SIT, { ...SIT, lean: 10, head: 6, armRU: -100, armRL: -20 }, t);
  return (
    <AbsoluteFill style={{ backgroundColor: "#120a16" }}>
      <Palace cam={cam} frame={frame} />
      <Layer d={1} cam={cam}>
        {/* throne */}
        <path d="M 880 760 L 880 520 Q 960 470 1040 520 L 1040 760 Z" fill="#c9952e" />
        <path d="M 900 750 L 900 540 Q 960 505 1020 540 L 1020 750 Z" fill="#7a1420" />
        <rect x={860} y={690} width={200} height={40} fill="#b0801f" />
        <g transform="translate(940 800) scale(0.9)"><Person pose={king} outfit={KING} /></g>
        <g transform="translate(700 845) scale(0.82)"><Person pose={STAND} outfit={GUARD} /></g>
        <g transform="translate(1230 845) scale(0.82)"><Person pose={STAND} outfit={GUARD} flip /></g>
      </Layer>
    </AbsoluteFill>
  );
};

// Shot 2 — the boy stands calm before the court, finger raised to the sky.
export const BoyShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cam: Cam = { x: interpolate(frame, [0, durationInFrames], [-40, 30]), y: 0, zoom: interpolate(frame, [0, durationInFrames], [1.1, 1.32], { easing: Easing.inOut(Easing.sin) }) };
  const raise = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boy = blend(STAND, { ...STAND, armRU: -172, armRL: -4, head: -10 }, raise);
  const glow = 0.5 + 0.5 * raise;
  return (
    <AbsoluteFill style={{ backgroundColor: "#120a16" }}>
      <Palace cam={cam} frame={frame} />
      <Layer d={1} cam={cam}>
        <path d={`M 880 -100 L 1040 -100 L 1180 850 L 740 850 Z`} fill="#fff1c9" opacity={0.12 * glow} />
        <ellipse cx={960} cy={845} rx={170} ry={26} fill="#fff1c9" opacity={0.25 * glow} />
        <g transform="translate(960 850) scale(0.62)"><Person pose={boy} outfit={BOY} /></g>
        {[-1, 1].map((side) =>
          [0, 1, 2].map((k) => (
            <g key={`${side}${k}`} transform={`translate(${960 + side * (330 + k * 150)} ${855 + k * 6}) scale(0.78)`} opacity={0.92}>
              <Person pose={{ ...STAND, head: side * -6 }} outfit={k === 0 ? GUARD : FOLK(k + (side > 0 ? 2 : 0))} flip={side > 0} />
            </g>
          ))
        )}
      </Layer>
    </AbsoluteFill>
  );
};

// Shot 3 — night; a crowd stands firm before the glowing trench.
export const FireShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cam: Cam = { x: interpolate(frame, [0, durationInFrames], [30, -30]), y: 0, zoom: interpolate(frame, [0, durationInFrames], [1.0, 1.18]) };
  const embers = new Array(80).fill(0).map((_, i) => {
    const life = 90;
    const age = (frame + i * 13) % life;
    return { x: 200 + random(`ex${i}`) * 1520 + Math.sin((age + i) * 0.1) * 20, y: 640 - age * 4.5, o: 1 - age / life, r: 2 + random(`er${i}`) * 3 };
  });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0d0710 0%, #3a0f12 45%, #a3341a 64%, #2a0d0a 66%)" }}>
      <Layer d={0.2} cam={cam}>
        <path d="M -400 600 L 0 520 L 300 580 L 700 500 L 1100 570 L 1500 510 L 1900 580 L 2400 520 L 2400 700 L -400 700 Z" fill="#1c0a0e" />
      </Layer>
      <Layer d={0.55} cam={cam}>
        <rect x={-600} y={640} width={3200} height={600} fill="#1a0b0b" />
        {/* the trench: a long band of fire, glow only */}
        <rect x={-300} y={660} width={2500} height={30} fill="#ff7a1a" />
        {new Array(70).fill(0).map((_, i) => {
          const h = 40 + 35 * Math.abs(Math.sin(frame * 0.35 + i * 1.7)) + random(`fh${i}`) * 30;
          const x = -300 + i * 36;
          return <path key={i} d={`M ${x} 672 Q ${x + 18} ${672 - h} ${x + 36} 672 Z`} fill={i % 3 ? "#ffb347" : "#ff6a1a"} opacity={0.9} />;
        })}
        <rect x={-300} y={560} width={2500} height={140} fill="#ff8a2a" opacity={0.18} />
        {embers.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={e.r} fill="#ffcf7a" opacity={e.o} />)}
      </Layer>
      <Layer d={1} cam={cam}>
        {new Array(13).fill(0).map((_, i) => {
          const row = i < 6 ? 0 : 1;
          const x = row === 0 ? 260 + i * 270 : 140 + (i - 6) * 270;
          const sway = Math.sin(frame * 0.05 + i) * 2;
          const pose: Pose = i === 8 ? { ...STAND, armRU: -170, armRL: -4, head: -8 } : { ...STAND, head: sway };
          return (
            <g key={i} transform={`translate(${x} ${row === 0 ? 900 : 1030}) scale(${row === 0 ? 0.62 : 0.78})`}>
              <Person pose={pose} outfit={FOLK(i)} />
            </g>
          );
        })}
      </Layer>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

// Shot 4 — title card.
const TitleShot: React.FC = () => {
  const frame = useCurrentFrame();
  const a = (s: number) => interpolate(frame, [s, s + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const embers = new Array(50).fill(0).map((_, i) => {
    const age = (frame + i * 11) % 80;
    return { x: random(`tx${i}`) * W, y: H - age * 9, o: 1 - age / 80 };
  });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 85%, #4a160c 0%, #120708 60%, #060304 100%)", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute" }}>
        {embers.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={2.5} fill="#ffb347" opacity={e.o * 0.8} />)}
      </svg>
      <div style={{ textAlign: "center", color: "#f6e6c8" }}>
        <div style={{ fontFamily: serif, fontSize: 40, letterSpacing: 12, color: "#e3a64a", opacity: a(25) }}>FRIDAY · NOVEMBER 13</div>
        <div style={{ fontFamily: amiri, fontSize: 150, color: "#ffcf7a", direction: "rtl", lineHeight: 1.3, opacity: a(132), textShadow: "0 0 40px rgba(255,140,40,0.5)" }}>أصحاب الأخدود</div>
        <div style={{ fontFamily: serif, fontSize: 70, letterSpacing: 4, opacity: a(142) }}>The People of the Trench</div>
        <div style={{ fontFamily: amiri, fontSize: 46, direction: "rtl", marginTop: 34, opacity: a(238) }}>﴿قُتِلَ أَصْحَابُ الْأُخْدُودِ﴾</div>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 32, fontStyle: "italic", opacity: a(250), maxWidth: 1300 }}>“Cursed were the people of the ditch (the story of the Boy and the King).”</div>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 26, color: "#bfa98a", opacity: a(250), marginTop: 6 }}>al-Burūj 85:4 — translation: Hilali &amp; Muhsin Khan (Tanzil.net)</div>
      </div>
      <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 26, color: "#bfa98a", opacity: a(270) }}>
        Source: Ibn Kathīr, al-Bidāya wa al-Nihāya (ed. al-Turkī), 3/23–29
      </div>
    </AbsoluteFill>
  );
};

const FADE = 10;
// Whip-pan transition: the camera swings out of one shot (motion blur + push) and into the next.
export const Fade: React.FC<{ children: React.ReactNode; first?: boolean; last?: boolean }> = ({ children, first, last }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ease = Easing.inOut(Easing.cubic);
  const inT = first ? 1 : interpolate(frame, [0, FADE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const outT = last ? 0 : interpolate(frame, [durationInFrames - FADE, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const x = (1 - inT) * 900 - outT * 900;
  const blur = (1 - inT) * 28 + outT * 28;
  const scale = 1 + (1 - inT) * 0.08 + outT * 0.08;
  const o = first ? 1 : Math.min(1, inT * 1.6);
  const oOut = last ? 1 : 1 - Math.max(0, outT - 0.4) / 0.6;
  return <AbsoluteFill style={{ opacity: o * oOut, transform: `translateX(${x}px) scale(${scale})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>;
};

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [6, 16, durationInFrames - 14, durationInFrames - 4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 26, width: "100%", display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 40, color: "#fff7e6", background: "rgba(10,6,4,0.5)", padding: "8px 24px", borderRadius: 10 }}>{text}</div>
    </div>
  );
};

// Shot boundaries follow the narration (frames at 30 fps; narration starts at frame 8).
const SHOTS: { from: number; len: number; el: React.ReactNode; cap?: string }[] = [
  { from: 0, len: 160, el: <KingShot />, cap: "A king who asked: “Do you have a lord other than me?”" },
  { from: 150, len: 160, el: <BoyShot />, cap: "A boy who answered: “My Lord and your Lord is Allah.”" },
  { from: 300, len: 130, el: <FireShot />, cap: "And a people who chose faith over fire." },
  { from: 420, len: 485, el: <TitleShot /> },
];
export const TRAILER_LENGTH = 905;

export const FadeToBlack: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#000", opacity: o }} />;
};

// Sound design (CC0 sound effects, no music). Volumes ramp so the narration always sits on top.
export const sfx = (f: string) => staticFile(`trailer/sfx/${f}.mp3`);
export const ramp = (pts: number[], vals: number[]) => (f: number) =>
  interpolate(f, pts, vals, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const SoundDesign: React.FC = () => (
  <>
    {/* palace: torches crackling and the hush of a stone hall (king + boy shots) */}
    <Sequence from={0} durationInFrames={320}>
      <Html5Audio src={sfx("gentle-fire-crackling-01")} loop volume={ramp([0, 20, 290, 320], [0, 0.14, 0.14, 0])} />
      <Html5Audio src={sfx("cave-ambience-01")} loop volume={ramp([0, 20, 290, 320], [0, 0.07, 0.07, 0])} />
      <Html5Audio src={sfx("horror-heartbeat-34")} volume={ramp([0, 30, 300, 320], [0, 0.14, 0.14, 0])} />
    </Sequence>
    {/* the trench at night: roaring fire, night air and wind */}
    <Sequence from={295} durationInFrames={610}>
      <Html5Audio src={sfx("backlog-adapt-fire-burning")} loop volume={ramp([0, 20, 150, 330, 365, 545, 610], [0, 0.28, 0.2, 0.12, 0.04, 0.04, 0])} />
      <Html5Audio src={sfx("distant-bonfire-fire-crackling-01")} loop volume={ramp([0, 20, 150, 330, 365, 545, 610], [0, 0.25, 0.16, 0.1, 0.03, 0.03, 0])} />
      <Html5Audio src={sfx("night-ambience-01")} volume={ramp([0, 20, 200, 235], [0, 0.09, 0.09, 0])} />
      <Html5Audio src={sfx("horror-wind-whisper-04")} volume={ramp([0, 20, 140, 180], [0, 0.09, 0.09, 0])} />
    </Sequence>
    {/* whooshes on each camera whip (peak ~5 frames after start = middle of the transition) */}
    <Sequence from={150} durationInFrames={30}><Html5Audio src={sfx("short-video-whoosh-01")} volume={0.45} /></Sequence>
    <Sequence from={300} durationInFrames={30}><Html5Audio src={sfx("short-video-whoosh-01")} volume={0.45} /></Sequence>
    <Sequence from={419} durationInFrames={45}><Html5Audio src={sfx("fire-electric-whoosh-flame-36")} volume={ramp([0, 3, 25, 45], [0, 0.3, 0.15, 0])} /></Sequence>
    {/* title hit */}
    <Sequence from={553}>
      <Html5Audio src={sfx("cinematic-boom-01")} volume={0.32} />
    </Sequence>
  </>
);

export const TrenchTrailer: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.len}>
        <Fade first={i === 0} last={i === SHOTS.length - 1}>
          {s.el}
          {s.cap ? <Caption text={s.cap} /> : null}
        </Fade>
      </Sequence>
    ))}
    <Sequence from={8}><Html5Audio src={staticFile("trailer/vo.m4a")} /></Sequence>
    {/* Muhamed's own recitation of al-Burūj 85:4 */}
    <Sequence from={665}><Html5Audio src={staticFile("trailer/recitation-85-4.m4a")} /></Sequence>
    <FadeToBlack from={875} />
    <SoundDesign />
  </AbsoluteFill>
);

// ───────────────────────── Vertical 9:16 version (Shorts / TikTok / Reels) ─────────────────────────
// The landscape scenes are re-framed: each 16:9 scene is scaled up to fill the 1920px height and
// cropped around its subject, with larger captions and a re-laid-out title card.

const VW = 1080;
const VH = 1920;

export const Reframe: React.FC<{ children: React.ReactNode; focusX?: number; zoom?: number }> = ({ children, focusX = 960, zoom = 1 }) => {
  const s = (VH / H) * zoom;
  const left = VW / 2 - focusX * s;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: W, height: H, left, top: (VH - H * s) / 2, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const VCaption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [6, 16, durationInFrames - 14, durationInFrames - 4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [6, 20], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 210, width: "100%", display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 60, lineHeight: 1.25, color: "#fff7e6", background: "rgba(10,6,4,0.55)", padding: "18px 34px", borderRadius: 18, maxWidth: 940, textAlign: "center", textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>
        {text}
      </div>
    </div>
  );
};

const VTitleShot: React.FC = () => {
  const frame = useCurrentFrame();
  const a = (s: number) => interpolate(frame, [s, s + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const embers = new Array(70).fill(0).map((_, i) => {
    const age = (frame + i * 11) % 110;
    return { x: random(`vx${i}`) * VW, y: VH - age * 17, o: 1 - age / 110 };
  });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 90%, #4a160c 0%, #120708 55%, #060304 100%)", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} style={{ position: "absolute" }}>
        {embers.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={3.5} fill="#ffb347" opacity={e.o * 0.8} />)}
      </svg>
      <div style={{ textAlign: "center", color: "#f6e6c8", width: 960 }}>
        <div style={{ fontFamily: serif, fontSize: 50, letterSpacing: 10, color: "#e3a64a", opacity: a(25) }}>FRIDAY · NOVEMBER 13</div>
        <div style={{ fontFamily: amiri, fontSize: 150, color: "#ffcf7a", direction: "rtl", whiteSpace: "nowrap", lineHeight: 1.35, marginTop: 30, opacity: a(132), textShadow: "0 0 50px rgba(255,140,40,0.55)" }}>أصحاب الأخدود</div>
        <div style={{ fontFamily: serif, fontSize: 92, lineHeight: 1.1, letterSpacing: 3, opacity: a(142) }}>The People<br />of the Trench</div>
        <div style={{ fontFamily: amiri, fontSize: 70, direction: "rtl", marginTop: 90, opacity: a(238) }}>﴿قُتِلَ أَصْحَابُ الْأُخْدُودِ﴾</div>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 46, lineHeight: 1.3, fontStyle: "italic", opacity: a(250), marginTop: 14 }}>“Cursed were the people of the ditch (the story of the Boy and the King).”</div>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 34, color: "#bfa98a", opacity: a(250), marginTop: 14 }}>al-Burūj 85:4 — Hilali &amp; Muhsin Khan (Tanzil.net)</div>
      </div>
      <div style={{ position: "absolute", bottom: 150, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 32, color: "#bfa98a", opacity: a(270) }}>
        Source: Ibn Kathīr, al-Bidāya wa al-Nihāya 3/23–29
      </div>
    </AbsoluteFill>
  );
};

const VSHOTS: { from: number; len: number; el: React.ReactNode; cap?: string }[] = [
  { from: 0, len: 160, el: <Reframe focusX={960} zoom={1.05}><KingShot /></Reframe>, cap: "A king who asked: “Do you have a lord other than me?”" },
  { from: 150, len: 160, el: <Reframe focusX={960} zoom={1.05}><BoyShot /></Reframe>, cap: "A boy who answered: “My Lord and your Lord is Allah.”" },
  { from: 300, len: 130, el: <Reframe focusX={900}><FireShot /></Reframe>, cap: "And a people who chose faith over fire." },
  { from: 420, len: 485, el: <VTitleShot /> },
];

export const TrenchTrailerVertical: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {VSHOTS.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.len}>
        <Fade first={i === 0} last={i === VSHOTS.length - 1}>
          {s.el}
          {s.cap ? <VCaption text={s.cap} /> : null}
        </Fade>
      </Sequence>
    ))}
    <Sequence from={8}><Html5Audio src={staticFile("trailer/vo.m4a")} /></Sequence>
    <Sequence from={665}><Html5Audio src={staticFile("trailer/recitation-85-4.m4a")} /></Sequence>
    <FadeToBlack from={875} />
    <SoundDesign />
  </AbsoluteFill>
);
