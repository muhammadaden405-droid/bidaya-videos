import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Person, Elephant, walkPose, blend, STAND, SIT, Pose, Outfit } from "./Rig";
import { amiri, serif } from "../fonts";

// 2.5D cartoon: flat painted layers placed at different depths, filmed by a moving camera,
// with rigged faceless characters acting inside the scene.

const W = 1920;
const H = 1080;

type Cam = { x: number; y: number; zoom: number };

// A layer at depth d (0 = infinitely far, 1 = the ground the characters stand on, >1 = foreground).
const Layer: React.FC<{ d: number; cam: Cam; children: React.ReactNode }> = ({ d, cam, children }) => {
  const s = 1 + (cam.zoom - 1) * d;
  return (
    <AbsoluteFill style={{ transform: `translate(${-cam.x * d}px, ${-cam.y * d}px) scale(${s})`, transformOrigin: "50% 60%" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: "visible" }}>
        {children}
      </svg>
    </AbsoluteFill>
  );
};

const ridge = (seed: string, y: number, amp: number, step: number, from = -1200, to = 4200) => {
  let d = `M ${from} ${H + 400} L ${from} ${y}`;
  for (let x = from; x <= to; x += step) {
    d += ` L ${x} ${y - random(`${seed}${x}`) * amp}`;
  }
  return d + ` L ${to} ${H + 400} Z`;
};

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [10, 22, durationInFrames - 18, durationInFrames - 6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 26, width: "100%", display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 38, color: "#fff7e6", background: "rgba(10,6,4,0.5)", padding: "8px 24px", borderRadius: 10, maxWidth: 1400, textAlign: "center" }}>{text}</div>
    </div>
  );
};

const ABRAHA: Outfit = { skin: "#b07a56", robe: "#7b1f2b", robeShade: "#561520", crown: true, cape: "#d4a23c" };
const SOLDIER = (i: number): Outfit => ({
  skin: ["#8d5a3b", "#a06b48", "#7a4b30"][i % 3],
  robe: ["#5c4632", "#6b5238", "#4f4033"][i % 3],
  robeShade: "#3a2c20",
  wrap: ["#c9b38a", "#8f2a1c", "#d8cfbd"][i % 3],
  spear: true,
  shield: i % 2 ? "#7a4a26" : undefined,
});

// Scene A — Abraha leads his army and the elephant across the desert at dusk.
export const ArmyMarch: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const speed = 2.4;
  const armyX = 1500 - frame * speed;
  const cam: Cam = {
    x: armyX - 900 + interpolate(frame, [0, durationInFrames], [160, -40]),
    y: 0,
    zoom: interpolate(frame, [0, durationInFrames], [1.0, 1.12], { easing: Easing.inOut(Easing.sin) }),
  };
  const phase = frame * 0.2;
  // Abraha raises his arm and points ahead toward Makkah partway through.
  const pointT = interpolate(frame, [170, 195, 300, 325], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ride: Pose = { ...SIT, bob: -Math.abs(Math.cos(phase * 0.8)) * 4 };
  const point: Pose = { ...ride, armRU: -115, armRL: -10, head: -6 };
  const abraha = blend(ride, point, pointT);
  const sunY = interpolate(frame, [0, durationInFrames], [600, 640]);

  const soldiers = new Array(10).fill(0).map((_, i) => ({
    x: armyX + 330 + (i % 5) * 150 + (i >= 5 ? 70 : 0),
    back: i >= 5,
    phase: phase + i * 0.9,
    i,
  }));
  const dust = new Array(30).fill(0).map((_, i) => {
    const age = (frame + i * 7) % 45;
    return { x: armyX + 100 + random(`d${i}`) * 1300 + age * 1.2, y: 800 - age * 0.9, r: 6 + age * 0.9, o: 0.35 * (1 - age / 45) };
  });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#2a1c48 0%, #8a3a4c 42%, #ec8a45 68%, #f8c46f 80%)" }}>
      <Layer d={0.03} cam={cam}>
        <circle cx={1300} cy={sunY} r={90} fill="#fff1c9" />
        <circle cx={1300} cy={sunY} r={170} fill="#ffd27a" opacity={0.25} />
      </Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("far", 700, 150, 120)} fill="#9b4f62" /></Layer>
      <Layer d={0.35} cam={cam}><path d={ridge("mid", 760, 120, 90)} fill="#6e3446" /></Layer>
      <Layer d={0.65} cam={cam}>
        <path d={`M -1500 720 Q -800 650 0 710 T 1600 690 T 3200 700 T 4800 690 L 4800 1500 L -1500 1500 Z`} fill="#c97a45" />
      </Layer>
      <Layer d={1} cam={cam}>
        <path d={`M -2500 760 Q -1200 730 0 760 T 2500 750 T 5000 760 L 5000 1600 L -2500 1600 Z`} fill="#e19a5a" />
        {dust.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#f6d2a2" opacity={p.o} />)}
        {soldiers.filter((s) => s.back).map((s) => (
          <g key={s.i} transform={`translate(${s.x} 775) scale(0.8)`} opacity={0.9}>
            <Person pose={walkPose(s.phase)} outfit={SOLDIER(s.i)} flip />
          </g>
        ))}
        <g transform={`translate(${armyX} 840) scale(0.95)`}>
          <Elephant phase={phase * 0.8} earFlap={(Math.sin(phase * 0.6) + 1) / 2} rider={<g transform="scale(0.85)"><Person pose={abraha} outfit={ABRAHA} flip /></g>} />
        </g>
        {soldiers.filter((s) => !s.back).map((s) => (
          <g key={s.i} transform={`translate(${s.x} 875) scale(0.95)`}>
            <Person pose={walkPose(s.phase)} outfit={SOLDIER(s.i)} flip />
          </g>
        ))}
      </Layer>
      <Layer d={1.5} cam={cam}>
        {new Array(14).fill(0).map((_, i) => (
          <path key={i} d={`M ${-800 + i * 420} 1100 q 60 -90 140 -40 q 50 -60 120 10 q 40 -20 70 40 Z`} fill="#5a2c22" />
        ))}
      </Layer>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

const House: React.FC<{ x: number; y: number; w: number; h: number; lit?: boolean }> = ({ x, y, w, h, lit }) => (
  <g>
    <rect x={x} y={y - h} width={w} height={h} fill="#6d5a4a" />
    <rect x={x} y={y - h} width={w * 0.35} height={h} fill="#5a4a3d" />
    <rect x={x - 4} y={y - h - 8} width={w + 8} height={10} fill="#4f4136" />
    <rect x={x + w * 0.55} y={y - h * 0.55} width={w * 0.2} height={h * 0.55} fill={lit ? "#f0a64a" : "#2b221c"} />
    {lit ? <rect x={x + w * 0.55} y={y - h * 0.55} width={w * 0.2} height={h * 0.55} fill="#ffcf7a" opacity={0.5} /> : null}
  </g>
);

// Scene B — Makkah at night; a townsman notices torches of the army gathering beyond the mountains.
export const MakkahNight: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cam: Cam = {
    x: interpolate(frame, [0, durationInFrames], [-80, 40], { easing: Easing.inOut(Easing.sin) }),
    y: interpolate(frame, [0, durationInFrames], [0, 20]),
    zoom: interpolate(frame, [0, durationInFrames], [1.0, 1.28], { easing: Easing.inOut(Easing.sin) }),
  };
  const torches = interpolate(frame, [150, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const walkerX = 420 + frame * 1.2;
  const stopT = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const watcherWalk = walkPose(frame * 0.2, 1 - stopT);
  const pointUp: Pose = { ...STAND, armRU: -150, armRL: -15, head: -18, lean: -4 };
  const watcher = blend(watcherWalk, pointUp, interpolate(frame, [175, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const watcherX = 1290 + Math.min(frame, 150) * 0.8;
  const stars = new Array(90).fill(0).map((_, i) => ({ x: random(`sx${i}`) * 2400 - 240, y: random(`sy${i}`) * 520, r: 1 + random(`sr${i}`) * 2 }));

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#0b1030 0%, #1b2552 55%, #2f3866 75%)" }}>
      <Layer d={0.03} cam={cam}>
        {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff8e1" opacity={0.5 + 0.5 * Math.sin(frame * 0.08 + i)} />)}
        <path d="M 1480 170 a 60 60 0 1 0 50 95 a 48 48 0 1 1 -50 -95 Z" fill="#fdf3cf" />
      </Layer>
      <Layer d={0.15} cam={cam}>
        <path d={ridge("mkf", 690, 260, 140)} fill="#2a2e57" />
        {/* the army's torches gathering beyond the mountains */}
        {new Array(16).fill(0).map((_, i) => (
          <circle key={i} cx={1250 + i * 38 + random(`t${i}`) * 20} cy={560 + random(`ty${i}`) * 50} r={4 + Math.sin(frame * 0.4 + i) * 1.2} fill="#ffb347" opacity={torches * (0.6 + 0.4 * Math.sin(frame * 0.3 + i))} />
        ))}
      </Layer>
      <Layer d={0.35} cam={cam}><path d={ridge("mkm", 760, 240, 110)} fill="#232548" /></Layer>
      <Layer d={0.6} cam={cam}>
        {new Array(16).fill(0).map((_, i) => (
          <House key={i} x={180 + i * 100 + (i % 3) * 12} y={850} w={84} h={70 + (i % 4) * 14} lit={i % 3 === 0} />
        ))}
      </Layer>
      <Layer d={0.85} cam={cam}>
        <rect x={-600} y={850} width={3200} height={500} fill="#8a7560" />
        {/* the Ka'bah */}
        <g transform="translate(960 905) scale(1.9)">
          <rect x={-90} y={-150} width={180} height={150} fill="#141414" />
          <rect x={-90} y={-112} width={180} height={14} fill="#c9a24a" />
          <path d="M 90 -150 L 130 -175 L 130 -25 L 90 0 Z" fill="#0b0b0b" />
          <path d="M -90 -150 L -50 -175 L 130 -175 L 90 -150 Z" fill="#262626" />
        </g>
      </Layer>
      <Layer d={1} cam={cam}>
        <g transform={`translate(${walkerX} 935) scale(0.48)`}>
          <Person pose={walkPose(frame * 0.2)} outfit={{ skin: "#9a6646", robe: "#e7dcc6", robeShade: "#bfb29a", wrap: "#f2ece0" }} />
        </g>
        <g transform={`translate(${watcherX} 945) scale(0.5)`}>
          <Person pose={watcher} outfit={{ skin: "#8d5a3b", robe: "#cdbb98", robeShade: "#a7966f", wrap: "#7b5a3a" }} />
        </g>
        {new Array(5).fill(0).map((_, i) => (
          <House key={i} x={-260 + i * 520} y={1180} w={190} h={160} lit={i % 2 === 1} />
        ))}
      </Layer>
      <Layer d={1.45} cam={cam}>
        <path d="M -700 1300 L -500 980 L -300 1100 L -150 1300 Z" fill="#14132a" />
        <path d="M 2000 1300 L 2250 960 L 2500 1120 L 2700 1300 Z" fill="#14132a" />
      </Layer>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

const LEN_A = 390;
const LEN_B = 330;
const FADE = 15;
export const CARTOON_LENGTH = LEN_A + LEN_B - FADE;

const Fade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [0, FADE, durationInFrames - FADE, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const Cartoon25D: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence durationInFrames={LEN_A}>
      <Fade>
        <ArmyMarch />
        <Caption text="In the year the Prophet ﷺ was born, Abraha, the ruler of Yemen, set out with a great army and a mighty elephant at its front." />
      </Fade>
      <Sequence from={10}><Html5Audio src={staticFile("sample/vo2.m4a")} /></Sequence>
    </Sequence>
    <Sequence from={LEN_A - FADE} durationInFrames={LEN_B}>
      <Fade>
        <MakkahNight />
        <Caption text="Makkah. A quiet valley… and at its heart, the Kaʿbah. Abraha had come to destroy it." />
      </Fade>
      <Sequence from={10}><Html5Audio src={staticFile("sample/vo4.m4a")} /></Sequence>
    </Sequence>
  </AbsoluteFill>
);
