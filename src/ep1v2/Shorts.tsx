import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { display, sans, serif } from "../fonts";
import { Ep1v2 } from "./Episode2";

// Episode 1 Shorts (9:16): a cut of the remastered episode that stops on a cliffhanger,
// then a closing card that sends the viewer to the channel for the rest of the story.
export type ShortDef = { id: string; from: number; to: number; headline: string; tease: string };

export const EP1_SHORTS: ShortDef[] = [
  { id: "Ep1Short-Elephant", from: 0, to: 880, headline: "The elephant that refused to move", tease: "What really happened outside Makkah?" },
  { id: "Ep1Short-Duel", from: 3613, to: 5125, headline: "He lost his face… and won a kingdom", tease: "Next, he set out to destroy the Kaʿbah." },
  { id: "Ep1Short-Camels", from: 13200, to: 14426, headline: "He asked for his camels — not the Kaʿbah", tease: "Then came the morning of the elephant…" },
];

export const CTA_LEN = 105; // 3.5 s
export const shortLength = (s: ShortDef) => s.to - s.from + CTA_LEN;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Headline pinned near the top for the whole clip: tells a scrolling viewer what they're watching.
const Headline: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", top: 300, left: 0, width: "100%", display: "flex", justifyContent: "center", transform: `scale(${0.8 + 0.2 * s})`, opacity: s }}>
      <div style={{ maxWidth: 900, padding: "14px 30px", borderRadius: 18, backgroundColor: "rgba(20,12,6,0.72)", border: "3px solid #e0b25a", fontFamily: sans, fontWeight: 800, fontSize: 52, lineHeight: 1.15, color: "#fff3dd", textAlign: "center" }}>
        {text}
      </div>
    </div>
  );
};

// Closing card: the cliffhanger line, then a pointer to the channel name (bottom-left in Shorts and TikTok).
const ChannelCard: React.FC<{ tease: string }> = ({ tease }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 12 } });
  const b = spring({ frame: frame - 18, fps, config: { damping: 12 } });
  const bob = Math.sin(frame / 5) * 14;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #f3e6c6 0%, #e2cfa2 70%, #c9b07e 100%)", alignItems: "center" }}>
      <div style={{ marginTop: 470, width: 920, textAlign: "center", color: "#3a2414" }}>
        <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 64, lineHeight: 1.2, opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>{tease}</div>
        <div style={{ marginTop: 70, opacity: b, transform: `scale(${0.85 + 0.15 * b})` }}>
          <Img src={staticFile("logo.png")} style={{ width: 190, borderRadius: 999, boxShadow: "0 6px 20px rgba(0,0,0,0.35)" }} />
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 66, marginTop: 22 }}>The full story</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 44, color: "#7a3a14", marginTop: 8 }}>is on the channel</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 40, color: "#5a3a20", marginTop: 28 }}>@bidayah.nihayah</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 1440 + bob, opacity: b, fontFamily: sans, fontWeight: 800, fontSize: 40, color: "#7a3a14", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 90, lineHeight: 1 }}>↙</span>
        <span>Tap the channel name</span>
      </div>
    </AbsoluteFill>
  );
};

export const Ep1Short: React.FC<{ from: number; to: number; headline: string; tease: string }> = ({ from, to, headline, tease }) => {
  const len = to - from;
  const frame = useCurrentFrame();
  // Short fade-out of the story into the card so the cut never feels like an error.
  const dip = interpolate(frame, [len - 8, len], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={len}>
        <Sequence from={-from}><Ep1v2 /></Sequence>
        <Headline text={headline} />
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: dip }} />
      </Sequence>
      <Sequence from={len}>
        <ChannelCard tease={tease} />
        <Html5Audio src={staticFile("trailer/sfx/short-video-whoosh-01.mp3")} volume={0.5} />
        <Sequence from={18}><Html5Audio src={staticFile("trailer/sfx/reveal-impact-01.mp3")} volume={0.35} /></Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};
