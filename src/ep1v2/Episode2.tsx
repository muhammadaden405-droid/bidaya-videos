import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { sans, amiri } from "../fonts";
import { P1_SCENES } from "./p1";
import { Recitation, EndCard } from "../ep1/s3";
import { Grain } from "../ep1/kit";
import TL from "./timeline.json";

// Episode 1 v2 — one timeline, two films: 16:9 for YouTube and 9:16 for TikTok (scenes are composed
// on a square world, so each format is framed natively). Captions are short punchy groups.
type Cue = { scene: string; from: number; len: number; props?: Record<string, unknown>; trans?: "fade" | "cut" | "flash" | "black" };
type Sfx = { src: string; from: number; len?: number; vol: number; fadeIn?: number; fadeOut?: number; loop?: boolean };
type Cap = { from: number; to: number; words: { t: number; w: string }[] };
const T = TL as unknown as { total: number; scenes: Cue[]; audio: { src: string; from: number; vol?: number }[]; sfx: Sfx[]; captions: Cap[] };
export const EP1V2_LENGTH = Math.max(30, T.total);
const SCENES: Record<string, React.FC<any>> = { ...(P1_SCENES as any), Recitation, EndCard };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Trans: React.FC<{ kind?: Cue["trans"]; children: React.ReactNode }> = ({ kind = "fade", children }) => {
  const f = useCurrentFrame();
  const o = kind === "fade" ? interpolate(f, [0, 10], [0, 1], clamp) : 1;
  const flash = kind === "flash" ? interpolate(f, [0, 7], [0.9, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {children}
      {flash > 0 ? <AbsoluteFill style={{ backgroundColor: "#fff3dd", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = height > width;
  const cap = T.captions.find((c) => frame >= c.from && frame < c.to);
  if (!cap) return null;
  const pop = interpolate(frame, [cap.from, cap.from + 5], [0.85, 1], clamp);
  return (
    <div style={{ position: "absolute", width: "100%", display: "flex", justifyContent: "center", ...(v ? { top: "64%" } : { bottom: 70 }) }}>
      <div style={{ fontFamily: `"${sans}", "${amiri}"`, fontWeight: 800, fontSize: v ? 70 : 48, lineHeight: 1.18, color: "#ffffff", textAlign: "center", maxWidth: v ? 940 : 1500, transform: `scale(${pop})`, WebkitTextStroke: v ? "3px #000" : "2px #000", paintOrder: "stroke fill", textShadow: "0 4px 10px rgba(0,0,0,0.8)" } as React.CSSProperties}>
        {cap.words.map((w, i) => {
          const on = frame >= w.t;
          const cur = on && (i === cap.words.length - 1 || frame < cap.words[i + 1].t);
          return <span key={i} style={{ color: cur ? "#ffc83a" : "#ffffff", opacity: on ? 1 : 0.55 }}>{w.w}{" "}</span>;
        })}
      </div>
    </div>
  );
};

const Watermark: React.FC = () => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  return <Img src={staticFile("logo.png")} style={{ position: "absolute", top: v ? 150 : 28, right: 32, width: v ? 120 : 100, opacity: 0.9, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />;
};

const vol = (s: Sfx) => (f: number) => {
  const len = s.len ?? 99999;
  const a = s.fadeIn ? Math.min(1, f / s.fadeIn) : 1;
  const b = s.fadeOut ? Math.min(1, Math.max(0, (len - f) / s.fadeOut)) : 1;
  return s.vol * a * b;
};

export const Ep1v2: React.FC<{ muted?: boolean }> = ({ muted }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {T.scenes.map((c, i) => {
      const S = SCENES[c.scene];
      return (
        <Sequence key={i} from={c.from} durationInFrames={Math.max(1, c.len)}>
          <Trans kind={c.trans}>{S ? <S {...(c.props ?? {})} /> : null}</Trans>
        </Sequence>
      );
    })}
    <Grain opacity={0.05} />
    <Captions />
    <Watermark />
    {muted ? null : T.audio.map((a, i) => <Sequence key={`a${i}`} from={a.from}><Html5Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>)}
    {muted ? null : T.sfx.map((s, i) => (
      <Sequence key={`s${i}`} from={s.from} durationInFrames={Math.max(1, Math.min(s.len ?? T.total, T.total - s.from))}>
        <Html5Audio src={staticFile(`trailer/sfx/${s.src}.mp3`)} volume={vol(s)} loop={s.loop} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
export const Ep1v2Part: React.FC<{ from: number }> = ({ from }) => <Sequence from={-from}><Ep1v2 /></Sequence>;
