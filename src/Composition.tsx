import { Ep2, Ep2Part, Ep2Hooks, Ep2Outro, EP2_READY, EP2_PARTS, EP2_HOOKS_LENGTH, EP2_OUTRO_LEN } from "./ep2/Episode";
import React from "react";
import { Composition, AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Ep2Trailer15, TRAILER15_LENGTH } from "./ep2/Trailer15";
import { amiri, serif } from "./fonts";
import { SilhouetteScene } from "./styles/Silhouette";
import { ParchmentScene } from "./styles/Parchment";
import { Desert3DScene } from "./styles/Desert3D";
import { Sample, SAMPLE_LENGTH } from "./Sample";
import { Cartoon25D, CARTOON_LENGTH } from "./cartoon/Scenes";
import { TrenchTrailer, TrenchTrailerVertical, TRAILER_LENGTH } from "./cartoon/Trailer";
import { DramaTrailer, DramaTrailerVertical, DRAMA_LENGTH } from "./cartoon/DramaTrailer";
import { Teaser, TeaserVertical, TEASER_LENGTH } from "./cartoon/Teaser";
import { Ep1Previews } from "./ep1/preview";
import { RigTest } from "./ep1v2/test";
import { Ep1Thumb, Ep1ThumbV } from "./ep1v2/Thumb";
import { Ep1v2, EP1V2_LENGTH } from "./ep1v2/Episode2";
import { Ep1Short, EP1_SHORTS, shortLength } from "./ep1v2/Shorts";
import { Episode1, Episode1Vertical, Ep1Part, EP1_LENGTH } from "./ep1/Episode";
import PARTS from "../tools/ep1_parts.json";

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
    <Composition id="Teaser" component={Teaser} durationInFrames={TEASER_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="TeaserVertical" component={TeaserVertical} durationInFrames={TEASER_LENGTH} fps={30} width={1080} height={1920} />
    <Composition id="DramaTrailer" component={DramaTrailer} durationInFrames={DRAMA_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="DramaTrailerVertical" component={DramaTrailerVertical} durationInFrames={DRAMA_LENGTH} fps={30} width={1080} height={1920} />
    <Composition id="TrenchTrailerVertical" component={TrenchTrailerVertical} durationInFrames={TRAILER_LENGTH} fps={30} width={1080} height={1920} />
    <Composition id="TrenchTrailer" component={TrenchTrailer} durationInFrames={TRAILER_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="Cartoon25D" component={Cartoon25D} durationInFrames={CARTOON_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="Sample" component={Sample} durationInFrames={SAMPLE_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="Mix3D" component={Mix3D} durationInFrames={SCENE * 2} fps={30} width={1920} height={1080} />
    <Composition id="Desert3D" component={Desert3DScene} durationInFrames={SCENE} fps={30} width={1920} height={1080} />
    <Composition id="Parchment" component={ParchmentScene} durationInFrames={SCENE} fps={30} width={1920} height={1080} />
    <Composition id="Episode1" component={Episode1} durationInFrames={EP1_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="Episode1Vertical" component={Episode1Vertical} durationInFrames={EP1_LENGTH} fps={30} width={1080} height={1920} />
    {(PARTS as { part: number; start: number; end: number }[]).map((p) => (
      <Composition key={p.part} id={`Episode1-Part${p.part}`} component={Ep1Part} defaultProps={{ from: p.start }} durationInFrames={p.end - p.start} fps={30} width={1920} height={1080} />
    ))}
    <Composition id="Ep1v2" component={Ep1v2} durationInFrames={EP1V2_LENGTH} fps={30} width={1920} height={1080} />
    <Composition id="Ep1v2Vertical" component={Ep1v2} durationInFrames={EP1V2_LENGTH} fps={30} width={1080} height={1920} />
    {EP1_SHORTS.map((s) => (
      <Composition key={s.id} id={s.id} component={Ep1Short} defaultProps={{ from: s.from, to: s.to, headline: s.headline, tease: s.tease }} durationInFrames={shortLength(s)} fps={30} width={1080} height={1920} />
    ))}
    <Composition id="Ep1Thumb" component={Ep1Thumb} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Ep1ThumbV" component={Ep1ThumbV} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="RigTest" component={RigTest} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="Ep2Trailer15" component={Ep2Trailer15} durationInFrames={TRAILER15_LENGTH} fps={30} width={1080} height={1920} />
    <Composition id="Ep2" component={Ep2} durationInFrames={EP2_READY} fps={30} width={1920} height={1080} />
    <Composition id="Ep2Vertical" component={Ep2} durationInFrames={EP2_READY} fps={30} width={1080} height={1920} />
    <Composition id="Ep2Outro" component={Ep2Outro} durationInFrames={EP2_OUTRO_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Ep2OutroVertical" component={Ep2Outro} durationInFrames={EP2_OUTRO_LEN} fps={30} width={1080} height={1920} />
    <Composition id="Ep2Hooks" component={Ep2Hooks} durationInFrames={EP2_HOOKS_LENGTH} fps={30} width={1080} height={1920} />
    {EP2_PARTS.map((p) => (
      <Composition key={p.n} id={`Ep2-Part${p.n}`} component={Ep2Part} defaultProps={{ n: p.n }} durationInFrames={p.hook + p.end - p.start} fps={30} width={1080} height={1920} />
    ))}
    <Composition id="RigTestV" component={RigTest} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Ep1Previews />
  </>
);
