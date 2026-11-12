import React from "react";
import { useCurrentFrame } from "remotion";
import { Person, Pose, Outfit, Mood, STAND } from "../cartoon/Rig";
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
  let k = 0;
  for (const c of V.caps) {
    if (c.from < l.f0 - 2 || c.from > l.f1) continue;
    for (const w of c.words) if (w.w.toLowerCase().replace(/[^a-z']/g, "").startsWith(word) && k++ === nth) return w.t;
  }
  return l.f0;
};

/** Scenes sit inside Sequences; Abs carries the scene's first frame so scenes can read the episode clock. */
export const Abs = React.createContext(0);
export const useAbs = () => React.useContext(Abs) + useCurrentFrame();
/** Lip-sync: how open the mouth is right now for a character line (0..1), from that line's own audio. */
export const useMouth = (...ids: string[]) => {
  const a = useAbs();
  for (const id of ids) {
    const env = V.mouth[id];
    const i = a - V.lines[id].f0;
    if (env && i >= 0 && i < env.length) return Math.max(0, Math.min(1, ((env[i] * 0.65 + (env[i - 1] ?? env[i]) * 0.35) - 0.1) * 1.3));
  }
  return 0;
};

/** A Rig figure (mouth, no eyes) placed by its feet. ~260 px tall at s = 1; hips are 104·s above the feet. */
export const Actor: React.FC<{ x: number; y: number; s?: number; pose?: Pose; outfit: Outfit; flip?: boolean; mouth?: number; mood?: Mood; o?: number; blur?: number; seat?: "ground" | "chair" }> = ({ x, y, s = 2, pose = STAND, outfit, flip, mouth, mood, o = 1, blur, seat }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} style={blur ? { filter: `blur(${blur}px)` } : undefined}>
    {seat === "ground" ? <ellipse cx={flip ? -14 : 14} cy={-90} rx={74} ry={10} fill="#000" opacity={0.2} /> : null}
    <Person pose={pose} outfit={outfit} flip={flip} mouth={mouth} mood={mood} noShadow={!!seat} />
  </g>
);
/** feet origin for a figure whose hips rest on a seat top (chair) or on the ground (cross-legged) */
export const sitY = (seatTop: number, s: number, ground = false) => seatTop + (ground ? 92 : 104) * s;
