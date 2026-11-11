import React from "react";
import { AbsoluteFill, random } from "remotion";
import { STAND, SIT, walkPose, blend } from "../cartoon/Rig";
import { OUT, SOLDIER, ARAB } from "../ep1/kit";
import {
  Cam, Layer, Defs, Sky, SKIES, iv, ease, easeOut, useShot, useView, lerpCam, aim, shakeAt, ridge, Dust, Grade, Vignette, Glow, Stars, Embers,
  Fig, Torch2, Elephant2,
} from "./kit2";

// Part 4 — "The Church": al-Qullays, forced labour, the treasures, the man from Kināna, the vow, the elephant.
const at = (b: number[] | undefined, i: number, dur: number, frac: number) => (b && b[i] !== undefined ? b[i] : Math.round(dur * frac));

// the church of al-Qullays (world coordinates; base on y=1440). h 0..1 = how much has been built.
const Qullays: React.FC<{ h?: number; night?: boolean; glint?: number }> = ({ h = 1, night, glint = 0 }) => {
  const { frame } = useShot();
  const top = 1440 - 1180 * h;
  const wall = night ? "#b8b0a0" : "#f3ecdc";
  const wall2 = night ? "#a8a090" : "#e6dcc4";
  const y = (v: number) => Math.max(top + v, 300 + v * 0.3);
  return (
    <g>
      <rect x={560} y={Math.max(top + 520, 980)} width={800} height={1440 - Math.max(top + 520, 980)} fill={wall} stroke="#1b100c" strokeWidth={5} />
      <rect x={700} y={Math.max(top + 300, 760)} width={520} height={1440 - Math.max(top + 300, 760)} fill={wall2} stroke="#1b100c" strokeWidth={5} />
      <rect x={840} y={top} width={240} height={1440 - top} fill={wall} stroke="#1b100c" strokeWidth={5} />
      <path d={`M 830 ${top} Q 960 ${top - 150} 1090 ${top} Z`} fill={night ? "#8a7a4a" : "#d4b04a"} stroke="#1b100c" strokeWidth={5} />
      {new Array(10).fill(0).map((_, i) => <path key={i} d={`M ${600 + i * 72} 1440 L ${600 + i * 72} ${Math.max(top + 620, 1080)} Q ${624 + i * 72} ${Math.max(top + 590, 1050)} ${648 + i * 72} ${Math.max(top + 620, 1080)} L ${648 + i * 72} 1440 Z`} fill={night ? "#2a2232" : "#8a7a62"} opacity={0.75} />)}
      {[[960, top - 150, "#e3c04a", 1.3], [770, Math.max(top + 300, 760) - 6, "#dcdce6", 0.85], [1150, Math.max(top + 300, 760) - 6, "#dcdce6", 0.85]].map(([x, yy, c, s], i) => (
        <g key={i} transform={`translate(${x} ${yy}) scale(${s})`}>
          <rect x={-7} y={-100} width={14} height={100} fill={c as string} stroke="#1b100c" strokeWidth={3} />
          <rect x={-34} y={-78} width={68} height={14} fill={c as string} stroke="#1b100c" strokeWidth={3} />
          <circle cx={0} cy={-72} r={50} fill="url(#glowW)" opacity={glint * (0.5 + 0.4 * Math.sin(frame * 0.3 + i))} />
        </g>
      ))}
      <path d="M 920 1440 L 920 1300 Q 960 1250 1000 1300 L 1000 1440 Z" fill="#140c10" />
      {void y}
    </g>
  );
};

// 4a — al-Qullays rises over Ṣanʿāʾ; the camera climbs it. Then forced labour at sunrise. b = [labourAt]
export const ChurchRise: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const labourAt = at(b, 0, dur, 0.5);
  const labour = frame >= labourAt;
  const grow = labour ? 0.55 : 1;
  const cam: Cam = labour
    ? lerpCam((frame - labourAt) / Math.max(1, dur - labourAt), aim(vertical, 960, 1260, 1.25), aim(vertical, 960, 1300, 1.4))
    : lerpCam(frame / Math.max(1, labourAt), aim(vertical, 960, 1200, vertical ? 1.0 : 1.1), aim(vertical, 960, vertical ? 760 : 700, vertical ? 1.0 : 0.95), ease);
  const sun = labour ? iv(frame, [labourAt, dur], [1420, 1180]) : 600;
  return (
    <AbsoluteFill>
      <Sky stops={labour ? SKIES.dawn : SKIES.day} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={1500} y={sun} r={500} /><circle cx={1500} cy={sun} r={80} fill="#fff1d0" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("cr1", 1300, 220, 150)} fill={labour ? "#5a3a52" : "#9a9a7a"} /></Layer>
      <Layer d={0.45} cam={cam}>{new Array(22).fill(0).map((_, i) => <rect key={i} x={-300 + i * 120} y={1340 - (i % 3) * 30} width={96} height={100 + (i % 3) * 30} fill={["#c9a47a", "#b8936a", "#d4b48a"][i % 3]} stroke="#1b100c" strokeWidth={3} />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill={labour ? "#9a7050" : "#c4a070"} />
        <Qullays h={grow} glint={labour ? 0 : iv(p, [0.5, 1], [0, 1])} />
        {labour ? <g opacity={0.9}>{new Array(6).fill(0).map((_, i) => <line key={i} x1={540 + i * 168} y1={1440} x2={540 + i * 168} y2={760} stroke="#6a4a2a" strokeWidth={8} />)}{new Array(7).fill(0).map((_, i) => <line key={i} x1={540} y1={1440 - i * 100} x2={1380} y2={1440 - i * 100} stroke="#6a4a2a" strokeWidth={6} />)}</g> : null}
        {labour ? new Array(9).fill(0).map((_, i) => {
          const x = ((frame * 1.6 + i * 240) % 2200) - 300;
          return <g key={i}><Fig x={x} y={1460 + (i % 2) * 40} s={0.6} outfit={ARAB(i)} pose={{ ...walkPose(frame * 0.18 + i, 0.7), lean: 18, armRU: -100, armLU: -100 }} /><rect x={x + 26} y={1460 + (i % 2) * 40 - 190} width={60} height={42} fill="#efe8d8" stroke="#1b100c" strokeWidth={3} /></g>;
        }) : null}
        {labour ? <Fig x={1300} y={1470} s={0.75} outfit={SOLDIER(0, false)} flip pose={{ ...STAND, armRU: -120 + Math.sin(frame * 0.2) * 30, armRL: -30 }} /> : null}
      </Layer>
      <Layer d={1.3} cam={cam}><Dust n={40} color="#fff4e0" y0={900} y1={1700} drift={0.5} opacity={0.3} /></Layer>
      <Grade color={labour ? "#ff8a40" : "#ffe0a0"} opacity={0.14} />
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

// 4b — inside: marble, crosses of gold and silver, pulpits of ivory and ebony.
export const Treasures: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, aim(vertical, vertical ? 760 : 960, 1100, 1.0), aim(vertical, vertical ? 1160 : 960, 1060, 1.2));
  return (
    <AbsoluteFill>
      <Sky stops={[[0, "#2a2018"], [100, "#4a3a2a"]]} />
      <Layer d={0.3} cam={cam}>
        <rect x={-800} y={200} width={3600} height={1500} fill="#e8e0d0" />
        {new Array(9).fill(0).map((_, i) => <g key={i}><rect x={-200 + i * 300} y={300} width={90} height={1150} fill="#f6f2ea" stroke="#1b100c" strokeWidth={4} /><rect x={-200 + i * 300} y={300} width={26} height={1150} fill="#000" opacity={0.08} /></g>)}
        <path d="M 600 300 Q 960 60 1320 300 Z" fill="#d4b04a" stroke="#1b100c" strokeWidth={5} />
        <Glow x={960} y={500} r={600} o={0.5} />
      </Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill="#d8d0c0" />
        {[[960, 1000, "#e3c04a", 1.6], [600, 1150, "#dcdce6", 1.0], [1320, 1150, "#dcdce6", 1.0]].map(([x, y, c, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x={-8} y={-110} width={16} height={110} fill={c as string} stroke="#1b100c" strokeWidth={3} />
            <rect x={-38} y={-86} width={76} height={16} fill={c as string} stroke="#1b100c" strokeWidth={3} />
            <circle cx={0} cy={-80} r={70} fill="url(#glowW)" opacity={0.4 + 0.3 * Math.sin(frame * 0.2 + i)} />
          </g>
        ))}
        {[700, 1220].map((x, i) => <g key={i} transform={`translate(${x} 1440)`}><rect x={-60} y={-220} width={120} height={220} fill={i ? "#2a1a14" : "#f1e8d6"} stroke="#1b100c" strokeWidth={5} /><rect x={-80} y={-240} width={160} height={30} fill={i ? "#f1e8d6" : "#2a1a14"} stroke="#1b100c" strokeWidth={4} /></g>)}
      </Layer>
      <Grade color="#ffd27a" opacity={0.18} />
      <Vignette s={0.55} />
    </AbsoluteFill>
  );
};

// 4c — Arabs around a night fire hear the news; one man rises in anger. b = [riseAt]
export const NewsByFire: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const riseAt = at(b, 0, dur, 0.5);
  const rise = iv(frame, [riseAt, riseAt + 16], [0, 1], ease);
  const cam = lerpCam(p, aim(vertical, 960, 1300, 1.2), aim(vertical, vertical ? 1080 : 1000, 1260, 1.45));
  const flick = 1 + 0.12 * Math.sin(frame * 0.6) + 0.06 * Math.sin(frame * 1.4);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.night} />
      <Layer d={0.02} cam={cam}><Defs /><Stars n={200} /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("nf", 1300, 200, 150)} fill="#141a34" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#2a2228" />
        <Glow x={960} y={1400} r={600 * flick} id="glowO" o={0.7} />
        <path d={`M 920 1440 Q 960 ${1300 - 40 * flick} 1000 1440 Z`} fill="#ffb347" />
        <path d={`M 940 1440 Q 960 ${1350 - 30 * flick} 980 1440 Z`} fill="#fff1b8" />
        <Embers n={30} x0={900} x1={1020} base={1400} speed={5} />
        {[0, 1, 2].map((i) => <Fig key={i} x={[700, 820, 1260][i]} y={1450} s={0.8} outfit={ARAB(i)} flip={i === 2} pose={SIT} />)}
        <Fig x={1130} y={rise > 0.5 ? 1450 : 1450} s={0.85} outfit={{ ...ARAB(3), wrap: "#7a2a1a" }} flip pose={blend(SIT, { ...STAND, armRU: -150, armRL: -20, lean: -4 }, rise)} />
      </Layer>
      <Grade color="#ff8a3a" opacity={0.18} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};

// 4d — night in Ṣanʿāʾ: a figure slips into al-Qullays and away. b = [inAt, outAt]
export const Sneak: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const inAt = at(b, 0, dur, 0.4);
  const outAt = at(b, 1, dur, 0.75);
  const x = frame < inAt ? iv(frame, [0, inAt], [vertical ? 640 : 300, 950]) : frame < outAt ? 960 : iv(frame, [outAt, dur], [960, 1900]);
  const vis = frame < inAt || frame > outAt + 4;
  const cam = lerpCam(p, aim(vertical, 960, 1100, vertical ? 1.0 : 1.0), aim(vertical, 960, 1330, 1.5));
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.night} />
      <Layer d={0.02} cam={cam}><Defs /><Stars n={160} /><circle cx={1400} cy={400} r={60} fill="#fdf6dc" /></Layer>
      <Layer d={0.25} cam={cam}>{new Array(22).fill(0).map((_, i) => <rect key={i} x={-300 + i * 120} y={1300 - (i % 3) * 30} width={96} height={140 + (i % 3) * 30} fill="#2a2a44" />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#222034" />
        <Qullays night />
        <Torch2 x={860} y={1360} seed={3} s={0.7} />
        <Torch2 x={1060} y={1360} seed={5} s={0.7} />
        {vis ? <Fig x={x} y={1460} s={0.5} outfit={OUT.servant} silhouette="#0c0a14" pose={walkPose(frame * (frame > outAt ? 0.45 : 0.25), frame > outAt ? 1.4 : 0.8)} /> : null}
      </Layer>
      <Grade color="#3a5ab0" opacity={0.25} />
      <Vignette s={0.75} />
    </AbsoluteFill>
  );
};

// 4e — Abraha's fury and vow; the army readies; in the dark the elephant raises its trunk. b = [fistAt, elephantAt]
export const Vow: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const fistAt = at(b, 0, dur, 0.3);
  const elAt = at(b, 1, dur, 0.75);
  const fist = iv(frame, [fistAt, fistAt + 12], [0, 1], ease);
  if (frame >= elAt) {
    const t = (frame - elAt) / Math.max(1, dur - elAt);
    const cam = lerpCam(t, aim(vertical, 960, 1150, 1.0), aim(vertical, 860, 1080, 1.25), easeOut);
    return (
      <AbsoluteFill>
        <Sky stops={[[0, "#020102"], [100, "#140808"]]} />
        <Layer d={0.4} cam={cam}><Defs />{[300, 1620].map((x, i) => <Torch2 key={i} x={x} y={1200} seed={i * 7} s={1.3} />)}</Layer>
        <Layer d={1} cam={cam}>
          <Defs />
          <rect x={-1400} y={1440} width={4800} height={1200} fill="#120a0a" />
          <g transform="translate(1000 1460) scale(1.15)" opacity={iv(t, [0, 0.4], [0.2, 1])}><Elephant2 walk={frame * 0.05} ear={(Math.sin(frame * 0.07) + 1) / 2} trunkUp={iv(t, [0.3, 0.7], [0, 1], ease)} skin="#5a504c" /></g>
        </Layer>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 45% 40% at 50% 58%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.88) 100%)" }} />
        <Grade color="#ff5a20" opacity={0.18} />
      </AbsoluteFill>
    );
  }
  const sh = shakeAt(frame, [fistAt + 10], 16);
  const c0 = lerpCam(frame / Math.max(1, elAt), aim(vertical, 960, 1200, 1.0), aim(vertical, 980, 1250, 1.5));
  const cam = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.palace} />
      <Layer d={0.3} cam={cam}>
        <rect x={-800} y={300} width={3600} height={1400} fill="#3a1612" />
        {new Array(8).fill(0).map((_, i) => <path key={i} d={`M ${-300 + i * 340} 1360 L ${-300 + i * 340} 760 Q ${-130 + i * 340} 560 ${40 + i * 340} 760 L ${40 + i * 340} 1360 Z`} fill="#22100c" />)}
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 520} 520 L ${240 + i * 520} 520 L ${240 + i * 520} 960 L ${180 + i * 520} 910 L ${120 + i * 520} 960 Z`} fill="#8f2a1c" />)}
      </Layer>
      <Layer d={0.6} cam={cam}>{[0, 1, 2, 3].map((i) => <Torch2 key={i} x={-60 + i * 680} y={960} seed={i * 2} />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill="#3a2018" />
        <g transform="translate(960 1440)"><path d="M -100 -40 L -100 -360 Q 0 -430 100 -360 L 100 -40 Z" fill="#c9952e" stroke="#1b100c" strokeWidth={5} /><path d="M -78 -50 L -78 -340 Q 0 -392 78 -340 L 78 -50 Z" fill="#7a1420" /></g>
        <Fig x={960} y={fist > 0.5 ? 1440 : 1394} s={0.95} sx={1.2} sy={0.86} outfit={OUT.abrahaKing} pose={blend(SIT, { ...STAND, armRU: -155, armRL: -40, lean: 4, head: 6 }, fist)} />
        <Fig x={1300} y={1450} s={0.85} outfit={ARAB(1)} flip pose={{ ...STAND, lean: 16, head: 16 }} />
      </Layer>
      <Grade color="#ff3010" opacity={0.08 + fist * 0.14} />
      <Vignette s={0.65} />
    </AbsoluteFill>
  );
};

export const P4_SCENES = { ChurchRise, Treasures, NewsByFire, Sneak, Vow };
void random;
void SIT;
