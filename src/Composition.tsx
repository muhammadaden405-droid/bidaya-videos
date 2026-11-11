import React from "react";
import { Composition, AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { amiri, serif } from "./fonts";
import { SilhouetteScene } from "./styles/Silhouette";
import { ParchmentScene } from "./styles/Parchment";
import { Desert3DScene } from "./styles/Desert3D";
import { Sample, SAMPLE_LENGTH } from "./Sample";
import { Cartoon25D, CARTOON_LENGTH } from "./cartoon/Scenes";
import { TrenchTrailer, TrenchTrailerVertical, TRAILER_LENGTH } from "./cartoon/Trailer";
import { DramaTrailer, DramaTrailerVertical, DRAMA_LENGTH } from "./cartoon/DramaTrailer";

// Pipeline test card: confirms GitHub rendering, fonts and motion work.
export const TitleTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 } });
  const fade = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, 150], [1.08, 1]);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #3a2a18 0%, #120c06 75%)", justifyContent: "center", alignItems: "center", transform: `scale(${zoom})` }}>
      <div style={{ fontFamily: amiri, fontSize: 110, color: "#e9c98b", direction: "rtl", opacity: rise, transform: `translateY(${(1 - rise) * 40}px)` }}>
        البداية والنهاية
      </div>
      <div style={{ fontFamily: serif, fontSize: 52, color: "#f3e6cc", opacity: fade, marginTop: 10, letterSpacing: 2 }}>
        al-Bidāya wa al-Nihāya
      </div>
    </AbsoluteFill>
  );
};

const Label: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10, 60, 75], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 40, bottom: 36, opacity: o, fontFamily: serif, fontSize: 38, color: "#fff", background: "rgba(0,0,0,0.55)", padding: "8px 22px", borderRadius: 8 }}>
      {text}
    </div>
  );
};

const SCENE = 240; // 8 seconds at 30 fps

// Side-by-side style test: the same moment in two looks.
export const StyleCompare: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={SCENE}>
      <SilhouetteScene />
      <Label text="Style A — Cinematic silhouette" />
    </Sequence>
    <Sequence from={SCENE} durationInFrames={SCENE}>
      <ParchmentScene />
      <Label text="Style B — Storybook parchment map" />
    </Sequence>
  </AbsoluteFill>
);

// Mixed-style test: a 3D story scene followed by a parchment map moment.
export const Mix3D: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={SCENE}>
      <Desert3DScene />
      <Label text="3D story scene" />
    </Sequence>
    <Sequence from={SCENE} durationInFrames={SCENE}>
      <ParchmentScene />
      <Label text="Parchment map moment" />
    </Sequence>
  </AbsoluteFill>
);

export const MyComposition = () => (
  <>
    <Composition id="TitleTest" component={TitleTest} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="StyleCompare" component={StyleCompare} durationInFrames={SCENE * 2} fps={30} width={1920} height={1080} />
    <Composition id="Silhouette" component={SilhouetteScene} durationInFrames={SCENE} fps={30} width={1920} height={1080} />
    <Composition id="DramaTrailer" component={DramaTrailer} durationInFrames={DRAMA_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="DramaTrailerVertical" component={DramaTrailerVertical} durationInFrames={DRAMA_LENGTH} fps={30} width={1080} height={1920} />
    <Composition id="TrenchTrailerVertical" component={TrenchTrailerVertical} durationInFrames={TRAILER_LENGTH} fps={30} width={1080} height={1920} />
    <Composition id="TrenchTrailer" component={TrenchTrailer} durationInFrames={TRAILER_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="Cartoon25D" component={Cartoon25D} durationInFrames={CARTOON_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="Sample" component={Sample} durationInFrames={SAMPLE_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="Mix3D" component={Mix3D} durationInFrames={SCENE * 2} fps={30} width={1920} height={1080} />
    <Composition id="Desert3D" component={Desert3DScene} durationInFrames={SCENE} fps={30} width={1920} height={1080} />
    <Composition id="Parchment" component={ParchmentScene} durationInFrames={SCENE} fps={30} width={1920} height={1080} />
  </>
);
