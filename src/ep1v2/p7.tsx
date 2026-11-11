import React from "react";
import { AbsoluteFill, random } from "remotion";
import { STAND, walkPose } from "../cartoon/Rig";
import { OUT, SOLDIER, ARAB } from "../ep1/kit";
import { serif, display, amiri } from "../fonts";
import {
  Cam, Layer, Defs, Sky, SKIES, iv, ease, easeIn, useShot, useView, lerpCam, aim, shakeAt, ridge, Dust, DustBurst, Grade, Vignette, Glow, Stars,
  Fig, Elephant2, Kaaba2,
  Mahout,
  seatY, SITG,
} from "./kit2";

// Part 7 — "The Birds": the whisper, the refusals, the birds, the rout, Abraha's end, the year of the birth, the end of al-Qullays.
const at = (b: number[] | undefined, i: number, dur: number, frac: number) => (b && b[i] !== undefined ? b[i] : Math.round(dur * frac));
const DRIVER = <Mahout />;

// 7a — morning: the army lined up; Nufayl walks to the elephant, takes its ear and whispers; it kneels; he runs. b = [whisperAt, kneelAt, runAt]
export const Whisper2: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const [wA, kA, rA] = [at(b, 0, dur, 0.35), at(b, 1, dur, 0.68), at(b, 2, dur, 0.82)];
  const walkIn = iv(frame, [0, Math.max(20, wA - 24)], [0, 1]);
  const k = iv(frame, [kA - 4, kA + 10], [0, 1], easeIn);
  const run = iv(frame, [rA, dur], [0, 1]);
  const sh = shakeAt(frame, [kA + 10], 24);
  const c0: Cam = frame < wA
    ? lerpCam(walkIn, aim(vertical, 960, 1200, 1.0), aim(vertical, 700, 1200, 1.35))
    : frame < kA
      ? lerpCam((frame - wA) / Math.max(1, kA - wA), aim(vertical, 690, 1160, 2.0), aim(vertical, 690, 1150, 2.2))
      : lerpCam((frame - kA) / Math.max(1, dur - kA), aim(vertical, 860, 1250, 1.25), aim(vertical, 860, 1250, 1.1));
  const cam = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
  const nx = run > 0 ? 610 - run * 1100 : 100 + walkIn * 510;
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dawn} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={1500} y={1150} r={600} /><circle cx={1500} cy={1170} r={100} fill="#fff1d0" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("w2", 1240, 220, 140)} fill="#6a5070" /></Layer>
      <Layer d={0.45} cam={cam}><rect x={-1400} y={1330} width={4800} height={1200} fill="#8a6a6a" />{new Array(34).fill(0).map((_, i) => <Fig key={i} x={1000 + i * 44} y={1340 + (i % 3) * 12} s={0.34} outfit={SOLDIER(i)} prop="spear" flip />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#a8846a" />
        <g transform="translate(980 1460) scale(0.95)"><Elephant2 walk={frame * 0.03} gait={0} kneel={k} ear={(Math.sin(frame * 0.06) + 1) / 2} driver={DRIVER} /></g>
        <DustBurst x={760} y={1450} at={kA + 8} size={1.3} />
        <Fig x={nx} y={1465} s={0.85} outfit={OUT.guide} flip={run > 0} pose={run > 0 ? walkPose(frame * 0.45, 1.5) : walkIn < 1 ? walkPose(frame * 0.2) : { ...STAND, armRU: -125, armRL: -40, head: 10, lean: 6 }} sway={frame * 0.3} />
        {[0, 1, 2].map((i) => <Fig key={i} x={1300 + i * 130} y={1465} s={0.85} outfit={SOLDIER(i)} prop="spear" flip />)}
      </Layer>
      <Grade color="#ffb070" opacity={0.15} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// 7b — the refusals: beaten, it stays down; turned toward Yemen, Syria, the east it runs; toward Makkah it kneels.
// b = [yemenAt, syriaAt, eastAt, makkahAt]
const DIRS = ["YEMEN", "SYRIA", "EAST", "MAKKAH"];
export const Refusals: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const marks = [at(b, 0, dur, 0.35), at(b, 1, dur, 0.5), at(b, 2, dur, 0.65), at(b, 3, dur, 0.82)];
  let d = -1;
  marks.forEach((m, i) => { if (frame >= m) d = i; });
  const since = d >= 0 ? frame - marks[d] : frame;
  const runs = d >= 0 && d < 3;
  const k = d === 3 ? iv(since, [6, 20], [0, 1], easeIn) : d >= 0 ? iv(since, [0, 14], [1, 0], ease) : 1;
  const ex = runs ? since * 3.2 : 0;
  const hits = d < 0 ? new Array(10).fill(0).map((_, i) => 6 + i * 14).filter((h) => h < marks[0]) : [];
  const sh = shakeAt(frame, d === 3 ? [marks[3] + 20] : hits, d === 3 ? 24 : 8);
  const c0: Cam = d < 0 ? aim(vertical, 760, 1250, vertical ? 1.5 : 1.4) : aim(vertical, 960 + ex * 0.5, 1260, vertical ? 1.15 : 1.1);
  const cam = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
  const swing = (i: number) => { const t = ((frame + i * 7) % 14) / 14; return t < 0.6 ? -170 * (t / 0.6) : -170 + (t - 0.6) * 380; };
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dawn} />
      <Layer d={0.15} cam={cam}><path d={ridge("rf2", 1240, 220, 140)} fill="#5a3a52" /></Layer>
      <Layer d={0.45} cam={cam}><rect x={-1400} y={1330} width={4800} height={1200} fill="#8a5a4a" />{new Array(36).fill(0).map((_, i) => <Fig key={i} x={-300 + i * 80} y={1340 + (i % 2) * 12} s={0.36} outfit={SOLDIER(i)} prop="spear" />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#a87a56" />
        <g transform={`translate(${960 + ex} 1460) scale(${runs ? -0.95 : 0.95} 0.95)`}><Elephant2 walk={runs ? frame * 0.3 : 0} gait={runs ? 1.2 : 0} kneel={k} ear={(Math.sin(frame * 0.2) + 1) / 2} trunk={d < 0 ? Math.abs(Math.sin(frame * 0.4)) : 0} driver={DRIVER} /></g>
        {d < 0 ? [0, 1].map((i) => <Fig key={i} x={[420, 560][i]} y={1460} s={1.0} outfit={SOLDIER(i + 2, false)} prop={i ? "hook" : "axe"} pose={{ ...STAND, armRU: Math.max(-175, Math.min(-10, swing(i))), armRL: -10, lean: 6 }} />) : null}
        {d === 3 ? <DustBurst x={760} y={1450} at={marks[3] + 18} size={1.4} /> : null}
      </Layer>
      {d >= 0 ? <div style={{ position: "absolute", top: vertical ? "16%" : "10%", width: "100%", textAlign: "center", fontFamily: display, fontWeight: 700, fontSize: vertical ? 96 : 76, letterSpacing: 14, color: d === 3 ? "#ffd27a" : "#fff4e0", textShadow: "0 4px 24px rgba(0,0,0,0.7)", opacity: iv(since, [0, 6], [0, 1]) }}>{d === 3 ? `← ${DIRS[d]}` : `${DIRS[d]} →`}</div> : null}
      <Grade color="#ff9a5a" opacity={0.18} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// 7c — birds from the sea, each with three stones; the stones fall. b = [stonesAt]
const BirdS: React.FC<{ x: number; y: number; s: number; flap: number; color?: string }> = ({ x, y, s, flap, color = "#141018" }) => {
  const w = Math.sin(flap);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -4 0 Q -28 ${-20 * w} -54 ${-6 - 24 * w} Q -32 ${2 - 6 * w} -6 6 Z`} fill={color} />
      <path d={`M 4 0 Q 28 ${-20 * w} 54 ${-6 - 24 * w} Q 32 ${2 - 6 * w} 6 6 Z`} fill={color} />
      <ellipse cx={0} cy={2} rx={10} ry={7} fill={color} />
      <path d="M -3 6 L -10 24 L 0 15 L 10 24 L 3 6 Z" fill={color} />
      <circle cx={-12} cy={-1} r={3} fill="#cbb89a" /><circle cx={-5} cy={13} r={3} fill="#cbb89a" /><circle cx={5} cy={13} r={3} fill="#cbb89a" />
    </g>
  );
};
export const Birds2: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const stonesAt = at(b, 0, dur, 0.5);
  const arrive = iv(frame, [0, stonesAt], [0, 1]);
  const dark = iv(p, [0, 0.4], [0, 1]);
  const cam = lerpCam(p, aim(vertical, vertical ? 1250 : 1100, 900, 1.15), aim(vertical, 960, 1150, 1.0));
  const birds = new Array(170).fill(0).map((_, i) => {
    const lane = random(`bl${i}`);
    const delay = random(`bd${i}`) * 0.6;
    const t = Math.max(0, arrive - delay) / (1 - delay);
    const x = 2600 - t * (1300 + lane * 1000) + Math.sin(frame * 0.05 + i) * 24 - (frame > stonesAt ? (frame - stonesAt) * (0.4 + lane) : 0);
    return { x, y: 500 + lane * 650 + Math.sin(frame * 0.08 + i * 2) * 16, s: 0.5 + lane * 0.8, f: frame * 0.9 + i };
  });
  const stones = frame > stonesAt ? new Array(160).fill(0).map((_, i) => { const life = 28; const age = (frame - stonesAt + i * 3) % life; const x = 200 + random(`sx${i}`) * 1600; return { x: x - age * 4, y: 900 + age * 22 }; }) : [];
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <AbsoluteFill style={{ background: "linear-gradient(#140c12, #3a2420 60%, #6a3a24)", opacity: 0.85 * dark }} />
      <Layer d={0.15} cam={cam}><path d={ridge("bd", 1240, 240, 130)} fill={`rgb(${110 - dark * 60},${80 - dark * 40},${64 - dark * 30})`} /></Layer>
      <Layer d={0.35} cam={cam}>{birds.filter((_, i) => i % 2).map((q, i) => <BirdS key={i} x={q.x} y={q.y} s={q.s * 0.6} flap={q.f} />)}</Layer>
      <Layer d={0.6} cam={cam}>
        <rect x={-1400} y={1360} width={4800} height={1200} fill="#7a5a40" />
        {new Array(40).fill(0).map((_, i) => {
          const run = frame > stonesAt ? iv(frame, [stonesAt + i * 2, stonesAt + i * 2 + 20], [0, 1]) : 0;
          const x = 100 + (i % 20) * 90 - run * (frame - stonesAt) * 2.5;
          return <Fig key={i} x={x} y={1370 + Math.floor(i / 20) * 40} s={0.38} outfit={SOLDIER(i)} prop="spear" flip={run === 0} pose={run > 0 ? walkPose(frame * 0.4 + i, 1.4) : { ...STAND, head: -14 }} />;
        })}
      </Layer>
      <Layer d={0.8} cam={cam}>{stones.map((s, i) => <line key={i} x1={s.x} y1={s.y} x2={s.x + 10} y2={s.y - 44} stroke="#efe0c0" strokeWidth={4} opacity={0.85} />)}</Layer>
      <Layer d={1.1} cam={cam}>{birds.filter((_, i) => i % 2 === 0).map((q, i) => <BirdS key={i} x={q.x} y={q.y} s={q.s} flap={q.f} color="#0e0b10" />)}</Layer>
      <Grade color="#6a2a1a" opacity={0.2 * dark} mode="multiply" />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};

// 7d — the rout down the road, birds overhead; abandoned spears at a well. b = [wellAt]
export const Rout: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const wellAt = at(b, 0, dur, 0.55);
  const cam = lerpCam(p, aim(vertical, 1000, 1250, 1.1), aim(vertical, 920, 1300, 1.25));
  const atWell = frame >= wellAt;
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dusk} />
      <Layer d={0.05} cam={cam}>{new Array(46).fill(0).map((_, i) => <BirdS key={i} x={((random(`fb${i}`) * 2600 - frame * 3) % 2600 + 2600) % 2600 - 300} y={500 + random(`fy${i}`) * 400} s={0.45} flap={frame + i} />)}</Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("ro", 1200, 320, 130)} fill="#3a2028" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <path d="M -1400 1450 Q 600 1410 3400 1470 L 3400 2600 L -1400 2600 Z" fill="#6a4030" />
        {atWell ? (
          <g>
            <ellipse cx={960} cy={1470} rx={110} ry={30} fill="#3a2a22" stroke="#1b100c" strokeWidth={5} />
            <ellipse cx={960} cy={1462} rx={80} ry={18} fill="#1a1414" />
            {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={760 + i * 90} y1={1500 + (i % 2) * 14} x2={860 + i * 90} y2={1470 + (i % 2) * 14} stroke="#5a3a22" strokeWidth={6} />)}
            {[0, 1].map((i) => <ellipse key={i} cx={[700, 1240][i]} cy={1495} rx={28} ry={34} fill="#7a4a26" stroke="#1b100c" strokeWidth={3} />)}
          </g>
        ) : new Array(16).fill(0).map((_, i) => {
          const x = 2000 - ((frame * 4 + i * 170) % 2700);
          return <Fig key={i} x={x} y={1470 + (i % 2) * 40} s={0.72} outfit={SOLDIER(i, false)} flip pose={{ ...walkPose(frame * 0.45 + i, 1.5), armRU: -150, armRL: -40 }} />;
        })}
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={60} y0={1100} y1={1700} drift={-4} opacity={0.4} size={6} /></Layer>
      <Grade color="#ff5020" opacity={0.15} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};

// 7e — Abraha carried home on a litter at dusk; Ṣanʿāʾ on the horizon.
export const Litter2: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const x = 600 + frame * 1.2;
  const cam: Cam = aim(vertical, x + iv(p, [0, 1], [-60, 60]), 1300, vertical ? 1.35 : 1.25);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dusk} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={1400} y={1150} r={600} /><circle cx={1400} cy={1180} r={110} fill="#ffd9a0" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("lt", 1260, 160, 140, -1400, 5000)} fill="#5a2a40" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <path d={ridge("lg", 1470, 20, 500, -1400, 6000)} fill="#3a1a28" />
        {[0, 1, 2, 3].map((i) => <Fig key={i} x={x + [-130, -50, 130, 210][i]} y={1490 + (i % 2) * 10} s={0.8} outfit={SOLDIER(i, false)} pose={{ ...walkPose(frame * 0.12 + i, 0.5), armRU: -172, armRL: 0, armLU: -172, armLL: 0 }} />)}
        <rect x={x - 190} y={1300} width={440} height={20} fill="#5a3a22" stroke="#1b100c" strokeWidth={3} />
        <path d={`M ${x - 150} 1300 L ${x + 210} 1300 L ${x + 210} 1268 L ${x - 150} 1268 Z`} fill="#8f2a1c" stroke="#1b100c" strokeWidth={3} />
        <g transform={`translate(${x + 215} 1236) rotate(-90)`}><Fig x={0} y={0} s={0.82} sx={0.86} sy={1.2} outfit={OUT.abrahaKing} pose={{ ...STAND, armRU: -10, armLU: 10 }} /></g>
      </Layer>
      <Grade color="#ff5a3a" opacity={0.15} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};

// 7f — years later in Makkah: the elephant's driver and keeper, blind and crippled, begging.
export const Beggars2: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, aim(vertical, 980, 1300, 1.3), aim(vertical, 980, 1330, 1.55));
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.15} cam={cam}><path d={ridge("bg2", 1180, 280, 130)} fill="#8a6a52" /></Layer>
      <Layer d={0.5} cam={cam}>{new Array(18).fill(0).map((_, i) => <rect key={i} x={-300 + i * 150} y={1440 - 160 - (i % 3) * 40} width={130} height={160 + (i % 3) * 40} fill={["#c9a47a", "#b8936a", "#d4b48a"][i % 3]} stroke="#1b100c" strokeWidth={3} />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1460} width={4800} height={1200} fill="#c4a87a" />
        {[0, 1].map((i) => (
          <g key={i}>
            <Fig seat="ground" x={820 + i * 320} y={seatY(1480, 0.85, 1, true)} s={0.85} outfit={{ ...ARAB(i + 4), robe: "#7a6a55", robeShade: "#5a4a3a" }} pose={{ ...SITG, armRU: -60, armRL: -20, head: 14 + Math.sin(frame * 0.03 + i) * 3 }} />
            <line x1={760 + i * 320} y1={1480} x2={780 + i * 320} y2={1330} stroke="#5a3a22" strokeWidth={6} />
            <ellipse cx={900 + i * 320} cy={1475} rx={26} ry={9} fill="#6a4a2a" stroke="#1b100c" strokeWidth={2} />
          </g>
        ))}
        {new Array(3).fill(0).map((_, i) => <Fig key={i} x={((frame * 1.2 + i * 700) % 2400) - 200} y={1500} s={0.8} outfit={ARAB(i)} pose={walkPose(frame * 0.2 + i)} />)}
      </Layer>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// 7g — the year of the birth: night over Makkah gives way to dawn (no depiction). Then the House in light. mode "dawn" | "house"
export const Light: React.FC<{ mode?: "dawn" | "house" }> = ({ mode = "dawn" }) => {
  const { p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, aim(vertical, 960, 1250, 1.0), aim(vertical, 960, mode === "house" ? 1300 : 1150, mode === "house" ? 1.3 : 1.15));
  const dawn = mode === "house" ? 1 : iv(p, [0.15, 0.9], [0, 1], ease);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.night} />
      <AbsoluteFill style={{ opacity: dawn }}><Sky stops={SKIES.dawn} /></AbsoluteFill>
      <Layer d={0.02} cam={cam}><Defs /><g opacity={1 - dawn}><Stars n={180} /></g><Glow x={960} y={1250 - dawn * 150} r={700} o={dawn} /><circle cx={960} cy={1270 - dawn * 150} r={90} fill="#fff3d6" opacity={dawn} /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("lg1", 1250, 280, 130)} fill="#3a2a4a" /></Layer>
      <Layer d={0.4} cam={cam}>{new Array(22).fill(0).map((_, i) => <rect key={i} x={-300 + i * 120} y={1390 - 100 - (i % 3) * 30} width={100} height={100 + (i % 3) * 30} fill={["#8a6a7a", "#7a5a6a", "#9a7a8a"][i % 3]} stroke="#1b100c" strokeWidth={3} />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <ellipse cx={960} cy={1490} rx={900} ry={130} fill="#d8c8b8" />
        <rect x={-1400} y={1490} width={4800} height={1200} fill="#bfae9a" />
        <Kaaba2 x={880} y={1480} s={mode === "house" ? 2.4 : 1.7} />
        {mode === "house" ? <Glow x={940} y={1300} r={500} o={0.35} /> : null}
      </Layer>
      <Layer d={1.3} cam={cam}><Dust n={30} color="#fff3d6" y0={800} y1={1600} drift={0.3} opacity={0.4 * dawn} /></Layer>
      <Grade color="#ffc070" opacity={0.15 * dawn} />
      <Vignette s={0.55} />
    </AbsoluteFill>
  );
};

// 7h — al-Qullays torn down stone by stone; then the Kaʿbah, still standing. b = [standAt]
export const Torn: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const standAt = at(b, 0, dur, 0.62);
  if (frame >= standAt) {
    const t = (frame - standAt) / Math.max(1, dur - standAt);
    const cam = lerpCam(t, aim(vertical, 960, 1350, 1.1), aim(vertical, 940, 1330, 1.35));
    return (
      <AbsoluteFill>
        <Sky stops={SKIES.dusk} />
        <Layer d={0.02} cam={cam}><Defs /><Glow x={960} y={1100} r={800} /><circle cx={960} cy={1120} r={120} fill="#ffe2a8" /></Layer>
        <Layer d={0.15} cam={cam}><path d={ridge("ks2", 1240, 280, 130)} fill="#5d2c4c" /></Layer>
        <Layer d={0.4} cam={cam}>{new Array(22).fill(0).map((_, i) => <rect key={i} x={-300 + i * 120} y={1390 - 100 - (i % 3) * 30} width={100} height={100 + (i % 3) * 30} fill={["#a87a6a", "#9a6a5a", "#b88a7a"][i % 3]} stroke="#1b100c" strokeWidth={3} />)}</Layer>
        <Layer d={1} cam={cam}>
          <Defs />
          <ellipse cx={960} cy={1490} rx={900} ry={130} fill="#c9a88a" />
          <rect x={-1400} y={1490} width={4800} height={1200} fill="#a8866a" />
          <Kaaba2 x={880} y={1480} s={2.4} />
        </Layer>
        <Grade color="#ff9a50" opacity={0.15} />
        <Vignette s={0.55} />
      </AbsoluteFill>
    );
  }
  const t = frame / Math.max(1, standAt);
  const cam = lerpCam(t, aim(vertical, 960, 1000, 1.0), aim(vertical, 960, 1300, 1.15));
  const gone = iv(t, [0.05, 0.95], [0, 1]);
  const blocks: { x: number; y: number }[] = [];
  for (let r = 0; r < 18; r++) for (let c = 0; c < 6; c++) blocks.push({ x: 830 + c * 44, y: 1440 - r * 52 });
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.15} cam={cam}><path d={ridge("tn", 1300, 160, 140)} fill="#9a9a7a" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#bfa070" />
        <rect x={620} y={1080 + gone * 360} width={680} height={Math.max(0, 360 - gone * 360)} fill="#d8d0bc" stroke="#1b100c" strokeWidth={4} />
        {blocks.map((q, i) => ((blocks.length - i) / blocks.length < gone ? null : <rect key={i} x={q.x} y={q.y - 52} width={42} height={50} fill={i % 2 ? "#cfc6b0" : "#c4bba4"} stroke="#1b100c" strokeWidth={2} />))}
        {new Array(26).fill(0).map((_, i) => <rect key={i} x={260 + random(`rb${i}`) * 320} y={1420 - (i % 4) * 32} width={42} height={30} fill="#c4bba4" stroke="#1b100c" strokeWidth={2} opacity={Math.min(1, gone * 3)} />)}
        {[0, 1, 2, 3].map((i) => <Fig key={i} x={700 + i * 170} y={1470} s={0.62} outfit={ARAB(i)} prop="axe" pose={{ ...STAND, armRU: -100 + Math.sin(frame * 0.3 + i) * 50, armRL: -40, lean: 8 }} />)}
      </Layer>
      <Layer d={1.3} cam={cam}><Dust n={40} color="#f0e6d0" y0={900} y1={1600} drift={0.8} opacity={0.35} /></Layer>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

// End card — sources (al-Bidāya, ed. al-Turkī, vol. 3). Page numbers at the end, per the series.
const PAGES: [string, string][] = [
  ["The trench at Najrān and the escape", "133–135"],
  ["Dhū Nuwās and the sea; Aryāṭ", "135–136"],
  ["The duel and the split face", "137"],
  ["The Negus's oath and the soil", "138"],
  ["al-Qullays and the man from Kināna", "140–141"],
  ["The road: Dhū Nafar, Nufayl, al-Ṭāʾif", "141–142"],
  ["Abū Righāl, the camels, the envoy", "142–144"],
  ["The lord of the camels", "144–145"],
  ["The night at the Kaʿbah", "145–146"],
  ["The elephant kneels; the birds", "146–148"],
  ["The driver and keeper; the year of the birth", "152–153"],
  ["The end of al-Qullays", "140, 157"],
];
export const EndCard2: React.FC = () => {
  const { frame } = useShot();
  const { vertical } = useView();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #f3e6c6 0%, #e2cfa2 70%, #c9b07e 100%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: vertical ? 940 : 1200, color: "#3a2414", opacity: iv(frame, [0, 15], [0, 1]) }}>
        <div style={{ fontFamily: serif, fontSize: vertical ? 30 : 26, letterSpacing: 8, textAlign: "center", color: "#7a5a3a" }}>THE STORY IS FROM</div>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: vertical ? 64 : 70, textAlign: "center", lineHeight: 1.1 }}>al-Bidāya wa al-Nihāya</div>
        <div style={{ fontFamily: serif, fontSize: vertical ? 34 : 32, textAlign: "center", fontStyle: "italic", color: "#5a3a20", marginBottom: 24 }}>Ibn Kathīr · ed. al-Turkī · volume 3</div>
        {PAGES.map(([t, pg], i) => (
          <div key={i} style={{ display: "flex", fontFamily: `"${serif}", "${amiri}"`, fontSize: vertical ? 32 : 30, lineHeight: 1.5, opacity: iv(frame, [8 + i * 3, 18 + i * 3], [0, 1]) }}>
            <span>{t}</span><span style={{ flex: 1, borderBottom: "2px dotted #a8845a", margin: "0 12px 12px" }} /><span>p. {pg}</span>
          </div>
        ))}
        <div style={{ fontFamily: serif, fontSize: vertical ? 24 : 22, textAlign: "center", color: "#7a5a3a", marginTop: 22 }}>Qurʾān translation: Hilali &amp; Muhsin Khan (Tanzil.net) · recitation by the channel · sound effects CC0</div>
      </div>
    </AbsoluteFill>
  );
};

export const P7_SCENES = { Whisper2, Refusals, Birds2, Rout, Litter2, Beggars2, Light, Torn, EndCard2 };
