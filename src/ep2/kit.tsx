import React from "react";
import { useCurrentFrame } from "remotion";
import { Person, Pose, Outfit, Mood, STAND, walkPose } from "../cartoon/Rig";
import VO from "./vo.json";

// Episode 2 kit: everything is timed to the locked voice track (src/ep2/vo.json, built by tools/ep2_data.py).
// Scenes are painted on the same square 1920×1920 world as Episode 1 v2, so 16:9 and 9:16 are both framed natively.
export * from "../ep1v2/kit2";

type Line = { f0: number; f1: number; kind: string };
export type Cap = { from: number; to: number; who: string | null; words: { t: number; w: string }[] };
export const V = VO as unknown as { fps: number; total: number; lines: Record<string, Line>; caps: Cap[]; mouth: Record<string, number[]> };
/** frame where a line starts (+ seconds) / ends */
export const lf = (id: string, off = 0) => V.lines[id].f0 + Math.round(off * 30);
export const le = (id: string) => V.lines[id].f1;
/** frame where a word of a line is spoken (first match, or nth) */
export const wf = (id: string, word: string, nth = 0) => {
  const l = V.lines[id];
  const clean = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");
  for (const exact of [true, false]) {
    let k = 0;
    for (const c of V.caps) {
      if (c.from < l.f0 - 2 || c.from > l.f1) continue;
      for (const w of c.words) if ((exact ? clean(w.w) === word : clean(w.w).startsWith(word)) && k++ === nth) return w.t;
    }
  }
  return l.f0;
};

/** Scenes sit inside Sequences; Abs carries the scene's first frame so scenes can read the episode clock. */
export const Abs = React.createContext(0);
export const useAbs = () => React.useContext(Abs) + useCurrentFrame();
/** Lip-sync: how open the mouth is right now for a character line (0..1), from that line's own audio.
 * A syllable rhythm is mixed in so a loud, sustained line still opens and closes instead of holding open. */
export const useMouth = (...ids: string[]) => {
  const a = useAbs();
  for (const id of ids) {
    const env = V.mouth[id];
    const i = a - V.lines[id].f0;
    if (env && i >= 0 && i < env.length) {
      const v = Math.max(0, Math.min(1, ((env[i] * 0.65 + (env[i - 1] ?? env[i]) * 0.35) - 0.1) * 1.3));
      return v * (0.45 + 0.55 * Math.abs(Math.sin(i * 0.62)));
    }
  }
  return 0;
};
/** 0..1, easing in and out, while any of these lines is being spoken: for calm, slow gestures (never tied to the mouth). */
export const useTalk = (...ids: string[]) => {
  const a = useAbs();
  let t = 0;
  for (const id of ids) {
    const l = V.lines[id];
    if (!l) continue;
    t = Math.max(t, Math.min(1, Math.max(0, (a - l.f0 + 4) / 12)) * Math.min(1, Math.max(0, (l.f1 + 6 - a) / 12)));
  }
  return t;
};
/** a walk cycle driven by distance travelled, so feet never step on the spot */
export const walkBy = (x: number, s = 2, energy = 0.9) => walkPose(x * (3.1 / (60 * s)), energy);

/** A Rig figure (mouth, no eyes) placed by its feet. ~260 px tall at s = 1; hips are 104·s above the feet. */
export const Actor: React.FC<{ x: number; y: number; s?: number; pose?: Pose; outfit: Outfit; flip?: boolean; mouth?: number; mood?: Mood; o?: number; blur?: number; seat?: "ground" | "chair"; hold?: React.ReactNode }> = ({ x, y, s = 2, pose = STAND, outfit, flip, mouth, mood, o = 1, blur, seat, hold }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} style={blur ? { filter: `blur(${blur}px)` } : undefined}>
    {seat === "ground" ? <ellipse cx={flip ? -14 : 14} cy={-90} rx={74} ry={10} fill="#000" opacity={0.2} /> : null}
    <Person pose={pose} outfit={outfit} flip={flip} mouth={mouth} mood={mood} noShadow={!!seat} hold={hold} />
  </g>
);
/** things a hand can hold (drawn at the hand, in figure units) */
export const Cane: React.FC = () => <line x1={0} y1={-10} x2={10} y2={150} stroke="#5a3a22" strokeWidth={6} strokeLinecap="round" />;
export const Shovel: React.FC<{ color?: string }> = ({ color = "#120a06" }) => (<g><line x1={-6} y1={-40} x2={14} y2={120} stroke={color} strokeWidth={6} strokeLinecap="round" /><path d="M 2 116 L 26 112 L 22 150 Q 14 160 6 150 Z" fill={color} /></g>);
export const Sword: React.FC<{ color?: string }> = ({ color = "#120a06" }) => (<g><path d="M -3 4 L 3 4 L 2 -150 L 0 -164 L -2 -150 Z" fill={color} /><rect x={-14} y={0} width={28} height={7} fill={color} /></g>);
export const Stone: React.FC = () => <circle cx={0} cy={6} r={9} fill="#6b6257" stroke="#2b1d18" strokeWidth={2.5} />;
/** feet origin for a figure whose hips rest on a seat top (chair) or on the ground (cross-legged) */
export const sitY = (seatTop: number, s: number, ground = false) => seatTop + (ground ? 92 : 104) * s;
export const Gift: React.FC<{ c?: string }> = ({ c = "#9b1b26" }) => (
  <g transform="translate(14 -6)">
    <rect x={-24} y={-22} width={48} height={40} rx={4} fill={c} stroke="#2b1d18" strokeWidth={3} />
    <rect x={-4} y={-22} width={8} height={40} fill="#e3b341" /><rect x={-24} y={-6} width={48} height={8} fill="#e3b341" />
    <path d="M 0 -22 Q -16 -40 -18 -24 Q -10 -20 0 -22 Q 16 -40 18 -24 Q 10 -20 0 -22 Z" fill="#e3b341" stroke="#2b1d18" strokeWidth={2} />
  </g>
);
export const HandSpots: React.FC<{ o: number }> = ({ o }) => <g fill="#7a2f2a" opacity={o}><circle cx={-3} cy={3} r={3.2} /><circle cx={4} cy={7} r={2.6} /></g>;
