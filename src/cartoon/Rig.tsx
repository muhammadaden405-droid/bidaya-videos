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

// A person ~260px tall at scale 1, feet at (0,0).
export const Person: React.FC<{ pose: Pose; outfit: Outfit; flip?: boolean }> = ({ pose, outfit, flip }) => {
  const p = pose;
  const dark = "#2b1d18";
  return (
    <g transform={`scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx={0} cy={4} rx={46} ry={9} fill="#000" opacity={0.18} />
      <g transform={`translate(0 ${p.bob}) rotate(${p.lean} 0 -120)`}>
        {/* far arm */}
        <Limb x={-4} y={-196} a1={p.armLU} a2={p.armLL} l1={52} l2={48} w={15} color={outfit.robeShade} hand={outfit.skin} />
        {/* legs */}
        <Limb x={-10} y={-104} a1={p.legLU} a2={p.legLL} l1={54} l2={50} w={17} color={dark} foot={dark} />
        <Limb x={10} y={-104} a1={p.legRU} a2={p.legRL} l1={54} l2={50} w={17} color={dark} foot={dark} />
        {outfit.cape ? <path d="M -30 -200 Q -60 -120 -48 -70 L 26 -80 L 30 -200 Z" fill={outfit.cape} /> : null}
        {/* robe */}
        <path d="M -30 -206 Q 0 -216 30 -206 L 40 -66 Q 0 -56 -40 -66 Z" fill={outfit.robe} />
        <path d="M -30 -206 Q -14 -210 0 -212 L -4 -64 Q -24 -62 -40 -66 Z" fill={outfit.robeShade} opacity={0.5} />
        <rect x={-34} y={-142} width={68} height={10} rx={4} fill={outfit.robeShade} />
        {/* head (faceless) */}
        <g transform={`translate(0 -232) rotate(${p.head})`}>
          <circle cx={0} cy={0} r={30} fill={outfit.skin} />
          {outfit.wrap ? (
            <>
              <path d="M -32 -2 Q -34 -38 0 -40 Q 34 -38 32 -2 Q 0 -14 -32 -2 Z" fill={outfit.wrap} />
              <path d="M 26 -6 Q 40 20 30 46 L 22 44 Q 28 20 18 0 Z" fill={outfit.wrap} />
            </>
          ) : null}
          {outfit.crown ? (
            <path d="M -26 -26 L -26 -50 L -14 -38 L 0 -56 L 14 -38 L 26 -50 L 26 -26 Z" fill="#e3b341" stroke="#9b6d12" strokeWidth={3} />
          ) : null}
        </g>
        {/* near arm, optionally holding a spear */}
        <Limb x={6} y={-196} a1={p.armRU} a2={p.armRL} l1={52} l2={48} w={16} color={outfit.robe} hand={outfit.skin}>
          {outfit.spear ? (
            <g transform={`rotate(${-(p.armRU + p.armRL)})`}>
              <line x1={0} y1={70} x2={0} y2={-200} stroke="#5a3a22" strokeWidth={6} strokeLinecap="round" />
              <path d="M -9 -196 L 0 -232 L 9 -196 Z" fill="#c9c4b8" />
            </g>
          ) : null}
        </Limb>
        {outfit.shield ? <ellipse cx={-30} cy={-150} rx={30} ry={38} fill={outfit.shield} stroke="#3a2416" strokeWidth={5} /> : null}
      </g>
    </g>
  );
};

// Cartoon war elephant ~420px tall at scale 1, feet at (0,0), facing left.
export const Elephant: React.FC<{ phase: number; earFlap: number }> = ({ phase, earFlap }) => {
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
        <rect x={-30} y={-420} width={120} height={80} rx={10} fill="#6b3b1f" />
        <path d="M -40 -420 L 30 -470 L 100 -420 Z" fill="#8f2a1c" />
        <line x1={30} y1={-470} x2={30} y2={-560} stroke="#3a2416" strokeWidth={6} />
        <path d={`M 30 -560 Q ${70 + Math.sin(phase * 1.3) * 6} ${-552 + Math.sin(phase) * 4} 110 -540 L 30 -520 Z`} fill="#b3261e" />
        {/* head, ear, trunk, tusk */}
        <circle cx={-160} cy={-250} r={86} fill={skin} />
        <path d={`M -150 -300 Q ${-60 - earFlap * 30} -320 ${-70 - earFlap * 25} -230 Q -90 -160 -150 -190 Z`} fill={shade} />
        <path d={`M -220 -220 Q -270 -140 ${-250 + trunkSway} -60 Q ${-245 + trunkSway} -30 ${-215 + trunkSway} -50`} stroke={skin} strokeWidth={40} fill="none" strokeLinecap="round" />
        <path d="M -200 -200 Q -250 -170 -262 -200" stroke="#f3ead8" strokeWidth={14} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};
