import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, random } from "remotion";
import { amiri, serif } from "../fonts";

// Style A — cinematic silhouettes against a dusk sky.
// Abraha's army, led by an elephant, marches across the desert toward the valley of Makkah.

const W = 1920;
const H = 1080;

const Elephant: React.FC<{ x: number; y: number; step: number; scale?: number }> = ({ x, y, step, scale = 1 }) => {
  const swing = Math.sin(step) * 6;
  const trunk = Math.sin(step * 0.5) * 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#140a08">
      {/* legs */}
      <rect x={-70 + swing} y={20} width={30} height={95} rx={10} />
      <rect x={-30 - swing} y={20} width={30} height={95} rx={10} />
      <rect x={45 + swing} y={20} width={30} height={95} rx={10} />
      <rect x={85 - swing} y={20} width={30} height={95} rx={10} />
      {/* body */}
      <ellipse cx={20} cy={0} rx={115} ry={78} />
      {/* head */}
      <ellipse cx={-105} cy={-25} rx={55} ry={52} />
      {/* ear */}
      <ellipse cx={-80} cy={-20} rx={34} ry={46} fill="#1c100b" />
      {/* trunk */}
      <path d={`M -150 -20 Q -185 40 ${-170 + trunk} 105 L ${-152 + trunk} 105 Q -160 45 -128 5 Z`} />
      {/* tusk */}
      <path d="M -140 20 Q -175 40 -190 25" stroke="#d9c7a0" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />
      {/* tail */}
      <path d={`M 133 -10 Q 150 30 ${140 + swing} 60`} stroke="#140a08" strokeWidth={6} fill="none" />
      {/* howdah (seat) with banner */}
      <rect x={-20} y={-110} width={90} height={45} rx={6} />
      <line x1={25} y1={-110} x2={25} y2={-200} stroke="#140a08" strokeWidth={5} />
      <path d={`M 25 -200 L ${85 + swing} ${-188 + swing / 2} L 25 -170 Z`} fill="#3a1410" />
    </g>
  );
};

const Soldier: React.FC<{ x: number; y: number; step: number; scale: number }> = ({ x, y, step, scale }) => {
  const bob = Math.abs(Math.sin(step)) * 4;
  const leg = Math.sin(step) * 10;
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${scale})`} fill="#140a08" stroke="#140a08">
      <circle cx={0} cy={-62} r={11} stroke="none" />
      <path d="M -13 -50 L 13 -50 L 17 -8 L -17 -8 Z" stroke="none" />
      <line x1={-5} y1={-8} x2={-5 + leg} y2={22} strokeWidth={7} strokeLinecap="round" />
      <line x1={5} y1={-8} x2={5 - leg} y2={22} strokeWidth={7} strokeLinecap="round" />
      <line x1={-20} y1={-95} x2={-14} y2={10} strokeWidth={3} />
      <path d="M -22 -108 L -17 -92 L -24 -92 Z" stroke="none" />
      <ellipse cx={15} cy={-34} rx={8} ry={16} stroke="none" />
    </g>
  );
};

export const SilhouetteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const zoom = interpolate(t, [0, 1], [1.0, 1.12]);
  const sunY = interpolate(t, [0, 1], [610, 700]);
  const starOpacity = interpolate(t, [0.25, 0.9], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const armyX = interpolate(frame, [0, durationInFrames], [1250, 650]);
  const step = frame * 0.22;
  const titleIn = interpolate(frame, [15, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const stars = new Array(70).fill(0).map((_, i) => ({
    x: random(`sx${i}`) * W,
    y: random(`sy${i}`) * 420,
    r: 0.8 + random(`sr${i}`) * 1.6,
    tw: 0.6 + 0.4 * Math.sin(frame * 0.1 + i),
  }));
  const dust = new Array(40).fill(0).map((_, i) => {
    const speed = 0.6 + random(`ds${i}`) * 1.4;
    return {
      x: (random(`dx${i}`) * W * 1.2 - frame * speed * 2 + W * 2) % (W * 1.2),
      y: 760 + random(`dy${i}`) * 260 - Math.sin(frame * 0.03 + i) * 10,
      r: 1 + random(`dr${i}`) * 2.5,
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f1f" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ transform: `scale(${zoom})`, transformOrigin: "40% 70%" }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d1236" />
            <stop offset="0.45" stopColor="#7a2f3f" />
            <stop offset="0.72" stopColor="#e0703a" />
            <stop offset="0.85" stopColor="#f6b25a" />
          </linearGradient>
          <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff1c4" />
            <stop offset="0.4" stopColor="#ffd27a" />
            <stop offset="1" stopColor="#ffb04a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sky)" />
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff6dc" opacity={starOpacity * s.tw} />
        ))}
        <circle cx={1350} cy={sunY} r={210} fill="url(#sun)" />
        <circle cx={1350} cy={sunY} r={70} fill="#fff0c2" />
        {/* far mountains of the Hijaz */}
        <path d="M0 700 L180 590 L330 660 L520 560 L700 650 L880 580 L1050 660 L1240 600 L1420 670 L1600 590 L1780 650 L1920 610 L1920 1080 L0 1080 Z" fill="#5a2a3a" opacity={0.85} />
        {/* mid mountains + the valley with the Ka'bah far in the distance */}
        <path d="M0 790 L220 680 L380 760 L470 720 L560 780 L1920 790 L1920 1080 L0 1080 Z" fill="#3a1a26" />
        <g transform="translate(330 742)">
          <rect x={-14} y={-26} width={28} height={26} fill="#1f0e14" />
          <rect x={-14} y={-20} width={28} height={4} fill="#c9a24a" opacity={0.7} />
        </g>
        {/* near dunes */}
        <path d="M0 880 Q 400 820 820 870 T 1920 850 L1920 1080 L0 1080 Z" fill="#24101a" />
        {/* the army */}
        {new Array(9).fill(0).map((_, i) => (
          <Soldier key={i} x={armyX + 230 + i * 70} y={905 + (i % 2) * 14} step={step + i} scale={1.1} />
        ))}
        <Elephant x={armyX} y={815} step={step} scale={1.05} />
        {/* foreground dune */}
        <path d="M0 1000 Q 500 950 1000 990 T 1920 980 L1920 1080 L0 1080 Z" fill="#12070c" />
        {dust.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#f3c98a" opacity={0.18} />
        ))}
        <rect width={W} height={H} fill="url(#vignette)" />
      </svg>
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", opacity: titleIn }}>
        <div style={{ fontFamily: amiri, fontSize: 84, color: "#ffe2a6", direction: "rtl", textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>عام الفيل</div>
        <div style={{ fontFamily: serif, fontSize: 46, color: "#fff3dc", letterSpacing: 3, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>The Year of the Elephant</div>
      </div>
    </AbsoluteFill>
  );
};
