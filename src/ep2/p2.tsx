import React, { useContext } from "react";
import { AbsoluteFill } from "remotion";
import { STAND, SIT, blend, Pose, Outfit, Mood } from "../cartoon/Rig";
import { FOLK, GUARD } from "../cartoon/Trailer";
import { KING_MAIN, BOY_MAIN, MONK_MAIN, COMPANION_MAIN, SHADOW } from "./cast";
import { Abs, Actor, sitY, useMouth, useTalk, walkBy, Cane, Sword, Stone, Gift, HandSpots, V, Cam, Layer, Defs, iv, ease, easeOut, useShot, useView, aim, Dust, DustBurst, Grade, Vignette, Glow, Torch2, ThroneSeat, SITG } from "./kit";
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
  leanAt?: string; closer?: string; holdKing?: string; endOnKing?: number; fire?: number; shockUntilSpeaks?: boolean;
}> = ({ other, seated, enter, guards = 0, guardsAt, dark = 0, kingMood = "tight", otherMood = "neutral", leanAt, closer, holdKing, endOnKing, fire = 0, shockUntilSpeaks }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const from = useContext(Abs);
  const { L } = useL();
  const kIds = lineIds(from, from + dur, "K");
  const oIds = other ? lineIds(from, from + dur, PRE[other]) : [];
  const km = useMouth(...kIds);
  const om = useMouth(...oIds);
  const kt = useTalk(...kIds);
  const ot = useTalk(...oIds);
  const sway = Math.sin(frame * 0.07);
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
  const kingPose: Pose = { ...SIT, lean: -9 * lean, head: 2 + Math.sin(frame * 0.04) * 1.5, armRU: -25 - 10 * kt - 4 * kt * sway, armRL: -45 };
  const walking = enter && walkT < 1;
  const oPose: Pose = sat > 0 ? blend(STAND, SIT, sat) : walking ? walkBy(ox, s) : { ...STAND, head: -4, armRU: -8 - 20 * ot - 5 * ot * sway, armRL: -6 - 34 * ot };
  const gShow = guards && (!guardsAt || frame >= L(guardsAt)) ? guards : 0;
  const flick = 0.5 + 0.5 * Math.sin(frame * 0.7) * Math.sin(frame * 0.23);
  return (
    <AbsoluteFill>
      <Hall cam={cam} />
      <Layer d={1} cam={cam}>
        <g transform={`translate(${2 * KX} 0) scale(-1 1)`}><ThroneSeat x={KX} floor={FLOOR} s={1.1} /></g>
        <Actor seat="chair" x={KX} y={sitY(FLOOR - 110, 2)} s={2} outfit={KING_MAIN} pose={kingPose} flip mouth={km} mood={shockUntilSpeaks ? (kIds.length && frame >= V.lines[kIds[0]].f0 - from - 2 ? "frown" : "shock") : kingMood} />
        {new Array(gShow).fill(0).map((_, i) => {
          const gt = guardsAt ? iv(frame, [L(guardsAt) + i * 6, L(guardsAt) + 46 + i * 6], [0, 1], easeOut) : 1;
          const gx = ox - 170 - i * 140 - (1 - gt) * 760;
          return <Actor key={i} x={gx} y={FLOOR + (i % 2) * 14} s={2} outfit={GUARD} pose={gt < 1 ? walkBy(gx, 2) : { ...STAND, head: 2 }} />;
        })}
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
  const tk = useTalk(...ids);
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
          pose={{ ...SITG, head: 3 + Math.sin(frame * 0.07) * 2, lean: 3, armRU: -28 - 16 * tk - 5 * tk * Math.sin(frame * 0.07), armRL: -56 - 12 * tk }} />
        <Actor seat="ground" x={860} y={sitY(FLOOR, s * 0.9, true)} s={s * 0.9} outfit={BOY_MAIN} mouth={telling ? 0.3 + 0.3 * Math.sin(frame * 0.95) * Math.sin(frame * 0.21) : 0} mood={telling ? "smile" : "neutral"}
          pose={{ ...SITG, head: telling ? -8 : -5, armRU: telling ? -44 - 8 * Math.sin(frame * 0.08) : -28, armRL: telling ? -80 : -56 }} />
      </Layer>
      <Layer d={1} cam={cam}><Dust n={20} y0={900} y1={1400} opacity={0.3} seed="mk" /></Layer>
      <Vignette s={echo ? 0.75 : 0.4} />
    </AbsoluteFill>
  );
};

// ───────── Part 2: the beast (never on camera, only its shadow), the stone, the people going on their way ─────────
export const Beast: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const b1 = L("B1") - 2, n12 = L("N12"), b2 = L("B2") - 2, n13 = L("N13");
  const threw = Wd("N13", "threw"), fell = Wd("N13", "fell"), n14 = L("N14");
  const m = useMouth("B1", "B2");
  const tk = useTalk("B1", "B2");
  const bx = 800;
  const bend = iv(frame, [n12 + 2, n12 + 16, n12 + 22, n12 + 38], [0, 1, 1, 0], ease);   // he bends, takes the stone, stands
  const has = frame >= n12 + 18 && frame < threw + 5;
  const wind = iv(frame, [threw - 10, threw, threw + 5, threw + 14], [0, 1, -0.4, 0], ease);
  const fall = iv(frame, [fell - 2, fell + 12], [0, 1], easeOut);
  const fly = iv(frame, [threw + 5, threw + 19], [0, 1]);
  const raised = has && frame > n12 + 38 ? 1 : 0;
  const boyPose: Pose = {
    ...STAND, bob: 44 * bend, lean: 24 * bend - 6 * wind, head: 14 * bend - 4, legLU: -30 * bend, legLL: 60 * bend, legRU: -40 * bend, legRL: 70 * bend,
    armRU: 10 * bend - 46 * raised * (1 - bend) - 110 * Math.max(0, wind) + 30 * Math.max(0, -wind) - 6 * tk * (1 - raised),
    armRL: -8 - 62 * raised * (1 - bend) - 30 * Math.max(0, wind), armLU: 8 + 10 * bend, armLL: -6,
  };
  const cam = shook(shotCam(frame, [
    { at: 0, a: aim(vertical, 1120, 1060, 1.0), b: aim(vertical, 1200, 1040, 1.15) },
    { at: L("N11"), a: aim(vertical, 900, 1080, 1.25), b: aim(vertical, 860, 1060, 1.45) },
    { at: b1, a: aim(vertical, 810, 930, 2.0), b: aim(vertical, 810, 924, 2.2) },
    { at: b1 + 95, a: aim(vertical, 1250, 1040, 1.2), b: aim(vertical, 1300, 1030, 1.35) },
    { at: b1 + 150, a: aim(vertical, 810, 930, 2.1), b: aim(vertical, 810, 924, 2.25) },
    { at: n12, a: aim(vertical, 850, 1180, 1.9), b: aim(vertical, 850, 1120, 1.7) },
    { at: b2, a: aim(vertical, 830, 950, 1.8), b: aim(vertical, 830, 944, 2.0) },
    { at: b2 + 100, a: aim(vertical, 1250, 1040, 1.25), b: aim(vertical, 1300, 1030, 1.4) },
    { at: b2 + 170, a: aim(vertical, 830, 950, 2.0), b: aim(vertical, 830, 940, 2.2) },
    { at: n13, a: aim(vertical, 1050, 1060, 1.1), b: aim(vertical, 1150, 1050, 1.2) },
    { at: n14, a: aim(vertical, 1000, 1100, 1.15), b: aim(vertical, 1060, 1100, 1.25) },
  ], dur), frame, [fell + 6], 22);
  const breath = 1 + 0.03 * Math.sin(frame * 0.12);
  const pass = iv(frame, [n14, dur], [0, 1]);
  const edge = 1280 + fall * 1500;
  return (
    <AbsoluteFill>
      <RoadBg cam={cam} sky="day" sunX={520} sunY={640} />
      <Layer d={1} cam={cam}>
        {/* the beast is never seen: only its huge shadow, cast from off screen, until it falls */}
        <g style={{ filter: "blur(18px)" }} opacity={0.62 * (1 - fall * 0.8)}>
          <path d={`M ${edge} ${FLOOR - 20} Q ${edge + 60} ${520 - 60 * breath + fall * 700} ${edge + 520} ${420 - 80 * breath + fall * 800} L 4200 300 L 4200 2800 L ${edge - 520} 2800 Z`} fill="#140c07" />
        </g>
        <Dust n={46} y0={820} y1={1400} opacity={0.5} seed="bst" color="#b8956a" size={5} />
        <DustBurst x={1700} y={FLOOR} at={fell + 4} size={3.4} />
        {[0, 1, 2, 3].map((i) => {
          const x = 330 - i * 110 + pass * (1500 + i * 60);
          return <Actor key={i} x={x} y={FLOOR + (i % 2) * 16} s={1.9} outfit={FOLK(i + 1)} pose={pass > 0 ? walkBy(x, 1.9) : { ...STAND, lean: -5, head: -8 }} mood={pass > 0 ? "smile" : "shock"} />;
        })}
        {frame < n12 + 18 ? <g transform={`translate(${bx + 96} ${FLOOR - 12})`}><circle r={16} fill="#6b6257" stroke="#2b1d18" strokeWidth={4} /></g> : null}
        <Actor x={bx} y={FLOOR} s={1.9} outfit={BOY_MAIN} pose={boyPose} mouth={m} mood={frame > fell ? "smile" : "neutral"} hold={has ? <Stone /> : undefined} />
        {frame >= threw + 5 && fly < 1 ? <circle cx={bx + 150 + fly * 1500} cy={FLOOR - 430 - Math.sin(fly * Math.PI) * 90 + fly * 150} r={16} fill="#6b6257" stroke="#2b1d18" strokeWidth={4} /> : null}
      </Layer>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// ───────── The healings: a blind man, a leper, a sick man ─────────
export const Healing: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L } = useL();
  const n17 = L("N17");
  const seg = Math.max(1, Math.floor((dur - n17) / 3));
  const k = frame < n17 ? -1 : Math.min(2, Math.floor((frame - n17) / seg));
  const local = frame - n17 - k * seg;
  const t = k < 0 ? 0 : iv(local, [seg * 0.35, seg * 0.6], [0, 1], ease);
  const tap = Math.sin(frame * 0.35) * 8 * (1 - t);
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 830, 960, 1.9), b: aim(vertical, 830, 950, 2.2) },
    { at: n17, a: aim(vertical, 1010, 1080, 1.35), b: aim(vertical, 1040, 1070, 1.55) },
    { at: n17 + seg, a: aim(vertical, 1020, 1070, 1.45), b: aim(vertical, 1100, 1010, 1.9) },
    { at: n17 + 2 * seg, a: aim(vertical, 1010, 1090, 1.35), b: aim(vertical, 1040, 1080, 1.55) },
  ], dur);
  const poses: Pose[] = [
    { ...STAND, lean: 8 * (1 - t), head: 6 * (1 - t) - 8 * t, armRU: -38 - tap + 30 * t, armRL: -30 + 24 * t, armLU: -50 * (1 - t), armLL: -40 * (1 - t) },
    { ...STAND, head: 14 - 18 * t, armRU: -64, armRL: -70, armLU: -54, armLL: -70 },
    { ...STAND, lean: 22 * (1 - t), head: 16 * (1 - t) - 4 * t, armRU: 6 - 10 * t, armRL: -110 * (1 - t), armLU: 0, armLL: -100 * (1 - t) },
  ];
  const sick = k < 0 ? null : { ...FOLK(k + 4), glasses: k === 0 && t < 0.5, spots: k === 1 ? 1 - t : 0 };
  return (
    <AbsoluteFill>
      <RoadBg cam={cam} sky={k === 1 ? "dusk" : k === 2 ? "dawn" : "day"} sunX={[620, 620, 520, 1400][k + 1]} sunY={[640, 640, 900, 880][k + 1]} />
      <Layer d={1} cam={cam}>
        <Defs />
        <Glow x={830} y={1000} r={380} o={0.3 + 0.3 * t} />
        <Actor x={830} y={FLOOR} s={1.9} outfit={BOY_MAIN} pose={{ ...STAND, armRU: -52, armRL: -36, armLU: -40, armLL: -36, head: -4 }} mood="smile" />
        {k === 0 && t >= 0.5 ? <line x1={1090} y1={FLOOR - 8} x2={1290} y2={FLOOR - 4} stroke="#5a3a22" strokeWidth={11} strokeLinecap="round" /> : null}
        {sick ? <Actor x={1190} y={FLOOR} s={2} outfit={sick} pose={poses[k]} flip mood={t > 0.7 ? "smile" : "frown"} hold={k === 0 && t < 0.5 ? <Cane /> : k === 1 ? <HandSpots o={1 - t} /> : undefined} /> : null}
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
  const ct = useTalk("C1"), bt = useTalk("B3");
  const walkT = iv(frame, [0, 110], [0, 1]);
  const cx = 1700 - walkT * 520;
  const healed = iv(frame, [sight - 4, sight + 16], [0, 1], ease);
  const look = healed * Math.sin((frame - sight) * 0.09) * 14;
  const walking = walkT < 1;
  const tap = walking ? Math.sin(cx * 0.05) * 10 : Math.sin(frame * 0.2) * 3 * (1 - healed);
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 1250, 1090, 1.05), b: aim(vertical, 1050, 1090, 1.25) },
    { at: 140, a: aim(vertical, 1380, 1150, 1.5), b: aim(vertical, 1320, 1120, 1.7) },
    { at: c1, a: aim(vertical, 1170, 920, 2.0), b: aim(vertical, 1170, 914, 2.2) },
    { at: L("N19"), a: aim(vertical, 1000, 1080, 1.4), b: aim(vertical, 1000, 1080, 1.5) },
    { at: b3, a: aim(vertical, 835, 940, 2.0), b: aim(vertical, 835, 934, 2.2) },
    { at: b3 + 110, a: aim(vertical, 1170, 920, 2.1), b: aim(vertical, 1170, 914, 2.25) },
    { at: b3 + 170, a: aim(vertical, 835, 940, 2.15), b: aim(vertical, 835, 930, 2.35) },
    { at: n20, a: aim(vertical, 1000, 1080, 1.35), b: aim(vertical, 1020, 1070, 1.5) },
    { at: sight - 6, a: aim(vertical, 1170, 930, 1.9), b: aim(vertical, 1170, 920, 2.3) },
  ], dur);
  const blind = healed < 0.5;
  return (
    <AbsoluteFill>
      <RoadBg cam={cam} sky="day" sunX={620} sunY={640} />
      <Layer d={1} cam={cam}>
        <Defs />
        {healed > 0 ? <Glow x={1180} y={940} r={420} o={0.5 * healed} /> : null}
        {/* two servants walk behind him, each carrying a wrapped gift */}
        {[0, 1].map((i) => {
          const sx = cx + 330 + i * 250;
          return <Actor key={i} x={sx} y={FLOOR} s={1.9} outfit={FOLK(3 + i * 4)} flip hold={<Gift c={i ? "#1f6f5c" : "#9b1b26"} />}
            pose={walking ? { ...walkBy(sx, 1.9, 0.6), armRU: -46, armRL: -62 } : { ...STAND, armRU: -46, armRL: -62 }} />;
        })}
        {!blind ? <line x1={cx - 150} y1={FLOOR - 6} x2={cx + 60} y2={FLOOR - 2} stroke="#5a3a22" strokeWidth={11} strokeLinecap="round" /> : null}
        <Actor x={cx} y={FLOOR} s={2} outfit={{ ...COMPANION_MAIN, glasses: blind }} flip mouth={cm} mood={healed > 0.5 ? "shock" : "tight"} hold={blind ? <Cane /> : undefined}
          pose={walking ? { ...walkBy(cx, 2, 0.6), armRU: -40 - tap, armRL: -28 } : { ...STAND, head: (1 - healed) * 8 + look, armRU: (-40 - tap) * (1 - healed) - 8 * ct, armRL: -28 * (1 - healed), armLU: -50 * healed, armLL: -60 * healed }} />
        <Actor x={820} y={FLOOR} s={1.9} outfit={BOY_MAIN} mouth={bm} mood={frame > n20 ? "smile" : "neutral"}
          pose={{ ...STAND, head: -5, armRU: -14 - 22 * bt - 5 * bt * Math.sin(frame * 0.07) - (frame > n20 && healed < 1 ? 40 : 0), armRL: -14 - 30 * bt, armLU: frame > n20 && healed < 1 ? -44 : 8, armLL: -30 }} />
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
/** A killing, seen only as shadows on the wall: the sword is raised, falls, and one shadow drops. */
export const Execution: React.FC<{ victim: Who; word: string; line: string }> = ({ victim, word, line }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { Wd } = useL();
  const strike = Wd(line, word) + 4;
  const stepIn = iv(frame, [0, strike - 30], [0, 1], easeOut);
  const raise = iv(frame, [strike - 34, strike - 8], [0, 1], ease);
  const swing = iv(frame, [strike - 3, strike + 1], [0, 1]);
  const drop = iv(frame, [strike, strike + 12], [0, 1], easeOut);
  const v: Outfit = { ...SHADOW, wrap: "#120a06", beard: "#120a06" };
  const cam = shook(shotCam(frame, [
    { at: 0, a: aim(vertical, 1040, 1050, 1.05), b: aim(vertical, 1050, 1040, 1.25) },
    { at: strike - 34, a: aim(vertical, 1060, 1000, 1.45), b: aim(vertical, 1060, 990, 1.6) },
    { at: strike + 2, a: aim(vertical, 1040, 1080, 1.2), b: aim(vertical, 1040, 1120, 1.5) },
  ], dur), frame, [strike], 26);
  const ex = 1560 - stepIn * 300;
  void victim;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 40% 50%, #c26a2a 0%, #2c150a 70%)" }}>
      <Layer d={0.9} cam={cam}>
        <Defs />
        {new Array(7).fill(0).map((_, i) => <rect key={i} x={-600} y={420 + i * 170} width={3200} height={5} fill="#000" opacity={0.14} />)}
        <g opacity={0.85} transform="translate(0 40) skewX(-6)">
          {/* the one who refused, on his knees; after the blow his shadow drops out of the light */}
          <g transform={`translate(900 ${1500 + drop * 190}) rotate(${-78 * drop})`}>
            <Actor x={0} y={0} s={2.9} outfit={v} pose={{ ...STAND, bob: 62, head: -6, legLU: -14, legLL: 104, legRU: -24, legRL: 112, armRU: 22, armRL: 30, armLU: 26, armLL: 30 }} blur={3} />
          </g>
          <Actor x={ex} y={1500} s={3.2} outfit={SHADOW} flip blur={3} hold={<Sword />}
            pose={stepIn < 1 ? { ...walkBy(ex, 3.2, 0.6), armRU: -30, armRL: -40 } : { ...STAND, lean: 10 * swing, armRU: -30 - 150 * raise + 150 * swing, armRL: -40 + 20 * raise - 30 * swing, armLU: -20 - 120 * raise + 110 * swing, armLL: -40 }} />
        </g>
      </Layer>
      <Layer d={1} cam={cam}><rect x={-1400} y={1500} width={4800} height={1200} fill="#1c110b" /></Layer>
      <AbsoluteFill style={{ backgroundColor: "#8f1408", opacity: iv(frame, [strike, strike + 2, strike + 14], [0, 0.55, 0]) }} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: iv(frame, [strike + 26, dur], [0, 0.6]) }} />
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
