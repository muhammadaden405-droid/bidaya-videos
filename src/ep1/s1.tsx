import React from "react";
import { AbsoluteFill, random } from "remotion";
import { STAND, SIT, blend, walkPose, Pose } from "../cartoon/Rig";
import { serif } from "../fonts";
import {
  H, Layer, iv, ease, useShot, moveCam, ridge, dunes, Vignette, Grain, Dust, SKY, Stars, Moon, Sun, Clouds,
  OUT, SOLDIER, BLUE, ARAB, Figure, Horse, Camel, Ship, KElephant, Hall, Throne, Torch, Grade, Town,
} from "./kit";

// Scenes for TikTok parts 1–2: the cold open, Yemen, the duel, the oath, the church, the vow.
// Every scene adapts to the length the narration gives it; `b` beats are frames inside the shot.

const at = (b: number[] | undefined, i: number, dur: number, frac: number) => (b && b[i] !== undefined ? b[i] : Math.round(dur * frac));

// 1 — cold open: the giant elephant at dusk, an army behind it, and it kneels.
export const ColdOpen: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const kneelAt = at(b, 0, dur, 0.62);
  const kneel = iv(frame, [kneelAt, kneelAt + 40], [0, 1], ease);
  const cam = moveCam(p, { x: 120, y: 40, zoom: 1.0 }, { x: -40, y: -10, zoom: 1.35 });
  const ph = frame * 0.12 * (1 - kneel);
  const beaters = iv(frame, [kneelAt + 30, kneelAt + 45], [0, 1]);
  return (
    <AbsoluteFill style={{ background: SKY.dusk }}>
      <Layer d={0.02} cam={cam}><Sun x={1180} y={640} r={120} color="#ffe2a8" /></Layer>
      <Layer d={0.06} cam={cam}><Clouds y={170} color="#e98a6a" opacity={0.45} seed="co" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("cof", 720, 160, 110)} fill="#7a3a52" /></Layer>
      <Layer d={0.35} cam={cam}>
        <path d={ridge("com", 780, 90, 80)} fill="#4f2238" />
        {/* the army — a wall of spears in silhouette */}
        {new Array(46).fill(0).map((_, i) => (
          <g key={i} transform={`translate(${200 + i * 36 + (i % 2) * 14} ${790 + (i % 3) * 8}) scale(0.34)`}>
            <path d="M -18 0 L -16 -150 Q 0 -190 16 -150 L 18 0 Z" fill="#2a0f1c" />
            <circle cx={0} cy={-180} r={22} fill="#2a0f1c" />
            <line x1={14} y1={20} x2={14} y2={-320} stroke="#2a0f1c" strokeWidth={6} />
          </g>
        ))}
      </Layer>
      <Layer d={0.7} cam={cam}><path d={dunes("cog", 860, 40)} fill="#3a1626" /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={900} width={3800} height={600} fill="#24101a" />
        <g transform="translate(980 930) scale(1.25)">
          <KElephant phase={ph} earFlap={(Math.sin(frame * 0.07) + 1) / 2} kneel={kneel} skin="#3a2a34" />
        </g>
        {[-1, 1].map((s, i) => (
          <Figure key={i} x={980 + s * 360} y={935} s={0.95} flip={s > 0} outfit={{ ...SOLDIER(i, false), skin: "#1e0c14", robe: "#1e0c14", robeShade: "#140810", wrap: "#1e0c14", shield: undefined }}
            pose={blend(STAND, { ...STAND, armRU: -150 + Math.sin(frame * 0.5 + i) * 40 * beaters, armRL: -30 }, beaters)} />
        ))}
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={50} color="#f3b07a" y0={500} y1={1100} drift={1.4} opacity={0.35} size={4} /></Layer>
      <Grade color="#ff7a3a" opacity={0.18} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

// 2 — parchment map: Yemen, the trench at Najrān, the escape north, the letter to Aksum, the fleet.
const MAPS = { najran: [1430, 700], sanaa: [1400, 860], aksum: [985, 930], makkah: [1070, 440], landing: [1335, 905] };
const Dash: React.FC<{ pts: number[][]; t: number; color?: string; w?: number }> = ({ pts, t, color = "#7a1420", w = 5 }) => {
  if (t <= 0) return null;
  const d = pts.map((q, i) => `${i ? "L" : "M"} ${q[0]} ${q[1]}`).join(" ");
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return <path d={d} stroke={color} strokeWidth={w} fill="none" strokeDasharray={`${len * t} ${len}`} strokeLinecap="round" />;
};
export const MapScene: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const k = (i: number, f: number) => at(b, i, dur, f);
  const yemen = iv(frame, [k(0, 0.02), k(0, 0.02) + 20], [0, 1]);
  const trench = iv(frame, [k(1, 0.18), k(1, 0.18) + 15], [0, 1]);
  const escape = iv(frame, [k(2, 0.32), k(2, 0.32) + 60], [0, 1], ease);
  const letter = iv(frame, [k(3, 0.52), k(3, 0.52) + 60], [0, 1], ease);
  const fleet = iv(frame, [k(4, 0.72), k(4, 0.72) + 70], [0, 1], ease);
  const focus = fleet > 0 ? { x: 220, y: 230, zoom: 1.5 } : escape > 0 && letter === 0 ? { x: 220, y: 0, zoom: 1.25 } : { x: 220, y: 200, zoom: 1.45 };
  const cam = moveCam(p, { x: 260, y: 220, zoom: 1.55 }, focus);
  const fx = MAPS.aksum[0] + (MAPS.landing[0] - MAPS.aksum[0]) * fleet;
  const fy = MAPS.aksum[1] - 40 * Math.sin(fleet * Math.PI) + (MAPS.landing[1] - MAPS.aksum[1]) * fleet;
  const label = (x: number, y: number, t: string, o = 1, size = 30) => (
    <text x={x + 16} y={y + 8} fontFamily={serif} fontSize={size} fill="#3a2414" opacity={o} fontStyle="italic">{t}</text>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#e9d9b4" }}>
      <Layer d={1} cam={cam}>
        <rect x={-400} y={-400} width={2800} height={1900} fill="#ead9b0" />
        {/* sea */}
        <path d="M 520 -300 L 640 -50 L 790 200 L 940 450 L 1100 700 L 1250 930 L 1300 1300 L 1700 1300 L 1420 1000 L 1330 900 L 1180 670 L 1020 430 L 870 190 L 740 -60 L 700 -300 Z" fill="#9fb6b4" />
        <path d="M 1400 1300 L 2400 1300 L 2400 1060 L 1700 1100 Z" fill="#9fb6b4" />
        <path d="M 520 -300 L 640 -50 L 790 200 L 940 450 L 1100 700 L 1250 930 L 1300 1300" stroke="#6a7f7a" strokeWidth={3} fill="none" />
        <path d="M 700 -300 L 740 -60 L 870 190 L 1020 430 L 1180 670 L 1330 900 L 1420 1000 L 1700 1100 L 2400 1060" stroke="#6a7f7a" strokeWidth={3} fill="none" />
        {/* paper texture */}
        {new Array(60).fill(0).map((_, i) => <circle key={i} cx={random(`pm${i}`) * 2400 - 200} cy={random(`pn${i}`) * 1500 - 200} r={20 + random(`pr${i}`) * 80} fill="#b8935a" opacity={0.05} />)}
        <text x={1640} y={560} fontFamily={serif} fontSize={64} letterSpacing={18} fill="#5a3a20" opacity={0.6}>ARABIA</text>
        <text x={420} y={760} fontFamily={serif} fontSize={48} letterSpacing={14} fill="#5a3a20" opacity={0.55}>ABYSSINIA</text>
        <text x={1500} y={930} fontFamily={serif} fontSize={56} letterSpacing={14} fill="#7a1420" opacity={yemen}>YEMEN</text>
        <path d="M 1300 640 Q 1520 600 1720 700 L 1760 960 Q 1560 1000 1400 990 Z" fill="#c9784a" opacity={0.18 * yemen} />
        {/* places */}
        {[MAPS.sanaa, MAPS.najran, MAPS.aksum, MAPS.makkah].map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={9} fill="#3a2414" />)}
        {label(MAPS.sanaa[0], MAPS.sanaa[1], "Ṣanʿāʾ")}
        {label(MAPS.najran[0], MAPS.najran[1], "Najrān")}
        {label(MAPS.aksum[0] - 150, MAPS.aksum[1] + 10, "Aksum")}
        {label(MAPS.makkah[0], MAPS.makkah[1], "Makkah")}
        {/* the trench at Najrān — a glow, nothing more */}
        <circle cx={MAPS.najran[0]} cy={MAPS.najran[1]} r={60 + 10 * Math.sin(frame * 0.3)} fill="#ff6a1a" opacity={0.35 * trench} />
        <circle cx={MAPS.najran[0]} cy={MAPS.najran[1]} r={26} fill="#ffb347" opacity={0.6 * trench} />
        {/* escape north toward Rome */}
        <Dash pts={[MAPS.najran, [1380, 520], [1230, 250], [1080, 20], [960, -250]]} t={escape} />
        {escape > 0.95 ? label(980, -200, "to the Roman emperor", 1, 34) : null}
        {/* the emperor's letter down to Aksum */}
        <Dash pts={[[820, -250], [700, 100], [800, 500], [MAPS.aksum[0], MAPS.aksum[1]]]} t={letter} color="#2f4f7a" />
        {/* the fleet */}
        <Dash pts={[MAPS.aksum, [1160, 860], MAPS.landing]} t={fleet} color="#3a2414" w={4} />
        {fleet > 0 ? (
          <g transform={`translate(${fx} ${fy}) scale(0.16)`}>
            <Ship rock={Math.sin(frame * 0.2) * 4} />
            <g transform="translate(-260 80)"><Ship rock={Math.sin(frame * 0.2 + 1) * 4} /></g>
            <g transform="translate(-200 -150)"><Ship rock={Math.sin(frame * 0.2 + 2) * 4} /></g>
          </g>
        ) : null}
      </Layer>
      <Vignette strength={0.5} color="60,35,10" />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};

// 3 — the fleet crossing the sea at dawn.
const Waves: React.FC<{ y: number; color: string; amp: number; speed: number; seed: number }> = ({ y, color, amp, speed, seed }) => {
  const { frame } = useShot();
  let d = `M -1600 ${y}`;
  for (let x = -1600; x <= 4000; x += 80) d += ` Q ${x + 40} ${y - amp * Math.sin(x * 0.01 + frame * speed + seed)} ${x + 80} ${y}`;
  return <path d={d + ` L 4000 ${H + 600} L -1600 ${H + 600} Z`} fill={color} />;
};
export const Fleet: React.FC = () => {
  const { frame, p } = useShot();
  const cam = moveCam(p, { x: -120, y: 0, zoom: 1.05 }, { x: 160, y: -20, zoom: 1.2 });
  const ships = new Array(11).fill(0).map((_, i) => ({ x: 120 + i * 190 + random(`fs${i}`) * 80 + frame * 0.9, y: 640 + (i % 3) * 40, s: 0.32 + (i % 3) * 0.12 }));
  return (
    <AbsoluteFill style={{ background: SKY.dawn }}>
      <Layer d={0.02} cam={cam}><Sun x={1450} y={560} r={80} color="#fff3d6" /></Layer>
      <Layer d={0.08} cam={cam}><Clouds y={150} color="#f0b4a0" opacity={0.5} seed="fl" /></Layer>
      <Layer d={0.2} cam={cam}><Waves y={620} color="#6e7aa0" amp={4} speed={0.04} seed={0} /></Layer>
      <Layer d={0.5} cam={cam}>
        {ships.filter((_, i) => i % 3 === 0).map((s, i) => <g key={i} transform={`translate(${s.x} ${s.y})`}><Ship rock={Math.sin(frame * 0.05 + i) * 3} scale={s.s} sail="#e9d5b5" /></g>)}
        <Waves y={680} color="#4f5f88" amp={8} speed={0.06} seed={2} />
      </Layer>
      <Layer d={0.8} cam={cam}>
        {ships.filter((_, i) => i % 3 !== 0).map((s, i) => <g key={i} transform={`translate(${s.x} ${s.y + 90})`}><Ship rock={Math.sin(frame * 0.05 + i * 2) * 3} scale={s.s + 0.15} /></g>)}
        <Waves y={800} color="#3a4a72" amp={12} speed={0.07} seed={4} />
      </Layer>
      <Layer d={1.3} cam={cam}><Waves y={960} color="#26335a" amp={22} speed={0.09} seed={6} /></Layer>
      <Grade color="#ffb070" opacity={0.15} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// 4 — among the soldiers: Abraha. Everyone else falls into shadow.
export const AbrahaIntro: React.FC = () => {
  const { frame, p } = useShot();
  const cam = moveCam(p, { x: 0, y: 0, zoom: 1.0 }, { x: 0, y: -40, zoom: 1.6 });
  const spot = iv(p, [0.25, 0.6], [0, 1], ease);
  return (
    <AbsoluteFill style={{ background: SKY.hot }}>
      <Layer d={0.15} cam={cam}><path d={dunes("ai", 720, 60)} fill="#d9a46a" /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={860} width={3800} height={600} fill="#c98f58" />
        {new Array(13).fill(0).map((_, i) => {
          if (i === 6) return null;
          const x = 960 + (i - 6) * 150;
          return <Figure key={i} x={x} y={880 + (i % 2) * 20} s={0.85} outfit={SOLDIER(i)} pose={{ ...STAND, head: Math.sin(frame * 0.04 + i) * 3 }} opacity={1 - spot * 0.55} />;
        })}
        <ellipse cx={960} cy={890} rx={160} ry={24} fill="#fff1c9" opacity={0.4 * spot} />
        <Figure x={960} y={890} s={0.85} sx={1.18} sy={0.86} outfit={OUT.abraha} pose={{ ...STAND, head: -4 }} />
      </Layer>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 62%, rgba(0,0,0,0) 14%, rgba(10,4,0,0.75) 46%)", opacity: spot }} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// 5 — Dhū Nuwās rides his horse into the sea until it takes him.
export const SeaRide: React.FC = () => {
  const { frame, p } = useShot();
  const cam = moveCam(p, { x: -200, y: 0, zoom: 1.05 }, { x: 260, y: 20, zoom: 1.25 });
  const x = iv(p, [0, 0.9], [300, 1500], Easing_in);
  const sink = iv(p, [0.35, 0.92], [0, 230], ease);
  const gone = iv(p, [0.88, 0.95], [1, 0]);
  return (
    <AbsoluteFill style={{ background: SKY.storm }}>
      <Layer d={0.03} cam={cam}><Sun x={1500} y={600} r={70} color="#ffcf9a" /></Layer>
      <Layer d={0.08} cam={cam}><Clouds y={120} color="#4a3038" opacity={0.8} seed="sr" speed={0.6} /></Layer>
      <Layer d={0.3} cam={cam}><Waves y={640} color="#4a3a48" amp={6} speed={0.08} seed={1} /></Layer>
      <Layer d={1} cam={cam}>
        <path d="M -900 840 L 700 840 Q 800 860 900 900 L -900 900 Z" fill="#8a6a4a" />
        <g opacity={gone}>
          <g transform={`translate(${x} ${880 + sink})`}>
            <Horse phase={frame * 0.35} gallop={1 - sink / 300} color="#2a1e1a" rider={<g transform="scale(0.75)"><g transform="translate(0 70)"><Figure x={0} y={0} outfit={OUT.dhuNuwas} pose={{ ...SIT, armRU: -60, armRL: -40 }} /></g></g>} />
          </g>
        </g>
        <Waves y={800} color="#30283a" amp={18} speed={0.1} seed={3} />
        <g opacity={0.5}><Waves y={830} color="#e8d8c8" amp={4} speed={0.12} seed={5} /></g>
        <Waves y={860} color="#221c2c" amp={24} speed={0.11} seed={7} />
      </Layer>
      <Layer d={1.3} cam={cam}><Dust n={60} color="#d8c8c8" y0={600} y1={1000} drift={2.5} opacity={0.3} size={2} seed="spray" /></Layer>
      <Grade color="#5a6a9a" opacity={0.2} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};
const Easing_in = (t: number) => t * t;

// 6 — Aryāṭ rules Yemen from the throne.
export const AryatThrone: React.FC = () => {
  const { frame, p } = useShot();
  const cam = moveCam(p, { x: 0, y: 0, zoom: 1.0 }, { x: 0, y: -30, zoom: 1.22 });
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a1a10" }}>
      <Hall cam={cam} wall="#5a3a22" arch="#3a2414" pillar="#8a6a46" floor="#6a4a30" banner="#1f4f7a" />
      <Layer d={1} cam={cam}>
        <Throne x={960} y={840} gold="#c9a24a" cloth="#1f4f7a" />
        <Figure x={960} y={800} s={0.92} sy={1.1} outfit={{ ...OUT.aryat, crown: true, wrap: undefined }} pose={{ ...SIT, armRU: -30, armRL: -70, head: Math.sin(frame * 0.03) * 2 }} />
        {[-1, 1].map((s) => [0, 1].map((k) => <Figure key={`${s}${k}`} x={960 + s * (300 + k * 170)} y={850} s={0.82} outfit={BLUE(k + (s > 0 ? 1 : 0))} flip={s > 0} />))}
      </Layer>
      <Grade color="#ffb050" opacity={0.15} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// 7 — two armies face each other; a rider carries Abraha's message across the gap.
export const TwoArmies: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const rideAt = at(b, 0, dur, 0.25);
  const cam = moveCam(p, { x: 0, y: 40, zoom: 1.0 }, { x: 60, y: 0, zoom: 1.12 });
  const rx = iv(frame, [rideAt, rideAt + 120], [600, 1250], ease);
  const army = (side: number, color: (i: number) => any, banner: string) => (
    <g>
      {new Array(18).fill(0).map((_, i) => {
        const row = Math.floor(i / 6);
        const x = side < 0 ? 120 + (i % 6) * 70 + row * 30 : 1500 + (i % 6) * 70 - row * 30;
        return <Figure key={i} x={x} y={820 + row * 40} s={0.55 + row * 0.08} outfit={color(i)} flip={side > 0} pose={{ ...STAND, head: Math.sin(frame * 0.05 + i) * 2 }} />;
      })}
      {[0, 1, 2].map((i) => {
        const x = side < 0 ? 200 + i * 160 : 1560 + i * 160;
        return (
          <g key={i}>
            <line x1={x} y1={820} x2={x} y2={560} stroke="#3a2416" strokeWidth={5} />
            <path d={`M ${x} 560 Q ${x + 50 * -side + Math.sin(frame * 0.2 + i) * 8} ${575 + Math.sin(frame * 0.15 + i) * 5} ${x + 90 * -side} 590 L ${x} 620 Z`} fill={banner} />
          </g>
        );
      })}
    </g>
  );
  return (
    <AbsoluteFill style={{ background: SKY.day }}>
      <Layer d={0.05} cam={cam}><Clouds y={120} color="#fff8ee" opacity={0.85} seed="ta" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("taf", 640, 140, 120, -1600, 4400, true)} fill="#a8a07a" /></Layer>
      <Layer d={0.4} cam={cam}><path d={ridge("tam", 700, 60, 160, -1600, 4400, true)} fill="#8a9a62" /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={760} width={3800} height={700} fill="#c9a46a" />
        {army(-1, SOLDIER, "#8f2a1c")}
        {army(1, BLUE, "#1f4f7a")}
        {frame > rideAt ? <g transform={`translate(${rx} 900) scale(0.55)`}><Horse phase={frame * 0.4} rider={<g transform="scale(0.9) translate(0 70)"><Figure x={0} y={0} outfit={SOLDIER(2, false)} pose={SIT} /></g>} /></g> : null}
      </Layer>
      <Layer d={1.3} cam={cam}><Dust n={30} color="#f0dcae" y0={700} y1={1050} drift={1} opacity={0.3} /></Layer>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// 8 — the duel: short, heavy Abraha against tall Aryāṭ with his spear; ʿAtwada hidden behind.
// The shot ends the instant the spear comes down (the timeline cuts to black there).
export const Duel: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const showA = at(b, 0, dur, 0.12);
  const showB = at(b, 1, dur, 0.3);
  const servantAt = at(b, 2, dur, 0.5);
  const raiseAt = at(b, 3, dur, 0.72);
  const strike = iv(frame, [dur - 10, dur - 2], [0, 1]);
  const raise = iv(frame, [raiseAt, raiseAt + 25], [0, 1], ease);
  const focus = frame < showB ? { x: -260, y: -20, zoom: 1.55 } : frame < servantAt ? { x: 240, y: -60, zoom: 1.5 } : frame < raiseAt ? { x: -320, y: 0, zoom: 1.6 } : { x: 0, y: -80, zoom: 1.45 };
  const cam = frame < showA ? moveCam(p / 0.12, { x: 0, y: 0, zoom: 1.0 }, { x: 0, y: 0, zoom: 1.15 }) : focus;
  const aryat: Pose = blend(blend({ ...STAND, armRU: -40, armRL: -30 }, { ...STAND, armRU: -175, armRL: -10, lean: -4 }, raise), { ...STAND, armRU: -60, armRL: -10, lean: 8 }, strike);
  const peek = iv(frame, [servantAt, servantAt + 20], [0, 1], ease);
  return (
    <AbsoluteFill style={{ background: SKY.hot }}>
      <Layer d={0.15} cam={cam}><path d={ridge("du", 660, 120, 140, -1600, 4400, true)} fill="#c69a6a" /></Layer>
      <Layer d={0.4} cam={cam}>
        <rect x={-900} y={760} width={3800} height={700} fill="#bd8d55" />
        {new Array(24).fill(0).map((_, i) => <Figure key={i} x={i < 12 ? -300 + i * 50 : 1700 + (i - 12) * 50} y={780} s={0.38} outfit={i < 12 ? SOLDIER(i) : BLUE(i)} flip={i >= 12} />)}
      </Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={860} width={3800} height={700} fill="#c99a62" />
        <Figure x={690 - peek * 60} y={880} s={0.95} outfit={OUT.servant} pose={blend({ ...STAND, lean: 10, head: 10 }, { ...STAND, lean: -6, head: -6, armRU: -50 }, peek)} />
        <Figure x={780} y={880} s={1.05} sx={1.2} sy={0.84} outfit={OUT.abraha} pose={{ ...STAND, armRU: -30, armRL: -50, head: -2 }} />
        <Figure x={1180} y={880} s={1.05} sy={1.16} outfit={OUT.aryat} flip pose={aryat} />
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={40} color="#f6dcae" y0={600} y1={1100} drift={1.6} opacity={0.35} /></Layer>
      <Grade color="#ff9040" opacity={0.12 + raise * 0.12} />
      <Vignette strength={0.55 + raise * 0.2} />
    </AbsoluteFill>
  );
};

// 9 — after the blow: Abraha reels, ʿAtwada leaps, Aryāṭ falls, his army comes over.
export const DuelAftermath: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const leapAt = at(b, 0, dur, 0.45);
  const joinAt = at(b, 1, dur, 0.75);
  const reel = iv(frame, [0, 12], [1, 0]);
  const leap = iv(frame, [leapAt, leapAt + 14], [0, 1], ease);
  const fall = iv(frame, [leapAt + 10, leapAt + 34], [0, 1], ease);
  const join = iv(frame, [joinAt, joinAt + 40], [0, 1], ease);
  const cam = frame < joinAt ? moveCam(Math.min(1, frame / Math.max(1, joinAt)), { x: -80, y: -60, zoom: 1.6 }, { x: 60, y: -40, zoom: 1.45 }) : moveCam(join, { x: 60, y: -40, zoom: 1.45 }, { x: 0, y: 30, zoom: 1.0 });
  return (
    <AbsoluteFill style={{ background: SKY.hot }}>
      <Layer d={0.15} cam={cam}><path d={ridge("du", 660, 120, 140, -1600, 4400, true)} fill="#c69a6a" /></Layer>
      <Layer d={0.4} cam={cam}>
        <rect x={-900} y={760} width={3800} height={700} fill="#bd8d55" />
        {new Array(24).fill(0).map((_, i) => {
          const blue = i >= 12;
          const turn = blue && join > (i - 12) / 14;
          return <Figure key={i} x={i < 12 ? -300 + i * 50 : 1700 + (i - 12) * 50 - (turn ? join * 160 : 0)} y={780} s={0.38} outfit={blue ? (turn ? SOLDIER(i) : BLUE(i)) : SOLDIER(i)} flip={blue} />;
        })}
      </Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={860} width={3800} height={700} fill="#c99a62" />
        <g transform={`translate(780 880) rotate(${-8 * reel})`}>
          <Figure x={0} y={0} s={1.05} sx={1.2} sy={0.84} outfit={OUT.abraha} pose={{ ...STAND, armRU: -150, armRL: -120, lean: -10 + reel * 6, head: 12 }} />
          {/* the wound — one dark line across the faceless head */}
          <path d="M 18 -272 L -14 -210" stroke="#5a0f10" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
        </g>
        <g transform={`translate(${690 + leap * 420} ${880 - Math.sin(leap * Math.PI) * 120})`}>
          <Figure x={0} y={0} s={0.95} outfit={OUT.servant} pose={blend({ ...STAND, lean: 10 }, { ...STAND, lean: -20, armRU: -120, armRL: -10, legLU: 40, legRU: -40 }, leap)} />
        </g>
        <g transform={`translate(1180 880) rotate(${fall * 84} 0 0)`} opacity={1 - iv(frame, [leapAt + 60, leapAt + 90], [0, 0.4])}>
          <Figure x={0} y={0} s={1.05} sy={1.16} outfit={{ ...OUT.aryat, spear: fall < 0.3 }} flip pose={{ ...STAND, armRU: -60, armRL: -10, lean: 8 }} />
        </g>
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={40} color="#f6dcae" y0={600} y1={1100} drift={1.6} opacity={0.35} /></Layer>
      <Grade color="#ff9040" opacity={0.18} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// 10 — the Negus in Aksum, furious. 12 — later, pleased, the bag of soil under his feet.
export const NegusCourt: React.FC<{ b?: number[]; pleased?: boolean }> = ({ b, pleased }) => {
  const { frame, dur, p } = useShot();
  const riseAt = at(b, 0, dur, 0.15);
  const rise = pleased ? 0 : iv(frame, [riseAt, riseAt + 20], [0, 1], ease);
  const cam = moveCam(p, { x: 0, y: 0, zoom: pleased ? 1.15 : 1.0 }, { x: 0, y: -50, zoom: pleased ? 1.4 : 1.35 });
  const step = pleased ? iv(p, [0.35, 0.55], [0, 1], ease) : 0;
  const negus: Pose = pleased
    ? { ...SIT, legRU: -88 + step * 30, legRL: 86 - step * 40, head: 4 }
    : blend({ ...SIT, head: 0 }, { ...STAND, armRU: -110, armRL: -20, lean: 6, head: 6 }, rise);
  return (
    <AbsoluteFill style={{ backgroundColor: "#10180f" }}>
      <Hall cam={cam} wall="#24331f" arch="#162212" pillar="#6a5a2e" floor="#3a3622" banner="#2f6b3a" />
      <Layer d={1} cam={cam}>
        <Throne x={960} y={840} gold="#d4b04a" cloth="#2f6b3a" />
        <Figure x={960} y={rise > 0.5 ? 840 : 800} s={0.95} outfit={OUT.negus} pose={negus} />
        {pleased ? (
          <g transform="translate(1010 838)">
            <path d="M -40 0 Q -48 -50 -10 -58 Q 0 -70 14 -58 Q 48 -50 40 0 Z" fill="#7a4a26" />
            <path d="M -12 -58 Q 0 -66 12 -58" stroke="#3a2416" strokeWidth={4} fill="none" />
          </g>
        ) : null}
        {[-1, 1].map((s) => [0, 1].map((k) => <Figure key={`${s}${k}`} x={960 + s * (310 + k * 170)} y={850} s={0.82} outfit={{ ...SOLDIER(k), robe: "#2f6b3a", robeShade: "#1f4a28" }} flip={s > 0} pose={{ ...STAND, head: rise * s * 4 }} />))}
      </Layer>
      <Grade color={pleased ? "#ffd070" : "#ff4020"} opacity={pleased ? 0.14 : 0.1 + rise * 0.1} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// 11 — Abraha, head shaved, pours the soil of Yemen into a leather bag; then a rider carries it away.
export const SoilBag: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const rideAt = at(b, 0, dur, 0.55);
  const riding = frame >= rideAt;
  const cam = riding ? moveCam((frame - rideAt) / Math.max(1, dur - rideAt), { x: -200, y: 0, zoom: 1.0 }, { x: 200, y: 0, zoom: 1.08 }) : moveCam(frame / Math.max(1, rideAt), { x: 0, y: -60, zoom: 1.5 }, { x: 0, y: -90, zoom: 1.75 });
  const pour = (frame % 40) / 40;
  if (riding) {
    const x = iv(frame, [rideAt, dur], [200, 1700]);
    return (
      <AbsoluteFill style={{ background: SKY.hot }}>
        <Layer d={0.02} cam={cam}><Sun x={1400} y={300} r={70} /></Layer>
        <Layer d={0.15} cam={cam}><path d={dunes("sb1", 700, 80)} fill="#e0b47a" /></Layer>
        <Layer d={0.4} cam={cam}><path d={dunes("sb2", 780, 60)} fill="#d4a062" /></Layer>
        <Layer d={1} cam={cam}>
          <path d={dunes("sb3", 870, 30)} fill="#c98f52" />
          <g transform={`translate(${x} 900) scale(0.75)`}><Camel phase={frame * 0.18} load /></g>
          <g transform={`translate(${x - 4} 742) scale(0.55)`}><Figure x={0} y={0} outfit={SOLDIER(1, false)} pose={SIT} /></g>
        </Layer>
        <Layer d={1.3} cam={cam}><Dust n={30} y0={700} y1={1000} drift={2} opacity={0.3} /></Layer>
        <Vignette strength={0.45} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: SKY.hot }}>
      <Layer d={0.15} cam={cam}><path d={dunes("sb0", 700, 60)} fill="#e0b47a" /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={860} width={3800} height={700} fill="#c98f52" />
        <Figure x={900} y={880} s={1.0} sx={1.2} sy={0.84} outfit={OUT.abrahaBald} pose={{ ...STAND, lean: 18, head: 18, armRU: -70, armRL: -40, legLU: -30, legLL: 60, legRU: -40, legRL: 70, bob: 20 }} />
        <g transform="translate(1060 880)">
          <path d="M -55 0 Q -65 -80 -20 -96 L 20 -96 Q 65 -80 55 0 Z" fill="#7a4a26" />
          <ellipse cx={0} cy={-96} rx={22} ry={7} fill="#3a2416" />
          {new Array(10).fill(0).map((_, i) => <circle key={i} cx={-10 + ((i * 7) % 20)} cy={-150 + ((pour * 60 + i * 9) % 60)} r={3} fill="#a8743e" />)}
        </g>
      </Layer>
      <Grade color="#ff9a40" opacity={0.14} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// 13 — al-Qullays rising: scaffolds, marble, gold and silver crosses; the camera tilts up its height.
export const Church: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, p } = useShot();
  const grow = iv(p, [0, 0.75], [0.15, 1], ease);
  const cam = moveCam(p, { x: 0, y: 120, zoom: 1.15 }, { x: 0, y: -260, zoom: 1.05 });
  const glint = iv(p, [0.7, 1], [0, 1]);
  const top = 880 - 820 * grow;
  return (
    <AbsoluteFill style={{ background: SKY.day }}>
      <Layer d={0.04} cam={cam}><Clouds y={60} color="#ffffff" opacity={0.85} seed="ch" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("chf", 700, 140, 130, -1600, 4400, true)} fill="#9a9a7a" /></Layer>
      <Layer d={0.45} cam={cam}><g transform="translate(0 0)"><path d="M -900 760 L 2900 760 L 2900 1500 L -900 1500 Z" fill="#c9a87a" /></g></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={880} width={3800} height={700} fill="#c4a070" />
        {/* the church */}
        <g>
          <rect x={620} y={Math.max(top + 300, 520)} width={680} height={880 - Math.max(top + 300, 520)} fill="#f1ead8" />
          <rect x={760} y={Math.max(top + 120, 400)} width={400} height={880 - Math.max(top + 120, 400)} fill="#e6dcc4" />
          <rect x={860} y={top} width={200} height={880 - top} fill="#f6f0e2" />
          <path d={`M 850 ${top} Q 960 ${top - 120} 1070 ${top} Z`} fill="#d4b04a" />
          {new Array(9).fill(0).map((_, i) => <path key={i} d={`M ${660 + i * 72} 880 L ${660 + i * 72} ${Math.max(top + 380, 600)} Q ${684 + i * 72} ${Math.max(top + 350, 570)} ${708 + i * 72} ${Math.max(top + 380, 600)} L ${708 + i * 72} 880 Z`} fill="#8a7a62" opacity={0.6} />)}
          {/* crosses of gold and silver */}
          {[[960, top - 120, "#e3c04a", 1.2], [780, Math.max(top + 120, 400) - 10, "#d8d8e0", 0.8], [1140, Math.max(top + 120, 400) - 10, "#d8d8e0", 0.8]].map(([x, y, c, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <rect x={-6} y={-90} width={12} height={90} fill={c as string} />
              <rect x={-30} y={-70} width={60} height={12} fill={c as string} />
              <circle cx={0} cy={-64} r={40} fill="#fff6c8" opacity={glint * (0.4 + 0.3 * Math.sin(frame * 0.3 + i))} />
            </g>
          ))}
          {/* scaffolds while it is still rising */}
          <g opacity={1 - grow * 0.85}>
            {new Array(6).fill(0).map((_, i) => <line key={i} x1={600 + i * 144} y1={880} x2={600 + i * 144} y2={top - 40} stroke="#6a4a2a" strokeWidth={6} />)}
            {new Array(10).fill(0).map((_, i) => <line key={i} x1={600} y1={880 - i * 90} x2={1320} y2={880 - i * 90} stroke="#6a4a2a" strokeWidth={5} />)}
          </g>
        </g>
        {/* workers hauling stone */}
        {new Array(8).fill(0).map((_, i) => {
          const x = ((frame * 1.4 + i * 260) % 2000) - 200;
          return (
            <g key={i}>
              <Figure x={x} y={940 + (i % 2) * 40} s={0.5} outfit={ARAB(i)} pose={{ ...walkPose(frame * 0.2 + i, 0.8), lean: 14, armRU: -90, armLU: -90 }} />
              <rect x={x + 20} y={(940 + (i % 2) * 40) - 120} width={50} height={34} fill="#efe8d8" />
            </g>
          );
        })}
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={40} color="#ffffff" y0={500} y1={1100} drift={0.5} opacity={0.25} /></Layer>
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};

// 14 — a letter written by lamplight.
export const Letter: React.FC<{ lines?: number }> = ({ lines = 6 }) => {
  const { frame, p } = useShot();
  const cam = moveCam(p, { x: 0, y: 0, zoom: 1.0 }, { x: 40, y: 20, zoom: 1.2 });
  const written = p * lines;
  const flick = 1 + 0.05 * Math.sin(frame * 0.6) + 0.03 * Math.sin(frame * 1.7);
  const lx = 640 + Math.min(1, written % 1) * 640;
  const ly = 400 + Math.floor(Math.min(written, lines - 0.01)) * 70;
  return (
    <AbsoluteFill style={{ backgroundColor: "#140c08" }}>
      <Layer d={0.6} cam={cam}>
        <circle cx={1500} cy={420} r={600 * flick} fill="#ffb347" opacity={0.12} />
        <rect x={-400} y={-200} width={2800} height={1500} fill="#2a1a10" opacity={0.6} />
      </Layer>
      <Layer d={1} cam={cam}>
        <rect x={-400} y={700} width={2800} height={700} fill="#4a2e1a" />
        <path d="M 560 300 L 1360 290 L 1380 900 L 540 910 Z" fill="#ead9b0" />
        {new Array(lines).fill(0).map((_, i) => {
          const t = Math.max(0, Math.min(1, written - i));
          return <path key={i} d={`M 640 ${400 + i * 70} ${new Array(16).fill(0).map((_, k) => `Q ${660 + k * 40} ${390 + i * 70 + (k % 2 ? -10 : 10)} ${680 + k * 40} ${400 + i * 70}`).join(" ")}`} stroke="#3a2414" strokeWidth={4} fill="none" strokeDasharray={`${t * 700} 700`} />;
        })}
        <line x1={lx} y1={ly} x2={lx + 140} y2={ly - 260} stroke="#e8e0cc" strokeWidth={6} />
        <path d={`M ${lx + 140} ${ly - 260} Q ${lx + 200} ${ly - 330} ${lx + 170} ${ly - 200} Z`} fill="#e8e0cc" />
        <g transform="translate(1500 640)">
          <ellipse cx={0} cy={40} rx={110} ry={30} fill="#7a4a26" />
          <path d={`M -12 0 Q 0 ${-70 * flick} 12 0 Z`} fill="#ffcf7a" />
          <circle cx={0} cy={-20} r={160 * flick} fill="#ffb347" opacity={0.15} />
        </g>
      </Layer>
      <Grade color="#ff9a40" opacity={0.2} />
      <Vignette strength={0.75} />
    </AbsoluteFill>
  );
};

// 15 — night: a man from Kināna slips into al-Qullays and away again.
export const Kinani: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const inAt = at(b, 0, dur, 0.4);
  const outAt = at(b, 1, dur, 0.72);
  const cam = moveCam(p, { x: 0, y: -60, zoom: 1.05 }, { x: 60, y: 40, zoom: 1.3 });
  const x = frame < inAt ? iv(frame, [0, inAt], [300, 920]) : frame < outAt ? 960 : iv(frame, [outAt, dur], [960, 1900]);
  const visible = frame < inAt || frame > outAt + 6;
  return (
    <AbsoluteFill style={{ background: SKY.night }}>
      <Layer d={0.02} cam={cam}><Stars /><Moon x={1500} y={170} /></Layer>
      <Layer d={0.2} cam={cam}><Town y={760} n={20} x0={-400} gap={140} lit seed="kn" /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={880} width={3800} height={700} fill="#2a2632" />
        <rect x={620} y={520} width={680} height={360} fill="#bab2a0" />
        <rect x={760} y={400} width={400} height={480} fill="#aaa290" />
        <rect x={860} y={60} width={200} height={820} fill="#c4bca8" />
        <path d="M 850 60 Q 960 -60 1070 60 Z" fill="#8a7a4a" />
        <path d="M 920 880 L 920 740 Q 960 700 1000 740 L 1000 880 Z" fill="#141018" />
        <Torch x={860} y={760} seed={3} s={0.7} />
        <Torch x={1060} y={760} seed={5} s={0.7} />
        {visible ? <Figure x={x} y={900} s={0.55} outfit={{ skin: "#1a1420", robe: "#1a1420", robeShade: "#120e16", wrap: "#1a1420" }} pose={walkPose(frame * (frame > outAt ? 0.45 : 0.25), frame > outAt ? 1.4 : 0.7)} flip={false} /> : null}
      </Layer>
      <Grade color="#3a5aa0" opacity={0.25} />
      <Vignette strength={0.75} />
    </AbsoluteFill>
  );
};

// 16 — Abraha's fury; torches, the army prepares, and in the dark the elephant appears.
export const Rage: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const fistAt = at(b, 0, dur, 0.3);
  const elAt = at(b, 1, dur, 0.78);
  const fist = iv(frame, [fistAt, fistAt + 12], [0, 1], ease);
  const showEl = frame >= elAt;
  if (showEl) {
    const t = (frame - elAt) / Math.max(1, dur - elAt);
    const cam = moveCam(t, { x: 0, y: -40, zoom: 1.0 }, { x: 0, y: -120, zoom: 1.35 });
    const light = iv(t, [0, 0.5], [0, 1]);
    return (
      <AbsoluteFill style={{ backgroundColor: "#07040a" }}>
        <Layer d={0.3} cam={cam}>
          {[300, 1620].map((x, i) => <Torch key={i} x={x} y={600} seed={i * 7} s={1.2} />)}
        </Layer>
        <Layer d={1} cam={cam}>
          <rect x={-900} y={900} width={3800} height={700} fill="#140c0c" />
          <g transform="translate(960 930) scale(1.3)" opacity={0.25 + light * 0.75}>
            <KElephant phase={frame * 0.05} earFlap={(Math.sin(frame * 0.07) + 1) / 2} skin="#4a3e3a" trunkUp={iv(t, [0.4, 0.8], [0, 1], ease)} />
          </g>
        </Layer>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.85) 70%)" }} />
        <Grade color="#ff6a20" opacity={0.18} />
      </AbsoluteFill>
    );
  }
  const cam = moveCam(frame / Math.max(1, elAt), { x: 0, y: 0, zoom: 1.0 }, { x: 0, y: -40, zoom: 1.4 });
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0a0a" }}>
      <Hall cam={cam} wall="#3a1612" arch="#22100c" pillar="#6a3a28" floor="#3a2018" banner="#8f2a1c" />
      <Layer d={1} cam={cam}>
        <Throne x={960} y={840} />
        <Figure x={960} y={fist > 0.5 ? 840 : 800} s={0.95} sx={1.2} sy={0.84} outfit={OUT.abrahaKing} pose={blend(SIT, { ...STAND, armRU: -150, armRL: -40, lean: 4, head: 6 }, fist)} />
        <Figure x={1300} y={850} s={0.8} outfit={ARAB(1)} flip pose={{ ...STAND, lean: 14, head: 14 }} />
        <path d="M 940 -24 L 1000 -60" opacity={0} />
      </Layer>
      <Grade color="#ff3010" opacity={0.08 + fist * 0.12} />
      <Vignette strength={0.65} />
    </AbsoluteFill>
  );
};
