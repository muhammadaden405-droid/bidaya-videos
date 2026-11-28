import React from "react";
import { AbsoluteFill, Html5Audio, staticFile } from "remotion";
import { ChannelCard, CTA_LEN } from "../ep1v2/Shorts";

// Episode 4 Shorts, made the Episode 1/3 way: a stretch of the finished 9:16 film that starts on a strong line and
// stops on a cliffhanger (never the killer's name), then the channel card. The film's own pinned headline
// "WHO KILLED THE OLD MAN?" stays at the top as the Short's headline. The story stretch is cut from the rendered
// Ep4Vertical.mp4 with ffmpeg (tools/ep4_shorts.sh); only the closing card is rendered here (Ep4ShortCard-*).
// segs are [from, to) frame ranges of Ep4Vertical; two ranges skip a part break (black + freeze) in between.
export type Ep4ShortDef = { id: string; segs: [number, number][]; tease: string };
export const EP4_SHORTS: Ep4ShortDef[] = [
  // Part 1: the body on the doorstep, the accusation, the crowd splits and reaches for weapons (ends on the door slam)
  { id: "Ep4Short-Doorstep", segs: [[0, 1086]], tease: "No one saw who did it… so they went to Mūsā." },
  // Part 3: they ask for the killer's name; the answer is "slaughter a cow" (ends on "every question will cost them")
  { id: "Ep4Short-Cow", segs: [[2739, 4072]], tease: "How could a cow catch a killer?" },
  // end of Part 6 + start of Part 7: the strike, he comes back to life, "Who killed you?" — stop on the freeze
  { id: "Ep4Short-Alive", segs: [[9629, 9856], [9895, 10406]], tease: "Who killed him? Comment your guess." },
];
export { CTA_LEN };

export const Ep4ShortCard: React.FC<{ tease: string }> = ({ tease }) => (
  <AbsoluteFill>
    <ChannelCard tease={tease} />
    <Html5Audio src={staticFile("trailer/sfx/short-video-whoosh-01.mp3")} volume={0.5} />
  </AbsoluteFill>
);
