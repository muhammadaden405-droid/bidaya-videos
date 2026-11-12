import React, { useContext } from "react";
import { AbsoluteFill } from "remotion";
import { STAND, SIT, walkPose, blend, Pose, Outfit, Mood } from "../cartoon/Rig";
import { FOLK, GUARD } from "../cartoon/Trailer";
import { KING_MAIN, BOY_MAIN, MONK_MAIN, COMPANION_MAIN, SHADOW } from "./cast";
import { Abs, Actor, sitY, useMouth, V, Cam, Layer, Defs, iv, ease, easeOut, useShot, useView, aim, Dust, DustBurst, Grade, Vignette, Glow, Torch2, ThroneSeat, SITG } from "./kit";
import { FLOOR, useL, Shot, shotCam, shook, Hall, RoadBg, Hut } from "./p1";

// Episode 2 — Parts 2 and 3, plus the two building blocks the rest of the episode reuses:
// Court (the king on his throne facing someone) and HutTalk (the monk and the boy).
export type Who = "boy" | "companion" | "monk";
const CAST: Record<Who, Outfit> = { boy: BOY_MAIN, companion: COMPANION_MAIN, monk: MONK_MAIN };
const PRE: Record<Who, string> = { boy: "B", companion: "C", monk: "M" };
/** character lines (by id prefix) that start inside a scene */
export const lineIds = (from: number, to: number, pre: string) =>
  Object.keys(V.lines).filter((id) => new RegExp(`^${pre}\\d+$`).test(id) && V.lines[id].f0 >= from - 3 && V.lines[id].f0 < to).sort((a, b) => V.lines[a].f0 - V.lines[b].f0);
const KX = 1260;
const OX = 880;

export const Court: React.FC<{
  other?: Who; seated?: boolean; enter?: boolean; guards?: number; guardsAt?: string; dark?: number; kingMood?: Mood; otherMood?: Mood;
  leanAt?: string; closer?: string; holdKing?: string; endOnKing?: number; fire?: number;
}> = ({ other, seated, enter, guards = 0, guardsAt, dark = 0, kingMood = "tight", otherMood = "neutral", leanAt, closer, holdKing, endOnKing, fire = 0 }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const from = useContext(Abs);
  const { L } = useL();
  const kIds = lineIds(from, from + dur, "K");
  const oIds = other ? lineIds(from, from + dur, PRE[other]) : [];
  const km = useMouth(...kIds);
  const om = useMouth(...oIds);
  const walkT = enter ? iv(frame, [0, 52], [0, 1], easeOut) : 1;
  const step = closer ? iv(frame, [L(closer) - 4, L(closer) + 18], [0, 1], ease) : 0;
  const ox = 430 + (OX - 430) * walkT + step * 110;
  const sat = seated ? (enter ? iv(frame, [54, 70], [0, 1], ease) : 1) : 0;
  const s = other === "boy" ? 1.8 : 2;
  const oy = seated ? 1050 : FLOOR - 236 * s + 40;
  const two = (z: number): Cam => aim(vertical, (ox + KX) / 2 + 10, 1090, vertical ? Math.min(z, 1.5) : z);
  const shots: Shot[] = [{ at: 0, a: two(1.22), b: two(1.34) }];
  [...kIds.map((id) => ({ id, k: true })), ...oIds.map((id) => ({ id, k: false }))].sort((a, b) => V.lines[a.id].f0 - V.lines[b.id].f0).forEach((l, i) => {
    const a = V.lines[l.id].f0 - from - 2;
    const e = V.lines[l.id].f1 - from + 4;
    const x = l.k ? KX - 24 : ox + 14;
    const y = l.k ? 1030 : oy;
    shots.push({ at: a, a: aim(vertical, x, y, 1.95), b: aim(vertical, x, y - 6, 2.15) });
    if (e - a > 170) {
      shots.push({ at: a + Math.round((e - a) * 0.45), a: two(1.5), b: two(1.62) });
      shots.push({ at: a + Math.round((e - a) * 0.7), a: aim(vertical, x, y, 2.15), b: aim(vertical, x, y - 6, 2.35) });
    }
    if (l.id !== holdKing) shots.push({ at: e, a: two(i % 2 ? 1.3 : 1.45), b: two(i % 2 ? 1.38 : 1.55) });
  });
  if (endOnKing !== undefined) shots.push({ at: endOnKing - from, a: aim(vertical, KX - 24, 1030, 1.9), b: aim(vertical, KX - 24, 1024, 2.3) });
  shots.sort((a, b) => a.at - b.at);
  const cam = shotCam(frame, shots, dur);
  const lean = leanAt ? iv(frame, [L(leanAt) - 6, L(leanAt) + 14], [0, 1], ease) : 0;
  const kingPose: Pose = { ...SIT, lean: -9 * lean, head: 2 + Math.sin(frame * 0.04) * 1.5 + 4 * km, armRU: -25 - 30 * km, armRL: -45 };
  const walking = enter && walkT < 1;
  const oPose: Pose = sat > 0 ? blend(STAND, SIT, sat) : walking ? walkPose(frame * 0.34, 0.9) : { ...STAND, head: -4 + 3 * om, armRU: -8 - 34 * om, armRL: -6 - 50 * om };
  const gShow = guards && (!guardsAt || frame >= L(guardsAt)) ? guards : 0;
  const flick = 0.5 + 0.5 * Math.sin(frame * 0.7) * Math.sin(frame * 0.23);
  return (
    <AbsoluteFill>
      <Hall cam={cam} />
      <Layer d={1} cam={cam}>
        <g transform={`translate(${2 * KX} 0) scale(-1 1)`}><ThroneSeat x={KX} floor={FLOOR} s={1.1} /></g>
        <Actor seat="chair" x={KX} y={sitY(FLOOR - 110, 2)} s={2} outfit={KING_MAIN} pose={kingPose} flip mouth={km} mood={kingMood} />
        {new Array(gShow).fill(0).map((_, i) => <Actor key={i} x={ox - 170 - i * 140} y={FLOOR + (i % 2) * 14} s={2} outfit={GUARD} pose={{ ...STAND, head: 2 }} />)}
        {other && seated ? <rect x={ox - 70} y={FLOOR - 104} width={140} height={104} rx={8} fill="#5a3a26" stroke="#2b1d18" strokeWidth={5} opacity={sat} /> : null}
        {other ? <Actor seat={sat > 0.5 ? "chair" : undefined} x={ox} y={FLOOR + sat * (sitY(FLOOR - 104, s) - FLOOR)} s={s} outfit={CAST[other]} pose={oPose} mouth={om} mood={otherMood} /> : null}
      </Layer>
      <Layer d={1.25} cam={cam} blur={3}><rect x={-240} y={380} width={150} height={1300} fill="#170d16" /><rect x={2010} y={380} width={150} height={1300} fill="#170d16" /></Layer>
      <Grade color="#ff9a4a" opacity={0.16 + fire * 0.25 * flick} />
      {dark ? <Grade color="#000" opacity={dark} mode="multiply" /> : null}
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

/** The monk and the boy at the dwelling. Monk lines (or his echo) drive the mouth and the cuts. */
export const HutTalk: React.FC<{ echo?: string }> = ({ echo }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const from = useContext(Abs);
  const ids = echo ? [echo] : lineIds(from, from + dur, "M");
  const m = useMouth(...ids);
  const a = ids.length ? V.lines[ids[0]].f0 - from - 2 : dur;
  const e = ids.length ? V.lines[ids[ids.length - 1]].f1 - from : dur;
  const s = 2;
  const telling = !echo && frame < a - 6;
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 1015, 1150, 1.45), b: aim(vertical, 1015, 1150, 1.56) },
    { at: a, a: aim(vertical, 1170, 1085, 2.2), b: aim(vertical, 1170, 1080, 2.36) },
    { at: a + Math.round((e - a) * 0.38), a: aim(vertical, 860, 1100, 2.15), b: aim(vertical, 860, 1095, 2.3) },
    { at: a + Math.round((e - a) * 0.6), a: aim(vertical, 1170, 1085, 2.3), b: aim(vertical, 1170, 1080, 2.5) },
    { at: Math.max(a + 1, e + 4), a: aim(vertical, 1015, 1150, 1.5), b: aim(vertical, 1015, 1150, 1.58) },
  ], dur);
  const o = echo ? iv(frame, [0, 8, dur - 10, dur], [0, 1, 1, 0]) : 1;
  return (
    <AbsoluteFill style={{ opacity: o, filter: echo ? "sepia(0.55) blur(1.2px) brightness(1.08)" : undefined }}>
      <RoadBg cam={cam} sky="day" sunX={620} sunY={640} />
      <Layer d={1} cam={cam}>
        <Hut x={1420} />
        <Actor seat="ground" x={1170} y={sitY(FLOOR, s, true)} s={s} outfit={MONK_MAIN} flip mouth={m} mood={echo || frame > a + (e - a) * 0.3 ? "tight" : "smile"}
          pose={{ ...SITG, head: 3 + Math.sin(frame * 0.07) * 2, lean: 3, armRU: -28 - 40 * m, armRL: -56 - 30 * m }} />
        <Actor seat="ground" x={860} y={sitY(FLOOR, s * 0.9, true)} s={s * 0.9} outfit={BOY_MAIN} mouth={telling ? 0.3 + 0.3 * Math.sin(frame * 0.95) * Math.sin(frame * 0.21) : 0} mood={telling ? "smile" : "neutral"}
          pose={{ ...SITG, head: telling ? -8 : -5, armRU: telling ? -70 - 30 * Math.sin(frame * 0.3) : -28, armRL: telling ? -90 : -56 }} />
      </Layer>
      <Layer d={1} cam={cam}><Dust n={20} y0={900} y1={1400} opacity={0.3} seed="mk" /></Layer>
      <Vignette s={echo ? 0.75 : 0.4} />
    </AbsoluteFill>
  );
};

// ───────── Part 2: the beast, the stone, and the people going on their way ─────────
export const Beast: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const b1 = L("B1") - 2, n12 = L("N12"), b2 = L("B2") - 2, n13 = L("N13");
  const threw = Wd("N13", "threw"), fell = Wd("N13", "fell"), n14 = L("N14");
  const m = useMouth("B1", "B2");
  const fall = iv(frame, [fell - 2, fell + 12], [0, 1], easeOut);
  const pick = iv(frame, [n12 + 4, n12 + 22, n12 + 40], [0, 1, 0], ease);
  const hold = iv(frame, [n12 + 30, b2 + 10], [0, 1], ease);
  const fly = iv(frame, [threw, threw + 22], [0, 1], ease);
  const thrown = frame >= threw;
  const bx = 760;
  const boyPose: Pose = thrown
    ? { ...STAND, lean: 6, armRU: -60 + 40 * iv(frame, [threw, threw + 8], [0, 1]), armRL: -20 }
    : { ...STAND, lean: 10 * pick, head: 12 * pick - 4 * hold, armRU: 30 * pick - 130 * hold, armRL: -10 - 30 * hold, armLU: -10 * m, armLL: -30 * m };
  const cam = shook(shotCam(frame, [
    { at: 0, a: aim(vertical, 1150, 1050, 1.0), b: aim(vertical, 1250, 1030, 1.18) },
    { at: L("N11"), a: aim(vertical, 900, 1080, 1.25), b: aim(vertical, 860, 1060, 1.45) },
    { at: b1, a: aim(vertical, 770, 940, 2.1), b: aim(vertical, 770, 934, 2.3) },
    { at: b1 + 95, a: aim(vertical, 1380, 1000, 1.25), b: aim(vertical, 1400, 990, 1.4) },
    { at: b1 + 150, a: aim(vertical, 770, 940, 2.2), b: aim(vertical, 770, 934, 2.35) },
    { at: n12, a: aim(vertical, 800, 1220, 2.2), b: aim(vertical, 800, 1160, 2.0) },
    { at: b2, a: aim(vertical, 780, 930, 1.9), b: aim(vertical, 780, 924, 2.1) },
    { at: b2 + 100, a: aim(vertical, 1380, 1000, 1.3), b: aim(vertical, 1420, 990, 1.5) },
    { at: b2 + 170, a: aim(vertical, 780, 930, 2.1), b: aim(vertical, 780, 920, 2.35) },
    { at: n13, a: aim(vertical, 1050, 1060, 1.1), b: aim(vertical, 1150, 1050, 1.2) },
    { at: n14, a: aim(vertical, 1000, 1100, 1.15), b: aim(vertical, 1060, 1100, 1.25) },
  ], dur), frame, [fell + 6], 22);
  const breath = 1 + 0.025 * Math.sin(frame * 0.12);
  const pass = iv(frame, [n14, dur], [0, 1]);
  return (
    <AbsoluteFill>
      <RoadBg cam={cam} sky="day" sunX={520} sunY={640} />
      <Layer d={1} cam={cam}>
        {/* the beast: only a huge dark shape in the dust, so its kind is never clear */}
        <g transform={`translate(1560 ${FLOOR + 10 + fall * 250}) rotate(${fall * 9}) scale(${breath} ${breath * (1 - fall * 0.35)})`} style={{ filter: "blur(7px)" }}>
          <path d="M -430 0 Q -480 -380 -180 -500 Q 40 -600 250 -470 Q 480 -350 450 0 Z" fill="#1a120c" />
          <path d="M -470 0 Q -430 -250 -330 -300 Q -250 -480 -60 -520 Q 30 -620 170 -540 Q 360 -520 420 -330 Q 520 -200 500 0 Z" fill="#1a120c" opacity={0.85} />
        </g>
        <Dust n={46} y0={820} y1={1400} opacity={0.6} seed="bst" color="#b8956a" size={5} />
        <DustBurst x={1500} y={FLOOR} at={fell + 4} size={3.2} />
        {[0, 1, 2, 3].map((i) => <Actor key={i} x={300 - i * 110 + pass * (900 + i * 60)} y={FLOOR + (i % 2) * 16} s={1.9} outfit={FOLK(i + 1)} pose={pass > 0 ? walkPose(frame * 0.34 + i, 0.9) : { ...STAND, lean: -5, head: -8 }} mood={pass > 0 ? "smile" : "shock"} />)}
        <Actor x={bx} y={FLOOR} s={1.9} outfit={BOY_MAIN} pose={boyPose} mouth={m} mood={frame > fell ? "smile" : "neutral"} />
        {/* the stone */}
        {frame >= n12 + 22 && fly < 1 ? <circle cx={bx + 86 + fly * 640} cy={(thrown ? 900 : 1300 - hold * 400) - Math.sin(fly * Math.PI) * 120 + fly * 120} r={15} fill="#6b6257" stroke="#2b1d18" strokeWidth={4} /> : null}
      </Layer>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// ───────── The healings, told through bodies ─────────
export const Healing: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L } = useL();
  const n17 = L("N17");
  const seg = Math.max(1, Math.floor((dur - n17) / 3));
  const k = frame < n17 ? -1 : Math.min(2, Math.floor((frame - n17) / seg));
  const t = k < 0 ? 0 : iv(frame - n17 - k * seg, [8, seg * 0.6], [0, 1], ease);
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 830, 960, 1.9), b: aim(vertical, 830, 950, 2.2) },
    { at: n17, a: aim(vertical, 1000, 1090, 1.3), b: aim(vertical, 1030, 1090, 1.5) },
    { at: n17 + seg, a: aim(vertical, 1010, 1080, 1.45), b: aim(vertical, 1040, 1080, 1.65) },
    { at: n17 + 2 * seg, a: aim(vertical, 1000, 1100, 1.3), b: aim(vertical, 1040, 1090, 1.55) },
  ], dur);
  const sick: Pose[] = [
    { ...STAND, lean: 14 * (1 - t), head: 12 * (1 - t), armRU: -60 + 50 * t, armRL: -30 },
    { ...STAND, armRU: -70 - 20 * t, armRL: -80, armLU: -60 - 20 * t, armLL: -80, head: 14 - 20 * t },
    { ...STAND, head: -6 * t },
  ];
  return (
    <AbsoluteFill>
      <RoadBg cam={cam} sky={k === 1 ? "dusk" : k === 2 ? "dawn" : "day"} sunX={[620, 520, 1400, 620][k + 1]} sunY={[640, 900, 880, 640][k + 1]} />
      <Layer d={1} cam={cam}>
        <Defs />
        <Glow x={830} y={1000} r={380} o={0.35 + 0.25 * t} />
        <Actor x={830} y={FLOOR} s={1.9} outfit={BOY_MAIN} pose={{ ...STAND, armRU: -62, armRL: -38, armLU: -50, armLL: -40, head: -4 }} mood="smile" />
        {k === 0 ? <line x1={1235 + t * 120} y1={FLOOR - 300 + t * 280} x2={1290 + t * 220} y2={FLOOR} stroke="#5a3a22" strokeWidth={12} strokeLinecap="round" /> : null}
        {k === 2 ? <rect x={1040} y={FLOOR - 70} width={420} height={70} rx={10} fill="#7a5632" stroke="#2b1d18" strokeWidth={5} /> : null}
        {k >= 0 ? (
          <g transform={k === 2 ? `translate(1200 ${FLOOR - 70 * (1 - t)}) rotate(${-84 * (1 - t)})` : `translate(1180 ${FLOOR})`}>
            <Actor x={0} y={0} s={2} outfit={FOLK(k + 4)} pose={sick[k]} flip mood={t > 0.7 ? "smile" : "frown"} />
          </g>
        ) : null}
      </Layer>
      <Layer d={1} cam={cam}><Dust n={24} y0={900} y1={1400} opacity={0.35} seed="hl" /></Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// ───────── The king's blind companion comes with gifts ─────────
export const CompanionComes: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const c1 = L("C1") - 2, b3 = L("B3") - 2, n20 = L("N20"), sight = Wd("N20", "sight");
  const cm = useMouth("C1"), bm = useMouth("B3");
  const walkT = iv(frame, [0, 110], [0, 1], easeOut);
  const cx = 1560 - walkT * 380;
  const healed = iv(frame, [sight - 4, sight + 16], [0, 1], ease);
  const look = healed * Math.sin((frame - sight) * 0.09) * 14;
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 1150, 1090, 1.05), b: aim(vertical, 1050, 1090, 1.25) },
    { at: 140, a: aim(vertical, 1380, 1150, 1.5), b: aim(vertical, 1320, 1120, 1.7) },
    { at: c1, a: aim(vertical, 1170, 920, 2.0), b: aim(vertical, 1170, 914, 2.2) },
    { at: L("N19"), a: aim(vertical, 1000, 1080, 1.4), b: aim(vertical, 1000, 1080, 1.5) },
    { at: b3, a: aim(vertical, 835, 940, 2.0), b: aim(vertical, 835, 934, 2.2) },
    { at: b3 + 110, a: aim(vertical, 1170, 920, 2.1), b: aim(vertical, 1170, 914, 2.25) },
    { at: b3 + 170, a: aim(vertical, 835, 940, 2.15), b: aim(vertical, 835, 930, 2.35) },
    { at: n20, a: aim(vertical, 1000, 1080, 1.35), b: aim(vertical, 1020, 1070, 1.5) },
    { at: sight - 6, a: aim(vertical, 1170, 930, 1.9), b: aim(vertical, 1170, 920, 2.3) },
  ], dur);
  const walking = walkT < 1;
  return (
    <AbsoluteFill>
      <RoadBg cam={cam} sky="day" sunX={620} sunY={640} />
      <Layer d={1} cam={cam}>
        <Defs />
        {healed > 0 ? <Glow x={1180} y={940} r={420} o={0.5 * healed} /> : null}
        {[0, 1].map((i) => <g key={i} transform={`translate(${cx + 330 + i * 150} ${FLOOR})`}><rect x={-56} y={-84} width={112} height={84} rx={8} fill="#7a4a22" stroke="#2b1d18" strokeWidth={5} /><rect x={-56} y={-84} width={112} height={26} rx={8} fill="#c9952e" stroke="#2b1d18" strokeWidth={5} /></g>)}
        <Actor x={cx + 190} y={FLOOR} s={1.9} outfit={FOLK(3)} pose={walking ? walkPose(frame * 0.3 + 1, 0.6) : { ...STAND, armRU: -40 * (1 - healed), armRL: -30 }} flip />
        {/* his cane: dropped the moment he can see */}
        <line x1={cx - 70 - healed * 60} y1={FLOOR - 200 + healed * 190} x2={cx - 100 + healed * 120} y2={FLOOR} stroke="#5a3a22" strokeWidth={11} strokeLinecap="round" />
        <Actor x={cx} y={FLOOR} s={2} outfit={COMPANION_MAIN} flip mouth={cm} mood={healed > 0.5 ? "shock" : "tight"}
          pose={walking ? walkPose(frame * 0.3, 0.6) : { ...STAND, head: (1 - healed) * 8 + look, armRU: -50 * (1 - healed) - 20 * cm, armRL: -40 * (1 - healed), armLU: -70 * healed, armLL: -60 * healed }} />
        <Actor x={820} y={FLOOR} s={1.9} outfit={BOY_MAIN} mouth={bm} mood={frame > n20 ? "smile" : "neutral"}
          pose={{ ...STAND, head: -5, armRU: -20 - 40 * bm - (frame > n20 && healed < 1 ? 60 : 0), armRL: -20 - 30 * bm, armLU: frame > n20 && healed < 1 ? -60 : 8, armLL: -30 }} />
      </Layer>
      <Layer d={1} cam={cam}><Dust n={20} y0={900} y1={1400} opacity={0.3} seed="cc" /></Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// ───────── Part 3: behind a closed door; shadows on a wall; one left ─────────
export const Door: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const close = iv(frame, [10, 44], [0, 1], Math.sqrt);
  const cam = shook(shotCam(frame, [{ at: 0, a: aim(vertical, 960, 1020, 1.05), b: aim(vertical, 960, 1000, 1.3) }], dur), frame, [44], 14);
  return (
    <AbsoluteFill style={{ background: "#120a0e" }}>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-600} y={200} width={3200} height={1300} fill="#2a1a22" />
        <rect x={560} y={420} width={800} height={920} fill="#ffb347" opacity={0.5 * (1 - close)} />
        <rect x={560 - 400 * (1 - close)} y={420} width={400} height={920} fill="#4a2c1c" stroke="#1a0f0a" strokeWidth={10} />
        <rect x={960 + 400 * (1 - close)} y={420} width={400} height={920} fill="#4a2c1c" stroke="#1a0f0a" strokeWidth={10} />
        {[520, 760, 1000, 1240].map((y, i) => <rect key={i} x={540} y={y} width={840 * close} height={16} fill="#2b1d18" opacity={close} />)}
        <path d="M 520 420 Q 960 250 1400 420" stroke="#3b2433" strokeWidth={46} fill="none" />
        <Torch2 x={380} y={900} seed={2} s={1.2} /><Torch2 x={1540} y={900} seed={6} s={1.2} />
        <rect x={-600} y={FLOOR} width={3200} height={1300} fill="#1c1118" />
        {[0, 1].map((i) => <Actor key={i} x={i ? 1480 : 440} y={FLOOR} s={2} outfit={GUARD} flip={!!i} />)}
      </Layer>
      <Grade color="#000" opacity={0.25 + 0.3 * close} mode="multiply" />
      <Vignette s={0.75} />
    </AbsoluteFill>
  );
};
/** A death, never shown: two shadows on the wall, then a lamp going out. */
export const LampOut: React.FC<{ victim: Who; word: string; line: string }> = ({ victim, word, line }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { Wd } = useL();
  const out = Wd(line, word);
  const step = iv(frame, [0, out - 6], [0, 1]);
  const lampShot = frame >= out - 8;
  const flick = 1 + 0.12 * Math.sin(frame * 0.6);
  const lit = frame < out + 4 ? 1 : 0;
  const v: Outfit = victim === "monk" ? { ...SHADOW, beard: "#120a06", wrap: "#120a06" } : { ...SHADOW, wrap: "#120a06", beard: "#120a06" };
  const cam = shotCam(frame, [{ at: 0, a: aim(vertical, 1000, 1050, 1.1), b: aim(vertical, 1020, 1040, 1.3) }, { at: out - 8, a: aim(vertical, 960, 900, 2.0), b: aim(vertical, 960, 890, 2.4) }], dur);
  return (
    <AbsoluteFill style={{ background: "#0a0605" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #b9652a 0%, #2c150a 70%)", opacity: lit }} />
      <Layer d={1} cam={cam} opacity={lit}>
        <Defs />
        {new Array(7).fill(0).map((_, i) => <rect key={i} x={-600} y={420 + i * 170} width={3200} height={5} fill="#000" opacity={0.14} />)}
        {lampShot ? (
          <g>
            <Glow x={960} y={880} r={420 * flick} id="glowO" o={0.8} />
            <path d="M 880 960 Q 960 900 1040 960 Z" fill="#7a4a22" stroke="#2b1d18" strokeWidth={5} />
            <g transform={`translate(960 912) scale(${flick})`}><path d="M -16 0 Q -20 -40 0 -78 Q 20 -40 16 0 Z" fill="#ffb347" /><path d="M -7 0 Q -9 -24 0 -46 Q 9 -24 7 0 Z" fill="#fff3c4" /></g>
          </g>
        ) : (
          <g opacity={0.82} transform="translate(0 40) skewX(-6)">
            <Actor x={840} y={1500} s={2.9} outfit={v} pose={{ ...STAND, head: -4 }} blur={3} />
            <Actor x={1560 - step * 330} y={1500} s={3.1} outfit={{ ...SHADOW, spear: true }} pose={walkPose(frame * 0.2, 0.5)} flip blur={3} />
          </g>
        )}
      </Layer>
      <Vignette s={0.75} />
    </AbsoluteFill>
  );
};
export const Alone: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const cam = shotCam(frame, [{ at: 0, a: aim(vertical, 1250, 1080, 1.1), b: aim(vertical, 900, 1000, 1.9) }], dur);
  return (
    <AbsoluteFill>
      <Hall cam={cam} />
      <Layer d={1} cam={cam}><Actor x={880} y={FLOOR} s={1.8} outfit={BOY_MAIN} pose={{ ...STAND, head: -3 + Math.sin(frame * 0.05) }} mood="neutral" /></Layer>
      <Grade color="#000" opacity={0.3} mode="multiply" />
      <Vignette s={0.8} />
    </AbsoluteFill>
  );
};
