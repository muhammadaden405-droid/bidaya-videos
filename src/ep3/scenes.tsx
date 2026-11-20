import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { STAND, blend, Pose, Outfit, Mood } from "../cartoon/Rig";
import { FOLK } from "../cartoon/Trailer";
import { LEPER_POOR, LEPER_RICH, BALD_POOR, BALD_RICH, BLIND_POOR, BLIND_RICH, ANGEL, ANGEL_AS } from "./cast";
import { Animal, Herd, Kind } from "./animals";
import { Meadow, House, Wall, Stalls } from "./env";
import {
  Actor, sitY, useMouth, useTalk, walkBy, Cane, V, Cam, Layer, Defs, iv, ease, easeOut, useShot, useView, aim,
  Dust, Grade, Vignette, Glow, Flash, SITG, FLOOR, Shot, useL, beatsIn, speakerIds, cutCam, shook, reach, handAt,
} from "./kit";

// Episode 3 — The Blind Man, the Leper and the Bald Man. Green valleys, trees and a river (owner's note);
// every scene cut on the voice beats (a cut or clear move at least every 3 s); the angel is always seen
// through a soft blur, so he can just be made out.
export type Who = "leper" | "bald" | "blind";
const RICH: Record<Who, Outfit> = { leper: LEPER_RICH, bald: BALD_RICH, blind: BLIND_RICH };
const POOR_HEALED: Record<Who, Outfit> = { leper: { ...LEPER_POOR, spots: 0 }, bald: { ...BALD_POOR, shine: 0, hair: "#24170f", hairAmt: 1 }, blind: { ...BLIND_POOR, glasses: false } };
const PRE: Record<Who, "L" | "B" | "BL"> = { leper: "L", bald: "B", blind: "BL" };
const KIND: Record<Who, Kind> = { leper: "camel", bald: "cow", blind: "sheep" };
const WHO3: Who[] = ["leper", "bald", "blind"];
const S = 2; // figure scale (≈ 520 px tall)
const HEAD = FLOOR - 232 * S; // head centre of a standing figure
const ANGEL_BLUR = 7;
/** the angel (or the angel in a man's old form): always softly blurred */
const AngelFig: React.FC<{ x: number; outfit?: Outfit; pose?: Pose; flip?: boolean; hold?: React.ReactNode; o?: number }> = ({ x, outfit = ANGEL, pose = STAND, flip, hold, o = 1 }) => (
  <Actor x={x} y={FLOOR} s={S} outfit={outfit} pose={pose} flip={flip} hold={hold} o={o} blur={ANGEL_BLUR} mood="neutral" />
);
const Rope: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({ x1, y1, x2, y2 }) => (
  <path d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.max(y1, y2) + 60} ${x2} ${y2}`} stroke="#6b4a2a" strokeWidth={5} fill="none" />
);
/** where an animal's head is (for the rope), facing right at scale 1 */
const HEAD_AT: Record<Kind, [number, number]> = { camel: [372, -626], cow: [250, -300], sheep: [150, -176] };
const TRAIL: Record<Kind, number> = { camel: 470, cow: 390, sheep: 260 };

// ───────── Village: the three men, each in his own place ─────────
const FolkWalk: React.FC<{ x: number; i: number; walking: boolean; flip?: boolean; s?: number; y?: number; mood?: Mood; pose?: Pose }> = ({ x, i, walking, flip, s = S * 0.97, y = FLOOR, mood = "neutral", pose }) => (
  <Actor x={x} y={y} s={s} outfit={FOLK(i)} pose={walking ? walkBy(flip ? -x : x, s) : pose ?? STAND} flip={flip} mood={mood} />
);
export const VillageWide: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const cam = cutCam(frame, [{ at: 0, a: aim(vertical, 960, 1120, 0.95), b: aim(vertical, 1020, 1110, 1.08) }], dur);
  return (
    <AbsoluteFill>
      <Meadow cam={cam} seed="vw" mid={<g>{[-300, 460, 1220, 1980].map((x, i) => <g key={i} transform={`translate(${x} 1290) scale(0.7) translate(0 ${-FLOOR})`}><House x={0} poor /></g>)}</g>} />
      <Layer d={1} cam={cam}>
        <Defs />
        {[0, 1, 2, 3, 4].map((i) => { const x = (i % 2 ? 1900 : 0) + (i % 2 ? -1 : 1) * (frame * (1.6 + i * 0.3) + i * 230); return <FolkWalk key={i} x={x} i={i} walking flip={i % 2 === 1} s={S * 0.9} />; })}
      </Layer>
      <Vignette s={0.35} />
    </AbsoluteFill>
  );
};
/** "People kept away from him": passers-by turn back when they see the leper; a mother pulls her child away */
export const LeperAlone: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L } = useL();
  const b = L("N05_b");
  const LX = 1000;
  const cam = cutCam(frame, [
    { at: 0, a: aim(vertical, LX, 1160, 1.8), b: aim(vertical, LX + 20, 1150, 2.0) },
    { at: b - 2, a: aim(vertical, LX + 100, 1120, 1.15), b: aim(vertical, LX + 140, 1110, 1.28) },
  ], dur);
  const t = frame - b + 10;
  const m1 = t < 0 ? 1700 : t < 40 ? 1700 - t * 4 : 1540 + (t - 40) * 5;
  const turned = t >= 40;
  const pull = iv(frame, [b, b + 30], [0, 1], ease);
  return (
    <AbsoluteFill>
      <Meadow cam={cam} seed="la" mid={<g transform={`translate(1560 1290) scale(0.7) translate(0 ${-FLOOR})`}><House x={0} poor /></g>} />
      <Layer d={1} cam={cam}>
        <Defs />
        <Wall x0={560} x1={1400} />
        <Actor x={LX} y={sitY(FLOOR - 8, S, true)} s={S} outfit={LEPER_POOR} pose={{ ...SITG, head: 12, lean: 6 }} mood="frown" seat="ground" />
        <FolkWalk x={m1} i={0} walking={t >= 0 && (t < 36 || t > 44)} flip={!turned} mood={turned ? "frown" : "neutral"} />
        <FolkWalk x={m1 + 160} i={2} walking={t >= 0 && (t < 36 || t > 44)} flip={!turned} />
        <FolkWalk x={m1 + 330} i={4} walking={t >= 0 && (t < 30 || t > 40)} flip={t < 34} mood={t >= 34 ? "frown" : "neutral"} />
        <FolkWalk x={m1 + 480} i={1} walking={t >= 0 && (t < 30 || t > 40)} flip={t < 34} />
        <Actor x={500 - pull * 220} y={FLOOR} s={S * 0.95} outfit={{ ...FOLK(1), wrap: "#8a5a6a" }} pose={pull > 0 && pull < 1 ? walkBy(-(500 - pull * 220), S) : { ...STAND, armRU: -60, armRL: -20 }} flip mood="tight" />
        <Actor x={620 - pull * 220} y={FLOOR} s={S * 0.6} outfit={FOLK(3)} pose={pull > 0 && pull < 1 ? walkBy(-(620 - pull * 220), S * 0.6) : STAND} flip={pull > 0} />
      </Layer>
      <Layer d={1} cam={cam}><Dust n={16} y0={900} y1={1400} opacity={0.25} seed="la" /></Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
/** "People turned away from him": in the market, two men look at his bare head and turn their backs */
export const BaldMarket: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { Wd } = useL();
  const turn = Wd("N06", "turned") - 2;
  const BX = 1000;
  const cam = cutCam(frame, [
    { at: 0, a: aim(vertical, BX, HEAD + 60, 2.0), b: aim(vertical, BX, HEAD + 50, 2.2) },
    { at: turn - 6, a: aim(vertical, BX + 180, 1100, 1.2), b: aim(vertical, BX + 200, 1090, 1.32) },
  ], dur);
  const away = iv(frame, [turn + 6, dur], [0, 260]);
  return (
    <AbsoluteFill>
      <Meadow cam={cam} seed="bm" trees={4} mid={<g transform={`translate(0 1290) scale(0.8) translate(0 ${-FLOOR})`}><Stalls x={-200} /></g>} />
      <Layer d={1} cam={cam}>
        <Defs />
        <Actor x={BX} y={FLOOR} s={S} outfit={BALD_POOR} pose={{ ...STAND, armRU: -158, armRL: -78, head: 10, lean: 3 }} mood="frown" />
        <FolkWalk x={1380 + away} i={0} walking={frame >= turn + 6} flip={frame < turn} mood={frame < turn ? "sneer" : "neutral"} />
        <FolkWalk x={1560 + away} i={3} walking={frame >= turn + 6} flip={frame < turn} mood={frame < turn ? "sneer" : "neutral"} />
        <FolkWalk x={1740 + away * 1.1} i={2} walking={frame >= turn + 10} flip={frame < turn + 4} mood={frame < turn ? "sneer" : "neutral"} />
        <FolkWalk x={640 - away} i={4} walking={frame >= turn + 8} flip={frame >= turn + 2} mood={frame < turn ? "sneer" : "neutral"} />
      </Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
/** the blind man feeling his way along the river path; a passer-by steps aside */
export const BlindPath: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const x = 820 + frame * 0.9;
  const tap = Math.sin(frame * 0.3) * 10;
  const p = 1900 - frame * 3.2;
  const cam = cutCam(frame, [{ at: 0, a: aim(vertical, x + 40, HEAD + 120, 1.9), b: aim(vertical, x + 80, HEAD + 110, 2.05) }], dur);
  return (
    <AbsoluteFill>
      <Meadow cam={cam} seed="bp" />
      <Layer d={1} cam={cam}>
        <Defs />
        <FolkWalk x={p} i={1} walking flip s={S * 0.92} />
        <Actor x={x} y={FLOOR} s={S} outfit={BLIND_POOR} pose={{ ...walkBy(x, S, 0.45), armRU: -34 - tap }} hold={<Cane />} mood="neutral" />
      </Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
/** "So He sent them an angel": a soft light comes down over the valley; a blurred figure walks out of it */
export const AngelSent: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { Wd } = useL();
  const sent = Wd("N08", "sent") - 4;
  const beam = iv(frame, [10, 40], [0, 1], ease);
  const show = iv(frame, [sent - 14, sent + 2], [0, 1]);
  const ax = 860 + iv(frame, [sent + 2, dur], [0, 120]);
  const cam = cutCam(frame, [
    { at: 0, a: aim(vertical, 960, 1000, 0.95), b: aim(vertical, 960, 980, 1.05) },
    { at: sent - 2, a: aim(vertical, 900, 1030, 1.55), b: aim(vertical, 960, 1020, 1.75) },
  ], dur);
  return (
    <AbsoluteFill>
      <Meadow cam={cam} seed="as" sky="dawn" sunX={960} sunY={700} />
      <Layer d={1} cam={cam}>
        <Defs />
        <path d={`M 860 -400 L 1060 -400 L 1180 ${FLOOR} L 760 ${FLOOR} Z`} fill="#fff6dc" opacity={0.35 * beam} />
        <Glow x={900} y={1000} r={420} o={0.6 * beam} />
        {show > 0 ? <AngelFig x={ax} pose={frame > sent + 2 ? walkBy(ax, S) : STAND} o={show} /> : null}
      </Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// ───────── The wish: the angel comes leading an animal, asks, wipes his hand over the man, heals and gives ─────────
const WISH: Record<Who, { ask: string; ns1: string; ans: string; wipe: string; heal: [string, string]; ask2: string; ns2: string; ans2: string; gift: string; bless?: string; walk?: string }> = {
  leper: { ask: "N10", ns1: "NS", ans: "L2", wipe: "N11", heal: ["N12_a", "gone"], ask2: "N13", ns2: "NS_2", ans2: "L3", gift: "N14", bless: "angel", walk: "N15" },
  bald: { ask: "N17", ns1: "NS_3", ans: "B1", wipe: "N18", heal: ["N18", "grew"], ask2: "N19", ns2: "NS_4", ans2: "B2", gift: "N20", bless: "angel", walk: "N21" },
  blind: { ask: "N23", ns1: "NS_5", ans: "BL1", wipe: "N24", heal: ["N25", "sight"], ask2: "N26", ns2: "NS_6", ans2: "BL2", gift: "N27" },
};
export const Wish: React.FC<{ who: Who }> = ({ who }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd, from } = useL();
  const w = WISH[who];
  const kind = KIND[who];
  const ids = beatsIn(from, from + dur);
  const mine = speakerIds(ids, PRE[who]);
  const m = useMouth(...mine);
  const talk = useTalk(...mine);
  const MX = 1160;
  const ask = L(w.ask);
  const arrive = ask + 80;
  const wipe = L(w.wipe);
  const healAt = Wd(w.heal[0], w.heal[1]) - 2;
  const giftAt = L(w.gift);
  // the animal is only brought once he has asked for it: the angel leads it in from off-screen on its rope
  const inStart = giftAt - 6, G = giftAt + 50;
  const leave = w.walk ? L(w.walk) + 6 : 99999;
  // the angel walks in leading the animal, steps close to wipe his hand over the man, steps back, then leaves
  const inX = -200 + iv(frame, [ask - 12, arrive], [0, 1080]);
  let ax = inX + iv(frame, [wipe - 4, wipe + 10, healAt + 24, healAt + 40], [0, 90, 90, 0]);
  ax -= iv(frame, [leave, leave + 140], [0, 1300]);
  const aWalk = (frame > ask - 12 && frame < arrive) || (frame > wipe - 4 && frame < wipe + 10) || (frame > healAt + 24 && frame < healAt + 40) || (frame > leave && frame < leave + 140);
  const aFlip = frame > leave || (frame > healAt + 24 && frame < healAt + 40);
  // the man: the leper sits until he is healed; the bald man keeps a hand over his head; the blind man taps his stick
  const healed = iv(frame, [healAt, healAt + 18], [0, 1], ease);
  const stand = who === "leper" ? iv(frame, [healAt + 26, healAt + 46], [0, 1], ease) : 1;
  const manY = sitY(FLOOR - 8, S, true) * (1 - stand) + FLOOR * stand;
  const manHead = manY - 232 * S;
  const takes = iv(frame, [G + 4, G + 16], [0, 1], ease);
  let pose: Pose = who === "bald" ? { ...STAND, armRU: -158 + 120 * healed, armRL: -78 + 60 * healed, head: 10 * (1 - healed) } : { ...STAND, head: 8 * (1 - healed) };
  if (stand < 1) pose = blend({ ...SITG, head: 10 }, pose, stand);
  const tap = who === "blind" && healed < 1 ? Math.sin(frame * 0.3) * 8 : 0;
  pose = { ...pose, armRU: pose.armRU - tap - 10 * talk };
  if (takes > 0) pose = { ...pose, armRU: pose.armRU * (1 - takes) - 70 * takes, armRL: pose.armRL * (1 - takes) - 10 * takes };
  const outfit: Outfit = who === "leper" ? { ...LEPER_POOR, spots: 1 - healed } : who === "bald" ? { ...BALD_POOR, shine: 1 - healed, hair: "#24170f", hairAmt: healed } : { ...BLIND_POOR, glasses: healed < 0.5 };
  const mood: Mood = m > 0 ? "neutral" : healed > 0.6 ? "smile" : "frown";
  // the wipe: the angel's hand passes over the man's head and down over him
  const wp = iv(frame, [wipe + 12, healAt + 20], [0, 1]);
  const wiping = frame >= wipe + 10 && frame < healAt + 24;
  const tx = MX - 10 + Math.sin(wp * Math.PI * 3) * 14, ty = manHead - 36 + wp * 190;
  let aPose: Pose = aWalk ? walkBy(aFlip ? -ax : ax, S) : { ...STAND, head: -4 };
  if (wiping) { const r = reach(ax, FLOOR, S, false, tx, ty); aPose = { ...STAND, armRU: r.u, armRL: r.l, head: 6, lean: 4 }; }
  // the rope: in the angel's far hand while he leads; held out to the man; then in the man's hand
  const lead = frame >= inStart && frame < G + 10;
  if (lead && !aWalk) aPose = { ...aPose, armLU: 30, armLL: -10 };
  const give = iv(frame, [G - 4, G + 10], [0, 1], ease) * (1 - iv(frame, [G + 24, G + 34], [0, 1]));
  if (give > 0 && !wiping) { const r = reach(ax, FLOOR, S, false, MX - 150, FLOOR - 330); aPose = { ...aPose, armRU: aPose.armRU * (1 - give) + r.u * give, armRL: aPose.armRL * (1 - give) + r.l * give }; }
  // the animal follows the angel in, then walks behind to stand by its new owner
  const trail = TRAIL[kind];
  const anStart = Math.min(ax, inX) - trail;
  const come = iv(frame, [inStart, G - 6], [0, 1]);
  const goBy = iv(frame, [G + 16, G + 90], [0, 1]);
  const anX = goBy === 0 ? anStart - 760 * (1 - come) : anStart + (MX + 340 - anStart) * goBy;
  const anWalking = (come > 0 && come < 1) || (goBy > 0 && goBy < 1);
  const anY = FLOOR - 26;
  const [hx, hy] = HEAD_AT[kind];
  const animalHead = { x: anX + hx * (kind === "camel" ? 0.95 : 1), y: anY + hy * (kind === "camel" ? 0.95 : 1) };
  const ropeEnd = frame < G ? handAt(ax, FLOOR, S, aFlip, aPose.armLU, aPose.armLL, false) : frame < G + 10 ? handAt(ax, FLOOR, S, aFlip, aPose.armRU, aPose.armRL, true) : handAt(MX, manY, S, true, pose.armRU, pose.armRL, true);
  const showAnimal = frame > inStart;
  const rope = showAnimal; // the rope stays in his hand from the moment he takes it
  // camera
  const AXc = Math.max(300, ax);
  const two = (z: number): Cam => aim(vertical, (AXc + MX) / 2, 1060, vertical ? Math.min(z, 1.4) : z);
  const onMan = (z = 1.95): Cam => aim(vertical, MX - 20, stand < 1 ? 1150 : HEAD + 120, z);
  const onAngel = (z = 1.9): Cam => aim(vertical, AXc + 20, HEAD + 120, z);
  const shots: Shot[] = [
    { at: 0, a: onMan(1.75), b: onMan(1.95) },
    { at: ask - 2, a: aim(vertical, 420, 980, 0.95), b: aim(vertical, 720, 970, 1.05) },
    { at: arrive - 14, a: onAngel(), b: onAngel(2.1) },
    { at: L(w.ns1) - 2, a: onMan(1.9), b: onMan(2.1) },
    { at: L(w.ans) - 2, a: onMan(2.2), b: onMan(2.4) },
    { at: wipe - 2, a: two(1.5), b: two(1.7) },
    { at: healAt, a: onMan(1.85), b: onMan(2.15) },
    { at: L(w.ask2) - 2, a: onAngel(1.9), b: onAngel(2.05) },
    { at: L(w.ns2) - 2, a: onMan(2.0), b: onMan(2.15) },
    { at: L(w.ans2) - 2, a: onMan(2.25), b: onMan(2.4) },
    { at: giftAt - 2, a: two(1.1), b: two(1.22) },
    { at: G + 34, a: aim(vertical, MX + 160, 1000, 1.05), b: aim(vertical, MX + 200, 990, 1.15) },
  ];
  if (who === "leper") shots.push({ at: L("N12_b") - 2, a: onMan(2.0), b: onMan(2.2) });
  if (w.bless) shots.push({ at: Wd(w.gift, w.bless) - 2, a: onAngel(2.0), b: onAngel(2.15) });
  if (w.walk) shots.push({ at: L(w.walk) - 2, a: aim(vertical, 700, 1040, 1.0), b: aim(vertical, 600, 1040, 1.1) });
  const cam = shook(cutCam(frame, shots, dur), frame, [healAt], 8);
  const pov = who === "blind" ? iv(frame, [wipe, wipe + 8, healAt, healAt + 22], [0, 1, 1, 0]) : 0;
  return (
    <AbsoluteFill style={{ filter: pov > 0.01 ? `blur(${pov * 16}px) brightness(${1 + pov * 0.2})` : undefined }}>
      <Meadow cam={cam} seed={`w${who}`} sky={who === "bald" ? "dusk" : "day"} sunX={who === "bald" ? 520 : 1480} sunY={who === "bald" ? 880 : 760}
        mid={who === "leper" ? <g transform={`translate(1760 1290) scale(0.7) translate(0 ${-FLOOR})`}><House x={0} poor /></g> : who === "bald" ? <g transform={`translate(0 1290) scale(0.8) translate(0 ${-FLOOR})`}><Stalls x={1500} /></g> : undefined} />
      <Layer d={1} cam={cam}>
        <Defs />
        {who === "leper" ? <Wall x0={760} x1={1800} /> : null}
        {showAnimal ? <g transform={`translate(${anX} ${anY})`}><Animal kind={kind} walk={anWalking ? anX : undefined} graze={frame * 0.05} s={kind === "camel" ? 0.95 : 1} /></g> : null}
        <Glow x={MX} y={1050} r={360} o={0.6 * Math.sin(Math.PI * healed)} />
        <Actor x={MX} y={manY} s={S} outfit={outfit} pose={pose} flip mouth={m} mood={mood} seat={stand < 1 ? "ground" : undefined} hold={who === "blind" && healed < 0.5 ? <Cane /> : undefined} />
        {who === "blind" && healed >= 0.5 ? <line x1={MX + 120} y1={FLOOR - 8} x2={MX + 320} y2={FLOOR - 4} stroke="#5a3a22" strokeWidth={11} strokeLinecap="round" /> : null}
        {rope ? <Rope x1={animalHead.x} y1={animalHead.y} x2={ropeEnd.x} y2={ropeEnd.y} /> : null}
        {frame > ask - 14 && ax > -400 ? <AngelFig x={ax} pose={aPose} flip={aFlip} /> : null}
      </Layer>
      <Layer d={1} cam={cam}><Dust n={18} y0={900} y1={1400} opacity={0.25} seed={`w${who}`} /></Layer>
      <Flash at={healAt} len={10} max={0.45} />
      <Vignette s={0.35} />
    </AbsoluteFill>
  );
};

// ───────── Each man's own valley: the births, the herds multiplying, the three rich men ─────────
const Valley: React.FC<{ who: Who; t0: number; n: number; rich?: boolean; birth?: boolean; dark?: number; dusk?: boolean }> = ({ who, t0, n, rich, birth, dark = 0, dusk }) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - t0);
  const { vertical } = useView();
  const kind = KIND[who];
  const young = iv(f, [6, 20], [0, 1], easeOut);
  const cam: Cam = birth ? aim(vertical, 1060 + f * 0.5, 1020, 1.4 + f * 0.0015) : rich ? aim(vertical, 1120 + f * 0.6, 1020, 1.15 + f * 0.0012) : aim(vertical, 960 + f * 1.0, 1060, 1.0 + f * 0.001);
  const outfit = rich ? RICH[who] : POOR_HEALED[who];
  return (
    <AbsoluteFill style={{ filter: dark ? `brightness(${1 - 0.5 * dark}) saturate(${1 - 0.65 * dark})` : undefined }}>
      <Meadow cam={cam} seed={`v${who}`} sky={dusk ? "dusk" : "day"} sunX={dusk ? 520 : 1480} sunY={dusk ? 880 : 760}
        back={<Herd kind={kind} n={n * 1.8} x0={-400} x1={2400} y0={1192} y1={1234} frame={frame} seed={`hb${who}`} s={0.2} />}
        far={<Herd kind={kind} n={n * 1.4} x0={-500} x1={2500} y0={1128} y1={1168} frame={frame} seed={`hf${who}`} s={0.11} />}
        bridge={480} />
      <Layer d={1} cam={cam}>
        <Defs />
        <House x={1720} rich={rich} poor={!rich} />
        {birth ? <g transform={`translate(1260 ${FLOOR - 20})`}><Animal kind={kind} graze={frame * 0.05} flip s={kind === "camel" ? 0.95 : 1} />{young > 0 ? <g opacity={young} transform={`translate(${kind === "camel" ? -260 : -190} 4)`}><Glow x={0} y={-120} r={160} o={0.4 * (1 - young * 0.5)} /><Animal kind={kind} young graze={frame * 0.08 + 2} flip s={kind === "camel" ? 0.95 : 1} /></g> : null}</g> : null}
        <Actor x={birth ? 700 : 900} y={FLOOR} s={S} outfit={outfit} pose={rich ? { ...STAND, armRU: -24, armLU: -14 } : STAND} mood={dark ? "tight" : "smile"} />
      </Layer>
      {dusk ? <Grade color="#4a1d3a" opacity={0.25} /> : null}
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
export const Valleys: React.FC<{ mode: "grow" | "tease" | "judged" }> = ({ mode }) => {
  const { frame } = useShot();
  const { L, Wd } = useL();
  if (mode === "tease") {
    const cuts = [0, Wd("N03_a", "given") - 4, Wd("N03_a", "asked") - 4, L("N03_b") - 2];
    const k = cuts.filter((c) => frame >= c).length - 1;
    if (k === 3) return <AngelComesBack t0={cuts[3]} />;
    return <Valley who={WHO3[k]} t0={cuts[k]} n={48} rich />;
  }
  if (mode === "judged") {
    // two valleys go dark and quiet, the third stays in the light (three cuts)
    const len = Math.max(30, L("N54_b") - 2 > 0 ? L("N54_b") - 2 : 90);
    const k = Math.min(2, Math.floor(frame / (len / 3)));
    return <Valley who={WHO3[k]} t0={Math.round(k * len / 3)} n={48} rich dark={k < 2 ? iv(frame - k * len / 3, [0, 18], [0, 1]) : 0} />;
  }
  const b = [0, L("N28_b") - 2, L("N28_c") - 2];
  const n29 = L("N29") - 2, n30 = L("N30") - 2, n31 = L("N31") - 2, n32 = L("N32") - 2;
  if (frame < n29) { const k = frame >= b[2] ? 2 : frame >= b[1] ? 1 : 0; return <Valley who={WHO3[k]} t0={b[k]} n={1} birth />; }
  if (frame < n30) { const step = Math.max(1, Math.floor((n30 - n29) / 4)); const i = Math.min(3, Math.floor((frame - n29) / step)); return <Valley who={WHO3[i % 3]} t0={n29 + i * step} n={4 + (frame - n29) * 0.55} />; }
  if (frame < n31) { const c = [n30, Wd("N30", "one", 1) - 4, Wd("N30", "one", 2) - 4]; const k = frame >= c[2] ? 2 : frame >= c[1] ? 1 : 0; return <Valley who={WHO3[k]} t0={c[k]} n={56} />; }
  if (frame < n32) { const step = Math.max(1, Math.floor((n32 - n31) / 3)); const k = Math.min(2, Math.floor((frame - n31) / step)); return <Valley who={WHO3[k]} t0={n31 + k * step} n={60} rich />; }
  return <AngelComesBack t0={n32} />;
};
/** the angel, in the form of a poor traveller, walking back along the river path at dusk */
const AngelComesBack: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = Math.max(0, useCurrentFrame() - t0);
  const { vertical } = useView();
  const x = 600 + f * 2.2;
  const cam = aim(vertical, x + 60, HEAD + 140, 1.55 + f * 0.002);
  return (
    <AbsoluteFill>
      <Meadow cam={cam} seed="acb" sky="dusk" sunX={520} sunY={880} />
      <Layer d={1} cam={cam}><Defs /><AngelFig x={x} outfit={ANGEL_AS.leper} pose={walkBy(x, S)} /></Layer>
      <Grade color="#4a1d3a" opacity={0.25} />
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// ───────── The gate: the cold open and the three tests ─────────
const TEST: Record<Who, { came: string; reveal?: string; said1?: string; reply1?: string; remind?: string; said2?: string; reply2?: string; curse?: string }> = {
  leper: { came: "N34_a", reveal: "N34_b", said1: "N37", reply1: "L4", remind: "N38_a", said2: "N39", reply2: "L1_2", curse: "N40" },
  bald: { came: "N42", said1: "N43_b", reply1: "B3", remind: "N44", reply2: "B4", curse: "N45" },
  blind: { came: "N48", said1: "N51", reply1: "BL3" },
};
export const Gate: React.FC<{ who: Who; cold?: boolean }> = ({ who, cold }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd, from } = useL();
  const t = TEST[who];
  const ids = beatsIn(from, from + dur);
  const mine = speakerIds(ids, PRE[who]);
  const m = useMouth(...mine);
  const talk = useTalk(...mine);
  const MX = 1180;
  const came = cold ? -999 : L(t.came);
  const stop = came + 80;
  const tx = cold ? 780 : 60 + iv(frame, [came, stop], [0, 720]);
  const walking = !cold && frame > came && frame < stop;
  const curse = t.curse ? Wd(t.curse, "may") : 99999;
  const cursed = iv(frame, [curse, curse + 20], [0, 1]);
  const angry = (t.reply1 && frame >= L(t.reply1) - 2) || cold;
  let mood: Mood = who === "blind" ? "smile" : cold ? "sneer" : "neutral";
  if (who !== "blind" && !cold) mood = frame >= curse ? "shock" : t.reply2 && frame >= L(t.reply2) - 2 ? "sneer" : t.remind && frame >= L(t.remind) ? "frown" : angry ? "tight" : "neutral";
  if (m > 0.05 && who !== "blind") mood = mood === "shock" ? "shock" : "sneer";
  const give = who === "blind" ? iv(frame, [L("BL4"), L("BL4") + 16], [0, 1], ease) : 0;
  const pose: Pose = who === "blind"
    ? { ...STAND, armRU: -30 - 70 * give - 10 * talk, armRL: -20 + 20 * give, armLU: -10 - 40 * give, head: -2 }
    : { ...STAND, armRU: -18 - 8 * talk, armRL: -40, head: angry && who === "leper" && t.reply1 && frame < (t.remind ? L(t.remind) : 99999) ? -14 : 0, lean: -3 * cursed };
  const onMan = (z = 2.1): Cam => aim(vertical, MX - 20, HEAD + 120, z);
  const onT = (z = 2.0): Cam => aim(vertical, tx + 20, HEAD + 130, z);
  const two = (z: number): Cam => aim(vertical, (tx + MX) / 2, 1060, vertical ? Math.min(z, 1.4) : z);
  const shots: Shot[] = [];
  if (cold) {
    shots.push(
      { at: 0, a: aim(vertical, MX - 30, HEAD + 18, 3.2), b: aim(vertical, MX - 30, HEAD + 18, 3.5) },
      { at: L("L1") + 70, a: onMan(2.4), b: onMan(2.6) },
      { at: L("N01") - 2, a: aim(vertical, MX - 30, HEAD + 30, 2.9), b: aim(vertical, MX - 30, HEAD + 30, 3.3) },
      { at: L("N02") - 2, a: onT(2.3), b: onT(2.6) },
      { at: Wd("N02", "because") - 4, a: two(1.4), b: two(1.55) },
    );
  } else {
    shots.push({ at: 0, a: aim(vertical, 1350, 1020, 1.0), b: aim(vertical, 1300, 1030, 1.12) }, { at: came - 2, a: two(1.0), b: two(1.12) });
    if (t.reveal) shots.push({ at: L(t.reveal) - 2, a: onT(2.3), b: onT(2.6) });
    for (const id of ids) {
      if (!/^N(3[5-8]|49|50)/.test(id) && !(who === "bald" && /^N4[23](_a)?$/.test(id))) continue;
      const a = L(id) - 2;
      if (a < stop - 10) continue;
      shots.push({ at: a, a: onT(1.95), b: onT(2.1) }, { at: a + Math.round((V.lines[id].f1 - V.lines[id].f0) * 0.62), a: onMan(1.9), b: onMan(2.0) });
    }
    if (t.said1) shots.push({ at: L(t.said1) - 2, a: onMan(1.8), b: onMan(1.95) });
    if (t.reply1) shots.push({ at: L(t.reply1) - 2, a: onMan(2.3), b: onMan(2.5) });
    if (t.remind) shots.push({ at: L(t.remind) - 2, a: onT(2.0), b: onT(2.2) });
    if (t.said2) shots.push({ at: L(t.said2) - 2, a: onMan(2.0), b: onMan(2.1) });
    if (t.reply2) shots.push({ at: L(t.reply2) - 2, a: aim(vertical, MX - 30, HEAD + 18, 3.0), b: aim(vertical, MX - 30, HEAD + 18, 3.3) });
    if (t.curse) shots.push({ at: L(t.curse) - 2, a: onT(2.1), b: onT(2.35) }, { at: curse - 2, a: onMan(2.2), b: onMan(2.6) });
    if (who === "bald") shots.push({ at: L("N46") - 2, a: aim(vertical, 1100, 1020, 0.95), b: aim(vertical, 1150, 1020, 1.05) });
    if (who === "blind") shots.push({ at: L("BL4") - 2, a: aim(vertical, MX + 200, 1000, 1.1), b: aim(vertical, MX + 240, 1000, 1.22) });
  }
  const cam = shook(cutCam(frame, shots, dur), frame, t.curse ? [curse] : [], 10);
  const night = who === "bald" && frame >= L("N46") ? 1 : 0;
  const kind = KIND[who];
  return (
    <AbsoluteFill>
      <Meadow cam={cam} seed={`g${who}`} sky={night ? "night" : who === "blind" ? "day" : "dusk"} sunX={who === "blind" ? 1480 : 520} sunY={who === "blind" ? 760 : 880}
        back={<Herd kind={kind} n={70} x0={-400} x1={2400} y0={1192} y1={1234} frame={frame} seed={`gb${who}`} s={0.2} />}
        far={<Herd kind={kind} n={56} x0={-500} x1={2500} y0={1128} y1={1168} frame={frame} seed={`gf${who}`} s={0.11} />} bridge={560}
 />
      <Layer d={1} cam={cam}>
        <Defs />
        <House x={1720} rich />
        {who === "blind" ? <Glow x={MX} y={1050} r={420} o={0.3 + 0.25 * give} /> : null}
        <Actor x={MX} y={FLOOR} s={S} outfit={RICH[who]} pose={pose} flip mouth={m} mood={mood} />
        <AngelFig x={tx} outfit={ANGEL_AS[who]} pose={walking ? walkBy(tx, S, 0.7) : { ...STAND, head: 4 }} hold={who === "blind" ? <Cane /> : undefined} />
      </Layer>
      <Layer d={1} cam={cam}><Dust n={14} y0={900} y1={1400} opacity={0.2} seed={`gt${who}`} /></Layer>
      {cursed > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: 0.25 * cursed }} /> : null}
      {night ? <Grade color="#1a2550" opacity={0.4} mode="multiply" /> : null}
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// ───────── The verdict ─────────
export const Verdict: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const MX = 1180, TX = 780;
  const rise = iv(frame, [0, Wd("N53", "pleased") + 10], [0.2, 1], ease);
  const angry = Wd("N53", "angry") - 3;
  const cam = cutCam(frame, [
    { at: 0, a: aim(vertical, TX + 20, HEAD + 130, 2.0), b: aim(vertical, TX + 20, HEAD + 120, 2.25) },
    { at: L("N52_b") - 2, a: aim(vertical, (TX + MX) / 2, 1060, 1.3), b: aim(vertical, (TX + MX) / 2, 1060, 1.45) },
    { at: L("N53") - 2, a: aim(vertical, MX - 20, HEAD + 120, 2.0), b: aim(vertical, MX - 20, HEAD + 110, 2.3) },
  ], dur);
  if (frame >= angry) {
    const len = Math.max(1, dur - angry);
    const k = Math.min(1, Math.floor((frame - angry) / (len / 2)));
    return <Valley who={WHO3[k]} t0={Math.round(angry + k * len / 2)} n={22} rich dark={iv(frame - angry - k * len / 2, [0, 14], [0, 1])} />;
  }
  return (
    <AbsoluteFill>
      <Meadow cam={cam} seed="gblind" back={<Herd kind="sheep" n={70} x0={-400} x1={2400} y0={1192} y1={1234} frame={frame} seed="gbblind" s={0.2} />} far={<Herd kind="sheep" n={56} x0={-500} x1={2500} y0={1128} y1={1168} frame={frame} seed="gfblind" s={0.11} />} bridge={560} />
      <Layer d={1} cam={cam}>
        <Defs />
        <House x={1720} rich />
        <Glow x={TX} y={900} r={300 + 300 * rise} o={0.4 + 0.4 * rise} />
        <Glow x={MX} y={1000} r={360} o={0.45 * rise} />
        <Actor x={MX} y={FLOOR} s={S} outfit={BLIND_RICH} pose={{ ...STAND, armRU: -20, armLU: -10, head: -4 }} flip mood="smile" />
        <AngelFig x={TX} outfit={ANGEL_AS.blind} hold={<Cane />} />
      </Layer>
      <Flash at={Wd("N53", "pleased")} len={12} max={0.35} />
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// ───────── The ending: the same answer twice, and the one who remembered ─────────
const Close: React.FC<{ who: Who; mouth: number; mood: Mood; dark?: number; t0: number; slot?: "a" | "b" }> = ({ who, mouth, mood, dark = 0, t0, slot }) => {
  const f = Math.max(0, useCurrentFrame() - t0);
  const { vertical } = useView();
  const z = (slot ? 2.0 : 2.4) + f * 0.0015;
  const off = slot ? (slot === "a" ? 1 : -1) * (1920 / 4) / z : 0;
  const cam = vertical ? aim(vertical, 1160, HEAD + 60 + off - f * 0.1, z) : aim(vertical, 1160 + off, HEAD + 60 - f * 0.1, z);
  return (
    <AbsoluteFill style={{ filter: dark ? `brightness(${1 - 0.45 * dark}) saturate(${1 - 0.6 * dark})` : undefined }}>
      <Meadow cam={cam} seed={`g${who}`} sky={who === "blind" ? "day" : "dusk"} sunX={who === "blind" ? 1480 : 520} sunY={who === "blind" ? 760 : 880} />
      <Layer d={1} cam={cam}><Defs /><House x={1720} rich /><Actor x={1180} y={FLOOR} s={S} outfit={RICH[who]} pose={STAND} flip mouth={mouth} mood={mood} /></Layer>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};
export const Ending: React.FC = () => {
  const { frame } = useShot();
  const { vertical } = useView();
  const { L } = useL();
  const lm = useMouth("L1_3");
  const bm = useMouth("BL3_2");
  const a = L("N54_b") - 2, b = L("N55") - 2, c = L("N56_a") - 2, d = L("N56_b") - 2, e = L("N57_a") - 2;
  if (frame < a) {
    const k = Math.min(2, Math.floor(frame / (a / 3)));
    return <Valley who={WHO3[k]} t0={Math.round(k * a / 3)} n={22} rich dark={k < 2 ? 1 : 0} />;
  }
  if ((frame >= a && frame < b) || (frame >= c && frame < d)) {
    const lie = frame < b;
    const t0 = lie ? a : c;
    const clipA = vertical ? "inset(0 0 50% 0)" : "inset(0 50% 0 0)";
    const clipB = vertical ? "inset(50% 0 0 0)" : "inset(0 0 0 50%)";
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ clipPath: clipA }}><Close who="leper" mouth={lie ? lm : 0} mood={lie ? "sneer" : "tight"} dark={lie ? 0 : 1} t0={t0} slot="a" /></AbsoluteFill>
        <AbsoluteFill style={{ clipPath: clipB }}><Close who="bald" mouth={lie ? lm : 0} mood={lie ? "sneer" : "tight"} dark={lie ? 0 : 1} t0={t0} slot="b" /></AbsoluteFill>
        <AbsoluteFill style={vertical ? { top: "50%", height: 6, marginTop: -3, backgroundColor: "#000" } : { left: "50%", width: 6, marginLeft: -3, backgroundColor: "#000" }} />
      </AbsoluteFill>
    );
  }
  if (frame < e) return <Close who="blind" mouth={frame < c ? bm : 0} mood="smile" t0={frame < c ? b : d} />;
  return <AngelLeaves t0={e} />;
};
/** the last shot: the angel walks away into the light (under the closing question) */
const AngelLeaves: React.FC<{ t0: number }> = ({ t0 }) => {
  const frame = Math.max(0, useCurrentFrame() - t0);
  const { vertical } = useView();
  const x = 900 + frame * 2.2;
  const cam = aim(vertical, 960 + frame * 1.2, 1040, 1.2 + frame * 0.0012);
  return (
    <AbsoluteFill>
      <Meadow cam={cam} seed="end" sky="dawn" sunX={1500} sunY={820} />
      <Layer d={1} cam={cam}><Defs /><Glow x={1500} y={1000} r={600} o={0.6} /><AngelFig x={x} pose={walkBy(x, S)} /></Layer>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};
