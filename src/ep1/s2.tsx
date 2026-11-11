import React from "react";
import { AbsoluteFill, random } from "remotion";
import { STAND, SIT, blend, walkPose, Pose } from "../cartoon/Rig";
import {
  Cam, Layer, iv, ease, useShot, moveCam, ridge, dunes, Vignette, Dust, SKY, Stars, Moon, Sun, Clouds,
  OUT, SOLDIER, ARAB, Figure, Horse, Camel, KElephant, Torch, Grade, Kaaba, Town,
} from "./kit";

// Scenes for TikTok parts 3–4: the march, the prisoners, al-Ṭāʾif, the camels, the tent, the night at the Kaʿbah.
const at = (b: number[] | undefined, i: number, dur: number, frac: number) => (b && b[i] !== undefined ? b[i] : Math.round(dur * frac));

const RIDER = <g transform="scale(0.85)"><Figure x={0} y={0} outfit={OUT.abrahaKing} pose={{ ...SIT }} flip /></g>;

// 17 — the army marches north with the elephant at its head.
export const March: React.FC<{ tone?: "dusk" | "day" }> = ({ tone = "day" }) => {
  const { frame, p } = useShot();
  const armyX = 1400 - frame * 2.2;
  const cam: Cam = { x: armyX - 900 + iv(p, [0, 1], [180, -60]), y: 0, zoom: iv(p, [0, 1], [1.0, 1.12], ease) };
  const ph = frame * 0.17;
  const sky = tone === "dusk" ? SKY.dusk : SKY.hot;
  return (
    <AbsoluteFill style={{ background: sky }}>
      <Layer d={0.02} cam={cam}><Sun x={1250} y={tone === "dusk" ? 620 : 250} r={tone === "dusk" ? 110 : 70} /></Layer>
      <Layer d={0.06} cam={cam}><Clouds y={140} color={tone === "dusk" ? "#e98a6a" : "#fff4dc"} opacity={0.5} seed="mr" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("mf", 700, 150, 120)} fill={tone === "dusk" ? "#8a4258" : "#c99a6a"} /></Layer>
      <Layer d={0.35} cam={cam}><path d={dunes("mm", 770, 70)} fill={tone === "dusk" ? "#6a3046" : "#d9a868"} /></Layer>
      <Layer d={1} cam={cam}>
        <path d={dunes("mg", 850, 25, 500, -3000, 6000)} fill={tone === "dusk" ? "#c7784a" : "#e2b277"} />
        {new Array(16).fill(0).map((_, i) => {
          const back = i % 2 === 1;
          return (
            <g key={i} transform={`translate(${armyX + 330 + Math.floor(i / 2) * 150} ${back ? 850 : 900}) scale(${back ? 0.75 : 0.9})`} opacity={back ? 0.9 : 1}>
              <Figure x={0} y={0} outfit={SOLDIER(i)} pose={walkPose(ph + i * 0.9)} flip />
            </g>
          );
        })}
        <g transform={`translate(${armyX} 880) scale(0.95)`}>
          <KElephant phase={ph * 0.8} earFlap={(Math.sin(ph * 0.6) + 1) / 2} rider={RIDER} />
        </g>
      </Layer>
      <Layer d={1.5} cam={cam}>
        {new Array(16).fill(0).map((_, i) => <path key={i} d={`M ${-1200 + i * 420} 1120 q 60 -90 140 -40 q 50 -60 120 10 q 40 -20 70 40 Z`} fill={tone === "dusk" ? "#4a1e22" : "#8a5a32"} />)}
        <Dust n={40} y0={650} y1={1050} drift={2} opacity={0.35} size={5} />
      </Layer>
      <Grade color="#ff9040" opacity={0.12} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// 18 — the Arab tribes charge and are crushed in a cloud of dust.
export const Battle: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const clashAt = at(b, 0, dur, 0.35);
  const lostAt = at(b, 1, dur, 0.7);
  const cam = moveCam(p, { x: 0, y: 20, zoom: 1.05 }, { x: 40, y: -20, zoom: 1.25 });
  const charge = iv(frame, [0, clashAt], [0, 1]);
  const cloud = iv(frame, [clashAt - 6, clashAt + 20, lostAt, lostAt + 30], [0, 1, 1, 0.15]);
  const lost = iv(frame, [lostAt, lostAt + 30], [0, 1]);
  return (
    <AbsoluteFill style={{ background: SKY.hot }}>
      <Layer d={0.15} cam={cam}><path d={ridge("bf", 680, 150, 130)} fill="#b8865a" /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={800} width={3800} height={700} fill="#c99a62" />
        {new Array(14).fill(0).map((_, i) => (
          <Figure key={`a${i}`} x={200 + (i % 7) * 90 + charge * 220} y={860 + Math.floor(i / 7) * 50} s={0.62} outfit={SOLDIER(i)} pose={walkPose(frame * 0.3 + i, charge < 1 ? 1 : 0)} />
        ))}
        {new Array(14).fill(0).map((_, i) => {
          const x = 1700 - (i % 7) * 90 - charge * 240;
          const down = lost > (i / 14) ? 1 : 0;
          return (
            <g key={`b${i}`} transform={`translate(${x + lost * 260} ${860 + Math.floor(i / 7) * 50})`}>
              <Figure x={0} y={0} s={0.62} outfit={{ ...ARAB(i), spear: true }} flip={!down} pose={down ? { ...walkPose(frame * 0.4 + i), lean: -10 } : walkPose(frame * 0.3 + i, charge < 1 ? 1 : 0)} />
            </g>
          );
        })}
        <g opacity={cloud}>
          {new Array(26).fill(0).map((_, i) => <circle key={i} cx={760 + random(`bc${i}`) * 520 + Math.sin(frame * 0.1 + i) * 20} cy={760 + random(`bd${i}`) * 180 - (frame % 60) * 0.3} r={70 + random(`be${i}`) * 90} fill="#e6c899" opacity={0.75} />)}
        </g>
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={60} y0={600} y1={1100} drift={2.4} opacity={0.4} size={6} /></Layer>
      <Grade color="#ff8030" opacity={0.15} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// 19 — a captured chief kneels before Abraha and pleads. `green` = the land of Khathʿam.
export const Prisoner: React.FC<{ b?: number[]; green?: boolean; chained?: boolean }> = ({ b, green, chained = true }) => {
  const { frame, dur, p } = useShot();
  const pleadAt = at(b, 0, dur, 0.25);
  const spareAt = at(b, 1, dur, 0.7);
  const plead = iv(frame, [pleadAt, pleadAt + 15], [0, 1], ease);
  const spare = iv(frame, [spareAt, spareAt + 15], [0, 1], ease);
  const cam = frame < spareAt ? moveCam(p, { x: 120, y: -40, zoom: 1.35 }, { x: 160, y: -60, zoom: 1.6 }) : moveCam(p, { x: -160, y: -60, zoom: 1.5 }, { x: -120, y: -40, zoom: 1.4 });
  const kneel: Pose = { ...STAND, legLU: -60, legLL: 100, legRU: -70, legRL: 110, bob: 70, lean: -6 + plead * -6, armRU: -60 - plead * 50, armRL: -40, armLU: -50 - plead * 40, armLL: -40, head: -10 };
  return (
    <AbsoluteFill style={{ background: green ? SKY.day : SKY.hot }}>
      <Layer d={0.05} cam={cam}><Clouds y={120} color="#fff8ee" opacity={0.6} seed="pr" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("pf", 680, 160, 140, -1600, 4400, true)} fill={green ? "#6f8a52" : "#bf8f5f"} /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={860} width={3800} height={700} fill={green ? "#8a9a5a" : "#c99a62"} />
        <Figure x={700} y={880} s={1} sx={1.2} sy={0.84} outfit={OUT.abrahaKing} pose={blend({ ...STAND, armRU: -20, armRL: -60 }, { ...STAND, armRU: -95, armRL: -10, head: -4 }, spare)} />
        <Figure x={1180} y={880} s={1} outfit={OUT.prisoner} flip pose={kneel} />
        {chained ? <path d={`M 1150 ${790 - plead * 30} q -20 30 0 50 q 20 20 -10 40`} stroke="#8a8a90" strokeWidth={6} fill="none" /> : null}
        {[0, 1].map((i) => <Figure key={i} x={1400 + i * 140} y={880} s={0.9} outfit={SOLDIER(i)} flip />)}
      </Layer>
      <Grade color={green ? "#80ff60" : "#ff9040"} opacity={0.08} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// 20 — a guide walks at the front of the army, pointing the way.
export const GuideMarch: React.FC<{ guide?: "nufayl" | "abuRighal" }> = ({ guide = "nufayl" }) => {
  const { frame, p } = useShot();
  const lead = 1500 - frame * 2.0;
  const cam: Cam = { x: lead - 1100, y: 0, zoom: iv(p, [0, 1], [1.05, 1.2], ease) };
  const point = iv(p, [0.3, 0.45], [0, 1], ease);
  return (
    <AbsoluteFill style={{ background: guide === "nufayl" ? SKY.day : SKY.dusk }}>
      <Layer d={0.03} cam={cam}><Clouds y={140} color={guide === "nufayl" ? "#fff8ee" : "#e98a6a"} opacity={0.6} seed="gm" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("gmf", 690, 180, 130, -1600, 4400, true)} fill={guide === "nufayl" ? "#7f8a5a" : "#7a3a52"} /></Layer>
      <Layer d={0.4} cam={cam}><path d={dunes("gmm", 770, 60)} fill={guide === "nufayl" ? "#a8a06a" : "#5a2a40"} /></Layer>
      <Layer d={1} cam={cam}>
        <path d={dunes("gmg", 860, 20, 500, -3000, 6000)} fill={guide === "nufayl" ? "#c9a46a" : "#b8704a"} />
        <Figure x={lead} y={890} s={0.85} outfit={guide === "nufayl" ? OUT.guide : ARAB(3)} flip pose={blend(walkPose(frame * 0.22), { ...walkPose(frame * 0.22), armRU: -100, armRL: -10 }, point)} />
        <g transform={`translate(${lead + 520} 880) scale(0.85)`}><KElephant phase={frame * 0.15} earFlap={(Math.sin(frame * 0.07) + 1) / 2} rider={RIDER} /></g>
        {new Array(10).fill(0).map((_, i) => <Figure key={i} x={lead + 820 + i * 130} y={880 + (i % 2) * 30} s={0.78} outfit={SOLDIER(i)} flip pose={walkPose(frame * 0.2 + i)} />)}
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={30} y0={700} y1={1050} drift={1.5} opacity={0.3} /></Layer>
      <Grade color={guide === "nufayl" ? "#ffd080" : "#ff7040"} opacity={0.12} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// 21 — al-Ṭāʾif: the men of Thaqīf come out to meet the army, beside their shrine.
export const Taif: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const bowAt = at(b, 0, dur, 0.2);
  const shrineAt = at(b, 1, dur, 0.6);
  const bow = iv(frame, [bowAt, bowAt + 20], [0, 1], ease);
  const cam = frame < shrineAt ? moveCam(p, { x: -60, y: 0, zoom: 1.05 }, { x: 0, y: -20, zoom: 1.2 }) : moveCam(p, { x: 420, y: -80, zoom: 1.4 }, { x: 460, y: -100, zoom: 1.55 });
  return (
    <AbsoluteFill style={{ background: SKY.day }}>
      <Layer d={0.04} cam={cam}><Clouds y={110} color="#ffffff" opacity={0.85} seed="tf" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("tff", 620, 260, 150, -1600, 4400, true)} fill="#6f8a5a" /></Layer>
      <Layer d={0.4} cam={cam}>
        <path d={ridge("tfm", 720, 120, 160, -1600, 4400, true)} fill="#5a7a46" />
        {new Array(22).fill(0).map((_, i) => <circle key={i} cx={-200 + i * 120 + random(`tt${i}`) * 50} cy={700 + random(`tu${i}`) * 50} r={26 + random(`tv${i}`) * 14} fill="#3f6a3a" />)}
        <Town y={760} n={8} x0={1200} gap={110} seed="tfw" s={0.7} />
      </Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={850} width={3800} height={700} fill="#a8a86a" />
        {/* the shrine of al-Lāt: a plain stone house, nothing more */}
        <g transform="translate(1440 870)">
          <rect x={-120} y={-200} width={240} height={200} fill="#d8ccb2" />
          <path d="M -140 -200 L 0 -270 L 140 -200 Z" fill="#b8a888" />
          <rect x={-30} y={-110} width={60} height={110} fill="#3a2e22" />
        </g>
        {new Array(5).fill(0).map((_, i) => <Figure key={i} x={1000 + i * 90} y={880} s={0.8} outfit={ARAB(i + 1)} flip pose={blend(STAND, { ...STAND, lean: 22, head: 18 }, bow)} />)}
        <Figure x={560} y={880} s={0.85} sx={1.2} sy={0.84} outfit={OUT.abrahaKing} pose={STAND} />
        {new Array(4).fill(0).map((_, i) => <Figure key={i} x={180 + i * 110} y={880} s={0.8} outfit={SOLDIER(i)} />)}
      </Layer>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// 22 — al-Mughammis: the grave of Abū Righāl, stoned.
export const Grave: React.FC = () => {
  const { frame, p } = useShot();
  const cam = moveCam(p, { x: 0, y: -40, zoom: 1.2 }, { x: 0, y: -80, zoom: 1.45 });
  const throwers = [700, 1250, 1420];
  return (
    <AbsoluteFill style={{ background: SKY.dusk }}>
      <Layer d={0.02} cam={cam}><Sun x={980} y={640} r={110} color="#ffd9a0" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("gr", 720, 180, 120)} fill="#5a2a40" /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={860} width={3800} height={700} fill="#4a2230" />
        {new Array(60).fill(0).map((_, i) => {
          const a = random(`gs${i}`) * Math.PI;
          const r = random(`gr${i}`) * 140;
          return <ellipse key={i} cx={960 + Math.cos(a) * r * 1.3} cy={880 - Math.sin(a) * r * 0.5} rx={18 + random(`gx${i}`) * 14} ry={12 + random(`gy${i}`) * 8} fill={["#8a6a5a", "#6a4a40", "#a8846a"][i % 3]} />;
        })}
        {throwers.map((x, i) => {
          const t = ((frame + i * 25) % 70) / 70;
          const arm = t < 0.3 ? -150 * (t / 0.3) : -150 + (t - 0.3) * 300;
          const flip = x > 960;
          const sx = x + (flip ? -40 : 40);
          const stoneT = Math.max(0, (t - 0.35) / 0.4);
          return (
            <g key={i}>
              <Figure x={x} y={880 + (i % 2) * 20} s={0.85} outfit={ARAB(i + 2)} flip={flip} pose={{ ...STAND, armRU: Math.max(-170, Math.min(-20, arm)), armRL: -20, lean: 4 }} />
              {stoneT > 0 && stoneT < 1 ? <circle cx={sx + (960 - sx) * stoneT} cy={700 - Math.sin(stoneT * Math.PI) * 160 + stoneT * 150} r={9} fill="#8a6a5a" /> : null}
            </g>
          );
        })}
      </Layer>
      <Grade color="#ff6a3a" opacity={0.15} />
      <Vignette strength={0.65} />
    </AbsoluteFill>
  );
};

// 23 — horsemen drive away the herds of Tihāma.
export const Raid: React.FC = () => {
  const { frame, p } = useShot();
  const cam = moveCam(p, { x: 200, y: 0, zoom: 1.05 }, { x: -200, y: -20, zoom: 1.15 });
  return (
    <AbsoluteFill style={{ background: SKY.hot }}>
      <Layer d={0.02} cam={cam}><Sun x={600} y={260} r={70} /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("rf", 700, 200, 120)} fill="#a8785a" /></Layer>
      <Layer d={0.45} cam={cam}><path d={dunes("rm", 790, 50)} fill="#c99a6a" /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={860} width={3800} height={700} fill="#d8a870" />
        {new Array(14).fill(0).map((_, i) => {
          const x = 2100 - frame * 3.2 - (i % 7) * 170 + random(`rc${i}`) * 60;
          return <g key={i} transform={`translate(${x} ${870 + Math.floor(i / 7) * 60}) scale(${0.55 + Math.floor(i / 7) * 0.08})`}><Camel phase={frame * 0.3 + i} walk={1.4} flip color={["#8a6440", "#7a5634", "#9a7048"][i % 3]} /></g>;
        })}
        {[0, 1, 2].map((i) => {
          const x = 2250 - frame * 3.2 + i * 160;
          return <g key={i} transform={`translate(${x} ${900 + (i % 2) * 40}) scale(0.62)`}><Horse phase={frame * 0.42 + i} flip rider={<g transform="scale(0.9) translate(0 70)"><Figure x={0} y={0} outfit={SOLDIER(i, true)} pose={{ ...SIT, armRU: -120 }} /></g>} /></g>;
        })}
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={70} y0={650} y1={1080} drift={-3} opacity={0.4} size={7} /></Layer>
      <Grade color="#ff9040" opacity={0.12} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// 24 — Makkah: men of Quraysh watch the dust of the army on the horizon; a rider comes.
export const MakkahWatch: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const riderAt = at(b, 0, dur, 0.55);
  const cam = moveCam(p, { x: 0, y: 0, zoom: 1.0 }, { x: 200, y: -60, zoom: 1.3 });
  const rx = iv(frame, [riderAt, dur], [2000, 1500]);
  return (
    <AbsoluteFill style={{ background: SKY.hot }}>
      <Layer d={0.15} cam={cam}>
        <path d={ridge("mw", 700, 260, 120)} fill="#8a6a52" />
        <g opacity={0.7 + 0.2 * Math.sin(frame * 0.05)}>
          {new Array(8).fill(0).map((_, i) => <circle key={i} cx={1650 + i * 40} cy={560 - i * 8 + Math.sin(frame * 0.05 + i) * 6} r={60 + i * 8} fill="#e6c899" opacity={0.5} />)}
        </g>
      </Layer>
      <Layer d={0.5} cam={cam}>
        <path d={ridge("mw2", 800, 200, 110)} fill="#6a4e3e" />
        <Town y={830} n={14} x0={200} gap={95} s={0.8} seed="mwt" />
        <Kaaba x={760} y={850} s={0.9} />
      </Layer>
      <Layer d={1} cam={cam}>
        <path d="M -900 900 Q 500 820 1300 860 L 2900 900 L 2900 1500 L -900 1500 Z" fill="#7a5a44" />
        {new Array(4).fill(0).map((_, i) => <Figure key={i} x={1180 + i * 110} y={870 + i * 6} s={0.82} outfit={ARAB(i)} pose={{ ...STAND, head: -6, armRU: i === 1 ? -110 : -8, armRL: i === 1 ? -10 : -6 }} />)}
        {frame > riderAt ? <g transform={`translate(${rx} 860) scale(0.45)`}><Horse phase={frame * 0.4} flip rider={<g transform="scale(0.9) translate(0 70)"><Figure x={0} y={0} outfit={OUT.envoy} pose={SIT} /></g>} /></g> : null}
      </Layer>
      <Grade color="#ff9040" opacity={0.1} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// 25 — at the Kaʿbah by day: Ḥunāṭa delivers Abraha's message to ʿAbd al-Muṭṭalib.
export const KaabaMeet: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const replyAt = at(b, 0, dur, 0.4);
  const reply = frame >= replyAt;
  const cam = reply ? moveCam((frame - replyAt) / Math.max(1, dur - replyAt), { x: -120, y: -40, zoom: 1.35 }, { x: -60, y: -120, zoom: 1.2 }) : moveCam(frame / Math.max(1, replyAt), { x: 0, y: 0, zoom: 1.0 }, { x: 160, y: -30, zoom: 1.3 });
  const gesture = reply ? iv(frame, [replyAt + 30, replyAt + 50], [0, 1], ease) : 0;
  return (
    <AbsoluteFill style={{ background: SKY.day }}>
      <Layer d={0.04} cam={cam}><Clouds y={100} color="#ffffff" opacity={0.85} seed="km" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("kmf", 650, 280, 120)} fill="#8a6a52" /></Layer>
      <Layer d={0.4} cam={cam}><Town y={800} n={20} x0={-300} gap={120} seed="kmt" /></Layer>
      <Layer d={1} cam={cam}>
        <ellipse cx={900} cy={940} rx={900} ry={140} fill="#e6dcc8" />
        <rect x={-900} y={940} width={3800} height={600} fill="#cdbb98" />
        <Kaaba x={760} y={930} s={2.4} />
        <Figure x={1180} y={950} s={0.42} outfit={OUT.chief} flip pose={blend(STAND, { ...STAND, armRU: -160, armRL: -10, head: -14 }, gesture)} />
        <Figure x={1420} y={950} s={0.42} outfit={OUT.envoy} flip={false} pose={{ ...STAND, armRU: reply ? -8 : -70, armRL: -20 }} />
      </Layer>
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};

// 26 — the camp at night: a visit to the prisoner; the elephant and its keeper Unays.
export const CampNight: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const unaysAt = at(b, 0, dur, 0.6);
  const toUnays = frame >= unaysAt;
  const cam = toUnays ? moveCam((frame - unaysAt) / Math.max(1, dur - unaysAt), { x: 420, y: -40, zoom: 1.3 }, { x: 520, y: -60, zoom: 1.4 }) : moveCam(p, { x: -200, y: -40, zoom: 1.3 }, { x: -260, y: -60, zoom: 1.5 });
  const tent = (x: number, y: number, s: number, c: string) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -160 0 L 0 -210 L 160 0 Z" fill={c} />
      <path d="M -30 0 L 0 -90 L 30 0 Z" fill="#1a0f0a" />
    </g>
  );
  return (
    <AbsoluteFill style={{ background: SKY.night }}>
      <Layer d={0.02} cam={cam}><Stars /><Moon x={300} y={160} /></Layer>
      <Layer d={0.15} cam={cam}>
        <path d={ridge("cn", 700, 200, 120)} fill="#1a1f3a" />
        {new Array(12).fill(0).map((_, i) => tent(-200 + i * 220, 760, 0.5, "#4a3a4a"))}
      </Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={860} width={3800} height={700} fill="#2a2430" />
        {tent(300, 880, 1.1, "#6a4a3a")}
        <Torch x={560} y={830} seed={1} />
        <Figure x={320} y={890} s={0.85} outfit={OUT.prisoner} pose={{ ...SIT, head: 6 }} />
        <Figure x={720} y={890} s={0.85} outfit={OUT.chief} flip pose={{ ...STAND, armRU: -60, armRL: -40 }} />
        {[0, 1].map((i) => <Figure key={i} x={860 + i * 100} y={890} s={0.75} outfit={ARAB(i + 1)} flip />)}
        <g transform="translate(1600 900) scale(0.95)"><KElephant phase={frame * 0.04} earFlap={(Math.sin(frame * 0.05) + 1) / 2} kneel={0} skin="#5a5058" /></g>
        <Figure x={1300 + (toUnays ? iv(frame, [unaysAt, dur], [0, 300]) : 0)} y={890} s={0.8} outfit={ARAB(3)} pose={toUnays ? walkPose(frame * 0.2) : STAND} />
        <Torch x={1950} y={830} seed={4} />
      </Layer>
      <Grade color="#3a5aa0" opacity={0.22} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

// 27 — Abraha's tent: he leaves the throne, sits on the carpet beside ʿAbd al-Muṭṭalib; the camera
// cuts between them as they speak. `focus` = [[frame, "two" | "abraha" | "chief"], ...]
type Focus = "two" | "abraha" | "chief" | "wide";
export const RoyalTent: React.FC<{ b?: number[]; focus?: [number, Focus][] }> = ({ b, focus }) => {
  const { frame, dur, p } = useShot();
  const enterAt = at(b, 0, dur, 0.0);
  const downAt = at(b, 1, dur, 0.25);
  const seated = at(b, 2, dur, 0.4);
  const walkIn = iv(frame, [enterAt, enterAt + 70], [0, 1], ease);
  const down = iv(frame, [downAt, downAt + 45], [0, 1], ease);
  const sit = iv(frame, [seated, seated + 20], [0, 1], ease);
  let f: Focus = "wide";
  for (const [fr, v] of focus ?? []) if (frame >= fr) f = v;
  const target: Record<Focus, Cam> = {
    wide: { x: 0, y: 0, zoom: 1.0 },
    two: { x: 0, y: 40, zoom: 1.45 },
    abraha: { x: -180, y: -40, zoom: 2.0 },
    chief: { x: 200, y: -40, zoom: 2.0 },
  };
  const t = target[f];
  const drift = Math.sin(frame * 0.01) * 10;
  const cam: Cam = { x: t.x + drift, y: t.y, zoom: t.zoom + p * 0.05 };
  const ax = 960 - 160 * down;
  const ay = 800 + 120 * down;
  const abrahaPose: Pose = down < 1 ? blend(SIT, walkPose(frame * 0.2), Math.sin(down * Math.PI)) : SIT;
  const cx = 1700 - 540 * walkIn;
  const chiefPose: Pose = walkIn < 1 ? walkPose(frame * 0.2) : blend(STAND, SIT, sit);
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a0f0a" }}>
      <Layer d={0.3} cam={cam}>
        <rect x={-600} y={-300} width={3200} height={1500} fill="#e9d6b0" />
        {new Array(16).fill(0).map((_, i) => <rect key={i} x={-600 + i * 200} y={-300} width={100} height={1500} fill="#a8281e" />)}
        <path d="M -600 -300 L 960 -120 L 2600 -300 Z" fill="#7a1a14" />
        {[200, 1720].map((x, i) => <Torch key={i} x={x} y={520} seed={i * 4} />)}
      </Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={880} width={3800} height={700} fill="#5a2a1e" />
        <path d="M 560 880 L 1360 880 L 1440 1010 L 480 1010 Z" fill="#8f1f1a" />
        <path d="M 600 900 L 1320 900 L 1380 990 L 540 990 Z" fill="none" stroke="#e3b341" strokeWidth={6} />
        <g transform="translate(960 840)">
          <path d="M -80 -40 L -80 -300 Q 0 -360 80 -300 L 80 -40 Z" fill="#c9952e" />
          <path d="M -60 -50 L -60 -280 Q 0 -325 60 -280 L 60 -50 Z" fill="#7a1420" />
          <rect x={-100} y={-110} width={200} height={40} fill="#c9952e" />
        </g>
        <Figure x={ax} y={ay} s={0.95} sx={1.2} sy={0.84} outfit={OUT.abrahaKing} pose={abrahaPose} />
        <Figure x={cx} y={960 - sit * 40} s={1.0} outfit={OUT.chief} flip pose={chiefPose} />
        <Figure x={1500} y={900} s={0.8} outfit={ARAB(4)} flip pose={{ ...STAND, head: 4 }} />
        {[-1, 1].map((s) => <Figure key={s} x={960 + s * 560} y={880} s={0.85} outfit={SOLDIER(s > 0 ? 1 : 0)} flip={s > 0} />)}
      </Layer>
      <Grade color="#ff7030" opacity={0.15} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// 28 — Quraysh leave Makkah for the mountain tops at dusk.
export const Exodus: React.FC = () => {
  const { frame, p } = useShot();
  const cam = moveCam(p, { x: -100, y: 40, zoom: 1.05 }, { x: 100, y: -60, zoom: 1.2 });
  return (
    <AbsoluteFill style={{ background: SKY.dusk }}>
      <Layer d={0.02} cam={cam}><Sun x={300} y={640} r={110} color="#ffd9a0" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("ex", 600, 300, 150)} fill="#5a2a40" /></Layer>
      <Layer d={0.5} cam={cam}><Town y={900} n={16} x0={-200} gap={120} seed="ext" lit /></Layer>
      <Layer d={1} cam={cam}>
        <path d="M -900 1100 L 300 1100 Q 900 900 1300 640 L 2000 300 L 2900 300 L 2900 1500 L -900 1500 Z" fill="#3a1a2a" />
        {new Array(14).fill(0).map((_, i) => {
          const t = ((frame * 0.0025 + i / 14) % 1);
          const x = 300 + t * 1500;
          const y = 1100 - t * 760 - Math.sin(t * Math.PI) * 60;
          return i % 4 === 3
            ? <g key={i} transform={`translate(${x} ${y}) scale(0.32)`}><Camel phase={frame * 0.2 + i} /></g>
            : <Figure key={i} x={x} y={y} s={0.36} outfit={ARAB(i)} pose={{ ...walkPose(frame * 0.2 + i), lean: 14 }} />;
        })}
      </Layer>
      <Grade color="#ff6a3a" opacity={0.15} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// 29 — night at the Kaʿbah: ʿAbd al-Muṭṭalib holds the ring of the door and calls on Allah.
export const KaabaNight: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const prayAt = at(b, 0, dur, 0.3);
  const leaveAt = at(b, 1, dur, 0.8);
  const leave = iv(frame, [leaveAt, leaveAt + 60], [0, 1], ease);
  const cam = frame < prayAt ? moveCam(frame / Math.max(1, prayAt), { x: 0, y: 0, zoom: 1.0 }, { x: 60, y: 40, zoom: 1.3 }) : moveCam((frame - prayAt) / Math.max(1, dur - prayAt), { x: 60, y: 40, zoom: 1.3 }, { x: 0, y: -40, zoom: 1.15 });
  const praying = frame >= prayAt && leave === 0;
  const chiefX = 960 + leave * 900;
  return (
    <AbsoluteFill style={{ background: SKY.night }}>
      <Layer d={0.02} cam={cam}><Stars n={160} /><Moon x={1520} y={150} /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("kn", 700, 280, 120)} fill="#151a36" /></Layer>
      <Layer d={0.4} cam={cam}><Town y={820} n={22} x0={-400} gap={120} seed="knt" /></Layer>
      <Layer d={1} cam={cam}>
        <ellipse cx={900} cy={950} rx={900} ry={140} fill="#3a3a52" />
        <rect x={-900} y={950} width={3800} height={600} fill="#2a2a40" />
        <Kaaba x={760} y={940} s={2.4} night />
        <Torch x={500} y={900} seed={2} />
        <Torch x={1300} y={900} seed={6} />
        {/* the ring of the door — at the door, his hand on it */}
        <circle cx={850} cy={846} r={8} fill="none" stroke="#e3c04a" strokeWidth={4} />
        <Figure x={chiefX - 80 * (1 - leave)} y={955} s={0.42} outfit={OUT.chief} flip={leave === 0} pose={leave > 0 ? walkPose(frame * 0.2) : praying ? { ...STAND, armRU: -150, armRL: 30, armLU: -30, armLL: -40, head: -16 } : STAND} />
        {new Array(5).fill(0).map((_, i) => <Figure key={i} x={1000 + i * 55 + leave * 900} y={955 + (i % 2) * 8} s={0.4} outfit={ARAB(i)} flip={leave === 0} pose={leave > 0 ? walkPose(frame * 0.2 + i) : { ...STAND, armRU: praying ? -120 : -8, armRL: -20, head: -14 }} />)}
      </Layer>
      <Grade color="#4a6ab0" opacity={0.2} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

// 30 — dawn over an empty Makkah; the House alone; the army appears on the ridge.
export const EmptyDawn: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const armyAt = at(b, 0, dur, 0.55);
  const army = iv(frame, [armyAt, armyAt + 40], [0, 1]);
  const cam = moveCam(p, { x: 0, y: 30, zoom: 1.0 }, { x: 0, y: -10, zoom: 1.25 });
  return (
    <AbsoluteFill style={{ background: SKY.dawn }}>
      <Layer d={0.02} cam={cam}><Sun x={960} y={600} r={90} color="#fff1d0" /></Layer>
      <Layer d={0.12} cam={cam}>
        <path d={ridge("ed", 680, 220, 120)} fill="#6a5070" />
        <g opacity={army}>
          {new Array(60).fill(0).map((_, i) => <line key={i} x1={300 + i * 22} y1={560 - random(`ea${i}`) * 30} x2={300 + i * 22} y2={520 - random(`ea${i}`) * 30} stroke="#2a1a2a" strokeWidth={3} />)}
        </g>
      </Layer>
      <Layer d={0.4} cam={cam}><Town y={820} n={22} x0={-400} gap={120} seed="edt" /></Layer>
      <Layer d={1} cam={cam}>
        <ellipse cx={960} cy={950} rx={900} ry={140} fill="#d8c8b8" />
        <rect x={-900} y={950} width={3800} height={600} fill="#bfae9a" />
        <Kaaba x={880} y={940} s={2.4} glow={0.6} />
      </Layer>
      <Grade color="#ffb070" opacity={0.15} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};
