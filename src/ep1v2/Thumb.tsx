import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { STAND } from "../cartoon/Rig";
import { SOLDIER } from "../ep1/kit";
import { sans } from "../fonts";
import { Layer, Defs, Sky, ridge, Grade, Vignette, Elephant2, Kaaba2, Mahout, Cam, Fig } from "./kit2";

// YouTube thumbnail for Episode 1: the army at the Kaaba, the elephant kneeling, the birds diving with burning stones.
const FIRE: [number, string][] = [[0, "#14040a"], [26, "#4a0d1e"], [48, "#a3201f"], [64, "#ef5a1c"], [76, "#ffa42e"], [100, "#ffe08a"]];
const CX = 1400;
const CY = 1170;

const Bird: React.FC<{ x: number; y: number; s: number; w: number; dive?: number }> = ({ x, y, s, w, dive = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${dive}) scale(${s})`}>
    <path d={`M -4 0 Q -28 ${-20 * w} -54 ${-6 - 24 * w} Q -32 ${2 - 6 * w} -6 6 Z`} fill="#0a0608" />
    <path d={`M 4 0 Q 28 ${-20 * w} 54 ${-6 - 24 * w} Q 32 ${2 - 6 * w} 6 6 Z`} fill="#0a0608" />
    <ellipse cx={0} cy={2} rx={10} ry={7} fill="#0a0608" />
    <path d="M -3 6 L -10 24 L 0 15 L 10 24 L 3 6 Z" fill="#0a0608" />
  </g>
);

const Stone: React.FC<{ x: number; y: number; len: number }> = ({ x, y, len }) => (
  <g>
    <line x1={x + len * 0.5} y1={y - len} x2={x} y2={y} stroke="url(#trail)" strokeWidth={9} strokeLinecap="round" />
    <circle cx={x} cy={y} r={22} fill="url(#ember)" />
    <circle cx={x} cy={y} r={8} fill="#fff4c0" />
  </g>
);

const BIRDS = new Array(30).fill(0).map((_, i) => {
  const c = i % 8, r = Math.floor(i / 8);
  const jx = ((i * 97) % 60) - 30, jy = ((i * 61) % 50) - 25;
  return { x: 720 + c * 92 + (r % 2) * 46 + jx, y: 720 + r * 70 + jy, s: 0.7 + ((i * 29) % 10) / 14, w: ((i * 7) % 10) / 10 - 0.3, dive: -18 + ((i * 11) % 28) };
});
const STONES = [[1000, 1120, 110], [1150, 1190, 140], [880, 1070, 90], [1260, 1100, 120], [760, 1150, 100], [1080, 1050, 80], [940, 1210, 120]];

const Rays: React.FC = () => (
  <g opacity={0.5}>
    {new Array(22).fill(0).map((_, i) => {
      const a0 = (i / 22) * Math.PI * 2;
      const a1 = a0 + 0.07;
      const R = 2600;
      return <path key={i} d={`M ${CX} ${CY} L ${CX + Math.cos(a0) * R} ${CY + Math.sin(a0) * R} L ${CX + Math.cos(a1) * R} ${CY + Math.sin(a1) * R} Z`} fill="url(#ray)" />;
    })}
  </g>
);

export const Ep1Thumb: React.FC<{ line1?: string; line2?: string }> = ({ line1 = "IT REFUSED", line2 = "TO MOVE" }) => {
  const cam: Cam = { x: 0, y: 0, zoom: 1 };
  return (
    <AbsoluteFill>
      <Sky stops={FIRE} />
      <Layer d={0.02} cam={cam}>
        <defs>
          <radialGradient id="sun"><stop offset="0%" stopColor="#fff6d8" /><stop offset="25%" stopColor="#ffd27a" stopOpacity={0.9} /><stop offset="100%" stopColor="#ff7a2a" stopOpacity={0} /></radialGradient>
          <linearGradient id="ray" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fff0b8" stopOpacity={0.9} /><stop offset="100%" stopColor="#fff0b8" stopOpacity={0} /></linearGradient>
        </defs>
        <Rays />
        <circle cx={CX} cy={CY} r={620} fill="url(#sun)" />
      </Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("th1", 1250, 200, 120)} fill="#5a1424" /></Layer>
      <Layer d={0.3} cam={cam}>
        <Defs />
        <path d={ridge("th2", 1310, 90, 100)} fill="#2a0912" />
        {/* the army on the ridge, spears up, facing the Kaaba */}
        {new Array(12).fill(0).map((_, i) => <Fig key={i} x={890 + i * 30} y={1322 - (i % 2) * 10} s={0.4} outfit={SOLDIER(i)} prop="spear" pose={STAND} silhouette="#1a0509" />)}
        <Kaaba2 x={CX} y={1322} s={1.0} />
      </Layer>
      <Layer d={0.5} cam={cam}>
        <defs>
          <radialGradient id="ember"><stop offset="0%" stopColor="#ffe9a0" /><stop offset="45%" stopColor="#ff7a1a" stopOpacity={0.9} /><stop offset="100%" stopColor="#ff3a00" stopOpacity={0} /></radialGradient>
          <linearGradient id="trail" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8a2a" stopOpacity={0} /><stop offset="100%" stopColor="#ffd070" stopOpacity={0.95} /></linearGradient>
        </defs>
        {BIRDS.map((b, i) => <Bird key={i} {...b} />)}
        {STONES.map(([x, y, l], i) => <Stone key={i} x={x} y={y} len={l} />)}
      </Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1430} width={3600} height={800} fill="#1e0a0c" />
        <g transform="translate(600 1462) scale(1.15)"><Elephant2 kneel={1} ear={0.9} trunk={0.7} skin="#8a8280" driver={<Mahout />} /></g>
      </Layer>
      <Grade color="#ff5a1a" opacity={0.12} />
      <Vignette s={0.7} />
      <AbsoluteFill style={{ alignItems: "flex-end", padding: "40px 64px 0 0" }}>
        <div style={{ textAlign: "right", transform: "rotate(-2deg)" }}>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 168, lineHeight: 0.92, color: "#ffd400", letterSpacing: -3, WebkitTextStroke: "12px #000", paintOrder: "stroke fill", textShadow: "0 12px 0 #000, 0 18px 40px rgba(0,0,0,0.85)" } as React.CSSProperties}>{line1}</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 168, lineHeight: 0.98, color: "#ffffff", letterSpacing: -3, WebkitTextStroke: "12px #000", paintOrder: "stroke fill", textShadow: "0 12px 0 #000, 0 18px 40px rgba(0,0,0,0.85)" } as React.CSSProperties}>{line2}</div>
        </div>
      </AbsoluteFill>
      <Img src={staticFile("logo.png")} style={{ position: "absolute", top: 30, left: 36, width: 110, opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
    </AbsoluteFill>
  );
};

// 9:16 cover for the TikTok parts: same scene recomposed for the tall frame, text kept inside the 3:4 profile-grid crop.
const VCX = 1330;
const VCY = 1330;
const VBIRDS = new Array(30).fill(0).map((_, i) => {
  const c = i % 6, r = Math.floor(i / 6);
  const jx = ((i * 97) % 60) - 30, jy = ((i * 61) % 50) - 25;
  return { x: 540 + c * 150 + (r % 2) * 70 + jx, y: 790 + r * 60 + jy, s: 0.75 + ((i * 29) % 10) / 14, w: ((i * 7) % 10) / 10 - 0.3, dive: -18 + ((i * 11) % 28) };
});
const VSTONES = [[1150, 1380, 120], [1230, 1300, 110], [1060, 1240, 100], [1290, 1420, 130], [950, 1180, 90], [1180, 1150, 80]];
const VRays: React.FC = () => (
  <g opacity={0.5}>
    {new Array(22).fill(0).map((_, i) => {
      const a0 = (i / 22) * Math.PI * 2;
      const a1 = a0 + 0.07;
      const R = 2600;
      return <path key={i} d={`M ${VCX} ${VCY} L ${VCX + Math.cos(a0) * R} ${VCY + Math.sin(a0) * R} L ${VCX + Math.cos(a1) * R} ${VCY + Math.sin(a1) * R} Z`} fill="url(#vray)" />;
    })}
  </g>
);
const TXT = (color: string, size: number): React.CSSProperties => ({ fontFamily: sans, fontWeight: 800, fontSize: size, lineHeight: 0.95, color, letterSpacing: -2, WebkitTextStroke: "11px #000", paintOrder: "stroke fill", textShadow: "0 10px 0 #000, 0 16px 36px rgba(0,0,0,0.85)" } as React.CSSProperties);

export const Ep1ThumbV: React.FC<{ part?: number; lines?: string[] }> = ({ part = 1, lines = ["IT REFUSED", "TO MOVE"] }) => {
  const cam: Cam = { x: 0, y: 0, zoom: 1 };
  const size = Math.min(140, Math.floor(980 / (Math.max(...lines.map((l) => l.length)) * 0.74)));
  return (
    <AbsoluteFill>
      <Sky stops={FIRE} />
      <Layer d={0.02} cam={cam}>
        <defs>
          <radialGradient id="vsun"><stop offset="0%" stopColor="#fff6d8" /><stop offset="25%" stopColor="#ffd27a" stopOpacity={0.9} /><stop offset="100%" stopColor="#ff7a2a" stopOpacity={0} /></radialGradient>
          <linearGradient id="vray" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fff0b8" stopOpacity={0.9} /><stop offset="100%" stopColor="#fff0b8" stopOpacity={0} /></linearGradient>
        </defs>
        <VRays />
        <circle cx={VCX} cy={VCY} r={560} fill="url(#vsun)" />
      </Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("tv1", 1400, 180, 110)} fill="#5a1424" /></Layer>
      <Layer d={0.3} cam={cam}>
        <Defs />
        <path d={ridge("tv2", 1470, 80, 90)} fill="#2a0912" />
        {new Array(6).fill(0).map((_, i) => <Fig key={i} x={1120 + i * 28} y={1484 - (i % 2) * 10} s={0.4} outfit={SOLDIER(i)} prop="spear" pose={STAND} silhouette="#1a0509" />)}
        <Kaaba2 x={1370} y={1484} s={0.78} />
      </Layer>
      <Layer d={0.5} cam={cam}>
        <defs>
          <radialGradient id="ember"><stop offset="0%" stopColor="#ffe9a0" /><stop offset="45%" stopColor="#ff7a1a" stopOpacity={0.9} /><stop offset="100%" stopColor="#ff3a00" stopOpacity={0} /></radialGradient>
          <linearGradient id="trail" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8a2a" stopOpacity={0} /><stop offset="100%" stopColor="#ffd070" stopOpacity={0.95} /></linearGradient>
        </defs>
        {VBIRDS.map((b, i) => <Bird key={i} {...b} />)}
        {VSTONES.map(([x, y, l], i) => <Stone key={i} x={x} y={y} len={l} />)}
      </Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1600} width={3600} height={800} fill="#1e0a0c" />
        <g transform="translate(900 1640) scale(0.95)"><Elephant2 kneel={1} ear={0.9} trunk={0.7} skin="#8a8280" driver={<Mahout />} /></g>
      </Layer>
      <Grade color="#ff5a1a" opacity={0.12} />
      <Vignette s={0.7} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 118, lineHeight: 1, color: "#fff", background: "#e0141c", padding: "18px 56px 24px", borderRadius: 26, border: "9px solid #000", letterSpacing: 2, boxShadow: "0 14px 0 #000, 0 20px 40px rgba(0,0,0,0.7)", WebkitTextStroke: "4px #000", paintOrder: "stroke fill" } as React.CSSProperties}>PART {part}</div>
        <div style={{ textAlign: "center", marginTop: 50, transform: "rotate(-2deg)" }}>
          {lines.map((l, i) => <div key={i} style={TXT(i === 0 ? "#ffd400" : "#ffffff", size)}>{l}</div>)}
        </div>
      </AbsoluteFill>
      <Img src={staticFile("logo.png")} style={{ position: "absolute", top: 120, left: 40, width: 104, opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
    </AbsoluteFill>
  );
};
