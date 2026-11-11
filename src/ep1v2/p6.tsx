import React from "react";
import { AbsoluteFill } from "remotion";
import { STAND, walkPose, blend, Pose } from "../cartoon/Rig";
import { OUT, SOLDIER, ARAB } from "../ep1/kit";
import {
  Cam, Layer, Defs, Sky, SKIES, iv, ease, useShot, useView, lerpCam, aim, ridge, Grade, Vignette, Glow, Stars,
  Fig, Elephant2, Horse2, Kaaba2, Torch2,
  RIDE,
  ThroneSeat, THRONE_SEAT, seatY, SITC, SITG,
} from "./kit2";

// Part 6 — "The Lord of the Camels": the envoy, the answer at the Kaʿbah, the camp, the tent, the night prayer.
const at = (b: number[] | undefined, i: number, dur: number, frac: number) => (b && b[i] !== undefined ? b[i] : Math.round(dur * frac));
const Town: React.FC<{ y: number; seed: string; n?: number; x0?: number; lit?: boolean; night?: boolean }> = ({ y, seed, n = 22, x0 = -300, lit, night }) => (
  <g>{new Array(n).fill(0).map((_, i) => { const h = 90 + ((i * 37 + seed.length * 13) % 70); const w = 90 + ((i * 53) % 40); return <g key={i}><rect x={x0 + i * 120} y={y - h} width={w} height={h} fill={night ? ["#3a3a52", "#34344a", "#42425c"][i % 3] : ["#c9a47a", "#b8936a", "#d4b48a"][i % 3]} stroke="#1b100c" strokeWidth={3} /><rect x={x0 + i * 120 + w * 0.55} y={y - h * 0.5} width={w * 0.18} height={h * 0.3} fill={lit && i % 3 === 0 ? "#ffb347" : "#2a1e16"} /></g>; })}</g>
);

// 6a — Ḥunāṭa rides into Makkah, then finds ʿAbd al-Muṭṭalib at the Kaʿbah. b = [arriveAt, answerAt]
export const Envoy: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const arriveAt = at(b, 0, dur, 0.4);
  const answerAt = at(b, 1, dur, 0.55);
  const riding = frame < arriveAt;
  const rx = iv(frame, [0, arriveAt], [2000, 1420]);
  const cam: Cam = riding
    ? lerpCam(frame / Math.max(1, arriveAt), aim(vertical, vertical ? 1500 : 1300, 1250, 1.0), aim(vertical, vertical ? 1300 : 1100, 1280, 1.1))
    : frame < answerAt
      ? lerpCam((frame - arriveAt) / Math.max(1, answerAt - arriveAt), aim(vertical, 1300, 1300, 1.5), aim(vertical, 1300, 1290, 1.6))
      : lerpCam((frame - answerAt) / Math.max(1, dur - answerAt), aim(vertical, 1150, 1300, 1.6), aim(vertical, 1100, 1230, 1.35));
  const gesture = frame >= answerAt ? iv(frame, [answerAt + 40, answerAt + 60], [0, 1], ease) : 0;
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.15} cam={cam}><path d={ridge("ev", 1180, 300, 130)} fill="#8a6a52" /></Layer>
      <Layer d={0.4} cam={cam}><Town y={1360} seed="ev" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <ellipse cx={900} cy={1480} rx={900} ry={130} fill="#e6dcc8" />
        <rect x={-1400} y={1480} width={4800} height={1200} fill="#cdbb98" />
        <Kaaba2 x={760} y={1470} s={2.4} />
        <Fig x={1180} y={1490} s={0.62} outfit={OUT.chief} pose={blend(STAND, { ...STAND, armRU: -160, armRL: -10, head: -14 }, gesture)} />
        {riding
          ? <g transform={`translate(${rx} 1500) scale(0.55)`}><Horse2 phase={frame * 0.4} flip rider={<g transform="translate(0 104) scale(0.9)"><Fig x={0} y={0} outfit={OUT.envoy} pose={RIDE} /></g>} /></g>
          : <Fig x={1420} y={1490} s={0.62} outfit={OUT.envoy} flip pose={{ ...STAND, armRU: frame < answerAt ? -70 : -8, armRL: -20 }} />}
      </Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// 6b — the camp at night: ʿAbd al-Muṭṭalib visits Dhū Nafar in chains; Unays, the elephant's keeper, goes to the king. b = [unaysAt]
export const Camp: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const unaysAt = at(b, 0, dur, 0.55);
  const toU = frame >= unaysAt;
  const cam = toU ? lerpCam((frame - unaysAt) / Math.max(1, dur - unaysAt), aim(vertical, 1350, 1200, 1.2), aim(vertical, 1500, 1200, 1.3)) : lerpCam(frame / Math.max(1, unaysAt), aim(vertical, 560, 1330, 1.5), aim(vertical, 600, 1320, 1.65));
  const tent = (x: number, y: number, s: number, c: string) => <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -170 0 L 0 -220 L 170 0 Z" fill={c} stroke="#1b100c" strokeWidth={5} /><path d="M -32 0 L 0 -96 L 32 0 Z" fill="#1a0f0a" /></g>;
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.night} />
      <Layer d={0.02} cam={cam}><Defs /><Stars n={180} /><circle cx={400} cy={600} r={56} fill="#fdf6dc" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("cp", 1260, 220, 130)} fill="#1a1f3a" />{new Array(14).fill(0).map((_, i) => <g key={i}>{tent(-200 + i * 200, 1330, 0.5, "#4a3a4a")}</g>)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#2a2430" />
        {tent(380, 1460, 1.15, "#6a4a3a")}
        <Torch2 x={620} y={1400} seed={1} />
        <Fig seat="ground" x={400} y={seatY(1470, 0.85, 1, true)} s={0.85} outfit={OUT.prisoner} pose={{ ...SITG, head: 6 }} />
        <path d="M 386 1386 q -20 30 0 50" stroke="#9a9aa4" strokeWidth={6} fill="none" />
        <Fig x={760} y={1470} s={0.85} outfit={OUT.chief} flip pose={{ ...STAND, armRU: -60, armRL: -40 }} />
        {[0, 1].map((i) => <Fig key={i} x={900 + i * 100} y={1470} s={0.75} outfit={ARAB(i + 1)} flip />)}
        <g transform="translate(1680 1470) scale(0.95)"><Elephant2 walk={frame * 0.04} ear={(Math.sin(frame * 0.05) + 1) / 2} skin="#5a5058" /></g>
        <Fig x={1280 + (toU ? iv(frame, [unaysAt, dur], [0, 340]) : 0)} y={1470} s={0.82} outfit={ARAB(3)} pose={toU ? walkPose(frame * 0.2) : STAND} />
        <Torch2 x={2000} y={1400} seed={4} />
      </Layer>
      <Grade color="#3a5aa0" opacity={0.22} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};

// 6c — Abraha's tent: he leaves the throne for the carpet; shot / reverse-shot through the exchange.
// b = [downAt, seatedAt]; focus = [[frame, "wide" | "two" | "abraha" | "chief"], …]
type F = "wide" | "two" | "abraha" | "chief";
export const Tent: React.FC<{ b?: number[]; focus?: [number, F][] }> = ({ b, focus }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const downAt = at(b, 0, dur, 0.2);
  const seatedAt = at(b, 1, dur, 0.32);
  const walkEnd = Math.max(30, Math.min(90, downAt - 10));
  const walkIn = iv(frame, [0, walkEnd], [0, 1]);
  const down = iv(frame, [downAt, downAt + 50], [0, 1]);
  const sit = iv(frame, [seatedAt, seatedAt + 14], [0, 1]);
  let f: F = "wide";
  for (const [fr, v] of focus ?? []) if (frame >= fr) f = v;
  const ax = 960 - 170 * down;
  const ay = down === 0 ? seatY(1440 - THRONE_SEAT, 0.95, 0.86) : down < 1 ? 1440 + 90 * down : seatY(1530, 0.95, 0.86, true);
  const cx = 1720 - 560 * walkIn;
  const T: Record<F, Cam> = {
    wide: aim(vertical, vertical ? 1100 : 1020, 1250, vertical ? 1.0 : 1.0),
    two: aim(vertical, 980, 1330, vertical ? 1.15 : 1.45),
    abraha: aim(vertical, ax, 1300, vertical ? 1.9 : 1.8),
    chief: aim(vertical, cx, 1300, vertical ? 1.9 : 1.8),
  };
  const t = T[f];
  const cam: Cam = { x: t.x + Math.sin(frame * 0.01) * 8, y: t.y, zoom: t.zoom * (1 + p * 0.04) };
  const abrahaPose: Pose = down === 0 ? SITC : down < 1 ? walkPose(frame * 0.22) : SITG;
  const chiefPose: Pose = walkIn < 1 ? walkPose(frame * 0.22) : sit < 1 ? STAND : SITG;
  const cy = sit < 1 ? 1530 : seatY(1530, 1.0, 1, true);
  return (
    <AbsoluteFill>
      <Sky stops={[[0, "#2a0f0a"], [100, "#3a1810"]]} />
      <Layer d={0.3} cam={cam}>
        <rect x={-800} y={200} width={3600} height={1500} fill="#ead6b0" />
        {new Array(18).fill(0).map((_, i) => <rect key={i} x={-800 + i * 200} y={200} width={100} height={1500} fill="#a8281e" />)}
        <path d="M -800 200 L 960 420 L 2800 200 Z" fill="#7a1a14" />
        {[200, 1720].map((x, i) => <Torch2 key={i} x={x} y={1100} seed={i * 4} />)}
      </Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-1400} y={1440} width={4800} height={1200} fill="#5a2a1e" />
        <path d="M 520 1460 L 1400 1460 L 1500 1600 L 420 1600 Z" fill="#8f1f1a" stroke="#1b100c" strokeWidth={4} />
        <path d="M 560 1480 L 1360 1480 L 1430 1580 L 490 1580 Z" fill="none" stroke="#e3b341" strokeWidth={7} />
        <ThroneSeat x={960} floor={1440} s={1} />
        <Fig seat={down === 0 ? "chair" : down >= 1 ? "ground" : undefined} x={ax} y={ay} s={0.95} sx={1.2} sy={0.86} outfit={OUT.abrahaKing} pose={abrahaPose} />
        <Fig seat={sit >= 1 ? "ground" : undefined} x={cx} y={cy} s={1.0} outfit={OUT.chief} flip pose={chiefPose} />
        <Fig x={1560} y={1470} s={0.85} outfit={ARAB(4)} flip pose={{ ...STAND, head: 4 }} />
        {[-1, 1].map((sd) => <Fig key={sd} x={960 + sd * 620} y={1450} s={0.9} outfit={SOLDIER(sd > 0 ? 1 : 0)} prop="spear" flip={sd > 0} />)}
      </Layer>
      <Grade color="#ff7030" opacity={0.15} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// 6d — night at the Kaʿbah: he holds the ring of the door and calls on Allah; then leads them to the mountains. b = [leaveAt]
export const RingPrayer: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const leaveAt = at(b, 0, dur, 0.72);
  const leaving = frame >= leaveAt;
  const cam = leaving ? lerpCam((frame - leaveAt) / Math.max(1, dur - leaveAt), aim(vertical, 900, 1250, 1.15), aim(vertical, 1000, 1000, 1.0)) : lerpCam(p, aim(vertical, 880, 1300, 1.3), aim(vertical, 870, 1330, 1.6));
  const lx = leaving ? iv(frame, [leaveAt, dur], [0, 900]) : 0;
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.night} />
      <Layer d={0.02} cam={cam}><Defs /><Stars n={200} /><circle cx={1500} cy={500} r={56} fill="#fdf6dc" /><Glow x={1500} y={500} r={260} o={0.4} /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("rp", 1200, 320, 130)} fill="#151a36" /></Layer>
      <Layer d={0.4} cam={cam}><Town y={1380} seed="rp" night /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <ellipse cx={900} cy={1490} rx={900} ry={130} fill="#3a3a52" />
        <rect x={-1400} y={1490} width={4800} height={1200} fill="#2a2a40" />
        <Kaaba2 x={760} y={1480} s={2.4} night />
        <Torch2 x={480} y={1440} seed={2} />
        <Torch2 x={1320} y={1440} seed={6} />
        <circle cx={850} cy={1386} r={9} fill="none" stroke="#e3c04a" strokeWidth={4} />
        <Fig x={leaving ? 900 + lx : 880} y={1500} s={0.62} outfit={OUT.chief} flip={!leaving} pose={leaving ? walkPose(frame * 0.2) : { ...STAND, armRU: -150, armRL: 30, armLU: -30, armLL: -40, head: -16 }} />
        {new Array(5).fill(0).map((_, i) => <Fig key={i} x={1000 + i * 70 + lx} y={1500 + (i % 2) * 8} s={0.58} outfit={ARAB(i)} flip={!leaving} pose={leaving ? walkPose(frame * 0.2 + i) : { ...STAND, armRU: -120, armRL: -20, head: -14 }} />)}
      </Layer>
      <Grade color="#4a6ab0" opacity={0.2} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};

export const P6_SCENES = { Envoy, Camp, Tent, RingPrayer };
