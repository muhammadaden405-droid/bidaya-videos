import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { KingShot, BoyShot, FireShot, Reframe, FadeToBlack, sfx, ramp } from "./Trailer";
import { MountainShot, SeaShot, BowShot } from "./DramaScenes";
import { amiri, serif } from "../fonts";

// Short teaser (~28 s): two lines of dialogue, a wordless flash montage that cuts away before
// anything is resolved, a beat of silence, the fire, then the title, date and Muhamed's recitation.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// frames @ 30 fps
const K = { king: [26, 92], m1: [132, 24], m2: [162, 24], m3: [192, 30], boy: [262, 104], fire: [392, 66], title: 466, end: 856 } as const;
const TITLE = { date: 14, slam: 104, verse: 210 }; // relative to the title shot
export const TEASER_LENGTH = K.end;

// Brief white flash at the start of a cut.
const Flash: React.FC<{ len?: number; strength?: number }> = ({ len = 5, strength = 0.7 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: "#fff3dd", opacity: interpolate(frame, [0, len], [strength, 0], clamp) }} />;
};

const Line: React.FC<{ text: string; vertical?: boolean }> = ({ text, vertical }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [6, 14, durationInFrames - 10, durationInFrames - 2], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", ...(vertical ? { top: 230 } : { bottom: 120 }), width: "100%", display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: vertical ? 64 : 44, fontStyle: "italic", color: "#fff7e6", textAlign: "center", maxWidth: vertical ? 940 : 1500, textShadow: "0 3px 16px rgba(0,0,0,0.9)" }}>{text}</div>
    </div>
  );
};

const Bars: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "#000" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "#000" }} />
  </>
);

// Shows a scene starting partway through its own timeline (so a flash shows only the chosen instant).
const Clip: React.FC<{ at: number; len: number; skip?: number; children: React.ReactNode; vertical?: boolean; flash?: boolean; focusX?: number; vzoom?: number }> = ({ at, len, skip = 0, children, vertical, flash, focusX, vzoom = 1.08 }) => (
  <Sequence from={at} durationInFrames={len}>
    <Sequence from={-skip}>
      {vertical ? <Reframe zoom={vzoom} focusX={focusX}>{children}</Reframe> : children}
    </Sequence>
    {!vertical ? <Bars /> : null}
    {flash ? <Flash /> : null}
  </Sequence>
);

const Title: React.FC<{ vertical?: boolean }> = ({ vertical: v }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const a = (s: number) => interpolate(frame, [s, s + 12], [0, 1], clamp);
  const slam = interpolate(frame, [TITLE.slam, TITLE.slam + 7], [1.5, 1], clamp);
  const glow = interpolate(frame, [TITLE.slam, TITLE.slam + 4, TITLE.slam + 30], [0, 1, 0.35], clamp);
  const embers = new Array(70).fill(0).map((_, i) => {
    const age = (frame + i * 11) % 100;
    return { x: random(`tz${i}`) * width, y: height - age * (height / 90), o: 1 - age / 100 };
  });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 88%, #4a160c 0%, #120708 58%, #060304 100%)", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ position: "absolute" }}>
        {embers.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={v ? 3.5 : 2.5} fill="#ffb347" opacity={e.o * 0.8} />)}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,140,40,0.35) 0%, rgba(0,0,0,0) 60%)", opacity: glow }} />
      <div style={{ textAlign: "center", color: "#f6e6c8", width: v ? 960 : 1500 }}>
        <div style={{ fontFamily: serif, fontSize: v ? 50 : 42, letterSpacing: v ? 10 : 12, color: "#e3a64a", opacity: a(TITLE.date) }}>FRIDAY · NOVEMBER 13</div>
        <div style={{ transform: `scale(${slam})`, opacity: a(TITLE.slam) }}>
          <div style={{ fontFamily: amiri, fontSize: v ? 150 : 165, whiteSpace: "nowrap", color: "#ffcf7a", direction: "rtl", lineHeight: 1.35, textShadow: "0 0 50px rgba(255,140,40,0.55)" }}>أصحاب الأخدود</div>
          <div style={{ fontFamily: serif, fontSize: v ? 92 : 74, lineHeight: 1.1, letterSpacing: 4 }}>{v ? <>The People<br />of the Trench</> : "The People of the Trench"}</div>
        </div>
        <div style={{ fontFamily: amiri, fontSize: v ? 70 : 48, direction: "rtl", marginTop: v ? 90 : 34, opacity: a(TITLE.verse) }}>﴿قُتِلَ أَصْحَابُ الْأُخْدُودِ﴾</div>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: v ? 46 : 32, lineHeight: 1.3, fontStyle: "italic", opacity: a(TITLE.verse + 8), marginTop: v ? 14 : 4 }}>“Cursed were the people of the ditch (the story of the Boy and the King).”</div>
        <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: v ? 34 : 26, color: "#bfa98a", opacity: a(TITLE.verse + 8), marginTop: v ? 14 : 6 }}>al-Burūj 85:4 — Hilali &amp; Muhsin Khan (Tanzil.net)</div>
      </div>
    </AbsoluteFill>
  );
};

const Sound: React.FC = () => (
  <>
    {/* heartbeat from the first frame, quickening into the montage */}
    <Sequence from={0} durationInFrames={250}><Html5Audio src={sfx("horror-heartbeat-34")} volume={ramp([0, 10, 120, 230, 250], [0, 0.3, 0.3, 0.42, 0])} playbackRate={1} /></Sequence>
    <Sequence from={120} durationInFrames={110}><Html5Audio src={sfx("horror-heartbeat-34")} volume={ramp([0, 10, 100, 110], [0, 0.2, 0.3, 0])} playbackRate={1.6} /></Sequence>
    <Sequence from={20} durationInFrames={105}><Html5Audio src={sfx("gentle-fire-crackling-01")} volume={ramp([0, 10, 95, 105], [0, 0.12, 0.12, 0])} /></Sequence>
    <Sequence from={K.king[0] + 8}><Html5Audio src={staticFile("trailer/drama/q_king.m4a")} /></Sequence>

    {/* montage hits */}
    <Sequence from={K.m1[0] - 40}><Html5Audio src={sfx("transition-riser-01")} volume={0.2} /></Sequence>
    <Sequence from={K.m1[0]}><Html5Audio src={sfx("cinematic-boom-01")} volume={0.42} /></Sequence>
    <Sequence from={K.m2[0]}><Html5Audio src={sfx("cinematic-boom-01")} volume={0.42} /></Sequence>
    <Sequence from={K.m2[0]} durationInFrames={K.m2[1]}><Html5Audio src={sfx("blizzard-wind-01")} volume={0.25} /></Sequence>
    <Sequence from={K.m3[0]} durationInFrames={K.m3[1]}><Html5Audio src={sfx("horror-creak-17")} volume={0.35} /></Sequence>
    <Sequence from={K.m3[0] + K.m3[1]}><Html5Audio src={sfx("impact-slam-35")} volume={0.3} /></Sequence>

    {/* silence ... then the boy */}
    <Sequence from={K.boy[0]} durationInFrames={K.boy[1]}><Html5Audio src={sfx("cave-ambience-01")} volume={ramp([0, 15, 90, 104], [0, 0.07, 0.07, 0])} /></Sequence>
    <Sequence from={K.boy[0] + 14}><Html5Audio src={staticFile("trailer/drama/q_boy.m4a")} /></Sequence>

    {/* the fire */}
    <Sequence from={K.fire[0] - 8} durationInFrames={K.end - K.fire[0] + 8}>
      <Html5Audio src={sfx("backlog-adapt-fire-burning")} loop volume={ramp([0, 6, 70, 200, 260, 380, 400], [0, 0.32, 0.18, 0.12, 0.03, 0.03, 0])} />
      <Html5Audio src={sfx("distant-bonfire-fire-crackling-01")} loop volume={ramp([0, 6, 70, 200, 260, 380, 400], [0, 0.28, 0.16, 0.1, 0.02, 0.02, 0])} />
    </Sequence>
    <Sequence from={K.fire[0] - 8} durationInFrames={40}><Html5Audio src={sfx("fire-electric-whoosh-flame-36")} volume={ramp([0, 3, 25, 40], [0, 0.3, 0.12, 0])} /></Sequence>

    {/* title: date, slam, recitation */}
    <Sequence from={K.title + TITLE.date - 18}><Html5Audio src={staticFile("trailer/drama/seg9.m4a")} /></Sequence>
    <Sequence from={K.title + TITLE.slam - 4}><Html5Audio src={staticFile("trailer/drama/seg10.m4a")} /></Sequence>
    <Sequence from={K.title + TITLE.slam}><Html5Audio src={sfx("cinematic-boom-01")} volume={0.4} /></Sequence>
    <Sequence from={K.title + TITLE.verse}><Html5Audio src={staticFile("trailer/recitation-85-4.m4a")} /></Sequence>
  </>
);

const Build: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const V = vertical;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* the king — one line */}
      <Clip at={K.king[0]} len={K.king[1]} skip={40} vertical={V}><KingShot /></Clip>
      <Sequence from={K.king[0]} durationInFrames={K.king[1]}><Line text="“Do you have a lord… other than me?”" vertical={V} /></Sequence>

      {/* flash montage: each cut ends before anything is resolved */}
      <Clip at={K.m1[0]} len={K.m1[1]} skip={0} vertical={V} flash><MountainShot hitAt={2} /></Clip>
      <Clip at={K.m2[0]} len={K.m2[1]} skip={0} vertical={V} flash><SeaShot waveAt={12} /></Clip>
      <Clip at={K.m3[0]} len={K.m3[1]} skip={0} vertical={V} focusX={720} vzoom={1}><BowShot /></Clip>

      {/* the boy — one line */}
      <Clip at={K.boy[0]} len={K.boy[1]} skip={20} vertical={V}><BoyShot /></Clip>
      <Sequence from={K.boy[0]} durationInFrames={K.boy[1]}><Line text="“My Lord, and your Lord… is Allah.”" vertical={V} /></Sequence>

      {/* the fire, wordless */}
      <Clip at={K.fire[0]} len={K.fire[1]} skip={30} vertical={V} flash><FireShot /></Clip>

      <Sequence from={K.title} durationInFrames={K.end - K.title}><Title vertical={V} /></Sequence>
      <FadeToBlack from={K.end - 28} />
      <Sound />
    </AbsoluteFill>
  );
};

export const Teaser: React.FC = () => <Build />;
export const TeaserVertical: React.FC = () => <Build vertical />;
