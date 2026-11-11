import React from "react";
import { AbsoluteFill, random } from "remotion";
import { STAND, SIT, walkPose, blend, Pose } from "../cartoon/Rig";
import { OUT, SOLDIER, ARAB } from "../ep1/kit";
import {
  Cam, Layer, Defs, Sky, SKIES, iv, ease, useShot, useView, lerpCam, aim, shakeAt, ridge, Dust, DustBurst, Grade, Vignette, Glow,
  Fig, Elephant2, Horse2, Kaaba2,
} from "./kit2";

// Part 5 — "The Road to Makkah": the Arabs rise, Dhū Nafar, Nufayl, al-Ṭāʾif, Abū Righāl, the camels, Makkah alone.
const at = (b: number[] | undefined, i: number, dur: number, frac: number) => (b && b[i] !== undefined ? b[i] : Math.round(dur * frac));
const DRIVER = <g transform="scale(0.55)"><Fig x={0} y={0} outfit={SOLDIER(1, false)} pose={SIT} flip /></g>;
const camel = (x: number, y: number, s: number, ph: number, flip: boolean, color = "#8a6440") => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={4} rx={110} ry={11} fill="#000" opacity={0.18} />
    {[-55, 55, -40, 70].map((lx, i) => <g key={i} transform={`translate(${lx} -150) rotate(${Math.sin(ph + i * 1.6) * 20})`}><rect x={-9} y={0} width={18} height={150} rx={8} fill={i < 2 ? "#6a4a2a" : color} stroke="#1b100c" strokeWidth={4} /></g>)}
    <path d="M -100 -160 Q -110 -200 -60 -215 Q -30 -280 10 -230 Q 40 -270 80 -215 Q 110 -200 105 -160 Q 0 -140 -100 -160 Z" fill={color} stroke="#1b100c" strokeWidth={5} />
    <path d="M 90 -190 Q 130 -200 140 -260 Q 150 -300 185 -290 Q 200 -280 190 -268 Q 165 -268 160 -230 Q 150 -175 100 -160 Z" fill={color} stroke="#1b100c" strokeWidth={5} />
  </g>
);

// 5a — the Arab tribes rise: spears lifted against the sky. Then Dhū Nafar's charge is crushed. b = [clashAt, lostAt]
export const TribesFight: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const clashAt = at(b, 0, dur, 0.45);
  const lostAt = at(b, 1, dur, 0.75);
  const charge = iv(frame, [clashAt - 50, clashAt], [0, 1]);
  const cloud = iv(frame, [clashAt - 6, clashAt + 16, lostAt, lostAt + 30], [0, 1, 1, 0.2]);
  const lost = iv(frame, [lostAt, lostAt + 30], [0, 1]);
  const sh = shakeAt(frame, [clashAt], 22);
  const c0 = frame < clashAt - 50 ? lerpCam(frame / Math.max(1, clashAt - 50), aim(vertical, 1250, 1250, 1.4), aim(vertical, 1250, 1230, 1.5)) : lerpCam(p, aim(vertical, 960, 1300, 1.0), aim(vertical, 1000, 1300, 1.15));
  const cam = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.15} cam={cam}><path d={ridge("tf", 1260, 220, 140)} fill="#b8865a" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1400} width={4800} height={1200} fill="#c99a62" />
        {new Array(14).fill(0).map((_, i) => <Fig key={`a${i}`} x={200 + (i % 7) * 90 + charge * 240} y={1430 + Math.floor(i / 7) * 50} s={0.62} outfit={SOLDIER(i)} prop="spear" pose={walkPose(frame * 0.3 + i, charge < 1 ? 1 : 0)} />)}
        {new Array(14).fill(0).map((_, i) => {
          const down = lost > i / 14;
          const x = 1720 - (i % 7) * 90 - charge * 240 + lost * 300;
          return <Fig key={`b${i}`} x={x} y={1430 + Math.floor(i / 7) * 50} s={0.62} outfit={{ ...ARAB(i) }} prop="spear" flip={!down} pose={down ? { ...walkPose(frame * 0.4 + i), lean: -10 } : frame < clashAt - 50 ? { ...STAND, armRU: -170, armRL: -5 } : walkPose(frame * 0.3 + i, 1)} />;
        })}
        <g opacity={cloud}>{new Array(26).fill(0).map((_, i) => <circle key={i} cx={760 + random(`tc${i}`) * 520 + Math.sin(frame * 0.1 + i) * 20} cy={1330 + random(`td${i}`) * 180} r={70 + random(`te${i}`) * 90} fill="#e6c899" opacity={0.75} />)}</g>
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={60} y0={1100} y1={1700} drift={2.4} opacity={0.4} size={6} /></Layer>
      <Grade color="#ff8030" opacity={0.14} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// 5b — a captured chief kneels before Abraha and pleads; Abraha spares him. green = the hills of Khathʿam. b = [pleadAt, spareAt]
export const Plead: React.FC<{ b?: number[]; green?: boolean; chained?: boolean }> = ({ b, green, chained = true }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const pleadAt = at(b, 0, dur, 0.2);
  const spareAt = at(b, 1, dur, 0.65);
  const plead = iv(frame, [pleadAt, pleadAt + 15], [0, 1], ease);
  const spare = iv(frame, [spareAt, spareAt + 15], [0, 1], ease);
  const cam = frame < spareAt ? lerpCam(frame / Math.max(1, spareAt), aim(vertical, 1180, 1330, 1.6), aim(vertical, 1180, 1320, 1.8)) : lerpCam((frame - spareAt) / Math.max(1, dur - spareAt), aim(vertical, 720, 1260, 1.6), aim(vertical, 760, 1250, 1.75));
  const kneel: Pose = { ...STAND, legLU: -60, legLL: 100, legRU: -70, legRL: 110, bob: 70, lean: -6 - plead * 6, armRU: -60 - plead * 50, armRL: -40, armLU: -50 - plead * 40, armLL: -40, head: -10 };
  return (
    <AbsoluteFill>
      <Sky stops={green ? SKIES.day : SKIES.dusk} />
      <Layer d={0.15} cam={cam}><path d={ridge(green ? "pg" : "pd", 1260, 220, 150)} fill={green ? "#6f8a52" : "#6a3a4a"} /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill={green ? "#8a9a5a" : "#a8724e"} />
        <Fig x={720} y={1460} s={1} sx={1.2} sy={0.84} outfit={OUT.abrahaKing} pose={blend({ ...STAND, armRU: -20, armRL: -60 }, { ...STAND, armRU: -95, armRL: -10, head: -4 }, spare)} />
        <Fig x={1180} y={1460} s={1} outfit={OUT.prisoner} flip pose={kneel} />
        {chained ? <path d={`M 1150 ${1380 - plead * 30} q -24 34 0 56 q 24 24 -12 46`} stroke="#9a9aa4" strokeWidth={7} fill="none" /> : null}
        {[0, 1].map((i) => <Fig key={i} x={1420 + i * 150} y={1460} s={0.95} outfit={SOLDIER(i)} prop="spear" flip />)}
      </Layer>
      <Grade color={green ? "#a0ff70" : "#ff8040"} opacity={0.08} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// 5c — a guide walks at the head of the army, the elephant behind him. guide = "nufayl" | "abuRighal"
export const Guide: React.FC<{ guide?: "nufayl" | "abuRighal" }> = ({ guide = "nufayl" }) => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const lead = 1500 - frame * 2.0;
  const cam: Cam = { x: (lead + (vertical ? 260 : 520) - 960) * (vertical ? 1.0 : 1.0), y: 0, zoom: iv(p, [0, 1], [1.0, 1.1]) };
  const day = guide === "nufayl";
  return (
    <AbsoluteFill>
      <Sky stops={day ? SKIES.day : SKIES.dusk} />
      <Layer d={0.15} cam={cam}><path d={ridge("gd1" + guide, 1250, 240, 150, -3000, 6000)} fill={day ? "#7f8a5a" : "#6a3046"} /></Layer>
      <Layer d={0.4} cam={cam}><path d={ridge("gd2" + guide, 1340, 80, 220, -3000, 6000)} fill={day ? "#a8a06a" : "#4a2238"} /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-3000} y={1440} width={9000} height={1200} fill={day ? "#c9a46a" : "#a8644a"} />
        <Fig x={lead} y={1460} s={0.85} outfit={day ? OUT.guide : ARAB(3)} flip pose={{ ...walkPose(frame * 0.22), armRU: -100, armRL: -10 }} sway={frame * 0.22} />
        <g transform={`translate(${lead + 560} 1460) scale(0.85)`}><Elephant2 walk={frame * 0.12} gait={0.8} ear={(Math.sin(frame * 0.07) + 1) / 2} driver={DRIVER} /></g>
        {new Array(10).fill(0).map((_, i) => <Fig key={i} x={lead + 900 + i * 130} y={1460 + (i % 2) * 30} s={0.78} outfit={SOLDIER(i)} prop="spear" flip pose={walkPose(frame * 0.2 + i)} />)}
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={30} y0={1200} y1={1700} drift={1.5} opacity={0.3} /></Layer>
      <Grade color={day ? "#ffd080" : "#ff7040"} opacity={0.12} />
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

// 5d — al-Ṭāʾif: the men of Thaqīf come out and bow, beside their shrine. b = [bowAt, shrineAt]
export const Thaqif: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const bowAt = at(b, 0, dur, 0.15);
  const shrineAt = at(b, 1, dur, 0.6);
  const bow = iv(frame, [bowAt, bowAt + 20], [0, 1], ease);
  const cam = frame < shrineAt ? lerpCam(frame / Math.max(1, shrineAt), aim(vertical, 900, 1250, 1.1), aim(vertical, vertical ? 1180 : 1000, 1270, 1.3)) : lerpCam((frame - shrineAt) / Math.max(1, dur - shrineAt), aim(vertical, 1440, 1240, 1.4), aim(vertical, 1440, 1220, 1.55));
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.15} cam={cam}><path d={ridge("th1", 1150, 320, 150)} fill="#6f8a5a" /></Layer>
      <Layer d={0.4} cam={cam}><path d={ridge("th2", 1330, 120, 160)} fill="#5a7a46" />{new Array(22).fill(0).map((_, i) => <circle key={i} cx={-200 + i * 120 + random(`tt${i}`) * 50} cy={1310 + random(`tu${i}`) * 50} r={28 + random(`tv${i}`) * 14} fill="#3f6a3a" />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#a8a86a" />
        <g transform="translate(1440 1460)"><rect x={-130} y={-220} width={260} height={220} fill="#d8ccb2" stroke="#1b100c" strokeWidth={5} /><path d="M -150 -220 L 0 -296 L 150 -220 Z" fill="#b8a888" stroke="#1b100c" strokeWidth={5} /><rect x={-32} y={-120} width={64} height={120} fill="#3a2e22" /></g>
        {new Array(5).fill(0).map((_, i) => <Fig key={i} x={1000 + i * 90} y={1470} s={0.8} outfit={ARAB(i + 1)} flip pose={blend(STAND, { ...STAND, lean: 24, head: 20 }, bow)} />)}
        <Fig x={560} y={1470} s={0.85} sx={1.2} sy={0.84} outfit={OUT.abrahaKing} pose={STAND} />
        {new Array(4).fill(0).map((_, i) => <Fig key={i} x={180 + i * 110} y={1470} s={0.8} outfit={SOLDIER(i)} prop="spear" />)}
      </Layer>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// 5e — al-Mughammis at dusk: the guide dies; the Arabs stone his grave. b = [stoneAt]
export const Stoned: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const stoneAt = at(b, 0, dur, 0.3);
  const cam = lerpCam(p, aim(vertical, 960, 1300, 1.2), aim(vertical, 960, 1330, 1.45));
  const throwers = [700, 1220, 1360];
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dusk} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={980} y={1180} r={600} /><circle cx={980} cy={1200} r={110} fill="#ffd9a0" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("st", 1280, 200, 130)} fill="#4a2232" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#3a1a28" />
        {new Array(Math.round(20 + 50 * iv(frame, [stoneAt, dur], [0, 1]))).fill(0).map((_, i) => {
          const a = random(`gs${i}`) * Math.PI;
          const r = random(`gr${i}`) * 130;
          return <ellipse key={i} cx={960 + Math.cos(a) * r * 1.3} cy={1450 - Math.sin(a) * r * 0.5} rx={18 + random(`gx${i}`) * 14} ry={12 + random(`gy${i}`) * 8} fill={["#8a6a5a", "#6a4a40", "#a8846a"][i % 3]} stroke="#1b100c" strokeWidth={2} />;
        })}
        {frame >= stoneAt ? throwers.map((x, i) => {
          const t = ((frame - stoneAt + i * 25) % 60) / 60;
          const arm = t < 0.3 ? -150 * (t / 0.3) : -150 + (t - 0.3) * 300;
          const flip = x > 960;
          const sx = x + (flip ? -40 : 40);
          const k = Math.max(0, (t - 0.35) / 0.4);
          return <g key={i}><Fig x={x} y={1460 + (i % 2) * 20} s={0.85} outfit={ARAB(i + 2)} flip={flip} pose={{ ...STAND, armRU: Math.max(-170, Math.min(-20, arm)), armRL: -20, lean: 4 }} />{k > 0 && k < 1 ? <circle cx={sx + (960 - sx) * k} cy={1260 - Math.sin(k * Math.PI) * 160 + k * 170} r={10} fill="#8a6a5a" /> : null}</g>;
        }) : null}
      </Layer>
      <Grade color="#ff6a3a" opacity={0.14} />
      <Vignette s={0.65} />
    </AbsoluteFill>
  );
};

// 5f — horsemen drive away the herds of Tihāma, including ʿAbd al-Muṭṭalib's camels.
export const Herds: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, aim(vertical, 1200, 1300, vertical ? 1.15 : 1.05), aim(vertical, 800, 1300, vertical ? 1.2 : 1.1));
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.15} cam={cam}><path d={ridge("hd", 1250, 260, 130)} fill="#a8785a" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#d8a870" />
        {new Array(14).fill(0).map((_, i) => camel(2300 - frame * 3.2 - (i % 7) * 170 + random(`hc${i}`) * 60, 1460 + Math.floor(i / 7) * 60, 0.6 + Math.floor(i / 7) * 0.08, frame * 0.3 + i, true, ["#8a6440", "#7a5634", "#9a7048"][i % 3]))}
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${2650 - frame * 3.2 + i * 160} ${1480 + (i % 2) * 40}) scale(0.65)`}><Horse2 phase={frame * 0.42 + i} flip rider={<g transform="scale(0.9) translate(0 70)"><Fig x={0} y={0} outfit={SOLDIER(i, false)} pose={{ ...SIT, armRU: -120 }} /></g>} /></g>)}
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={70} y0={1200} y1={1700} drift={-3} opacity={0.4} size={7} /></Layer>
      <Grade color="#ff9040" opacity={0.12} />
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

// 5g — "Makkah was alone." The valley and the House; the army's dust rising beyond the hills.
export const MakkahAlone: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, aim(vertical, 960, 1250, 1.0), aim(vertical, 960, 1300, 1.3), ease);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dusk} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={1300} y={1100} r={600} id="glowR" o={0.6} /></Layer>
      <Layer d={0.12} cam={cam}>
        <path d={ridge("ma1", 1180, 300, 140)} fill="#5a2a3a" />
        <g opacity={0.8}>{new Array(12).fill(0).map((_, i) => <circle key={i} cx={1250 + i * 50} cy={1000 - i * 10 + Math.sin(frame * 0.05 + i) * 8} r={80 + i * 10} fill="#c98a6a" opacity={0.45} />)}</g>
      </Layer>
      <Layer d={0.4} cam={cam}><path d={ridge("ma2", 1320, 240, 130)} fill="#3a1a28" />{new Array(18).fill(0).map((_, i) => <rect key={i} x={300 + i * 75} y={1340 - (i % 3) * 18} width={64} height={90} fill="#8a6a5a" stroke="#1b100c" strokeWidth={2} />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <ellipse cx={960} cy={1480} rx={700} ry={90} fill="#c9a88a" />
        <rect x={-1400} y={1480} width={4800} height={1200} fill="#a8866a" />
        <Kaaba2 x={900} y={1470} s={1.6} />
      </Layer>
      <Grade color="#ff6a3a" opacity={0.16} />
      <Vignette s={0.65} />
    </AbsoluteFill>
  );
};

export const P5_SCENES = { TribesFight, Plead, Guide, Thaqif, Stoned, Herds, MakkahAlone };
void DustBurst;
