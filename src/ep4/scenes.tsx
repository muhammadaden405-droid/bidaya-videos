import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { STAND, Pose, Outfit, Mood } from "../cartoon/Rig";
import { FOLK } from "../cartoon/Trailer";
import { sans } from "../fonts";
import { Oasis as Meadow, MudHouse } from "./env";
import { Herd, Animal } from "../ep3/animals";
import {
  Actor, V, Cam, Layer, Defs, iv, ease, easeOut, useShot, useView, aim, Vignette, Grade, Flash, Dust,
  FLOOR, Shot, useL, cutCam, shook, walkBy, Sword, useAbs, SITG, sitY,
} from "./kit";
import { OLD, NEPHEW, ACCUSED, ACCUSED_W, ACCUSED_SON, ELDER, SON, FATHER, MERCHANT, POINT, PLEAD, ARMS_UP, SWORD_UP, SWORD_READY, KNEEL, HANDS_HEAD, BOW_HEAD, OFFER, REFUSE } from "./cast";

// Episode 4 scenes. Green valleys and a small town (the Children of Israel, as in Episode 3). Every scene is cut
// on the voice beats, with a cut or clear camera move at least every 3 s (cutCam). Mūsā ﵇ is only ever a golden light.
const S = 2;
/** camera on a world point; 16:9 frames a little wider than 9:16 so heads and feet fit */
const cc = (f: number, shots: Shot[], dur: number) => cutCam(f, [...shots].sort((a, b) => a.at - b.at), dur);
const A = (vertical: boolean, x: number, y: number, z: number) => aim(vertical, x, y, vertical ? z : z * 0.82);
type Sky = "dawn" | "day" | "dusk" | "night";

// ───────── helpers ─────────
/** id of the line spoken right after this one */
const nextOf = (id: string) => {
  const f0 = V.lines[id].f0; let best = Infinity, bid = id;
  for (const [k, l] of Object.entries(V.lines)) if (l.f0 > f0 && l.f0 < best) { best = l.f0; bid = k; }
  return bid;
};
/** mouth opening for character lines (lip-sync from the line's own audio) */
const mouthAt = (abs: number, ids: string[] = []) => {
  for (const id of ids) {
    const env = V.mouth[id]; const l = V.lines[id];
    if (!env || !l) continue;
    const i = abs - l.f0;
    if (i >= 0 && i < env.length) {
      const v = Math.max(0, Math.min(1, ((env[i] * 0.65 + (env[i - 1] ?? env[i]) * 0.35) - 0.1) * 1.3));
      return v * (0.45 + 0.55 * Math.abs(Math.sin(i * 0.62)));
    }
  }
  return 0;
};
export type Act = { x: number; o: Outfit; flip?: boolean; pose?: Pose; mood?: Mood; say?: string[]; s?: number; y?: number; hold?: React.ReactNode; walk?: { f0: number; f1: number; x0: number; x1: number }; blur?: number; op?: number; seat?: "ground" };
export const Cast: React.FC<{ acts: Act[] }> = ({ acts }) => {
  const frame = useCurrentFrame(); const abs = useAbs();
  return (
    <g>
      {acts.map((a, i) => {
        let x = a.x, pose = a.pose ?? STAND;
        if (a.walk) {
          const t = iv(frame, [a.walk.f0, a.walk.f1], [0, 1]);
          x = a.walk.x0 + (a.walk.x1 - a.walk.x0) * t;
          if (t > 0 && t < 1) pose = walkBy(x * (a.walk.x1 > a.walk.x0 ? 1 : -1), a.s ?? S);
        }
        return <Actor key={i} x={x} y={a.y ?? FLOOR} s={a.s ?? S} outfit={a.o} flip={a.flip} pose={pose} mood={a.mood} mouth={mouthAt(abs, a.say)} hold={a.hold} blur={a.blur} o={a.op} seat={a.seat} />;
      })}
    </g>
  );
};
/** a crowd of townspeople in muted browns, by seed, standing in rows behind the action */
export const crowd = (n: number, x0: number, x1: number, seed: string, o: { flip?: boolean | "mix"; mood?: Mood; y?: number; s?: number; sword?: boolean; up?: number } = {}): Act[] =>
  new Array(n).fill(0).map((_, i) => {
    const x = x0 + ((i + 0.5) / n) * (x1 - x0) + (random(`${seed}x${i}`) - 0.5) * 50;
    const flip = o.flip === "mix" ? random(`${seed}f${i}`) > 0.5 : !!o.flip;
    const up = o.sword && random(`${seed}u${i}`) < (o.up ?? 0.6);
    return { x, o: FOLK(i + Math.floor(random(`${seed}o`) * 4)), flip, mood: o.mood ?? "tight", s: (o.s ?? S * 0.94) * (0.96 + random(`${seed}s${i}`) * 0.08), y: (o.y ?? FLOOR) - (i % 2) * 18, pose: o.sword ? (up ? SWORD_UP : SWORD_READY) : STAND, hold: o.sword ? <Sword color="#2a2522" /> : undefined };
  });
/** the town: green valley, a row of houses behind, optional big house (front) with a door that opens */
export const Town: React.FC<{ cam: Cam; sky?: Sky; seed?: string; door?: number; houseX?: number; children?: React.ReactNode; back?: boolean }> = ({ cam, sky = "day", seed = "t", door, houseX, children, back = true }) => {
  const night = sky === "night";
  const row = back ? <g>{[-420, 300, 1020, 1740, 2460].map((x, i) => <g key={i} transform={`translate(${x} 1290) scale(0.62) translate(0 ${-FLOOR})`}><MudHouse x={0} tone={i} night={night} /></g>)}</g> : null;
  return (
    <>
      <Meadow cam={cam} sky={night ? "night" : sky} seed={seed} sunX={night ? 1500 : sky === "dawn" ? 420 : 1480} sunY={night ? 420 : sky === "dawn" ? 1000 : 760} river={!night} mid={row} />
      <Layer d={1} cam={cam}>
        <Defs />
        {houseX !== undefined ? <BigHouse x={houseX} open={door ?? 0} night={night} /> : null}
        {children}
      </Layer>
      {night ? <Grade color="#0b1440" opacity={0.45} mode="multiply" /> : sky === "dawn" ? <Grade color="#ffb070" opacity={0.18} /> : null}
    </>
  );
};
/** a house at full size; its door swings open (open 0..1) onto a dark room */
const BigHouse: React.FC<{ x: number; open: number; night?: boolean }> = ({ x, open, night }) => (
  <g>
    <MudHouse x={x} night={night} />
    <path d={`M ${x - 160} ${FLOOR - 4} L ${x - 160} ${FLOOR - 544} Q ${x} ${FLOOR - 764} ${x + 160} ${FLOOR - 544} L ${x + 160} ${FLOOR - 4} Z`} fill={night ? "#0b0806" : "#1a120c"} />
    <g transform={`translate(${x - 160} 0) scale(${1 - 0.86 * open} 1) translate(${-(x - 160)} 0)`}>
      <path d={`M ${x - 160} ${FLOOR - 4} L ${x - 160} ${FLOOR - 544} Q ${x} ${FLOOR - 764} ${x + 160} ${FLOOR - 544} L ${x + 160} ${FLOOR - 4} Z`} fill="#6b4a2e" stroke="#3a2a1e" strokeWidth={7} />
      {[-100, -30, 40, 110].map((dx) => <line key={dx} x1={x + dx} y1={FLOOR - 4} x2={x + dx} y2={FLOOR - 600} stroke="#4e3420" strokeWidth={6} />)}
      <circle cx={x + 120} cy={FLOOR - 300} r={12} fill="#c9962e" />
    </g>
  </g>
);
/** the murdered old man, wrapped in a cloth, on the ground in FRONT of everyone (so nobody stands on him).
 * Feet to the right. sit 0..1 raises him to sitting on the floor (Part 7); mouth/point when he speaks. */
export const Body: React.FC<{ x: number; y?: number; s?: number; sit?: number; mouth?: number; point?: number; glow?: number }> = ({ x, y = FLOOR + 175, s = 1, sit = 0, mouth = 0, point = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={20} cy={6} rx={330} ry={24} fill="#000" opacity={0.25} />
    {glow ? <ellipse cx={-60} cy={-120} rx={300} ry={200} fill="#ffe7a8" opacity={0.4 * glow} style={{ filter: "blur(30px)" }} /> : null}
    {/* legs, wrapped */}
    <path d="M -10 -74 L 270 -54 Q 312 -46 304 -18 Q 298 4 262 4 L -10 4 Z" fill="#e9e2d2" stroke="#3a2a1e" strokeWidth={5} />
    {[70, 150, 220].map((fx) => <path key={fx} d={`M ${fx} -66 Q ${fx + 12} -32 ${fx + 4} 2`} stroke="#c9bfa8" strokeWidth={5} fill="none" />)}
    {/* torso + head turn up around the hip */}
    <g transform={`rotate(${sit * 84} 0 -36)`}>
      <path d="M 6 -78 L -236 -86 Q -262 -84 -258 -40 Q -256 4 -226 4 L 6 4 Z" fill={OLD.robe} stroke="#3a2a1e" strokeWidth={5} />
      <path d="M -40 -82 L -200 -86 L -200 4 L -40 4 Z" fill="#e9e2d2" opacity={sit > 0.05 ? 0 : 0.92} />
      <ellipse cx={-296} cy={-42} rx={46} ry={42} fill={OLD.skin} stroke="#3a2a1e" strokeWidth={4} />
      <path d="M -342 -20 Q -350 -70 -306 -88 Q -330 -60 -334 -10 Z" fill={OLD.wrap} stroke="#3a2a1e" strokeWidth={3} />
      <path d="M -270 -78 Q -230 -70 -160 -64 Q -200 -40 -268 -30 Z" fill={OLD.beard} stroke="#cfc8ba" strokeWidth={2} />
      <ellipse cx={-266} cy={-80} rx={7 + mouth * 4} ry={3 + mouth * 9} fill="#4a1e18" transform="rotate(90 -266 -80)" />
      {point > 0 ? <g transform={`translate(-206 -70) rotate(${-90 * point})`}><rect x={-12} y={-14} width={150} height={28} rx={12} fill={OLD.robe} stroke="#3a2a1e" strokeWidth={4} /><circle cx={150} cy={0} r={15} fill={OLD.skin} /></g> : null}
    </g>
  </g>
);
/** the dead man alive again, sitting on the floor where he lay (feet toward the right); he can speak and point */
export const Seated: React.FC<{ x: number; mouth?: number; point?: number; mood?: Mood; o?: number }> = ({ x, mouth = 0, point = 0, mood = "neutral", o = 1 }) => (
  <g opacity={o}>
    <ellipse cx={x + 60} cy={FLOOR + 178} rx={200} ry={20} fill="#000" opacity={0.22} />
    <Actor x={x} y={sitY(FLOOR + 175, S, true)} s={S} outfit={{ ...OLD, aura: "#fff1c9" }} seat="ground" mood={mood} mouth={mouth}
      pose={{ ...SITG, lean: 4, armLU: -24 - 70 * point, armLL: -56 + 52 * point }} />
  </g>
);
/** a piece of the cow's flesh, held in the hand */
export const Flesh: React.FC = () => (
  <g transform="translate(0 6)"><path d="M -22 -10 Q -4 -26 22 -14 Q 30 4 14 14 Q -10 20 -24 6 Z" fill="#9a2f28" stroke="#5a1a14" strokeWidth={3} /><path d="M -14 -4 Q 4 -12 18 -6" stroke="#f0d8c8" strokeWidth={4} fill="none" /></g>
);
/** Mūsā ﵇: never drawn as a person, only a golden light (owner's rule) */
export const MusaLight: React.FC<{ x: number; y: number; s?: number; flare?: number }> = ({ x, y, s = 1, flare = 0 }) => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.04 * Math.sin(f * 0.12);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * pulse})`}>
      <ellipse cx={0} cy={250} rx={300} ry={40} fill="#ffd36b" opacity={0.35 + flare * 0.3} style={{ filter: "blur(18px)" }} />
      {new Array(14).fill(0).map((_, i) => {
        const a = (i / 14) * 360 + f * 0.35;
        return <path key={i} d="M -10 0 L 10 0 L 3 -520 L -3 -520 Z" fill="#ffe7a3" opacity={0.18 + 0.12 * Math.sin(f * 0.07 + i) + flare * 0.25} transform={`rotate(${a})`} style={{ filter: "blur(4px)" }} />;
      })}
      <circle cx={0} cy={0} r={260} fill="url(#glowO)" opacity={0.85} />
      <ellipse cx={0} cy={0} rx={120} ry={210} fill="#ffe39a" opacity={0.7} style={{ filter: "blur(26px)" }} />
      <ellipse cx={0} cy={0} rx={60} ry={130} fill="#fff8e0" opacity={0.95} style={{ filter: "blur(14px)" }} />
      {new Array(18).fill(0).map((_, i) => {
        const t = ((f * 0.6 + i * 37) % 300) / 300;
        return <circle key={`p${i}`} cx={Math.sin(i * 2.3 + f * 0.02) * 160} cy={200 - t * 460} r={4 + (i % 3) * 2} fill="#fff4cc" opacity={(1 - t) * 0.8} />;
      })}
    </g>
  );
};
/** the one cow: bright yellow (tinged with red), not one mark of another colour */
export const YellowCow: React.FC<{ x: number; y?: number; s?: number; flip?: boolean; walk?: number; glow?: number; tone?: "yellow" | "brown" }> = ({ x, y = FLOOR, s = 1, flip, walk, glow = 0, tone = "yellow" }) => {
  const c = tone === "yellow" ? "#e8b02e" : "#7b4f33", d = tone === "yellow" ? "#c98a1c" : "#5c3a24";
  const sw = (off: number) => (walk === undefined ? 0 : Math.sin(walk * 0.045 + off) * 16);
  const Leg2: React.FC<{ lx: number; a: number; col: string }> = ({ lx, a, col }) => (
    <g transform={`translate(${lx} -230) rotate(${a})`}><path d="M -17 0 L 17 0 L 13 126 L 12 230 L -12 230 L -14 126 Z" fill={col} /><rect x={-14} y={224} width={28} height={12} rx={4} fill="#2a1d14" /></g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      {glow ? <ellipse cx={0} cy={-260} rx={340} ry={260} fill="#ffe39a" opacity={0.35 * glow} style={{ filter: "blur(40px)" }} /> : null}
      <ellipse cx={0} cy={6} rx={200} ry={15} fill="#000" opacity={0.18} />
      <Leg2 lx={-135} a={sw(Math.PI)} col={d} /><Leg2 lx={110} a={sw(0)} col={d} />
      <path d="M -190 -360 Q -200 -250 -160 -220 L 150 -215 Q 190 -240 180 -330 Q 176 -370 140 -385 Q 0 -400 -150 -392 Q -186 -388 -190 -360 Z" fill={c} stroke="#5a3a14" strokeWidth={4} />
      <path d="M -150 -380 Q 0 -396 140 -376 Q 0 -372 -150 -366 Z" fill="#f6cf5a" opacity={0.7} />
      <path d="M -190 -370 Q -222 -320 -214 -230" stroke={d} strokeWidth={8} fill="none" /><ellipse cx={-214} cy={-226} rx={10} ry={16} fill={d} />
      <g>
        <path d="M 160 -380 Q 230 -390 260 -340 Q 280 -300 270 -270 Q 250 -248 228 -262 Q 190 -300 160 -320 Z" fill={c} stroke="#5a3a14" strokeWidth={4} />
        <ellipse cx={262} cy={-268} rx={22} ry={18} fill="#d9a07a" />
        <circle cx={256} cy={-274} r={4} fill="#3a2418" /><circle cx={270} cy={-270} r={4} fill="#3a2418" />
        <circle cx={222} cy={-344} r={5} fill="#2a1d14" />
        <path d="M 196 -376 Q 170 -392 150 -386 Q 168 -370 192 -366 Z" fill={d} />
        <path d="M 214 -384 Q 222 -410 240 -414" stroke="#efe4cf" strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
      <Leg2 lx={-110} a={sw(0)} col={c} /><Leg2 lx={135} a={sw(Math.PI)} col={c} />
    </g>
  );
};
/** big on-screen words that punch in (viral style) */
export const Punch: React.FC<{ at: number; text: string; color?: string; y?: number; size?: number; out?: number; sub?: string }> = ({ at, text, color = "#fff", y = 0.3, size = 1, out = 1e9, sub }) => {
  const f = useCurrentFrame(); const { vertical } = useView();
  if (f < at || f > out) return null;
  const k = iv(f, [at, at + 6], [1.35, 1], easeOut), o = iv(f, [at, at + 3, out - 4, out], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: `${(vertical ? Math.max(y, 0.25) : y) * 100}%`, left: "5%", width: "90%", textAlign: "center", transform: `scale(${k})`, opacity: o }}>
        <div style={{ fontFamily: sans, fontWeight: 900, fontSize: (vertical ? 96 : 84) * size, color, letterSpacing: 2, textShadow: "0 5px 0 #000, 0 0 22px rgba(0,0,0,0.9)" }}>{text}</div>
        {sub ? <div style={{ fontFamily: sans, fontWeight: 800, fontSize: (vertical ? 48 : 42) * size, color: "#ffd27a", marginTop: 8, textShadow: "0 3px 0 #000, 0 0 12px #000" }}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
const Stamp: React.FC<{ at: number; text: string }> = ({ at, text }) => {
  const f = useCurrentFrame(); if (f < at) return null;
  const k = iv(f, [at, at + 5], [2.2, 1], easeOut);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ transform: `rotate(-12deg) scale(${k})`, border: "12px solid #e0262b", color: "#e0262b", fontFamily: sans, fontWeight: 900, fontSize: 110, padding: "4px 34px", borderRadius: 18, background: "rgba(0,0,0,0.25)", textShadow: "0 0 8px rgba(0,0,0,0.6)" }}>{text}</div>
    </AbsoluteFill>
  );
};

// ───────── PART 1 ─────────
/** A man opens his door: a dead body on his doorstep. Now his family is accused. */
export const Doorstep: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const b = L("N1_03");
  const open = iv(frame, [0, 16], [0.4, 1], easeOut);
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 940, 1080, 1.4), b: A(vertical, 940, 1100, 1.25) },
    { at: 34, a: A(vertical, 900, 1300, 2.2), b: A(vertical, 860, 1300, 2.45) },
    { at: b - 2, a: A(vertical, 1000, 1110, 1.05), b: A(vertical, 1000, 1100, 1.2) },
  ], dur);
  const step = iv(frame, [0, 12], [0.6, 1], ease);
  return (
    <AbsoluteFill>
      <Town cam={shook(cam, frame, [32], 10)} sky="dawn" seed="d1" houseX={960} door={open}>
        <Cast acts={[
          { x: 960, y: FLOOR - 6 + (1 - step) * -20, o: ACCUSED, mood: frame > 30 ? "shock" : "neutral", pose: frame > 30 ? HANDS_HEAD : STAND, op: step },
          ...(frame > b - 4 ? [{ x: 1180, o: ACCUSED_W, mood: "shock" as Mood, flip: true }, { x: 740, o: ACCUSED_SON, mood: "shock" as Mood, s: S * 0.8 }] : []),
          ...(frame > b - 4 ? crowd(5, 1400, 2200, "d1c", { flip: true, mood: "frown" }) : []),
          ...(frame > b - 4 ? crowd(4, -300, 420, "d1d", { mood: "frown" }) : []),
        ]} />
        <Body x={900} />
      </Town>
      <Flash at={32} len={6} color="#fff" max={0.35} />
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};
/** The dead man's nephew screams for justice and points at the family */
export const Accusation: React.FC<{ freeze?: boolean }> = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 700, 1060, 1.15), b: A(vertical, 680, 1050, 1.3) },
    { at: L("NE1") - 2, a: A(vertical, 560, 940, 2.1), b: A(vertical, 560, 930, 2.35) },
    { at: L("NE2") - 2, a: A(vertical, 640, 1000, 1.6), b: A(vertical, 660, 990, 1.8) },
    { at: L("N1_05") - 2, a: A(vertical, 1120, 990, 1.7), b: A(vertical, 1100, 990, 1.9) },
  ], dur);
  const pointing = frame > L("NE1") + 4;
  return (
    <AbsoluteFill>
      <Town cam={shook(cam, frame, [L("NE1") + 2, L("NE2") + 2], 12)} sky="dawn" seed="d2" houseX={1300} door={1}>
        <Cast acts={[
          ...crowd(6, -200, 400, "a1", { mood: "frown" }),
          { x: 560, o: NEPHEW, pose: pointing ? POINT : HANDS_HEAD, mood: "frown", say: ["NE1", "NE2"] },
          { x: 1300, o: ACCUSED, flip: true, mood: "shock", pose: REFUSE },
          { x: 1500, o: ACCUSED_W, flip: true, mood: "shock" },
          ...crowd(4, 1750, 2300, "a2", { flip: true, mood: "frown" }),
        ]} />
        <Body x={1000} s={0.9} />
      </Town>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
/** Did they do it? Nobody knows. — the accused man, then the dead man (very old) */
export const Doubt: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 1300, 880, 2.4), b: A(vertical, 1300, 880, 2.7) },
    { at: L("N1_07") - 2, a: A(vertical, 900, 1000, 1.25), b: A(vertical, 980, 1000, 1.35) },
    { at: L("N1_08") - 2, a: A(vertical, 760, 1330, 2.6), b: A(vertical, 760, 1320, 3.0) },
    { at: L("N1_10") - 2, a: A(vertical, 1000, 1150, 1.4), b: A(vertical, 1000, 1140, 1.6) },
  ], dur);
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="dawn" seed="d3" houseX={1300} door={1}>
        <Cast acts={[
          ...crowd(5, -100, 560, "b1", { mood: "tight" }),
          { x: 1300, o: ACCUSED, flip: true, mood: frame > L("N1_07") ? "frown" : "shock", pose: BOW_HEAD },
          { x: 1520, o: ACCUSED_W, flip: true, mood: "frown" },
          { x: 600, o: NEPHEW, mood: "frown", pose: BOW_HEAD },
        ]} />
        <Body x={1000} />
      </Town>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};
/** No one saw. No one heard. No trace. The killer could be anyone here. — night street, then faces in the crowd */
export const NoTrace: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const b = L("N1_16");
  if (frame < b - 2) {
    const cam = cc(frame, [{ at: 0, a: A(vertical, 900, 1100, 1.1), b: A(vertical, 1100, 1100, 1.25) }], b);
    return (
      <AbsoluteFill>
        <Town cam={cam} sky="night" seed="n1" houseX={960} door={0}><Dust n={30} color="#9fb0e0" y0={900} y1={1500} drift={1.6} seed="nd" size={2} opacity={0.4} /></Town>
        <Punch at={2} out={Math.round(b * 0.33)} text="NO ONE SAW." y={0.3} size={0.9} />
        <Punch at={Math.round(b * 0.33)} out={Math.round(b * 0.66)} text="NO ONE HEARD." y={0.3} size={0.9} />
        <Punch at={Math.round(b * 0.66)} out={b} text="NO TRACE." y={0.3} size={1.1} color="#ff6a5a" />
        <Vignette s={0.7} />
      </AbsoluteFill>
    );
  }
  const cam = cc(frame, [{ at: b - 2, a: A(vertical, 300, 950, 1.9), b: A(vertical, 1600, 950, 1.9) }], dur);
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="dawn" seed="n2" back={false}>
        <Cast acts={[...crowd(9, -200, 2100, "nt", { mood: "tight", flip: "mix" }), { x: 1180, o: NEPHEW, mood: "tight" }, { x: 520, o: ELDER, mood: "tight" }, { x: 1720, o: ACCUSED, mood: "tight", flip: true }]} />
      </Town>
      <Grade color="#000" opacity={0.25} mode="multiply" />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};
/** They blame each other; the crowd splits in two; hands reach for weapons (also opens Part 2) */
export const Split: React.FC<{ drawn?: boolean; reachAt?: string; killerLine?: string }> = ({ drawn, reachAt, killerLine }) => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const r = reachAt ? L(reachAt) : 0;
  const armed = drawn || (reachAt ? frame > r + 6 : false);
  const gap = iv(frame, [0, 40], [drawn ? 520 : 120, 520], ease);
  const shots: Shot[] = [
    { at: 0, a: A(vertical, 960, 1000, 1.0), b: A(vertical, 960, 1000, 1.12) },
    { at: Math.round(dur * 0.35), a: A(vertical, 960 - gap / 2 - 120, 940, 1.9), b: A(vertical, 960 - gap / 2 - 60, 940, 2.1) },
    { at: Math.round(dur * 0.62), a: A(vertical, 960 + gap / 2 + 120, 940, 1.9), b: A(vertical, 960 + gap / 2 + 60, 940, 2.1) },
  ];
  if (reachAt) shots.push({ at: r - 2, a: A(vertical, 960, 1000, 1.05), b: A(vertical, 960, 990, 1.25) });
  if (killerLine) shots.push({ at: L(killerLine) - 2, a: A(vertical, 960, 960, 1.5), b: A(vertical, 960, 960, 1.7) });
  const cam = cc(frame, shots, dur);
  return (
    <AbsoluteFill>
      <Town cam={shook(cam, frame, reachAt ? [r + 6] : [4], 12)} sky="dawn" seed="sp" back>
        <Cast acts={[
          ...crowd(6, -300, 960 - gap / 2, "sl", { mood: "frown", sword: armed, up: 0.5 }),
          ...crowd(6, 960 + gap / 2, 2260, "sr", { flip: true, mood: "frown", sword: armed, up: 0.5 }),
          { x: 960 - gap / 2 + 40, o: NEPHEW, mood: "frown", pose: armed ? SWORD_UP : POINT, hold: armed ? <Sword color="#2a2522" /> : undefined },
          { x: 960 + gap / 2 - 40, o: ACCUSED, flip: true, mood: "frown", pose: armed ? SWORD_READY : REFUSE, hold: armed ? <Sword color="#2a2522" /> : undefined },
        ]} />
        <Body x={960} s={0.85} />
      </Town>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// ───────── PART 2 ─────────
/** The wisest among them shout: why don't you go to the Prophet of Allah? */
export const Elder: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 960, 1000, 1.2), b: A(vertical, 960, 990, 1.35) },
    { at: L("P1") - 2, a: A(vertical, 960, 880, 2.2), b: A(vertical, 960, 870, 2.45) },
  ], dur);
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="day" seed="el">
        <Cast acts={[
          ...crowd(5, -300, 600, "e1", { mood: "frown", sword: true, up: 0.2 }),
          ...crowd(5, 1320, 2260, "e2", { flip: true, mood: "frown", sword: true, up: 0.2 }),
          { x: 960, o: ELDER, pose: ARMS_UP, mood: "frown", say: ["P1"], walk: { f0: 0, f1: 20, x0: 860, x1: 960 } },
        ]} />
      </Town>
      <Vignette s={0.35} />
    </AbsoluteFill>
  );
};
/** The Prophet. Mūsā (a golden light). They bring the case to him. */
export const ToMusa: React.FC<{ flareAt?: string }> = ({ flareAt }) => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 1350, 900, 1.6), b: A(vertical, 1350, 900, 1.85) },
    { at: Math.round(dur * 0.45), a: A(vertical, 900, 1000, 1.0), b: A(vertical, 1050, 1000, 1.12) },
  ], dur);
  const fl = flareAt ? iv(frame, [L(flareAt), L(flareAt) + 10, L(flareAt) + 40], [0, 1, 0.3]) : 0;
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="day" seed="tm" back={false}>
        <MusaLight x={1400} y={FLOOR - 300} flare={fl} />
        <Cast acts={[
          ...crowd(6, -500, 600, "tm", { mood: "tight" }).map((a, i) => ({ ...a, walk: { f0: Math.round(dur * 0.45) + i * 3, f1: dur, x0: a.x - 300, x1: a.x + 150 } })),
          { x: 700, o: NEPHEW, mood: "frown", walk: { f0: Math.round(dur * 0.45), f1: dur, x0: 400, x1: 820 } },
          { x: 500, o: ELDER, mood: "tight", walk: { f0: Math.round(dur * 0.45), f1: dur, x0: 200, x1: 600 } },
        ]} />
      </Town>
      <Vignette s={0.35} />
    </AbsoluteFill>
  );
};
/** The nephew rushes forward and pleads before the light */
export const Plead: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 1000, 1000, 1.2), b: A(vertical, 1050, 1000, 1.3) },
    { at: L("NE3") - 2, a: A(vertical, 930, 1000, 2.2), b: A(vertical, 930, 990, 2.45) },
    { at: L("NE4") - 2, a: A(vertical, 1150, 950, 1.5), b: A(vertical, 1150, 950, 1.7) },
  ], dur);
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="day" seed="pl" back={false}>
        <MusaLight x={1400} y={FLOOR - 300} />
        <Cast acts={[
          ...crowd(6, -300, 700, "pl", { mood: "tight" }),
          { x: 1000, o: NEPHEW, pose: frame > L("NE3") ? KNEEL : PLEAD, mood: "frown", say: ["NE3", "NE4"], walk: { f0: 0, f1: 18, x0: 820, x1: 1000 } },
        ]} />
      </Town>
      <Vignette s={0.35} />
    </AbsoluteFill>
  );
};
/** If the truth stays hidden, that family takes the blame. / they're keeping quiet */
export const Family: React.FC<{ quiet?: boolean }> = ({ quiet }) => {
  const { frame, dur } = useShot(); const { vertical } = useView();
  const cam = cc(frame, [{ at: 0, a: A(vertical, 960, 900, 2.0), b: A(vertical, 960, 900, 2.3) }], dur);
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="day" seed="fa" back={false}>
        <Cast acts={[
          { x: 820, o: ACCUSED_W, mood: "frown", pose: BOW_HEAD },
          { x: 960, o: ACCUSED, mood: "frown", pose: BOW_HEAD },
          { x: 1110, o: ACCUSED_SON, mood: "frown", s: S * 0.8, pose: BOW_HEAD },
        ]} />
      </Town>
      <Grade color="#000" opacity={quiet ? 0.2 : 0.1} mode="multiply" />
      <Vignette s={0.55} />
    </AbsoluteFill>
  );
};
/** Mūsā calls to the people; nobody says a word — wide crowd and the light; cuts to family, nephew, faces */
export const Silence: React.FC<{ flareAt?: string; cuts?: string[] }> = ({ flareAt, cuts = [] }) => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const fl = flareAt ? iv(frame, [L(flareAt), L(flareAt) + 10, L(flareAt) + 50], [0, 1, 0.2]) : 0;
  const pts: [number, number, number][] = [[960, 1000, 1.0], [700, 940, 2.0], [1180, 940, 2.0], [960, 960, 1.4], [1500, 900, 1.6]];
  const shots: Shot[] = [{ at: 0, a: A(vertical, 960, 1000, 1.0), b: A(vertical, 980, 990, 1.12) }];
  cuts.forEach((c, i) => { const p = pts[(i + 1) % pts.length]; shots.push({ at: L(c) - 2, a: A(vertical, p[0], p[1], p[2]), b: A(vertical, p[0] + 30, p[1], p[2] * 1.1) }); });
  const cam = cc(frame, shots, dur);
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="day" seed="si" back={false}>
        <MusaLight x={1500} y={FLOOR - 320} flare={fl} />
        <Cast acts={[
          ...crowd(8, -300, 1250, "si", { mood: "tight" }),
          { x: 700, o: ACCUSED, mood: "tight", pose: BOW_HEAD },
          { x: 1180, o: NEPHEW, mood: "tight" },
          { x: 420, o: ELDER, mood: "tight" },
        ]} />
      </Town>
      {V.lines["N42"] && L("N42") > 0 && L("N42") < dur ? <Punch at={L("N42")} out={L("N44") - 2} text="SOMEONE HERE KNOWS." color="#ff5a4a" y={0.26} size={0.85} /> : null}
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// ───────── PART 3 ─────────
/** The answer comes: a cow. Shock, anger, "Are you making fun of us?" */
export const Answer: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const fl = iv(frame, [L("N52"), L("N52") + 10, L("N54") + 20, L("N55")], [0, 1, 0.8, 0.2]);
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 1450, 900, 1.5), b: A(vertical, 1450, 900, 1.8) },
    { at: L("N55") - 2, a: A(vertical, 960, 1000, 1.05), b: A(vertical, 960, 1000, 1.18) },
    { at: L("N57") - 2, a: A(vertical, 760, 940, 1.9), b: A(vertical, 820, 940, 2.1) },
    { at: L("P2") - 2, a: A(vertical, 520, 880, 2.1), b: A(vertical, 520, 870, 2.35) },
    { at: L("N59") - 2, a: A(vertical, 1450, 900, 1.5), b: A(vertical, 1450, 900, 1.7) },
  ], dur);
  const angry = frame > L("N57");
  return (
    <AbsoluteFill>
      <Town cam={shook(cam, frame, [L("P3")], 10)} sky="day" seed="an" back={false}>
        <MusaLight x={1450} y={FLOOR - 320} flare={fl} />
        {frame > L("N55") && frame < L("N57") ? <g opacity={iv(frame, [L("N55"), L("N55") + 8], [0, 0.9])}><YellowCow x={1000} y={FLOOR - 40} s={0.9} tone="brown" /></g> : null}
        <Cast acts={[
          ...crowd(8, -300, 1200, "an", { mood: angry ? "frown" : "shock" }),
          { x: 520, o: ELDER, mood: angry ? "frown" : "shock", pose: frame > L("P2") ? ARMS_UP : STAND, say: ["P2", "P3"] },
          { x: 820, o: NEPHEW, mood: angry ? "frown" : "shock" },
        ]} />
      </Town>
      <Punch at={L("N54")} out={L("N55") - 2} text="SLAUGHTER A COW?" y={0.25} />
      {(() => { const d = L("N57") - L("N55"); return <>
        <Punch at={L("N55")} out={L("N55") + Math.round(d * 0.33)} text="NOT A NAME." y={0.27} size={0.85} />
        <Punch at={L("N55") + Math.round(d * 0.33)} out={L("N55") + Math.round(d * 0.62)} text="NOT A WITNESS." y={0.27} size={0.85} />
        <Punch at={L("N55") + Math.round(d * 0.62)} out={L("N57") - 2} text="A COW." color="#ffcf3a" y={0.27} size={1.2} />
      </>; })()}
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
/** And any cow would have done. One cow. But they don't. They start asking questions. */
export const AnyCow: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 960, 1000, 1.0), b: A(vertical, 1100, 1000, 1.15) },
    { at: L("N64") - 2, a: A(vertical, 700, 960, 1.7), b: A(vertical, 700, 950, 1.9) },
    { at: L("N66") - 2, a: A(vertical, 1450, 920, 1.6), b: A(vertical, 1450, 920, 1.9) },
  ], dur);
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="day" seed="ac" back={false}>
        {frame < L("N64") ? <Herd kind="cow" n={18} x0={-300} x1={2300} y0={1150} y1={1330} frame={frame} seed="any" s={0.42} /> : null}
        {frame >= L("N64") ? <><MusaLight x={1450} y={FLOOR - 320} /><Cast acts={[...crowd(7, -300, 1150, "ac", { mood: "tight" }), { x: 700, o: ELDER, mood: "tight" }]} /></> : null}
      </Town>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// ───────── PART 4 ─────────
/** The questions: the people ask, Mūsā answers (narrated), and the cows that still fit shrink: thousands → a handful → maybe none. */
export const Questions: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const ask = ["P4", "P5", "P6a", "P6b", "P6c", "P7"];
  const herdAt: [string, number][] = [["N68b", 40], ["N78", 5], ["N87b", 0]];
  const fieldShot = herdAt.find(([id]) => frame >= L(id) - 2 && frame < L(nextOf(id)) - 2);
  const famShot = frame >= L("N80") - 2 && frame < L("N82") - 2;
  const shots: Shot[] = [{ at: 0, a: A(vertical, 960, 1000, 1.05), b: A(vertical, 1000, 1000, 1.15) }];
  ask.forEach((id, i) => shots.push({ at: L(id) - 2, a: A(vertical, 640, 880, 2.0 + (i % 2) * 0.2), b: A(vertical, 640, 870, 2.2 + (i % 2) * 0.2) }));
  ["N67", "N74", "N83"].forEach((id) => shots.push({ at: L(id) - 2, a: A(vertical, 1420, 900, 1.6), b: A(vertical, 1420, 900, 1.85) }));
  const cam = cc(frame, shots, dur);
  if (fieldShot) {
    const [id, n] = fieldShot;
    const fc = cc(frame - L(id) + 2, [{ at: 0, a: A(vertical, 960, 1150, 0.95), b: A(vertical, 960, 1150, 1.08) }], L(nextOf(id)) - L(id));
    return (
      <AbsoluteFill>
        <Meadow cam={fc} sky="day" seed={`fd${id}`} trees={4} town={false} />
        <Layer d={1} cam={fc}><Herd kind="cow" n={n} x0={-300} x1={2300} y0={1150} y1={1340} frame={frame} seed="cnt" s={0.4} /></Layer>
        <Punch at={L(id)} text={n > 20 ? "THOUSANDS STILL FIT" : n > 0 ? "ONLY A HANDFUL" : "MAYBE NONE"} y={0.18} size={0.8} color={n > 0 ? "#fff" : "#ff6a5a"} />
        <Vignette s={0.35} />
      </AbsoluteFill>
    );
  }
  if (famShot) return <Family />;
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="day" seed="qs" back={false}>
        <MusaLight x={1420} y={FLOOR - 320} flare={["N67", "N74", "N83"].some((id) => frame >= L(id) && frame < L(id) + 30) ? 0.6 : 0} />
        <Cast acts={[
          ...crowd(7, -400, 1000, "qs", { mood: "tight" }),
          { x: 640, o: ELDER, mood: "frown", pose: PLEAD, say: ask },
        ]} />
      </Town>
      <Checklist />
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
/** the cow's description builds up on screen as Mūsā gives it */
const Checklist: React.FC = () => {
  const f = useCurrentFrame(); const { L } = useL(); const { vertical } = useView();
  const items: [string, string][] = [["N67", "NOT OLD · NOT YOUNG"], ["N74", "BRIGHT YELLOW"], ["N83", "NEVER WORKED"], ["N85", "NO FLAW"], ["N86", "NOT ONE MARK"]];
  const on = items.filter(([id]) => f >= L(id));
  if (!on.length) return null;
  return (
    <div style={{ position: "absolute", left: vertical ? 60 : 80, top: vertical ? "40%" : "26%", display: "flex", flexDirection: "column", gap: 10 }}>
      {on.map(([id, t]) => {
        const k = iv(f, [L(id), L(id) + 6], [0, 1], easeOut);
        return <div key={id} style={{ opacity: k, transform: `translateX(${(1 - k) * -40}px)`, fontFamily: sans, fontWeight: 900, fontSize: vertical ? 44 : 38, color: id === "N74" ? "#ffcf3a" : "#fff", background: "rgba(0,0,0,0.55)", padding: "6px 18px", borderRadius: 10 }}>✓ {t}</div>;
      })}
    </div>
  );
};

// ───────── PART 5 ─────────
/** Find this one cow... they search, farm after farm: every cow fails — except one. */
export const Search: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const beats: [string, string][] = [["N92", "WHITE PATCH"], ["N93", "PULLED A PLOUGH"], ["N94", "TOO OLD"]];
  const ends = [L("N93") - 2, L("N94") - 2, L("N95") - 2];
  const bi = beats.findIndex(([id], i) => frame >= L(id) - 2 && frame < ends[i]);
  if (bi >= 0) {
    const [id, word] = beats[bi]; const st = L(id) - 2;
    const cam = cc(frame - st, [{ at: 0, a: A(vertical, 960, 1080, 1.5), b: A(vertical, 960, 1070, 1.7) }], ends[bi] - st);
    return (
      <AbsoluteFill>
        <Meadow cam={cam} sky="day" seed={`s${id}`} trees={5} town={false} />
        <Layer d={1} cam={cam}><Defs />
          {id === "N92" ? <g transform={`translate(960 ${FLOOR})`}><Animal kind="cow" s={1.1} /></g> : null}
          {id === "N93" ? <g><YellowCow x={960} s={1.1} tone="brown" /><path d="M 1180 1010 L 1420 1060 L 1440 1200 M 1300 1040 L 1280 1240" stroke="#5a3e28" strokeWidth={14} fill="none" strokeLinecap="round" /></g> : null}
          {id === "N94" ? <g><YellowCow x={960} s={1.05} tone="brown" /><path d="M 880 960 q 40 -20 80 0" stroke="#ddd" strokeWidth={6} fill="none" /></g> : null}
        </Layer>
        <Stamp at={L(id) + 8} text={word} />
        <Vignette s={0.4} />
      </AbsoluteFill>
    );
  }
  const reveal = frame >= L("N96") - 2, none = !reveal && frame >= L("N95") - 2;
  const cam = cc(frame, reveal ? [{ at: L("N96") - 2, a: A(vertical, 960, 1050, 1.6), b: A(vertical, 960, 1050, 1.25) }] : none ? [{ at: L("N95") - 2, a: A(vertical, 960, 1100, 0.95), b: A(vertical, 960, 1100, 1.05) }] : [
    { at: 0, a: A(vertical, 700, 1000, 1.0), b: A(vertical, 1000, 1000, 1.1) },
    { at: L("N91") - 2, a: A(vertical, 1100, 960, 1.5), b: A(vertical, 1150, 960, 1.65) },
  ], dur);
  return (
    <AbsoluteFill>
      <Meadow cam={cam} sky={none ? "dusk" : "day"} seed="se" trees={6} town={false} />
      <Layer d={1} cam={cam}><Defs />
        {reveal ? <YellowCow x={960} glow={iv(frame, [L("N96"), L("N96") + 20], [0, 1])} /> : none ? null : <Cast acts={[...crowd(5, 200, 1700, "sw", { mood: "tight" }).map((a, i) => ({ ...a, walk: { f0: 0, f1: L("N92"), x0: a.x - 400, x1: a.x + 200 + i * 10 } })), { x: 800, o: ELDER, mood: "tight", walk: { f0: 0, f1: L("N92"), x0: 500, x1: 1000 } }]} />}
      </Layer>
      {none ? <Punch at={L("N95")} text="NOT ONE COW FITS." color="#ff6a5a" y={0.25} size={0.8} /> : null}
      {reveal ? <Punch at={L("N97")} text="ONE COW. IN THE WHOLE LAND." y={0.25} size={0.7} /> : null}
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
/** It belongs to a man devoted to his father. A cow for a cow? No. Two? No. Ten. Still no. Then the threat. */
export const Haggle: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 1100, 1000, 1.25), b: A(vertical, 1100, 990, 1.4) },
    { at: L("N101") - 2, a: A(vertical, 700, 900, 2.0), b: A(vertical, 700, 900, 2.2) },
    { at: L("N102") - 2, a: A(vertical, 1050, 880, 2.2), b: A(vertical, 1050, 880, 2.4) },
    { at: L("N103") - 2, a: A(vertical, 700, 900, 2.1), b: A(vertical, 720, 900, 2.3) },
    { at: L("N104") - 2, a: A(vertical, 1050, 880, 2.3), b: A(vertical, 1050, 880, 2.5) },
    { at: L("N105") - 2, a: A(vertical, 700, 900, 2.2), b: A(vertical, 740, 900, 2.4) },
    { at: L("N106") - 2, a: A(vertical, 1050, 880, 2.4), b: A(vertical, 1050, 880, 2.6) },
    { at: L("P8") - 2, a: A(vertical, 900, 960, 1.3), b: A(vertical, 900, 950, 1.5) },
  ], dur);
  const offers: [string, string][] = [["N101", "1 COW?"], ["N103", "2 COWS?"], ["N105", "10 COWS?"]];
  const no: string[] = ["N102", "N104", "N106"];
  return (
    <AbsoluteFill>
      <Town cam={shook(cam, frame, [L("P8")], 10)} sky="day" seed="hg" back={false}>
        <YellowCow x={1380} glow={0.5} />
        <Cast acts={[
          ...crowd(5, -400, 500, "hg", { mood: frame > L("N107") ? "frown" : "tight" }),
          { x: 700, o: ELDER, pose: OFFER, mood: frame > L("N107") ? "frown" : "neutral", say: ["P8"] },
          { x: 1050, o: SON, flip: true, pose: no.some((id) => frame >= L(id) && frame < L(id) + 30) ? REFUSE : STAND, mood: "tight" },
        ]} />
      </Town>
      {offers.map(([id, t], i) => <Punch key={id} at={L(id)} out={L(no[i]) + 25} text={t} y={0.2} size={0.9} />)}
      {no.map((id) => <Punch key={id} at={L(id)} out={L(id) + 25} text="NO." color="#ff5a4a" y={0.34} size={1.1} />)}
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
/** They take him to Mūsā. "We found the cow with him... he refuses!" Give them your cow. — I have more right... You're right. */
export const Ruling: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 900, 1000, 1.0), b: A(vertical, 1100, 1000, 1.1) },
    { at: L("P9") - 2, a: A(vertical, 640, 880, 2.1), b: A(vertical, 640, 870, 2.3) },
    { at: L("N110") - 2, a: A(vertical, 1450, 900, 1.6), b: A(vertical, 1450, 900, 1.8) },
    { at: L("N111") - 2, a: A(vertical, 1020, 900, 2.0), b: A(vertical, 1020, 900, 2.2) },
    { at: L("N113") - 2, a: A(vertical, 1450, 900, 1.6), b: A(vertical, 1430, 900, 1.8) },
    { at: L("N116") - 2, a: A(vertical, 1180, 1050, 1.5), b: A(vertical, 1180, 1040, 1.75) },
  ], dur);
  const fl = ["N110", "N113"].some((id) => frame >= L(id) && frame < L(id) + 30) ? 0.6 : 0;
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="day" seed="ru" back={false}>
        <MusaLight x={1450} y={FLOOR - 320} flare={fl} />
        <YellowCow x={1180} y={FLOOR + 40} s={0.8} glow={0.3} flip />
        <Cast acts={[
          ...crowd(5, -500, 450, "ru", { mood: "frown" }),
          { x: 640, o: ELDER, pose: frame > L("P9") ? POINT : STAND, mood: "frown", say: ["P9"], walk: { f0: 0, f1: 40, x0: 300, x1: 640 } },
          { x: 1020, o: SON, pose: frame > L("N111") && frame < L("N113") ? PLEAD : STAND, mood: "tight", walk: { f0: 0, f1: 40, x0: 700, x1: 1020 } },
        ]} />
      </Town>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// ───────── PART 6 ─────────
/** inside the young man's home: plaster walls, a window, a bed on the left, the doorway open to the street on the right */
const Home: React.FC<{ cam: Cam; children?: React.ReactNode; dusk?: boolean }> = ({ cam, children, dusk }) => (
  <>
    <AbsoluteFill style={{ background: dusk ? "#2a1e18" : "#3a2a20" }} />
    <Layer d={1} cam={cam}>
      <Defs />
      <rect x={-600} y={300} width={3200} height={FLOOR - 300} fill={dusk ? "#c9a77a" : "#e6cfa6"} />
      <rect x={-600} y={FLOOR - 40} width={3200} height={60} fill="#b8946a" />
      <rect x={-600} y={FLOOR} width={3200} height={700} fill="#8a6a48" />
      {[-400, 0, 400, 800, 1200, 1600, 2000].map((x) => <line key={x} x1={x} y1={FLOOR} x2={x - 120} y2={FLOOR + 700} stroke="#6f5236" strokeWidth={6} />)}
      {/* window with daylight */}
      <path d="M 560 520 L 560 820 L 820 820 L 820 520 Q 690 400 560 520 Z" fill={dusk ? "#f0a050" : "#bfe3f5"} stroke="#6b4a2e" strokeWidth={14} />
      <line x1={690} y1={470} x2={690} y2={820} stroke="#6b4a2e" strokeWidth={10} />
      <path d="M 560 820 L 380 1340 L 1080 1340 L 820 820 Z" fill="#fff6d8" opacity={0.12} />
      {/* doorway to the street */}
      <path d="M 1340 1340 L 1340 700 Q 1500 540 1660 700 L 1660 1340 Z" fill={dusk ? "#e8a860" : "#a6d27a"} stroke="#6b4a2e" strokeWidth={16} />
      <path d="M 1340 1100 L 1660 1100 L 1660 1340 L 1340 1340 Z" fill={dusk ? "#c98a50" : "#8cbf5e"} />
      {/* the bed: a low wooden frame, a mattress and a pillow */}
      <rect x={60} y={FLOOR - 150} width={600} height={60} rx={12} fill="#f2ead8" stroke="#8a6a48" strokeWidth={6} />
      <rect x={40} y={FLOOR - 96} width={640} height={36} rx={8} fill="#7a5232" />
      <rect x={60} y={FLOOR - 60} width={24} height={60} fill="#6b4628" /><rect x={636} y={FLOOR - 60} width={24} height={60} fill="#6b4628" />
      <rect x={40} y={FLOOR - 300} width={30} height={240} rx={8} fill="#7a5232" />
      {children}
    </Layer>
  </>
);
/** the father asleep on the bed, head on the pillow, the key to his son's money under it */
const Sleeper: React.FC<{ mood?: Mood }> = ({ mood = "neutral" }) => (
  <g>
    <g transform={`translate(560 ${FLOOR - 196}) rotate(-90)`}><Actor x={0} y={0} s={S * 0.9} outfit={FATHER} pose={{ ...STAND, armRU: -150, armRL: -60 }} mood={mood} /></g>
    <rect x={70} y={FLOOR - 212} width={130} height={56} rx={24} fill="#fbf6ea" stroke="#c9bfa8" strokeWidth={4} />
    <g transform={`translate(150 ${FLOOR - 160})`}><rect x={0} y={-6} width={56} height={10} rx={3} fill="#e3b341" stroke="#8a6414" strokeWidth={2} /><circle cx={60} cy={-1} r={10} fill="none" stroke="#e3b341" strokeWidth={5} /></g>
    {new Array(3).fill(0).map((_, i) => <text key={i} x={140 + i * 30} y={FLOOR - 300 - i * 34} fontFamily={sans} fontWeight={900} fontSize={34 + i * 6} fill="#fff" opacity={0.7}>z</text>)}
  </g>
);
/** a memory look for the pearl story (it happened before all this) */
const Memory: React.FC = () => <><Grade color="#c98a3a" opacity={0.22} /><AbsoluteFill style={{ boxShadow: "inset 0 0 220px 60px rgba(60,30,10,0.55)", pointerEvents: "none" }} /></>;
/** The pearls: a merchant at the door, the young man inside, his father asleep on the bed with the key under his head;
 * the two prices move apart. */
export const Pearls: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 1420, 1000, 1.9), b: A(vertical, 1400, 990, 2.15) },
    { at: L("N119") - 2, a: A(vertical, 300, 1150, 2.0), b: A(vertical, 260, 1150, 2.3) },
    { at: L("N120") - 2, a: A(vertical, 1180, 960, 1.6), b: A(vertical, 1180, 950, 1.8) },
    { at: L("N121") - 2, a: A(vertical, 1420, 1000, 1.9), b: A(vertical, 1420, 990, 2.1) },
    { at: L("N123") - 2, a: A(vertical, 900, 1050, 1.05), b: A(vertical, 900, 1040, 1.2) },
    { at: L("N128") - 2, a: A(vertical, 1180, 940, 2.1), b: A(vertical, 1180, 930, 2.35) },
  ], dur);
  const merchant: [string, string][] = [["N118", "70,000"], ["N121", "60,000"], ["N123", "50,000"], ["N124", "30,000"]];
  const son: [string, string][] = [["N120", "80,000"], ["N125", "90,000"], ["N126", "100,000"]];
  const cur = (list: [string, string][]) => [...list].reverse().find(([id]) => frame >= L(id));
  const m = cur(merchant), s2 = cur(son);
  return (
    <AbsoluteFill>
      <Home cam={cam}>
        <Sleeper />
        <Cast acts={[
          { x: 1500, o: MERCHANT, flip: true, pose: OFFER, mood: "smile", hold: <g transform="translate(10 0)"><rect x={-40} y={-8} width={80} height={14} rx={4} fill="#5a3a22" />{[-26, -12, 2, 16, 30].map((px) => <circle key={px} cx={px} cy={-16} r={8} fill="#f6f1e6" stroke="#bfb6a6" strokeWidth={2} />)}</g> },
          { x: 1180, o: SON, pose: frame > L("N128") ? REFUSE : STAND, mood: frame > L("N128") ? "tight" : "neutral" },
        ]} />
      </Home>
      <Memory />
      {m ? <Tag text={m[1]} who="THE MERCHANT" left at={L(m[0])} strike={frame >= L("N128")} /> : null}
      {s2 ? <Tag text={s2[1]} who="THE YOUNG MAN (IF HE WAITS)" at={L(s2[0])} strike={frame >= L("N128")} /> : null}
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
const Tag: React.FC<{ text: string; who: string; left?: boolean; at: number; strike?: boolean }> = ({ text, who, left, at, strike }) => {
  const f = useCurrentFrame(); const { vertical } = useView();
  const k = iv(f, [at, at + 5], [1.3, 1], easeOut);
  return (
    <div style={{ position: "absolute", top: vertical ? "24%" : "14%", [left ? "left" : "right"]: vertical ? 40 : 90, transform: `scale(${k})`, textAlign: "center", opacity: strike ? 0.45 : 1 }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: vertical ? 28 : 26, color: "#ffd27a", textShadow: "0 2px 0 #000" }}>{who}</div>
      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: vertical ? 76 : 70, color: left ? "#ff6a5a" : "#8fe08a", textShadow: "0 4px 0 #000, 0 0 14px #000", textDecoration: strike ? "line-through" : "none" }}>{text}</div>
    </div>
  );
};
/** A fortune gone so his father can sleep — and Allah repays him with a cow. */
export const Reward: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cow = frame >= L("N131") + 10;
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 320, 1150, 1.9), b: A(vertical, 320, 1140, 2.1) },
    { at: L("N131") - 2, a: A(vertical, 1350, 1000, 1.2), b: A(vertical, 1350, 1000, 1.35) },
    { at: L("N131b") - 2, a: A(vertical, 1350, 1040, 1.6), b: A(vertical, 1350, 1030, 1.85) },
  ], dur);
  return (
    <AbsoluteFill>
      <Home cam={cam} dusk>
        <Sleeper mood="smile" />
        {cow ? <g opacity={iv(frame, [L("N131") + 10, L("N131") + 30], [0, 1])}><g transform="translate(1500 1340) scale(0.78) translate(-1500 -1340)"><YellowCow x={1500} glow={1} /></g></g> : null}
        <Cast acts={[{ x: 1180, o: SON, mood: "smile", flip: !cow }]} />
      </Home>
      <Memory />
      <Flash at={L("N131") + 10} len={14} color="#fff3c8" max={0.5} />
      <Vignette s={0.4} />
      <AbsoluteFill style={{ backgroundColor: "#fff2d0", opacity: iv(frame, [dur - 12, dur], [0, 0.9]) }} />
    </AbsoluteFill>
  );
};
/** Satisfy him: its weight in gold, then multiplied — ten times. He sells. */
export const Gold: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 1050, 1000, 1.25), b: A(vertical, 1050, 990, 1.4) },
    { at: L("N132") - 2, a: A(vertical, 1450, 920, 1.4), b: A(vertical, 1480, 920, 1.55) },
    { at: L("N133") - 2, a: A(vertical, 960, 1050, 1.2), b: A(vertical, 960, 1050, 1.35) },
    { at: L("N137") - 2, a: A(vertical, 1000, 950, 1.9), b: A(vertical, 1000, 950, 2.1) },
  ], dur);
  const mult = frame < L("N133") ? 0 : frame < L("N135") ? 1 : Math.min(10, 1 + Math.floor((frame - L("N135")) / Math.max(4, (L("N137") - L("N135")) / 10)));
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="day" seed="go" back={false}>
        <MusaLight x={1600} y={FLOOR - 320} flare={frame >= L("N132") && frame < L("N132") + 30 ? 0.6 : 0} />
        <YellowCow x={760} glow={0.3} />
        {mult > 0 ? <g>{new Array(Math.min(40, mult * 4)).fill(0).map((_, i) => <rect key={i} x={1000 + (i % 8) * 46} y={FLOOR - 30 - Math.floor(i / 8) * 26} width={42} height={22} rx={3} fill="#e3b341" stroke="#8a6414" strokeWidth={3} />)}</g> : null}
        <Cast acts={[...crowd(4, -400, 300, "go", { mood: "tight" }), { x: 520, o: SON, mood: frame > L("N137") ? "smile" : "tight", pose: frame > L("N134") && frame < L("N135") ? REFUSE : STAND }, { x: 1080, o: ELDER, flip: true, pose: OFFER, mood: "tight" }]} />
      </Town>
      <AbsoluteFill style={{ backgroundColor: "#fff2d0", opacity: iv(frame, [0, 16], [0.9, 0]) }} />
      {mult > 0 ? <Punch at={L("N133")} text={`×${mult} ITS WEIGHT IN GOLD`} y={0.18} size={0.75} color="#ffd34a" out={L("N137") + 40} /> : null}
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
/** They slaughter it (only shadows, nothing shown) — and they almost don't. What does a cow have to do with a murder? */
export const Slaughter: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const end = frame >= L("N140") - 2;
  const cam = cc(frame, end ? [{ at: L("N140") - 2, a: A(vertical, 760, 1330, 2.4), b: A(vertical, 760, 1320, 2.8) }] : [{ at: 0, a: A(vertical, 960, 1000, 1.1), b: A(vertical, 960, 990, 1.25) }], dur);
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="dusk" seed="sg" back={false}>
        {end ? <Body x={1000} /> : <>
          <g opacity={0.92}><YellowCow x={960} tone="brown" /></g>
          <Cast acts={crowd(6, 300, 1700, "sg", { mood: "tight", flip: "mix" }).map((a) => ({ ...a, o: { ...a.o, skin: "#140d09", robe: "#140d09", robeShade: "#0a0604", wrap: "#140d09" } }))} />
        </>}
      </Town>
      {end ? null : <Grade color="#000" opacity={0.5} mode="multiply" />}
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// ───────── PART 7 ─────────
/** Part 7 layout: the dead man on the floor in front, his feet toward the right; the nephew stands on the right
 * (the way he faces when he sits up), the accused family on the left, the light behind them on the left. */
const P7Cast = (mood: Mood, extra: Act[] = []): Act[] => [
  ...crowd(5, -500, 380, "rv", { mood }),
  { x: 520, o: ACCUSED, mood },
  { x: 680, o: ACCUSED_W, mood },
  ...crowd(3, 1500, 2300, "rv2", { mood, flip: true }),
  ...extra,
];
/** They strike the dead man with a piece of the cow; Allah brings him back to life: he sits up on the floor; Mūsā asks: who killed you? */
export const Revival: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL(); const abs = useAbs();
  const hit = L("N142") + 28;
  const swing = iv(frame, [hit - 14, hit, hit + 10], [-10, -42, -30], ease);
  const sit = frame >= L("N142b") + 10 ? 1 : 0; // the swap happens under the flash
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 900, 1330, 1.7), b: A(vertical, 900, 1320, 1.9) },
    { at: hit - 2, a: A(vertical, 760, 1400, 2.6), b: A(vertical, 760, 1390, 2.8) },
    { at: L("N142b") - 2, a: A(vertical, 820, 1180, 1.3), b: A(vertical, 820, 1170, 1.5) },
    { at: L("N143") - 2, a: A(vertical, 760, 1220, 1.8), b: A(vertical, 760, 1210, 2.0) },
  ], dur);
  return (
    <AbsoluteFill>
      <Town cam={shook(cam, frame, [hit, L("N142b") + 8], 10)} sky="day" seed="rv" back={false}>
        <MusaLight x={260} y={FLOOR - 320} flare={iv(frame, [L("N142b"), L("N142b") + 12, L("N142b") + 60], [0, 1, 0.3])} />
        <Cast acts={P7Cast(sit > 0.3 ? "shock" : "tight", [
          { x: 1250, o: NEPHEW, mood: sit > 0.3 ? "shock" : "tight" },
          ...(frame < L("N142b") + 30 ? [{ x: 700, y: FLOOR + 120, o: ELDER, pose: { ...KNEEL, armRU: swing, armRL: -10 }, mood: "tight" as Mood, hold: <Flesh /> }] : []),
        ])} />
        {sit < 0.5 ? <Body x={900} glow={iv(frame, [L("N142b"), L("N142b") + 10], [0, 1])} /> : <Seated x={820} mood="shock" mouth={0.2 * Math.abs(Math.sin(abs * 0.25)) * iv(frame, [L("N142b") + 30, L("N142b") + 60], [1, 0])} />}
      </Town>
      <Flash at={hit} len={6} color="#fff" max={0.25} />
      <Flash at={L("N142b") + 2} len={24} color="#fff6d8" max={1} />
      <Punch at={L("N142b") + 8} out={L("N143") - 4} text="HE'S ALIVE" y={0.24} size={0.9} color="#ffe39a" />
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
/** STOP. The frame freezes: the dead man sitting up, everyone around him — who do you think killed him? */
export const Suspects: React.FC = () => {
  const { frame } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = A(vertical, 860, 1150, 1.3 + iv(frame, [0, 200], [0, 0.15]));
  const q = L("N143b");
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "grayscale(0.85) contrast(1.1)" }}>
        <Town cam={cam} sky="day" seed="rv" back={false}>
          <MusaLight x={260} y={FLOOR - 320} />
          <Cast acts={P7Cast("shock", [{ x: 1250, o: NEPHEW, mood: "shock" }])} />
          <Seated x={820} mood="shock" />
        </Town>
      </AbsoluteFill>
      <Grade color="#000" opacity={0.35} mode="multiply" />
      <Punch at={0} out={q} text="STOP." color="#ff4a3a" y={0.3} size={1.6} />
      {frame >= q ? <SuspectCards at={q} /> : null}
      <Punch at={q} text="WHO KILLED HIM?" y={vertical ? 0.24 : 0.08} size={0.95} sub="Comment your answer now 👇" />
    </AbsoluteFill>
  );
};
const SuspectCards: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame(); const { vertical } = useView();
  const cards: [string, string][] = [["A", "THE FAMILY AT THE DOOR"], ["B", "THE NEPHEW"], ["C", "SOMEONE IN THE CROWD"]];
  return (
    <div style={{ position: "absolute", bottom: vertical ? "32%" : "12%", width: "100%", display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", justifyContent: "center", gap: vertical ? 16 : 28 }}>
      {cards.map(([k, t], i) => {
        const o = iv(f, [at + 8 + i * 8, at + 14 + i * 8], [0, 1], easeOut);
        return <div key={k} style={{ opacity: o, transform: `scale(${0.8 + 0.2 * o})`, background: "rgba(10,8,6,0.82)", border: "4px solid #ffd27a", borderRadius: 16, padding: "10px 26px", fontFamily: sans, fontWeight: 900, fontSize: vertical ? 46 : 38, color: "#fff" }}><span style={{ color: "#ffd27a" }}>{k}.</span> {t}</div>;
      })}
    </div>
  );
};
/** "My nephew killed me." — sitting on the floor he points at him; flashes of the nephew screaming and pleading;
 * he was there the whole time; then the old man lies back down, dead as he was. */
export const Reveal: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL(); const abs = useAbs();
  const flash = [["N144", 0], ["N145", 1], ["N146", 2]] as [string, number][];
  const fb = flash.find(([id], i) => frame >= L(id) - 2 && frame < (flash[i + 1] ? L(flash[i + 1][0]) - 2 : L("N147") - 2));
  if (fb) {
    const k = fb[1]; const start = L(fb[0]) - 2; const end = flash[k + 1] ? L(flash[k + 1][0]) - 2 : L("N147") - 2;
    const cam = cc(frame - start, [{ at: 0, a: A(vertical, k === 2 ? 1000 : 600, 940, 2.0), b: A(vertical, k === 2 ? 1000 : 600, 930, 2.3) }], end - start);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ filter: "sepia(0.6) contrast(1.1)" }}>
          <Town cam={cam} sky={k === 2 ? "day" : "dawn"} seed={`fb${k}`} back={false}>
            {k === 2 ? <MusaLight x={1400} y={FLOOR - 300} /> : null}
            <Cast acts={[{ x: k === 2 ? 1000 : 600, o: NEPHEW, pose: k === 0 ? POINT : k === 1 ? HANDS_HEAD : KNEEL, mood: "frown" }]} />
            {k === 2 ? null : <Body x={1000} s={0.9} />}
          </Town>
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 40%, rgba(120,0,0,0.6) 100%)" }} />
        <Flash at={start} len={5} color="#ff2a1a" max={0.35} />
      </AbsoluteFill>
    );
  }
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 820, 1200, 1.9), b: A(vertical, 820, 1190, 2.1) },
    { at: L("OLD1") + 26, a: A(vertical, 1250, 940, 2.3), b: A(vertical, 1250, 930, 2.6) },
    { at: L("N147") - 2, a: A(vertical, 1250, 960, 1.8), b: A(vertical, 1250, 950, 2.1) },
    { at: L("N148") - 2, a: A(vertical, 900, 1250, 1.5), b: A(vertical, 900, 1250, 1.7) },
  ], dur);
  const sit = frame < L("N148") + 16 ? 1 : 0;
  const m = V.mouth["OLD1"]; const i = abs - (V.lines["OLD1"]?.f0 ?? 0);
  const mouth = m && i >= 0 && i < m.length ? Math.max(0, Math.min(1, (m[i] - 0.1) * 1.3)) : 0;
  return (
    <AbsoluteFill>
      <Town cam={shook(cam, frame, [L("OLD1") + 26], 16)} sky="day" seed="rv" back={false}>
        <MusaLight x={260} y={FLOOR - 320} />
        <Cast acts={P7Cast("shock", [{ x: 1250, o: NEPHEW, mood: "shock", pose: frame > L("OLD1") + 26 ? HANDS_HEAD : STAND, flip: true }])} />
        {sit > 0.5 ? <Seated x={820} mood={frame > L("OLD1") + 26 ? "frown" : "neutral"} mouth={mouth} point={iv(frame, [L("OLD1") + 14, L("OLD1") + 24, L("N148") - 4, L("N148") + 4], [0, 1, 1, 0])} /> : <Body x={900} />}
      </Town>
      <Flash at={L("OLD1") + 26} len={6} color="#ff2a1a" max={0.3} />
      <Flash at={L("N148") + 14} len={10} color="#000" max={0.6} />
      <Punch at={L("N147")} out={L("N147a") - 2} text="THE KILLER." color="#ff4a3a" y={0.24} size={1.1} />
      <Punch at={L("N147a")} text="HE WAS THERE THE WHOLE TIME" y={0.24} size={0.7} out={L("N148") - 2} />
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};
/** Why? The inheritance. He never gets a single coin. No killer could inherit. */
export const Inherit: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const gone = iv(frame, [L("N157"), L("N157") + 24], [0, 1]);
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 960, 1000, 1.3), b: A(vertical, 960, 990, 1.45) },
    { at: L("N155a") - 2, a: A(vertical, 700, 940, 1.9), b: A(vertical, 720, 940, 2.1) },
    { at: L("N156") - 2, a: A(vertical, 1100, 1150, 1.8), b: A(vertical, 1100, 1150, 2.1) },
    { at: L("N158") - 2, a: A(vertical, 960, 1000, 1.1), b: A(vertical, 960, 1000, 1.25) },
  ], dur);
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="dusk" seed="in" back>
        <g opacity={1 - gone}>{new Array(30).fill(0).map((_, i) => <ellipse key={i} cx={1000 + (i % 10) * 26 + (Math.floor(i / 10) % 2) * 12} cy={FLOOR - 10 - Math.floor(i / 10) * 14} rx={14} ry={7} fill="#e3b341" stroke="#8a6414" strokeWidth={2} />)}</g>
        <Cast acts={[
          { x: 760, o: NEPHEW, mood: frame > L("N157") ? "frown" : "neutral", pose: frame > L("N156") && frame < L("N157") + 10 ? OFFER : STAND },
          ...(frame < L("N156") ? [{ x: 520, o: { ...FOLK(1), robe: "#9a6a2a" }, mood: "tight" as Mood }, { x: 380, o: { ...FOLK(2), robe: "#7a5a2a" }, mood: "tight" as Mood }] : []),
        ]} />
      </Town>
      <Punch at={L("N158")} text="NO KILLER INHERITS" y={0.18} size={0.8} color="#ffd34a" />
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};
/** Allah brought the truth out from the mouth of a dead man; as He brought him back to life, He will bring back all the dead. */
export const Truth: React.FC = () => {
  const { frame, dur } = useShot(); const { vertical } = useView(); const { L } = useL();
  const cam = cc(frame, [
    { at: 0, a: A(vertical, 960, 1000, 1.4), b: A(vertical, 960, 1000, 1.2) },
    { at: L("N160") - 2, a: A(vertical, 960, 1050, 0.95), b: A(vertical, 960, 1000, 1.1) },
  ], dur);
  const dawn = iv(frame, [L("N160"), L("N161") + 40], [0, 1]);
  return (
    <AbsoluteFill>
      <Meadow cam={cam} sky={dawn > 0.5 ? "dawn" : "dusk"} seed="tr" sunX={960} sunY={1120 - dawn * 260} trees={6} />
      <Layer d={1} cam={cam}><Defs />
        <MusaLight x={960} y={FLOOR - 420} s={0.8 + dawn * 0.4} flare={dawn * 0.5} />
      </Layer>
      <Dust n={50} color="#fff1c9" y0={800} y1={1500} drift={0.5} seed="trd" size={3} opacity={0.5 * dawn} />
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};
