import React from "react";
import { random } from "remotion";

// Episode 3 animals, drawn at true size next to a man at figure scale 2 (≈ 520 px): a camel's hump ≈ 600 px,
// a cow's back ≈ 390 px, a sheep's back ≈ 240 px. Feet at y = 0, facing right (flip to face left).
// `walk` = distance walked (legs swing only while moving); `graze` = time (head dips to the grass).
const legSwing = (walk: number | undefined, off: number) => (walk === undefined ? 0 : Math.sin(walk * 0.045 + off) * 16);
const Leg: React.FC<{ x: number; y: number; len: number; w: number; c: string; a: number; hoof?: string; knee?: number }> = ({ x, y, len, w, c, a, hoof = "#2a1d14", knee = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <path d={`M ${-w / 2} 0 L ${w / 2} 0 L ${w * 0.38} ${len * 0.55} L ${w * 0.34 + knee} ${len} L ${-w * 0.34 + knee} ${len} L ${-w * 0.42} ${len * 0.55} Z`} fill={c} />
    {knee ? <ellipse cx={knee * 0.5} cy={len * 0.55} rx={w * 0.45} ry={w * 0.32} fill={c} /> : null}
    <rect x={-w * 0.42 + knee} y={len - 6} width={w * 0.84} height={12} rx={4} fill={hoof} />
  </g>
);

export const Camel: React.FC<{ walk?: number; graze?: number; flip?: boolean; s?: number; young?: boolean }> = ({ walk, graze = 0, flip, s = 1, young }) => {
  const c = "#c79a5f", d = "#a77b45", l = "#d9b27a";
  const bob = walk === undefined ? 0 : Math.abs(Math.sin(walk * 0.045)) * 6;
  const nod = walk === undefined ? Math.sin(graze * 0.6) * 4 : Math.sin(walk * 0.09) * 5;
  return (
    <g transform={`scale(${(flip ? -1 : 1) * s * (young ? 0.5 : 1)} ${s * (young ? 0.5 : 1)})`}>
      <ellipse cx={0} cy={6} rx={190} ry={16} fill="#000" opacity={0.18} />
      <Leg x={-110} y={-330} len={330} w={34} c={d} a={legSwing(walk, Math.PI)} knee={6} />
      <Leg x={95} y={-330} len={330} w={34} c={d} a={legSwing(walk, 0)} knee={6} />
      <g transform={`translate(0 ${-bob})`}>
        {/* body and single hump */}
        <path d="M -170 -420 Q -190 -330 -120 -310 L 130 -310 Q 190 -330 170 -410 Q 150 -470 90 -470 Q 40 -600 -30 -600 Q -110 -590 -140 -470 Q -170 -460 -170 -420 Z" fill={c} />
        <path d="M -120 -312 Q 0 -300 130 -312 Q 120 -330 0 -334 Q -110 -330 -120 -312 Z" fill={d} opacity={0.5} />
        <path d="M -60 -590 Q -10 -610 40 -560" stroke={l} strokeWidth={10} fill="none" opacity={0.6} />
        {/* tail */}
        <path d="M -168 -430 Q -200 -380 -186 -330" stroke={d} strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* neck and head */}
        <g transform={`rotate(${nod} 150 -430)`}>
          <path d="M 120 -460 Q 210 -470 240 -560 Q 256 -620 300 -640 L 330 -610 Q 290 -590 280 -540 Q 260 -430 160 -380 Z" fill={c} />
          <path d="M 288 -660 Q 340 -676 380 -650 Q 400 -630 384 -612 Q 350 -600 316 -604 Q 290 -620 288 -660 Z" fill={c} />
          <ellipse cx={378} cy={-626} rx={14} ry={10} fill={d} />
          <path d="M 300 -660 L 296 -684 L 312 -664 Z" fill={d} />
          <circle cx={334} cy={-648} r={5} fill="#2a1d14" />
        </g>
      </g>
      <Leg x={-90} y={-330} len={330} w={36} c={c} a={legSwing(walk, 0)} knee={6} />
      <Leg x={120} y={-330} len={330} w={36} c={c} a={legSwing(walk, Math.PI)} knee={6} />
    </g>
  );
};

export const Cow: React.FC<{ walk?: number; graze?: number; flip?: boolean; s?: number; young?: boolean; patches?: boolean }> = ({ walk, graze = 0, flip, s = 1, young, patches = true }) => {
  const c = "#7b4f33", d = "#5c3a24", w = "#f1e8d8";
  const dip = walk === undefined ? (Math.sin(graze * 0.35) * 0.5 + 0.5) : 0;
  return (
    <g transform={`scale(${(flip ? -1 : 1) * s * (young ? 0.5 : 1)} ${s * (young ? 0.5 : 1)})`}>
      <ellipse cx={0} cy={6} rx={200} ry={15} fill="#000" opacity={0.18} />
      <Leg x={-135} y={-230} len={230} w={34} c={d} a={legSwing(walk, Math.PI)} />
      <Leg x={110} y={-230} len={230} w={34} c={d} a={legSwing(walk, 0)} />
      {/* body: straight back, deep chest, hip bones */}
      <path d="M -190 -360 Q -200 -250 -160 -220 L 150 -215 Q 190 -240 180 -330 Q 176 -370 140 -385 Q 0 -400 -150 -392 Q -186 -388 -190 -360 Z" fill={c} />
      {patches ? <g fill={w}><path d="M -120 -380 Q -60 -396 -40 -340 Q -70 -290 -130 -310 Q -150 -350 -120 -380 Z" /><path d="M 40 -330 Q 90 -350 110 -300 Q 90 -250 40 -262 Q 20 -300 40 -330 Z" /></g> : null}
      <path d="M -70 -222 Q -50 -186 -20 -200 Q -30 -220 -70 -222 Z" fill="#e8b3a6" />
      <path d="M -190 -370 Q -222 -320 -214 -230" stroke={d} strokeWidth={8} fill="none" /><ellipse cx={-214} cy={-226} rx={10} ry={16} fill={d} />
      {/* head: lowers to the grass while grazing */}
      <g transform={`rotate(${dip * 38} 170 -360)`}>
        <path d="M 160 -380 Q 230 -390 260 -340 Q 280 -300 270 -270 Q 250 -248 228 -262 Q 190 -300 160 -320 Z" fill={c} />
        <ellipse cx={262} cy={-268} rx={22} ry={18} fill="#d9a796" />
        <circle cx={256} cy={-274} r={4} fill="#3a2418" /><circle cx={270} cy={-270} r={4} fill="#3a2418" />
        <circle cx={222} cy={-344} r={5} fill="#2a1d14" />
        <path d="M 196 -376 Q 170 -392 150 -386 Q 168 -370 192 -366 Z" fill={d} />
        <path d="M 214 -384 Q 222 -410 240 -414" stroke="#efe4cf" strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
      <Leg x={-110} y={-230} len={230} w={36} c={c} a={legSwing(walk, 0)} />
      <Leg x={135} y={-230} len={230} w={36} c={c} a={legSwing(walk, Math.PI)} />
    </g>
  );
};

export const Sheep: React.FC<{ walk?: number; graze?: number; flip?: boolean; s?: number; young?: boolean }> = ({ walk, graze = 0, flip, s = 1, young }) => {
  const wool = "#f2ede0", ws = "#d8d0bd", face = "#2f2622";
  const dip = walk === undefined ? (Math.sin(graze * 0.4) * 0.5 + 0.5) : 0;
  const puffs: [number, number, number][] = [[-90, -170, 46], [-40, -195, 52], [20, -198, 52], [76, -178, 46], [-70, -128, 44], [0, -125, 48], [62, -128, 44], [-110, -140, 34], [-58, -104, 34], [4, -100, 38], [58, -104, 34]];
  return (
    <g transform={`scale(${(flip ? -1 : 1) * s * (young ? 0.55 : 1)} ${s * (young ? 0.55 : 1)})`}>
      <ellipse cx={0} cy={5} rx={120} ry={11} fill="#000" opacity={0.17} />
      <Leg x={-58} y={-110} len={110} w={13} c="#1c1613" a={legSwing(walk, Math.PI)} hoof="#0e0b09" />
      <Leg x={72} y={-110} len={110} w={13} c="#1c1613" a={legSwing(walk, 0)} hoof="#0e0b09" />
      <g>
        {puffs.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r + 4} fill={ws} />)}
        {puffs.map(([x, y, r], i) => <circle key={`b${i}`} cx={x} cy={y - 3} r={r} fill={wool} />)}
      </g>
      <g transform={`rotate(${dip * 40} 100 -170)`}>
        <path d="M 96 -200 Q 150 -214 176 -170 Q 186 -140 168 -128 Q 140 -128 110 -160 Z" fill={face} />
        <path d="M 112 -196 Q 92 -186 88 -164 Q 104 -172 118 -182 Z" fill={face} />
        <circle cx={144} cy={-180} r={4} fill="#e8e0d0" />
        <circle cx={104} cy={-206} r={22} fill={wool} />
      </g>
      <Leg x={-46} y={-110} len={110} w={16} c={face} a={legSwing(walk, 0)} hoof="#14100e" />
      <Leg x={84} y={-110} len={110} w={16} c={face} a={legSwing(walk, Math.PI)} hoof="#14100e" />
    </g>
  );
};
export type Kind = "camel" | "cow" | "sheep";
export const Animal: React.FC<{ kind: Kind; walk?: number; graze?: number; flip?: boolean; s?: number; young?: boolean }> = ({ kind, ...p }) =>
  kind === "camel" ? <Camel {...p} /> : kind === "cow" ? <Cow {...p} /> : <Sheep {...p} />;
/** A herd grazing on the far bank / hillside: n animals by a fixed seed, so it grows without reshuffling.
 * Drawn smaller because they are far away; place it BEHIND the people (never where anyone walks). */
export const Herd: React.FC<{ kind: Kind; n: number; x0: number; x1: number; y0: number; y1: number; frame: number; seed: string; s?: number; o?: number }> = ({ kind, n, x0, x1, y0, y1, frame, seed, s = 0.35, o = 1 }) => {
  // the newest animal fades in instead of popping in, so a growing herd never jumps
  const items = new Array(Math.max(0, Math.ceil(n))).fill(0).map((_, i) => {
    const y = y0 + ((i * 0.7548776 + random(`${seed}y${i}`) * 0.25) % 1) * (y1 - y0);
    const gx = (i * 0.618034 + random(`${seed}r`)) % 1;
    return { x: x0 + (gx + (random(`${seed}x${i}`) - 0.5) * 0.012) * (x1 - x0), y, k: s * (0.8 + 0.4 * (y - y0) / Math.max(1, y1 - y0)), flip: random(`${seed}f${i}`) > 0.5, ph: random(`${seed}p${i}`) * 20, young: random(`${seed}c${i}`) > 0.8, o: Math.min(1, n - i) };
  }).sort((a, b) => a.y - b.y);
  return (
    <g opacity={o}>
      {items.map((a, i) => <g key={i} transform={`translate(${a.x} ${a.y})`} opacity={a.o}><Animal kind={kind} graze={frame * 0.05 + a.ph} flip={a.flip} s={a.k} young={a.young} /></g>)}
    </g>
  );
};
