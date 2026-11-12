import React from "react";

// Reusable 2D cut-out rigs for the series. Characters are faceless by design.
// Every joint is an angle in degrees; poses are plain objects so scenes can blend them over time.

export type Pose = {
  bob: number; // vertical body offset (px, before scale)
  lean: number; // whole-body lean
  head: number;
  armLU: number; // left upper arm (far side)
  armLL: number; // left lower arm
  armRU: number; // right upper arm (near side)
  armRL: number;
  legLU: number;
  legLL: number;
  legRU: number;
  legRL: number;
};

export const STAND: Pose = { bob: 0, lean: 0, head: 0, armLU: 8, armLL: -6, armRU: -8, armRL: -6, legLU: 2, legLL: 0, legRU: -2, legRL: 0 };

export const SIT: Pose = { bob: 0, lean: 0, head: 0, armLU: -20, armLL: -40, armRU: -25, armRL: -45, legLU: -82, legLL: 82, legRU: -88, legRL: 86 };

export const walkPose = (phase: number, energy = 1): Pose => {
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  return {
    bob: -Math.abs(c) * 5 * energy,
    lean: 3 * energy,
    head: s * 2,
    armLU: -s * 26 * energy,
    armLL: -12 - Math.max(0, -s) * 18 * energy,
    armRU: s * 26 * energy,
    armRL: -12 - Math.max(0, s) * 18 * energy,
    legLU: s * 24 * energy,
    legLL: Math.max(0, -c) * 30 * energy,
    legRU: -s * 24 * energy,
    legRL: Math.max(0, c) * 30 * energy,
  };
};

export const blend = (a: Pose, b: Pose, t: number): Pose => {
  const k = Math.max(0, Math.min(1, t));
  const out = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((key) => {
    out[key] = a[key] + (b[key] - a[key]) * k;
  });
  return out;
};

export type Outfit = {
  skin: string;
  robe: string;
  robeShade: string;
  wrap?: string; // head wrap colour
  crown?: boolean;
  spear?: boolean;
  shield?: string;
  cape?: string;
  // ── main-character extras (Episode 2 on): main characters must read clearly apart from the crowd ──
  royal?: boolean; // jewelled crown, gold trim, fur collar, gold belt
  beard?: string; // beard colour
  longBeard?: boolean;
  hood?: string; // hooded cloak colour (covers the head)
  runes?: string; // glowing symbols on the robe hem
  staff?: string; // gnarled staff held in the near hand; value = orb glow colour
  sash?: string; // diagonal sash across the chest
  aura?: string; // soft light around the figure
};

const Limb: React.FC<{ x: number; y: number; a1: number; a2: number; l1: number; l2: number; w: number; color: string; hand?: string; foot?: string; children?: React.ReactNode }> = ({ x, y, a1, a2, l1, l2, w, color, hand, foot, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${a1})`}>
    <line x1={0} y1={0} x2={0} y2={l1} stroke={color} strokeWidth={w} strokeLinecap="round" />
    <g transform={`translate(0 ${l1}) rotate(${a2})`}>
      <line x1={0} y1={0} x2={0} y2={l2} stroke={color} strokeWidth={w * 0.9} strokeLinecap="round" />
      {hand ? <circle cx={0} cy={l2 + 2} r={w * 0.55} fill={hand} /> : null}
      {foot ? <ellipse cx={5} cy={l2 + 2} rx={w * 0.85} ry={w * 0.45} fill={foot} /> : null}
      {children ? <g transform={`translate(0 ${l2})`}>{children}</g> : null}
    </g>
  </g>
);

export type Mood = "neutral" | "smile" | "frown" | "tight" | "shock" | "sneer";

// Mouth only, no eyes (owner's rule from Episode 2 on). `open` 0..1 drives lip-sync; `mood` shows emotion when silent.
const Mouth: React.FC<{ open: number; mood: Mood }> = ({ open, mood }) => {
  const ink = "#3a1a14";
  if (mood === "shock") return <ellipse cx={14} cy={14} rx={4.5} ry={5.5} fill="#2a1210" />;
  if (open > 0.08) {
    const ry = 1.2 + open * 4.2;
    return (
      <g>
        <ellipse cx={14} cy={14} rx={5.2 - open * 0.8} ry={ry} fill="#2a1210" />
        {ry > 3.6 ? <ellipse cx={14} cy={14 + ry * 0.5} rx={2.8} ry={ry * 0.28} fill="#8a3a32" /> : null}
      </g>
    );
  }
  const d =
    mood === "smile" ? "M 8 12.5 Q 14 17.5 20 12.5" :
    mood === "frown" ? "M 8 16.5 Q 14 11 20 16.5" :
    mood === "tight" ? "M 9.5 14 L 18.5 14" :
    mood === "sneer" ? "M 8 15.5 Q 13 14.5 20 10.5" :
    "M 8.5 14 Q 14 15.2 19.5 14";
  return <path d={d} stroke={ink} strokeWidth={mood === "tight" ? 2.8 : 2.2} fill="none" strokeLinecap="round" />;
};

// A person ~260px tall at scale 1, feet at (0,0).
export const Person: React.FC<{ pose: Pose; outfit: Outfit; flip?: boolean; mouth?: number; mood?: Mood; noShadow?: boolean }> = ({ pose, outfit, flip, mouth, mood, noShadow }) => {
  const p = pose;
  const dark = "#2b1d18";
  return (
    <g transform={`scale(${flip ? -1 : 1} 1)`}>
      {outfit.aura ? (
        <g style={{ filter: "blur(18px)" }}>
          <ellipse cx={0} cy={-140} rx={92} ry={150} fill={outfit.aura} opacity={0.28} />
          <ellipse cx={0} cy={-150} rx={60} ry={110} fill={outfit.aura} opacity={0.22} />
        </g>
      ) : null}
      {noShadow ? null : <ellipse cx={0} cy={4} rx={46} ry={9} fill="#000" opacity={0.18} />}
      <g transform={`translate(0 ${p.bob}) rotate(${p.lean} 0 -120)`}>
        {/* far arm */}
        <Limb x={-4} y={-196} a1={p.armLU} a2={p.armLL} l1={52} l2={48} w={15} color={outfit.robeShade} hand={outfit.skin} />
        {/* legs */}
        <Limb x={-10} y={-104} a1={p.legLU} a2={p.legLL} l1={54} l2={50} w={17} color={dark} foot={dark} />
        <Limb x={10} y={-104} a1={p.legRU} a2={p.legRL} l1={54} l2={50} w={17} color={dark} foot={dark} />
        {outfit.cape ? <path d="M -30 -200 Q -60 -120 -48 -70 L 26 -80 L 30 -200 Z" fill={outfit.cape} /> : null}
        {outfit.hood ? <path d="M -34 -214 Q -70 -120 -52 -40 L 34 -46 Q 44 -140 30 -214 Z" fill={outfit.hood} /> : null}
        {/* robe */}
        <path d="M -30 -206 Q 0 -216 30 -206 L 40 -66 Q 0 -56 -40 -66 Z" fill={outfit.robe} />
        <path d="M -30 -206 Q -14 -210 0 -212 L -4 -64 Q -24 -62 -40 -66 Z" fill={outfit.robeShade} opacity={0.5} />
        <rect x={-34} y={-142} width={68} height={10} rx={4} fill={outfit.robeShade} />
        {outfit.royal ? (
          <g>
            <path d="M 2 -210 L 8 -62" stroke="#e3b341" strokeWidth={6} />
            <path d="M -40 -68 Q 0 -58 40 -68" stroke="#e3b341" strokeWidth={6} fill="none" />
            <rect x={-35} y={-143} width={70} height={11} rx={4} fill="#e3b341" />
            <circle cx={4} cy={-137.5} r={5} fill="#b3261e" stroke="#fff1b8" strokeWidth={1.5} />
          </g>
        ) : null}
        {outfit.sash ? <path d="M -28 -206 L -18 -206 L 36 -110 L 26 -104 Z" fill={outfit.sash} /> : null}
        {outfit.runes ? (
          <g fill="none" stroke={outfit.runes} strokeWidth={2.4} opacity={0.9}>
            <path d="M -30 -80 l 6 -10 l 6 10 z" />
            <circle cx={-6} cy={-84} r={5} />
            <path d="M 10 -90 l 0 12 M 4 -84 l 12 0" />
            <path d="M 24 -88 q 6 6 0 12" />
          </g>
        ) : null}
        {outfit.royal && outfit.cape ? <path d="M -36 -214 Q 0 -196 36 -214 Q 30 -196 0 -190 Q -30 -196 -36 -214 Z" fill="#f2ede2" stroke="#d6cdb9" strokeWidth={2} /> : null}
        {/* head */}
        <g transform={`translate(0 -232) rotate(${p.head})`}>
          <circle cx={0} cy={0} r={30} fill={outfit.skin} />
          {outfit.wrap ? (
            <>
              <path d="M -32 -2 Q -34 -38 0 -40 Q 34 -38 32 -2 Q 0 -14 -32 -2 Z" fill={outfit.wrap} />
              {/* with a mouth on the face side, the wrap tail hangs at the back of the head */}
              <path d="M 26 -6 Q 40 20 30 46 L 22 44 Q 28 20 18 0 Z" fill={outfit.wrap} transform={mouth !== undefined || mood ? "scale(-1 1)" : undefined} />
            </>
          ) : null}
          {outfit.beard ? (
            outfit.longBeard ? (
              <path d="M -2 12 Q 8 22 26 14 Q 30 40 18 66 Q 12 80 6 92 Q 0 70 -8 52 Q -14 30 -2 12 Z" fill={outfit.beard} />
            ) : (
              <path d="M -4 10 Q 10 24 28 12 Q 28 30 14 40 Q 2 44 -6 32 Q -10 20 -4 10 Z" fill={outfit.beard} />
            )
          ) : null}
          {outfit.hood ? (
            <>
              <path d="M -40 30 Q -46 -36 0 -46 Q 40 -42 38 -10 Q 30 -18 14 -20 Q -12 -16 -18 30 Z" fill={outfit.hood} />
              <path d="M 38 -10 Q 34 -24 14 -22 Q 26 -12 30 2 Z" fill="#000" opacity={0.35} />
            </>
          ) : null}
          {outfit.royal ? (
            <g>
              <path d="M -27 -24 L -30 -60 L -16 -44 L -6 -70 L 6 -44 L 18 -70 L 26 -44 L 32 -60 L 29 -24 Z" fill="#e8b93a" stroke="#9b6d12" strokeWidth={3} strokeLinejoin="round" />
              <rect x={-29} y={-30} width={59} height={10} rx={3} fill="#c9952e" stroke="#9b6d12" strokeWidth={2} />
              <circle cx={0} cy={-25} r={4.5} fill="#b3261e" />
              <circle cx={-16} cy={-25} r={3.2} fill="#2f6fd0" />
              <circle cx={16} cy={-25} r={3.2} fill="#2f6fd0" />
              {[-30, -6, 18, 32].map((x, i) => <circle key={i} cx={x} cy={[-60, -70, -70, -60][i]} r={3.4} fill="#fff1b8" />)}
            </g>
          ) : null}
          {outfit.crown && !outfit.royal ? (
            <path d="M -26 -26 L -26 -50 L -14 -38 L 0 -56 L 14 -38 L 26 -50 L 26 -26 Z" fill="#e3b341" stroke="#9b6d12" strokeWidth={3} />
          ) : null}
          {mouth !== undefined || mood ? <Mouth open={mouth ?? 0} mood={mood ?? "neutral"} /> : null}
        </g>
        {/* near arm, optionally holding a spear */}
        <Limb x={6} y={-196} a1={p.armRU} a2={p.armRL} l1={52} l2={48} w={16} color={outfit.robe} hand={outfit.skin}>
          {outfit.staff ? (
            <g transform={`rotate(${-(p.armRU + p.armRL)})`}>
              <path d="M 0 70 Q 4 0 -3 -80 Q 6 -150 -2 -190" stroke="#3b2a1e" strokeWidth={7} fill="none" strokeLinecap="round" />
              <path d="M -2 -190 Q -16 -200 -8 -214 M -2 -190 Q 14 -198 8 -214" stroke="#3b2a1e" strokeWidth={5} fill="none" strokeLinecap="round" />
              <circle cx={0} cy={-206} r={30} fill={outfit.staff} opacity={0.22} />
              <circle cx={0} cy={-206} r={11} fill={outfit.staff} />
              <circle cx={-3} cy={-209} r={4} fill="#ffffff" opacity={0.7} />
            </g>
          ) : null}
          {outfit.spear ? (
            <g transform={`rotate(${-(p.armRU + p.armRL)})`}>
              <line x1={0} y1={70} x2={0} y2={-200} stroke="#5a3a22" strokeWidth={6} strokeLinecap="round" />
              <path d="M -9 -196 L 0 -232 L 9 -196 Z" fill="#c9c4b8" />
            </g>
          ) : null}
        </Limb>
        {outfit.beard && outfit.longBeard ? (
          <g transform={`translate(0 -232) rotate(${p.head})`}>
            <path d="M -2 12 Q 8 22 26 14 Q 30 40 18 66 Q 12 80 6 92 Q 0 70 -8 52 Q -14 30 -2 12 Z" fill={outfit.beard} />
            {mouth !== undefined || mood ? <Mouth open={mouth ?? 0} mood={mood ?? "neutral"} /> : null}
          </g>
        ) : null}
        {outfit.shield ? <ellipse cx={-30} cy={-150} rx={30} ry={38} fill={outfit.shield} stroke="#3a2416" strokeWidth={5} /> : null}
      </g>
    </g>
  );
};

// Cartoon war elephant ~420px tall at scale 1, feet at (0,0), facing left.
export const Elephant: React.FC<{ phase: number; earFlap: number; rider?: React.ReactNode }> = ({ phase, earFlap, rider }) => {
  const skin = "#8a7f7a";
  const shade = "#6f6560";
  const leg = (dx: number, off: number, col: string) => {
    const a = Math.sin(phase + off) * 16;
    return (
      <g transform={`translate(${dx} -150) rotate(${a})`}>
        <rect x={-24} y={0} width={48} height={150} rx={20} fill={col} />
        <ellipse cx={0} cy={148} rx={28} ry={10} fill="#e9e0d5" opacity={0.6} />
      </g>
    );
  };
  const trunkSway = Math.sin(phase * 0.5) * 18;
  const bob = -Math.abs(Math.cos(phase)) * 6;
  return (
    <g>
      <ellipse cx={0} cy={6} rx={170} ry={16} fill="#000" opacity={0.18} />
      <g transform={`translate(0 ${bob})`}>
        {leg(-80, Math.PI, shade)}
        {leg(90, 0, shade)}
        <path d={`M 160 -220 Q 196 -200 ${190 + Math.sin(phase) * 8} -150`} stroke={shade} strokeWidth={8} fill="none" strokeLinecap="round" />
        <ellipse cx={20} cy={-230} rx={180} ry={120} fill={skin} />
        <ellipse cx={30} cy={-190} rx={150} ry={70} fill={shade} opacity={0.25} />
        {leg(-50, 0, skin)}
        {leg(120, Math.PI, skin)}
        {/* blanket + howdah */}
        <path d="M -80 -330 Q 30 -360 140 -330 L 130 -230 Q 30 -210 -70 -230 Z" fill="#8f2a1c" />
        <path d="M -80 -330 Q 30 -360 140 -330" stroke="#e3b341" strokeWidth={8} fill="none" />
        {/* low saddle with a banner pole; the rider (if any) sits on it */}
        <path d="M -10 -352 Q 40 -372 110 -352 L 104 -330 Q 40 -346 -4 -330 Z" fill="#e3b341" />
        <line x1={100} y1={-350} x2={100} y2={-520} stroke="#3a2416" strokeWidth={6} />
        <path d={`M 100 -520 Q ${140 + Math.sin(phase * 1.3) * 6} ${-512 + Math.sin(phase) * 4} 180 -500 L 100 -480 Z`} fill="#b3261e" />
        {rider ? <g transform="translate(40 -222)">{rider}</g> : null}
        {/* head, ear, trunk, tusk */}
        <circle cx={-160} cy={-250} r={86} fill={skin} />
        <path d={`M -150 -300 Q ${-60 - earFlap * 30} -320 ${-70 - earFlap * 25} -230 Q -90 -160 -150 -190 Z`} fill={shade} />
        <path d={`M -220 -220 Q -270 -140 ${-250 + trunkSway} -60 Q ${-245 + trunkSway} -30 ${-215 + trunkSway} -50`} stroke={skin} strokeWidth={40} fill="none" strokeLinecap="round" />
        <path d="M -200 -200 Q -250 -170 -262 -200" stroke="#f3ead8" strokeWidth={14} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};
