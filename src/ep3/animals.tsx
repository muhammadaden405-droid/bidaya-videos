import React from "react";
import { random } from "remotion";
import { Camel } from "../ep1/kit";

// Episode 3 animals (feet at y = 0, facing right; flip to face left). Grazing = slow head bob, no walking on the spot.
export const Cow: React.FC<{ graze?: number; flip?: boolean; s?: number; calf?: boolean; preg?: boolean }> = ({ graze = 0, flip, s = 1, calf, preg }) => {
  const c = "#6b4a33", d = "#4e3423", w = "#efe6d6";
  const head = Math.sin(graze) * 6;
  return (
    <g transform={`scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={4} rx={105} ry={10} fill="#000" opacity={0.16} />
      {[-62, -40, 50, 72].map((x, i) => <rect key={i} x={x - 8} y={-92} width={16} height={92} rx={6} fill={i % 2 ? c : d} />)}
      <path d={`M -100 -150 Q -108 -95 -80 -88 L 80 -88 Q ${preg ? 112 : 100} ${preg ? -70 : -95} 96 -150 Q 0 -170 -100 -150 Z`} fill={c} />
      <ellipse cx={-30} cy={-130} rx={26} ry={16} fill={w} opacity={0.9} /><ellipse cx={40} cy={-110} rx={20} ry={12} fill={w} opacity={0.9} />
      <path d="M -100 -140 Q -122 -120 -116 -80" stroke={d} strokeWidth={6} fill="none" />
      <g transform={`translate(98 ${-138 + head}) rotate(${18 + head})`}>
        <path d="M 0 -20 Q 46 -24 56 6 Q 52 30 22 28 Q 0 22 0 -20 Z" fill={c} />
        <ellipse cx={48} cy={16} rx={13} ry={10} fill="#d8b0a0" />
        <path d="M 8 -18 Q 4 -36 -10 -40 M 22 -20 Q 26 -38 40 -42" stroke="#e9dcc6" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      {calf ? <g transform="translate(-40 0) scale(0.42)"><Cow graze={graze + 1} /></g> : null}
    </g>
  );
};
export const Sheep: React.FC<{ graze?: number; flip?: boolean; s?: number; lamb?: boolean; preg?: boolean }> = ({ graze = 0, flip, s = 1, lamb, preg }) => {
  const head = Math.sin(graze) * 5;
  return (
    <g transform={`scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={3} rx={62} ry={8} fill="#000" opacity={0.15} />
      {[-34, -18, 22, 38].map((x, i) => <rect key={i} x={x - 5} y={-50} width={10} height={50} rx={4} fill="#3a2e28" />)}
      <g fill="#f1ebdd" stroke="#cfc6b3" strokeWidth={2}>
        {[-40, -18, 6, 30].map((x, i) => <circle key={i} cx={x} cy={-78} r={preg ? 30 : 26} />)}
        {[-28, -4, 20].map((x, i) => <circle key={i} cx={x} cy={-96} r={24} />)}
      </g>
      <g transform={`translate(50 ${-86 + head}) rotate(${22 + head})`}>
        <ellipse cx={14} cy={4} rx={20} ry={14} fill="#3a2e28" />
        <ellipse cx={0} cy={-6} rx={12} ry={6} fill="#3a2e28" transform="rotate(-30)" />
      </g>
      {lamb ? <g transform="translate(-30 0) scale(0.45)"><Sheep graze={graze + 1} /></g> : null}
    </g>
  );
};
/** A herd spread over a valley floor: n animals placed by a fixed seed, so the herd grows without reshuffling. */
export const Herd: React.FC<{ kind: "camel" | "cow" | "sheep"; n: number; x0: number; x1: number; y0: number; y1: number; frame: number; seed: string; s?: number; o?: number }> = ({ kind, n, x0, x1, y0, y1, frame, seed, s = 1, o = 1 }) => {
  const items = new Array(Math.max(0, Math.floor(n))).fill(0).map((_, i) => {
    const y = y0 + random(`${seed}y${i}`) * (y1 - y0);
    return { x: x0 + random(`${seed}x${i}`) * (x1 - x0), y, k: (0.55 + 0.45 * (y - y0) / Math.max(1, y1 - y0)) * s, flip: random(`${seed}f${i}`) > 0.5, ph: random(`${seed}p${i}`) * 6 };
  }).sort((a, b) => a.y - b.y);
  return (
    <g opacity={o}>
      {items.map((a, i) => (
        <g key={i} transform={`translate(${a.x} ${a.y}) scale(${a.k})`}>
          {kind === "camel" ? <Camel phase={a.ph} walk={0} flip={a.flip} /> : kind === "cow" ? <Cow graze={frame * 0.05 + a.ph} flip={a.flip} /> : <Sheep graze={frame * 0.06 + a.ph} flip={a.flip} />}
        </g>
      ))}
    </g>
  );
};
