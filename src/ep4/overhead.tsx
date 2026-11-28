import React from "react";
import { AbsoluteFill, random } from "remotion";
import { iv, ease, useShot, useView, useL, Vignette } from "./kit";
import { OLD, NEPHEW, ACCUSED, ELDER } from "./cast";
import { FOLK } from "../cartoon/Trailer";

// Episode 4 — overhead (drone, straight down) shots of the town square. People from above: shoulders + head
// (no faces). The dead man lies in the middle, wrapped in his cloth. The camera turns and sinks slowly.
const W = 1920, H = 1920, CX = 960, CY = 960;
type Dot = { x: number; y: number; robe: string; head: string; s?: number; rot?: number };
const Person: React.FC<Dot> = ({ x, y, robe, head, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={14} cy={16} rx={46} ry={30} fill="#000" opacity={0.22} />
    <ellipse cx={0} cy={0} rx={46} ry={28} fill={robe} stroke="#2b1d18" strokeWidth={4} />
    <circle cx={0} cy={-2} r={22} fill={head} stroke="#2b1d18" strokeWidth={4} />
    <path d="M -14 -10 Q 0 -18 14 -10" stroke="#2b1d18" strokeWidth={3} fill="none" opacity={0.5} />
  </g>
);
const BodyTop: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-150} y={-38} width={300} height={76} rx={34} fill="#000" opacity={0.2} transform="translate(12 12)" />
    <rect x={-150} y={-38} width={300} height={76} rx={34} fill="#e9e2d2" stroke="#3a2a1e" strokeWidth={5} />
    {[-80, -10, 60].map((fx) => <line key={fx} x1={fx} y1={-34} x2={fx + 10} y2={34} stroke="#c9bfa8" strokeWidth={5} />)}
    <circle cx={-150} cy={0} r={30} fill={OLD.wrap} stroke="#3a2a1e" strokeWidth={4} />
  </g>
);
/** the square from above: packed sand, stones, and flat roofs (with their wooden beams) all round the edge */
const Square: React.FC<{ seed: string; dusk?: boolean }> = ({ seed, dusk }) => (
  <g>
    <rect x={-800} y={-800} width={W + 1600} height={H + 1600} fill={dusk ? "#b88f70" : "#d4b383"} />
    {new Array(160).fill(0).map((_, i) => <ellipse key={i} cx={random(`${seed}x${i}`) * (W + 1200) - 600} cy={random(`${seed}y${i}`) * (H + 1200) - 600} rx={6 + random(`${seed}r${i}`) * 14} ry={4 + random(`${seed}q${i}`) * 8} fill="#a88a62" opacity={0.6} />)}
    {new Array(14).fill(0).map((_, i) => {
      const a = (i / 14) * Math.PI * 2, r = 1050 + random(`${seed}rr${i}`) * 160;
      const x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r, w = 380 + random(`${seed}w${i}`) * 200;
      return (
        <g key={`h${i}`} transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI + 90})`}>
          <rect x={-w / 2 + 30} y={-150} width={w} height={340} fill="#000" opacity={0.22} />
          <rect x={-w / 2} y={-180} width={w} height={340} rx={10} fill={["#d9b98a", "#cfa978", "#e0c39a"][i % 3]} stroke="#5a3e28" strokeWidth={6} />
          <rect x={-w / 2 + 20} y={-160} width={w - 40} height={300} rx={6} fill="none" stroke="#b88e5c" strokeWidth={10} />
          {new Array(5).fill(0).map((_, k) => <rect key={k} x={-w / 2 + 40 + k * ((w - 80) / 4)} y={-188} width={16} height={22} fill="#6b4628" />)}
        </g>
      );
    })}
  </g>
);
const ring = (n: number, r: number, seed: string, cx = CX, cy = CY): Dot[] =>
  new Array(n).fill(0).map((_, i) => {
    const a = (i / n) * Math.PI * 2 + random(`${seed}a${i}`) * 0.2, rr = r + (random(`${seed}r${i}`) - 0.5) * 70;
    const o = FOLK(i + 2);
    const turban = ["#efe6d2", "#d8ccb0", "#f6f1e6", "#c9b48a", "#e6dcc4", "#8a6a48"][Math.floor(random(`${seed}t${i}`) * 6)];
    return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, robe: o.robe, head: o.wrap ?? turban, rot: (a * 180) / Math.PI + 90 };
  });
const Drone: React.FC<{ rot0: number; rot1: number; z0: number; z1: number; children: React.ReactNode }> = ({ rot0, rot1, z0, z1, children }) => {
  const { frame, dur } = useShot(); const { vertical } = useView();
  const t = ease(Math.min(1, frame / Math.max(1, dur)));
  const rot = rot0 + (rot1 - rot0) * t, z = (z0 + (z1 - z0) * t) * (vertical ? 1.15 : 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#d4b383" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <g transform={`translate(${CX} ${CY}) rotate(${rot}) scale(${z}) translate(${-CX} ${-CY})`}>{children}</g>
      </svg>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};
/** "The crowd splits in two." — seen from above, the townspeople pull back to two sides of the body */
export const TopSplit: React.FC = () => {
  const { frame, dur } = useShot();
  const k = iv(frame, [4, dur - 6], [0, 1], ease);
  const left = ring(16, 420, "tsl").map((d) => ({ ...d, x: d.x - 40 - k * 260 - (d.x < CX ? 0 : 340) * k, rot: 90 }));
  const right = ring(16, 420, "tsr").map((d) => ({ ...d, x: d.x + 40 + k * 260 + (d.x > CX ? 0 : 340) * k, rot: -90 }));
  return (
    <Drone rot0={-8} rot1={6} z0={1.25} z1={1.05}>
      <Square seed="sq1" />
      <BodyTop x={CX} y={CY} rot={90} />
      {[...left, ...right].map((d, i) => <Person key={i} {...d} />)}
      <Person x={CX - 180 - k * 260} y={CY + 30} robe={NEPHEW.robe} head={NEPHEW.wrap ?? "#2e2420"} rot={90} s={1.05} />
      <Person x={CX + 180 + k * 260} y={CY - 20} robe={ACCUSED.robe} head={ACCUSED.wrap ?? "#f2ece0"} rot={-90} s={1.05} />
    </Drone>
  );
};
/** "Nobody says a word." — a still crowd in a ring around the body, long shadows */
export const TopCrowd: React.FC = () => (
  <Drone rot0={0} rot1={-10} z0={1.0} z1={1.25}>
    <Square seed="sq2" />
    <BodyTop x={CX} y={CY} rot={-20} />
    {ring(22, 430, "tc").map((d, i) => <Person key={i} {...d} />)}
    {ring(12, 610, "tc2").map((d, i) => <Person key={`b${i}`} {...d} s={0.95} />)}
    <Person x={CX + 380} y={CY - 140} robe={NEPHEW.robe} head={NEPHEW.wrap ?? "#2e2420"} rot={-110} />
    <Person x={CX - 420} y={CY + 60} robe={ACCUSED.robe} head={ACCUSED.wrap ?? "#f2ece0"} rot={80} />
  </Drone>
);
/** "By Allah's command, they strike the dead man with a piece of the cow." — the circle tightens; one man reaches in */
export const TopStrike: React.FC = () => {
  const { frame, dur } = useShot(); const { L } = useL();
  const reach = iv(frame, [Math.round(dur * 0.35), Math.round(dur * 0.7)], [0, 1], ease);
  return (
    <Drone rot0={10} rot1={-4} z0={1.1} z1={1.5}>
      <Square seed="sq3" />
      <BodyTop x={CX} y={CY} rot={0} />
      {ring(20, 400, "ts").map((d, i) => <Person key={i} {...d} />)}
      <Person x={CX + 330} y={CY + 40} robe={NEPHEW.robe} head={NEPHEW.wrap ?? "#2e2420"} rot={-90} />
      <g>
        <Person x={CX - 40} y={CY - 190 + reach * 60} robe={ELDER.robe} head={ELDER.wrap ?? "#f4efe2"} rot={180} />
        <g transform={`translate(${CX - 40} ${CY - 150 + reach * 90})`}>
          <path d="M -22 -10 Q -4 -26 22 -14 Q 30 4 14 14 Q -10 20 -24 6 Z" fill="#9a2f28" stroke="#5a1a14" strokeWidth={4} />
        </g>
      </g>
      {L("N142") >= 0 ? null : null}
    </Drone>
  );
};
