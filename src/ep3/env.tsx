import React from "react";
import { random, useCurrentFrame } from "remotion";
import { Cam, Layer, Defs, Sky, SKIES, ridge, Glow, FLOOR } from "./kit";

// Episode 3 scenery (owner's note): the Children of Israel lived among green valleys, so every scene is
// grass meadows, valleys and trees with a river running behind — no sand and bare mountains.
type SkyKey = keyof typeof SKIES;
const GRASS = "#6fa84f", GRASS_D = "#558c3b", GRASS_L = "#8cc263";

export const Tree: React.FC<{ x: number; y: number; s?: number; kind?: "round" | "palm" | "cypress"; tint?: number }> = ({ x, y, s = 1, kind = "round", tint = 0 }) => {
  const dark = tint ? "#2f5a2a" : "#3d7a35", mid = tint ? "#3f6e34" : "#4f9142", light = tint ? "#567f43" : "#6aac55";
  if (kind === "palm") return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -6 0 Q -14 -150 8 -300 L 18 -300 Q 4 -150 8 0 Z" fill="#7a5a3a" />
      {[-150, -110, -60, -20, 20, 60].map((a, i) => <path key={i} d="M 12 -300 q 60 -20 120 30 q -60 -10 -120 -24 z" fill={i % 2 ? mid : dark} transform={`rotate(${a + 90} 12 -300)`} />)}
    </g>
  );
  if (kind === "cypress") return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-6} y={-30} width={12} height={30} fill="#5a4030" />
      <path d="M 0 -300 Q 44 -150 30 -30 Q 0 -18 -30 -30 Q -44 -150 0 -300 Z" fill={dark} />
      <path d="M 0 -290 Q 24 -160 14 -40 Q 0 -34 -6 -40 Q -18 -160 0 -290 Z" fill={mid} opacity={0.8} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -12 0 L -8 -120 L 8 -120 L 12 0 Z" fill="#6b4a32" />
      <circle cx={-60} cy={-150} r={70} fill={dark} /><circle cx={60} cy={-150} r={72} fill={dark} />
      <circle cx={0} cy={-200} r={90} fill={mid} /><circle cx={-40} cy={-130} r={60} fill={mid} />
      <circle cx={30} cy={-230} r={46} fill={light} opacity={0.8} /><circle cx={-50} cy={-190} r={30} fill={light} opacity={0.6} />
    </g>
  );
};
/** a river running behind the scene, with moving glints */
export const River: React.FC<{ y?: number; h?: number; dusk?: boolean }> = ({ y = 1235, h = 46, dusk }) => {
  const f = useCurrentFrame();
  const c = dusk ? "#6c7fa8" : "#5aa6d6", lc = dusk ? "#c9b8d8" : "#d8f0ff";
  return (
    <g>
      <path d={`M -1400 ${y} Q 400 ${y - 18} 960 ${y + 4} Q 1600 ${y + 22} 3400 ${y} L 3400 ${y + h} Q 1600 ${y + h + 20} 960 ${y + h + 6} Q 400 ${y + h - 14} -1400 ${y + h} Z`} fill={c} />
      {new Array(26).fill(0).map((_, i) => {
        const x = ((random(`rv${i}`) * 4800 + f * (1.4 + random(`rs${i}`))) % 4800) - 1400;
        return <rect key={i} x={x} y={y + 8 + random(`ry${i}`) * (h - 18)} width={40 + random(`rw${i}`) * 60} height={3} rx={2} fill={lc} opacity={0.6} />;
      })}
    </g>
  );
};
const Flowers: React.FC<{ seed: string; y0: number; y1: number; n?: number }> = ({ seed, y0, y1, n = 60 }) => (
  <g>
    {new Array(n).fill(0).map((_, i) => {
      const x = random(`${seed}x${i}`) * 4800 - 1400, y = y0 + random(`${seed}y${i}`) * (y1 - y0);
      return <circle key={i} cx={x} cy={y} r={3 + random(`${seed}r${i}`) * 3} fill={["#fff4d0", "#f6c443", "#e86b6b", "#f2f0ff"][i % 4]} opacity={0.9} />;
    })}
  </g>
);
const Tufts: React.FC<{ seed: string; y0: number; y1: number; n?: number }> = ({ seed, y0, y1, n = 90 }) => (
  <g>
    {new Array(n).fill(0).map((_, i) => {
      const x = random(`${seed}tx${i}`) * 4800 - 1400, y = y0 + random(`${seed}ty${i}`) * (y1 - y0), k = 0.7 + random(`${seed}tk${i}`) * 0.8;
      return <path key={i} d={`M ${x - 12 * k} ${y} q ${4 * k} ${-26 * k} ${8 * k} ${-30 * k} q ${2 * k} ${18 * k} ${4 * k} ${30 * k} q ${6 * k} ${-24 * k} ${14 * k} ${-28 * k} q ${-4 * k} ${16 * k} ${-2 * k} ${28 * k} Z`} fill={i % 3 ? GRASS_D : GRASS_L} />;
    })}
  </g>
);
/** The green valley: far hills, trees, a river behind, and a grass meadow in front. `herd` is drawn on the far bank. */
export const Meadow: React.FC<{ cam: Cam; sky?: SkyKey; seed?: string; sunX?: number; sunY?: number; river?: boolean; trees?: number; back?: React.ReactNode; mid?: React.ReactNode; dim?: number }> = ({ cam, sky = "day", seed = "m", sunX = 1480, sunY = 760, river = true, trees = 7, back, mid, dim = 0 }) => {
  const dusk = sky === "dusk" || sky === "night";
  return (
    <>
      <Sky stops={SKIES[sky]} />
      <Layer d={0.05} cam={cam}><Defs /><Glow x={sunX} y={sunY} r={420} o={dusk ? 0.7 : 0.55} /><circle cx={sunX} cy={sunY} r={50} fill="#fff6d8" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge(`${seed}a`, 1050, 220, 260)} fill={dusk ? "#5a5f86" : "#8fb0c4"} opacity={0.85} /></Layer>
      <Layer d={0.3} cam={cam}>
        <path d={ridge(`${seed}b`, 1150, 130, 200)} fill={dusk ? "#3f6045" : "#5f9a52"} />
        {new Array(trees + 4).fill(0).map((_, i) => <Tree key={i} x={-600 + random(`${seed}ft${i}`) * 3200} y={1120 + random(`${seed}fy${i}`) * 40} s={0.35 + random(`${seed}fs${i}`) * 0.15} kind={i % 3 === 0 ? "cypress" : "round"} tint={dusk ? 1 : 0} />)}
      </Layer>
      <Layer d={0.55} cam={cam}>
        <path d={`M -1400 1190 Q 960 1160 3400 1190 L 3400 1300 L -1400 1300 Z`} fill={dusk ? "#4c7a46" : GRASS} />
        {back}
        {river ? <River dusk={dusk} /> : null}
      </Layer>
      <Layer d={0.8} cam={cam}>
        <path d={`M -1400 1262 Q 960 1250 3400 1262 L 3400 1400 L -1400 1400 Z`} fill={dusk ? "#55854c" : GRASS_L} />
        {new Array(trees).fill(0).map((_, i) => <Tree key={i} x={-500 + random(`${seed}nt${i}`) * 3000} y={1290} s={0.6 + random(`${seed}ns${i}`) * 0.2} kind={i % 4 === 1 ? "palm" : "round"} tint={dusk ? 1 : 0} />)}
        {mid}
      </Layer>
      <Layer d={1} cam={cam}>
        <path d={`M -1400 ${FLOOR - 14} Q 960 ${FLOOR - 34} 3400 ${FLOOR - 14} L 3400 2800 L -1400 2800 Z`} fill={dusk ? "#5e8f52" : GRASS} />
        <path d={`M -400 ${FLOOR + 30} Q 960 ${FLOOR + 6} 2400 ${FLOOR + 30} L 2400 ${FLOOR + 120} Q 960 ${FLOOR + 96} -400 ${FLOOR + 120} Z`} fill="#c8b48a" opacity={0.55} />
        <Tufts seed={`${seed}t`} y0={FLOOR - 10} y1={FLOOR + 260} />
        <Flowers seed={`${seed}f`} y0={FLOOR} y1={FLOOR + 280} />
      </Layer>
      {dim > 0 ? null : null}
    </>
  );
};
/** A house sized for its people: the door is taller than a man (a figure at scale 2 is ≈ 520 px). */
export const House: React.FC<{ x: number; rich?: boolean; poor?: boolean }> = ({ x, rich, poor }) => {
  const wall = poor ? "#b99a6e" : "#e6d3ae", trim = rich ? "#c9962e" : "#9b7b52";
  return (
    <g transform={`translate(${x} ${FLOOR - 4})`}>
      <rect x={-380} y={-720} width={760} height={720} fill={wall} stroke="#3a2a1e" strokeWidth={8} />
      <rect x={-410} y={-760} width={820} height={50} fill={trim} stroke="#3a2a1e" strokeWidth={6} />
      {rich ? <rect x={-380} y={-710} width={760} height={18} fill="#e3b341" opacity={0.6} /> : null}
      <path d="M -120 0 L -120 -460 Q 0 -600 120 -460 L 120 0 Z" fill="#4a3220" stroke="#3a2a1e" strokeWidth={7} />
      {rich ? <path d="M -140 0 L -140 -470 Q 0 -630 140 -470 L 140 0" fill="none" stroke="#e3b341" strokeWidth={12} /> : null}
      <line x1={0} y1={-560} x2={0} y2={0} stroke="#2e1f14" strokeWidth={5} />
      {[-270, 270].map((wx) => <g key={wx}><path d={`M ${wx - 55} -380 L ${wx - 55} -520 Q ${wx} -580 ${wx + 55} -520 L ${wx + 55} -380 Z`} fill="#3a2718" stroke="#3a2a1e" strokeWidth={6} /></g>)}
      {rich ? <><Tree x={-470} y={0} s={0.9} kind="palm" /><Tree x={470} y={0} s={0.8} kind="cypress" /></> : null}
    </g>
  );
};
/** a low stone wall (the leper's corner of the village) */
export const Wall: React.FC<{ x0: number; x1: number }> = ({ x0, x1 }) => (
  <g>
    <rect x={x0} y={FLOOR - 230} width={x1 - x0} height={230} fill="#b7a07c" stroke="#3a2a1e" strokeWidth={6} />
    {new Array(Math.floor((x1 - x0) / 90)).fill(0).map((_, i) => <line key={i} x1={x0 + 90 * i + 45} y1={FLOOR - 230} x2={x0 + 90 * i + 45} y2={FLOOR} stroke="#9a8462" strokeWidth={3} />)}
    <rect x={x0 - 10} y={FLOOR - 250} width={x1 - x0 + 20} height={26} fill="#a58d68" stroke="#3a2a1e" strokeWidth={5} />
  </g>
);
/** market stalls with awnings (the bald man's street) */
export const Stalls: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} ${FLOOR - 4})`}>
    {[0, 1, 2].map((i) => {
      const sx = i * 560, c = ["#b5452f", "#2f6f8f", "#c48a2a"][i];
      return (
        <g key={i} transform={`translate(${sx} 0)`}>
          <rect x={-220} y={-260} width={440} height={260} fill="#8a6a46" stroke="#3a2a1e" strokeWidth={6} />
          <line x1={-220} y1={-260} x2={-220} y2={-600} stroke="#5a3e28" strokeWidth={12} /><line x1={220} y1={-260} x2={220} y2={-600} stroke="#5a3e28" strokeWidth={12} />
          <path d="M -260 -600 L 260 -600 L 240 -470 L -240 -470 Z" fill={c} stroke="#3a2a1e" strokeWidth={6} />
          {[-150, -60, 30, 120].map((fx, k) => <circle key={k} cx={fx} cy={-282} r={30} fill={["#e8b440", "#c2412f", "#7fae4a", "#e98a2c"][k]} stroke="#3a2a1e" strokeWidth={3} />)}
        </g>
      );
    })}
  </g>
);
