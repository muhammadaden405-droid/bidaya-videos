import React from "react";
import { AbsoluteFill, random } from "remotion";
import { Outfit } from "../cartoon/Rig";
import { FOLK } from "../cartoon/Trailer";
import { LEPER_POOR, BALD_POOR, BLIND_POOR } from "./cast";
import { iv, ease, useShot, withHair, Vignette } from "./kit";

// Episode 3 — overhead shots (camera looking straight down) of the people keeping away from each man.
// Same scale as the side shots: shoulders ≈ 120 px, a house roof ≈ 1000 px, a market awning ≈ 560 px.
// Each man gets his own place: the leper on the village path, the bald man in the market, the blind man by the river.

const LINE = "#3a2a1e";
/** one person seen from above, facing angle a (degrees, 0 = +x) */
const TopPerson: React.FC<{ x: number; y: number; a: number; outfit: Outfit; step?: number; seated?: boolean; handOnHead?: boolean; cane?: number; pull?: boolean }> = ({ x, y, a, outfit: o0, step = 0, seated, handOnHead, cane, pull }) => {
  const o = withHair(o0);
  const sw = Math.sin(step) * 16;
  const bald = !o.hair && !o.wrap && !o.hood;
  const top = o.hood ?? o.wrap ?? (o.hair && (o.hairAmt ?? 1) > 0.3 ? o.hair : undefined);
  return (
    <g transform={`translate(${x} ${y}) scale(1.4)`}>
      <ellipse cx={12} cy={16} rx={66} ry={50} fill="#000" opacity={0.17} />
      <g transform={`rotate(${a})`}>
        {seated ? <ellipse cx={44} cy={0} rx={38} ry={44} fill={o.robeShade ?? o.robe} stroke={LINE} strokeWidth={4} /> : null}
        {!seated ? <><ellipse cx={-sw * 0.6} cy={-22} rx={20} ry={13} fill="#3a2a1e" opacity={0.75} /><ellipse cx={sw * 0.6} cy={22} rx={20} ry={13} fill="#3a2a1e" opacity={0.75} /></> : null}
        <ellipse cx={6 + sw} cy={-54} rx={24} ry={15} fill={o.robeShade ?? o.robe} stroke={LINE} strokeWidth={3} />
        {handOnHead ? null : <ellipse cx={6 - sw + (pull ? 30 : 0)} cy={54} rx={24} ry={15} fill={o.robeShade ?? o.robe} stroke={LINE} strokeWidth={3} />}
        <ellipse cx={0} cy={0} rx={36} ry={60} fill={o.robe} stroke={LINE} strokeWidth={4} />
        {o.sash ? <path d="M -20 -48 L 20 48" stroke={o.sash} strokeWidth={9} /> : null}
        {o.spots ? [[-10, -30], [12, 22], [-16, 30], [8, -12]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={5} fill="#c98a7a" opacity={0.8 * o.spots!} />) : null}
        <circle cx={9} cy={0} r={24} fill={o.skin} stroke={LINE} strokeWidth={3} />
        {top ? <circle cx={0} cy={0} r={27} fill={top} stroke={LINE} strokeWidth={3} /> : null}
        {bald ? <ellipse cx={-4} cy={-8} rx={11} ry={6} fill="#fff" opacity={0.45} transform="rotate(-30 -4 -8)" /> : null}
        {handOnHead ? <><path d="M 4 54 Q 30 40 10 8" stroke={o.robeShade ?? o.robe} strokeWidth={22} fill="none" strokeLinecap="round" /><circle cx={6} cy={4} r={12} fill={o.skin} stroke={LINE} strokeWidth={3} /></> : null}
        {cane !== undefined ? <line x1={20} y1={56} x2={120} y2={62 + cane} stroke="#5a3a22" strokeWidth={7} strokeLinecap="round" /> : null}
      </g>
    </g>
  );
};

type Walker = { y: number; dir: 1 | -1; v: number; t0: number; i: number; back?: number; x0?: number };
/** where a walker is at time t: straight along the lane, pushed out of a ring of radius R around (cx, cy);
 *  a "back" walker comes toward the man, stops at `back` px from him, turns round and goes back */
const posAt = (w: Walker, t: number, cx: number, cy: number, R: number): [number, number] => {
  const start = w.x0 ?? (w.dir > 0 ? -300 : 2220);
  let x: number;
  if (w.back !== undefined) {
    const stopX = cx - w.dir * w.back;
    const tStop = Math.abs(stopX - start) / w.v + w.t0;
    if (t < tStop) x = start + w.dir * w.v * (t - w.t0);
    else if (t < tStop + 22) x = stopX;
    else x = stopX - w.dir * w.v * 1.2 * (t - tStop - 22);
  } else x = start + w.dir * w.v * (t - w.t0);
  let y = w.y;
  const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1;
  const nd = Math.sqrt(d * d + R * R * 0.9 * Math.exp(-(d * d) / (R * R)));
  x = cx + (dx / d) * nd; y = cy + (dy / d) * nd;
  return [x, y];
};
const Walkers: React.FC<{ ws: Walker[]; t: number; cx: number; cy: number; R: number }> = ({ ws, t, cx, cy, R }) => (
  <>
    {ws.map((w, k) => {
      if (t < w.t0) return null;
      const [x, y] = posAt(w, t, cx, cy, R);
      const [px, py] = posAt(w, t - 1, cx, cy, R);
      const moving = Math.hypot(x - px, y - py) > 0.3;
      let a = moving ? (Math.atan2(y - py, x - px) * 180) / Math.PI : w.dir > 0 ? 0 : 180;
      if (!moving && w.back !== undefined) {
        // stopped: look at the man, then turn the back on him
        const [sx] = posAt(w, t, cx, cy, R);
        a = Math.abs(sx - cx) > 0 ? (w.dir > 0 ? 0 : 180) : a;
      }
      return <TopPerson key={k} x={x} y={y} a={a} outfit={FOLK(w.i)} step={moving ? t * 0.32 + k : 0} />;
    })}
  </>
);
const lanes = (seed: string, n: number, y0: number, y1: number, backs: number[] = []): Walker[] =>
  new Array(n).fill(0).map((_, k) => ({
    y: y0 + ((k + 0.5) / n) * (y1 - y0) + (random(`${seed}y${k}`) - 0.5) * 30,
    dir: (k % 2 ? -1 : 1) as 1 | -1,
    v: 4.2 + random(`${seed}v${k}`) * 1.6,
    t0: -Math.floor(random(`${seed}t${k}`) * 200) + (backs.includes(k) ? 60 : 0),
    i: k % 5,
    back: backs.includes(k) ? 300 : undefined,
  }));

/** a slow overhead camera (zoom and a little turn), with a clear reframe every 84 frames */
const useTop = (z0: number, z1: number, rot: number) => {
  const { frame, dur } = useShot();
  const seg = Math.floor(frame / 84);
  const f = frame - seg * 84;
  const z = (seg % 2 ? z1 : z0) * (1 + f * 0.0012);
  const r = (seg % 2 ? -rot : rot) + f * 0.03;
  return { frame, dur, tf: `translate(960 960) scale(${z}) rotate(${r}) translate(-960 -960)` };
};
const Svg: React.FC<{ tf: string; children: React.ReactNode }> = ({ tf, children }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1920" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <rect x={-2000} y={-2000} width={6000} height={6000} fill="#6fa84f" />
      <g transform={tf}>{children}</g>
    </svg>
    <Vignette s={0.45} />
  </AbsoluteFill>
);
const Grass: React.FC<{ seed: string }> = ({ seed }) => (
  <>{new Array(140).fill(0).map((_, i) => <circle key={i} cx={-600 + random(`${seed}gx${i}`) * 3100} cy={-600 + random(`${seed}gy${i}`) * 3100} r={6 + random(`${seed}gr${i}`) * 10} fill={i % 3 ? "#5f9a45" : "#86bf62"} opacity={0.7} />)}</>
);
const Canopy: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 170 }) => (
  <g><ellipse cx={x + 40} cy={y + 50} rx={r} ry={r * 0.9} fill="#000" opacity={0.18} /><circle cx={x} cy={y} r={r} fill="#3d7a35" /><circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.6} fill="#4f9142" /><circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.25} fill="#6aac55" /></g>
);
const Roof: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 1000, h = 760 }) => (
  <g><rect x={x - w / 2 + 40} y={y - h / 2 + 50} width={w} height={h} fill="#000" opacity={0.2} /><rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill="#c9a77a" stroke={LINE} strokeWidth={8} /><rect x={x - w / 2 + 30} y={y - h / 2 + 30} width={w - 60} height={h - 60} fill="#b8946a" /></g>
);
const Awning: React.FC<{ x: number; y: number; c: string }> = ({ x, y, c }) => (
  <g><rect x={x - 280 + 30} y={y - 150 + 40} width={560} height={300} fill="#000" opacity={0.2} /><rect x={x - 280} y={y - 150} width={560} height={300} fill={c} stroke={LINE} strokeWidth={6} />
    {[0, 1, 2, 3].map((k) => <rect key={k} x={x - 280 + k * 140 + 70} y={y - 150} width={70} height={300} fill="#fff" opacity={0.25} />)}</g>
);

/** "People kept away from him": the village path from above — everyone bends round the leper; two turn back */
export const LeperTop: React.FC = () => {
  const { frame, tf } = useTop(1.3, 1.6, 4);
  const ws = lanes("lt", 10, 560, 1360, [3, 6]);
  return (
    <Svg tf={tf}>
      <Grass seed="lt" />
      <rect x={-800} y={720} width={3500} height={480} fill="#cdb488" />
      <Roof x={300} y={260} /><Roof x={1450} y={240} w={900} /><Roof x={600} y={1700} /><Canopy x={1700} y={1560} />
      <TopPerson x={960} y={960} a={90} outfit={LEPER_POOR} seated />
      <Walkers ws={ws} t={frame + 40} cx={960} cy={960} R={400} />
    </Svg>
  );
};
/** "People turned away from him": the market from above — the crowd round the bald man turn their backs and walk off */
export const BaldTop: React.FC = () => {
  const { frame, tf } = useTop(1.3, 1.6, -5);
  const turn = 26;
  const ring = [0, 1, 2, 3, 4, 5, 6];
  return (
    <Svg tf={tf}>
      <Grass seed="bt" />
      <rect x={-800} y={640} width={3500} height={640} fill="#d2bb90" />
      {[-140, 460, 1060, 1660, 2260].map((x, k) => <Awning key={k} x={x} y={480} c={["#b5452f", "#2f6f8f", "#c48a2a", "#7a4a8a", "#3f7a4a"][k]} />)}
      {[160, 760, 1360, 1960].map((x, k) => <Awning key={k} x={x} y={1440} c={["#2f6f8f", "#c48a2a", "#b5452f", "#3f7a4a"][k]} />)}
      <TopPerson x={960} y={960} a={-90} outfit={BALD_POOR} handOnHead />
      {ring.map((k) => {
        const ang = (k / ring.length) * Math.PI * 2 + 0.3;
        const r = 300 + iv(frame, [turn + 10 + k * 3, turn + 90 + k * 3], [0, 520]);
        const x = 960 + Math.cos(ang) * r, y = 960 + Math.sin(ang) * r * 0.9;
        const face = (ang * 180) / Math.PI + 180; // looking at him
        const a = face + iv(frame, [turn + k * 3, turn + 10 + k * 3], [0, 180], ease);
        const walking = frame > turn + 10 + k * 3;
        return <TopPerson key={k} x={x} y={y} a={a} outfit={FOLK(k % 5)} step={walking ? frame * 0.32 + k : 0} />;
      })}
    </Svg>
  );
};
/** "The third man was blind": the river path from above — he taps his way along; people step wide around him */
export const BlindTop: React.FC = () => {
  const { frame, tf } = useTop(1.35, 1.6, 3);
  const bx = 860 + frame * 1.2;
  const ws: Walker[] = [
    { y: 990, dir: -1, v: 5, t0: -60, i: 1 },
    { y: 940, dir: -1, v: 4.6, t0: -110, i: 3 },
    { y: 1020, dir: 1, v: 5.4, t0: -40, i: 0, x0: -400 },
    { y: 960, dir: -1, v: 4.8, t0: 0, i: 4, back: 280 },
  ];
  return (
    <Svg tf={tf}>
      <Grass seed="bl" />
      <rect x={-800} y={380} width={3500} height={260} fill="#4f8fbf" />
      {new Array(18).fill(0).map((_, i) => <rect key={i} x={((random(`gl${i}`) * 3200 + frame * 3) % 3200) - 700} y={410 + random(`gy${i}`) * 200} width={70} height={5} rx={2} fill="#cfe6f5" opacity={0.6} />)}
      <rect x={-800} y={860} width={3500} height={220} fill="#cdb488" />
      <Canopy x={420} y={1420} r={190} /><Canopy x={1560} y={1500} /><Canopy x={1900} y={1250} r={140} />
      <TopPerson x={bx} y={970} a={0} outfit={BLIND_POOR} step={frame * 0.18} cane={Math.sin(frame * 0.3) * 30} />
      <Walkers ws={ws} t={frame} cx={bx} cy={970} R={360} />
    </Svg>
  );
};
