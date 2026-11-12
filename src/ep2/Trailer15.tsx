import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, Easing } from "remotion";
import { Person, STAND, SIT, Pose, blend } from "../cartoon/Rig";
import { Torch, FOLK, GUARD, sfx, ramp } from "../cartoon/Trailer";
import { KING_MAIN, SORCERER_MAIN, BOY_MAIN } from "./cast";
import { amiri, serif } from "../fonts";
import mouthData from "../ep2trailer_mouth.json";

// Episode 2 — 15-second vertical trailer (TikTok / Shorts / Reels), composed natively for 9:16.
// Lines follow the hadith of Ṣuhayb in al-Bidāya (Shīrī ed.) 2/153–155. Voices: Sorcerer, King, Boy (Gemini TTS cast).
// Mouths only, no eyes. Main characters (king, sorcerer, boy) are visually distinct (see ./cast). No one is shown being harmed.

const VW = 1080;
const VH = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── timeline (30 fps) ──
const T = {
  sorc: { from: 0, len: 112, vo: 2 },
  king: { from: 112, len: 88, vo: 3 },
  boy: { from: 200, len: 84, vo: 3 },
  mount: { from: 284, len: 20 },
  sea: { from: 304, len: 20 },
  bow: { from: 324, len: 96, vo: 3 },
  black: 420,
  title: { from: 424, len: 41 },
};
export const TRAILER15_LENGTH = T.title.from + T.title.len;


type Line = keyof typeof mouthData;
// Lip-sync: per-frame loudness of the actual voice file, lightly smoothed.
const useMouth = (line: Line, voStart: number) => {
  const frame = useCurrentFrame();
  const env = mouthData[line].env;
  const i = frame - voStart;
  if (i < 0 || i >= env.length) return 0;
  const a = env[i] ?? 0;
  const b = env[i - 1] ?? a;
  return Math.max(0, Math.min(1, (a * 0.65 + b * 0.35 - 0.12) * 1.25));
};

// Parallax layer drawn in vertical coordinates.
type Cam = { x: number; y: number; zoom: number };
const VLayer: React.FC<{ d: number; cam: Cam; origin?: string; children: React.ReactNode }> = ({ d, cam, origin = "50% 45%", children }) => {
  const s = 1 + (cam.zoom - 1) * d;
  return (
    <AbsoluteFill style={{ transform: `translate(${-cam.x * d}px, ${-cam.y * d}px) scale(${s})`, transformOrigin: origin }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} style={{ overflow: "visible" }}>{children}</svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{ k?: number }> = ({ k = 0.65 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${k}) 100%)` }} />
);

const shake = (frame: number, hits: number[], strength: number) => {
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const t = frame - h;
    if (t >= 0 && t < 20) {
      const k = (1 - t / 20) * strength;
      x += Math.sin(t * 2.7 + h) * k;
      y += Math.cos(t * 3.1 + h) * k;
    }
  }
  return { x, y };
};

// Whip transition in/out (motion blur + push), like the released trailer.
const Whip: React.FC<{ len: number; inn?: boolean; out?: boolean; children: React.ReactNode }> = ({ len, inn = true, out = true, children }) => {
  const frame = useCurrentFrame();
  const F = 7;
  const e = Easing.inOut(Easing.cubic);
  const i = inn ? interpolate(frame, [0, F], [0, 1], { ...clamp, easing: e }) : 1;
  const o = out ? interpolate(frame, [len - F, len], [0, 1], { ...clamp, easing: e }) : 0;
  const x = (1 - i) * 700 - o * 700;
  const blur = (1 - i) * 26 + o * 26;
  return <AbsoluteFill style={{ transform: `translateX(${x}px) scale(${1 + (1 - i) * 0.08 + o * 0.08})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>;
};

// Speaker label + line; key words in gold. Sits below the watermark, above the TikTok UI.
const Caption: React.FC<{ who: string; parts: { t: string; gold?: boolean }[]; start: number; end: number }> = ({ who, parts, start, end }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [start, start + 6, end, end + 6], [0, 1, 1, 0], clamp);
  const y = interpolate(frame, [start, start + 8], [18, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: o, transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: serif, fontSize: 34, letterSpacing: 8, color: "#e3a64a", marginBottom: 10, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{who}</div>
      <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 66, lineHeight: 1.2, color: "#fff7e6", background: "rgba(10,6,4,0.55)", padding: "16px 34px", borderRadius: 18, maxWidth: 940, textAlign: "center", textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>
        {parts.map((p, i) => <span key={i} style={p.gold ? { color: "#ffcf7a" } : undefined}>{p.t}</span>)}
      </div>
    </div>
  );
};

// ── Shot 1: the old sorcerer by his lamp ──
const SorcererShot: React.FC = () => {
  const frame = useCurrentFrame();
  const m = useMouth("sorcerer", T.sorc.vo);
  const flick = 1 + 0.1 * Math.sin(frame * 0.55) + 0.05 * Math.sin(frame * 1.7);
  const cam: Cam = { x: 0, y: 0, zoom: interpolate(frame, [0, T.sorc.len], [1.0, 1.14], { easing: Easing.inOut(Easing.sin) }) };
  const pose: Pose = { ...STAND, lean: 6, head: 4 + Math.sin(frame * 0.05) * 2, armRU: 4, armRL: -84, armLU: 10, armLL: -10 };
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 62% 62%, #4a2814 0%, #1a0f0a 42%, #070404 100%)" }}>
      <VLayer d={0.3} cam={cam}>
        {/* stone wall and shelves of jars behind him */}
        {new Array(6).fill(0).map((_, i) => <rect key={i} x={-100} y={300 + i * 190} width={1300} height={8} fill="#24170f" />)}
        {new Array(9).fill(0).map((_, i) => <rect key={i} x={60 + i * 120} y={400 + (i % 3) * 190 - 70} width={44} height={70} rx={10} fill="#2c1c12" />)}
      </VLayer>
      <VLayer d={1} cam={cam} origin="45% 45%">
        {/* lamp glow */}
        <defs>
          <radialGradient id="lampGlow">
            <stop offset="0" stopColor="#ffc46b" stopOpacity={0.55} />
            <stop offset="1" stopColor="#ffc46b" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={780} cy={1080} r={560 * flick} fill="url(#lampGlow)" />
        {/* the sorcerer, seated behind the table (table hides his legs) */}
        <g transform="translate(400 1660) scale(3.6)"><Person pose={pose} outfit={SORCERER_MAIN} mouth={m} mood="sneer" /></g>
        {/* his gnarled staff stands beside him */}
        <g transform="translate(150 1182)">
          <path d="M 0 0 Q 8 -160 -4 -300 Q 10 -380 0 -440" stroke="#3b2a1e" strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d="M 0 -440 Q -40 -470 -22 -515 M 0 -440 Q 40 -465 22 -515" stroke="#3b2a1e" strokeWidth={14} fill="none" strokeLinecap="round" />
          <circle cx={0} cy={-490} r={30} fill="#2a2a24" />
          <circle cx={-8} cy={-498} r={7} fill="#8fa892" opacity={0.45} />
        </g>
        {/* table */}
        <rect x={-80} y={1182} width={1260} height={820} fill="#2a180e" />
        <rect x={-80} y={1182} width={1260} height={26} fill="#4a2c18" />
        {/* oil lamp and flame */}
        <path d="M 690 1184 Q 780 1120 870 1184 Z" fill="#7a4a22" />
        <path d={`M 770 1138 Q 780 ${1050 - 34 * flick} 790 1138 Z`} fill="#ffb347" />
        <path d={`M 775 1138 Q 780 ${1085 - 18 * flick} 785 1138 Z`} fill="#fff1b8" />
      </VLayer>
      <Vignette k={0.7} />
    </AbsoluteFill>
  );
};

// ── Shot 2: the king on his throne ──
const Hall: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => (
  <>
    <VLayer d={0.25} cam={cam}>
      <rect x={-300} y={-300} width={1700} height={2600} fill="#24152e" />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${-120 + i * 440} 1500 L ${-120 + i * 440} 620 Q ${70 + i * 440} 420 ${260 + i * 440} 620 L ${260 + i * 440} 1500 Z`} fill="#1a0f22" />)}
    </VLayer>
    <VLayer d={0.55} cam={cam}>
      {[60, 930].map((x, i) => <rect key={i} x={x} y={300} width={110} height={1300} fill="#3a2440" />)}
      <Torch x={115} y={760} frame={frame} seed={1} />
      <Torch x={985} y={760} frame={frame} seed={3} />
    </VLayer>
    <VLayer d={1} cam={cam}>
      <rect x={-400} y={1560} width={1900} height={800} fill="#3b2a30" />
      <path d="M -400 1560 L 1500 1560" stroke="#5a4048" strokeWidth={8} />
    </VLayer>
  </>
);

const KingShot: React.FC = () => {
  const frame = useCurrentFrame();
  const m = useMouth("king1", T.king.vo);
  const cam: Cam = { x: 0, y: interpolate(frame, [0, T.king.len], [0, -40]), zoom: interpolate(frame, [0, T.king.len], [1.02, 1.2], { easing: Easing.inOut(Easing.sin) }) };
  const t = interpolate(frame, [30, 56], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const king = blend(SIT, { ...SIT, lean: 10, head: 6, armRU: -100, armRL: -20 }, t);
  const s = 3.0;
  const oy = 1560;
  const seatTop = oy - 104 * s - 6;
  return (
    <AbsoluteFill style={{ backgroundColor: "#120a16" }}>
      <Hall cam={cam} frame={frame} />
      <VLayer d={1} cam={cam}>
        {/* throne: back, red panel, seat under his hips */}
        <path d={`M 300 ${seatTop + 40} L 300 640 Q 500 520 700 640 L 700 ${seatTop + 40} Z`} fill="#c9952e" />
        <path d={`M 340 ${seatTop + 30} L 340 680 Q 500 590 660 680 L 660 ${seatTop + 30} Z`} fill="#7a1420" />
        <rect x={250} y={seatTop} width={560} height={70} rx={10} fill="#b0801f" />
        <rect x={270} y={seatTop + 70} width={520} height={oy - seatTop - 70} fill="#8a6418" />
        <ellipse cx={520} cy={seatTop + 4} rx={150} ry={14} fill="#000" opacity={0.25} />
        {/* footstool so his feet rest on something */}
        <rect x={490} y={1462} width={240} height={98} rx={8} fill="#5e430f" />
        <rect x={490} y={1462} width={240} height={14} rx={6} fill="#8a6418" />
        <g transform={`translate(460 ${oy}) scale(${s})`}><Person pose={king} outfit={KING_MAIN} mouth={m} mood="tight" /></g>
      </VLayer>
      <Vignette />
    </AbsoluteFill>
  );
};

// ── Shot 3: the boy answers, calm, light from above ──
const BoyShot: React.FC = () => {
  const frame = useCurrentFrame();
  const m = useMouth("boy", T.boy.vo);
  const cam: Cam = { x: 0, y: 0, zoom: interpolate(frame, [0, T.boy.len], [1.05, 1.22], { easing: Easing.inOut(Easing.sin) }) };
  const raise = interpolate(frame, [44, 64], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const boy = blend(STAND, { ...STAND, armLU: -172, armLL: -4, head: -8 }, raise);
  const glow = 0.45 + 0.55 * raise;
  return (
    <AbsoluteFill style={{ backgroundColor: "#120a16" }}>
      <Hall cam={cam} frame={frame} />
      <VLayer d={1} cam={cam}>
        <path d="M 400 -200 L 680 -200 L 900 1600 L 180 1600 Z" fill="#fff1c9" opacity={0.13 * glow} />
        <ellipse cx={540} cy={1600} rx={260} ry={34} fill="#fff1c9" opacity={0.25 * glow} />
        {/* guards and townsfolk watching, dim, at the sides */}
        <g transform="translate(110 1610) scale(1.7)" opacity={0.75}><Person pose={STAND} outfit={GUARD} mood="tight" /></g>
        <g transform="translate(980 1620) scale(1.7)" opacity={0.75}><Person pose={STAND} outfit={FOLK(1)} flip mood="neutral" /></g>
        {/* the boy faces the king (to the left) */}
        <g transform="translate(560 1640) scale(3.0)"><Person pose={boy} outfit={BOY_MAIN} flip mouth={m} mood="smile" /></g>
      </VLayer>
      <Vignette />
    </AbsoluteFill>
  );
};

// ── Flash A: the mountain shakes ──
const MountainFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shake(frame, [2, 9], 26);
  const cam: Cam = { x: s.x, y: s.y, zoom: interpolate(frame, [0, T.mount.len], [1.1, 1.22]) };
  const fall = interpolate(frame, [4, 18], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const rocks = new Array(22).fill(0).map((_, i) => {
    const t = Math.max(0, frame - 2 - random(`mr${i}`) * 6);
    return { x: 300 + random(`mx${i}`) * 480 + t * (random(`mv${i}`) - 0.5) * 9, y: 800 + t * t * 2.2, r: 8 + random(`ms${i}`) * 18 };
  });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#1a1030 0%, #5a2a40 50%, #c4643a 80%)" }}>
      <VLayer d={0.2} cam={cam}><path d="M -200 1300 L 200 1000 L 500 1150 L 850 950 L 1300 1250 L 1300 2100 L -200 2100 Z" fill="#3d2340" /></VLayer>
      <VLayer d={0.8} cam={cam}>
        <path d="M -100 2100 L 400 820 L 520 760 L 640 780 L 1200 2100 Z" fill="#2a1820" />
        {rocks.map((r, i) => <circle key={i} cx={r.x} cy={r.y} r={r.r} fill="#1e1218" />)}
        {[-110, -50, 60, 120].map((dx, i) => (
          <g key={i} transform={`translate(${530 + dx + Math.sign(dx) * fall * 300} ${790 + fall * 700}) rotate(${Math.sign(dx) * fall * 130}) scale(0.9)`} opacity={1 - fall * 0.9}>
            <Person pose={{ ...STAND, armRU: -40 - fall * 120, armLU: 40 + fall * 120 }} outfit={GUARD} flip={dx > 0} mood="shock" />
          </g>
        ))}
        <g transform="translate(530 784) scale(0.9)"><Person pose={STAND} outfit={BOY_MAIN} mood="neutral" /></g>
      </VLayer>
      <Vignette />
    </AbsoluteFill>
  );
};

// ── Flash B: the boat and the great wave ──
const SeaFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const s = shake(frame, [10], 20);
  const cam: Cam = { x: s.x, y: s.y, zoom: 1.08 };
  const big = interpolate(frame, [2, 16], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const flash = interpolate(frame, [1, 3, 6], [0, 0.8, 0], clamp);
  const rock = Math.sin(frame * 0.6) * 14;
  const sea = (y: number, amp: number, k: number, ph: number) => {
    let d = `M -300 ${y}`;
    for (let x = -300; x <= 1400; x += 30) d += ` L ${x} ${y + Math.sin(x * k + frame * 0.3 + ph) * amp}`;
    return d + " L 1400 2200 L -300 2200 Z";
  };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#05070f 0%, #141c33 55%, #1d2a44 100%)" }}>
      <VLayer d={0.4} cam={cam}><path d={sea(1050, 26, 0.01, 0)} fill="#1a2944" /></VLayer>
      <VLayer d={0.9} cam={cam}>
        <path d={sea(1150, 40, 0.012, 1.3)} fill="#22375a" />
        <g transform={`translate(540 1150) rotate(${rock})`}>
          <path d="M -230 -20 L 230 -20 L 170 70 L -170 70 Z" fill="#4a2e1c" />
          <line x1={0} y1={-20} x2={0} y2={-300} stroke="#2b1a10" strokeWidth={12} />
          <path d="M 8 -290 Q 140 -190 8 -70 Z" fill="#c9b79a" />
          {[-150, -80, 90, 160].map((dx, i) => <g key={i} transform={`translate(${dx} -20) scale(0.5)`}><Person pose={{ ...STAND, lean: rock }} outfit={GUARD} mood="shock" /></g>)}
          <g transform="translate(20 -20) scale(0.48)"><Person pose={STAND} outfit={BOY_MAIN} mood="neutral" /></g>
        </g>
        <path d={`M -300 ${2200 - big * 1500} Q 300 ${1900 - big * 1700} 540 ${2100 - big * 1550} T 1400 ${2200 - big * 1400} L 1400 2400 L -300 2400 Z`} fill="#2c4a73" opacity={big} />
      </VLayer>
      <AbsoluteFill style={{ backgroundColor: "#dfe8ff", opacity: flash }} />
      <Vignette />
    </AbsoluteFill>
  );
};

// ── Shot 4: the king draws the bow before the gathered people; cut before the release ──
const BowShot: React.FC = () => {
  const frame = useCurrentFrame();
  const m = useMouth("king2", T.bow.vo);
  const len = T.bow.len;
  const draw = interpolate(frame, [4, len - 8], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cam: Cam = { x: 0, y: 0, zoom: interpolate(frame, [0, len], [1.0, 1.3], { easing: Easing.in(Easing.cubic) }) };
  const tremble = draw > 0.85 ? Math.sin(frame * 2.3) * 1.5 : 0;
  const rad = (d: number) => (d * Math.PI) / 180;
  const v = (deg: number, l: number) => [-l * Math.sin(rad(deg)), l * Math.cos(rad(deg))];
  const fe = v(-90, 52);
  const fh = [6 + fe[0] + v(-90, 48)[0], -196 + fe[1] + v(-90, 48)[1]];
  const bend = 175 * draw;
  const be = v(-90, 52);
  const bl = v(-90 + bend, 48);
  const bh = [-4 + be[0] + bl[0], -196 + be[1] + bl[1]];
  const bx = fh[0] + tremble;
  const by = fh[1];
  const sx = Math.min(bh[0], bx - 6);
  const pose: Pose = { ...STAND, armRU: -90, armRL: 0, armLU: -90, armLL: bend, head: 0, lean: -2 };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#2b1d34 0%, #6b3b45 50%, #b8704a 75%)" }}>
      <VLayer d={0.2} cam={cam} origin="40% 55%"><path d="M -300 1150 L 300 1060 L 700 1120 L 1400 1050 L 1400 2200 L -300 2200 Z" fill="#3b2232" /></VLayer>
      <VLayer d={0.55} cam={cam} origin="40% 55%">
        <rect x={-400} y={1150} width={2000} height={1000} fill="#4a2a24" />
        {new Array(16).fill(0).map((_, i) => (
          <g key={i} transform={`translate(${560 + (i % 8) * 70 + (i > 7 ? 35 : 0)} ${1175 + (i > 7 ? 30 : 0)}) scale(0.42)`} opacity={0.85}>
            <Person pose={{ ...STAND, head: Math.sin(frame * 0.05 + i) * 3 }} outfit={FOLK(i)} flip mood="neutral" />
          </g>
        ))}
      </VLayer>
      <VLayer d={1} cam={cam} origin="40% 55%">
        <g transform="translate(250 1720) scale(2.5)">
          <Person pose={pose} outfit={KING_MAIN} mouth={m} mood="tight" />
          <path d={`M ${bx} ${by - 120} Q ${bx + 55 + draw * 25} ${by} ${bx} ${by + 120}`} stroke="#3a2416" strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M ${bx} ${by - 120} L ${sx} ${by} L ${bx} ${by + 120}`} stroke="#e8dcc2" strokeWidth={2.2} fill="none" />
          <line x1={sx} y1={by} x2={sx + 165} y2={by} stroke="#5a3a22" strokeWidth={4.5} />
          <path d={`M ${sx + 165} ${by - 8} L ${sx + 192} ${by} L ${sx + 165} ${by + 8} Z`} fill="#c9c4b8" />
          <path d={`M ${sx} ${by} l -14 -9 M ${sx} ${by} l -14 9`} stroke="#8f2a1c" strokeWidth={4} />
        </g>
      </VLayer>
      <Vignette k={0.72} />
    </AbsoluteFill>
  );
};

// ── Title ──
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const slam = interpolate(frame, [0, 7], [1.3, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const a = (s: number) => interpolate(frame, [s, s + 6], [0, 1], clamp);
  const embers = new Array(60).fill(0).map((_, i) => {
    const age = (frame + i * 13) % 90;
    return { x: random(`te${i}`) * VW, y: VH - age * 20, o: 1 - age / 90 };
  });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 88%, #4a160c 0%, #120708 58%, #060304 100%)", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} style={{ position: "absolute" }}>
        {embers.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={3.5} fill="#ffb347" opacity={e.o * 0.8} />)}
      </svg>
      <div style={{ textAlign: "center", color: "#f6e6c8", transform: `scale(${slam})` }}>
        <div style={{ fontFamily: amiri, fontSize: 150, color: "#ffcf7a", direction: "rtl", lineHeight: 1.35, textShadow: "0 0 50px rgba(255,140,40,0.55)" }}>أصحاب الأخدود</div>
        <div style={{ fontFamily: serif, fontSize: 96, lineHeight: 1.08, letterSpacing: 4 }}>The People<br />of the Trench</div>
      </div>
      <div style={{ position: "absolute", top: 1330, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 64, letterSpacing: 14, color: "#e3a64a", opacity: a(8) }}>FRIDAY</div>
      <div style={{ position: "absolute", top: 1430, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 34, letterSpacing: 4, color: "#bfa98a", opacity: a(12) }}>@bidayah.nihayah</div>
    </AbsoluteFill>
  );
};

const Watermark: React.FC = () => (
  <Img src={staticFile("logo.png")} style={{ position: "absolute", top: 150, right: 32, width: 120, opacity: 0.9, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />
);

const vo = (f: string) => staticFile(`ep2trailer15/${f}.wav`);

const Sound: React.FC = () => (
  <>
    <Sequence from={T.sorc.from + T.sorc.vo}><Html5Audio src={vo("sorcerer")} /></Sequence>
    <Sequence from={T.king.from + T.king.vo}><Html5Audio src={vo("king1")} /></Sequence>
    <Sequence from={T.boy.from + T.boy.vo}><Html5Audio src={vo("boy")} /></Sequence>
    <Sequence from={T.bow.from + T.bow.vo}><Html5Audio src={vo("king2")} /></Sequence>

    {/* lamp flame and a quiet room */}
    <Sequence from={0} durationInFrames={T.sorc.len + 6}>
      <Html5Audio src={sfx("gentle-fire-crackling-01")} loop volume={ramp([0, 6, T.sorc.len - 4, T.sorc.len + 6], [0.12, 0.2, 0.2, 0])} />
      <Html5Audio src={sfx("horror-heartbeat-34")} volume={ramp([0, 10, T.sorc.len], [0, 0.16, 0.12])} />
    </Sequence>
    {/* the hall: torches, stone */}
    <Sequence from={T.king.from} durationInFrames={T.boy.from + T.boy.len - T.king.from}>
      <Html5Audio src={sfx("gentle-fire-crackling-01")} loop volume={ramp([0, 8, 160, 172], [0, 0.12, 0.12, 0])} />
      <Html5Audio src={sfx("cave-ambience-01")} loop volume={ramp([0, 8, 160, 172], [0, 0.07, 0.07, 0])} />
    </Sequence>
    <Sequence from={T.boy.from + 40} durationInFrames={50}><Html5Audio src={sfx("own-air-swell")} volume={ramp([0, 20, 40, 50], [0, 0.14, 0.12, 0])} /></Sequence>
    {/* mountain: rumble and falling rock */}
    <Sequence from={T.mount.from}>
      <Html5Audio src={sfx("own-rumble")} volume={ramp([0, 3, 18, 24], [0, 0.45, 0.4, 0])} />
      <Html5Audio src={sfx("rock-crumbling-01")} volume={ramp([0, 3, 18, 24], [0, 0.4, 0.35, 0])} />
    </Sequence>
    {/* sea: thunder-white flash and the wave */}
    <Sequence from={T.sea.from}>
      <Html5Audio src={sfx("flood-water-rush-01")} volume={ramp([0, 4, 18, 24], [0, 0.45, 0.4, 0])} />
      <Html5Audio src={sfx("water-swirl-36")} volume={ramp([0, 4, 20], [0, 0.25, 0])} />
    </Sequence>
    {/* the bow: creak and heartbeat, then silence at the cut */}
    <Sequence from={T.bow.from} durationInFrames={T.bow.len}>
      <Html5Audio src={sfx("horror-creak-17")} volume={ramp([0, 10, T.bow.len - 6, T.bow.len], [0, 0.2, 0.28, 0])} />
      <Html5Audio src={sfx("horror-heartbeat-34")} volume={ramp([0, 15, T.bow.len - 4, T.bow.len], [0, 0.2, 0.3, 0])} />
    </Sequence>
    {/* title: a flame whoosh and a real thud, fire under it */}
    <Sequence from={T.title.from - 3} durationInFrames={T.title.len + 3}>
      <Html5Audio src={sfx("fire-electric-whoosh-flame-36")} volume={ramp([0, 3, 20, 44], [0, 0.26, 0.12, 0])} />
      <Html5Audio src={sfx("backlog-adapt-fire-burning")} volume={ramp([0, 8, 34, 44], [0, 0.16, 0.12, 0])} />
    </Sequence>
    <Sequence from={T.title.from}><Html5Audio src={sfx("body-fall-01")} volume={0.3} /></Sequence>
    {/* whooshes on each whip */}
    {[T.king.from, T.boy.from, T.mount.from, T.sea.from, T.bow.from].map((f) => (
      <Sequence key={f} from={f - 4} durationInFrames={24}><Html5Audio src={sfx("short-video-whoosh-01")} volume={0.32} /></Sequence>
    ))}
  </>
);

const lineEnd = (line: Line, start: number) => start + mouthData[line].frames;

export const Ep2Trailer15: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence from={T.sorc.from} durationInFrames={T.sorc.len}><Whip len={T.sorc.len} inn={false}><SorcererShot /></Whip></Sequence>
    <Sequence from={T.king.from} durationInFrames={T.king.len}><Whip len={T.king.len}><KingShot /></Whip></Sequence>
    <Sequence from={T.boy.from} durationInFrames={T.boy.len}><Whip len={T.boy.len}><BoyShot /></Whip></Sequence>
    <Sequence from={T.mount.from} durationInFrames={T.mount.len}><Whip len={T.mount.len}><MountainFlash /></Whip></Sequence>
    <Sequence from={T.sea.from} durationInFrames={T.sea.len}><Whip len={T.sea.len}><SeaFlash /></Whip></Sequence>
    <Sequence from={T.bow.from} durationInFrames={T.bow.len}><Whip len={T.bow.len} out={false}><BowShot /></Whip></Sequence>
    <Sequence from={T.title.from} durationInFrames={T.title.len}><Title /></Sequence>

    <Caption who="THE SORCERER" start={2} end={lineEnd("sorcerer", T.sorc.vo) - 2} parts={[{ t: "“Send me a " }, { t: "boy", gold: true }, { t: ", so I can teach him magic.”" }]} />
    <Caption who="THE KING" start={T.king.from + 3} end={lineEnd("king1", T.king.from + T.king.vo) - 2} parts={[{ t: "“You have a lord " }, { t: "other than me", gold: true }, { t: "?”" }]} />
    <Caption who="THE BOY" start={T.boy.from + 3} end={lineEnd("boy", T.boy.from + T.boy.vo) - 2} parts={[{ t: "“My Lord, and your Lord, is " }, { t: "Allah", gold: true }, { t: ".”" }]} />
    <Caption who="THE KING" start={T.bow.from + 3} end={T.bow.from + T.bow.len - 4} parts={[{ t: "“In the name of Allah, " }, { t: "the Lord of the boy", gold: true }, { t: ".”" }]} />

    <Sequence from={0} durationInFrames={T.black}><Watermark /></Sequence>
    <Sequence from={T.title.from} durationInFrames={T.title.len}><Watermark /></Sequence>
    <Sound />
  </AbsoluteFill>
);
