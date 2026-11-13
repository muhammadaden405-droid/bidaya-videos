import React, { useContext } from "react";
import { AbsoluteFill } from "remotion";
import { STAND, SIT } from "../cartoon/Rig";
import { FOLK, GUARD } from "../cartoon/Trailer";
import { KING_MAIN, BOY_MAIN, MONK_MAIN, COMPANION_MAIN, SHADOW } from "./cast";
import { Abs, Actor, sitY, useMouth, useTalk, walkBy, Shovel, Cam, Layer, Defs, Sky, SKIES, Stars, Embers, iv, ease, easeOut, easeIn, useShot, useView, aim, ridge, Dust, Grade, Vignette, Glow, ThroneSeat } from "./kit";
import { FLOOR, useL, shotCam, shook, Hall } from "./p1";
import { Court } from "./p2";

// Episode 2 — Parts 4 to 7: the mountain, the sea, the arrow, the trench.
const Waves: React.FC<{ y: number; color: string; amp: number; speed: number; seed: number }> = ({ y, color, amp, speed, seed }) => {
  const { frame } = useShot();
  let d = `M -1400 ${y}`;
  for (let x = -1400; x <= 3400; x += 80) d += ` Q ${x + 40} ${y - amp * Math.sin(x * 0.01 + frame * speed + seed)} ${x + 80} ${y}`;
  return <path d={d + " L 3400 2800 L -1400 2800 Z"} fill={color} />;
};
const many = (frame: number, a: number, b: number, step = 5) => { const h: number[] = []; for (let f = a; f < b; f += step) h.push(f); return h; };

// ───────── Part 4: the mountain ─────────
export const Climb: React.FC = () => {
  const { p } = useShot();
  const { vertical } = useView();
  const cam: Cam = aim(vertical, 960, 1250 - p * 420, 1.0 + p * 0.18);
  const path: [number, number][] = [[520, 1480], [1300, 1330], [700, 1160], [1180, 1010], [820, 860], [1010, 730], [960, 640]];
  const pos = (u: number) => {
    const t = Math.max(0, Math.min(0.999, u)) * (path.length - 1); const i = Math.floor(t); const k = t - i;
    return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k, path[i + 1][0] < path[i][0]] as const;
  };
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.2} cam={cam}><path d={ridge("m4a", 1300, 200, 240)} fill="#b9a089" opacity={0.7} /></Layer>
      <Layer d={1} cam={cam}>
        <path d="M -200 1700 L 250 1330 L 420 1360 L 640 980 L 760 1010 L 900 640 L 960 600 L 1050 700 L 1190 760 L 1330 1080 L 1500 1120 L 1700 1420 L 2100 1700 Z" fill="#8a6a52" />
        <path d="M 960 600 L 1050 700 L 1190 760 L 1330 1080 L 1500 1120 L 1700 1420 L 2100 1700 L 1150 1700 L 1080 1200 Z" fill="#6f523f" />
        <path d="M 900 640 L 960 600 L 1050 700 L 1010 760 L 950 720 Z" fill="#efe6da" opacity={0.7} />
        <path d={"M " + path.map((q) => q.join(" ")).join(" L ")} stroke="#c9ab86" strokeWidth={16} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((i) => {
          const [x, y, back] = pos(0.12 + p * 0.82 - i * 0.035);
          return <Actor key={i} x={x} y={y + 6} s={0.42} outfit={i === 2 ? BOY_MAIN : GUARD} pose={walkBy(x + y + i * 31, 0.42, 0.9)} flip={back} />;
        })}
        <rect x={-1400} y={1690} width={4800} height={1200} fill="#7a5c46" />
      </Layer>
      <Layer d={1.2} cam={cam}><Dust n={40} y0={500} y1={1500} opacity={0.4} drift={2.4} seed="cl" color="#ffffff" /></Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
export const Summit: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L } = useL();
  const b6 = L("B6") - 2, n47 = L("N47"), n48 = L("N48");
  const m = useMouth("B6");
  const fall = iv(frame, [n47 + 14, n48 + 40], [0, 1], easeIn);
  const cam = shook(shotCam(frame, [
    { at: 0, a: aim(vertical, 960, 1080, 1.15), b: aim(vertical, 960, 1070, 1.3) },
    { at: b6, a: aim(vertical, 970, 950, 2.1), b: aim(vertical, 970, 940, 2.35) },
    { at: n47 - 2, a: aim(vertical, 960, 1080, 1.05), b: aim(vertical, 960, 1120, 0.95) },
  ], dur), frame, many(frame, n47, n48 + 50), 20);
  const xs = [620, 760, 1160, 1300];
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.15} cam={cam}><path d={ridge("m4b", 1500, 240, 260)} fill="#b9a089" opacity={0.6} /></Layer>
      <Layer d={1} cam={cam}>
        <path d={`M 300 ${FLOOR + 30} L 420 ${FLOOR} L 1500 ${FLOOR} L 1640 ${FLOOR + 50} L 1900 2800 L 60 2800 Z`} fill="#8a6a52" />
        <path d={`M 380 ${FLOOR} L 1540 ${FLOOR} L 1580 ${FLOOR + 40} L 340 ${FLOOR + 40} Z`} fill="#a98a6c" />
        {xs.map((x, i) => {
          const dir = x < 960 ? -1 : 1;
          return (
            <g key={i} transform={`translate(${x + dir * fall * (420 + i * 60)} ${FLOOR + fall * fall * 1100}) rotate(${dir * fall * (70 + i * 20)})`}>
              <Actor x={0} y={0} s={2} outfit={GUARD} flip={dir > 0} pose={fall > 0 ? { ...STAND, armRU: -150, armRL: -20, armLU: -140, armLL: -20, legLU: 30, legRU: -30 } : { ...STAND, head: 2 }} mood={frame > n47 ? "shock" : "tight"} />
            </g>
          );
        })}
        {frame > n47 ? new Array(14).fill(0).map((_, i) => <circle key={i} cx={300 + i * 100 + Math.sin(i * 7) * 40} cy={FLOOR + 60 + ((frame - n47) * (9 + (i % 5) * 3) + i * 37) % 900} r={10 + (i % 4) * 7} fill="#6f523f" />) : null}
        <Actor x={960} y={FLOOR} s={1.8} outfit={BOY_MAIN} pose={{ ...STAND, head: -10, armRU: -44, armRL: -64, armLU: -40, armLL: -64 }} mouth={m} mood="neutral" />
      </Layer>
      <Layer d={1.2} cam={cam}><Dust n={frame > n47 ? 70 : 24} y0={600} y1={1500} opacity={0.5} drift={3} seed="sm" color="#f1e4d0" size={frame > n47 ? 6 : 3} /></Layer>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};
export const KingToSea: React.FC = () => {
  const { frame } = useShot();
  const { vertical } = useView();
  const from = useContext(Abs);
  const { Wd } = useL();
  const sea = iv(frame, [Wd("N52", "sea") - 18, Wd("N52", "sea") + 6], [0, 1], ease);
  const cam: Cam = aim(vertical, 960, 1120, 1.0 + frame * 0.0012);
  return (
    <AbsoluteFill>
      <Court other="boy" kingMood="frown" endOnKing={from} />
      <AbsoluteFill style={{ opacity: sea }}>
        <Sky stops={[[0, "#1a2636"], [45, "#42607a"], [72, "#b9a58a"], [100, "#7f99a6"]]} />
        <Layer d={0.2} cam={cam}><Waves y={1140} color="#3f6a84" amp={4} speed={0.04} seed={1} /></Layer>
        <Layer d={0.6} cam={cam}>
          <g transform={`translate(1050 ${1196 + Math.sin(frame * 0.07) * 5})`}><path d="M -110 -30 Q -100 10 -70 16 L 70 16 Q 100 10 110 -30 Z" fill="#20140d" /><rect x={-4} y={-150} width={8} height={124} fill="#20140d" /><path d="M 6 -146 L 76 -40 L 6 -40 Z" fill="#d9cdb4" opacity={0.85} /></g>
          <Waves y={1220} color="#2f566f" amp={9} speed={0.05} seed={3} />
        </Layer>
        <Layer d={1} cam={cam}><Waves y={1345} color="#234459" amp={14} speed={0.06} seed={5} /></Layer>
        <Vignette s={0.55} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ───────── Part 5: the sea ─────────
export const Sea: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const b8 = L("B8") - 2, turned = Wd("N57", "turned"), shore = Wd("N57", "every") - 6;
  const m = useMouth("B8");
  const tip = iv(frame, [turned - 2, turned + 30], [0, 1], ease);
  const bob = Math.sin(frame * 0.07) * 10;
  if (frame >= shore) {
    // every one of the men drowned; the boy alone wades out of the sea
    const w = iv(frame, [shore, dur], [0, 1]);
    const x = 620 + w * 420;
    const cam = shotCam(frame, [{ at: 0, a: aim(vertical, 900, 1090, 1.25), b: aim(vertical, 980, 1060, 1.6) }], dur);
    return (
      <AbsoluteFill>
        <Sky stops={[[0, "#27394d"], [45, "#5d7a8c"], [70, "#c7b79a"], [100, "#8fa9b3"]]} />
        <Layer d={0.2} cam={cam}><Waves y={1140} color="#4d7890" amp={4} speed={0.04} seed={1} /></Layer>
        <Layer d={0.6} cam={cam}>
          <g transform="translate(520 1236) rotate(176)"><path d="M -210 -65 Q -190 20 -130 30 L 130 30 Q 190 20 210 -65 Z" fill="#4a2f1c" stroke="#2b1d18" strokeWidth={5} /></g>
          <Waves y={1236} color="#3a657e" amp={9} speed={0.05} seed={3} />
        </Layer>
        <Layer d={1} cam={cam}>
          <Actor x={x} y={FLOOR + 30 - w * 30} s={1.8} outfit={BOY_MAIN} pose={walkBy(x, 1.8, 0.7)} mood="neutral" />
          <path d={`M -1400 ${FLOOR + 6 + 26 * (1 - w)} Q 500 ${FLOOR - 16} 900 ${FLOOR + 4} T 3400 ${FLOOR - 4} L 3400 2800 L -1400 2800 Z`} fill="#2b5068" opacity={Math.max(0, 0.9 - w * 1.4)} />
          <path d={`M 700 ${FLOOR + 6} Q 1200 ${FLOOR - 12} 3400 ${FLOOR - 4} L 3400 2800 L 500 2800 Z`} fill="#d9c59c" />
        </Layer>
        <Vignette s={0.5} />
      </AbsoluteFill>
    );
  }
  const cam = shook(shotCam(frame, [
    { at: 0, a: aim(vertical, 960, 1080, 0.95), b: aim(vertical, 960, 1090, 1.12) },
    { at: L("N56"), a: aim(vertical, 960, 1110, 1.5), b: aim(vertical, 960, 1100, 1.65) },
    { at: b8, a: aim(vertical, 965, 1010, 2.3), b: aim(vertical, 965, 1000, 2.55) },
    { at: L("N57") - 2, a: aim(vertical, 960, 1110, 1.2), b: aim(vertical, 960, 1150, 1.0) },
  ], shore), frame, [turned + 10], 12);
  return (
    <AbsoluteFill>
      <Sky stops={[[0, "#27394d"], [45, "#5d7a8c"], [70, "#c7b79a"], [100, "#8fa9b3"]]} />
      <Layer d={0.2} cam={cam}><Waves y={1140} color="#4d7890" amp={4} speed={0.04} seed={1} /></Layer>
      <Layer d={0.6} cam={cam}><Waves y={1230} color="#3a657e" amp={9} speed={0.05} seed={3} /></Layer>
      <Layer d={1} cam={cam}>
        <g transform={`translate(960 ${1300 + bob + tip * 60}) rotate(${Math.sin(frame * 0.05) * 2.5 + tip * 172})`}>
          <g opacity={1 - iv(tip, [0.25, 0.5], [0, 1])}>
            {[-250, -120, 150, 270].map((x, i) => <Actor key={i} x={x} y={10} s={1.5} outfit={GUARD} flip={x > 0} mood={tip > 0 ? "shock" : "tight"} />)}
            <Actor x={15} y={10} s={1.4} outfit={BOY_MAIN} pose={{ ...STAND, head: -10, armRU: -44, armRL: -64, armLU: -40, armLL: -64 }} mouth={m} />
          </g>
          <path d="M -420 -130 Q -380 40 -260 60 L 260 60 Q 380 40 420 -130 Z" fill="#6a4428" stroke="#2b1d18" strokeWidth={7} />
          <path d="M -420 -130 L 420 -130" stroke="#8a5c38" strokeWidth={16} />
        </g>
        <Waves y={1345} color="#2b5068" amp={14} speed={0.06} seed={5} />
      </Layer>
      <Layer d={1.3} cam={cam}><Waves y={1560} color="#1e3d52" amp={18} speed={0.07} seed={8} /></Layer>
      <Grade color="#0b1a28" opacity={0.18} mode="multiply" />
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};

// ───────── Part 6: the plain, the bow, the arrow, the cry ─────────
const PlainBg: React.FC<{ cam: Cam; dusk?: boolean }> = ({ cam, dusk }) => (
  <>
    <Sky stops={dusk ? SKIES.dusk : SKIES.day} />
    <Layer d={0.2} cam={cam}><path d={ridge("pl", 1180, 120, 260)} fill={dusk ? "#7a4a46" : "#b98a62"} opacity={0.7} /></Layer>
    <Layer d={1} cam={cam}><path d={`M -1400 ${FLOOR - 10} L 3400 ${FLOOR - 10} L 3400 2800 L -1400 2800 Z`} fill={dusk ? "#8a6248" : "#d9b784"} /></Layer>
  </>
);
const Tree: React.FC<{ x: number; tied?: boolean; sil?: boolean; arm?: number }> = ({ x, tied = true, sil, arm = 0 }) => (
  <g>
    <path d={`M ${x - 34} ${FLOOR} L ${x - 26} ${FLOOR - 620} L ${x + 26} ${FLOOR - 620} L ${x + 34} ${FLOOR} Z`} fill={sil ? "#120a06" : "#5a3a22"} stroke="#2b1d18" strokeWidth={6} />
    <path d={`M ${x} ${FLOOR - 600} Q ${x - 120} ${FLOOR - 700} ${x - 160} ${FLOOR - 790} M ${x} ${FLOOR - 610} Q ${x + 110} ${FLOOR - 720} ${x + 170} ${FLOOR - 760}`} stroke={sil ? "#120a06" : "#5a3a22"} strokeWidth={22} fill="none" strokeLinecap="round" />
    <Actor x={x - 46} y={FLOOR} s={1.8} outfit={sil ? SHADOW : BOY_MAIN} flip pose={{ ...STAND, head: -4 + arm * 14, armRU: 10 - arm * 150, armRL: -10 - arm * 120 }} mood={sil ? undefined : "neutral"} />
    {tied ? [250, 330].map((h, i) => <rect key={i} x={x - 100} y={FLOOR - h} width={140} height={12} rx={5} fill={sil ? "#120a06" : "#c9ab86"} stroke="#2b1d18" strokeWidth={3} />) : null}
  </g>
);
const CrowdRows: React.FC<{ rows?: number; n?: number; y?: number; s?: number; x0?: number; x1?: number; gather?: number; up?: number; lead?: number; open?: number; flipAll?: boolean }> = ({ rows = 3, n = 9, y = FLOOR, s = 1.5, x0 = 200, x1 = 1000, gather = 1, up = 0, lead = 0, open = 0, flipAll }) => {
  const { frame } = useShot();
  return (
    <g>
      {new Array(rows * n).fill(0).map((_, k) => {
        const r = Math.floor(k / n), i = k % n;
        const x = x0 + (i + (r % 2) * 0.5) * ((x1 - x0) / n) + (1 - gather) * (i < n / 2 ? -900 : -1300 - i * 40);
        const isLead = r === rows - 1 && i === Math.floor(n / 2);
        const u = isLead ? Math.max(up, lead) : up;
        const mo = (isLead ? Math.max(open, lead) : open) * (0.45 + 0.4 * Math.sin(frame * 0.8 + k));
        return <Actor key={k} x={x} y={y - (rows - 1 - r) * 46} s={s * (0.86 + r * 0.07)} outfit={FOLK(k)} flip={flipAll} mouth={mo} mood={u > 0.3 ? "shock" : "neutral"}
          pose={gather < 1 ? walkBy(x + k * 23, s, 0.9) : { ...STAND, head: -4 + Math.sin(frame * 0.05 + k) * 2, armRU: -8 - 150 * u, armRL: -6 - 20 * u, armLU: 8 - 120 * u * ((k % 3) / 2), armLL: -6 }} />;
      })}
    </g>
  );
};
/** The people of the city: many rows of small figures receding up the plain. up = arms raised (0..1). */
export const Mass: React.FC<{ x0?: number; x1?: number; rows?: number; per?: number; top?: number; base?: number; up?: number; gather?: number; sil?: boolean }> = ({ x0 = -400, x1 = 2300, rows = 9, per = 34, top = FLOOR - 250, base = FLOOR - 40, up = 0, gather = 1, sil }) => {
  const { frame } = useShot();
  const tones = ["#6b5444", "#7a6250", "#5a4638", "#8a7058", "#4e3c30"];
  const skins = ["#b07a56", "#a8724f", "#c08a62", "#8d5a3b"];
  return (
    <g>
      {new Array(rows).fill(0).map((_, r) => {
        const k = r / (rows - 1); const y = top + (base - top) * k; const sc = 0.34 + 0.5 * k; const n = Math.round(per * (1.25 - 0.45 * k));
        return new Array(n).fill(0).map((__, i) => {
          const j = r * 97 + i * 13;
          const x = x0 + ((i + (r % 2) * 0.5) / n) * (x1 - x0) + ((j * 7) % 23) - 11 - (1 - gather) * (600 + ((j * 13) % 900)) * (i < n / 2 ? 1 : -1);
          const lift = up * (0.6 + ((j % 5) / 10)) * (0.8 + 0.2 * Math.sin(frame * 0.5 + j));
          return (
            <g key={`${r}-${i}`} transform={`translate(${x} ${y + Math.sin(frame * 0.05 + j) * 1.5}) scale(${sc})`}>
              <rect x={-22} y={-150} width={44} height={150} rx={16} fill={sil ? "#120a06" : tones[j % 5]} />
              <circle cx={0} cy={-176} r={25} fill={sil ? "#120a06" : skins[j % 4]} />
              {sil ? null : <path d="M -26 -180 Q 0 -214 26 -180 Z" fill={["#b9b3a6", "#8f8a7e", "#d0c7b4"][j % 3]} />}
              {lift > 0.05 ? <line x1={14} y1={-140} x2={14 + 22 * lift} y2={-140 - 96 * lift} stroke={sil ? "#120a06" : tones[j % 5]} strokeWidth={14} strokeLinecap="round" /> : null}
            </g>
          );
        });
      })}
    </g>
  );
};
export const Plain: React.FC = () => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const gather = iv(frame, [0, dur * 0.55], [0, 1], easeOut);
  const cam = shotCam(frame, [{ at: 0, a: aim(vertical, 900, 1050, 0.95), b: aim(vertical, 1000, 1060, 1.12) }, { at: Math.round(dur * 0.6), a: aim(vertical, 1280, 1040, 1.5), b: aim(vertical, 1290, 1020, 1.75) }], dur);
  void p;
  return (
    <AbsoluteFill>
      <PlainBg cam={cam} />
      <Layer d={1} cam={cam}>
        <Mass gather={gather} />
        <Tree x={1340} />
        <CrowdRows gather={gather} x0={-200} x1={1080} n={12} />
        <CrowdRows gather={gather} x0={1560} x1={2300} n={7} flipAll />
      </Layer>
      <Layer d={1} cam={cam}><Dust n={30} y0={900} y1={1400} opacity={0.4} seed="pn" /></Layer>
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
const KX = 300, TX = 1640;
const BowInHand: React.FC<{ draw: number; arrow?: boolean }> = ({ draw, arrow = true }) => (
  <g>
    <path d="M 4 -92 Q 60 0 4 92" stroke="#3b2414" strokeWidth={7} fill="none" strokeLinecap="round" />
    <path d={`M 4 -92 L ${4 - draw * 78} 0 L 4 92`} stroke="#e9dcc0" strokeWidth={2} fill="none" />
    {arrow ? <g><line x1={4 - draw * 78} y1={0} x2={104 - draw * 78} y2={0} stroke="#2b1d18" strokeWidth={4} strokeLinecap="round" /><path d={`M ${104 - draw * 78} -6 L ${118 - draw * 78} 0 L ${104 - draw * 78} 6 Z`} fill="#8a8a86" /></g> : null}
  </g>
);
const Archer: React.FC<{ draw: number; mouth?: number; arrow?: boolean }> = ({ draw, mouth, arrow }) => (
  <Actor x={KX} y={FLOOR} s={2.1} outfit={KING_MAIN} mouth={mouth} mood="tight" hold={<BowInHand draw={draw} arrow={arrow} />}
    pose={{ ...STAND, lean: -3, head: -2, armRU: -90, armRL: 0, armLU: -92 + 30 * draw, armLL: -150 * draw }} />
);
export const Bow: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const k13 = L("K13") - 2;
  const m = useMouth("K13");
  const draw = iv(frame, [Wd("N69", "bow") - 10, Wd("N69", "bow") + 26], [0, 1], ease);
  const hasBow = frame >= Wd("N69", "arrow") - 4;
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 960, 1060, vertical ? 0.74 : 0.9), b: aim(vertical, 960, 1050, vertical ? 0.8 : 1.0) },
    { at: Wd("N69", "quiver") - 4, a: aim(vertical, TX - 40, 1010, 1.8), b: aim(vertical, TX - 40, 1000, 2.0) },
    { at: Wd("N69", "bow") - 6, a: aim(vertical, KX + 70, 940, 1.7), b: aim(vertical, KX + 90, 930, 1.9) },
    { at: k13, a: aim(vertical, KX + 20, 890, 2.2), b: aim(vertical, KX + 20, 884, 2.5) },
    { at: k13 + 60, a: aim(vertical, 960, 1050, vertical ? 0.78 : 0.95), b: aim(vertical, 960, 1050, vertical ? 0.84 : 1.02) },
  ], dur);
  return (
    <AbsoluteFill>
      <PlainBg cam={cam} />
      <Layer d={1} cam={cam}>
        <Mass top={FLOOR - 300} base={FLOOR - 110} rows={8} />
        <Tree x={TX} />
        {hasBow ? <Archer draw={draw} mouth={m} /> : <Actor x={KX} y={FLOOR} s={2.1} outfit={KING_MAIN} pose={{ ...STAND, head: -2, armRU: -40, armRL: -30 }} mood="tight" />}
      </Layer>
      <Vignette s={0.45} />
    </AbsoluteFill>
  );
};
export const ArrowShot: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const n71 = L("N71"), shot = Wd("N71", "shot"), n72 = L("N72"), struck = Wd("N72", "struck"), hand = Wd("N72", "hand"), died = Wd("N72", "died");
  if (frame < shot) {
    // the people murmur at the king's words; then the bow, fully drawn
    const cam = shotCam(frame, [{ at: 0, a: aim(vertical, 960, 1000, 1.25), b: aim(vertical, 990, 990, 1.45) }, { at: n71, a: aim(vertical, KX + 70, 940, 1.8), b: aim(vertical, KX + 90, 930, 2.1) }], shot);
    return (
      <AbsoluteFill>
        <PlainBg cam={cam} />
        <Layer d={1} cam={cam}>
          {frame < n71 ? <><Mass top={FLOOR - 330} base={FLOOR - 120} rows={8} /><CrowdRows rows={3} n={10} x0={260} x1={1700} s={1.6} open={0.5} /></> : <><Mass top={FLOOR - 300} base={FLOOR - 110} rows={8} /><Archer draw={1} /></>}
        </Layer>
        <Vignette s={0.5} />
      </AbsoluteFill>
    );
  }
  if (frame < n72 - 2) {
    // the arrow leaves the bow and crosses the plain (slow)
    const fly = iv(frame, [shot, n72 - 2], [0, 1]);
    const ax = KX + 260 + fly * 1500;
    const cam = aim(vertical, ax, 930, 1.5);
    return (
      <AbsoluteFill>
        <PlainBg cam={cam} />
        <Layer d={1} cam={cam}>
          <Mass top={FLOOR - 300} base={FLOOR - 110} rows={8} />
          <line x1={ax - 150} y1={FLOOR - 418} x2={ax} y2={FLOOR - 418} stroke="#2b1d18" strokeWidth={9} strokeLinecap="round" />
          <path d={`M ${ax} ${FLOOR - 428} L ${ax + 26} ${FLOOR - 418} L ${ax} ${FLOOR - 408} Z`} fill="#8a8a86" />
          {new Array(7).fill(0).map((_, i) => <line key={i} x1={ax - 220 - i * 70} y1={FLOOR - 450 + i * 11} x2={ax - 460 - i * 70} y2={FLOOR - 450 + i * 11} stroke="#fff" strokeWidth={3} opacity={0.3} />)}
        </Layer>
        <Vignette s={0.5} />
      </AbsoluteFill>
    );
  }
  // in shadow against the bright sky: the arrow strikes his temple, his head jolts, and his hand goes to where it struck
  const tx = 1340, hx = tx - 46, hy = FLOOR - 418;
  const arrive = iv(frame, [struck - 8, struck], [0, 1]);
  const jolt = iv(frame, [struck, struck + 3, struck + 18], [0, 1, 0.3], easeOut);
  const arm = iv(frame, [hand - 6, hand + 26], [0, 1], ease);
  const sag = iv(frame, [died - 6, dur], [0, 1], ease);
  const cam = shook(shotCam(frame, [{ at: 0, a: aim(vertical, 1300, 1000, 1.5), b: aim(vertical, 1290, 960, 2.0) }], dur), frame, [struck], 18);
  const tipX = hx - 52 - (1 - arrive) * 900;
  return (
    <AbsoluteFill>
      <Sky stops={[[0, "#f6d9a0"], [60, "#f0b46a"], [100, "#b9652a"]]} />
      <Layer d={1} cam={cam}>
        <path d={`M -1400 ${FLOOR - 10} L 3400 ${FLOOR - 10} L 3400 2800 L -1400 2800 Z`} fill="#1a100a" />
        <path d={`M ${tx - 34} ${FLOOR} L ${tx - 26} ${FLOOR - 620} L ${tx + 26} ${FLOOR - 620} L ${tx + 34} ${FLOOR} Z`} fill="#120a06" />
        <path d={`M ${tx} ${FLOOR - 600} Q ${tx - 120} ${FLOOR - 700} ${tx - 160} ${FLOOR - 790} M ${tx} ${FLOOR - 610} Q ${tx + 110} ${FLOOR - 720} ${tx + 170} ${FLOOR - 760}`} stroke="#120a06" strokeWidth={22} fill="none" strokeLinecap="round" />
        <Actor x={hx} y={FLOOR} s={1.8} outfit={SHADOW} flip pose={{ ...STAND, lean: -3 * jolt, head: 16 * jolt + 22 * sag, armRU: 10 - arm * 150 + sag * 60, armRL: -10 - arm * 118 + sag * 50 }} />
        {[250, 330].map((h, i) => <rect key={i} x={tx - 100} y={FLOOR - h} width={140} height={12} rx={5} fill="#120a06" />)}
        {/* the arrow, a shadow like everything else */}
        <line x1={tipX - 170} y1={hy - 6} x2={tipX} y2={hy - 6} stroke="#120a06" strokeWidth={8} strokeLinecap="round" opacity={1 - iv(frame, [hand + 10, hand + 26], [0, 0.6])} />
      </Layer>
      <AbsoluteFill style={{ backgroundColor: "#fff3dd", opacity: iv(frame, [struck, struck + 1, struck + 7], [0, 0.5, 0]) }} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: iv(frame, [died, dur], [0, 0.9]) }} />
      <Vignette s={0.55} />
    </AbsoluteFill>
  );
};
export const CrowdCry: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L } = useL();
  const cry = L("crowd_cry");
  const lead = iv(frame, [cry, cry + 10], [0, 1], easeOut);
  const all = iv(frame, [cry + 78, cry + 92], [0, 1], easeOut);
  const cam = shook(shotCam(frame, [
    { at: 0, a: aim(vertical, 960, 1000, 1.5), b: aim(vertical, 960, 990, 1.7) },
    { at: cry - 2, a: aim(vertical, 960, 930, 2.3), b: aim(vertical, 960, 920, 2.6) },
    { at: cry + 78, a: aim(vertical, 960, 1010, 1.35), b: aim(vertical, 960, 1020, 1.05) },
  ], dur), frame, many(frame, cry + 78, cry + 250, 9), 7);
  return (
    <AbsoluteFill>
      <PlainBg cam={cam} dusk />
      <Layer d={1} cam={cam}>
        <Defs />
        <Glow x={960} y={700} r={900} o={0.5 * all} />
        <Mass top={FLOOR - 420} base={FLOOR - 150} rows={10} per={40} up={all} />
        <CrowdRows rows={3} n={11} x0={60} x1={1860} s={1.7} up={all} lead={lead} open={all} />
      </Layer>
      <Grade color="#ffcf8a" opacity={0.2 * all} />
      <Vignette s={0.5} />
    </AbsoluteFill>
  );
};
export const KingTold: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const n75 = L("N75"), n76 = L("N76"), q = Wd("NC", "do");
  const run = iv(frame, [0, 40], [0, 1], easeOut);
  const talk = frame > q && frame < n75 - 4 ? 0.35 + 0.35 * Math.sin(frame * 0.9) * Math.sin(frame * 0.27) : 0;
  const flick = 0.5 + 0.5 * Math.sin(frame * 0.7) * Math.sin(frame * 0.23);
  const fire = iv(frame, [n76 - 20, dur], [0, 1]);
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 1050, 1090, 1.2), b: aim(vertical, 1080, 1085, 1.35) },
    { at: q - 2, a: aim(vertical, 900, 960, 2.0), b: aim(vertical, 900, 955, 2.2) },
    { at: Wd("NC", "by") - 2, a: aim(vertical, 1236, 1030, 2.0), b: aim(vertical, 1236, 1024, 2.25) },
    { at: Wd("NC", "all") - 2, a: aim(vertical, 1070, 1080, 1.45), b: aim(vertical, 1070, 1080, 1.55) },
    { at: n75, a: aim(vertical, 1236, 1030, 1.9), b: aim(vertical, 1236, 1020, 2.5) },
  ], dur);
  return (
    <AbsoluteFill>
      <Hall cam={cam} />
      <Layer d={1} cam={cam}>
        <g transform="translate(2520 0) scale(-1 1)"><ThroneSeat x={1260} floor={FLOOR} s={1.1} /></g>
        <Actor seat="chair" x={1260} y={sitY(FLOOR - 110, 2)} s={2} outfit={KING_MAIN} pose={{ ...SIT, lean: -4, head: 8 }} flip mood="frown" />
        <Actor x={380 + run * 520} y={FLOOR} s={2} outfit={FOLK(6)} pose={run < 1 ? walkBy(380 + run * 520, 2, 1) : { ...STAND, lean: 8, head: 4, armRU: -46, armRL: -40 }} mouth={talk} mood={run < 1 ? "shock" : "frown"} />
      </Layer>
      <Grade color="#ff7a2a" opacity={0.16 + fire * 0.3 * flick} />
      <Vignette s={0.6 + 0.15 * fire} />
    </AbsoluteFill>
  );
};

// ───────── Part 7: the trench (firelight and silhouettes only) ─────────
export const TrenchBg: React.FC<{ cam: Cam; fire?: number }> = ({ cam, fire = 1 }) => {
  const { frame } = useShot();
  const f = 1 + 0.08 * Math.sin(frame * 0.4);
  return (
    <>
      <Sky stops={SKIES.fire} />
      <Layer d={0.2} cam={cam}><path d={ridge("tr", 1160, 130, 250)} fill="#2a1210" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <path d={`M -1400 ${FLOOR - 10} L 3400 ${FLOOR - 10} L 3400 2800 L -1400 2800 Z`} fill="#170b08" />
        <Glow x={1350} y={FLOOR + 40} r={760 * f} id="glowR" o={0.9 * fire} />
        <Glow x={1350} y={FLOOR + 30} r={380 * f} id="glowO" o={0.9 * fire} />
        <path d={`M 950 ${FLOOR + 6} L 1900 ${FLOOR + 6} L 2300 ${FLOOR + 130} L 800 ${FLOOR + 130} Z`} fill="#070302" />
        <path d={`M 950 ${FLOOR + 6} L 1900 ${FLOOR + 6} L 2300 ${FLOOR + 130} L 800 ${FLOOR + 130} Z`} fill="#ff8a2a" opacity={0.85 * fire} />
        <path d={`M 800 ${FLOOR + 130} L 2300 ${FLOOR + 130} L 2400 ${FLOOR + 190} L 720 ${FLOOR + 190} Z`} fill="#170b08" />
        {fire > 0.5 ? <Embers n={50} x0={900} x1={1900} base={FLOOR + 60} seed="tr" /> : null}
      </Layer>
    </>
  );
};
export const Trench: React.FC<{ mode: "dig" | "edge" }> = ({ mode }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const { Wd } = useL();
  const lit = mode === "dig" ? iv(frame, [Wd("N78", "fires") - 6, Wd("N78", "fires") + 22], [0, 1], ease) : 1;
  const cam = shotCam(frame, [{ at: 0, a: aim(vertical, 1000, 1040, 0.95), b: aim(vertical, 1080, 1060, 1.15) }, { at: mode === "dig" ? Wd("N78", "fires") - 6 : Math.round(dur * 0.55), a: aim(vertical, mode === "dig" ? 1300 : 760, 1090, 1.4), b: aim(vertical, mode === "dig" ? 1320 : 800, 1090, 1.65) }], dur);
  return (
    <AbsoluteFill>
      <TrenchBg cam={cam} fire={lit} />
      {mode === "dig" ? <AbsoluteFill style={{ backgroundColor: "#1a1020", opacity: 0.35 * (1 - lit) }} /> : null}
      <Layer d={1} cam={cam}>
        {mode === "dig"
          ? [0, 1, 2, 3].map((i) => (
            // the diggers stand on the ground beside the trench, feet planted; only their arms and shovels move
            <Actor key={i} x={300 + i * 240} y={FLOOR + (i % 2) * 26} s={1.6} outfit={SHADOW} o={1 - lit} flip={i % 2 === 1}
              pose={{ ...STAND, lean: 14, armRU: -30 + 22 * Math.sin(frame * 0.16 + i), armRL: -34, armLU: -18 + 16 * Math.sin(frame * 0.16 + i), armLL: -50 }} hold={<Shovel />} />
          ))
          : (
            <>
              {/* the king and his men sit at its edge, watching (al-Burūj 85:6–7) */}
              {[0, 1, 2, 3].map((i) => <Actor key={i} seat="chair" x={470 + i * 130} y={sitY(FLOOR - 96, 1.7)} s={1.7} outfit={SHADOW} pose={SIT} />)}
              <rect x={400} y={FLOOR - 96} width={520} height={96} fill="#120a06" />
              {/* the believers go forward, one after another; nobody is shown entering the fire */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const x = -300 + ((p * 1500 + i * 260) % 1700);
                return <Actor key={i} x={x} y={FLOOR + 150} s={1.9} outfit={SHADOW} pose={walkBy(x + i * 37, 1.9, 0.8)} o={iv(x, [-200, 0, 900, 1150], [0, 1, 1, 0])} />;
              })}
            </>
          )}
      </Layer>
      <Grade color="#ff5a1a" opacity={0.12} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};
export const KingFire: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L } = useL();
  const k = L("K14") - 2;
  const m = useMouth("K14");
  const useTalkK = useTalk("K14");
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 900, 1060, 1.2), b: aim(vertical, 860, 1050, 1.4) },
    { at: k, a: aim(vertical, 700, 1010, 2.0), b: aim(vertical, 700, 1004, 2.2) },
    { at: k + 80, a: aim(vertical, 900, 1060, 1.4), b: aim(vertical, 900, 1060, 1.5) },
    { at: k + 120, a: aim(vertical, 700, 1010, 2.2), b: aim(vertical, 700, 1000, 2.5) },
  ], dur);
  return (
    <AbsoluteFill>
      <TrenchBg cam={cam} />
      <Layer d={1} cam={cam}>
        <rect x={600} y={FLOOR - 110} width={200} height={110} rx={8} fill="#2a1612" stroke="#120a06" strokeWidth={5} />
        <Actor seat="chair" x={700} y={sitY(FLOOR - 110, 2)} s={2} outfit={KING_MAIN} pose={{ ...SIT, head: 2, armRU: -25 - 14 * useTalkK, armRL: -45 }} mouth={m} mood="sneer" />
        {[0, 1].map((i) => <Actor key={i} x={420 - i * 150} y={FLOOR} s={2} outfit={SHADOW} pose={{ ...STAND, head: 2 }} />)}
      </Layer>
      <Grade color="#ff5a1a" opacity={0.22} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};
export const Mother: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const n82 = L("N82"), nb = L("NB"), q = Wd("NB", "be");
  const walkT = iv(frame, [0, n82 - 10], [0, 1], easeOut);
  const back = iv(frame, [n82, n82 + 24], [0, 1], ease);
  const bow = iv(frame, [q, q + 30], [0, 1], ease);
  const x = 300 + walkT * 560 - back * 60;
  const close = frame >= nb - 2;
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 900, 1060, 1.1), b: aim(vertical, 960, 1060, 1.3) },
    { at: n82, a: aim(vertical, 860, 980, 1.7), b: aim(vertical, 850, 960, 1.9) },
    { at: nb - 2, a: aim(vertical, x + 40, 1000, 2.6), b: aim(vertical, x + 40, 990, 3.0) },
  ], dur);
  const night = iv(frame, [dur - 34, dur - 4], [0, 1]);
  return (
    <AbsoluteFill>
      <TrenchBg cam={cam} />
      <Layer d={1} cam={cam}>
        <Defs />
        {/* the mother: a long dress to the ground and a head covering that falls over her shoulders */}
        <g transform={`translate(${x} ${FLOOR + 40}) scale(1.95)`}><path d="M -32 -176 L 32 -176 L 60 2 L -60 2 Z" fill="#120a06" /></g>
        <Actor x={x} y={FLOOR + 40} s={1.95} outfit={{ ...SHADOW, wrap: "#120a06" }} pose={walkT < 1 ? { ...walkBy(x, 1.95, 0.5), armRU: 12, armRL: -92, armLU: 16, armLL: -96 } : { ...STAND, lean: -4 * back, head: 16 * bow, armRU: 12, armRL: -92, armLU: 16, armLL: -96 }} />
        <g transform={`translate(${x} ${FLOOR + 40}) scale(1.95)`}><path d="M -35 -238 Q -38 -276 0 -278 Q 38 -276 35 -238 Q 46 -206 52 -150 Q 20 -164 -8 -160 Q -34 -158 -52 -150 Q -46 -206 -35 -238 Z" fill="#120a06" /><path d="M 6 -262 Q 34 -258 32 -226 Q 30 -208 22 -204 Q 30 -232 6 -262 Z" fill="#2a1612" /></g>
        {/* the baby in her arms, lit softly by the glow; the narrator speaks his words, so his mouth stays still */}
        <g transform={`translate(${x + 52} ${FLOOR + 40 - 300})`}>
          {close ? <Glow x={0} y={0} r={150} o={0.5} /> : null}
          <ellipse cx={0} cy={18} rx={50} ry={30} fill={close ? "#e9dcc0" : "#120a06"} stroke="#120a06" strokeWidth={4} />
          <circle cx={30} cy={-6} r={21} fill={close ? "#c99a78" : "#120a06"} stroke="#120a06" strokeWidth={4} />
        </g>
      </Layer>
      <Grade color="#ff5a1a" opacity={0.1} />
      <AbsoluteFill style={{ opacity: night, background: "linear-gradient(#03040c 0%, #0b1230 60%, #1a2550 100%)" }} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};
export const Echoes: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const { L, Wd } = useL();
  const ke = L("K3_echo"), n85 = L("N85"), be = L("B5_echo");
  const km = useMouth("K3_echo"), bm = useMouth("B5_echo");
  const kingO = iv(frame, [ke - 2, ke + 6, n85 - 12, n85 - 2], [0, 1, 1, 0]);
  const marks = [Wd("N85", "man"), Wd("N85", "monk"), Wd("N85", "boy")];
  const people = iv(frame, [Wd("N85", "people") - 6, Wd("N85", "people") + 24], [0, 1], ease);
  const boyClose = frame >= be - 2;
  const cam = shotCam(frame, [
    { at: 0, a: aim(vertical, 960, 900, 1.0), b: aim(vertical, 960, 960, 1.12) },
    { at: n85 - 2, a: aim(vertical, 960, 1060, 1.2), b: aim(vertical, 960, 1050, 1.4) },
    { at: Wd("N85", "people") - 6, a: aim(vertical, 960, 1040, vertical ? 0.95 : 1.0), b: aim(vertical, 960, 1030, vertical ? 1.0 : 1.12) },
    { at: be - 2, a: aim(vertical, 1180, 930, 2.0), b: aim(vertical, 1180, 915, 2.5) },
  ], dur);
  const kcam = aim(vertical, 1236, 1030, 1.9 + (frame - ke) * 0.003);
  const who = [{ o: COMPANION_MAIN, x: 740 }, { o: MONK_MAIN, x: 960 }, { o: BOY_MAIN, x: 1180 }];
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.night} />
      <Layer d={0.05} cam={cam}><Stars n={170} seed="ec" /></Layer>
      <Layer d={0.3} cam={cam}><path d={ridge("ec", 1230, 100, 260)} fill="#0c1024" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <path d={`M -1400 ${FLOOR - 10} L 3400 ${FLOOR - 10} L 3400 2800 L -1400 2800 Z`} fill="#0a0c1a" />
        {people > 0 ? <g opacity={people}><Glow x={960} y={FLOOR - 260} r={1200} o={0.3} /><Mass top={FLOOR - 330} base={FLOOR - 90} rows={9} per={38} /></g> : null}
        {who.map((w, i) => {
          const on = iv(frame, [marks[i] - 2, marks[i] + 10], [0, 1]);
          const isBoy = i === 2;
          return on > 0 ? (
            <g key={i} opacity={on}>
              <path d={`M ${w.x - 60} 200 L ${w.x + 60} 200 L ${w.x + 190} ${FLOOR + 20} L ${w.x - 190} ${FLOOR + 20} Z`} fill="#fff1c9" opacity={isBoy && boyClose ? 0.26 : 0.13} />
              <Glow x={w.x} y={FLOOR - 220} r={330} o={0.35} />
              <Actor x={w.x} y={FLOOR} s={isBoy ? 1.8 : 2} outfit={w.o} pose={{ ...STAND, head: -3 }} mouth={isBoy ? bm : undefined} mood={isBoy ? "neutral" : "tight"} />
            </g>
          ) : null;
        })}
      </Layer>
      {kingO > 0 ? (
        <AbsoluteFill style={{ opacity: kingO }}>
          <Hall cam={kcam} />
          <Layer d={1} cam={kcam}>
            <g transform="translate(2520 0) scale(-1 1)"><ThroneSeat x={1260} floor={FLOOR} s={1.1} /></g>
            <Actor seat="chair" x={1260} y={sitY(FLOOR - 110, 2)} s={2} outfit={KING_MAIN} pose={{ ...SIT, lean: -6, head: 2 }} flip mouth={km} mood="tight" />
          </Layer>
          <Grade color="#ff9a4a" opacity={0.16} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: iv(frame, [dur - 16, dur - 1], [0, 1]) }} />
      <Vignette s={0.65} />
    </AbsoluteFill>
  );
};
