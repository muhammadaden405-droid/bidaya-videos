import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Pose, Outfit, STAND } from "../cartoon/Rig";

// Episode 1 v2 kit. Every scene is painted on a SQUARE 1920×1920 world. The 16:9 film shows the
// middle band (y 420–1500); the 9:16 film shows the middle column (x 420–1500). Subjects live in the
// central square, so both versions are composed natively — nothing important is ever cropped.

export const WW = 1920;
export const WH = 1920;
export const C = 960; // world centre
export type Cam = { x: number; y: number; zoom: number };
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const iv = (f: number, a: number[], b: number[], e?: (t: number) => number) => {
  const r = a.slice();
  for (let i = 1; i < r.length; i++) if (!(r[i] > r[i - 1])) r[i] = r[i - 1] + 0.01;
  return interpolate(f, r, b, e ? { ...clamp, easing: e } : clamp);
};
export const ease = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);

export const useView = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return { vertical, vw: vertical ? 1080 : 1920, vh: vertical ? 1920 : 1080, ox: vertical ? 420 : 0, oy: vertical ? 0 : 420, scale: width / (vertical ? 1080 : 1920) };
};
export const useShot = () => {
  const frame = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();
  return { frame, dur, p: Math.min(1, frame / Math.max(1, dur - 1)) };
};
export const lerpCam = (t: number, a: Cam, b: Cam, e: (t: number) => number = ease): Cam => {
  const k = e(Math.max(0, Math.min(1, t)));
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, zoom: a.zoom + (b.zoom - a.zoom) * k };
};
// camera shake that decays after each hit frame
export const shakeAt = (frame: number, hits: number[], amp = 18) => {
  let x = 0, y = 0;
  for (const h of hits) {
    const d = frame - h;
    if (d >= 0 && d < 20) {
      const k = amp * Math.exp(-d / 5);
      x += k * Math.sin(d * 2.7 + h);
      y += k * Math.cos(d * 3.3 + h);
    }
  }
  return { x, y };
};

// A depth layer. d: 0 = sky (doesn't move), 1 = the ground plane the action is on, >1 foreground.
export const Layer: React.FC<{ d: number; cam: Cam; children: React.ReactNode; blur?: number; opacity?: number }> = ({ d, cam, children, blur, opacity }) => {
  const { vw, vh, ox, oy, scale } = useView();
  const s = 1 + (cam.zoom - 1) * d;
  return (
    <AbsoluteFill style={{ transform: `translate(${-cam.x * d * scale}px, ${-cam.y * d * scale}px) scale(${s})`, transformOrigin: "50% 55%", filter: blur ? `blur(${blur * scale}px)` : undefined, opacity }}>
      <svg viewBox={`${ox} ${oy} ${vw} ${vh}`} width="100%" height="100%" style={{ overflow: "visible" }} preserveAspectRatio="xMidYMid slice">{children}</svg>
    </AbsoluteFill>
  );
};

// ---------- painting helpers ----------
export const ridge = (seed: string, y: number, amp: number, step: number, from = -1400, to = 3400, smooth = true) => {
  let d = `M ${from} ${WH + 800} L ${from} ${y}`;
  let px = from, py = y;
  for (let x = from; x <= to; x += step) {
    const ny = y - random(`${seed}${x}`) * amp;
    d += smooth ? ` Q ${px + step / 2} ${py - amp * 0.15} ${x} ${ny}` : ` L ${x} ${ny}`;
    px = x; py = ny;
  }
  return d + ` L ${to} ${WH + 800} Z`;
};
export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="glowW"><stop offset="0" stopColor="#fff4d6" stopOpacity={0.9} /><stop offset="1" stopColor="#fff4d6" stopOpacity={0} /></radialGradient>
    <radialGradient id="glowO"><stop offset="0" stopColor="#ffb347" stopOpacity={0.8} /><stop offset="1" stopColor="#ff7a1a" stopOpacity={0} /></radialGradient>
    <radialGradient id="glowR"><stop offset="0" stopColor="#ff6a2a" stopOpacity={0.7} /><stop offset="1" stopColor="#ff3a10" stopOpacity={0} /></radialGradient>
    <linearGradient id="shadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.18} /><stop offset="0.5" stopColor="#fff" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.3} /></linearGradient>
    <linearGradient id="shadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity={0.28} /><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#fff" stopOpacity={0.12} /></linearGradient>
  </defs>
);
export const Glow: React.FC<{ x: number; y: number; r: number; id?: "glowW" | "glowO" | "glowR"; o?: number }> = ({ x, y, r, id = "glowW", o = 1 }) => <circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={o} />;

export const Sky: React.FC<{ stops: [number, string][] }> = ({ stops }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${stops.map(([p, c]) => `${c} ${p}%`).join(", ")})` }} />
);
export const SKIES = {
  dawn: [[0, "#120f2a"], [30, "#3b2a55"], [52, "#a0566a"], [66, "#f0965e"], [74, "#ffd08a"], [100, "#ffe6b0"]] as [number, string][],
  dusk: [[0, "#0f0b1e"], [35, "#3a1d3c"], [55, "#8f3a42"], [68, "#e0703e"], [76, "#ffb86a"], [100, "#ffd9a0"]] as [number, string][],
  night: [[0, "#03040c"], [40, "#0b1230"], [70, "#1a2550"], [100, "#2a3260"]] as [number, string][],
  fire: [[0, "#06030a"], [40, "#1c0810"], [62, "#5a1410"], [74, "#b8401a"], [100, "#2a0a08"]] as [number, string][],
  day: [[0, "#3f7fb8"], [45, "#8cc0e0"], [72, "#f0dcb0"], [100, "#f5e2b8"]] as [number, string][],
  palace: [[0, "#120a14"], [100, "#2a1622"]] as [number, string][],
};

export const Stars: React.FC<{ n?: number; seed?: string }> = ({ n = 160, seed = "s" }) => {
  const frame = useCurrentFrame();
  return <g>{new Array(n).fill(0).map((_, i) => <circle key={i} cx={random(`${seed}x${i}`) * 2400 - 240} cy={random(`${seed}y${i}`) * 1100} r={0.8 + random(`${seed}r${i}`) * 2} fill="#fff8e1" opacity={0.3 + 0.7 * Math.abs(Math.sin(frame * 0.04 + i * 1.7))} />)}</g>;
};
export const Dust: React.FC<{ n?: number; color?: string; y0?: number; y1?: number; drift?: number; seed?: string; size?: number; opacity?: number }> = ({ n = 40, color = "#f6d9a8", y0 = 400, y1 = 1600, drift = 0.6, seed = "d", size = 3, opacity = 0.5 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const x = ((random(`${seed}x${i}`) * 2600 + frame * drift * (0.5 + random(`${seed}v${i}`))) % 2600 + 2600) % 2600 - 340;
        const y = y0 + random(`${seed}y${i}`) * (y1 - y0) + Math.sin(frame * 0.03 + i) * 14;
        return <circle key={i} cx={x} cy={y} r={size * (0.5 + random(`${seed}r${i}`))} fill={color} opacity={opacity * (0.4 + 0.6 * Math.abs(Math.sin(frame * 0.02 + i)))} />;
      })}
    </g>
  );
};
// a burst of dust when something heavy lands (at frame `at`)
export const DustBurst: React.FC<{ x: number; y: number; at: number; size?: number; color?: string }> = ({ x, y, at, size = 1, color = "#e8c89a" }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 70) return null;
  return (
    <g>
      {new Array(22).fill(0).map((_, i) => {
        const a = (i / 22) * Math.PI + random(`db${i}`) * 0.3;
        const sp = (4 + random(`dv${i}`) * 7) * size;
        const r = (30 + t * 1.6) * size * (0.6 + random(`dr${i}`) * 0.6);
        return <circle key={i} cx={x + Math.cos(a) * sp * t * (i % 2 ? 1 : -1)} cy={y - Math.sin(a) * sp * t * 0.35} r={r} fill={color} opacity={0.55 * (1 - t / 70)} />;
      })}
    </g>
  );
};
export const Embers: React.FC<{ n?: number; x0?: number; x1?: number; base?: number; seed?: string; speed?: number }> = ({ n = 60, x0 = 0, x1 = WW, base = 1300, seed = "em", speed = 7 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const life = 100;
        const age = (frame + i * 17) % life;
        return <circle key={i} cx={x0 + random(`${seed}${i}`) * (x1 - x0) + Math.sin((age + i) * 0.08) * 30} cy={base - age * speed} r={1.5 + random(`${seed}r${i}`) * 3} fill="#ffc46b" opacity={(1 - age / life) * 0.95} />;
      })}
    </g>
  );
};
export const Grade: React.FC<{ color: string; opacity: number; mode?: React.CSSProperties["mixBlendMode"] }> = ({ color, opacity, mode = "soft-light" }) => (
  <AbsoluteFill style={{ backgroundColor: color, opacity, mixBlendMode: mode, pointerEvents: "none" }} />
);
export const Vignette: React.FC<{ s?: number }> = ({ s = 0.6 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${s}) 100%)`, pointerEvents: "none" }} />
);
export const Flash: React.FC<{ at: number; len?: number; color?: string; max?: number }> = ({ at, len = 8, color = "#fff2d8", max = 0.8 }) => {
  const frame = useCurrentFrame();
  const o = iv(frame, [at, at + 1, at + len], [0, max, 0]);
  return o > 0 ? <AbsoluteFill style={{ backgroundColor: color, opacity: o }} /> : null;
};

// ---------- people (faceless; stroked cartoon style, cloth secondary motion) ----------
const INK = "#1b100c";
const LimbP: React.FC<{ x: number; y: number; a1: number; a2: number; l1: number; l2: number; w: number; color: string; end?: React.ReactNode }> = ({ x, y, a1, a2, l1, l2, w, color, end }) => (
  <g transform={`translate(${x} ${y}) rotate(${a1})`}>
    <line x1={0} y1={0} x2={0} y2={l1} stroke={INK} strokeWidth={w + 6} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={l1} stroke={color} strokeWidth={w} strokeLinecap="round" />
    <g transform={`translate(0 ${l1}) rotate(${a2})`}>
      <line x1={0} y1={0} x2={0} y2={l2} stroke={INK} strokeWidth={w * 0.9 + 6} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={l2} stroke={color} strokeWidth={w * 0.9} strokeLinecap="round" />
      <g transform={`translate(0 ${l2})`}>{end}</g>
    </g>
  </g>
);
export type Prop = "spear" | "axe" | "hook" | "staff" | "none";
// Person2: ~300 px tall at scale 1, feet at (0,0), faces +x unless flipped.
export const Person2: React.FC<{ pose?: Pose; outfit: Outfit; flip?: boolean; sway?: number; prop?: Prop; bald?: boolean; light?: string; silhouette?: string }> = ({ pose = STAND, outfit, flip, sway = 0, prop = "none", bald, light = "#fff", silhouette }) => {
  const p = pose;
  const sil = silhouette;
  const skin = sil ?? outfit.skin;
  const robe = sil ?? outfit.robe;
  const shade = sil ?? outfit.robeShade;
  const dark = sil ?? "#2b1d18";
  const hand = <circle cx={0} cy={4} r={8} fill={skin} stroke={INK} strokeWidth={3} />;
  const propEl =
    prop === "spear" ? (
      <g transform={`rotate(${-(p.armRU + p.armRL)})`}>
        <line x1={0} y1={90} x2={0} y2={-230} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <line x1={0} y1={90} x2={0} y2={-230} stroke={sil ?? "#6a4428"} strokeWidth={5} strokeLinecap="round" />
        <path d="M -11 -226 L 0 -268 L 11 -226 Z" fill={sil ?? "#d8d2c4"} stroke={INK} strokeWidth={3} />
      </g>
    ) : prop === "axe" ? (
      <g transform={`rotate(${-(p.armRU + p.armRL) + 90})`}>
        <line x1={-20} y1={0} x2={110} y2={0} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <line x1={-20} y1={0} x2={110} y2={0} stroke={sil ?? "#6a4428"} strokeWidth={5} strokeLinecap="round" />
        <path d="M 96 -6 Q 132 -40 140 -2 Q 132 36 96 6 Z" fill={sil ?? "#b8b4ac"} stroke={INK} strokeWidth={3} />
      </g>
    ) : prop === "hook" ? (
      <g transform={`rotate(${-(p.armRU + p.armRL) + 90})`}>
        <line x1={-10} y1={0} x2={120} y2={0} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        <line x1={-10} y1={0} x2={120} y2={0} stroke={sil ?? "#6a4428"} strokeWidth={4} strokeLinecap="round" />
        <path d="M 120 0 Q 150 0 148 24 Q 146 40 130 36" stroke={sil ?? "#b8b4ac"} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
    ) : prop === "staff" ? (
      <g transform={`rotate(${-(p.armRU + p.armRL)})`}><line x1={0} y1={110} x2={0} y2={-120} stroke={sil ?? "#5a3a22"} strokeWidth={7} strokeLinecap="round" /></g>
    ) : null;
  const hem = Math.sin(sway) * 6;
  return (
    <g transform={`scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx={0} cy={4} rx={56} ry={10} fill="#000" opacity={0.22} />
      <g transform={`translate(0 ${p.bob}) rotate(${p.lean} 0 -130)`}>
        <LimbP x={-5} y={-220} a1={p.armLU} a2={p.armLL} l1={58} l2={54} w={17} color={shade} end={hand} />
        <LimbP x={-11} y={-116} a1={p.legLU} a2={p.legLL} l1={60} l2={56} w={19} color={dark} end={<ellipse cx={7} cy={4} rx={16} ry={8} fill={dark} stroke={INK} strokeWidth={3} />} />
        <LimbP x={11} y={-116} a1={p.legRU} a2={p.legRL} l1={60} l2={56} w={19} color={dark} end={<ellipse cx={7} cy={4} rx={16} ry={8} fill={dark} stroke={INK} strokeWidth={3} />} />
        {outfit.cape ? <path d={`M -34 -226 Q ${-70 + hem} -140 ${-58 + hem * 1.5} -70 L 30 -84 L 34 -226 Z`} fill={sil ?? outfit.cape} stroke={INK} strokeWidth={4} /> : null}
        <path d={`M -34 -232 Q 0 -244 34 -232 L ${46 + hem} -70 Q 0 ${-60 + hem * 0.3} ${-46 + hem} -70 Z`} fill={robe} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {sil ? null : <path d={`M -34 -232 Q 0 -244 34 -232 L ${46 + hem} -70 Q 0 ${-60 + hem * 0.3} ${-46 + hem} -70 Z`} fill="url(#shadeH)" />}
        <rect x={-38} y={-160} width={76} height={12} rx={5} fill={shade} stroke={INK} strokeWidth={3} />
        <g transform={`translate(0 -262) rotate(${p.head})`}>
          <circle cx={0} cy={0} r={33} fill={skin} stroke={INK} strokeWidth={5} />
          {sil ? null : <circle cx={8} cy={-8} r={33} fill={light} opacity={0.08} />}
          {!bald && outfit.wrap ? (
            <>
              <path d="M -36 -2 Q -38 -44 0 -46 Q 38 -44 36 -2 Q 0 -16 -36 -2 Z" fill={sil ?? outfit.wrap} stroke={INK} strokeWidth={4} />
              <path d={`M -30 -6 Q ${-56 + hem} 24 ${-44 + hem * 1.4} 56 L -34 54 Q -40 24 -22 0 Z`} fill={sil ?? outfit.wrap} stroke={INK} strokeWidth={4} />
            </>
          ) : null}
          {outfit.crown ? <path d="M -28 -28 L -28 -56 L -15 -42 L 0 -62 L 15 -42 L 28 -56 L 28 -28 Z" fill={sil ?? "#e3b341"} stroke={INK} strokeWidth={4} /> : null}
        </g>
        <LimbP x={6} y={-220} a1={p.armRU} a2={p.armRL} l1={58} l2={54} w={18} color={robe} end={<>{propEl}{hand}</>} />
        {outfit.shield ? <ellipse cx={-34} cy={-170} rx={34} ry={42} fill={sil ?? outfit.shield} stroke={INK} strokeWidth={5} /> : null}
      </g>
    </g>
  );
};
export const Fig: React.FC<{ x: number; y: number; s?: number; sx?: number; sy?: number; o?: number } & React.ComponentProps<typeof Person2>> = ({ x, y, s = 1, sx = 1, sy = 1, o = 1, ...rest }) => (
  <g transform={`translate(${x} ${y}) scale(${s * sx} ${s * sy})`} opacity={o}><Person2 {...rest} /></g>
);

// ---------- the elephant ----------
// Side view, ~560 px tall at scale 1, feet at y=0, facing LEFT (head toward -x).
// kneel 0..1 folds the front legs at the knee, drops and pitches the body; walk = gait phase (radians).
export const Elephant2: React.FC<{ walk?: number; gait?: number; kneel?: number; ear?: number; trunk?: number; trunkUp?: number; skin?: string; silhouette?: string; driver?: React.ReactNode }> = ({ walk = 0, gait = 0, kneel = 0, ear = 0, trunk = 0, trunkUp = 0, skin = "#8d8580", silhouette, driver }) => {
  const sil = silhouette;
  const S = sil ?? skin;
  const D = sil ?? "#6c635e";
  const L = sil ?? "#a39b95";
  const k = Math.max(0, Math.min(1, kneel));
  const g = gait * (1 - k);
  // leg: hip at (hx, hy), upper/lower lengths, angles; front legs fold with kneel
  const leg = (hx: number, ph: number, front: boolean, col: string) => {
    const sw = Math.sin(walk + ph) * 18 * g;
    const lift = Math.max(0, Math.sin(walk + ph + 1.2)) * 26 * g;
    // knees point forward (−x): thigh swings forward, shin folds back under the body
    const a1 = sw + (front ? 28 * k : 22 * k);
    const a2 = -lift + (front ? -122 * k : -58 * k);
    return (
      <g transform={`translate(${hx} -190) rotate(${a1})`}>
        <rect x={-34} y={-10} width={68} height={112} rx={30} fill={col} stroke={INK} strokeWidth={6} />
        <g transform={`translate(0 96) rotate(${a2})`}>
          <rect x={-30} y={-6} width={60} height={104} rx={26} fill={col} stroke={INK} strokeWidth={6} />
          <path d="M -30 92 Q 0 108 30 92 L 30 98 Q 0 112 -30 98 Z" fill={sil ?? "#e7ddd0"} />
          {[-16, 0, 16].map((t) => <ellipse key={t} cx={t} cy={98} rx={7} ry={5} fill={sil ?? "#f1e9de"} />)}
        </g>
      </g>
    );
  };
  // the body sinks by about the folded leg height and pitches nose-down
  // rear legs fold a little (−26 px), front legs fold until the knees touch the ground (−116 px):
  // the body drops at the rear and pitches nose-down about the rear hip
  const drop = 26 * k;
  const pitch = 16.5 * k;
  const bob = -Math.abs(Math.sin(walk)) * 8 * g;
  // trunk as a chain of segments hanging from the face; curls forward at the tip, lifts with trunkUp
  const segs = 10;
  let tx = -378, ty = -372;
  let th = 96 + trunkUp * 70; // degrees: 90 = straight down, 180 = forward (−x)
  const pts: [number, number][] = [[tx, ty]];
  for (let i = 0; i < segs; i++) {
    th += (i / segs) * (5 + trunk * 9 + trunkUp * 12 + k * 20) + Math.sin(walk * 0.5 + i * 0.6) * 1.5;
    const r = (th * Math.PI) / 180;
    tx += Math.cos(r) * 27;
    ty += Math.sin(r) * 27;
    pts.push([tx, ty]);
  }
  const trunkPath = pts.map((q, i) => `${i ? "L" : "M"} ${q[0]} ${q[1]}`).join(" ");
  const earA = ear * 18;
  return (
    <g>
      <ellipse cx={0} cy={6} rx={300 + k * 40} ry={26} fill="#000" opacity={0.25} />
      <g transform={`translate(0 ${drop + bob}) rotate(${-pitch} 150 -190)`}>
        {leg(150, Math.PI, false, D)}
        {leg(-150, 0, true, D)}
        {/* tail */}
        <path d={`M 270 -360 Q 310 -320 ${300 + Math.sin(walk * 0.7) * 14} -250`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={`M 270 -360 Q 310 -320 ${300 + Math.sin(walk * 0.7) * 14} -250`} stroke={D} strokeWidth={7} fill="none" strokeLinecap="round" />
        {/* body */}
        <path d="M -230 -300 Q -250 -470 -40 -490 Q 200 -500 280 -390 Q 320 -300 270 -210 Q 120 -160 -150 -180 Q -240 -200 -230 -300 Z" fill={S} stroke={INK} strokeWidth={7} />
        {sil ? null : <path d="M -230 -300 Q -250 -470 -40 -490 Q 200 -500 280 -390 Q 320 -300 270 -210 Q 120 -160 -150 -180 Q -240 -200 -230 -300 Z" fill="url(#shadeV)" />}
        {/* caparison (war blanket) */}
        <path d="M -120 -470 Q 60 -500 220 -455 L 210 -270 Q 50 -240 -110 -265 Z" fill={sil ?? "#7a1a1a"} stroke={INK} strokeWidth={6} />
        {sil ? null : <>
          <path d="M -116 -300 Q 50 -276 212 -306" stroke="#e3b341" strokeWidth={10} fill="none" />
          <path d="M -120 -470 Q 60 -500 220 -455" stroke="#e3b341" strokeWidth={8} fill="none" />
          {[-80, -20, 40, 100, 160].map((x) => <circle key={x} cx={x} cy={-284 + Math.abs(x - 50) * 0.08} r={9} fill="#e3b341" stroke={INK} strokeWidth={2} />)}
        </>}
        {leg(120, 0, false, S)}
        {leg(-170, Math.PI, true, S)}
        {/* head */}
        <path d="M -200 -420 Q -260 -520 -350 -470 Q -420 -420 -380 -330 Q -350 -280 -300 -300 Q -230 -320 -200 -420 Z" fill={S} stroke={INK} strokeWidth={7} />
        {/* trunk */}
        <path d={trunkPath} stroke={INK} strokeWidth={66} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={trunkPath} stroke={S} strokeWidth={54} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {sil ? null : <path d={trunkPath} stroke={L} strokeWidth={6} strokeDasharray="4 22" fill="none" opacity={0.6} />}
        {/* tusk */}
        <path d="M -330 -320 Q -400 -290 -420 -340" stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" />
        <path d="M -330 -320 Q -400 -290 -420 -340" stroke={sil ?? "#f4ecdc"} strokeWidth={14} fill="none" strokeLinecap="round" />
        {/* eye */}
        {sil ? null : <><ellipse cx={-322} cy={-410} rx={9} ry={7} fill="#1a1210" /><circle cx={-319} cy={-413} r={2.5} fill="#fff" opacity={0.8} /></>}
        {/* ear */}
        <g transform={`rotate(${earA} -250 -440)`}>
          <path d="M -250 -460 Q -150 -500 -120 -400 Q -110 -300 -190 -280 Q -250 -300 -250 -460 Z" fill={D} stroke={INK} strokeWidth={6} />
        </g>
        {/* head plate */}
        {sil ? null : <path d="M -290 -500 Q -250 -520 -215 -480 L -250 -440 Z" fill="#e3b341" stroke={INK} strokeWidth={4} />}
        {driver ? <g transform="translate(-175 -418)">{driver}</g> : null}
      </g>
    </g>
  );
};

// ---------- architecture & vehicles ----------
export const Kaaba2: React.FC<{ x: number; y: number; s?: number; night?: boolean }> = ({ x, y, s = 1, night }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={20} cy={4} rx={200} ry={22} fill="#000" opacity={0.25} />
    <rect x={-90} y={-170} width={180} height={170} fill="#111" stroke={INK} strokeWidth={4} />
    <path d="M 90 -170 L 135 -196 L 135 -26 L 90 0 Z" fill="#060606" />
    <path d="M -90 -170 L -45 -196 L 135 -196 L 90 -170 Z" fill={night ? "#1d1d24" : "#262626"} />
    <rect x={-90} y={-128} width={180} height={16} fill="#c9a24a" />
    <path d="M 90 -128 L 135 -154 L 135 -138 L 90 -112 Z" fill="#a8842e" />
    <rect x={18} y={-96} width={40} height={74} fill="#c9a24a" />
  </g>
);
export const Ship2: React.FC<{ rock: number; s?: number; sail?: string; sil?: string }> = ({ rock, s = 1, sail = "#efe3c8", sil }) => (
  <g transform={`scale(${s}) rotate(${rock})`}>
    <path d="M -190 0 Q -175 56 -110 66 L 130 66 Q 186 54 200 -12 Z" fill={sil ?? "#5a3a22"} stroke={INK} strokeWidth={5} />
    <line x1={0} y1={-10} x2={0} y2={-290} stroke={sil ?? "#3a2416"} strokeWidth={9} />
    <path d="M 6 -280 Q 140 -190 6 -40 Z" fill={sil ?? sail} stroke={INK} strokeWidth={4} />
    <path d="M 0 -294 L 46 -282 L 0 -270 Z" fill={sil ?? "#8f2a1c"} />
    {[-120, -70, -20, 30, 80].map((x) => <line key={x} x1={x} y1={44} x2={x - 44} y2={104} stroke={sil ?? "#3a2416"} strokeWidth={5} />)}
  </g>
);
export const Horse2: React.FC<{ phase: number; gallop?: number; color?: string; rider?: React.ReactNode; flip?: boolean; sil?: string }> = ({ phase, gallop = 1, color = "#5a3a26", rider, flip, sil }) => {
  const c = sil ?? color;
  const dk = sil ?? "#3a2416";
  const leg = (x: number, off: number, col: string) => {
    const a = Math.sin(phase + off) * 34 * gallop;
    const b = Math.max(0, Math.sin(phase + off + 1)) * 50 * gallop;
    return (
      <g transform={`translate(${x} -130) rotate(${a})`}>
        <rect x={-10} y={0} width={20} height={66} rx={9} fill={col} stroke={INK} strokeWidth={4} />
        <g transform={`translate(0 62) rotate(${-b})`}><rect x={-8} y={0} width={16} height={62} rx={7} fill={col} stroke={INK} strokeWidth={4} /></g>
      </g>
    );
  };
  const bob = -Math.abs(Math.sin(phase)) * 10 * gallop;
  return (
    <g transform={`scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx={0} cy={4} rx={120} ry={12} fill="#000" opacity={0.2} />
      <g transform={`translate(0 ${bob}) rotate(${Math.sin(phase) * 3 * gallop})`}>
        {leg(-64, Math.PI, dk)}
        {leg(60, 0.6, dk)}
        <path d={`M -100 -184 Q -150 -160 ${-160 + Math.sin(phase) * 14} -96`} stroke={dk} strokeWidth={16} fill="none" strokeLinecap="round" />
        <ellipse cx={0} cy={-160} rx={108} ry={48} fill={c} stroke={INK} strokeWidth={5} />
        <path d="M 74 -180 Q 104 -250 134 -276 L 168 -262 Q 158 -226 116 -158 Z" fill={c} stroke={INK} strokeWidth={5} />
        <path d="M 126 -282 Q 184 -276 200 -244 Q 194 -228 172 -232 L 146 -248 Z" fill={c} stroke={INK} strokeWidth={5} />
        <path d={`M 78 -186 Q ${96 + Math.sin(phase) * 6} -250 128 -280`} stroke={dk} strokeWidth={12} fill="none" />
        {leg(-48, 0, c)}
        {leg(74, Math.PI + 0.6, c)}
        {rider ? <g transform="translate(-6 -160)">{rider}</g> : null}
      </g>
    </g>
  );
};
export const Torch2: React.FC<{ x: number; y: number; seed: number; s?: number }> = ({ x, y, seed, s = 1 }) => {
  const frame = useCurrentFrame();
  const f = 1 + 0.14 * Math.sin(frame * 0.5 + seed) + 0.07 * Math.sin(frame * 1.3 + seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-30} r={220 * f} fill="url(#glowO)" opacity={0.5} />
      <rect x={-7} y={-20} width={14} height={70} fill="#3a2416" stroke={INK} strokeWidth={3} />
      <path d={`M -16 -20 Q 0 ${-80 * f} 16 -20 Z`} fill="#ffb347" />
      <path d={`M -8 -20 Q 0 ${-50 * f} 8 -20 Z`} fill="#fff1b8" />
    </g>
  );
};
