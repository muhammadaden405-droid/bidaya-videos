import React, { useContext } from "react";
import { AbsoluteFill } from "remotion";
import { STAND, SIT, walkPose, blend, Pose, Outfit } from "../cartoon/Rig";
import { FOLK } from "../cartoon/Trailer";
import { KING_MAIN, SORCERER_MAIN, BOY_MAIN, MONK_MAIN, SHADOW, SHADOW_SORCERER } from "./cast";
import {
  Abs, Actor, sitY, useMouth, lf, le, wf,
  Cam, Layer, Defs, Sky, SKIES, iv, ease, easeOut, useShot, useView, lerpCam, aim, ridge, Dust, Grade, Vignette, Glow, Torch2, ThroneSeat, SITG, shakeAt,
} from "./kit";

// Episode 2 — cold open and Part 1 ("Two teachers"). Every beat is placed on the spoken word it belongs to.
export const FLOOR = 1340;
export const useL = () => {
  const from = useContext(Abs);
  return { L: (id: string, off = 0) => lf(id, off) - from, Wd: (id: string, w: string, n = 0) => wf(id, w, n) - from, End: (id: string) => le(id) - from };
};
export type Shot = { at: number; a: Cam; b?: Cam };
/** hard cuts between shots; each shot drifts slowly from a to b so the frame never sits still */
export const shotCam = (frame: number, shots: Shot[], end: number): Cam => {
  let i = 0;
  for (let k = 0; k < shots.length; k++) if (frame >= shots[k].at) i = k;
  const s = shots[i];
  const nxt = i + 1 < shots.length ? shots[i + 1].at : end;
  return s.b ? lerpCam((frame - s.at) / Math.max(1, nxt - s.at), s.a, s.b, (t) => t) : s.a;
};
export const shook = (cam: Cam, frame: number, hits: number[], amp = 14): Cam => {
  const s = shakeAt(frame, hits, amp);
  return { ...cam, x: cam.x + s.x, y: cam.y + s.y };
};

// ───────── Cold open: the sorcerer by his lamp, then the flame goes out ─────────
export const ColdOpen: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const m = useMouth("S1");
  const send = Wd("S1", "send");
  const n1 = L("N01");
  const out = dur - 18;
  const shiver = frame > n1 ? 0.13 * Math.sin(frame * 2.3) : 0;
  const flick = 1 + 0.1 * Math.sin(frame * 0.55) + 0.05 * Math.sin(frame * 1.7) + shiver;
  const lit = frame >= out ? 0 : 1;
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 1010, 1160, 2.0), b: aim(vertical, 900, 1060, 1.3) },
    { at: send, a: aim(vertical, 800, 1040, 1.75), b: aim(vertical, 800, 1030, 1.95) },
    { at: n1, a: aim(vertical, 960, 1090, 1.35), b: aim(vertical, 1090, 1160, 2.5) },
  ], dur);
  const pose: Pose = { ...STAND, lean: 6, head: 4 + Math.sin(frame * 0.05) * 2, armRU: 4, armRL: -84, armLU: 10, armLL: -10 };
  return (
    <AbsoluteFill style={{ background: "#060303" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 56% 60%, #56301a 0%, #1d110b 44%, #060303 100%)", opacity: lit }} />
      <Layer d={0.35} cam={cam} opacity={lit}>
        {new Array(5).fill(0).map((_, i) => <rect key={i} x={-200} y={520 + i * 170} width={2400} height={9} fill="#2a1a10" />)}
        {new Array(14).fill(0).map((_, i) => <rect key={i} x={160 + i * 125} y={450 + (i % 3) * 170} width={46} height={70} rx={10} fill="#33200f" />)}
      </Layer>
      <Layer d={1} cam={cam} opacity={lit}>
        <Defs />
        <Glow x={1090} y={1180} r={620 * flick} id="glowO" o={0.75} />
        <Actor x={720} y={1730} s={3.2} outfit={SORCERER_MAIN} pose={pose} mouth={m} mood="sneer" />
        <rect x={-400} y={1262} width={2800} height={900} fill="#2a180e" />
        <rect x={-400} y={1262} width={2800} height={26} fill="#4d2e19" />
        {/* the old hand resting on the table */}
        <path d="M 760 1262 L 880 1232 L 900 1262 Z" fill="#1f1828" stroke="#2b1d18" strokeWidth={5} />
        <g transform="translate(912 1250)">
          <path d="M -34 12 Q -40 -14 -6 -16 L 34 -12 Q 58 -8 58 4 Q 58 12 40 12 Z" fill="#8f7f72" stroke="#2b1d18" strokeWidth={5} strokeLinejoin="round" />
          {[4, 20, 36].map((x, i) => <path key={i} d={`M ${x} -11 L ${x + 6} 10`} stroke="#2b1d18" strokeWidth={3} />)}
        </g>
        {/* oil lamp and flame */}
        <path d="M 1000 1264 Q 1090 1196 1180 1264 Z" fill="#7a4a22" stroke="#2b1d18" strokeWidth={5} />
        <g transform={`translate(1090 1212) scale(${flick})`}>
          <path d="M -20 0 Q -26 -50 0 -96 Q 26 -50 20 0 Z" fill="#ffb347" />
          <path d="M -9 0 Q -12 -30 0 -58 Q 12 -30 9 0 Z" fill="#fff3c4" />
        </g>
      </Layer>
      <Vignette s={0.78} />
    </AbsoluteFill>
  );
};

// ───────── The palace: the king, his sorcerer, and the boy who is sent ─────────
export const Hall: React.FC<{ cam: Cam }> = ({ cam }) => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(#1a0f1c 0%, #3a2030 55%, #54303a 100%)" }} />
    <Layer d={0.5} cam={cam}>
      <Defs />
      {[80, 520, 1400, 1840].map((x, i) => (
        <g key={i}>
          <rect x={x - 46} y={300} width={92} height={1060} fill="#2c1a26" />
          <rect x={x - 62} y={300} width={124} height={40} fill="#3b2433" />
        </g>
      ))}
      <path d="M 520 340 Q 960 120 1400 340" stroke="#3b2433" strokeWidth={34} fill="none" />
      <rect x={1150} y={470} width={220} height={520} fill="#6a1626" />
      <path d="M 1150 990 L 1260 930 L 1370 990 Z" fill="#3a2030" />
      <Torch2 x={700} y={880} seed={1} s={1.2} />
      <Torch2 x={1660} y={880} seed={4} s={1.2} />
    </Layer>
    <Layer d={1} cam={cam}>
      <rect x={-1400} y={FLOOR - 4} width={4800} height={1400} fill="#3a2530" />
      <rect x={-1400} y={FLOOR - 4} width={4800} height={10} fill="#5b3c48" />
      <path d={`M 700 ${FLOOR + 6} L 1700 ${FLOOR + 6} L 1900 ${FLOOR + 320} L 500 ${FLOOR + 320} Z`} fill="#6a1626" opacity={0.75} />
    </Layer>
  </>
);
export const ThroneRoom: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L } = useL();
  const n3 = L("N03");
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 1000, 1090, vertical ? 1.05 : 1.0), b: aim(vertical, 1030, 1090, 1.16) },
    { at: n3, a: aim(vertical, vertical ? 880 : 900, 1110, vertical ? 1.0 : 1.25), b: aim(vertical, 860, 1110, vertical ? 1.06 : 1.4) },
  ], dur);
  const walkT = iv(frame, [n3 + 4, n3 + 60], [0, 1], easeOut);
  const walking = walkT > 0 && walkT < 1;
  const point = iv(frame, [n3 - 2, n3 + 12], [0, 1], easeOut);
  const kingPose: Pose = { ...SIT, head: 2 + Math.sin(frame * 0.04) * 1.5, armRU: -25 - 62 * point, armRL: -45 + 38 * point };
  const sorcPose: Pose = { ...STAND, lean: 12, head: 10, armRU: -30, armRL: -70, armLU: -20, armLL: -60 };
  return (
    <AbsoluteFill>
      <Hall cam={cam} />
      <Layer d={1} cam={cam}>
        <g transform="translate(2520 0) scale(-1 1)"><ThroneSeat x={1260} floor={FLOOR} s={1.1} /></g>
        <Actor seat="chair" x={1260} y={sitY(FLOOR - 110, 2)} s={2} outfit={KING_MAIN} pose={kingPose} flip mood="tight" />
        <Actor x={910} y={FLOOR} s={2} outfit={SORCERER_MAIN} pose={sorcPose} mood="sneer" />
        {frame >= n3 ? <Actor x={360 + walkT * 230} y={FLOOR} s={1.7} outfit={BOY_MAIN} pose={walking ? walkPose(frame * 0.34, 0.9) : { ...STAND, head: -6 }} mood="neutral" /> : null}
      </Layer>
      <Layer d={1.25} cam={cam} blur={3}><rect x={-240} y={380} width={150} height={1300} fill="#170d16" /><rect x={2010} y={380} width={150} height={1300} fill="#170d16" /></Layer>
      <Grade color="#ff9a4a" opacity={0.16} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// ───────── The road, the monk's dwelling, and "day after day" ─────────
export const RoadBg: React.FC<{ cam: Cam; sky?: keyof typeof SKIES; sunX?: number; sunY?: number }> = ({ cam, sky = "dawn", sunX = 1420, sunY = 900 }) => (
  <>
    <Sky stops={SKIES[sky]} />
    <Layer d={0.05} cam={cam}><Defs /><Glow x={sunX} y={sunY} r={460} o={0.75} /><circle cx={sunX} cy={sunY} r={54} fill="#fff3cf" /></Layer>
    <Layer d={0.2} cam={cam}><path d={ridge("e2a", 1150, 170, 230)} fill="#b98a62" opacity={0.75} /></Layer>
    <Layer d={0.42} cam={cam}>
      <path d={ridge("e2b", 1235, 110, 190)} fill="#a37450" />
      {/* the king's palace, far behind; the sorcerer's house, far ahead */}
      <g fill="#6f4c36"><rect x={110} y={1040} width={210} height={200} /><rect x={150} y={980} width={50} height={70} /><rect x={240} y={990} width={50} height={60} /><path d="M 110 1040 L 215 990 L 320 1040 Z" /></g>
      <g fill="#5a3c2c"><rect x={1790} y={1090} width={110} height={150} /><path d="M 1780 1090 L 1845 1030 L 1910 1090 Z" /></g>
    </Layer>
    <Layer d={1} cam={cam}>
      <path d={`M -1400 ${FLOOR - 6} Q 960 ${FLOOR - 30} 3400 ${FLOOR - 6} L 3400 2800 L -1400 2800 Z`} fill="#d9b784" />
      <path d={`M -1400 ${FLOOR + 6} Q 960 ${FLOOR - 14} 3400 ${FLOOR + 6} L 3400 ${FLOOR + 90} Q 960 ${FLOOR + 64} -1400 ${FLOOR + 90} Z`} fill="#e9cf9f" />
    </Layer>
  </>
);
export const Hut: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} ${FLOOR - 8})`}>
    <path d="M -190 0 L -190 -210 Q 0 -400 190 -210 L 190 0 Z" fill="#c9a877" stroke="#2b1d18" strokeWidth={6} />
    <path d="M -190 -210 Q 0 -400 190 -210" fill="none" stroke="#a88758" strokeWidth={14} />
    <path d="M -52 0 L -52 -150 Q 0 -200 52 -150 L 52 0 Z" fill="#3a2718" stroke="#2b1d18" strokeWidth={5} />
    <rect x={96} y={-170} width={46} height={52} rx={8} fill="#3a2718" stroke="#2b1d18" strokeWidth={4} />
  </g>
);
export const Road: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { Wd } = useL();
  const stop = Wd("N04", "stopped");
  const liked = Wd("N04", "liked");
  const every = Wd("N04", "every");
  const DAY = 20;
  const day = frame >= every ? Math.floor((frame - every) / DAY) : -1;
  const skies: (keyof typeof SKIES)[] = ["day", "dusk", "dawn", "day", "dusk"];
  const sky = day < 0 ? "dawn" : skies[day % skies.length];
  const sunX = day < 0 ? 1420 : [1000, 520, 1420, 1000, 520][day % 5];
  const sunY = day < 0 ? 900 : [640, 930, 900, 640, 930][day % 5];
  const walkT = iv(frame, [0, stop], [0, 1]);
  const sit = iv(frame, [stop + 4, stop + 22], [0, 1], ease);
  const bx = 330 + walkT * 520;
  const s = 1.8;
  const boyPose = sit > 0 ? blend(STAND, { ...SITG, head: -4 }, sit) : walkPose(frame * 0.36, 0.5 + 0.5 * (1 - walkT * 0.6));
  const monkTalk = 0.25 + 0.25 * Math.sin(frame * 0.9) * Math.sin(frame * 0.23);
  const shots: Shot[] = [
    { at: 0, a: aim(vertical, 660, 1120, 1.0), b: aim(vertical, 960, 1140, 1.22) },
    { at: stop + 8, a: aim(vertical, 1000, 1170, 1.5), b: aim(vertical, 1010, 1170, 1.68) },
  ];
  for (let d = 0; d < 6; d++) shots.push({ at: every + d * DAY, a: aim(vertical, 1010, 1160, [1.25, 1.6, 1.4, 1.75, 1.3, 1.6][d]), b: aim(vertical, 1020, 1160, [1.32, 1.68, 1.48, 1.84, 1.38, 1.68][d]) });
  const cam = shotCam(frame, shots, dur);
  const flash = day >= 0 ? iv((frame - every) % DAY, [0, 1, 5], [0.7, 0.5, 0]) : 0;
  return (
    <AbsoluteFill>
      <RoadBg cam={cam} sky={sky} sunX={sunX} sunY={sunY} />
      <Layer d={1} cam={cam}>
        <Hut x={1400} />
        <Actor seat="ground" x={1150} y={sitY(FLOOR, s, true)} s={s} outfit={MONK_MAIN} pose={{ ...SITG, head: 2, armRU: -40 - 14 * Math.sin(frame * 0.12), armRL: -70 }} flip mouth={frame > stop - 30 ? monkTalk : 0} mood="smile" />
        <Actor seat={sit > 0.5 ? "ground" : undefined} x={bx} y={FLOOR + sit * 92 * s} s={s} outfit={BOY_MAIN} pose={boyPose} mouth={0} mood={frame >= liked ? "smile" : "neutral"} />
      </Layer>
      <Layer d={1} cam={cam}><Dust n={26} y0={900} y1={1400} opacity={0.35} seed="rd" /></Layer>
      {sky === "dusk" ? <Grade color="#ff7a3a" opacity={0.2} /> : null}
      {flash > 0 ? <AbsoluteFill style={{ backgroundColor: "#fff3dd", opacity: flash }} /> : null}
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// ───────── The beatings, shown only as shadows on a wall ─────────
export const WallShadows: React.FC<{ cam: Cam; hit: number; big: Outfit; wall: [string, string]; torchX: number }> = ({ cam, hit, big, wall, torchX }) => {
  const { frame } = useShot();
  const raise = iv(frame, [hit - 16, hit - 4, hit, hit + 3, hit + 26], [0, 1, 1, 0.25, 0.1], ease);
  const flinch = iv(frame, [hit, hit + 3, hit + 22], [0, 1, 0.45], easeOut);
  const bigPose: Pose = { ...STAND, lean: -6 + 14 * (frame >= hit ? 1 : 0) * (1 - iv(frame, [hit, hit + 20], [0, 0.5])), armRU: -10 - 150 * raise, armRL: -20 - 20 * raise };
  const boyPose: Pose = { ...STAND, lean: -4 - 12 * flinch, head: -8 - 22 * flinch, armRU: -10 - 60 * flinch, armRL: -70 * flinch };
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${torchX}% 55%, ${wall[0]} 0%, ${wall[1]} 70%)` }} />
      <Layer d={0.9} cam={cam}>
        {new Array(7).fill(0).map((_, i) => <rect key={i} x={-600} y={420 + i * 170} width={3200} height={5} fill="#000" opacity={0.14} />)}
        {new Array(22).fill(0).map((_, i) => <rect key={i} x={-300 + i * 130 + ((i % 2) * 60)} y={420 + (i % 7) * 170} width={5} height={170} fill="#000" opacity={0.1} />)}
        <g opacity={0.82} transform="translate(0 40) skewX(-6)">
          <Actor x={1250} y={1500} s={3.3} outfit={big} pose={bigPose} flip blur={3} />
          <Actor x={900} y={1500} s={2.5} outfit={SHADOW} pose={boyPose} blur={3} />
        </g>
      </Layer>
      <Layer d={1} cam={cam}><Defs /><rect x={-1400} y={1500} width={4800} height={1200} fill="#1c110b" /></Layer>
    </>
  );
};
export const ShadowSlap: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const hit = Wd("N05", "beat");
  const s2 = L("S2") - 2;
  const m = useMouth("S2");
  if (frame < s2) {
    const cam = shook(shotCam(frame, [{ at: 0, a: aim(vertical, 1040, 1050, 1.05), b: aim(vertical, 1060, 1040, 1.22) }], s2), frame, [hit], 16);
    return (
      <AbsoluteFill>
        <WallShadows cam={cam} hit={hit} big={SHADOW_SORCERER} wall={["#c9742a", "#3a1c0c"]} torchX={30} />
        <Vignette s={0.7} />
      </AbsoluteFill>
    );
  }
  const cam = shotCam(frame, [{ at: s2, a: aim(vertical, 1010, 1110, 1.6), b: aim(vertical, 1010, 1100, 1.8) }], dur);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 60%, #5a3018 0%, #1d110b 50%, #070404 100%)" }}>
      <Layer d={1} cam={cam}>
        <Defs />
        <Glow x={520} y={1150} r={640} id="glowO" o={0.6} />
        <Actor x={960} y={1740} s={3.2} outfit={SORCERER_MAIN} pose={{ ...STAND, lean: 12, head: 8, armRU: -20, armRL: -30 }} mouth={m} mood="sneer" />
      </Layer>
      <Vignette s={0.75} />
    </AbsoluteFill>
  );
};
export const Home: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { Wd } = useL();
  const hit = Wd("N06", "beat");
  const cutAt = Math.min(dur - 24, hit + 16);
  if (frame < cutAt) {
    const cam = shook(shotCam(frame, [{ at: 0, a: aim(vertical, 1040, 1050, 1.1), b: aim(vertical, 1060, 1040, 1.24) }], cutAt), frame, [hit], 10);
    return (
      <AbsoluteFill>
        <WallShadows cam={cam} hit={hit} big={{ ...SHADOW, wrap: "#120a06" }} wall={["#b98a4a", "#33200f"]} torchX={72} />
        <Vignette s={0.7} />
      </AbsoluteFill>
    );
  }
  const cam = shotCam(frame, [{ at: cutAt, a: aim(vertical, 980, 1100, 1.35), b: aim(vertical, 1000, 1100, 1.5) }], dur);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#6a4a2c 0%, #4a321e 70%, #33200f 100%)" }}>
      <Layer d={0.6} cam={cam}>
        <rect x={560} y={620} width={220} height={260} rx={12} fill="#f0b46a" /><rect x={664} y={620} width={10} height={260} fill="#4a321e" /><rect x={560} y={744} width={220} height={10} fill="#4a321e" />
        <rect x={1180} y={760} width={420} height={14} fill="#33200f" />{[1210, 1300, 1400, 1500].map((x, i) => <rect key={i} x={x} y={700 - (i % 2) * 14} width={50} height={60 + (i % 2) * 14} rx={12} fill="#7a5632" />)}
      </Layer>
      <Layer d={1} cam={cam}>
        <rect x={-1400} y={FLOOR} width={4800} height={1300} fill="#2e1c10" />
        <Actor x={760} y={FLOOR} s={1.7} outfit={BOY_MAIN} pose={{ ...STAND, head: 16, lean: 3 }} mood="frown" />
        <Actor x={1130} y={FLOOR} s={2.05} outfit={FOLK(2)} pose={{ ...STAND, head: 8, armRU: -40, armRL: -100, armLU: -30, armLL: -100 }} flip mood="frown" />
        <Actor x={1330} y={FLOOR} s={1.95} outfit={FOLK(5)} pose={{ ...STAND, head: 6, armRU: -20, armRL: -60 }} flip mood="frown" />
      </Layer>
      <Grade color="#ffb46a" opacity={0.14} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// ───────── The monk's advice ─────────
export const MonkTalk: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const m1 = L("M1") - 2;
  const say1 = Wd("M1", "say");
  const and = Wd("M1", "and");
  const say2 = Wd("M1", "say", 1);
  const m = useMouth("M1");
  const s = 2;
  const telling = frame < m1 - 6;
  const boyTalk = telling ? 0.3 + 0.3 * Math.sin(frame * 0.95) * Math.sin(frame * 0.21) : 0;
  const finger = Math.max(iv(frame, [say1 - 8, say1, say1 + 40, say1 + 52], [0, 1, 1, 0], ease), iv(frame, [say2 - 8, say2, say2 + 40, say2 + 52], [0, 1, 1, 0], ease));
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 1015, 1150, 1.45), b: aim(vertical, 1015, 1150, 1.56) },
    { at: m1, a: aim(vertical, 1170, 1085, 2.2), b: aim(vertical, 1170, 1080, 2.36) },
    { at: say1, a: aim(vertical, 1020, 1120, 1.7), b: aim(vertical, 1020, 1120, 1.8) },
    { at: and - 4, a: aim(vertical, 860, 1100, 2.15), b: aim(vertical, 860, 1095, 2.3) },
    { at: say2, a: aim(vertical, 1170, 1085, 2.3), b: aim(vertical, 1170, 1080, 2.5) },
    { at: dur - 40, a: aim(vertical, 1015, 1150, 1.5), b: aim(vertical, 1015, 1150, 1.58) },
  ], dur);
  return (
    <AbsoluteFill>
      <RoadBg cam={cam} sky="day" sunX={620} sunY={640} />
      <Layer d={1} cam={cam}>
        <Hut x={1420} />
        <Actor seat="ground" x={1170} y={sitY(FLOOR, s, true)} s={s} outfit={MONK_MAIN} flip mouth={m} mood="smile"
          pose={{ ...SITG, head: 3 + Math.sin(frame * 0.07) * 2, lean: 3, armRU: -28 - 62 * finger, armRL: -56 - 60 * finger }} />
        <Actor seat="ground" x={860} y={sitY(FLOOR, s * 0.9, true)} s={s * 0.9} outfit={BOY_MAIN} mouth={boyTalk} mood={telling ? "frown" : frame > say1 ? "smile" : "neutral"}
          pose={{ ...SITG, head: telling ? 6 : -5, armRU: telling ? -50 - 20 * Math.sin(frame * 0.3) : -28, armRL: telling ? -80 : -56 }} />
      </Layer>
      <Layer d={1} cam={cam}><Dust n={20} y0={900} y1={1400} opacity={0.3} seed="mk" /></Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// ───────── Something blocks the road ─────────
export const Blocked: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { Wd } = useL();
  const blocked = Wd("N08", "something");
  const huge = Wd("N08", "huge");
  const walkT = iv(frame, [0, blocked - 4], [0, 1]);
  const stopped = frame >= blocked - 4;
  const sweep = iv(frame, [blocked - 14, blocked + 30], [0, 1], easeOut);
  const edge = 2700 - sweep * 1900;
  const recoil = iv(frame, [blocked - 4, blocked + 8], [0, 1], easeOut);
  const boyPose: Pose = stopped ? { ...STAND, lean: -7 * recoil, head: -16 * recoil, armRU: -30 * recoil, armRL: -70 * recoil, armLU: -20 * recoil, armLL: -50 * recoil } : walkPose(frame * 0.36, 0.9);
  const cam = shook(shotCam(frame, [
    { at: 0, a: aim(vertical, 700, 1120, 1.12), b: aim(vertical, 860, 1130, 1.3) },
    { at: blocked, a: aim(vertical, 980, 1060, 1.25), b: aim(vertical, 1040, 1000, 1.05) },
    { at: huge - 4, a: aim(vertical, 900, 920, 2.1), b: aim(vertical, 905, 905, 2.5) },
  ], dur), frame, [blocked + 6, blocked + 24], 9);
  return (
    <AbsoluteFill>
      <RoadBg cam={cam} sky="day" sunX={620} sunY={640} />
      <Layer d={1} cam={cam}>
        <Actor x={520 + walkT * 360} y={FLOOR} s={1.9} outfit={BOY_MAIN} pose={boyPose} mood={stopped ? "shock" : "neutral"} />
        {/* the shadow of something huge slides along the road and over him */}
        <g style={{ filter: "blur(14px)" }}>
          <path d={`M ${edge} ${FLOOR - 16} Q ${edge + 500} ${FLOOR - 60} 4200 ${FLOOR - 40} L 4200 2800 L ${edge - 620} 2800 Z`} fill="#150c07" opacity={0.6} />
          <path d={`M ${edge + 140} ${FLOOR - 10} Q ${edge + 260} 520 ${edge + 900} 380 L 4200 300 L 4200 ${FLOOR - 10} Z`} fill="#150c07" opacity={0.34} />
        </g>
        <Dust n={30} y0={1000} y1={1420} opacity={0.5 * sweep} seed="bk" color="#caa57a" />
      </Layer>
      <Grade color="#000000" opacity={0.1 * sweep} mode="multiply" />
      <Vignette s={0.45 + 0.15 * sweep} />
    </AbsoluteFill>
  );
};
