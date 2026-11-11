import React from "react";
import { AbsoluteFill } from "remotion";
import { STAND, SIT, walkPose, blend, Pose } from "../cartoon/Rig";
import { OUT, SOLDIER, BLUE, ARAB } from "../ep1/kit";
import {
  Cam, Layer, Defs, Sky, SKIES, iv, ease, easeOut, easeIn, useShot, useView, lerpCam, aim, shakeAt, ridge, Dust, DustBurst, Grade, Vignette, Glow,
  Fig, Ship2, Horse2, Torch2,
} from "./kit2";

// Part 2 — "The Split Face": the landing, Dhū Nuwās rides into the sea, the rivals, the duel.
const at = (b: number[] | undefined, i: number, dur: number, frac: number) => (b && b[i] !== undefined ? b[i] : Math.round(dur * frac));
const Waves: React.FC<{ y: number; color: string; amp: number; speed: number; seed: number }> = ({ y, color, amp, speed, seed }) => {
  const { frame } = useShot();
  let d = `M -1400 ${y}`;
  for (let x = -1400; x <= 3400; x += 80) d += ` Q ${x + 40} ${y - amp * Math.sin(x * 0.01 + frame * speed + seed)} ${x + 80} ${y}`;
  return <path d={d + ` L 3400 2600 L -1400 2600 Z`} fill={color} />;
};

// 2a — the landing: ships beached, soldiers wading ashore; then the commander Aryāṭ. b = [aryatAt]
export const Landing: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const aAt = at(b, 0, dur, 0.45);
  const close = frame >= aAt;
  const cam = close
    ? lerpCam((frame - aAt) / Math.max(1, dur - aAt), aim(vertical, 1080, 1260, 1.7), aim(vertical, 1080, 1230, 1.85))
    : lerpCam(frame / Math.max(1, aAt), { x: -120, y: 40, zoom: 1.0 }, { x: 0, y: 0, zoom: 1.1 });
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={1500} y={700} r={500} o={0.6} /></Layer>
      <Layer d={0.15} cam={cam}>
        <Waves y={1180} color="#6aa0c0" amp={3} speed={0.04} seed={1} />
        {new Array(14).fill(0).map((_, i) => <g key={i} transform={`translate(${-200 + i * 170} ${1170 + (i % 2) * 10})`}><Ship2 rock={Math.sin(frame * 0.05 + i) * 2} s={0.18} /></g>)}
      </Layer>
      <Layer d={0.45} cam={cam}>
        <Waves y={1300} color="#4f8aac" amp={8} speed={0.06} seed={3} />
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${200 + i * 640} 1320)`}><Ship2 rock={Math.sin(frame * 0.05 + i) * 2} s={0.55} /></g>)}
        <path d="M -1400 1360 Q 600 1330 3400 1380 L 3400 2600 L -1400 2600 Z" fill="#e6cfa0" />
      </Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1450} width={4800} height={1200} fill="#dcc08a" />
        {new Array(16).fill(0).map((_, i) => {
          const x = -200 + i * 140 + ((frame * 1.4) % 140);
          return <Fig key={i} x={x} y={1440 + (i % 3) * 30} s={0.62} outfit={SOLDIER(i)} prop="spear" pose={walkPose(frame * 0.18 + i)} />;
        })}
        <Fig x={1080} y={1470} s={1.0} sy={1.14} outfit={OUT.aryat} prop="spear" flip pose={{ ...STAND, armRU: -20, armRL: -10, head: -4 }} sway={frame * 0.1} />
      </Layer>
      <Layer d={1.3} cam={cam}><Dust n={30} color="#ffffff" y0={1000} y1={1600} drift={0.6} opacity={0.3} /></Layer>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// 2b — "a soldier called Abraha… Remember that name." The ranks fall into shadow; one man stays lit.
export const AbrahaSpot: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, aim(vertical, 960, 1250, 1.0), aim(vertical, 960, 1270, vertical ? 1.9 : 1.7), easeOut);
  const spot = iv(p, [0.1, 0.5], [0, 1], ease);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.15} cam={cam}><path d={ridge("as", 1300, 120, 160)} fill="#c9a06a" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1420} width={4800} height={1200} fill="#c99a62" />
        {new Array(15).fill(0).map((_, i) => (i === 7 ? null : <Fig key={i} x={960 + (i - 7) * 130} y={1440 + (i % 2) * 18} s={0.8} outfit={SOLDIER(i)} prop="spear" pose={{ ...STAND, head: Math.sin(frame * 0.04 + i) * 3 }} o={1 - spot * 0.4} />))}
        <Fig x={960} y={1450} s={0.8} sx={1.2} sy={0.85} outfit={OUT.abraha} prop="spear" pose={{ ...STAND, head: -4 }} />
      </Layer>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 30% 40% at 50% 62%, rgba(0,0,0,0) 30%, rgba(8,3,0,0.85) 100%)", opacity: spot }} />
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

// 2c — Dhū Nuwās's army breaks; he turns his horse into the sea and is gone. b = [rideAt]
export const SeaRide2: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const rideAt = at(b, 0, dur, 0.3);
  const t = Math.max(0, frame - rideAt) / Math.max(1, dur - rideAt);
  const x = 500 + iv(t, [0, 0.85], [0, 1100], easeIn);
  const sink = iv(t, [0.3, 0.9], [0, 280], ease);
  const gone = iv(t, [0.86, 0.94], [1, 0]);
  const battle = frame < rideAt;
  const sh = shakeAt(frame, battle ? [4, 22] : [], 14);
  const c0: Cam = battle ? lerpCam(frame / Math.max(1, rideAt), { x: 0, y: 0, zoom: 1.2 }, { x: 0, y: 0, zoom: 1.3 }) : { x: x - 960 + (vertical ? 0 : 160), y: 40 + sink * 0.2, zoom: vertical ? 1.3 : 1.15 };
  const cam = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dusk} />
      <Layer d={0.02} cam={{ ...cam, x: 0 }}><Defs /><Glow x={1300} y={1150} r={600} /><circle cx={1300} cy={1170} r={90} fill="#ffd9a0" /></Layer>
      <Layer d={0.3} cam={cam}><Waves y={1250} color="#5a3a52" amp={6} speed={0.08} seed={1} /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <path d="M -1400 1400 L 700 1400 Q 820 1420 900 1480 L -1400 1480 Z" fill="#8a6a4a" />
        {battle ? new Array(12).fill(0).map((_, i) => <Fig key={i} x={-100 + i * 130} y={1420} s={0.7} outfit={i % 2 ? SOLDIER(i) : { ...ARAB(i), spear: true }} prop="spear" flip={i % 2 === 0} pose={walkPose(frame * 0.4 + i, 1.4)} />) : null}
        {battle ? <DustBurst x={600} y={1400} at={2} size={1.6} /> : null}
        <g opacity={gone}>
          <g transform={`translate(${x} ${1460 + sink})`}>
            <Horse2 phase={frame * 0.38} gallop={Math.max(0.2, 1 - sink / 300)} color="#2a1e1a" rider={<g transform="translate(0 70) scale(0.9)"><Fig x={0} y={0} outfit={OUT.dhuNuwas} pose={{ ...SIT, armRU: -60, armRL: -40, lean: 8 }} sway={frame * 0.4} /></g>} />
          </g>
        </g>
        <Waves y={1450} color="#3a2a40" amp={16} speed={0.1} seed={3} />
        <g opacity={0.5}><Waves y={1480} color="#e8d8c8" amp={4} speed={0.12} seed={5} /></g>
        <Waves y={1510} color="#2a2032" amp={24} speed={0.11} seed={7} />
      </Layer>
      <Grade color="#5a6a9a" opacity={0.18} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};

// 2d — Aryāṭ rules Yemen from his throne (years pass).
export const Throne2: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, { x: 0, y: vertical ? 0 : 120, zoom: 1.0 }, { x: 0, y: vertical ? -40 : 100, zoom: 1.2 });
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.palace} />
      <Layer d={0.3} cam={cam}>
        <rect x={-800} y={300} width={3600} height={1400} fill="#3a2414" />
        {new Array(8).fill(0).map((_, i) => <path key={i} d={`M ${-300 + i * 340} 1360 L ${-300 + i * 340} 760 Q ${-130 + i * 340} 560 ${40 + i * 340} 760 L ${40 + i * 340} 1360 Z`} fill="#24160c" />)}
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 520} 520 L ${240 + i * 520} 520 L ${240 + i * 520} 960 L ${180 + i * 520} 910 L ${120 + i * 520} 960 Z`} fill="#1f4f7a" />)}
      </Layer>
      <Layer d={0.6} cam={cam}>{[0, 1, 2, 3].map((i) => <Torch2 key={i} x={-60 + i * 680} y={960} seed={i * 2} />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill="#5a3a24" />
        <g transform="translate(960 1440)">
          <path d="M -100 -40 L -100 -360 Q 0 -430 100 -360 L 100 -40 Z" fill="#c9a24a" stroke="#1b100c" strokeWidth={5} />
          <path d="M -78 -50 L -78 -340 Q 0 -392 78 -340 L 78 -50 Z" fill="#1f4f7a" />
          <rect x={-200} y={-46} width={400} height={50} fill="#4a3020" stroke="#1b100c" strokeWidth={4} />
        </g>
        <Fig x={960} y={1390} s={0.95} sy={1.1} outfit={{ ...OUT.aryat, crown: true, wrap: undefined }} prop="spear" pose={{ ...SIT, armRU: -30, armRL: -70, head: Math.sin(frame * 0.03) * 2 }} />
        {[-1, 1].map((sd) => [0, 1].map((k) => <Fig key={`${sd}${k}`} x={960 + sd * (300 + k * 170)} y={1450} s={0.85} outfit={BLUE(k)} prop="spear" flip={sd > 0} />))}
      </Layer>
      <Grade color="#ffb050" opacity={0.15} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// 2e — the army splits: two hosts face each other; a rider carries Abraha's challenge. b = [rideAt]
export const Split: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const rideAt = at(b, 0, dur, 0.3);
  const rx = iv(frame, [rideAt, rideAt + 120], [520, 1400], ease);
  const cam = vertical
    ? { x: iv(frame, [0, rideAt, rideAt + 120, dur], [-480, -480, 480, 480], ease), y: 60, zoom: 1.3 }
    : lerpCam(p, { x: 0, y: 60, zoom: 1.0 }, { x: 0, y: 30, zoom: 1.08 });
  const host = (side: number, outfit: (i: number) => any, banner: string) => (
    <g>
      {new Array(24).fill(0).map((_, i) => {
        const row = Math.floor(i / 8);
        const x = side < 0 ? 0 + (i % 8) * 70 + row * 26 : 1340 + (i % 8) * 70 - row * 26;
        return <Fig key={i} x={x} y={1400 + row * 34} s={0.5 + row * 0.06} outfit={outfit(i)} prop="spear" flip={side > 0} pose={{ ...STAND, head: Math.sin(frame * 0.05 + i) * 2 }} />;
      })}
      {[0, 1, 2].map((i) => {
        const x = side < 0 ? 100 + i * 200 : 1420 + i * 200;
        return <g key={i}><line x1={x} y1={1400} x2={x} y2={1120} stroke="#3a2416" strokeWidth={6} /><path d={`M ${x} 1120 Q ${x + 60 * -side + Math.sin(frame * 0.2 + i) * 10} ${1136 + Math.sin(frame * 0.15 + i) * 6} ${x + 110 * -side} 1150 L ${x} 1186 Z`} fill={banner} stroke="#1b100c" strokeWidth={3} /></g>;
      })}
    </g>
  );
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.15} cam={cam}><path d={ridge("sp1", 1250, 200, 140)} fill="#a8a07a" /></Layer>
      <Layer d={0.4} cam={cam}><path d={ridge("sp2", 1320, 70, 180)} fill="#8a9a62" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1360} width={4800} height={1200} fill="#c9a46a" />
        {host(-1, SOLDIER, "#8f2a1c")}
        {host(1, BLUE, "#1f4f7a")}
        {frame > rideAt ? <g transform={`translate(${rx} 1480) scale(0.6)`}><Horse2 phase={frame * 0.4} rider={<g transform="scale(0.9) translate(0 70)"><Fig x={0} y={0} outfit={SOLDIER(2, false)} pose={SIT} /></g>} /></g> : null}
      </Layer>
      <Layer d={1.3} cam={cam}><Dust n={30} color="#f0dcae" y0={1200} y1={1600} drift={1} opacity={0.3} /></Layer>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// 2f — the duel. b = [aryatAt, abrahaAt, servantAt, raiseAt]; ends the instant the spear falls.
export const Duel2: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const [aA, aB, aS, aR] = [at(b, 0, dur, 0.05), at(b, 1, dur, 0.3), at(b, 2, dur, 0.45), at(b, 3, dur, 0.7)];
  const raise = iv(frame, [aR, aR + 30], [0, 1], ease);
  const sAt = at(b, 4, dur, 0.98);
  const strike = iv(frame, [sAt - 6, sAt], [0, 1], easeIn);
  const black = frame >= sAt + 2;
  const peek = iv(frame, [aS, aS + 20], [0, 1], ease);
  // shots: Aryāṭ low-angle, Abraha, the hidden servant, then both as the spear rises
  const shots: [number, Cam, Cam][] = vertical
    ? [[aA, aim(true, 1180, 1200, 1.7), aim(true, 1180, 1170, 1.85)], [aB, aim(true, 760, 1290, 1.8), aim(true, 760, 1280, 1.95)], [aS, aim(true, 620, 1270, 1.8), aim(true, 640, 1260, 1.95)], [aR, aim(true, 1000, 1230, 1.15), aim(true, 1040, 1180, 1.3)]]
    : [[aA, aim(false, 1180, 1220, 1.5), aim(false, 1180, 1190, 1.65)], [aB, aim(false, 760, 1300, 1.6), aim(false, 760, 1290, 1.75)], [aS, aim(false, 660, 1290, 1.6), aim(false, 680, 1280, 1.75)], [aR, aim(false, 970, 1260, 1.15), aim(false, 970, 1230, 1.3)]];
  let cam: Cam = { x: 0, y: 0, zoom: 1.0 };
  for (let i = 0; i < shots.length; i++) {
    const [st, c0, c1] = shots[i];
    const en = i + 1 < shots.length ? shots[i + 1][0] : dur;
    if (frame >= st) cam = lerpCam((frame - st) / Math.max(1, en - st), c0, c1);
  }
  const aryat: Pose = blend(blend({ ...STAND, armRU: -30, armRL: -20 }, { ...STAND, armRU: -178, armRL: -6, lean: -6 }, raise), { ...STAND, armRU: -70, armRL: -10, lean: 10 }, strike);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dusk} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={960} y={1150} r={700} /><circle cx={960} cy={1180} r={120} fill="#ffe2a8" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("du2", 1230, 200, 150)} fill="#6a3a4a" /></Layer>
      <Layer d={0.4} cam={cam}>
        <rect x={-1400} y={1330} width={4800} height={1200} fill="#8a5a46" />
        {new Array(30).fill(0).map((_, i) => <Fig key={i} x={i < 15 ? -300 + i * 50 : 1700 + (i - 15) * 50} y={1340} s={0.36} outfit={i < 15 ? SOLDIER(i) : BLUE(i)} prop="spear" flip={i >= 15} />)}
      </Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#a8724e" />
        <Fig x={640 - peek * 70} y={1460} s={1.0} outfit={OUT.servant} pose={blend({ ...STAND, lean: 10, head: 10 }, { ...STAND, lean: -8, head: -8, armRU: -60 }, peek)} />
        <Fig x={760} y={1460} s={1.05} sx={1.22} sy={0.84} outfit={OUT.abraha} pose={{ ...STAND, armRU: -30, armRL: -50, head: -4 }} />
        <Fig x={1180} y={1460} s={1.05} sy={1.16} outfit={OUT.aryat} prop="spear" flip pose={aryat} sway={frame * 0.15} />
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={40} color="#f6dcae" y0={1100} y1={1700} drift={1.6} opacity={0.35} /></Layer>
      <Grade color="#ff8040" opacity={0.15 + raise * 0.12} />
      <Vignette s={0.6 + raise * 0.2} />
      {black ? <AbsoluteFill style={{ backgroundColor: "#000" }} /> : null}
    </AbsoluteFill>
  );
};

export const P2_SCENES = { Landing, AbrahaSpot, SeaRide2, Throne2, Split, Duel2 };
