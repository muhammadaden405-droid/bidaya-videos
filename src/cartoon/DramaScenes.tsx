import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Person, STAND, SIT, Pose, blend, walkPose } from "./Rig";
import { Layer, Cam, Palace, KING, GUARD, BOY, FOLK, W, H } from "./Trailer";
import { amiri, serif } from "../fonts";

// Extra scenes for the dramatic People of the Trench trailer.
// Everything follows the hadith of Ṣuhayb as quoted by Ibn Kathīr (al-Bidāya 3/23–27).
// Characters are faceless; no one is shown being harmed — danger is told through motion, sound and cuts.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Camera shake that decays after each hit.
export const shake = (frame: number, hits: number[], strength = 14) => {
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const t = frame - h;
    if (t >= 0 && t < 24) {
      const k = (1 - t / 24) * strength;
      x += Math.sin(t * 2.7 + h) * k;
      y += Math.cos(t * 3.1 + h) * k;
    }
  }
  return { x, y };
};

// Cold open — black, then the line that frames the trailer.
export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = interpolate(frame, [12, 34, durationInFrames - 14, durationInFrames], [0, 1, 1, 0], clamp);
  const b = interpolate(frame, [30, 50, durationInFrames - 14, durationInFrames], [0, 1, 1, 0], clamp);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", transform: `scale(${zoom})` }}>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 64, letterSpacing: 3, color: "#f3e6cc", opacity: a }}>A story told by the Prophet ﷺ</div>
        <div style={{ fontFamily: serif, fontSize: 30, letterSpacing: 6, color: "#b39a74", marginTop: 18, opacity: b }}>FROM ṢAḤĪḤ MUSLIM</div>
      </div>
    </AbsoluteFill>
  );
};

// The boy is taken up a mountain; the mountain shakes and the soldiers are thrown off — only the boy remains.
export const MountainShot: React.FC<{ hitAt?: number }> = ({ hitAt }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const hit = hitAt ?? Math.round(durationInFrames * 0.42);
  const s = shake(frame, [hit, hit + 10, hit + 22], 18);
  const cam: Cam = { x: s.x, y: s.y + interpolate(frame, [0, durationInFrames], [-330, -380]), zoom: interpolate(frame, [0, durationInFrames], [1.45, 1.7], { easing: Easing.inOut(Easing.sin) }) };
  const fall = interpolate(frame, [hit + 4, hit + 30], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const rocks = new Array(26).fill(0).map((_, i) => {
    const t = Math.max(0, frame - hit - random(`rt${i}`) * 20);
    return { x: 700 + random(`rx${i}`) * 520 + t * (random(`rv${i}`) - 0.5) * 4, y: 420 + t * t * 0.35, r: 6 + random(`rr${i}`) * 14, o: t > 0 ? 1 : 0 };
  });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#1a1030 0%, #5a2a40 50%, #c4643a 78%)" }}>
      <Layer d={0.15} cam={cam}><path d="M -400 760 L 200 520 L 520 680 L 900 470 L 1300 650 L 1700 500 L 2300 720 L 2300 1300 L -400 1300 Z" fill="#3d2340" /></Layer>
      <Layer d={0.6} cam={cam}>
        {/* the mountain */}
        <path d="M 260 1200 L 760 470 L 860 430 L 1080 440 L 1200 500 L 1700 1200 Z" fill="#2a1820" />
        <path d="M 760 470 L 860 430 L 1080 440 L 1200 500 L 1120 520 L 980 470 L 860 490 Z" fill="#3b2430" />
        {rocks.map((r, i) => <circle key={i} cx={r.x} cy={r.y} r={r.r} fill="#1e1218" opacity={r.o} />)}
        {/* soldiers on the summit: thrown off when it shakes */}
        {[-150, -70, 70, 150].map((dx, i) => (
          <g key={i} transform={`translate(${960 + dx + Math.sign(dx) * fall * 260} ${450 + fall * 520}) rotate(${Math.sign(dx) * fall * 120}) scale(0.42)`} opacity={1 - fall}>
            <Person pose={{ ...STAND, armRU: -40 - fall * 120, armLU: 40 + fall * 120 }} outfit={GUARD} flip={dx > 0} />
          </g>
        ))}
        {/* the boy stands firm */}
        <g transform="translate(960 448) scale(0.4)"><Person pose={STAND} outfit={BOY} /></g>
      </Layer>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

// Out to sea in a small boat; a storm, a great wave — and the boy walks back alone.
export const SeaShot: React.FC<{ waveAt?: number }> = ({ waveAt }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const wave = waveAt ?? Math.round(durationInFrames * 0.45);
  const s = shake(frame, [wave], 16);
  const cam: Cam = { x: s.x, y: s.y, zoom: interpolate(frame, [0, durationInFrames], [1.0, 1.15]) };
  const rock = Math.sin(frame * 0.18) * 9 + (frame > wave - 15 ? Math.sin(frame * 0.5) * 18 : 0);
  const sink = interpolate(frame, [wave, wave + 20], [0, 1], clamp);
  const flash = interpolate(frame, [wave - 30, wave - 27, wave - 22], [0, 0.85, 0], clamp) + interpolate(frame, [wave - 8, wave - 6, wave], [0, 0.6, 0], clamp);
  const big = interpolate(frame, [wave - 20, wave + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const after = interpolate(frame, [wave + 26, wave + 40], [0, 1], clamp);
  const sea = (y: number, amp: number, k: number, ph: number) => {
    let d = `M -400 ${y}`;
    for (let x = -400; x <= 2400; x += 40) d += ` L ${x} ${y + Math.sin(x * k + frame * 0.12 + ph) * amp}`;
    return d + ` L 2400 1400 L -400 1400 Z`;
  };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#05070f 0%, #141c33 60%, #1d2a44 100%)" }}>
      <Layer d={0.1} cam={cam}>
        {new Array(6).fill(0).map((_, i) => <ellipse key={i} cx={200 + i * 340} cy={180 + (i % 2) * 60} rx={260} ry={70} fill="#0d1222" opacity={0.9} />)}
      </Layer>
      <Layer d={0.4} cam={cam}><path d={sea(640, 22, 0.006, 0)} fill="#1a2944" /></Layer>
      <Layer d={0.8} cam={cam}>
        <path d={sea(700, 34, 0.008, 1.3)} fill="#22375a" />
        {/* the boat */}
        <g transform={`translate(960 ${700 + sink * 240}) rotate(${rock + sink * 40})`} opacity={1 - after}>
          <path d="M -230 -20 L 230 -20 L 170 60 L -170 60 Z" fill="#4a2e1c" />
          <line x1={0} y1={-20} x2={0} y2={-260} stroke="#2b1a10" strokeWidth={10} />
          <path d={`M 6 -250 Q ${120 + Math.sin(frame * 0.3) * 20} -160 6 -60 Z`} fill="#c9b79a" />
          {[-150, -80, 90, 160].map((dx, i) => <g key={i} transform={`translate(${dx} -20) scale(0.36)`}><Person pose={{ ...STAND, lean: rock }} outfit={GUARD} /></g>)}
          <g transform="translate(20 -20) scale(0.34)"><Person pose={STAND} outfit={BOY} /></g>
        </g>
        {/* the great wave */}
        <path d={`M -400 ${1300 - big * 760} Q 400 ${1100 - big * 900} 960 ${1250 - big * 800} T 2400 ${1300 - big * 700} L 2400 1500 L -400 1500 Z`} fill="#2c4a73" opacity={big * (1 - after)} />
      </Layer>
      {/* afterwards: the boy alone on the shore at dawn */}
      <AbsoluteFill style={{ opacity: after, background: "linear-gradient(#2a2440 0%, #7a4a52 55%, #d48a5a 75%)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <path d={sea(760, 10, 0.01, 0)} fill="#3a4a6a" />
          <path d="M -100 900 Q 900 820 2100 880 L 2100 1200 L -100 1200 Z" fill="#c4a27a" />
          <g transform={`translate(${780 + (frame - wave - 26) * 3} 900) scale(0.62)`}><Person pose={walkPose(frame * 0.2)} outfit={BOY} /></g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#dfe8ff", opacity: flash }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

// The boy tells the king how he can be killed — the two face each other across the hall.
export const CounselShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cam: Cam = { x: interpolate(frame, [0, durationInFrames], [-60, 60]), y: 0, zoom: interpolate(frame, [0, durationInFrames], [1.15, 1.3]) };
  const lean = interpolate(frame, [20, 50], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#120a16" }}>
      <Palace cam={cam} frame={frame} />
      <Layer d={1} cam={cam}>
        <path d="M 520 760 L 520 520 Q 600 470 680 520 L 680 760 Z" fill="#c9952e" />
        <path d="M 540 750 L 540 540 Q 600 505 660 540 L 660 750 Z" fill="#7a1420" />
        <g transform="translate(580 800) scale(0.9)"><Person pose={blend(SIT, { ...SIT, lean: 12, head: 8 }, lean)} outfit={KING} /></g>
        <g transform="translate(1260 850) scale(0.62)"><Person pose={blend(STAND, { ...STAND, armRU: -95, armRL: -10, head: 4 }, lean)} outfit={BOY} flip /></g>
      </Layer>
    </AbsoluteFill>
  );
};

// The king draws his bow before the gathered people — seen from behind; cut to black before the release.
export const BowShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const draw = interpolate(frame, [10, durationInFrames - 20], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cam: Cam = { x: 0, y: interpolate(frame, [0, durationInFrames], [0, -40]), zoom: interpolate(frame, [0, durationInFrames], [1.0, 1.45], { easing: Easing.in(Easing.cubic) }) };
  const pull = draw * 70;
  const tremble = draw > 0.85 ? Math.sin(frame * 2.3) * 2 : 0;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#2b1d34 0%, #6b3b45 55%, #b8704a 80%)" }}>
      <Layer d={0.2} cam={cam}><path d="M -400 700 L 300 620 L 800 680 L 1300 610 L 2300 700 L 2300 1300 L -400 1300 Z" fill="#3b2232" /></Layer>
      <Layer d={0.55} cam={cam}>
        <rect x={-600} y={700} width={3200} height={600} fill="#4a2a24" />
        {/* the gathered people in the distance */}
        {new Array(30).fill(0).map((_, i) => (
          <g key={i} transform={`translate(${80 + i * 62 + (i % 2) * 20} ${720 + (i % 3) * 14}) scale(0.26)`} opacity={0.85}>
            <Person pose={{ ...STAND, head: Math.sin(frame * 0.05 + i) * 3 }} outfit={FOLK(i)} />
          </g>
        ))}
      </Layer>
      <Layer d={1} cam={cam}>
        {/* the king from behind, bow raised toward the distance */}
        <g transform={`translate(960 1120) scale(1.5)`}>
          <Person pose={{ ...STAND, armRU: -100, armRL: -5, armLU: -80 + draw * 10, armLL: -60, head: -4 }} outfit={KING} />
          <g transform={`translate(${-40 + tremble} -330)`}>
            <path d={`M 0 -120 Q ${-60 - pull * 0.4} 0 0 120`} stroke="#3a2416" strokeWidth={9} fill="none" />
            <path d={`M 0 -120 L ${-pull} 0 L 0 120`} stroke="#e8dcc2" strokeWidth={2.5} fill="none" />
            <line x1={-pull} y1={0} x2={170 - pull} y2={0} stroke="#5a3a22" strokeWidth={5} />
            <path d={`M ${170 - pull} -9 L ${200 - pull} 0 L ${170 - pull} 9 Z`} fill="#c9c4b8" />
          </g>
        </g>
      </Layer>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};

// "We believe in the Lord of the boy!" — the crowd rises, hands raised, into the light.
export const CrowdShot: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cam: Cam = { x: 0, y: interpolate(frame, [0, durationInFrames], [30, -30]), zoom: interpolate(frame, [0, durationInFrames], [1.05, 1.2]) };
  const light = interpolate(frame, [0, durationInFrames], [0.2, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(#2a2440 0%, #7a4a52 ${45 - light * 10}%, #f2b46a 80%)` }}>
      <Layer d={0.05} cam={cam}><circle cx={960} cy={760} r={160 + light * 60} fill="#fff1c9" opacity={0.6 + light * 0.3} /></Layer>
      <Layer d={0.4} cam={cam}><path d="M -400 780 L 400 700 L 960 760 L 1500 690 L 2300 780 L 2300 1300 L -400 1300 Z" fill="#4a2a3a" /></Layer>
      <Layer d={1} cam={cam}>
        {new Array(16).fill(0).map((_, i) => {
          const row = i < 8 ? 0 : 1;
          const x = row === 0 ? 180 + i * 225 : 80 + (i - 8) * 250;
          const t = interpolate(frame, [10 + (i % 8) * 3, 30 + (i % 8) * 3], [0, 1], clamp);
          const pose: Pose = blend({ ...STAND }, { ...STAND, armRU: -170, armRL: -4, head: -10 }, t);
          return (
            <g key={i} transform={`translate(${x} ${row === 0 ? 900 : 1050}) scale(${row === 0 ? 0.62 : 0.8})`}>
              <Person pose={pose} outfit={FOLK(i)} />
            </g>
          );
        })}
      </Layer>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 70%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};
