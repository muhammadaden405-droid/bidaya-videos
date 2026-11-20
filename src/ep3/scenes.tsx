import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { STAND, blend, Pose, Outfit, Mood } from "../cartoon/Rig";
import { FOLK } from "../cartoon/Trailer";
import { Camel } from "../ep1/kit";
import { LEPER_POOR, LEPER_RICH, BALD_POOR, BALD_RICH, BLIND_POOR, BLIND_RICH, ANGEL, ANGEL_AS } from "./cast";
import { Cow, Sheep, Herd } from "./animals";
import {
  Actor, sitY, useMouth, useTalk, walkBy, Cane, V, Cam, Layer, Defs, Sky, SKIES, ridge, iv, ease, easeOut, useShot, useView, aim,
  Dust, DustBurst, Grade, Vignette, Glow, Flash, SITG, FLOOR, Shot, useL, beatsIn, speakerIds, cutCam, shook,
} from "./kit";

// Episode 3 — The Blind Man, the Leper and the Bald Man. Every scene is cut on the voice beats (owner's rule:
// a cut or a clear camera move at least every 3 seconds), and every beat lands on the word it belongs to.
export type Who = "leper" | "bald" | "blind";
const RICH: Record<Who, Outfit> = { leper: LEPER_RICH, bald: BALD_RICH, blind: BLIND_RICH };
const PRE: Record<Who, "L" | "B" | "BL"> = { leper: "L", bald: "B", blind: "BL" };
const KIND: Record<Who, "camel" | "cow" | "sheep"> = { leper: "camel", bald: "cow", blind: "sheep" };
const S = 2; // figure scale (≈ 520 px tall)
const HEAD = FLOOR - 236 * S; // head height of a standing figure
type SkyKey = keyof typeof SKIES;

// ───────── backgrounds ─────────
const House: React.FC<{ x: number; rich?: boolean; c?: string }> = ({ x, rich, c = "#c9a877" }) => (
  <g transform={`translate(${x} ${FLOOR - 6})`}>
    <rect x={-230} y={-330} width={460} height={330} fill={c} stroke="#2b1d18" strokeWidth={6} />
    <rect x={-250} y={-350} width={500} height={30} fill={rich ? "#8a6a3a" : "#a88758"} stroke="#2b1d18" strokeWidth={5} />
    <path d="M -70 0 L -70 -190 Q 0 -260 70 -190 L 70 0 Z" fill="#3a2718" stroke="#2b1d18" strokeWidth={5} />
    {rich ? <path d="M -86 0 L -86 -196 Q 0 -280 86 -196 L 86 0" fill="none" stroke="#e3b341" strokeWidth={8} /> : null}
    <rect x={120} y={-260} width={56} height={60} rx={8} fill="#3a2718" stroke="#2b1d18" strokeWidth={4} />
    <rect x={-176} y={-260} width={56} height={60} rx={8} fill="#3a2718" stroke="#2b1d18" strokeWidth={4} />
  </g>
);
const Land: React.FC<{ cam: Cam; sky?: SkyKey; sunX?: number; sunY?: number; houses?: boolean; ground?: string }> = ({ cam, sky = "dawn", sunX = 1460, sunY = 860, houses = true, ground = "#d9b784" }) => (
  <>
    <Sky stops={SKIES[sky]} />
    <Layer d={0.05} cam={cam}><Defs /><Glow x={sunX} y={sunY} r={460} o={0.7} /><circle cx={sunX} cy={sunY} r={54} fill="#fff3cf" /></Layer>
    <Layer d={0.2} cam={cam}><path d={ridge("e3a", 1120, 160, 220)} fill="#b98a62" opacity={0.75} /></Layer>
    <Layer d={0.42} cam={cam}>
      <path d={ridge("e3b", 1225, 110, 190)} fill="#a37450" />
      {houses ? (
        <g fill="#6f4c36">
          {[60, 330, 1560, 1830].map((x, i) => <g key={i}><rect x={x} y={1080 - (i % 2) * 30} width={190} height={170 + (i % 2) * 30} /><rect x={x + 30} y={1030 - (i % 2) * 30} width={50} height={60} /></g>)}
        </g>
      ) : null}
    </Layer>
    <Layer d={1} cam={cam}>
      <path d={`M -1400 ${FLOOR - 6} Q 960 ${FLOOR - 30} 3400 ${FLOOR - 6} L 3400 2800 L -1400 2800 Z`} fill={ground} />
      <path d={`M -1400 ${FLOOR + 6} Q 960 ${FLOOR - 14} 3400 ${FLOOR + 6} L 3400 ${FLOOR + 90} Q 960 ${FLOOR + 64} -1400 ${FLOOR + 90} Z`} fill="#e9cf9f" />
    </Layer>
  </>
);
/** one animal of a kind, standing on the ground line */
const Animal: React.FC<{ kind: "camel" | "cow" | "sheep"; x: number; frame: number; young?: boolean; preg?: boolean; flip?: boolean; s?: number }> = ({ kind, x, frame, young, preg, flip, s = 1.3 }) => (
  <g transform={`translate(${x} ${FLOOR}) scale(${s})`}>
    {kind === "camel" ? <><Camel phase={0} walk={0} flip={flip} />{young ? <g transform="translate(-120 0) scale(0.45)"><Camel phase={0} walk={0} flip={flip} /></g> : null}</>
      : kind === "cow" ? <Cow graze={frame * 0.05} flip={flip} calf={young} preg={preg} /> : <Sheep graze={frame * 0.06} flip={flip} lamb={young} preg={preg} s={1.3} />}
  </g>
);

// ───────── Village: three men, and the angel is sent ─────────
export const Village: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const n5 = L("N05_a"), n6 = L("N06"), n7 = L("N07"), n8 = L("N08");
  const away = iv(frame, [L("N05_b") - 6, L("N05_b") + 40], [0, 1], easeOut);
  const turn = frame >= Wd("N06", "turned") - 2;
  const bx = 1600 + iv(frame, [n7, n8], [0, 90]);
  const blindWalk = frame >= n7 && frame < n8;
  const sent = iv(frame, [Wd("N08", "sent") - 4, dur], [0, 1], ease);
  const ax = 120 + iv(frame, [Wd("N08", "sent") + 6, dur], [0, 220]);
  const cam = cutCam(frame, [
    { at: 0, a: aim(vertical, 960, 1080, 1.0), b: aim(vertical, 960, 1090, 1.12) },
    { at: n5, a: aim(vertical, 760, 1150, 1.9), b: aim(vertical, 740, 1140, 2.1) },
    { at: L("N05_b"), a: aim(vertical, 560, 1110, 1.4), b: aim(vertical, 520, 1100, 1.52) },
    { at: n6, a: aim(vertical, 1180, 990, 1.95), b: aim(vertical, 1180, 980, 2.15) },
    { at: n7, a: aim(vertical, 1600, 1010, 1.9), b: aim(vertical, 1660, 1000, 2.05) },
    { at: n8, a: aim(vertical, 960, 1080, 1.05), b: aim(vertical, 700, 1080, 1.2) },
    { at: Wd("N08", "sent") - 2, a: aim(vertical, 300, 1020, 1.7), b: aim(vertical, 360, 1010, 1.9) },
  ], dur);
  const tap = Math.sin(frame * 0.3) * 8;
  return (
    <AbsoluteFill>
      <Land cam={cam} sky="dawn" />
      <Layer d={1} cam={cam}>
        <Defs />
        <Glow x={ax} y={1000} r={360} o={0.55 * sent} />
        {sent > 0 ? <Actor x={ax} y={FLOOR} s={S} outfit={ANGEL} pose={frame > Wd("N08", "sent") + 6 ? walkBy(ax, S) : STAND} o={sent} /> : null}
        {/* the leper, sitting alone at the edge of the village (hips on the ground) */}
        <Actor x={760} y={sitY(FLOOR - 8, S, true)} s={S} outfit={LEPER_POOR} pose={{ ...SITG, head: 10, lean: 6 }} mood="frown" seat="ground" flip />
        {/* two villagers step away from him */}
        {[0, 1].map((i) => {
          const x = 520 - i * 120 - away * (240 + i * 60);
          return <Actor key={i} x={x} y={FLOOR} s={S * 0.98} outfit={FOLK(i)} pose={away > 0 && away < 1 ? walkBy(-x, S) : STAND} flip={away > 0} mood="tight" />;
        })}
        {/* the bald man, a hand over his head; people turn away */}
        <Actor x={1160} y={FLOOR} s={S} outfit={BALD_POOR} pose={{ ...STAND, armRU: -150, armRL: -60, head: 8 }} mood="frown" flip />
        <Actor x={1360} y={FLOOR} s={S * 0.96} outfit={FOLK(2)} pose={STAND} flip={!turn} mood="tight" />
        {/* the blind man, feeling his way with a stick */}
        <Actor x={bx} y={FLOOR} s={S} outfit={BLIND_POOR} pose={blindWalk ? { ...walkBy(bx, S, 0.5), armRU: -30 - tap } : { ...STAND, armRU: -30 - tap * 0.4, head: 10 }} hold={<Cane />} mood="neutral" />
      </Layer>
      <Layer d={1} cam={cam}><Dust n={22} y0={900} y1={1400} opacity={0.3} seed="vl" /></Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// ───────── The wish: the angel asks, heals, and gives ─────────
const WISH: Record<Who, { intro: string; ask: string; ans: string; wipe: string; heal: [string, string]; ask2: string; ans2: string; gift: string; walk?: string }> = {
  leper: { intro: "N09", ask: "N10", ans: "L2", wipe: "N11", heal: ["N12_a", "gone"], ask2: "N13", ans2: "L3", gift: "N14", walk: "N15" },
  bald: { intro: "N16", ask: "N17", ans: "B1", wipe: "N18", heal: ["N18", "grew"], ask2: "N19", ans2: "B2", gift: "N20", walk: "N21" },
  blind: { intro: "N22", ask: "N23", ans: "BL1", wipe: "N24", heal: ["N25", "sight"], ask2: "N26", ans2: "BL2", gift: "N27" },
};
export const Wish: React.FC<{ who: Who }> = ({ who }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd, from } = useL();
  const w = WISH[who];
  const ids = beatsIn(from, from + dur);
  const mine = speakerIds(ids, PRE[who]);
  const m = useMouth(...mine);
  const talk = useTalk(...mine);
  const ask = L(w.ask);
  const arrive = ask + 70;
  const ax = 260 + iv(frame, [ask - 10, arrive], [0, 520]);
  const leaveAt = w.walk ? L(w.walk) + 10 : 99999;
  const ax2 = ax - iv(frame, [leaveAt, leaveAt + 120], [0, 900]);
  const angelWalking = (frame > ask - 10 && frame < arrive) || (frame > leaveAt && frame < leaveAt + 120);
  const healAt = Wd(w.heal[0], w.heal[1]) - 2;
  const healed = iv(frame, [healAt, healAt + 18], [0, 1], ease);
  const reach = iv(frame, [L(w.wipe), L(w.wipe) + 16, healAt + 20, healAt + 34], [0, 1, 1, 0], ease);
  const giftAt = L(w.gift) + 4;
  const gift = iv(frame, [giftAt, giftAt + 16], [0, 1], easeOut);
  const MX = 1160;
  // the man: leper sits until he is healed, then stands; bald man covers his head; blind man taps his stick
  const stand = who === "leper" ? iv(frame, [healAt + 20, healAt + 40], [0, 1], ease) : 1;
  const base: Pose = who === "bald" ? { ...STAND, armRU: -150 * (1 - healed) - 20 * healed, armRL: -60 * (1 - healed) - 30 * healed, head: 8 * (1 - healed) } : { ...STAND, head: 6 * (1 - healed) };
  const tap = who === "blind" && healed < 1 ? Math.sin(frame * 0.3) * 8 : 0;
  const pose: Pose = { ...(stand < 1 ? blend({ ...SITG, head: 8 }, base, stand) : base), armRU: (base.armRU ?? -20) - tap - 12 * talk };
  const manY = stand < 1 ? sitY(FLOOR - 8, S, true) * (1 - stand) + FLOOR * stand : FLOOR;
  const outfit: Outfit = who === "leper" ? { ...LEPER_POOR, spots: 1 - healed } : who === "bald" ? { ...BALD_POOR, shine: 1 - healed, hair: "#24170f", hairAmt: healed } : { ...BLIND_POOR, glasses: healed < 0.5 };
  const mood: Mood = m > 0 ? "neutral" : healed > 0.6 ? "smile" : "frown";
  const angelPose: Pose = angelWalking ? walkBy(frame < leaveAt ? ax : ax2, S) : { ...STAND, armRU: -20 - 70 * reach, armRL: -20 + 10 * reach, head: -4 };
  const AX = frame < leaveAt ? ax : ax2;
  const a2 = (z: number): Cam => aim(vertical, (AX + MX) / 2, 1080, vertical ? Math.min(z, 1.45) : z);
  const onMan = (z = 1.95): Cam => aim(vertical, MX - 20, stand < 1 ? 1180 : 1000, z);
  const onAngel = (z = 1.95): Cam => aim(vertical, AX + 20, 1000, z);
  const shots: Shot[] = [
    { at: 0, a: onMan(1.7), b: onMan(1.95) },
    { at: ask - 2, a: a2(1.15), b: a2(1.3) },
    { at: arrive - 10, a: onAngel(), b: onAngel(2.15) },
    { at: L("NS" + ({ leper: "", bald: "_3", blind: "_5" } as Record<Who, string>)[who]) - 2, a: onMan(1.9), b: onMan(2.1) },
    { at: L(w.ans) - 2, a: onMan(2.2), b: onMan(2.4) },
    { at: L(w.wipe) - 2, a: a2(1.4), b: a2(1.55) },
    { at: healAt, a: onMan(1.8), b: onMan(2.15) },
    { at: L(w.ask2) - 2, a: onAngel(1.9), b: onAngel(2.1) },
    { at: L("NS" + ({ leper: "_2", bald: "_4", blind: "_6" } as Record<Who, string>)[who]) - 2, a: onMan(2.1), b: onMan(2.25) },
    { at: giftAt - 2, a: aim(vertical, (MX + 1520) / 2, 1080, vertical ? 1.2 : 1.3), b: aim(vertical, (MX + 1520) / 2 + 20, 1080, vertical ? 1.3 : 1.42) },
  ];
  if (who === "leper") shots.push({ at: L("N12_b") - 2, a: onMan(2.0), b: onMan(2.2) }, { at: Wd("N14", "angel") - 2, a: onAngel(2.0), b: onAngel(2.15) });
  if (who === "bald") shots.push({ at: Wd("N20", "angel") - 2, a: onAngel(2.0), b: onAngel(2.15) });
  if (w.walk) shots.push({ at: L(w.walk) - 2, a: a2(1.05), b: aim(vertical, 600, 1080, 1.15) });
  const cam = shook(cutCam(frame, shots, dur), frame, [healAt], 8);
  // the blind man's first sight: the picture is blurred until Allah gives him back his sight
  const pov = who === "blind" ? iv(frame, [L("N24"), L("N24") + 8, healAt, healAt + 22], [0, 1, 1, 0]) : 0;
  return (
    <AbsoluteFill style={{ filter: pov > 0.01 ? `blur(${pov * 16}px) brightness(${1 + pov * 0.25})` : undefined }}>
      <Land cam={cam} sky={who === "bald" ? "dusk" : "dawn"} sunX={who === "bald" ? 560 : 1460} sunY={who === "bald" ? 920 : 860} />
      <Layer d={1} cam={cam}>
        <Defs />
        <Glow x={AX} y={1000} r={340} o={0.35 + 0.35 * reach} />
        <Glow x={MX} y={1050} r={360} o={0.6 * Math.sin(Math.PI * healed)} />
        {gift > 0 ? <g opacity={gift}><Glow x={1520} y={1150} r={300} o={0.4 * gift} /><Animal kind={KIND[who]} x={1530} frame={frame} preg flip /></g> : null}
        <Actor x={MX} y={manY} s={S} outfit={outfit} pose={pose} flip mouth={m} mood={mood} seat={stand < 1 ? "ground" : undefined} hold={who === "blind" && healed < 0.5 ? <Cane /> : undefined} />
        {who === "blind" && healed >= 0.5 ? <line x1={MX + 130} y1={FLOOR - 8} x2={MX + 330} y2={FLOOR - 4} stroke="#5a3a22" strokeWidth={11} strokeLinecap="round" /> : null}
        {frame > ask - 12 ? <Actor x={AX} y={FLOOR} s={S} outfit={ANGEL} pose={angelPose} flip={frame > leaveAt} mood="neutral" /> : null}
      </Layer>
      <Layer d={1} cam={cam}><DustBurst x={1530} y={FLOOR - 40} at={giftAt} size={1.2} /></Layer>
      <Layer d={1} cam={cam}><Dust n={22} y0={900} y1={1400} opacity={0.3} seed={`w${who}`} /></Layer>
      <Flash at={healAt} len={10} max={0.5} />
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};

// ───────── The valleys: the herds multiply (and the cold-open tease) ─────────
const ZONES: { kind: "camel" | "cow" | "sheep"; x0: number; x1: number; who: Who }[] = [
  { kind: "camel", x0: -260, x1: 560, who: "leper" },
  { kind: "cow", x0: 640, x1: 1280, who: "bald" },
  { kind: "sheep", x0: 1360, x1: 2180, who: "blind" },
];
export const Valleys: React.FC<{ mode: "grow" | "tease" | "judged" }> = ({ mode }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const zc = (k: number, z: number, dy = 0): Cam => aim(vertical, (ZONES[k].x0 + ZONES[k].x1) / 2, 1180 + dy, z);
  let shots: Shot[];
  let grow = 1, dusk = 0, men = 0, road = 0;
  if (mode === "grow") {
    const n29 = L("N29"), n30 = L("N30"), n31 = L("N31"), n32 = L("N32");
    grow = iv(frame, [n29, n31], [0, 1], ease);
    men = iv(frame, [n31, n31 + 12], [0, 1]);
    dusk = iv(frame, [n32 - 10, n32 + 20], [0, 1]);
    road = frame >= n32 ? 1 : 0;
    shots = [
      { at: 0, a: zc(0, 1.9), b: zc(0, 2.1) },
      { at: L("N28_b") - 2, a: zc(1, 1.9), b: zc(1, 2.1) },
      { at: L("N28_c") - 2, a: zc(2, 1.9), b: zc(2, 2.1) },
      { at: n29 - 2, a: aim(vertical, 960, 1180, 0.8), b: aim(vertical, 960, 1160, 0.92) },
      { at: n30 - 2, a: zc(0, 1.25), b: zc(0, 1.35) },
      { at: Wd("N30", "cows") - 6, a: zc(1, 1.3), b: zc(1, 1.4) },
      { at: Wd("N30", "sheep") - 6, a: zc(2, 1.3), b: zc(2, 1.4) },
      { at: n31 - 2, a: aim(vertical, 960, 1120, 0.85), b: aim(vertical, 960, 1100, 0.95) },
      { at: n32 - 2, a: aim(vertical, 260, 1060, 1.6), b: aim(vertical, 330, 1050, 1.8) },
    ];
  } else if (mode === "tease") {
    men = 1; dusk = iv(frame, [L("N03_b") - 6, L("N03_b") + 14], [0, 1]); road = frame >= L("N03_b") ? 1 : 0;
    shots = [
      { at: 0, a: zc(0, 1.5, -80), b: zc(0, 1.65, -80) },
      { at: Wd("N03_a", "given") - 4, a: zc(1, 1.5, -80), b: zc(1, 1.65, -80) },
      { at: Wd("N03_a", "asked") - 4, a: zc(2, 1.5, -80), b: zc(2, 1.65, -80) },
      { at: L("N03_b") - 2, a: aim(vertical, 260, 1060, 1.6), b: aim(vertical, 340, 1050, 1.85) },
    ];
  } else {
    // judged: the two valleys of the men who lied go dark and silent; the third stays in the light
    men = 1; grow = 1;
    shots = [{ at: 0, a: aim(vertical, 600, 1160, 0.95), b: aim(vertical, 640, 1150, 1.05) }];
  }
  const cam = cutCam(frame, shots, dur);
  const born = (k: number) => mode === "grow" && frame >= [0, L("N28_b"), L("N28_c")][k] + 6;
  const dark = mode === "judged" ? iv(frame, [0, 30], [0, 1]) : 0;
  const tx = 120 + iv(frame, [mode === "grow" ? L("N32") : L("N03_b"), dur], [0, 260]);
  return (
    <AbsoluteFill>
      <Land cam={cam} sky={dusk > 0.5 ? "dusk" : "dawn"} sunX={dusk > 0.5 ? 560 : 1460} sunY={dusk > 0.5 ? 930 : 860} houses={false} />
      <Layer d={1} cam={cam}>
        <Defs />
        {ZONES.map((z, k) => (
          <g key={k} style={{ filter: mode === "judged" && k < 2 ? `brightness(${1 - 0.6 * dark}) saturate(${1 - 0.7 * dark})` : undefined }}>
            <Herd kind={z.kind} n={mode === "grow" ? (born(k) ? 2 : 1) + grow * 16 : 18} x0={z.x0} x1={z.x1} y0={1250} y1={1560} frame={frame} seed={`h${k}`} s={0.75} />
            {men > 0 && !road ? <Actor x={(z.x0 + z.x1) / 2} y={FLOOR + 40} s={S} outfit={RICH[z.who]} pose={STAND} mood={mode === "judged" && k < 2 ? "tight" : "smile"} o={men} /> : null}
          </g>
        ))}
        {mode === "grow" && frame < L("N29") ? ZONES.map((z, k) => (born(k) ? <g key={`b${k}`}><Glow x={(z.x0 + z.x1) / 2} y={1300} r={200} o={0.4} /></g> : null)) : null}
        {road ? <Actor x={tx} y={FLOOR - 60} s={S * 0.9} outfit={{ ...LEPER_POOR, aura: "#fff1c9" }} pose={walkBy(tx, S)} o={0.95} /> : null}
      </Layer>
      {mode === "judged" ? <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0) 80%)", opacity: dark }} /> : null}
      <Grade color={dusk > 0.5 ? "#4a1d3a" : "#ffe1a8"} opacity={0.2} />
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};

// ───────── The gate: the cold open and the three tests ─────────
const TEST: Record<Who, { start: string; came: string; reveal?: string; said1?: string; reply1?: string; remind?: string; said2?: string; reply2?: string; curse?: string }> = {
  leper: { start: "N33", came: "N34_a", reveal: "N34_b", said1: "N37", reply1: "L4", remind: "N38_a", said2: "N39", reply2: "L1_2", curse: "N40" },
  bald: { start: "N41", came: "N42", said1: "N43_b", reply1: "B3", remind: "N44", reply2: "B4", curse: "N45" },
  blind: { start: "N47", came: "N48", said1: "N51", reply1: "BL3" },
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
  // the traveller walks in from the left (not in the cold open: he is already there)
  const came = cold ? -999 : L(t.came);
  const stop = came + 80;
  const tx = cold ? 780 : 120 + iv(frame, [came, stop], [0, 660]);
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
  const onMan = (z = 2.1): Cam => aim(vertical, MX - 20, 990, z);
  const onT = (z = 2.0): Cam => aim(vertical, tx + 20, 1000, z);
  const two = (z: number): Cam => aim(vertical, (tx + MX) / 2, 1080, vertical ? Math.min(z, 1.4) : z);
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
    shots.push({ at: 0, a: aim(vertical, 1300, 1060, 1.15), b: aim(vertical, 1260, 1070, 1.3) }, { at: came - 2, a: two(1.1), b: two(1.25) });
    if (t.reveal) shots.push({ at: L(t.reveal) - 2, a: onT(2.3), b: onT(2.6) });
    // the angel's words are told by the narrator: on the traveller, with reaction shots on the rich man
    for (const id of ids) {
      if (!/^N(3[5-8]|49|50|52)/.test(id) && !(who === "bald" && /^N4[23]_?a?$/.test(id))) continue;
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
    if (who === "bald") shots.push({ at: L("N46") - 2, a: aim(vertical, 1100, 1060, 0.95), b: aim(vertical, 1150, 1060, 1.05) });
    if (who === "blind") shots.push({ at: L("BL4") - 2, a: aim(vertical, MX + 160, 1060, 1.3), b: aim(vertical, MX + 200, 1060, 1.45) });
  }
  const cam = shook(cutCam(frame, shots, dur), frame, t.curse ? [curse] : [], 10);
  const dusk = who === "bald" ? 1 : 0;
  const night = who === "bald" && frame >= L("N46") ? 1 : 0;
  return (
    <AbsoluteFill>
      <Land cam={cam} sky={night ? "night" : dusk ? "dusk" : who === "blind" ? "dawn" : "dusk"} sunX={dusk ? 560 : 1460} sunY={dusk ? 930 : 860} houses={false} />
      <Layer d={0.7} cam={cam}><Herd kind={KIND[who]} n={14} x0={1350} x1={2300} y0={1180} y1={1300} frame={frame} seed={`g${who}`} s={0.6} /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <House x={1520} rich />
        <Glow x={tx} y={1000} r={300} o={0.22} />
        {who === "blind" ? <Glow x={MX} y={1050} r={420} o={0.35 + 0.25 * give} /> : null}
        <Actor x={MX} y={FLOOR} s={S} outfit={RICH[who]} pose={pose} flip mouth={m} mood={mood} />
        <Actor x={tx} y={FLOOR} s={S} outfit={ANGEL_AS[who]} pose={walking ? walkBy(tx, S, 0.7) : { ...STAND, head: 4 }} hold={who === "blind" ? <Cane /> : undefined} mood="neutral" />
      </Layer>
      <Layer d={1} cam={cam}><Dust n={18} y0={900} y1={1400} opacity={0.25} seed={`gt${who}`} /></Layer>
      {cursed > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: 0.25 * cursed }} /> : null}
      {night ? <Grade color="#1a2550" opacity={0.4} mode="multiply" /> : null}
      <Vignette s={0.45} />
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
  if (frame >= Wd("N53", "angry") - 3) return <Valleys mode="judged" />;
  const cam = cutCam(frame, [
    { at: 0, a: aim(vertical, TX + 20, 1000, 2.0), b: aim(vertical, TX + 20, 990, 2.25) },
    { at: L("N52_b") - 2, a: aim(vertical, (TX + MX) / 2, 1080, 1.3), b: aim(vertical, (TX + MX) / 2, 1080, 1.45) },
    { at: L("N53") - 2, a: aim(vertical, MX - 20, 990, 2.0), b: aim(vertical, MX - 20, 980, 2.3) },
  ], dur);
  return (
    <AbsoluteFill>
      <Land cam={cam} sky="dawn" houses={false} />
      <Layer d={1} cam={cam}>
        <Defs />
        <House x={1520} rich />
        <Glow x={TX} y={900} r={300 + 300 * rise} o={0.4 + 0.4 * rise} />
        <Glow x={MX} y={1000} r={360} o={0.45 * rise} />
        <Actor x={MX} y={FLOOR} s={S} outfit={BLIND_RICH} pose={{ ...STAND, armRU: -20, armLU: -10, head: -4 }} flip mood="smile" />
        <Actor x={TX} y={FLOOR} s={S} outfit={ANGEL_AS.blind} pose={STAND} hold={<Cane />} mood="neutral" />
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
  const off = slot ? (slot === "a" ? 1 : -1) * ((vertical ? 1920 : 1920) / 4) / z : 0;
  const cam = vertical ? aim(vertical, 1160, HEAD + 60 + off - f * 0.1, z) : aim(vertical, 1160 + off, HEAD + 60 - f * 0.1, z);
  return (
    <AbsoluteFill style={{ filter: dark ? `brightness(${1 - 0.45 * dark}) saturate(${1 - 0.6 * dark})` : undefined }}>
      <Land cam={cam} sky={who === "blind" ? "dawn" : "dusk"} houses={false} />
      <Layer d={1} cam={cam}><Defs /><House x={1520} rich /><Actor x={1180} y={FLOOR} s={S} outfit={RICH[who]} pose={STAND} flip mouth={mouth} mood={mood} /></Layer>
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
  if (frame < a) return <Valleys mode="judged" />;
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
  const cam = aim(vertical, 960 + frame * 1.2, 1060, 1.2 + frame * 0.0012);
  return (
    <AbsoluteFill>
      <Land cam={cam} sky="dawn" sunX={1500} sunY={900} houses={false} />
      <Layer d={1} cam={cam}><Defs /><Glow x={1500} y={1000} r={600} o={0.6} /><Actor x={x} y={FLOOR} s={S} outfit={ANGEL} pose={walkBy(x, S)} /></Layer>
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};
