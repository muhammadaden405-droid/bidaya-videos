import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { KingShot, BoyShot, FireShot, Fade, FadeToBlack, Reframe, sfx, ramp } from "./Trailer";
import { ColdOpen, MountainShot, SeaShot, CounselShot, BowShot, CrowdShot } from "./DramaScenes";
import { amiri, serif } from "../fonts";

// Dramatic trailer — The People of the Trench (Friday, November 13).
// Timeline generated from the narration timing (frames at 30 fps).

type Shot = { from: number; len: number; el: React.ReactNode; vEl: React.ReactNode; cap?: string; hardCutOut?: boolean };

const T = {
  cold: { from: 0, len: 115 },
  title: 1638,
  dateAt: 18,
  titleAt: 112,
  verseAt: 209,
  rec: 1853,
  end: 2077,
  mountHit: 106,
  seaWave: 96,
};
export const DRAMA_LENGTH = T.end;

const SHOTS: Shot[] = [
  { from: 105, len: 212, el: <KingShot />, vEl: <Reframe zoom={1.05}><KingShot /></Reframe>, cap: "A king who asked: “Do you have a lord… other than me?”" },
  { from: 307, len: 203, el: <BoyShot />, vEl: <Reframe zoom={1.05}><BoyShot /></Reframe>, cap: "A boy who answered: “My Lord, and your Lord… is Allah.”" },
  { from: 500, len: 181, el: <MountainShot hitAt={T.mountHit} />, vEl: <Reframe><MountainShot hitAt={T.mountHit} /></Reframe>, cap: "They took him to the top of a mountain… and the mountain shook." },
  { from: 671, len: 230, el: <SeaShot waveAt={T.seaWave} />, vEl: <Reframe><SeaShot waveAt={T.seaWave} /></Reframe>, cap: "They took him out to sea… and the sea swallowed them — not him." },
  { from: 891, len: 182, el: <CounselShot />, vEl: <Reframe focusX={920}><CounselShot /></Reframe>, cap: "Then the boy told the king the only way he could ever kill him." },
  { from: 1063, len: 139, el: <BowShot />, vEl: <Reframe zoom={1.1}><BowShot /></Reframe>, cap: "“In the name of Allah… the Lord of the boy.”", hardCutOut: true },
  { from: 1224, len: 170, el: <CrowdShot />, vEl: <Reframe><CrowdShot /></Reframe>, cap: "And the people cried out: “We believe in the Lord of the boy!”" },
  { from: 1384, len: 264, el: <FireShot />, vEl: <Reframe focusX={900}><FireShot /></Reframe>, cap: "A trench. A fire. And a people who chose faith over fire." },
];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Caption: React.FC<{ text: string; vertical?: boolean }> = ({ text, vertical }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [8, 18, durationInFrames - 16, durationInFrames - 6], [0, 1, 1, 0], clamp);
  const y = interpolate(frame, [8, 22], [14, 0], clamp);
  const box: React.CSSProperties = vertical
    ? { fontSize: 58, padding: "16px 32px", maxWidth: 940, borderRadius: 18 }
    : { fontSize: 38, padding: "8px 24px", maxWidth: 1400, borderRadius: 10 };
  return (
    <div style={{ position: "absolute", ...(vertical ? { top: 210 } : { bottom: 112 }), width: "100%", display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: `"${serif}", "${amiri}"`, lineHeight: 1.25, color: "#fff7e6", background: "rgba(10,6,4,0.5)", textAlign: "center", textShadow: "0 2px 10px rgba(0,0,0,0.7)", ...box }}>{text}</div>
    </div>
  );
};

// Cinematic letterbox bars (landscape only).
const Letterbox: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 92, background: "#000" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 92, background: "#000" }} />
  </>
);

const DramaTitle: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const a = (s: number) => interpolate(frame, [s, s + 14], [0, 1], clamp);
  const slam = interpolate(frame, [T.titleAt, T.titleAt + 8], [1.35, 1], clamp);
  const embers = new Array(70).fill(0).map((_, i) => {
    const age = (frame + i * 11) % 100;
    return { x: random(`dx${i}`) * width, y: height - age * (height / 90), o: 1 - age / 100 };
  });
  const v = vertical;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 88%, #4a160c 0%, #120708 58%, #060304 100%)", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ position: "absolute" }}>
        {embers.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={v ? 3.5 : 2.5} fill="#ffb347" opacity={e.o * 0.8} />)}
      </svg>
      <div style={{ textAlign: "center", color: "#f6e6c8", width: v ? 960 : 1500 }}>
        <div style={{ fontFamily: serif, fontSize: v ? 50 : 42, letterSpacing: v ? 10 : 12, color: "#e3a64a", opacity: a(T.dateAt) }}>FRIDAY · NOVEMBER 13</div>
        <div style={{ transform: `scale(${slam})`, opacity: a(T.titleAt) }}>
          <div style={{ fontFamily: amiri, fontSize: v ? 150 : 160, whiteSpace: "nowrap", color: "#ffcf7a", direction: "rtl", lineHeight: 1.35, textShadow: "0 0 50px rgba(255,140,40,0.55)" }}>أصحاب الأخدود</div>
          <div style={{ fontFamily: serif, fontSize: v ? 92 : 72, lineHeight: 1.1, letterSpacing: 4 }}>{v ? <>The People<br />of the Trench</> : "The People of the Trench"}</div>
        </div>
        <div style={{ fontFamily: amiri, fontSize: v ? 70 : 48, direction: "rtl", marginTop: v ? 90 : 34, opacity: a(T.verseAt) }}>﴿قُتِلَ أَصْحَابُ الْأُخْدُودِ﴾</div>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: v ? 46 : 32, lineHeight: 1.3, fontStyle: "italic", opacity: a(T.verseAt + 10), marginTop: v ? 14 : 4 }}>“Cursed were the people of the ditch (the story of the Boy and the King).”</div>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: v ? 34 : 26, color: "#bfa98a", opacity: a(T.verseAt + 10), marginTop: v ? 14 : 6 }}>al-Burūj 85:4 — Hilali &amp; Muhsin Khan (Tanzil.net)</div>
      </div>
      <div style={{ position: "absolute", bottom: v ? 150 : 40, width: "100%", textAlign: "center", fontFamily: serif, fontSize: v ? 32 : 26, color: "#bfa98a", opacity: a(T.verseAt + 30) }}>
        Source: Ibn Kathīr, al-Bidāya wa al-Nihāya (ed. al-Turkī), 3/23–29
      </div>
    </AbsoluteFill>
  );
};

const NARRATION = [111, 312, 495, 680, 876, 1063, 1229, 1388, 1637, 1748];

const Sound: React.FC = () => (
  <>
    {NARRATION.map((f, i) => (
      <Sequence key={i} from={f}><Html5Audio src={staticFile(`trailer/drama/seg${i + 1}.m4a`)} /></Sequence>
    ))}
    <Sequence from={T.rec}><Html5Audio src={staticFile("trailer/recitation-85-4.m4a")} /></Sequence>

    {/* cold open + palace: slow heartbeat, torches, stone hall */}
    <Sequence from={0} durationInFrames={330}><Html5Audio src={sfx("horror-heartbeat-34")} volume={ramp([0, 15, 300, 330], [0, 0.32, 0.14, 0])} /></Sequence>
    <Sequence from={100} durationInFrames={420}>
      <Html5Audio src={sfx("gentle-fire-crackling-01")} loop volume={ramp([0, 20, 390, 420], [0, 0.13, 0.13, 0])} />
      <Html5Audio src={sfx("cave-ambience-01")} loop volume={ramp([0, 20, 390, 420], [0, 0.07, 0.07, 0])} />
    </Sequence>

    {/* mountain: rising rumble, then the quake */}
    <Sequence from={500} durationInFrames={190}>
      <Html5Audio src={sfx("horror-wind-whisper-04")} volume={ramp([0, 20, 160, 190], [0, 0.12, 0.12, 0])} />
      <Sequence from={T.mountHit - 50}><Html5Audio src={sfx("transition-riser-01")} volume={0.18} /></Sequence>
      <Sequence from={T.mountHit}><Html5Audio src={sfx("cinematic-boom-01")} volume={0.42} /></Sequence>
      <Sequence from={T.mountHit + 8}><Html5Audio src={sfx("impact-slam-35")} volume={0.25} /></Sequence>
    </Sequence>

    {/* sea: storm wind and rain, lightning cracks, the great wave */}
    <Sequence from={671} durationInFrames={240}>
      <Html5Audio src={sfx("blizzard-wind-01")} loop volume={ramp([0, 20, T.seaWave + 25, T.seaWave + 45], [0, 0.18, 0.2, 0])} />
      <Html5Audio src={sfx("ambience-rain-03")} volume={ramp([0, 20, T.seaWave + 25, T.seaWave + 45], [0, 0.12, 0.12, 0])} />
      <Sequence from={T.seaWave - 30}><Html5Audio src={sfx("reveal-impact-01")} volume={0.3} /></Sequence>
      <Sequence from={T.seaWave}><Html5Audio src={sfx("cinematic-boom-01")} volume={0.42} /></Sequence>
      <Sequence from={T.seaWave + 30}><Html5Audio src={sfx("river-ambience-01")} volume={ramp([0, 15, 80, 120], [0, 0.1, 0.1, 0])} /></Sequence>
    </Sequence>

    {/* counsel: the hall again */}
    <Sequence from={891} durationInFrames={182}><Html5Audio src={sfx("gentle-fire-crackling-01")} loop volume={ramp([0, 20, 160, 182], [0, 0.12, 0.12, 0])} /></Sequence>

    {/* the bow: creaking string, tension, heartbeat — then silence at the cut */}
    <Sequence from={1063} durationInFrames={129}>
      <Html5Audio src={sfx("horror-creak-17")} volume={ramp([0, 10, 120, 129], [0, 0.22, 0.3, 0])} />
      <Html5Audio src={sfx("tension-drone-01")} volume={ramp([0, 30, 120, 129], [0, 0.1, 0.16, 0])} />
      <Html5Audio src={sfx("horror-heartbeat-34")} volume={ramp([0, 20, 129], [0, 0.22, 0.3])} />
    </Sequence>

    {/* crowd: a rising swell into their cry */}
    <Sequence from={1208}><Html5Audio src={sfx("transition-riser-01")} volume={0.2} /></Sequence>

    {/* trench fire continues quietly under the title and dips for the recitation */}
    <Sequence from={1380} durationInFrames={T.end - 1380}>
      <Html5Audio src={sfx("backlog-adapt-fire-burning")} loop volume={ramp([0, 20, 250, T.rec - 1380 - 20, T.rec - 1380, T.end - 1380 - 30, T.end - 1380], [0, 0.26, 0.16, 0.1, 0.03, 0.03, 0])} />
      <Html5Audio src={sfx("distant-bonfire-fire-crackling-01")} loop volume={ramp([0, 20, 250, T.rec - 1380 - 20, T.rec - 1380, T.end - 1380 - 30, T.end - 1380], [0, 0.24, 0.14, 0.08, 0.02, 0.02, 0])} />
      <Html5Audio src={sfx("night-ambience-01")} volume={ramp([0, 20, 230, 264], [0, 0.08, 0.08, 0])} />
    </Sequence>

    {/* whooshes on each whip-pan */}
    {[307, 500, 671, 891, 1384].map((f) => (
      <Sequence key={f} from={f - 5} durationInFrames={30}><Html5Audio src={sfx("short-video-whoosh-01")} volume={0.4} /></Sequence>
    ))}
    <Sequence from={T.title - 6} durationInFrames={45}><Html5Audio src={sfx("fire-electric-whoosh-flame-36")} volume={ramp([0, 3, 25, 45], [0, 0.28, 0.12, 0])} /></Sequence>
    <Sequence from={T.title + T.titleAt}><Html5Audio src={sfx("cinematic-boom-01")} volume={0.36} /></Sequence>
  </>
);

const Build: React.FC<{ vertical?: boolean }> = ({ vertical }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence from={T.cold.from} durationInFrames={T.cold.len}>
      <ColdOpen />
    </Sequence>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.hardCutOut ? s.len - 10 : s.len}>
        <Fade last={s.hardCutOut}>
          {vertical ? s.vEl : s.el}
          {!vertical ? <Letterbox /> : null}
          {s.cap ? <Caption text={s.cap} vertical={vertical} /> : null}
        </Fade>
      </Sequence>
    ))}
    <Sequence from={T.title} durationInFrames={T.end - T.title}>
      <Fade last>
        <DramaTitle vertical={vertical} />
      </Fade>
    </Sequence>
    <FadeToBlack from={T.end - 32} />
    <Sound />
  </AbsoluteFill>
);

export const DramaTrailer: React.FC = () => <Build />;
export const DramaTrailerVertical: React.FC = () => <Build vertical />;
