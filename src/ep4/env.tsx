import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
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

const Clouds: React.FC<{ seed: string; dusk?: boolean }> = ({ seed, dusk }) => {
  const f = useCurrentFrame();
  return <g>{new Array(7).fill(0).map((_, i) => {
    const x = ((random(`${seed}cx${i}`) * 3600 + f * (0.25 + random(`${seed}cs${i}`) * 0.3)) % 3600) - 900, y = 300 + random(`${seed}cy${i}`) * 420, w = 260 + random(`${seed}cw${i}`) * 320;
    return <g key={i} opacity={dusk ? 0.45 : 0.75} style={{ filter: "blur(6px)" }}><ellipse cx={x} cy={y} rx={w} ry={w * 0.18} fill={dusk ? "#f3b9a0" : "#ffffff"} /><ellipse cx={x + w * 0.3} cy={y - w * 0.08} rx={w * 0.5} ry={w * 0.15} fill={dusk ? "#f7c8b0" : "#ffffff"} /></g>;
  })}</g>;
};
const Birds: React.FC<{ seed: string }> = ({ seed }) => {
  const f = useCurrentFrame();
  return <g>{new Array(5).fill(0).map((_, i) => {
    const x = ((random(`${seed}bx${i}`) * 3000 + f * 2.2) % 3400) - 700, y = 520 + random(`${seed}by${i}`) * 200 + Math.sin(f * 0.05 + i) * 10, w = Math.sin(f * 0.35 + i * 2) * 8;
    return <path key={i} d={`M ${x - 18} ${y - w} Q ${x - 8} ${y - 4} ${x} ${y} Q ${x + 8} ${y - 4} ${x + 18} ${y - w}`} stroke="#3a2a2a" strokeWidth={3} fill="none" opacity={0.7} />;
  })}</g>;
};
/** mountains with a lit face and a shaded face (gives the rock shape and depth) */
const Range: React.FC<{ seed: string; y: number; amp: number; step: number; c: string; shade: string; strata?: string }> = ({ seed, y, amp, step, c, shade, strata }) => (
  <g>
    <path d={ridge(seed, y, amp, step, -1400, 3400, false)} fill={c} />
    <path d={ridge(seed, y, amp, step, -1400 + step * 0.45, 3400 + step * 0.45, false)} fill={shade} opacity={0.38} />
    {strata ? new Array(16).fill(0).map((_, i) => <path key={i} d={`M ${-1300 + i * 300} ${y + 30 + (i % 4) * 26} q 90 -30 200 -10`} stroke={strata} strokeWidth={5} fill="none" opacity={0.5} />) : null}
  </g>
);
const Awnings: React.FC<{ seed: string }> = ({ seed }) => (
  <g>{new Array(6).fill(0).map((_, i) => {
    const x = -600 + i * 640 + random(`${seed}aw${i}`) * 200;
    const c = ["#9b2d2d", "#2d5a8a", "#c98a2a", "#5a7a2a"][i % 4];
    return <g key={i}><line x1={x - 90} y1={1236} x2={x - 90} y2={1150} stroke="#5a3e28" strokeWidth={6} /><line x1={x + 90} y1={1236} x2={x + 90} y2={1150} stroke="#5a3e28" strokeWidth={6} /><path d={`M ${x - 110} 1150 L ${x + 110} 1150 L ${x + 90} 1180 L ${x - 90} 1180 Z`} fill={c} /><rect x={x - 70} y={1206} width={140} height={30} fill="#8a6a48" /></g>;
  })}</g>
);
const Walls: React.FC<{ seed: string }> = ({ seed }) => (
  <g>{new Array(8).fill(0).map((_, i) => { const x = -1100 + i * 600 + random(`${seed}wl${i}`) * 160; return <path key={i} d={`M ${x} 1262 L ${x} 1226 Q ${x + 130} 1214 ${x + 260} 1226 L ${x + 260} 1262 Z`} fill="#b89b72" stroke="#7a5e40" strokeWidth={3} />; })}</g>
);
const Flowers: React.FC<{ seed: string; y0: number; y1: number }> = ({ seed, y0, y1 }) => (
  <g>{new Array(70).fill(0).map((_, i) => <circle key={i} cx={random(`${seed}fx${i}`) * 4800 - 1400} cy={y0 + random(`${seed}fy${i}`) * (y1 - y0)} r={3 + random(`${seed}fr${i}`) * 3} fill={["#fff4d0", "#f6c443", "#e86b6b", "#f2f0ff"][i % 4]} />)}</g>
);
const Tufts: React.FC<{ seed: string; y0: number; y1: number }> = ({ seed, y0, y1 }) => (
  <g>{new Array(90).fill(0).map((_, i) => { const x = random(`${seed}tx${i}`) * 4800 - 1400, y = y0 + random(`${seed}ty${i}`) * (y1 - y0), k = 0.7 + random(`${seed}tk${i}`) * 0.8; return <path key={i} d={`M ${x - 12 * k} ${y} q ${4 * k} ${-26 * k} ${8 * k} ${-30 * k} q ${2 * k} ${18 * k} ${4 * k} ${30 * k} q ${6 * k} ${-24 * k} ${14 * k} ${-28 * k} q ${-4 * k} ${16 * k} ${-2 * k} ${28 * k} Z`} fill={i % 3 ? "#4f8a3c" : "#8cc263"} />; })}</g>
);
/** blurred foreground layer, drawn after the characters */
export const Fore: React.FC<{ cam: Cam; dusk?: boolean }> = ({ cam, dusk }) => <Layer d={1.4} cam={cam}><Foreground dusk={dusk} /></Layer>;
/** out-of-focus things right in front of the camera (palm leaves at the top corners, a rock below) */
const Foreground: React.FC<{ dusk?: boolean }> = ({ dusk }) => (
  <g style={{ filter: "blur(7px)" }} opacity={0.95}>
    {[[-260, 360, 30], [2180, 300, 150]].map(([x, y, a], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
        {[0, 1, 2, 3, 4].map((k) => <path key={k} d="M 0 0 q 160 -30 330 60 q -170 -20 -330 -40 z" fill={dusk ? "#1e2e1a" : k % 2 ? "#2f5a2a" : "#3d7a35"} transform={`rotate(${k * 26 - 20})`} />)}
      </g>
    ))}
    <ellipse cx={-120} cy={1880} rx={360} ry={150} fill={dusk ? "#5e4438" : "#9a7a52"} />
    <ellipse cx={2080} cy={1900} rx={300} ry={130} fill={dusk ? "#5e4438" : "#8f714c"} />
  </g>
);

/** The oasis valley. Same props as Episode 3's Meadow so scenes can swap. `town` shows the far houses;
 * `meadow` turns the ground into green pasture (the cows always graze in meadows); `fg` adds the blurred foreground. */
export const Oasis: React.FC<{ cam: Cam; sky?: SkyKey; seed?: string; sunX?: number; sunY?: number; trees?: number; mid?: React.ReactNode; far?: React.ReactNode; town?: boolean; river?: boolean; meadow?: boolean; fg?: boolean }> = ({ cam, sky = "day", seed = "o", sunX = 1480, sunY = 760, trees = 6, mid, far, town = true, meadow, fg = false }) => {
  const dusk = sky === "dusk" || sky === "night" || sky === "dawn";
  const night = sky === "night";
  const G = meadow ? (dusk ? ["#5e8f52", "#55854c", "#4c7a46"] : ["#6fa84f", "#8cc263", "#5f9a52"]) : null;
  return (
    <>
      <Sky stops={sky === "day" ? DAY : SKIES[sky]} />
      <Layer d={0.03} cam={cam}>{night ? null : <Clouds seed={seed} dusk={dusk} />}</Layer>
      <Layer d={0.05} cam={cam}><Defs /><Glow x={sunX} y={sunY} r={460} o={dusk ? 0.75 : 0.5} /><circle cx={sunX} cy={sunY} r={night ? 40 : 52} fill={night ? "#f2efe0" : "#fff6d8"} />
        {night ? null : new Array(10).fill(0).map((_, i) => <path key={i} d={`M ${sunX} ${sunY} L ${sunX + Math.cos(i * 0.63) * 1400} ${sunY + Math.sin(i * 0.63) * 1400} L ${sunX + Math.cos(i * 0.63 + 0.07) * 1400} ${sunY + Math.sin(i * 0.63 + 0.07) * 1400} Z`} fill="#fff4d6" opacity={0.06} />)}
      </Layer>
      <Layer d={0.08} cam={cam}>{night ? null : <Birds seed={seed} />}</Layer>
      <Layer d={0.1} cam={cam}><Range seed={`${seed}m0`} y={960} amp={300} step={190} c={night ? "#3a3a5e" : dusk ? "#9a6a7a" : "#d4a48c"} shade={night ? "#24243e" : dusk ? "#6a4256" : "#b07a62"} /></Layer>
      <AbsoluteFill style={{ background: `linear-gradient(rgba(0,0,0,0) 35%, ${night ? "rgba(40,50,90,0.25)" : dusk ? "rgba(255,180,150,0.25)" : "rgba(250,232,205,0.45)"} 55%, rgba(0,0,0,0) 70%)` }} />
      <Layer d={0.16} cam={cam}><Range seed={`${seed}m1`} y={1040} amp={330} step={150} c={night ? "#2c2a48" : dusk ? "#7a4a5a" : "#c08466"} shade={night ? "#1c1a32" : dusk ? "#4e2e3e" : "#8a5440"} strata={night ? "#1a1830" : dusk ? "#4e2e3e" : "#9a5e46"} /></Layer>
      <Layer d={0.24} cam={cam}><Range seed={`${seed}m2`} y={1120} amp={210} step={120} c={night ? "#23203a" : dusk ? "#5e3a4a" : "#a2664c"} shade={night ? "#151326" : dusk ? "#3e2432" : "#7a4632"} /></Layer>
      <AbsoluteFill style={{ background: `linear-gradient(rgba(0,0,0,0) 45%, ${dusk ? "rgba(255,170,130,0.22)" : "rgba(255,236,200,0.35)"} 60%, rgba(0,0,0,0) 76%)` }} />
      <Layer d={0.36} cam={cam}>
        <path d={`M -1400 1170 Q 960 1130 3400 1170 L 3400 1400 L -1400 1400 Z`} fill={night ? "#3e3646" : G ? G[2] : dusk ? "#a8806a" : SAND_D} />
        {town ? <FarTown seed={seed} y={1172} dusk={dusk} /> : null}
        {new Array(trees + 6).fill(0).map((_, i) => <Tree key={i} x={-700 + random(`${seed}fp${i}`) * 3400} y={1178 + random(`${seed}fpy${i}`) * 20} s={0.4 + random(`${seed}fps${i}`) * 0.15} kind="palm" tint={dusk ? 1 : 0} />)}
        {far}
      </Layer>
      <Layer d={0.6} cam={cam}>
        <path d={`M -1400 1236 Q 960 1214 3400 1236 L 3400 1400 L -1400 1400 Z`} fill={night ? "#4a4250" : G ? G[0] : dusk ? "#b88f70" : SAND} />
        {G ? <path d="M -1400 1250 Q 960 1236 3400 1250 L 3400 1262 Q 960 1250 -1400 1262 Z" fill={dusk ? "#6c7fa8" : "#5aa6d6"} opacity={0.9} /> : <Walls seed={seed} />}
        {town && !G ? <Awnings seed={seed} /> : null}
        {new Array(trees).fill(0).map((_, i) => <Tree key={i} x={-500 + random(`${seed}np${i}`) * 3000} y={1240} s={0.85 + random(`${seed}nps${i}`) * 0.25} kind="palm" tint={dusk ? 1 : 0} />)}
      </Layer>
      <Layer d={0.8} cam={cam}>
        <path d={`M -1400 1270 Q 960 1258 3400 1270 L 3400 1420 L -1400 1420 Z`} fill={night ? "#4e4654" : G ? G[1] : dusk ? "#c49a78" : SAND_L} />
        {mid}
      </Layer>
      <Layer d={1} cam={cam}>
        <path d={`M -1400 ${FLOOR - 14} Q 960 ${FLOOR - 30} 3400 ${FLOOR - 14} L 3400 2800 L -1400 2800 Z`} fill={night ? "#4a4250" : G ? G[0] : dusk ? "#c79c76" : SAND} />
        {G ? <><Tufts seed={`${seed}t`} y0={FLOOR - 10} y1={FLOOR + 300} /><Flowers seed={`${seed}f`} y0={FLOOR} y1={FLOOR + 300} /></> : <>
          <path d={`M -400 ${FLOOR + 40} Q 960 ${FLOOR + 14} 2400 ${FLOOR + 40} L 2400 ${FLOOR + 150} Q 960 ${FLOOR + 124} -400 ${FLOOR + 150} Z`} fill={night ? "#3e3646" : "#e6cfa6"} opacity={0.6} />
          <Stones seed={`${seed}s`} y0={FLOOR} y1={FLOOR + 320} />
          <Shrubs seed={`${seed}b`} y0={FLOOR + 10} y1={FLOOR + 300} />
        </>}
      </Layer>
      {fg && !night ? <Layer d={1.4} cam={cam}><Foreground dusk={dusk} /></Layer> : null}
    </>
  );
};
