import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Photo3D } from "./styles/Photo3D";
import { ParchmentScene } from "./styles/Parchment";
import { serif } from "./fonts";

// Sample of the series look: painted 2.5D story scenes + a landscape "wow" shot + a parchment map moment,
// narrated by American narrator A (Gemini 3.8 Flash TTS).

const FADE = 15;

const Fade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [0, FADE, durationInFrames - FADE, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Caption: React.FC<{ text: string; top?: boolean }> = ({ text, top }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = interpolate(frame, [8, 20, durationInFrames - 20, durationInFrames - 8], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [8, 24], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", ...(top ? { top: 60 } : { bottom: 70 }), width: "100%", display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: serif, fontSize: 48, color: "#fff7e6", background: "rgba(10,6,4,0.45)", padding: "10px 28px", borderRadius: 10, maxWidth: 1500, textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
        {text}
      </div>
    </div>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 62%, rgba(0,0,0,0.5) 100%)" }} />
);

type Shot = { len: number; audio: string; caption: string; body: React.ReactNode; captionTop?: boolean };

const ASPECT = 1920 / 1073;

const SHOTS: Shot[] = [
  {
    len: 285,
    audio: "sample/vo1.m4a",
    caption: "Fourteen centuries ago, the land of Arabia was a world of sand, stone, and silence.",
    body: <Photo3D src="sample/desert.jpg" depth="sample/desert_depth.png" aspect={ASPECT} strength={0.22} move={{ from: [0.04, 0.05, 1.86], to: [-0.03, 0.0, 1.55] }} />,
  },
  {
    len: 380,
    audio: "sample/vo2.m4a",
    caption: "In the year the Prophet ﷺ was born, Abraha, the ruler of Yemen, set out with a great army and a mighty elephant at its front.",
    body: <Photo3D src="sample/army.jpg" depth="sample/army_depth.png" aspect={ASPECT} strength={0.2} move={{ from: [-0.06, -0.02, 1.84], to: [0.03, 0.02, 1.58], lookFrom: [-0.02, 0], lookTo: [-0.04, 0.01] }} />,
  },
  {
    len: 210,
    audio: "sample/vo3.m4a",
    caption: "He marched north, along the mountains of the Hijaz, toward one city.",
    body: <ParchmentScene showTitle={false} />,
    captionTop: true,
  },
  {
    len: 320,
    audio: "sample/vo4.m4a",
    caption: "Makkah. A quiet valley… and at its heart, the Kaʿbah. Abraha had come to destroy it.",
    body: <Photo3D src="sample/makkah.jpg" depth="sample/makkah_depth.png" aspect={ASPECT} strength={0.16} move={{ from: [0.0, 0.06, 1.86], to: [0.0, -0.01, 1.5], lookFrom: [0, 0.03], lookTo: [0, -0.02] }} />,
  },
];

export const SAMPLE_LENGTH = SHOTS.reduce((a, s) => a + s.len, 0) - FADE * (SHOTS.length - 1);

export const Sample: React.FC = () => {
  let start = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {SHOTS.map((s, i) => {
        const from = start;
        start += s.len - FADE;
        return (
          <Sequence key={i} from={from} durationInFrames={s.len}>
            <Fade>
              {s.body}
              <Vignette />
              <Caption text={s.caption} top={s.captionTop} />
            </Fade>
            <Sequence from={10}>
              <Html5Audio src={staticFile(s.audio)} />
            </Sequence>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
