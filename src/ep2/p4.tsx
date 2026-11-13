import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { SIT } from "../cartoon/Rig";
import { amiri, serif, display } from "../fonts";
import { SHADOW } from "./cast";
import { Actor, sitY, Layer, Defs, Sky, SKIES, Stars, iv, ease, useShot, useView, aim, ridge, Grade, Vignette, Glow } from "./kit";
import { FLOOR } from "./p1";
import { TrenchBg, Mass } from "./p3";

// Episode 2 — the closing recitation (the owner's own voice), Sūrat al-Burūj 85:4–9, then the end card.
// Arabic from Shamela; translation: Muhsin Khan. Verse starts are where each verse begins in the recording.
export const REC_START = 12; // frames of quiet before the recitation
export const REC_LEN = 1290; // 43 s
export const END_LEN = 180;
const VERSES: { n: number; t: number; ar: string; en: string }[] = [
  { n: 4, t: 0.0, ar: "قُتِلَ أَصۡحَٰبُ ٱلۡأُخۡدُودِ", en: "Cursed were the people of the ditch (in the story of the Boy and the King)." },
  { n: 5, t: 5.1, ar: "ٱلنَّارِ ذَاتِ ٱلۡوَقُودِ", en: "Fire supplied (abundantly) with fuel," },
  { n: 6, t: 10.4, ar: "إِذۡ هُمۡ عَلَیۡهَا قُعُودࣱ", en: "When they sat by it (fire)," },
  { n: 7, t: 14.9, ar: "وَهُمۡ عَلَىٰ مَا یَفۡعَلُونَ بِٱلۡمُؤۡمِنِینَ شُهُودࣱ", en: "And they witnessed what they were doing against the believers (i.e. burning them)." },
  { n: 8, t: 21.9, ar: "وَمَا نَقَمُوا۟ مِنۡهُمۡ إِلَّاۤ أَن یُؤۡمِنُوا۟ بِٱللَّهِ ٱلۡعَزِیزِ ٱلۡحَمِیدِ", en: "They had nothing against them, except that they believed in Allah, the All-Mighty, Worthy of all Praise!" },
  { n: 9, t: 31.6, ar: "ٱلَّذِی لَهُۥ مُلۡكُ ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضِۚ وَٱللَّهُ عَلَىٰ كُلِّ شَیۡءࣲ شَهِیدٌ", en: "Who, to Whom belongs the dominion of the heavens and the earth! And Allah is Witness over everything." },
];
export const Recitation: React.FC = () => {
  const { frame, dur } = useShot();
  const { vertical } = useView();
  const f = frame - REC_START;
  let k = 0;
  for (let i = 0; i < VERSES.length; i++) if (f >= VERSES[i].t * 30) k = i;
  const v = VERSES[k];
  const next = k + 1 < VERSES.length ? VERSES[k + 1].t * 30 : REC_LEN;
  const local = f - v.t * 30;
  const o = iv(f, [v.t * 30, v.t * 30 + 10, next - 8, next], [0, 1, 1, k === VERSES.length - 1 ? 1 : 0]) * iv(frame, [0, REC_START + 4], [0, 1]);
  const drift = local / Math.max(1, next - v.t * 30);
  const cam = aim(vertical, [1250, 1350, 900, 820, 960, 960][k] + drift * 40, [1060, 1080, 940, 930, 980, 900 - drift * 260][k], [1.0, 1.35, 1.0, 1.2, 1.0, 1.0][k] + drift * 0.1);
  const fade = iv(frame, [dur - 24, dur - 2], [0, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {k <= 3 ? (
        <>
          <TrenchBg cam={cam} />
          {k >= 2 ? (
            <Layer d={1} cam={cam}>
              {[0, 1, 2, 3].map((i) => <Actor key={i} seat="chair" x={470 + i * 130} y={sitY(FLOOR - 96, 1.7)} s={1.7} outfit={SHADOW} pose={SIT} />)}
              <rect x={400} y={FLOOR - 96} width={520} height={96} fill="#120a06" />
            </Layer>
          ) : null}
          <Grade color="#ff5a1a" opacity={0.12} />
        </>
      ) : k === 4 ? (
        <>
          <TrenchBg cam={cam} />
          <Layer d={1} cam={cam}><Mass sil top={FLOOR - 200} base={FLOOR + 70} rows={7} per={30} x0={-300} x1={1500} /></Layer>
        </>
      ) : (
        <>
          <Sky stops={SKIES.night} />
          <Layer d={0.05} cam={cam}><Stars n={220} seed="rc" /></Layer>
          <Layer d={0.3} cam={cam}><Defs /><Glow x={960} y={500} r={700} o={0.18} /><path d={ridge("rc", 1260, 100, 260)} fill="#0c1024" /></Layer>
          <Layer d={1} cam={cam}><path d={`M -1400 ${FLOOR - 10} L 3400 ${FLOOR - 10} L 3400 2800 L -1400 2800 Z`} fill="#0a0c1a" /></Layer>
        </>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.6))" }} />
      <Vignette s={0.7} />
      <div style={{ position: "absolute", left: 0, right: 0, top: vertical ? "24%" : "20%", display: "flex", flexDirection: "column", alignItems: "center", opacity: o, padding: vertical ? "0 60px" : "0 180px" }}>
        <div dir="rtl" style={{ fontFamily: amiri, fontSize: vertical ? 78 : 84, lineHeight: 1.75, color: "#fff6df", textAlign: "center", textShadow: "0 3px 16px #000, 0 0 4px #000" }}>{v.ar}</div>
        <div style={{ fontFamily: serif, fontSize: vertical ? 44 : 42, lineHeight: 1.3, color: "#ffe9c2", textAlign: "center", marginTop: 26, maxWidth: vertical ? 940 : 1400, textShadow: "0 2px 12px #000, 0 0 3px #000" }}>{v.en}</div>
        <div style={{ fontFamily: serif, fontSize: vertical ? 32 : 30, letterSpacing: 4, color: "#e9b458", marginTop: 26, textShadow: "0 2px 8px #000" }}>Sūrat al-Burūj 85:{v.n}</div>
      </div>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }} />
    </AbsoluteFill>
  );
};

export const EndCard: React.FC = () => {
  const { frame } = useShot();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const o = iv(frame, [0, 14], [0, 1], ease);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #f3e6c8 0%, #e2cfa4 70%, #c9b384 100%)", opacity: o, alignItems: "center", justifyContent: "center", padding: v ? 70 : 140 }}>
      <Img src={staticFile("logo.png")} style={{ width: v ? 210 : 170, marginBottom: 26 }} />
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: v ? 58 : 60, letterSpacing: 4, color: "#3a2a1a", textAlign: "center" }}>THE PEOPLE OF THE TRENCH</div>
      <div style={{ fontFamily: serif, fontSize: v ? 40 : 38, lineHeight: 1.4, color: "#4a3824", textAlign: "center", marginTop: 26 }}>
        Source: al-Bidāya wa al-Nihāya, Ibn Kathīr<br />vol. 2, pp. 153–155 (ed. Shīrī)
      </div>
      <div style={{ fontFamily: serif, fontSize: v ? 34 : 32, lineHeight: 1.4, color: "#5a4630", textAlign: "center", marginTop: 14 }}>
        The hadith of Ṣuhayb, from the Prophet ﷺ:<br />Musnad Aḥmad and Ṣaḥīḥ Muslim
      </div>
      <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: v ? 44 : 42, color: "#3a2a1a", textAlign: "center", marginTop: 40 }}>Which moment stayed with you the most?</div>
      <div style={{ fontFamily: serif, fontSize: v ? 38 : 36, letterSpacing: 2, color: "#7a5a2a", marginTop: 22 }}>@bidayah.nihayah</div>
    </AbsoluteFill>
  );
};
