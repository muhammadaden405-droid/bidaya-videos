import React from "react";
import { AbsoluteFill, Html5Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Headline, ChannelCard, CTA_LEN } from "../ep1v2/Shorts";

// Episode 3 Shorts, made the same way as Episode 1's: a 9:16 stretch of the finished vertical film that starts on a
// strong line, a headline pinned at the top, a stop on a cliffhanger (never the ending), then the channel card.
// Cut from the rendered film (public/ep3/render/Ep3Vertical.mp4, not committed) so no scene is re-drawn.
// Starts avoid the first 3 s of each TikTok part, where the film carries its own part hook text.
export type Ep3ShortDef = { id: string; from: number; to: number; headline: string; tease: string };
export const EP3_SHORTS: Ep3ShortDef[] = [
  { id: "Ep3Short-Wish", from: 1497, to: 2775, headline: "An angel asked him: what do you want most?", tease: "Years later, the angel came back…" },
  { id: "Ep3Short-Bald", from: 3033, to: 4026, headline: "People turned away from him… then a stranger came", tease: "Would he remember who gave him all of this?" },
  { id: "Ep3Short-Lie", from: 6059, to: 7706, headline: "The angel came back… in disguise", tease: "What happened to him next?" },
];
export const ep3ShortLength = (s: Ep3ShortDef) => s.to - s.from + CTA_LEN;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Ep3Short: React.FC<{ from: number; to: number; headline: string; tease: string }> = ({ from, to, headline, tease }) => {
  const len = to - from;
  const frame = useCurrentFrame();
  const dip = interpolate(frame, [len - 8, len], [0, 1], clamp);
  const vol = interpolate(frame, [len - 10, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={len}>
        <OffthreadVideo src={staticFile("ep3/render/Ep3Vertical.mp4")} startFrom={from} volume={() => vol} />
        <Headline text={headline} />
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: dip }} />
      </Sequence>
      <Sequence from={len}>
        <ChannelCard tease={tease} />
        <Html5Audio src={staticFile("trailer/sfx/short-video-whoosh-01.mp3")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
