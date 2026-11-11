import React from "react";
import { AbsoluteFill } from "remotion";
import { STAND, SIT, walkPose, blend, Pose } from "../cartoon/Rig";
import { OUT, SOLDIER, BLUE } from "../ep1/kit";
import { display, serif } from "../fonts";
import {
  Cam, Layer, Defs, Sky, SKIES, iv, ease, easeOut, useShot, useView, lerpCam, aim, shakeAt, ridge, Dust, Grade, Vignette, Glow,
  Fig, Torch2, Horse2,
} from "./kit2";

// Part 3 — "The King's Oath": the wound, ʿAtwada, the army changes sides, the Negus's oath, the shaved head and the soil.
const at = (b: number[] | undefined, i: number, dur: number, frac: number) => (b && b[i] !== undefined ? b[i] : Math.round(dur * frac));

const Ground: React.FC<{ color?: string }> = ({ color = "#a8724e" }) => <rect x={-1400} y={1440} width={4800} height={1200} fill={color} />;

// 3a — the blow lands; Abraha reels, a dark line across his face; his new name burns in. b = [nameAt]
export const Wound: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const nameAt = at(b, 0, dur, 0.55);
  const reel = iv(frame, [0, 14], [1, 0], easeOut);
  const sh = shakeAt(frame, [0], 30);
  const c0 = lerpCam(frame / Math.max(1, dur), aim(vertical, 790, 1240, vertical ? 1.9 : 1.7), aim(vertical, 790, 1220, vertical ? 2.1 : 1.85));
  const cam = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
  const o = iv(frame, [nameAt, nameAt + 12], [0, 1]);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dusk} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={760} y={1100} r={700} id="glowR" o={0.7} /></Layer>
      <Layer d={0.2} cam={cam}><path d={ridge("wd", 1240, 200, 150)} fill="#4a2232" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs /><Ground />
        <g transform={`translate(760 1460) rotate(${-10 * reel})`}>
          <Fig x={0} y={0} s={1.05} sx={1.22} sy={0.84} outfit={OUT.abraha} pose={{ ...STAND, armRU: -150, armRL: -120, lean: -10 + reel * 8, head: 14 }} />
          <path d="M 20 -305 L -16 -240" stroke="#4a0a0c" strokeWidth={7} strokeLinecap="round" />
        </g>
      </Layer>
      <Grade color="#ff2a10" opacity={0.18 * (1 - reel) + 0.1} />
      <Vignette s={0.8} />
      <div style={{ position: "absolute", top: vertical ? "20%" : "14%", width: "100%", textAlign: "center", opacity: o }}>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: vertical ? 92 : 88, color: "#fff0d8", letterSpacing: 4, textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}>ABRAHA AL-ASHRAM</div>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: vertical ? 54 : 44, color: "#ffcf8a" }}>the split-faced</div>
      </div>
    </AbsoluteFill>
  );
};

// 3b — ʿAtwada charges from behind and kills Aryāṭ; Aryāṭ's army crosses over. b = [leapAt, joinAt]
export const Charge: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const leapAt = at(b, 0, dur, 0.05);
  const joinAt = at(b, 1, dur, 0.5);
  const leap = iv(frame, [leapAt, leapAt + 14], [0, 1], ease);
  const fall = iv(frame, [leapAt + 10, leapAt + 34], [0, 1], ease);
  const join = iv(frame, [joinAt, joinAt + 50], [0, 1], ease);
  const sh = shakeAt(frame, [leapAt + 12], 20);
  const c0 = frame < joinAt
    ? lerpCam((frame - leapAt) / Math.max(1, joinAt - leapAt), aim(vertical, 900, 1280, vertical ? 1.3 : 1.35), aim(vertical, 1020, 1290, vertical ? 1.4 : 1.45))
    : lerpCam(join, aim(vertical, 1020, 1290, vertical ? 1.4 : 1.45), aim(vertical, vertical ? 1400 : 960, 1300, vertical ? 1.1 : 1.0));
  const cam = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dusk} />
      <Layer d={0.02} cam={cam}><Defs /><Glow x={960} y={1150} r={700} /><circle cx={960} cy={1180} r={120} fill="#ffe2a8" /></Layer>
      <Layer d={0.15} cam={cam}><path d={ridge("du2", 1230, 200, 150)} fill="#6a3a4a" /></Layer>
      <Layer d={0.4} cam={cam}>
        <rect x={-1400} y={1330} width={4800} height={1200} fill="#8a5a46" />
        {new Array(30).fill(0).map((_, i) => {
          const blue = i >= 15;
          const turned = blue && join > (i - 15) / 16;
          return <Fig key={i} x={i < 15 ? -300 + i * 50 : 1700 + (i - 15) * 50 - (turned ? join * 260 : 0)} y={1340} s={0.36} outfit={blue && !turned ? BLUE(i) : SOLDIER(i)} prop="spear" flip={blue} pose={turned ? walkPose(frame * 0.2 + i) : STAND} />;
        })}
      </Layer>
      <Layer d={1} cam={cam}>
        <Defs /><Ground />
        <Fig x={760} y={1460} s={1.05} sx={1.22} sy={0.84} outfit={OUT.abraha} pose={{ ...STAND, armRU: -150, armRL: -120, lean: -6, head: 10 }} />
        <g transform={`translate(${640 + leap * 450} ${1460 - Math.sin(leap * Math.PI) * 140})`}>
          <Fig x={0} y={0} s={1.0} outfit={OUT.servant} prop="spear" pose={blend({ ...STAND, lean: 10 }, { ...STAND, lean: -22, armRU: -110, armRL: -10, legLU: 40, legRU: -40 }, leap)} sway={frame * 0.4} />
        </g>
        <g transform={`translate(1180 1460) rotate(${fall * 86})`} opacity={1 - iv(frame, [leapAt + 70, leapAt + 100], [0, 0.5])}>
          <Fig x={0} y={0} s={1.05} sy={1.16} outfit={OUT.aryat} prop={fall < 0.3 ? "spear" : "none"} flip pose={{ ...STAND, armRU: -60, armRL: -10, lean: 8 }} />
        </g>
      </Layer>
      <Layer d={1.4} cam={cam}><Dust n={40} color="#f6dcae" y0={1100} y1={1700} drift={1.6} opacity={0.35} /></Layer>
      <Grade color="#ff8040" opacity={0.18} />
      <Vignette s={0.65} />
    </AbsoluteFill>
  );
};

// 3c — the Negus in Aksum: he rises in fury and swears an oath. pleased=true → later, satisfied, foot on the bag of soil.
export const Negus2: React.FC<{ b?: number[]; pleased?: boolean }> = ({ b, pleased }) => {
  const { frame, dur, p } = useShot();
  const { vertical } = useView();
  const riseAt = at(b, 0, dur, 0.1);
  const rise = pleased ? 0 : iv(frame, [riseAt, riseAt + 16], [0, 1], ease);
  const sh = shakeAt(frame, pleased ? [] : [riseAt + 10], 14);
  const c0 = lerpCam(p, { x: 0, y: vertical ? 0 : 160, zoom: pleased ? 1.2 : 1.0 }, { x: 0, y: vertical ? -60 : 120, zoom: pleased ? 1.45 : 1.35 });
  const cam = { ...c0, x: c0.x + sh.x, y: c0.y + sh.y };
  const step = pleased ? iv(p, [0.3, 0.5], [0, 1], ease) : 0;
  const pose: Pose = pleased ? { ...SIT, legRU: -88 + step * 30, legRL: 86 - step * 40, head: 4 } : blend(SIT, { ...STAND, armRU: -115, armRL: -20, lean: 6, head: 6 }, rise);
  return (
    <AbsoluteFill>
      <Sky stops={[[0, "#08100a"], [100, "#18241a"]]} />
      <Layer d={0.3} cam={cam}>
        <rect x={-800} y={300} width={3600} height={1400} fill="#1c2a1c" />
        {new Array(8).fill(0).map((_, i) => <path key={i} d={`M ${-300 + i * 340} 1360 L ${-300 + i * 340} 760 Q ${-130 + i * 340} 560 ${40 + i * 340} 760 L ${40 + i * 340} 1360 Z`} fill="#101a10" />)}
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 520} 520 L ${240 + i * 520} 520 L ${240 + i * 520} 960 L ${180 + i * 520} 910 L ${120 + i * 520} 960 Z`} fill="#2f6b3a" />)}
      </Layer>
      <Layer d={0.6} cam={cam}>{[0, 1, 2, 3].map((i) => <Torch2 key={i} x={-60 + i * 680} y={960} seed={i * 2 + 1} />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill="#3a3622" />
        <g transform="translate(960 1440)">
          <path d="M -100 -40 L -100 -360 Q 0 -430 100 -360 L 100 -40 Z" fill="#d4b04a" stroke="#1b100c" strokeWidth={5} />
          <path d="M -78 -50 L -78 -340 Q 0 -392 78 -340 L 78 -50 Z" fill="#2f6b3a" />
          <rect x={-200} y={-46} width={400} height={50} fill="#4a4026" stroke="#1b100c" strokeWidth={4} />
        </g>
        <Fig x={960} y={rise > 0.5 ? 1440 : 1394} s={0.95} outfit={OUT.negus} pose={pose} />
        {pleased ? <g transform="translate(1010 1436)"><path d="M -44 0 Q -52 -56 -12 -64 Q 0 -76 16 -64 Q 52 -56 44 0 Z" fill="#7a4a26" stroke="#1b100c" strokeWidth={4} /></g> : null}
        {[-1, 1].map((sd) => [0, 1].map((k) => <Fig key={`${sd}${k}`} x={960 + sd * (310 + k * 170)} y={1450} s={0.85} outfit={{ ...SOLDIER(k), robe: "#2f6b3a", robeShade: "#1f4a28" }} prop="spear" flip={sd > 0} pose={{ ...STAND, head: rise * sd * 5 }} />))}
      </Layer>
      <Grade color={pleased ? "#ffd070" : "#ff3010"} opacity={pleased ? 0.14 : 0.08 + rise * 0.14} />
      <Vignette s={0.65} />
    </AbsoluteFill>
  );
};

// 3d — Abraha shaves his head, fills a leather bag with the soil of Yemen; a rider takes it and the letter away. b = [bagAt, rideAt]
export const SoilAndLetter: React.FC<{ b?: number[] }> = ({ b }) => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const bagAt = at(b, 0, dur, 0.25);
  const rideAt = at(b, 1, dur, 0.55);
  const bald = frame >= Math.max(8, bagAt - 40);
  if (frame >= rideAt) {
    const t = (frame - rideAt) / Math.max(1, dur - rideAt);
    const x = 300 + t * 1400;
    const cam: Cam = { x: x - 960 + (vertical ? 0 : 200), y: 0, zoom: vertical ? 1.2 : 1.05 };
    return (
      <AbsoluteFill>
        <Sky stops={SKIES.day} />
        <Layer d={0.02} cam={{ ...cam, x: 0 }}><Defs /><Glow x={1400} y={700} r={500} /></Layer>
        <Layer d={0.15} cam={cam}><path d={ridge("sl1", 1250, 160, 220, -1400, 6000)} fill="#e0b47a" /></Layer>
        <Layer d={0.45} cam={cam}><path d={ridge("sl2", 1340, 70, 260, -1400, 6000)} fill="#d4a062" /></Layer>
        <Layer d={1} cam={cam}>
          <Defs />
          <path d={ridge("sl3", 1460, 26, 400, -1400, 6000)} fill="#c98f52" />
          <g transform={`translate(${x} 1470) scale(0.8)`}><Horse2 phase={frame * 0.4} rider={<g transform="translate(0 70) scale(0.9)"><Fig x={0} y={0} outfit={SOLDIER(1, false)} pose={{ ...SIT, lean: 12 }} sway={frame * 0.4} /><path d="M -40 -150 Q -60 -110 -30 -96 L 0 -110 Z" fill="#7a4a26" stroke="#1b100c" strokeWidth={4} /></g>} /></g>
        </Layer>
        <Layer d={1.3} cam={cam}><Dust n={40} y0={1200} y1={1600} drift={-2.5} opacity={0.35} size={5} /></Layer>
        <Vignette s={0.45} />
      </AbsoluteFill>
    );
  }
  const cam = lerpCam(frame / Math.max(1, rideAt), aim(vertical, 990, 1250, vertical ? 1.7 : 1.6), aim(vertical, 1010, 1310, vertical ? 1.85 : 1.75));
  const pour = (frame % 36) / 36;
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.day} />
      <Layer d={0.15} cam={cam}><path d={ridge("sb0", 1280, 80, 200)} fill="#e0b47a" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <Ground color="#c98f52" />
        <Fig x={930} y={1460} s={1.0} sx={1.22} sy={0.84} outfit={bald ? OUT.abrahaBald : OUT.abraha} bald={bald} pose={frame < bagAt ? { ...STAND, armRU: -160, armRL: -150, head: 10 } : { ...STAND, lean: 18, head: 20, armRU: -70, armRL: -40, legLU: -30, legLL: 60, legRU: -40, legRL: 70, bob: 22 }} />
        {frame >= bagAt ? (
          <g transform="translate(1090 1460)">
            <path d="M -60 0 Q -70 -90 -22 -106 L 22 -106 Q 70 -90 60 0 Z" fill="#7a4a26" stroke="#1b100c" strokeWidth={5} />
            <ellipse cx={0} cy={-106} rx={24} ry={8} fill="#3a2416" />
            {new Array(12).fill(0).map((_, i) => <circle key={i} cx={-12 + ((i * 7) % 24)} cy={-170 + ((pour * 64 + i * 9) % 64)} r={4} fill="#a8743e" />)}
          </g>
        ) : null}
      </Layer>
      <Grade color="#ff9a40" opacity={0.12} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

// 3e — the letter: parchment by lamplight; lines of ink appear as it is read (the words are in the captions).
export const LetterRead: React.FC<{ lines?: number }> = ({ lines = 6 }) => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, { x: 0, y: 0, zoom: 1.0 }, { x: 0, y: -20, zoom: 1.12 });
  const flick = 1 + 0.05 * Math.sin(frame * 0.6) + 0.03 * Math.sin(frame * 1.7);
  const x0 = vertical ? 520 : 580;
  const w = vertical ? 880 : 760;
  return (
    <AbsoluteFill style={{ backgroundColor: "#140c08" }}>
      <Layer d={0.6} cam={cam}><Defs /><Glow x={1450} y={760} r={900 * flick} id="glowO" o={0.4} /></Layer>
      <Layer d={1} cam={cam}>
        <rect x={-800} y={1300} width={3600} height={900} fill="#3a2414" />
        <path d={`M ${x0 - 60} 520 L ${x0 + w + 60} 505 L ${x0 + w + 80} 1480 L ${x0 - 80} 1495 Z`} fill="#ead9b0" stroke="#1b100c" strokeWidth={5} />
        {new Array(lines).fill(0).map((_, i) => {
          const t = Math.max(0, Math.min(1, p * lines * 1.05 - i));
          return <path key={i} d={`M ${x0} ${640 + i * 120} ${new Array(18).fill(0).map((__, k) => `Q ${x0 + 20 + k * (w / 18)} ${630 + i * 120 + (k % 2 ? -12 : 12)} ${x0 + 40 + k * (w / 18)} ${640 + i * 120}`).join(" ")}`} stroke="#3a2414" strokeWidth={5} fill="none" strokeDasharray={`${t * 1100} 1100`} />;
        })}
        <circle cx={x0 + w - 40} cy={1380} r={44} fill="#8f1a1a" stroke="#1b100c" strokeWidth={4} />
      </Layer>
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};

// 3f — "Abraha had survived. Now… he wanted something much bigger." Abraha alone on the throne of Yemen.
export const Ambition: React.FC = () => {
  const { frame, p } = useShot();
  const { vertical } = useView();
  const cam = lerpCam(p, { x: 0, y: vertical ? 40 : 160, zoom: 1.0 }, { x: 0, y: vertical ? -80 : 60, zoom: 1.55 }, ease);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.palace} />
      <Layer d={0.3} cam={cam}>
        <rect x={-800} y={300} width={3600} height={1400} fill="#2a1410" />
        {new Array(8).fill(0).map((_, i) => <path key={i} d={`M ${-300 + i * 340} 1360 L ${-300 + i * 340} 760 Q ${-130 + i * 340} 560 ${40 + i * 340} 760 L ${40 + i * 340} 1360 Z`} fill="#180a08" />)}
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 520} 520 L ${240 + i * 520} 520 L ${240 + i * 520} 960 L ${180 + i * 520} 910 L ${120 + i * 520} 960 Z`} fill="#8f2a1c" />)}
      </Layer>
      <Layer d={0.6} cam={cam}>{[1, 2].map((i) => <Torch2 key={i} x={-60 + i * 680} y={960} seed={i * 3} />)}</Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-800} y={1440} width={3600} height={800} fill="#3a2018" />
        <g transform="translate(960 1440)">
          <path d="M -100 -40 L -100 -360 Q 0 -430 100 -360 L 100 -40 Z" fill="#c9952e" stroke="#1b100c" strokeWidth={5} />
          <path d="M -78 -50 L -78 -340 Q 0 -392 78 -340 L 78 -50 Z" fill="#7a1420" />
        </g>
        <Fig x={960} y={1394} s={0.95} sx={1.2} sy={0.86} outfit={OUT.abrahaKing} pose={{ ...SIT, armRU: -40, armRL: -60, head: Math.sin(frame * 0.02) * 2 }} />
      </Layer>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 35% 45% at 50% 60%, rgba(0,0,0,0) 30%, rgba(5,0,0,0.85) 100%)", opacity: iv(p, [0.3, 0.9], [0, 1]) }} />
      <Grade color="#ff3a10" opacity={0.14} />
    </AbsoluteFill>
  );
};

export const P3_SCENES = { Wound, Charge, Negus2, SoilAndLetter, LetterRead, Ambition };
