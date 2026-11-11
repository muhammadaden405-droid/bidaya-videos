import React from "react";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { STAND, SIT, walkPose, Pose } from "../cartoon/Rig";
import { amiri, serif } from "../fonts";
import {
  Cam, Layer, iv, ease, useShot, moveCam, ridge, dunes, Vignette, Grain, Rays, Dust, SKY, Stars, Sun, Clouds,
  OUT, SOLDIER, ARAB, Figure, KElephant, Grade, Kaaba, Town, Bird,
} from "./kit";

// Scenes for TikTok part 5: the elephant kneels, the birds, the aftermath, the recitation, the end.
const at = (b: number[] | undefined, i: number, dur: number, frac: number) => (b && b[i] !== undefined ? b[i] : Math.round(dur * frac));
const RIDER = <g transform="scale(0.85)"><Figure x={0} y={0} outfit={OUT.abrahaKing} pose={SIT} flip /></g>;

// 31 — morning; Nufayl whispers in Maḥmūd's ear; the elephant kneels; Nufayl runs.
export const Whisper: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const whisperAt = at(b, 0, dur, 0.35);
  const kneelAt = at(b, 1, dur, 0.68);
  const runAt = at(b, 2, dur, 0.82);
  const walkIn = iv(frame, [0, whisperAt], [0, 1], ease);
  const kneel = iv(frame, [kneelAt, kneelAt + 45], [0, 1], ease);
  const run = iv(frame, [runAt, dur], [0, 1]);
  const close = frame >= whisperAt && frame < kneelAt;
  const cam: Cam = close
    ? moveCam((frame - whisperAt) / Math.max(1, kneelAt - whisperAt), { x: -560, y: 60, zoom: 2.0 }, { x: -620, y: 70, zoom: 2.2 })
    : frame < whisperAt
      ? moveCam(walkIn, { x: 0, y: 0, zoom: 1.0 }, { x: -200, y: -80, zoom: 1.3 })
      : moveCam(iv(frame, [kneelAt, dur], [0, 1]), { x: -120, y: -20, zoom: 1.35 }, { x: 0, y: 30, zoom: 1.1 });
  const nx = run > 0 ? 640 - run * 1100 : 100 + walkIn * 540;
  const nPose: Pose = run > 0 ? walkPose(frame * 0.45, 1.5) : walkIn < 1 ? walkPose(frame * 0.2) : { ...STAND, armRU: -120, armRL: -40, head: 10, lean: 6 };
  return (
    <AbsoluteFill style={{ background: SKY.dawn }}>
      <Layer d={0.02} cam={cam}><Sun x={1500} y={620} r={90} color="#fff1d0" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("wh", 700, 200, 120)} fill="#6a5070" /></Layer>
      <Layer d={0.4} cam={cam}>
        <path d={dunes("whm", 790, 40)} fill="#8a6a6a" />
        {new Array(30).fill(0).map((_, i) => <Figure key={i} x={1000 + i * 40} y={800 + (i % 3) * 12} s={0.3} outfit={SOLDIER(i)} flip />)}
      </Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={880} width={3800} height={700} fill="#a8846a" />
        <g transform="translate(860 900) scale(1.0)">
          <KElephant phase={frame * 0.03 * (1 - kneel)} earFlap={(Math.sin(frame * 0.06) + 1) / 2} kneel={kneel} rider={RIDER} />
        </g>
        <Figure x={nx} y={905} s={0.85} outfit={OUT.guide} flip={run > 0} pose={nPose} />
        {close ? <path d={`M 700 ${700 + Math.sin(frame * 0.4) * 3} q 20 -10 40 0`} stroke="#fff" strokeOpacity={0} /> : null}
        {[0, 1, 2].map((i) => <Figure key={i} x={1180 + i * 130} y={905} s={0.85} outfit={SOLDIER(i)} flip />)}
      </Layer>
      <Grade color="#ffb070" opacity={0.15} />
      <Vignette strength={0.55 + (close ? 0.2 : 0)} />
    </AbsoluteFill>
  );
};

// 32 — they beat it; it will not rise. Turned toward Yemen, Syria, the east it trots; toward Makkah it kneels.
// b = [beatAt, yemenAt, syriaAt, eastAt, makkahAt]
const DIRS = ["YEMEN", "SYRIA", "EAST", "MAKKAH"];
export const Refuse: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const beatAt = at(b, 0, dur, 0.0);
  const marks = [at(b, 1, dur, 0.4), at(b, 2, dur, 0.55), at(b, 3, dur, 0.7), at(b, 4, dur, 0.85)];
  let dir = -1;
  marks.forEach((m, i) => { if (frame >= m) dir = i; });
  const since = dir >= 0 ? frame - marks[dir] : frame - beatAt;
  const trotting = dir >= 0 && dir < 3;
  const kneel = dir === 3 ? iv(since, [8, 40], [0, 1], ease) : dir >= 0 ? iv(since, [0, 20], [1, 0], ease) : 1;
  const faceRight = trotting;
  const ex = trotting ? 960 + since * 3 : 960;
  const cam: Cam = dir < 0 ? moveCam(since / Math.max(1, marks[0] - beatAt), { x: 0, y: -80, zoom: 1.45 }, { x: 0, y: -40, zoom: 1.3 }) : { x: trotting ? since * 2 : 0, y: 0, zoom: 1.1 };
  const beating = dir < 0;
  return (
    <AbsoluteFill style={{ background: SKY.hot }}>
      <Layer d={0.15} cam={cam}><path d={ridge("rf", 690, 200, 120)} fill="#a8785a" /></Layer>
      <Layer d={0.4} cam={cam}>{new Array(30).fill(0).map((_, i) => <Figure key={i} x={-100 + i * 75} y={800 + (i % 3) * 12} s={0.32} outfit={SOLDIER(i)} />)}</Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={880} width={3800} height={700} fill="#c99a62" />
        <g transform={`translate(${ex} 900) scale(${faceRight ? -1 : 1} 1)`}>
          <KElephant phase={trotting ? frame * 0.3 : 0} earFlap={(Math.sin(frame * 0.2) + 1) / 2} kneel={kneel} />
        </g>
        {beating ? [0, 1, 2].map((i) => {
          const sw = Math.sin(frame * 0.5 + i * 2);
          return <g key={i}>
            <Figure x={[620, 1300, 1420][i]} y={900} s={0.9} outfit={SOLDIER(i, false)} flip={i > 0} pose={{ ...STAND, armRU: -140 + sw * 50, armRL: -20, lean: 6 }} />
          </g>;
        }) : null}
      </Layer>
      {dir >= 0 ? (
        <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 64, letterSpacing: 18, color: dir === 3 ? "#ffe2a0" : "#fff7e6", textShadow: "0 3px 18px rgba(0,0,0,0.6)", opacity: iv(since, [0, 8], [0, 1]) }}>
          {dir === 3 ? "→ " : "← "}{DIRS[dir]}
        </div>
      ) : null}
      <Grade color="#ff8030" opacity={0.12} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// 33 — birds from the sea, each carrying three stones; the stones fall.
export const Birds: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const stonesAt = at(b, 0, dur, 0.45);
  const arrive = iv(frame, [0, stonesAt], [0, 1]);
  const dark = iv(p, [0, 0.4], [0, 1]);
  const cam = moveCam(p, { x: 200, y: -120, zoom: 1.15 }, { x: -60, y: 20, zoom: 1.05 });
  const birds = new Array(140).fill(0).map((_, i) => {
    const lane = random(`bl${i}`);
    const delay = random(`bd${i}`) * 0.6;
    const t = Math.max(0, arrive - delay) / (1 - delay);
    const x = 2400 - t * (1200 + lane * 900) + Math.sin(frame * 0.05 + i) * 20 + (frame > stonesAt ? -(frame - stonesAt) * (0.6 + lane) : 0);
    const y = 120 + lane * 420 + Math.sin(frame * 0.08 + i * 2) * 14;
    return { x, y, s: 0.5 + lane * 0.6, f: frame * 0.9 + i };
  });
  const stones = frame > stonesAt ? new Array(120).fill(0).map((_, i) => {
    const life = 30;
    const age = (frame - stonesAt + i * 3) % life;
    const x = 200 + random(`sx${i}`) * 1600;
    return { x: x - age * 4, y: 300 + age * 26, o: age < life - 2 ? 1 : 0 };
  }) : [];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(rgba(20,12,18,${0.85 * dark}), rgba(20,12,18,${0.4 * dark})), ${SKY.hot}` }}>
      <Layer d={0.05} cam={cam}><Clouds y={80} color="#3a2a2a" opacity={0.5 * dark} seed="bc" speed={-1} /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("bf", 720, 200, 120)} fill={`rgb(${120 - dark * 60},${84 - dark * 40},${64 - dark * 30})`} /></Layer>
      <Layer d={0.35} cam={cam}>{birds.filter((_, i) => i % 2).map((q, i) => <Bird key={i} x={q.x} y={q.y} s={q.s * 0.6} flap={q.f} color="#141016" stone />)}</Layer>
      <Layer d={0.6} cam={cam}>
        <rect x={-900} y={820} width={3800} height={700} fill="#8a6a4a" />
        {new Array(40).fill(0).map((_, i) => {
          const run = frame > stonesAt ? iv(frame, [stonesAt + i * 2, stonesAt + i * 2 + 20], [0, 1]) : 0;
          const x = 100 + (i % 20) * 90 + run * (frame - stonesAt) * -2.5;
          return <Figure key={i} x={x} y={830 + Math.floor(i / 20) * 40} s={0.38} outfit={SOLDIER(i)} flip={run === 0} pose={run > 0 ? walkPose(frame * 0.4 + i, 1.4) : { ...STAND, head: -14 }} />;
        })}
      </Layer>
      <Layer d={0.8} cam={cam}>{stones.map((s, i) => <line key={i} x1={s.x} y1={s.y} x2={s.x + 10} y2={s.y - 40} stroke="#e8d8b8" strokeWidth={3} opacity={s.o * 0.8} />)}</Layer>
      <Layer d={1.1} cam={cam}>{birds.filter((_, i) => i % 2 === 0).map((q, i) => <Bird key={i} x={q.x} y={q.y} s={q.s} flap={q.f} color="#0e0b10" stone />)}</Layer>
      <Grade color="#6a2a1a" opacity={0.2 * dark} mode="multiply" />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

// 34 — the army flees down the road; birds above; Nufayl watches from the mountain.
export const Flee: React.FC = () => {
  const { frame, p } = useShot();
  const cam = moveCam(p, { x: -200, y: -40, zoom: 1.1 }, { x: 200, y: 0, zoom: 1.2 });
  return (
    <AbsoluteFill style={{ background: SKY.storm }}>
      <Layer d={0.05} cam={cam}>{new Array(40).fill(0).map((_, i) => <Bird key={i} x={((random(`fb${i}`) * 2400 - frame * 3) % 2400 + 2400) % 2400 - 200} y={80 + random(`fy${i}`) * 300} s={0.4} flap={frame + i} />)}</Layer>
      <Layer d={0.15} cam={cam}>
        <path d={ridge("fl", 650, 300, 130)} fill="#3a2028" />
        <Figure x={1500} y={520} s={0.25} outfit={{ ...OUT.guide, robe: "#1a1014", robeShade: "#1a1014", skin: "#1a1014", wrap: "#1a1014" }} />
      </Layer>
      <Layer d={1} cam={cam}>
        <path d="M -900 880 Q 600 840 2900 900 L 2900 1500 L -900 1500 Z" fill="#6a4030" />
        {new Array(16).fill(0).map((_, i) => {
          const x = 2000 - ((frame * 4 + i * 160) % 2600);
          const fall = random(`ff${i}`) > 0.75;
          return fall
            ? <g key={i} transform={`translate(${x} ${900 + (i % 2) * 40}) rotate(80)`}><Figure x={0} y={0} s={0.7} outfit={SOLDIER(i, false)} pose={STAND} /></g>
            : <Figure key={i} x={x} y={900 + (i % 2) * 40} s={0.7} outfit={SOLDIER(i, false)} flip pose={{ ...walkPose(frame * 0.45 + i, 1.5), armRU: -150, armRL: -40 }} />;
        })}
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={60} y0={600} y1={1080} drift={-4} opacity={0.4} size={6} /></Layer>
      <Grade color="#ff5020" opacity={0.15} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

// 35 — Abraha is carried home on a litter along the road at dusk.
export const Litter: React.FC = () => {
  const { frame, p } = useShot();
  const x = 300 + frame * 1.1;
  const cam: Cam = { x: x - 960 + iv(p, [0, 1], [-100, 100]), y: -20, zoom: 1.2 };
  return (
    <AbsoluteFill style={{ background: SKY.dusk }}>
      <Layer d={0.02} cam={cam}><Sun x={1400} y={640} r={110} color="#ffd9a0" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("li", 720, 140, 130)} fill="#5a2a40" /></Layer>
      <Layer d={1} cam={cam}>
        <path d={dunes("lg", 880, 20, 500, -3000, 6000)} fill="#3a1a28" />
        {[0, 1, 2, 3].map((i) => <Figure key={i} x={x + [-120, -40, 120, 200][i]} y={900 + (i % 2) * 10} s={0.8} outfit={SOLDIER(i, false)} pose={{ ...walkPose(frame * 0.12 + i, 0.5), armRU: -170, armRL: 0, armLU: -170, armLL: 0 }} />)}
        <rect x={x - 180} y={720} width={420} height={18} fill="#5a3a22" />
        <path d={`M ${x - 140} 720 L ${x + 200} 720 L ${x + 200} 690 L ${x - 140} 690 Z`} fill="#8f2a1c" />
        <Figure x={x + 20} y={700} s={0.5} outfit={OUT.abrahaKing} pose={{ ...STAND, lean: -88 }} />
      </Layer>
      <Grade color="#ff5a3a" opacity={0.15} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

// 36 — years later in Makkah: the elephant's driver and keeper, blind and crippled, begging.
export const Beggars: React.FC = () => {
  const { frame, p } = useShot();
  const cam = moveCam(p, { x: -100, y: -30, zoom: 1.2 }, { x: 60, y: -60, zoom: 1.45 });
  return (
    <AbsoluteFill style={{ background: SKY.day }}>
      <Layer d={0.15} cam={cam}><path d={ridge("bg", 640, 260, 120)} fill="#8a6a52" /></Layer>
      <Layer d={0.5} cam={cam}><Town y={860} n={16} x0={-200} gap={150} s={1.3} seed="bgt" /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={880} width={3800} height={700} fill="#c4a87a" />
        {[0, 1].map((i) => (
          <g key={i}>
            <Figure x={860 + i * 220} y={900} s={0.85} outfit={{ ...ARAB(i + 4), robe: "#7a6a55", robeShade: "#5a4a3a" }} pose={{ ...SIT, armRU: -80, armRL: -10, head: 14 + Math.sin(frame * 0.03 + i) * 3 }} flip={i === 1} />
            <line x1={830 + i * 280} y1={900} x2={850 + i * 240} y2={740} stroke="#5a3a22" strokeWidth={5} />
            <ellipse cx={940 + i * 60} cy={895} rx={24} ry={8} fill="#6a4a2a" />
          </g>
        ))}
        {new Array(3).fill(0).map((_, i) => <Figure key={i} x={((frame * 1.2 + i * 700) % 2400) - 200} y={920} s={0.8} outfit={ARAB(i)} pose={walkPose(frame * 0.2 + i)} />)}
      </Layer>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// 37 — the year of the birth: night over Makkah slowly gives way to a soft dawn light. (No depiction.)
export const BirthLight: React.FC = () => {
  const { p } = useShot();
  const cam = moveCam(p, { x: 0, y: 40, zoom: 1.0 }, { x: 0, y: -40, zoom: 1.2 });
  const dawn = iv(p, [0.2, 0.9], [0, 1], ease);
  return (
    <AbsoluteFill style={{ background: SKY.night }}>
      <AbsoluteFill style={{ background: SKY.dawn, opacity: dawn }} />
      <Layer d={0.02} cam={cam}><g opacity={1 - dawn}><Stars n={160} /></g><Sun x={960} y={760 - dawn * 160} r={80} color="#fff3d6" /></Layer>
      <Layer d={0.1} cam={cam}><Rays x={960} y={600 - dawn * 160} opacity={0.14 * dawn} /></Layer>
      <Layer d={0.2} cam={cam}><path d={ridge("bl", 700, 260, 120)} fill="#2a2a4a" /></Layer>
      <Layer d={0.5} cam={cam}><Town y={880} n={24} x0={-400} gap={110} seed="blt" lit /></Layer>
      <Grade color="#ffd090" opacity={0.15 * dawn} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// 38 — the House itself, in light.
export const HouseLight: React.FC = () => {
  const { p } = useShot();
  const cam = moveCam(p, { x: 0, y: 40, zoom: 1.0 }, { x: 0, y: -20, zoom: 1.3 });
  return (
    <AbsoluteFill style={{ background: SKY.dawn }}>
      <Layer d={0.02} cam={cam}><Sun x={960} y={420} r={80} color="#fff3d6" /></Layer>
      <Layer d={0.06} cam={cam}><Rays x={960} y={420} opacity={0.2} /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("hl", 680, 240, 120)} fill="#6a5070" /></Layer>
      <Layer d={0.4} cam={cam}><Town y={820} n={22} x0={-400} gap={120} seed="hlt" /></Layer>
      <Layer d={1} cam={cam}>
        <ellipse cx={960} cy={950} rx={900} ry={140} fill="#e6d8c8" />
        <rect x={-900} y={950} width={3800} height={600} fill="#cdbca8" />
        <Kaaba x={880} y={940} s={2.4} glow={1} />
      </Layer>
      <Layer d={1.3} cam={cam}><Dust n={30} color="#fff3d6" y0={300} y1={1000} drift={0.3} opacity={0.4} /></Layer>
      <Grade color="#ffc070" opacity={0.15} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// 39 — Sūrat al-Fīl: his recitation; each verse appears in Arabic with the Hilali–Khan translation.
const VERSES: [string, string][] = [
  ["أَلَمۡ تَرَ كَيۡفَ فَعَلَ رَبُّكَ بِأَصۡحَٰبِ ٱلۡفِيلِ", "Have you (O Muhammad ﷺ) not seen how your Lord dealt with the Owners of the Elephant?"],
  ["أَلَمۡ يَجۡعَلۡ كَيۡدَهُمۡ فِي تَضۡلِيلٖ", "Did He not make their plot go astray?"],
  ["وَأَرۡسَلَ عَلَيۡهِمۡ طَيۡرًا أَبَابِيلَ", "And sent against them birds, in flocks,"],
  ["تَرۡمِيهِم بِحِجَارَةٖ مِّن سِجِّيلٖ", "Striking them with stones of Sijjil."],
  ["فَجَعَلَهُمۡ كَعَصۡفٖ مَّأۡكُولِۭ", "And made them like an empty field of stalks (of which the corn has been eaten up by cattle)."],
];
export const Recitation: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const starts = VERSES.map((_, i) => at(b, i, dur, i / 5));
  let v = 0;
  starts.forEach((s, i) => { if (frame >= s) v = i; });
  const since = frame - starts[v];
  const end = v < 4 ? starts[v + 1] : dur;
  const o = iv(frame, [starts[v], starts[v] + 10, end - 8, end], [0, 1, 1, v < 4 ? 0 : 1]);
  const cam = moveCam(p, { x: 0, y: 0, zoom: 1.05 }, { x: 0, y: -20, zoom: 1.2 });
  return (
    <AbsoluteFill style={{ background: SKY.night }}>
      <Layer d={0.02} cam={cam}><Stars n={180} /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("rc", 760, 220, 120)} fill="#151a36" /></Layer>
      <Layer d={1} cam={cam}>
        <ellipse cx={960} cy={1010} rx={900} ry={120} fill="#2a2a40" />
        <Kaaba x={880} y={1000} s={1.6} night glow={0.5} />
      </Layer>
      <AbsoluteFill style={{ background: "linear-gradient(rgba(5,6,16,0.55), rgba(5,6,16,0.2) 70%, rgba(5,6,16,0.6))" }} />
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", opacity: o, transform: `translateY(${iv(since, [0, 14], [14, 0], ease)}px)` }}>
        <div style={{ fontFamily: amiri, fontSize: 96, color: "#ffe2a0", direction: "rtl", lineHeight: 1.6, textShadow: "0 0 40px rgba(255,190,90,0.35)" }}>{VERSES[v][0]}</div>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 44, color: "#f6ecd8", fontStyle: "italic", margin: "18px auto 0", maxWidth: 1400, lineHeight: 1.3 }}>“{VERSES[v][1]}”</div>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 30, color: "#bfa98a", marginTop: 16, letterSpacing: 2 }}>Sūrat al-Fīl 105:{v + 1}</div>
      </div>
      <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", fontFamily: serif, fontSize: 24, color: "#8f8270" }}>Translation: Hilali &amp; Muhsin Khan (Tanzil.net)</div>
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// 40 — al-Qullays taken down stone by stone; then the Kaʿbah, still standing.
export const Ruins: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const standAt = at(b, 0, dur, 0.62);
  if (frame >= standAt) {
    const t = (frame - standAt) / Math.max(1, dur - standAt);
    const cam = moveCam(t, { x: 0, y: 60, zoom: 1.1 }, { x: 0, y: 0, zoom: 1.35 });
    return (
      <AbsoluteFill style={{ background: SKY.dusk }}>
        <Layer d={0.02} cam={cam}><Sun x={960} y={560} r={110} color="#ffe2a8" /></Layer>
        <Layer d={0.06} cam={cam}><Rays x={960} y={560} opacity={0.18} /></Layer>
        <Layer d={0.15} cam={cam}><path d={ridge("ks", 700, 240, 120)} fill="#5d2c4c" /></Layer>
        <Layer d={0.4} cam={cam}><Town y={830} n={22} x0={-400} gap={120} seed="kst" lit /></Layer>
        <Layer d={1} cam={cam}>
          <ellipse cx={960} cy={950} rx={900} ry={140} fill="#c9a88a" />
          <rect x={-900} y={950} width={3800} height={600} fill="#a8866a" />
          <Kaaba x={880} y={940} s={2.4} glow={0.8} />
        </Layer>
        <Grade color="#ff9a50" opacity={0.15} />
        <Vignette strength={0.55} />
      </AbsoluteFill>
    );
  }
  const t = frame / Math.max(1, standAt);
  const cam = moveCam(t, { x: 0, y: -120, zoom: 1.0 }, { x: 0, y: 40, zoom: 1.15 });
  const gone = iv(t, [0.1, 0.95], [0, 1]);
  const blocks: { x: number; y: number }[] = [];
  for (let r = 0; r < 14; r++) for (let c = 0; c < 6; c++) blocks.push({ x: 830 + c * 44, y: 840 - r * 50 });
  return (
    <AbsoluteFill style={{ background: SKY.day }}>
      <Layer d={0.04} cam={cam}><Clouds y={100} color="#ffffff" opacity={0.7} seed="ru" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("ruf", 700, 140, 130, -1600, 4400, true)} fill="#9a9a7a" /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-900} y={880} width={3800} height={700} fill="#bfa070" />
        <rect x={640} y={Math.max(560, 560 + gone * 320)} width={640} height={Math.max(0, 320 - gone * 320)} fill="#d8d0bc" />
        {blocks.map((q, i) => {
          const removed = (blocks.length - i) / blocks.length < gone;
          return removed ? null : <rect key={i} x={q.x} y={q.y - 50} width={42} height={48} fill={i % 2 ? "#cfc6b0" : "#c4bba4"} />;
        })}
        {new Array(24).fill(0).map((_, i) => <rect key={i} x={300 + random(`rb${i}`) * 300} y={860 - (i % 4) * 30} width={40} height={30} fill="#c4bba4" opacity={Math.min(1, gone * 3)} />)}
        {[0, 1, 2, 3].map((i) => <Figure key={i} x={700 + i * 170} y={900} s={0.6} outfit={ARAB(i)} pose={{ ...STAND, armRU: -100 + Math.sin(frame * 0.3 + i) * 50, armRL: -40, lean: 8 }} />)}
      </Layer>
      <Layer d={1.3} cam={cam}><Dust n={40} color="#f0e6d0" y0={500} y1={1000} drift={0.8} opacity={0.35} /></Layer>
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// 41 — sources card (page numbers at the end, per the series rules).
const PAGES: [string, string][] = [
  ["The duel in Yemen", "pp. 133–138"],
  ["The church of Ṣanʿāʾ", "pp. 140–141"],
  ["The march north", "pp. 141–143"],
  ["The lord of the camels", "pp. 143–145"],
  ["A night at the Kaʿbah", "pp. 145–146"],
  ["The elephant kneels", "pp. 146–147"],
  ["The birds from the sea", "pp. 147–149, 151"],
  ["After the elephant", "pp. 149–153, 157"],
];
export const EndCard: React.FC = () => {
  const { frame } = useShot();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #f3e6c6 0%, #e2cfa2 70%, #c9b07e 100%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1100, color: "#3a2414", opacity: iv(frame, [0, 15], [0, 1]) }}>
        <div style={{ fontFamily: serif, fontSize: 26, letterSpacing: 8, textAlign: "center", color: "#7a5a3a" }}>WHERE TO FIND IT</div>
        <div style={{ fontFamily: serif, fontSize: 78, textAlign: "center", lineHeight: 1.1 }}>al-Bidāya wa al-Nihāya</div>
        <div style={{ fontFamily: serif, fontSize: 32, textAlign: "center", fontStyle: "italic", color: "#5a3a20", marginBottom: 30 }}>Ibn Kathīr · edited by al-Turkī · volume 3</div>
        {PAGES.map(([t, pg], i) => (
          <div key={i} style={{ display: "flex", fontFamily: `"${serif}", "${amiri}"`, fontSize: 34, lineHeight: 1.55, opacity: iv(frame, [10 + i * 4, 22 + i * 4], [0, 1]) }}>
            <span>{t}</span><span style={{ flex: 1, borderBottom: "2px dotted #a8845a", margin: "0 14px 14px" }} /><span>{pg}</span>
          </div>
        ))}
        <div style={{ fontFamily: serif, fontSize: 22, textAlign: "center", color: "#7a5a3a", marginTop: 26 }}>Qurʾān translation: Hilali &amp; Muhsin Khan (Tanzil.net) · recitation by the channel · sound effects CC0</div>
      </div>
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

// "Rotate your phone" card for the full 16:9 episode, with the channel logo.
export const RotateCard: React.FC = () => {
  const { frame } = useShot();
  const rot = iv(frame, [12, 34], [0, -90], ease);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0a08", alignItems: "center", justifyContent: "center" }}>
      <svg width={300} height={300} viewBox="-150 -150 300 300">
        <g transform={`rotate(${rot})`}>
          <rect x={-55} y={-100} width={110} height={200} rx={16} fill="none" stroke="#f6e6c8" strokeWidth={8} />
          <circle cx={0} cy={80} r={7} fill="#f6e6c8" />
        </g>
        <path d="M 95 -60 A 110 110 0 0 0 40 -110" stroke="#e3a64a" strokeWidth={6} fill="none" opacity={iv(frame, [0, 10], [0, 1])} />
      </svg>
      <div style={{ fontFamily: serif, fontSize: 44, color: "#f6e6c8", marginTop: 20, letterSpacing: 4 }}>Rotate your phone for the full picture</div>
      <Img src={staticFile("logo.png")} style={{ position: "absolute", bottom: 60, width: 110, opacity: 0.9 }} />
    </AbsoluteFill>
  );
};
