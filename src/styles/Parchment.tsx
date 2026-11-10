import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { amiri, serif } from "../fonts";

// Style B — storybook ink map on aged parchment.
// The route of Abraha's army from Ṣanʿāʾ in Yemen to Makkah draws itself, with a small elephant walking along it.

const W = 1920;
const H = 1080;
const INK = "#3b2414";

// Hand-placed route from Ṣanʿāʾ (south) to Makkah (north) along the Hijaz.
const ROUTE = "M 1180 900 C 1150 820 1110 760 1080 700 S 1010 580 990 520 S 950 400 930 330";

const InkElephant: React.FC<{ step: number }> = ({ step }) => {
  const s = Math.sin(step) * 3;
  return (
    <g fill={INK}>
      <rect x={-22 + s} y={6} width={9} height={22} rx={3} />
      <rect x={-8 - s} y={6} width={9} height={22} rx={3} />
      <rect x={8 + s} y={6} width={9} height={22} rx={3} />
      <rect x={20 - s} y={6} width={9} height={22} rx={3} />
      <ellipse cx={4} cy={0} rx={30} ry={20} />
      <ellipse cx={-28} cy={-8} rx={15} ry={14} />
      <path d="M -40 -6 Q -50 12 -45 30 L -40 30 Q -42 14 -32 2 Z" />
    </g>
  );
};

export const ParchmentScene: React.FC<{ showTitle?: boolean }> = ({ showTitle = true }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // The army never entered Makkah, so the march stops short of the city.
  const draw = interpolate(frame, [20, durationInFrames - 50], [0, 0.84], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const zoom = interpolate(frame, [0, durationInFrames], [1.05, 1.18]);
  const panY = interpolate(draw, [0, 1], [-60, 60]);
  const labelIn = (start: number) =>
    interpolate(frame, [start, start + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Position the elephant along the route using an off-screen SVG path measurement.
  let ex = 1180;
  let ey = 900;
  let routeLen = 700;
  if (typeof document !== "undefined") {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", ROUTE);
    const len = p.getTotalLength();
    routeLen = len;
    const pt = p.getPointAtLength(len * draw);
    ex = pt.x;
    ey = pt.y;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#d9c49a" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ transform: `scale(${zoom}) translateY(${panY}px)`, transformOrigin: "55% 55%" }}>
        <defs>
          <filter id="paper">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.18  0 0 0 0.22 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <filter id="blotch">
            <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="2" seed="3" />
            <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.38  0 0 0 0 0.18  0 0 0 0.35 -0.05" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <filter id="rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="2" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
          </filter>
          <radialGradient id="burn" cx="0.5" cy="0.5" r="0.72">
            <stop offset="0.65" stopColor="#7a4f22" stopOpacity="0" />
            <stop offset="1" stopColor="#4a2a10" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="#e3cfa3" />
        <rect width={W} height={H} filter="url(#blotch)" />
        <rect width={W} height={H} filter="url(#paper)" />

        <g filter="url(#rough)" stroke={INK} fill="none" strokeLinecap="round">
          {/* Red Sea coastline (west) */}
          <path d="M 760 120 C 800 260 860 380 900 470 S 990 680 1050 780 S 1120 920 1160 1000" strokeWidth={3} />
          <path d="M 700 120 C 740 260 800 380 840 470 S 930 680 990 780 S 1060 920 1100 1000" strokeWidth={1.5} opacity={0.5} />
          {/* wave hatching in the sea */}
          {new Array(10).fill(0).map((_, i) => (
            <path key={i} d={`M ${620 + i * 28} ${220 + i * 75} q 12 -8 24 0 t 24 0`} strokeWidth={1.5} opacity={0.6} />
          ))}
          {/* Sarawat mountains as ink peaks */}
          {new Array(10).fill(0).map((_, i) => {
            const x = 1150 + i * 22 + (i % 3) * 10;
            const y = 360 + i * 52;
            return <path key={i} d={`M ${x} ${y} l 22 -32 l 22 32 M ${x + 14} ${y - 12} l 8 -10`} strokeWidth={2} />;
          })}
          {/* route */}
          <path
            d={ROUTE}
            stroke="#8a1c12"
            strokeWidth={5}
            strokeDasharray={`${routeLen * draw} ${routeLen}`}
          />
        </g>

        {/* cities */}
        <g>
          <circle cx={1180} cy={900} r={10} fill={INK} />
          <circle cx={930} cy={330} r={12} fill="#8a1c12" opacity={labelIn(160)} />
          <circle cx={930} cy={330} r={22} fill="none" stroke="#8a1c12" strokeWidth={2.5} opacity={labelIn(160)} />
        </g>

        <g transform={`translate(${ex} ${ey - 26})`}>
          <InkElephant step={frame * 0.3} />
        </g>

        <rect width={W} height={H} fill="url(#burn)" />
      </svg>

      {/* labels */}
      <div style={{ position: "absolute", left: 1215, top: 885, opacity: labelIn(10), color: INK }}>
        <div style={{ fontFamily: amiri, fontSize: 40, direction: "rtl" }}>صنعاء</div>
        <div style={{ fontFamily: serif, fontSize: 30, fontStyle: "italic" }}>Ṣanʿāʾ, Yemen</div>
      </div>
      <div style={{ position: "absolute", left: 990, top: 300, opacity: labelIn(160), color: "#6e150d" }}>
        <div style={{ fontFamily: amiri, fontSize: 48, direction: "rtl" }}>مكة</div>
        <div style={{ fontFamily: serif, fontSize: 34, fontStyle: "italic" }}>Makkah</div>
      </div>
      <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center", color: INK, opacity: showTitle ? labelIn(0) : 0 }}>
        <div style={{ fontFamily: amiri, fontSize: 76, direction: "rtl" }}>عام الفيل</div>
        <div style={{ fontFamily: serif, fontSize: 44, letterSpacing: 3 }}>The Year of the Elephant</div>
      </div>
    </AbsoluteFill>
  );
};
