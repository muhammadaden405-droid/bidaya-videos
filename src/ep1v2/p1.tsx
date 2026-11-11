import React from "react";
import { AbsoluteFill, random } from "remotion";
import { STAND, SIT } from "../cartoon/Rig";
import { OUT, SOLDIER, ARAB } from "../ep1/kit";
import { serif, display } from "../fonts";
import {
  Cam, Layer, Defs, Sky, SKIES, iv, ease, easeOut, easeIn, useShot, useView, lerpCam, shakeAt, ridge, Dust, DustBurst, Embers, Grade, Vignette, Glow, Stars,
  Fig, Elephant2, Kaaba2, Ship2, Horse2, Torch2,
} from "./kit2";

// Part 1 — "Elephants don't kneel": the cold open, the trench, the escape, Caesar, the fleet.
// b = beat frames inside the shot (from the narration's word timings).
const at = (b: number[] | undefined, i: number, dur: number, frac: number) => (b && b[i] !== undefined ? b[i] : Math.round(dur * frac));
const SIL = "#1a0c14";
const DRIVER = <g transform="scale(0.55)"><Fig x={0} y={0} outfit={SOLDIER(1, false)} pose={{ ...SIT }} flip /></g>;

// 1a — "Elephants don't kneel." Silhouette of a war elephant walking across a blazing dawn sun.
export const HookSilhouette: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam: Cam = lerpCam(p, { x: 0, y: 120, zoom: vertical ? 1.15 : 1.05 }, { x: 0, y: 60, zoom: vertical ? 1.35 : 1.25 }, easeOut);
  const ex = 1120 - frame * 1.6;
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dawn} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={960} y={1180} r={900} o={0.8} /><circle cx={960} cy={1180} r={250} fill="#ffe8b8" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("hs1", 1290, 120, 140)} fill="#3a1a30" /></Layer>
      <Layer d={0.5} cam={cam}><path d={ridge("hs2", 1360, 50, 200)} fill="#24101e" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1400} width={3600} height={800} fill={SIL} />
        <g transform={`translate(${ex} 1410) scale(1.25)`}><Elephant2 walk={frame * 0.09} gait={0.8} ear={(Math.sin(frame * 0.06) + 1) / 2} silhouette={SIL} driver={<g transform="scale(0.55)"><Fig x={0} y={0} outfit={SOLDIER(1, false)} pose={SIT} flip silhouette={SIL} /></g>} /></g>
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={50} color="#ffd9a0" y0={900} y1={1600} drift={1.2} size={4} opacity={0.5} /></Layer>
      <Grade color="#ff8a3a" opacity={0.25} />
      <Vignette s={0.75} />
    </AbsoluteFill>
  );
};

// 1b — "But one morning, outside Makkah… one did." The army lined up; the elephant drops to its knees.
export const KneelWide: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const dropAt = at(b, 0, dur, 0.6);
  const k = iv(frame, [dropAt - 4, dropAt + 10], [0, 1], easeIn);
  const sh = shakeAt(frame, [dropAt + 10], 26);
  const base: Cam = lerpCam(p, vertical ? { x: 0, y: 40, zoom: 1.0 } : { x: 0, y: 60, zoom: 1.0 }, vertical ? { x: -40, y: 20, zoom: 1.12 } : { x: 0, y: 20, zoom: 1.12 });
  const cam = { ...base, x: base.x + sh.x, y: base.y + sh.y };
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dawn} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={1500} y={1150} r={600} /><circle cx={1500} cy={1150} r={110} fill="#fff1d0" /></Layer>
      <Layer d={0.12} cam={cam}><path d={ridge("kw1", 1180, 260, 150)} fill="#5e3c58" /></Layer>
      <Layer d={0.3} cam={cam}><path d={ridge("kw2", 1270, 160, 120)} fill="#46283f" /></Layer>
      <Layer d={0.55} cam={cam}>
        <Defs />
        <rect x={-800} y={1300} width={3600} height={800} fill="#8a5a4a" />
        {new Array(40).fill(0).map((_, i) => <Fig key={i} x={-200 + i * 62} y={1300 + (i % 3) * 14} s={0.42} outfit={SOLDIER(i)} prop="spear" flip pose={{ ...STAND, head: Math.sin(frame * 0.05 + i) * 3 }} />)}
      </Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill="#a87a56" />
        <g transform="translate(980 1460) scale(0.95)"><Elephant2 walk={frame * 0.05} gait={0.3 * (1 - k)} kneel={k} ear={(Math.sin(frame * 0.12) + 1) / 2} driver={DRIVER} /></g>
        <DustBurst x={760} y={1450} at={dropAt + 8} size={1.4} />
        <DustBurst x={1150} y={1450} at={dropAt + 10} size={1.0} />
      </Layer>
      <Grade color="#ff9a5a" opacity={0.2} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// 1c/1d — close on the kneeling elephant: axes to its head, then hooks to its belly. mode "axes" | "hooks"
export const Beating: React.FC<{ b?: number[]; mode?: "axes" | "hooks" }> = ({ b, mode = "axes" }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const period = 16;
  const hits = new Array(8).fill(0).map((_, i) => 6 + i * period).filter((h) => h < dur);
  const sh = shakeAt(frame, hits, 10);
  const target = mode === "axes" ? (vertical ? { x: -400, y: -40, zoom: 1.8 } : { x: -300, y: -60, zoom: 1.6 }) : (vertical ? { x: -40, y: 80, zoom: 1.9 } : { x: 0, y: 60, zoom: 1.6 });
  const c0 = lerpCam(p, { ...target, zoom: target.zoom * 0.94 }, target);
  const cam = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
  const flinch = hits.reduce((m, h) => Math.max(m, frame >= h && frame < h + 10 ? Math.exp(-(frame - h) / 4) : 0), 0);
  const swing = (i: number) => {
    const t = ((frame - 6 + i * 8) % period) / period;
    return t < 0.6 ? -170 * (t / 0.6) : -170 + (t - 0.6) * 380;
  };
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dawn} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={700} y={1050} r={700} /></Layer>
      <Layer d={0.2} cam={cam}><path d={ridge("bt1", 1200, 200, 140)} fill="#4a2a44" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill="#9a6e50" />
        <g transform={`translate(${980 + flinch * 6} 1460) scale(0.95)`}><Elephant2 kneel={1} ear={0.5 + flinch * 0.5} trunk={flinch} skin="#857d78" driver={DRIVER} /></g>
        {mode === "axes"
          ? [0, 1].map((i) => <Fig key={i} x={[400, 560][i]} y={1450} s={1.0} outfit={SOLDIER(i + 2, false)} prop="axe" pose={{ ...STAND, armRU: Math.max(-175, Math.min(-10, swing(i))), armRL: -10, lean: 6 }} />)
          : [0, 1].map((i) => <Fig key={i} x={[860, 1060][i]} y={1450} s={1.0} outfit={SOLDIER(i, false)} prop="hook" pose={{ ...STAND, armRU: -80 + Math.sin(frame * 0.4 + i * 2) * 20, armRL: -20, lean: 10 }} flip={i === 1} />)}
        {hits.map((h, i) => (frame >= h && frame < h + 5 ? <circle key={i} cx={mode === "axes" ? 560 : 960} cy={mode === "axes" ? 1080 : 1230} r={40 - (frame - h) * 6} fill="#fff2d0" opacity={0.8} /> : null))}
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={40} color="#f3c08a" y0={1000} y1={1600} drift={1.5} size={5} opacity={0.4} /></Layer>
      <Grade color="#ff6a3a" opacity={0.18} />
      <Vignette s={0.75} />
    </AbsoluteFill>
  );
};

// 1e — "It would not take one step toward the Kaʿbah." The kneeling elephant; far off, the valley of Makkah.
export const TowardKaaba: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, vertical ? { x: 140, y: 0, zoom: 1.0 } : { x: 120, y: 20, zoom: 1.0 }, vertical ? { x: -260, y: -40, zoom: 1.25 } : { x: -200, y: -40, zoom: 1.2 });
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dawn} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={500} y={1100} r={700} /></Layer>
      <Layer d={0.1} cam={cam}>
        <path d={ridge("tk1", 1150, 300, 140)} fill="#6a4a64" />
        {new Array(16).fill(0).map((_, i) => <rect key={i} x={360 + i * 22} y={1200 - (i % 3) * 8} width={18} height={14} fill="#c9a88a" />)}
        <Kaaba2 x={540} y={1225} s={0.22} />
        <Glow x={560} y={1200} r={120} o={0.6} />
      </Layer>
      <Layer d={0.3} cam={cam}><path d={ridge("tk2", 1300, 140, 120)} fill="#4a2a44" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill="#9a6e50" />
        <g transform="translate(1250 1470) scale(1.05)"><Elephant2 kneel={1} ear={(Math.sin(frame * 0.05) + 1) / 2} skin="#857d78" driver={DRIVER} /></g>
      </Layer>
      <Grade color="#ffb070" opacity={0.15} />
      <Vignette s={0.65} />
    </AbsoluteFill>
  );
};

// 1f/1g — turned toward Yemen it rises and runs; turned back toward Makkah it drops again. mode "run" | "again"
export const TurnTest: React.FC<{ b?: number[]; mode?: "run" | "again" }> = ({ b, mode = "run" }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const evt = at(b, 0, dur, mode === "run" ? 0.35 : 0.55);
  const k = mode === "run" ? iv(frame, [evt - 18, evt], [1, 0], ease) : iv(frame, [evt - 4, evt + 10], [0, 1], easeIn);
  const runX = mode === "run" ? iv(frame, [evt, dur], [0, 520], easeIn) : 0;
  const sh = shakeAt(frame, mode === "again" ? [evt + 10] : [], 26);
  const c0 = lerpCam(p, vertical ? { x: 0, y: 20, zoom: 1.15 } : { x: 0, y: 30, zoom: 1.1 }, vertical ? { x: mode === "run" ? 200 : 0, y: 0, zoom: 1.2 } : { x: mode === "run" ? 160 : 0, y: 0, zoom: 1.18 });
  const cam = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
  const facesRight = mode === "run";
  const label = mode === "run" ? "YEMEN →" : "← MAKKAH";
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dawn} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={1400} y={1100} r={600} /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge(mode, 1220, 220, 140)} fill="#5a3a52" /></Layer>
      <Layer d={0.5} cam={cam}><rect x={-800} y={1320} width={3600} height={800} fill="#8a5a4a" />{new Array(30).fill(0).map((_, i) => <Fig key={i} x={-100 + i * 80} y={1320 + (i % 2) * 12} s={0.4} outfit={SOLDIER(i)} prop="spear" />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill="#a87a56" />
        <g transform={`translate(${960 + runX} 1460) scale(${facesRight ? -0.95 : 0.95} 0.95)`}><Elephant2 walk={frame * (mode === "run" && frame > evt ? 0.3 : 0.05)} gait={mode === "run" && frame > evt ? 1.2 : 0} kneel={k} ear={(Math.sin(frame * 0.2) + 1) / 2} driver={DRIVER} /></g>
        {mode === "again" ? <DustBurst x={760} y={1450} at={evt + 8} size={1.4} /> : null}
      </Layer>
      <div style={{ position: "absolute", top: vertical ? "16%" : "10%", width: "100%", textAlign: "center", fontFamily: display, fontWeight: 700, fontSize: vertical ? 90 : 72, letterSpacing: 16, color: mode === "again" ? "#ffd27a" : "#fff4e0", textShadow: "0 4px 24px rgba(0,0,0,0.7)", opacity: iv(frame, [Math.max(0, evt - 30), evt - 20], [0, 1]) }}>{label}</div>
      <Grade color="#ff9a5a" opacity={0.18} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// 1h — "How did a war elephant end up at the edge of Makkah?" Pull back; the title.
export const TitleReveal: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const tAt = at(b, 0, dur, 0.35);
  const cam = lerpCam(p, { x: 0, y: 40, zoom: 1.25 }, { x: 0, y: -40, zoom: 0.95 }, easeOut);
  const o = iv(frame, [tAt, tAt + 14], [0, 1]);
  const sc = iv(frame, [tAt, tAt + 10], [1.25, 1], easeOut);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dusk} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={960} y={1150} r={800} /><circle cx={960} cy={1180} r={160} fill="#ffe2b0" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("tr1", 1250, 240, 140)} fill="#3a1a30" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill={SIL} />
        <g transform="translate(960 1460) scale(0.8)"><Elephant2 kneel={1} silhouette={SIL} driver={<g transform="scale(0.55)"><Fig x={0} y={0} outfit={SOLDIER(1, false)} pose={SIT} flip silhouette={SIL} /></g>} /></g>
      </Layer>
      <Grade color="#ff7a3a" opacity={0.2} />
      <Vignette s={0.75} />
      <div style={{ position: "absolute", top: vertical ? "24%" : "16%", width: "100%", textAlign: "center", opacity: o, transform: `scale(${sc})` }}>
        <div style={{ fontFamily: serif, fontSize: vertical ? 40 : 34, letterSpacing: 14, color: "#ffcf7a" }}>al-Bidāya wa al-Nihāya</div>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: vertical ? 104 : 104, lineHeight: 1.05, color: "#fff4e0", textShadow: "0 6px 40px rgba(0,0,0,0.6)" }}>{vertical ? <>The Year<br />of the Elephant</> : "The Year of the Elephant"}</div>
      </div>
    </AbsoluteFill>
  );
};

// 1i/1j — the trench of fire at Najrān: flames rise across the screen, then the long trench and the king above it.
export const Trench: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const kingAt = at(b, 0, dur, 0.3);
  const rise = iv(frame, [0, 24], [0, 1], easeOut);
  const cam = lerpCam(p, { x: 0, y: 260, zoom: 1.4 }, vertical ? { x: -80, y: -40, zoom: 1.05 } : { x: 0, y: -20, zoom: 1.0 });
  const fl = (i: number, base: number, h0: number) => {
    const h = h0 * (0.6 + 0.4 * Math.abs(Math.sin(frame * 0.3 + i * 1.7))) * rise;
    const x = -500 + i * 46;
    return <path key={i} d={`M ${x} ${base} Q ${x + 10} ${base - h * 0.6} ${x + 23 + Math.sin(frame * 0.2 + i) * 8} ${base - h} Q ${x + 36} ${base - h * 0.6} ${x + 46} ${base} Z`} fill={i % 3 ? "#ffb347" : "#ff6a1a"} />;
  };
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.fire} />
      <Layer d={0.02} cam={cam}><Defs /><Stars n={80} /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("tn1", 1150, 220, 140)} fill="#16060c" /></Layer>
      <Layer d={0.6} cam={cam}>
        <Defs />
        <rect x={-800} y={1260} width={3600} height={800} fill="#160808" />
        <Glow x={960} y={1300} r={1300} id="glowR" o={0.7 * rise} />
        {new Array(70).fill(0).map((_, i) => fl(i, 1300, 170))}
        <rect x={-600} y={1296} width={3200} height={26} fill="#ff8a2a" opacity={rise} />
        <Embers n={90} x0={-200} x1={2200} base={1300} />
        {/* the king watching from a rise */}
        <path d="M 1150 1260 Q 1300 1150 1500 1160 L 1700 1260 Z" fill="#0c0406" />
        <Fig x={1360} y={1170} s={0.55} outfit={OUT.dhuNuwas} silhouette="#0c0406" pose={{ ...STAND, armRU: -40, armRL: -40 }} flip o={iv(frame, [kingAt, kingAt + 15], [0, 1])} />
      </Layer>
      <Layer d={1} cam={cam}>
        <rect x={-800} y={1460} width={3600} height={800} fill="#0a0305" />
        {new Array(14).fill(0).map((_, i) => <Fig key={i} x={100 + i * 130} y={1470 + (i % 2) * 20} s={0.7} outfit={ARAB(i)} silhouette="#0a0305" pose={{ ...STAND, head: -10 + Math.sin(frame * 0.04 + i) * 3 }} />)}
      </Layer>
      <Grade color="#ff4a10" opacity={0.25} />
      <Vignette s={0.8} />
    </AbsoluteFill>
  );
};

// 1k — one man escapes: Daws gallops into moonlit dunes; the pursuers fall behind in the sand.
export const Escape: React.FC = () => {
  const { frame } = useShot();
  const { vertical } = useView();
  const x = 600 + frame * 3;
  const cam: Cam = { x: x - 960 + (vertical ? 60 : 160), y: 0, zoom: vertical ? 1.15 : 1.05 };
  const pursuer = (i: number) => x - 600 - i * 220 - frame * (0.8 + i * 0.4);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.night} />
      <Layer d={0.02} cam={{ ...cam, x: 0 }}><Defs /><Stars n={180} /><circle cx={1300} cy={600} r={70} fill="#fdf6dc" /><Glow x={1300} y={600} r={300} o={0.4} /></Layer>
      <Layer d={0.2} cam={cam}><path d={ridge("es1", 1250, 160, 220, -1400, 9000)} fill="#232a4e" /></Layer>
      <Layer d={0.5} cam={cam}><path d={ridge("es2", 1350, 90, 260, -1400, 9000)} fill="#2e3460" /></Layer>
      <Layer d={1} cam={cam}>
        <path d={ridge("es3", 1470, 40, 400, -1400, 9000)} fill="#3a3a64" />
        {[0, 1].map((i) => <g key={i} transform={`translate(${pursuer(i)} 1480) scale(0.75)`} opacity={0.85}><Horse2 phase={frame * 0.32 + i} gallop={0.7} sil="#141634" rider={<g transform="translate(0 70) scale(0.9)"><Fig x={0} y={0} outfit={SOLDIER(i)} pose={SIT} silhouette="#141634" /></g>} /></g>)}
        <g transform={`translate(${x} 1480) scale(0.9)`}><Horse2 phase={frame * 0.42} gallop={1.1} color="#3a2a22" rider={<g transform="translate(0 70) scale(0.9)"><Fig x={0} y={0} outfit={{ skin: "#a87650", robe: "#e9dfc8", robeShade: "#b8a888", wrap: "#f2ece0" }} pose={{ ...SIT, lean: 14, armRU: -60 }} sway={frame * 0.4} /></g>} /></g>
      </Layer>
      <Layer d={1.3} cam={cam}><Dust n={50} color="#9aa0c8" y0={1300} y1={1600} drift={-3} size={5} opacity={0.35} /></Layer>
      <Grade color="#3a5ab0" opacity={0.2} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};

// 1l/1m — before Caesar in a marble hall; the letter is sealed. b = [sealAt]
export const Caesar: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const sealAt = at(b, 0, dur, 0.6);
  const sealing = frame >= sealAt;
  const cam = sealing
    ? lerpCam((frame - sealAt) / Math.max(1, dur - sealAt), { x: 0, y: vertical ? 160 : 260, zoom: 2.2 }, { x: 0, y: vertical ? 140 : 250, zoom: 2.4 })
    : lerpCam(frame / Math.max(1, sealAt), vertical ? { x: 0, y: 40, zoom: 1.0 } : { x: 0, y: 200, zoom: 1.0 }, vertical ? { x: 60, y: -40, zoom: 1.3 } : { x: 60, y: 230, zoom: 1.2 });
  const pillar = (x: number) => (
    <g key={x}>
      <rect x={x} y={500} width={110} height={940} fill="#e8e0d0" />
      <rect x={x} y={500} width={30} height={940} fill="#000" opacity={0.08} />
      <rect x={x - 18} y={480} width={146} height={34} fill="#d8cfbd" />
    </g>
  );
  return (
    <AbsoluteFill>
      <Sky stops={[[0, "#1c1424"], [100, "#3a2a3a"]]} />
      <Layer d={0.3} cam={cam}>
        <rect x={-800} y={300} width={3600} height={1400} fill="#2c2034" />
        {[-200, 260, 1550, 2010].map((x) => <path key={x} d={`M ${x} 420 L ${x + 260} 420 L ${x + 240} 1300 L ${x + 20} 1300 Z`} fill="#5a1f4a" />)}
      </Layer>
      <Layer d={0.6} cam={cam}>{[100, 560, 1250, 1710].map(pillar)}<Torch2 x={430} y={900} seed={1} /><Torch2 x={1500} y={900} seed={4} /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill="#d8d0c0" />
        <rect x={-800} y={1440} width={3600} height={800} fill="#000" opacity={0.15} />
        <path d="M 760 1440 L 1160 1440 L 1120 1300 L 800 1300 Z" fill="#cfc6b4" />
        <g transform="translate(960 1300)">
          <path d="M -90 0 L -90 -300 Q 0 -360 90 -300 L 90 0 Z" fill="#c9a24a" stroke="#1b100c" strokeWidth={5} />
          <path d="M -70 -10 L -70 -280 Q 0 -325 70 -280 L 70 -10 Z" fill="#5a1f4a" />
        </g>
        <Fig x={960} y={1260} s={0.8} outfit={{ skin: "#c99a78", robe: "#f2ece0", robeShade: "#cfc3a8", crown: true, cape: "#6a1f5a" }} pose={sealing ? { ...SIT, armRU: -80, armRL: -30 } : { ...SIT, armRU: -100, armRL: -10, head: 4 }} />
        <Fig x={1150} y={1450} s={0.85} outfit={{ skin: "#a87650", robe: "#e9dfc8", robeShade: "#b8a888", wrap: "#f2ece0" }} flip pose={{ ...STAND, legLU: -60, legLL: 100, legRU: -70, legRL: 110, bob: 70, lean: -10, head: -14, armRU: -70, armRL: -40 }} />
        {sealing ? (
          <g transform="translate(960 1180)">
            <rect x={-150} y={-40} width={300} height={190} fill="#ead9b0" stroke="#1b100c" strokeWidth={4} />
            {new Array(5).fill(0).map((_, i) => <line key={i} x1={-120} y1={-10 + i * 28} x2={120} y2={-10 + i * 28} stroke="#7a5a3a" strokeWidth={3} />)}
            <circle cx={0} cy={140} r={iv(frame, [sealAt + 5, sealAt + 12], [0, 34], easeOut)} fill="#8f1a1a" stroke="#1b100c" strokeWidth={3} />
          </g>
        ) : null}
      </Layer>
      <Grade color="#ffcf8a" opacity={0.12} />
      <Vignette s={0.65} />
    </AbsoluteFill>
  );
};

// 1n — "with seventy thousand soldiers… across the sea." A fleet filling the sea to the horizon.
const Waves: React.FC<{ y: number; color: string; amp: number; speed: number; seed: number }> = ({ y, color, amp, speed, seed }) => {
  const { frame } = useShot();
  let d = `M -1400 ${y}`;
  for (let x = -1400; x <= 3400; x += 80) d += ` Q ${x + 40} ${y - amp * Math.sin(x * 0.01 + frame * speed + seed)} ${x + 80} ${y}`;
  return <path d={d + ` L 3400 2600 L -1400 2600 Z`} fill={color} />;
};
export const Armada: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, vertical ? { x: 0, y: 160, zoom: 1.6 } : { x: 0, y: 140, zoom: 1.5 }, { x: 0, y: -30, zoom: 1.0 }, ease);
  const far = new Array(60).fill(0).map((_, i) => ({ x: random(`af${i}`) * 2600 - 340 + frame * 0.3, y: 1150 + random(`ag${i}`) * 90, s: 0.08 + random(`ah${i}`) * 0.08 }));
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dawn} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={960} y={1080} r={800} /><circle cx={960} cy={1110} r={120} fill="#fff1d0" /></Layer>
      <Layer d={0.2} cam={cam}>
        <Waves y={1140} color="#6a6a98" amp={3} speed={0.04} seed={0} />
        {far.map((q, i) => <g key={i} transform={`translate(${q.x} ${q.y})`}><Ship2 rock={Math.sin(frame * 0.05 + i) * 2} s={q.s} sil="#2a2440" /></g>)}
      </Layer>
      <Layer d={0.5} cam={cam}>
        <Waves y={1260} color="#4f5a88" amp={8} speed={0.06} seed={2} />
        {new Array(12).fill(0).map((_, i) => <g key={i} transform={`translate(${-100 + i * 190 + frame * 0.6} ${1290 + (i % 2) * 30})`}><Ship2 rock={Math.sin(frame * 0.05 + i) * 3} s={0.3} /></g>)}
      </Layer>
      <Layer d={1} cam={cam}>
        <Waves y={1430} color="#3a4672" amp={14} speed={0.08} seed={4} />
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${[300, 960, 1620][i] + frame * 0.9} ${1490 + (i % 2) * 40})`}><Ship2 rock={Math.sin(frame * 0.06 + i * 2) * 4} s={0.75} /></g>)}
        <Waves y={1560} color="#2a335a" amp={22} speed={0.1} seed={6} />
      </Layer>
      <Grade color="#ffb070" opacity={0.18} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

export const P1_SCENES = { HookSilhouette, KneelWide, Beating, TowardKaaba, TurnTest, TitleReveal, Trench, Escape, Caesar, Armada };
