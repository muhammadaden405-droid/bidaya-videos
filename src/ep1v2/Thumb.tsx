import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { sans, display } from "../fonts";
import { Layer, Defs, Sky, ridge, Glow, Grade, Vignette, Elephant2, Kaaba2, Mahout, Cam } from "./kit2";

// YouTube thumbnail for Episode 1: the elephant kneeling, the Kaaba in the distance, the birds coming.
const FIRE: [number, string][] = [[0, "#0c0712"], [28, "#2e1230"], [50, "#7a2632"], [66, "#d4582c"], [78, "#ffa24a"], [100, "#ffd38a"]];

const Bird: React.FC<{ x: number; y: number; s: number; w: number }> = ({ x, y, s, w }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -4 0 Q -28 ${-20 * w} -54 ${-6 - 24 * w} Q -32 ${2 - 6 * w} -6 6 Z`} fill="#0d0a10" />
    <path d={`M 4 0 Q 28 ${-20 * w} 54 ${-6 - 24 * w} Q 32 ${2 - 6 * w} 6 6 Z`} fill="#0d0a10" />
    <ellipse cx={0} cy={2} rx={10} ry={7} fill="#0d0a10" />
    <path d="M -3 6 L -10 24 L 0 15 L 10 24 L 3 6 Z" fill="#0d0a10" />
  </g>
);

const BIRDS = new Array(46).fill(0).map((_, i) => {
  const a = (i * 137.5) % 360;
  const r = 40 + ((i * 53) % 330);
  return { x: 1500 + Math.cos((a * Math.PI) / 180) * r * 1.1, y: 640 + Math.sin((a * Math.PI) / 180) * r * 0.55, s: 0.55 + ((i * 29) % 10) / 14, w: ((i * 7) % 10) / 10 - 0.3 };
});

export const Ep1Thumb: React.FC = () => {
  const cam: Cam = { x: 0, y: 0, zoom: 1 };
  return (
    <AbsoluteFill>
      <Sky stops={FIRE} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={1380} y={1180} r={760} /><circle cx={1380} cy={1190} r={120} fill="#fff1d0" /></Layer>
      <Layer d={0.1} cam={cam}>{BIRDS.filter((_, i) => i % 3 === 0).map((b, i) => <Bird key={i} x={b.x + 120} y={b.y - 60} s={b.s * 0.45} w={b.w} />)}</Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("th1", 1230, 220, 140)} fill="#4a1e30" /></Layer>
      <Layer d={0.3} cam={cam}>
        <Defs />
        <path d={ridge("th2", 1300, 120, 110)} fill="#2c1020" />
        <Kaaba2 x={1440} y={1318} s={0.85} />
      </Layer>
      <Layer d={0.5} cam={cam}>{BIRDS.map((b, i) => <Bird key={i} x={b.x} y={b.y} s={b.s} w={b.w} />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1420} width={3600} height={800} fill="#3a1a1c" />
        <g transform="translate(660 1452) scale(1.1)"><Elephant2 kneel={1} ear={0.9} trunk={0.6} skin="#857d78" driver={<Mahout />} /></g>
      </Layer>
      <Grade color="#ff7a3a" opacity={0.16} />
      <Vignette s={0.75} />
      <AbsoluteFill style={{ padding: "54px 70px", alignItems: "flex-start" }}>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: 92, color: "#ffcf6a", letterSpacing: 4, lineHeight: 1, textShadow: "0 6px 18px rgba(0,0,0,0.9)", WebkitTextStroke: "3px #1a0a08", paintOrder: "stroke fill" } as React.CSSProperties}>
          THE ELEPHANT
        </div>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 196, color: "#ffffff", lineHeight: 0.95, marginTop: 6, letterSpacing: -2, textShadow: "0 10px 30px rgba(0,0,0,0.9)", WebkitTextStroke: "7px #120606", paintOrder: "stroke fill" } as React.CSSProperties}>
          REFUSED
        </div>
      </AbsoluteFill>
      <Img src={staticFile("logo.png")} style={{ position: "absolute", top: 34, right: 40, width: 120, opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
    </AbsoluteFill>
  );
};
