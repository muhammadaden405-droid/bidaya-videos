import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Person, Pose, Outfit, STAND } from "../cartoon/Rig";

// Shared 2.5D building blocks for Episode 1 (The Year of the Elephant).
// Flat painted layers at different depths, filmed by a moving camera; faceless rigged characters.

export const W = 1920;
export const H = 1080;
export type Cam = { x: number; y: number; zoom: number };
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const iv = (f: number, a: number[], b: number[], ease?: (t: number) => number) =>
  interpolate(f, a, b, ease ? { ...clamp, easing: ease } : clamp);
export const ease = Easing.inOut(Easing.sin);

// frame, duration, and progress 0..1 of the current shot
export const useShot = () => {
  const frame = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();
  return { frame, dur, p: Math.min(1, frame / Math.max(1, dur - 1)) };
};
// a slow cinematic camera move from a to b across the shot
export const moveCam = (p: number, a: Cam, b: Cam): Cam => {
  const t = ease(p);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, zoom: a.zoom + (b.zoom - a.zoom) * t };
};

export const Layer: React.FC<{ d: number; cam: Cam; children: React.ReactNode; origin?: string }> = ({ d, cam, children, origin = "50% 60%" }) => {
  const s = 1 + (cam.zoom - 1) * d;
  return (
    <AbsoluteFill style={{ transform: `translate(${-cam.x * d}px, ${-cam.y * d}px) scale(${s})`, transformOrigin: origin }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: "visible" }}>{children}</svg>
    </AbsoluteFill>
  );
};

export const ridge = (seed: string, y: number, amp: number, step: number, from = -1600, to = 4400, smooth = false) => {
  let d = `M ${from} ${H + 600} L ${from} ${y}`;
  let px = from;
  let py = y;
  for (let x = from; x <= to; x += step) {
    const ny = y - random(`${seed}${x}`) * amp;
    d += smooth ? ` Q ${px + step / 2} ${py} ${x} ${ny}` : ` L ${x} ${ny}`;
    px = x;
    py = ny;
  }
  return d + ` L ${to} ${H + 600} Z`;
};
export const dunes = (seed: string, y: number, amp: number, step = 420, from = -2000, to = 4600) => {
  let d = `M ${from} ${H + 600} L ${from} ${y}`;
  for (let x = from; x <= to; x += step) {
    const ny = y - random(`${seed}${x}`) * amp;
    d += ` Q ${x + step * 0.5} ${ny - amp * 0.4} ${x + step} ${y - random(`${seed}${x + step}`) * amp}`;
  }
  return d + ` L ${to + step} ${H + 600} Z`;
};

// ---------- atmosphere ----------
export const Vignette: React.FC<{ strength?: number; color?: string }> = ({ strength = 0.55, color = "0,0,0" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(${color},0) 50%, rgba(${color},${strength}) 100%)`, pointerEvents: "none" }} />
);
export const Grade: React.FC<{ color: string; opacity: number; mode?: React.CSSProperties["mixBlendMode"] }> = ({ color, opacity, mode = "soft-light" }) => (
  <AbsoluteFill style={{ backgroundColor: color, opacity, mixBlendMode: mode, pointerEvents: "none" }} />
);
// subtle animated film grain
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const frame = useCurrentFrame();
  const seed = frame % 8;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width={W} height={H}>
        <filter id={`gr${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter={`url(#gr${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
export const Rays: React.FC<{ x: number; y: number; color?: string; opacity?: number; spread?: number }> = ({ x, y, color = "#fff1c9", opacity = 0.18, spread = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <g style={{ mixBlendMode: "screen" }}>
      {new Array(9).fill(0).map((_, i) => {
        const a = (-60 + i * 15) * spread + Math.sin(frame * 0.01 + i) * 2;
        const r = (a * Math.PI) / 180;
        const len = 1800;
        const w = 0.06;
        return (
          <path key={i} d={`M ${x} ${y} L ${x + Math.sin(r - w) * len} ${y + Math.cos(r - w) * len} L ${x + Math.sin(r + w) * len} ${y + Math.cos(r + w) * len} Z`} fill={color} opacity={opacity * (0.5 + 0.5 * Math.sin(frame * 0.02 + i * 1.7))} />
        );
      })}
    </g>
  );
};
export const Dust: React.FC<{ n?: number; color?: string; y0?: number; y1?: number; drift?: number; seed?: string; size?: number; opacity?: number }> = ({ n = 40, color = "#f6d9a8", y0 = 200, y1 = 1000, drift = 0.6, seed = "d", size = 3, opacity = 0.5 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const x = ((random(`${seed}x${i}`) * 2400 + frame * drift * (0.5 + random(`${seed}v${i}`))) % 2400) - 240;
        const y = y0 + random(`${seed}y${i}`) * (y1 - y0) + Math.sin(frame * 0.03 + i) * 12;
        return <circle key={i} cx={x} cy={y} r={size * (0.5 + random(`${seed}r${i}`))} fill={color} opacity={opacity * (0.4 + 0.6 * Math.abs(Math.sin(frame * 0.02 + i)))} />;
      })}
    </g>
  );
};
export const Embers: React.FC<{ n?: number; x0?: number; x1?: number; base?: number; seed?: string }> = ({ n = 50, x0 = 0, x1 = W, base = H, seed = "em" }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const life = 110;
        const age = (frame + i * 17) % life;
        return <circle key={i} cx={x0 + random(`${seed}${i}`) * (x1 - x0) + Math.sin((age + i) * 0.08) * 24} cy={base - age * 6} r={1.5 + random(`${seed}r${i}`) * 2.5} fill="#ffc46b" opacity={(1 - age / life) * 0.9} />;
      })}
    </g>
  );
};
export const Fog: React.FC<{ y: number; color?: string; opacity?: number; seed?: string }> = ({ y, color = "#f3e3c8", opacity = 0.25, seed = "fg" }) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {new Array(8).fill(0).map((_, i) => (
        <ellipse key={i} cx={((random(`${seed}${i}`) * 3000 + frame * 0.4 * (i % 2 ? 1 : -1)) % 3000) - 500} cy={y + (i % 3) * 30} rx={500 + i * 40} ry={60} fill={color} />
      ))}
    </g>
  );
};

// ---------- skies ----------
export const SKY = {
  dusk: "linear-gradient(#1f1638 0%, #5d2c4c 34%, #c2584a 58%, #f3a65a 74%, #ffd89a 84%)",
  day: "linear-gradient(#5f9fd0 0%, #9cc7e2 45%, #f2dcb0 78%)",
  hot: "linear-gradient(#e9b26a 0%, #f2cf8f 45%, #fbe8c1 75%)",
  night: "linear-gradient(#05081a 0%, #0f1736 45%, #1e2a52 72%, #2e3560 85%)",
  dawn: "linear-gradient(#1b2246 0%, #4e4a74 32%, #c27a78 58%, #f6c58c 76%, #ffe7b8 86%)",
  storm: "linear-gradient(#141018 0%, #2c2028 40%, #6b3a2a 70%, #a8582c 85%)",
  sea: "linear-gradient(#20385e 0%, #5a7fa6 40%, #d9b98c 72%)",
};
export const Stars: React.FC<{ n?: number; seed?: string }> = ({ n = 120, seed = "st" }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => (
        <circle key={i} cx={random(`${seed}x${i}`) * 2600 - 340} cy={random(`${seed}y${i}`) * 620 - 60} r={0.8 + random(`${seed}r${i}`) * 1.8} fill="#fff8e1" opacity={0.35 + 0.65 * Math.abs(Math.sin(frame * 0.05 + i * 1.3))} />
      ))}
    </g>
  );
};
export const Moon: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 46 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 4} fill="#cfd8ff" opacity={0.06} />
    <circle cx={x} cy={y} r={r * 2} fill="#e6ecff" opacity={0.1} />
    <circle cx={x} cy={y} r={r} fill="#fdf6dc" />
    <circle cx={x + r * 0.3} cy={y - r * 0.2} r={r * 0.18} fill="#e8dfc0" />
    <circle cx={x - r * 0.35} cy={y + r * 0.3} r={r * 0.12} fill="#e8dfc0" />
  </g>
);
export const Sun: React.FC<{ x: number; y: number; r?: number; color?: string }> = ({ x, y, r = 90, color = "#fff1c9" }) => (
  <g>
    <circle cx={x} cy={y} r={r * 3.2} fill="#ffd27a" opacity={0.12} />
    <circle cx={x} cy={y} r={r * 1.8} fill="#ffd27a" opacity={0.22} />
    <circle cx={x} cy={y} r={r} fill={color} />
  </g>
);
export const Clouds: React.FC<{ y: number; color?: string; opacity?: number; seed?: string; speed?: number; scale?: number }> = ({ y, color = "#f7d8b8", opacity = 0.7, seed = "cl", speed = 0.25, scale = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {new Array(6).fill(0).map((_, i) => {
        const x = ((random(`${seed}${i}`) * 3200 + frame * speed) % 3200) - 600;
        const yy = y + random(`${seed}y${i}`) * 120;
        const s = (0.7 + random(`${seed}s${i}`) * 0.8) * scale;
        return (
          <g key={i} transform={`translate(${x} ${yy}) scale(${s})`}>
            <ellipse cx={0} cy={0} rx={160} ry={34} fill={color} />
            <ellipse cx={-50} cy={-22} rx={70} ry={36} fill={color} />
            <ellipse cx={40} cy={-30} rx={90} ry={46} fill={color} />
          </g>
        );
      })}
    </g>
  );
};

// ---------- people ----------
export const OUT = {
  abraha: { skin: "#7a4a30", robe: "#7b1f2b", robeShade: "#561520", wrap: "#e6cf8a", cape: "#d4a23c" } as Outfit,
  abrahaKing: { skin: "#7a4a30", robe: "#7b1f2b", robeShade: "#561520", crown: true, cape: "#d4a23c" } as Outfit,
  abrahaBald: { skin: "#7a4a30", robe: "#7b1f2b", robeShade: "#561520", cape: "#d4a23c" } as Outfit,
  aryat: { skin: "#6e432c", robe: "#1f4f7a", robeShade: "#163955", wrap: "#d8cfbd", cape: "#c9a24a", spear: true } as Outfit,
  servant: { skin: "#6a4029", robe: "#5a4a36", robeShade: "#3a2f22", wrap: "#2a221b" } as Outfit,
  negus: { skin: "#5e3824", robe: "#f2e6c8", robeShade: "#cdbd96", crown: true, cape: "#2f6b3a" } as Outfit,
  dhuNuwas: { skin: "#a8724f", robe: "#3d1d4f", robeShade: "#2a1238", crown: true, cape: "#7a1420" } as Outfit,
  chief: { skin: "#a87650", robe: "#f4efe2", robeShade: "#d7cdb6", wrap: "#fbf8ef" } as Outfit, // ʿAbd al-Muṭṭalib
  envoy: { skin: "#a0704c", robe: "#3f5a3a", robeShade: "#2b3f28", wrap: "#d8c9a2" } as Outfit,
  prisoner: { skin: "#9a6848", robe: "#6b5a46", robeShade: "#4a3e30", wrap: "#5a4632" } as Outfit,
  guide: { skin: "#9a6646", robe: "#8a6a3e", robeShade: "#64492a", wrap: "#3a2e22" } as Outfit,
};
export const SOLDIER = (i: number, spear = true): Outfit => ({
  skin: ["#6a4029", "#5e3824", "#74472e"][i % 3],
  robe: ["#7b1f2b", "#8a2a1e", "#6a1a24"][i % 3],
  robeShade: "#4a1218",
  wrap: ["#e6cf8a", "#d8cfbd", "#c9b38a"][i % 3],
  spear,
  shield: i % 2 ? "#7a4a26" : undefined,
});
export const BLUE = (i: number): Outfit => ({ ...SOLDIER(i), robe: ["#1f4f7a", "#24578a", "#1a4268"][i % 3], robeShade: "#123050" });
export const ARAB = (i: number): Outfit => ({
  skin: ["#a87650", "#9a6646", "#b8845c", "#8d5a3b"][i % 4],
  robe: ["#e9dfc8", "#cdbb98", "#a8916a", "#f2ece0", "#7a6a55"][i % 5],
  robeShade: "#8a7a5e",
  wrap: ["#f2ece0", "#7b5a3a", "#d8cfbd", "#3a2e22"][i % 4],
});
// a person with a body-shape squash (sx, sy) e.g. short & heavy vs tall
export const Figure: React.FC<{ x: number; y: number; s?: number; pose?: Pose; outfit: Outfit; flip?: boolean; sx?: number; sy?: number; opacity?: number }> = ({ x, y, s = 1, pose = STAND, outfit, flip, sx = 1, sy = 1, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * sx} ${s * sy})`} opacity={opacity}>
    <Person pose={pose} outfit={outfit} flip={flip} />
  </g>
);

// ---------- animals & vehicles (side views, feet at 0,0, facing +x unless flipped) ----------
export const Horse: React.FC<{ phase: number; gallop?: number; color?: string; rider?: React.ReactNode; flip?: boolean }> = ({ phase, gallop = 1, color = "#5a3a26", rider, flip }) => {
  const dark = "#3a2416";
  const leg = (x: number, off: number, front: boolean) => {
    const a = Math.sin(phase + off) * 28 * gallop;
    const b = Math.max(0, Math.sin(phase + off + 1)) * 40 * gallop;
    return (
      <g transform={`translate(${x} -120) rotate(${a})`}>
        <rect x={-9} y={0} width={18} height={62} rx={8} fill={front ? color : dark} />
        <g transform={`translate(0 58) rotate(${-b})`}>
          <rect x={-7} y={0} width={14} height={60} rx={6} fill={front ? color : dark} />
          <rect x={-9} y={54} width={18} height={10} rx={3} fill="#1e140c" />
        </g>
      </g>
    );
  };
  const bob = -Math.abs(Math.sin(phase)) * 8 * gallop;
  return (
    <g transform={`scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx={0} cy={4} rx={110} ry={12} fill="#000" opacity={0.18} />
      <g transform={`translate(0 ${bob})`}>
        {leg(-60, Math.PI, false)}
        {leg(55, 0.6, false)}
        <path d={`M -95 -175 Q -140 -150 ${-150 + Math.sin(phase) * 10} -90`} stroke={dark} strokeWidth={14} fill="none" strokeLinecap="round" />
        <ellipse cx={0} cy={-150} rx={100} ry={44} fill={color} />
        <path d="M 70 -170 Q 100 -240 130 -262 L 160 -250 Q 150 -215 110 -150 Z" fill={color} />
        <path d="M 120 -268 Q 175 -262 190 -232 Q 185 -218 165 -222 L 140 -236 Z" fill={color} />
        <path d="M 74 -176 Q 96 -240 124 -266" stroke={dark} strokeWidth={10} fill="none" />
        <path d="M 128 -268 L 136 -290 L 142 -266 Z" fill={color} />
        {leg(-45, 0, true)}
        {leg(70, Math.PI + 0.6, true)}
        {rider ? <g transform="translate(-6 -150)">{rider}</g> : null}
      </g>
    </g>
  );
};
export const Camel: React.FC<{ phase: number; walk?: number; color?: string; load?: boolean; flip?: boolean }> = ({ phase, walk = 1, color = "#c49a62", load, flip }) => {
  const dark = "#9a7444";
  const leg = (x: number, off: number, c: string) => (
    <g transform={`translate(${x} -150) rotate(${Math.sin(phase + off) * 18 * walk})`}>
      <rect x={-8} y={0} width={16} height={150} rx={7} fill={c} />
    </g>
  );
  return (
    <g transform={`scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx={0} cy={4} rx={110} ry={11} fill="#000" opacity={0.16} />
      <g transform={`translate(0 ${-Math.abs(Math.sin(phase)) * 5 * walk})`}>
        {leg(-55, Math.PI, dark)}
        {leg(55, 0, dark)}
        <path d="M -100 -160 Q -110 -200 -60 -215 Q -30 -280 10 -230 Q 40 -270 80 -215 Q 110 -200 105 -160 Q 0 -140 -100 -160 Z" fill={color} />
        <path d="M 90 -190 Q 130 -200 140 -260 Q 150 -300 185 -290 Q 200 -280 190 -268 Q 165 -268 160 -230 Q 150 -175 100 -160 Z" fill={color} />
        {load ? <path d="M -60 -230 L 60 -230 L 50 -190 L -50 -190 Z" fill="#8f2a1c" /> : null}
        {leg(-40, 0, color)}
        {leg(70, Math.PI, color)}
      </g>
    </g>
  );
};
export const Ship: React.FC<{ rock: number; scale?: number; sail?: string }> = ({ rock, scale = 1, sail = "#efe3c8" }) => (
  <g transform={`scale(${scale}) rotate(${rock})`}>
    <path d="M -180 0 Q -170 50 -110 60 L 120 60 Q 175 50 190 -10 Z" fill="#5a3a22" />
    <path d="M -180 0 L 190 -10" stroke="#3a2416" strokeWidth={6} />
    <line x1={0} y1={-10} x2={0} y2={-260} stroke="#3a2416" strokeWidth={8} />
    <path d="M 4 -250 Q 120 -170 4 -40 Z" fill={sail} />
    <path d="M -4 -240 Q -90 -160 -4 -60 Z" fill={sail} opacity={0.85} />
    <path d="M 0 -262 L 40 -250 L 0 -240 Z" fill="#8f2a1c" />
    {[-120, -70, -20, 30, 80].map((x) => <line key={x} x1={x} y1={40} x2={x - 40} y2={95} stroke="#3a2416" strokeWidth={4} />)}
  </g>
);
// Elephant (from the rig) with a kneel parameter 0..1 — the body sinks and the front legs fold.
export const KElephant: React.FC<{ phase: number; earFlap: number; kneel?: number; rider?: React.ReactNode; trunkUp?: number; skin?: string }> = ({ phase, earFlap, kneel = 0, rider, trunkUp = 0, skin = "#8a7f7a" }) => {
  const shade = "#6f6560";
  const k = kneel;
  const walk = 1 - k;
  const leg = (dx: number, off: number, col: string, front: boolean) => {
    const a = Math.sin(phase + off) * 16 * walk;
    const fold = front ? k * 80 : k * 35;
    return (
      <g transform={`translate(${dx} -150) rotate(${a + (front ? -fold * 0.2 : fold * 0.3)})`}>
        <rect x={-24} y={0} width={48} height={150 - k * 70} rx={20} fill={col} />
        <ellipse cx={0} cy={148 - k * 70} rx={28} ry={10} fill="#e9e0d5" opacity={0.6} />
      </g>
    );
  };
  const trunkSway = Math.sin(phase * 0.5) * 18 * walk;
  const bob = -Math.abs(Math.cos(phase)) * 6 * walk + k * 70;
  const tilt = k * 6;
  return (
    <g>
      <ellipse cx={0} cy={6} rx={170 + k * 20} ry={16} fill="#000" opacity={0.2} />
      <g transform={`translate(0 ${bob}) rotate(${-tilt} 0 -150)`}>
        {leg(-80, Math.PI, shade, false)}
        {leg(90, 0, shade, false)}
        <path d={`M 160 -220 Q 196 -200 ${190 + Math.sin(phase) * 8} -150`} stroke={shade} strokeWidth={8} fill="none" strokeLinecap="round" />
        <ellipse cx={20} cy={-230} rx={180} ry={120} fill={skin} />
        <ellipse cx={30} cy={-190} rx={150} ry={70} fill={shade} opacity={0.25} />
        {leg(-50, 0, skin, true)}
        {leg(120, Math.PI, skin, false)}
        <path d="M -80 -330 Q 30 -360 140 -330 L 130 -230 Q 30 -210 -70 -230 Z" fill="#8f2a1c" />
        <path d="M -80 -330 Q 30 -360 140 -330" stroke="#e3b341" strokeWidth={8} fill="none" />
        <path d="M -70 -300 Q 30 -322 132 -300" stroke="#e3b341" strokeWidth={3} fill="none" opacity={0.7} />
        <path d="M -10 -352 Q 40 -372 110 -352 L 104 -330 Q 40 -346 -4 -330 Z" fill="#e3b341" />
        {rider ? <g transform="translate(40 -222)">{rider}</g> : null}
        <circle cx={-160} cy={-250} r={86} fill={skin} />
        <path d={`M -150 -300 Q ${-60 - earFlap * 30} -320 ${-70 - earFlap * 25} -230 Q -90 -160 -150 -190 Z`} fill={shade} />
        <path d={`M -220 -220 Q ${-270 - trunkUp * 40} ${-140 - trunkUp * 160} ${-250 + trunkSway - trunkUp * 60} ${-60 - trunkUp * 250} Q ${-245 + trunkSway - trunkUp * 40} ${-30 - trunkUp * 280} ${-215 + trunkSway - trunkUp * 10} ${-50 - trunkUp * 270}`} stroke={skin} strokeWidth={40} fill="none" strokeLinecap="round" />
        <path d="M -200 -200 Q -250 -170 -262 -200" stroke="#f3ead8" strokeWidth={14} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};
export const Bird: React.FC<{ x: number; y: number; s: number; flap: number; color?: string; stone?: boolean }> = ({ x, y, s, flap, color = "#1b1a22", stone }) => {
  const w = Math.sin(flap);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -4 0 Q -26 ${-18 * w} -48 ${-6 - 22 * w} Q -30 ${2 - 6 * w} -6 6 Z`} fill={color} />
      <path d={`M 4 0 Q 26 ${-18 * w} 48 ${-6 - 22 * w} Q 30 ${2 - 6 * w} 6 6 Z`} fill={color} />
      <ellipse cx={0} cy={2} rx={9} ry={6} fill={color} />
      <path d="M -3 6 L -9 22 L 0 14 L 9 22 L 3 6 Z" fill={color} />
      {stone ? (
        <>
          <circle cx={0} cy={-6} r={2.6} fill="#c9b8a0" />
          <circle cx={-5} cy={11} r={2.6} fill="#c9b8a0" />
          <circle cx={5} cy={11} r={2.6} fill="#c9b8a0" />
        </>
      ) : null}
    </g>
  );
};

// ---------- architecture ----------
export const Kaaba: React.FC<{ x: number; y: number; s?: number; night?: boolean; glow?: number }> = ({ x, y, s = 1, night, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 ? <ellipse cx={20} cy={-90} rx={300} ry={220} fill="#fff1c9" opacity={0.18 * glow} /> : null}
    <ellipse cx={20} cy={4} rx={190} ry={22} fill="#000" opacity={0.2} />
    <rect x={-90} y={-170} width={180} height={170} fill="#121212" />
    <path d="M 90 -170 L 135 -196 L 135 -26 L 90 0 Z" fill="#070707" />
    <path d="M -90 -170 L -45 -196 L 135 -196 L 90 -170 Z" fill={night ? "#1d1d24" : "#262626"} />
    <rect x={-90} y={-128} width={180} height={16} fill="#c9a24a" />
    <path d="M 90 -128 L 135 -154 L 135 -138 L 90 -112 Z" fill="#a8842e" />
    <rect x={18} y={-96} width={40} height={74} fill="#c9a24a" />
    <rect x={24} y={-90} width={28} height={62} fill="#a8842e" />
    <circle cx={38} cy={-58} r={5} fill="#5a4416" />
  </g>
);
export const House: React.FC<{ x: number; y: number; w: number; h: number; lit?: boolean; tone?: number }> = ({ x, y, w, h, lit, tone = 0 }) => {
  const c = ["#c9a47a", "#b8936a", "#d4b48a", "#a8825a"][tone % 4];
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={c} />
      <rect x={x} y={y - h} width={w * 0.3} height={h} fill="#000" opacity={0.12} />
      <rect x={x - 3} y={y - h - 7} width={w + 6} height={9} fill="#000" opacity={0.18} />
      <rect x={x + w * 0.55} y={y - h * 0.5} width={w * 0.18} height={h * 0.3} fill={lit ? "#ffb347" : "#3a2a1e"} />
      <rect x={x + w * 0.2} y={y - h * 0.38} width={w * 0.2} height={h * 0.38} fill="#3a2a1e" />
    </g>
  );
};
export const Town: React.FC<{ y: number; n?: number; x0?: number; gap?: number; s?: number; lit?: boolean; seed?: string }> = ({ y, n = 18, x0 = -300, gap = 130, s = 1, lit, seed = "tw" }) => (
  <g>
    {new Array(n).fill(0).map((_, i) => (
      <House key={i} x={x0 + i * gap + random(`${seed}${i}`) * 30} y={y - random(`${seed}v${i}`) * 26} w={(90 + random(`${seed}w${i}`) * 40) * s} h={(60 + random(`${seed}h${i}`) * 70) * s} lit={lit && random(`${seed}l${i}`) > 0.6} tone={i} />
    ))}
  </g>
);
export const Torch: React.FC<{ x: number; y: number; seed: number; s?: number }> = ({ x, y, seed, s = 1 }) => {
  const frame = useCurrentFrame();
  const f = 1 + 0.12 * Math.sin(frame * 0.5 + seed) + 0.06 * Math.sin(frame * 1.3 + seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-30} r={170 * f} fill="#ffb347" opacity={0.12} />
      <circle cx={0} cy={-30} r={80 * f} fill="#ffb347" opacity={0.16} />
      <rect x={-6} y={-20} width={12} height={60} fill="#3a2416" />
      <path d={`M -14 -20 Q 0 ${-70 * f} 14 -20 Z`} fill="#ffb347" />
      <path d={`M -7 -20 Q 0 ${-45 * f} 7 -20 Z`} fill="#fff1b8" />
    </g>
  );
};
// an arched hall interior (palace) — palette chosen per court
export const Hall: React.FC<{ cam: Cam; wall: string; arch: string; pillar: string; floor: string; torches?: boolean; banner?: string }> = ({ cam, wall, arch, pillar, floor, torches = true, banner }) => (
  <>
    <Layer d={0.25} cam={cam}>
      <rect x={-600} y={-300} width={3200} height={1500} fill={wall} />
      {new Array(8).fill(0).map((_, i) => (
        <path key={i} d={`M ${-300 + i * 340} 820 L ${-300 + i * 340} 360 Q ${-130 + i * 340} 190 ${40 + i * 340} 360 L ${40 + i * 340} 820 Z`} fill={arch} />
      ))}
      {banner ? new Array(4).fill(0).map((_, i) => <path key={i} d={`M ${-80 + i * 680} 120 L ${40 + i * 680} 120 L ${40 + i * 680} 520 L ${-20 + i * 680} 470 L ${-80 + i * 680} 520 Z`} fill={banner} />) : null}
    </Layer>
    <Layer d={0.55} cam={cam}>
      {new Array(7).fill(0).map((_, i) => (
        <g key={i}>
          <rect x={-400 + i * 460} y={130} width={92} height={740} fill={pillar} />
          <rect x={-416 + i * 460} y={118} width={124} height={30} fill={pillar} />
          <rect x={-400 + i * 460} y={130} width={30} height={740} fill="#000" opacity={0.15} />
        </g>
      ))}
      {torches ? [0, 1, 2, 3, 4].map((i) => <Torch key={i} x={-160 + i * 620} y={440} seed={i * 3} />) : null}
    </Layer>
    <Layer d={1} cam={cam}>
      <rect x={-900} y={840} width={3800} height={600} fill={floor} />
      <path d="M -900 840 L 2900 840" stroke="#000" strokeOpacity={0.25} strokeWidth={6} />
    </Layer>
  </>
);
export const Throne: React.FC<{ x: number; y: number; s?: number; gold?: string; cloth?: string }> = ({ x, y, s = 1, gold = "#c9952e", cloth = "#7a1420" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-40} width={340} height={44} fill="#4a3038" />
    <path d="M -80 -40 L -80 -300 Q 0 -360 80 -300 L 80 -40 Z" fill={gold} />
    <path d="M -60 -50 L -60 -280 Q 0 -325 60 -280 L 60 -50 Z" fill={cloth} />
    <rect x={-100} y={-110} width={200} height={40} fill={gold} />
  </g>
);

// ---------- text helpers ----------
export const Title: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", width: "100%", textAlign: "center", ...style }}>{children}</div>
);
