import React from "react";
import { AbsoluteFill, random } from "remotion";
import { Cam, Layer, Defs, Sky, SKIES, ridge, Glow, FLOOR } from "./kit";
import { Tree } from "../ep3/env";

// Episode 4 scenery — its own look, not Episode 3's green meadow: a sandstone oasis town in a valley under
// red rocky mountains, flat-roofed mud-brick houses with wooden roof beams, palms, a dusty square.
type SkyKey = "dawn" | "day" | "dusk" | "night";
const DAY: [number, string][] = [[0, "#2f6fa8"], [40, "#7fb2d6"], [68, "#f3d6a4"], [100, "#f7e0b4"]];
const SAND = "#d4b383", SAND_D = "#bf9a68", SAND_L = "#e2c79c";

/** a flat-roofed mud-brick house with wooden roof beams; full size: wide 1120, door arch 320 wide (as BigHouse) */
export const MudHouse: React.FC<{ x: number; tone?: number; night?: boolean }> = ({ x, tone = 0, night }) => {
  const wall = night ? "#7d6a6a" : ["#d9b98a", "#cfa978", "#e0c39a"][tone % 3];
  const shade = night ? "#5e4e52" : "#b88e5c";
  return (
    <g>
      <path d={`M ${x - 560} ${FLOOR} L ${x - 560} ${FLOOR - 990} Q ${x - 560} ${FLOOR - 1020} ${x - 530} ${FLOOR - 1020} L ${x + 530} ${FLOOR - 1020} Q ${x + 560} ${FLOOR - 1020} ${x + 560} ${FLOOR - 990} L ${x + 560} ${FLOOR} Z`} fill={wall} stroke="#5a3e28" strokeWidth={6} />
      <rect x={x - 580} y={FLOOR - 1060} width={1160} height={48} rx={10} fill={shade} stroke="#5a3e28" strokeWidth={5} />
      {new Array(9).fill(0).map((_, i) => <rect key={i} x={x - 520 + i * 130} y={FLOOR - 1012} width={34} height={26} rx={3} fill="#6b4628" />)}
      {[[-380, -760], [380, -760]].map(([dx, dy], i) => <path key={i} d={`M ${x + dx - 60} ${FLOOR + dy + 120} L ${x + dx - 60} ${FLOOR + dy} Q ${x + dx} ${FLOOR + dy - 70} ${x + dx + 60} ${FLOOR + dy} L ${x + dx + 60} ${FLOOR + dy + 120} Z`} fill={night ? "#2a2030" : "#3a2818"} stroke="#5a3e28" strokeWidth={5} />)}
      {new Array(7).fill(0).map((_, i) => <ellipse key={`p${i}`} cx={x - 460 + random(`mh${x}${i}`) * 920} cy={FLOOR - 120 - random(`mhy${x}${i}`) * 700} rx={30 + random(`mhr${x}${i}`) * 40} ry={14} fill={shade} opacity={0.35} />)}
      <path d={`M ${x - 200} ${FLOOR} L ${x - 200} ${FLOOR - 560} Q ${x} ${FLOOR - 800} ${x + 200} ${FLOOR - 560} L ${x + 200} ${FLOOR} Z`} fill={shade} opacity={0.6} />
      <path d={`M ${x - 160} ${FLOOR - 4} L ${x - 160} ${FLOOR - 544} Q ${x} ${FLOOR - 764} ${x + 160} ${FLOOR - 544} L ${x + 160} ${FLOOR - 4} Z`} fill={night ? "#0b0806" : "#1a120c"} />
    </g>
  );
};
/** small flat-roofed houses stacked up a slope, far away */
const FarTown: React.FC<{ seed: string; y: number; dusk?: boolean }> = ({ seed, y, dusk }) => (
  <g>
    {new Array(26).fill(0).map((_, i) => {
      const x = -900 + i * 150 + random(`${seed}hx${i}`) * 60, w = 90 + random(`${seed}hw${i}`) * 70, h = 60 + random(`${seed}hh${i}`) * 80;
      const yy = y - Math.abs(Math.sin(i * 0.5)) * 60;
      const c = dusk ? ["#8c6a62", "#7a5c58", "#9a7468"][i % 3] : ["#dcbf92", "#cfae7e", "#e5cba2"][i % 3];
      return (
        <g key={i}>
          <rect x={x} y={yy - h} width={w} height={h} fill={c} />
          <rect x={x - 4} y={yy - h - 8} width={w + 8} height={10} fill={dusk ? "#6a4e4a" : "#b88e5c"} />
          <rect x={x + w * 0.3} y={yy - h * 0.6} width={12} height={16} fill="#3a2818" opacity={0.8} />
        </g>
      );
    })}
  </g>
);
const Stones: React.FC<{ seed: string; y0: number; y1: number; n?: number }> = ({ seed, y0, y1, n = 50 }) => (
  <g>{new Array(n).fill(0).map((_, i) => <ellipse key={i} cx={random(`${seed}sx${i}`) * 4800 - 1400} cy={y0 + random(`${seed}sy${i}`) * (y1 - y0)} rx={6 + random(`${seed}sr${i}`) * 16} ry={4 + random(`${seed}sq${i}`) * 7} fill={i % 3 ? "#a88a62" : "#8f744f"} opacity={0.8} />)}</g>
);
const Shrubs: React.FC<{ seed: string; y0: number; y1: number; n?: number }> = ({ seed, y0, y1, n = 24 }) => (
  <g>{new Array(n).fill(0).map((_, i) => {
    const x = random(`${seed}bx${i}`) * 4800 - 1400, y = y0 + random(`${seed}by${i}`) * (y1 - y0), k = 0.6 + random(`${seed}bk${i}`) * 0.8;
    return <g key={i} transform={`translate(${x} ${y}) scale(${k})`}><ellipse cx={0} cy={-14} rx={34} ry={20} fill="#7d8a4a" /><ellipse cx={-14} cy={-22} rx={18} ry={14} fill="#97a35a" /></g>;
  })}</g>
);

/** The oasis valley. Same props as Episode 3's Meadow so scenes can swap; `town` shows the far houses. */
export const Oasis: React.FC<{ cam: Cam; sky?: SkyKey; seed?: string; sunX?: number; sunY?: number; trees?: number; mid?: React.ReactNode; far?: React.ReactNode; town?: boolean; river?: boolean }> = ({ cam, sky = "day", seed = "o", sunX = 1480, sunY = 760, trees = 6, mid, far, town = true }) => {
  const dusk = sky === "dusk" || sky === "night" || sky === "dawn";
  const night = sky === "night";
  return (
    <>
      <Sky stops={sky === "day" ? DAY : SKIES[sky]} />
      <Layer d={0.05} cam={cam}><Defs /><Glow x={sunX} y={sunY} r={420} o={dusk ? 0.7 : 0.5} /><circle cx={sunX} cy={sunY} r={night ? 40 : 52} fill={night ? "#f2efe0" : "#fff6d8"} /></Layer>
      <Layer d={0.12} cam={cam}>
        <path d={ridge(`${seed}m1`, 1010, 360, 150, -1400, 3400, false)} fill={night ? "#2c2a48" : dusk ? "#7a4a5a" : "#c08466"} opacity={0.9} />
      </Layer>
      <Layer d={0.2} cam={cam}>
        <path d={ridge(`${seed}m2`, 1100, 260, 120, -1400, 3400, false)} fill={night ? "#23203a" : dusk ? "#5e3a4a" : "#a2664c"} />
        {new Array(14).fill(0).map((_, i) => { const x = -1200 + i * 330; return <path key={i} d={`M ${x} ${1040 + (i % 3) * 20} l 120 -60 l 90 30`} stroke={night ? "#1a1830" : dusk ? "#4e2e3e" : "#8a5440"} strokeWidth={6} fill="none" opacity={0.7} />; })}
      </Layer>
      <AbsoluteFill style={{ background: `linear-gradient(rgba(0,0,0,0) 30%, ${dusk ? "rgba(255,170,130,0.22)" : "rgba(255,236,200,0.35)"} 58%, rgba(0,0,0,0) 80%)` }} />
      <Layer d={0.35} cam={cam}>
        <path d={`M -1400 1170 Q 960 1130 3400 1170 L 3400 1400 L -1400 1400 Z`} fill={night ? "#3e3646" : dusk ? "#a8806a" : SAND_D} />
        {town ? <FarTown seed={seed} y={1172} dusk={dusk} /> : null}
        {new Array(trees + 3).fill(0).map((_, i) => <Tree key={i} x={-700 + random(`${seed}fp${i}`) * 3400} y={1178 + random(`${seed}fpy${i}`) * 20} s={0.4 + random(`${seed}fps${i}`) * 0.15} kind="palm" tint={dusk ? 1 : 0} />)}
        {far}
      </Layer>
      <Layer d={0.6} cam={cam}>
        <path d={`M -1400 1236 Q 960 1214 3400 1236 L 3400 1400 L -1400 1400 Z`} fill={night ? "#4a4250" : dusk ? "#b88f70" : SAND} />
        <path d={`M -1400 1236 L 3400 1236 L 3400 1262 L -1400 1262 Z`} fill={night ? "#3a3240" : "#b89b72"} opacity={0.8} />
        {new Array(trees).fill(0).map((_, i) => <Tree key={i} x={-500 + random(`${seed}np${i}`) * 3000} y={1240} s={0.85 + random(`${seed}nps${i}`) * 0.25} kind="palm" tint={dusk ? 1 : 0} />)}
      </Layer>
      <Layer d={0.8} cam={cam}>
        <path d={`M -1400 1270 Q 960 1258 3400 1270 L 3400 1420 L -1400 1420 Z`} fill={night ? "#4e4654" : dusk ? "#c49a78" : SAND_L} />
        {mid}
      </Layer>
      <Layer d={1} cam={cam}>
        <path d={`M -1400 ${FLOOR - 14} Q 960 ${FLOOR - 30} 3400 ${FLOOR - 14} L 3400 2800 L -1400 2800 Z`} fill={night ? "#4a4250" : dusk ? "#c79c76" : SAND} />
        <path d={`M -400 ${FLOOR + 40} Q 960 ${FLOOR + 14} 2400 ${FLOOR + 40} L 2400 ${FLOOR + 150} Q 960 ${FLOOR + 124} -400 ${FLOOR + 150} Z`} fill={night ? "#3e3646" : "#e6cfa6"} opacity={0.6} />
        <Stones seed={`${seed}s`} y0={FLOOR} y1={FLOOR + 320} />
        <Shrubs seed={`${seed}b`} y0={FLOOR + 10} y1={FLOOR + 300} />
      </Layer>
    </>
  );
};
