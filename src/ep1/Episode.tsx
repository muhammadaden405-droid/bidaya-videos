import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { amiri, serif } from "../fonts";
import * as S1 from "./s1";
import * as S2 from "./s2";
import * as S3 from "./s3";
import { Grain } from "./kit";
import TL from "./timeline.json";

// Episode 1 — The Year of the Elephant (full 16:9). Everything is placed by timeline.json, which
// tools/ep1_timeline.py builds from the narration's word timings.

type SceneCue = { scene: string; from: number; len: number; props?: Record<string, unknown>; trans?: "fade" | "cut" | "flash" | "black" };
type Sfx = { src: string; from: number; len?: number; vol: number; fadeIn?: number; fadeOut?: number; loop?: boolean; rate?: number };
type Cap = { from: number; to: number; words: { t: number; w: string }[] };
type Timeline = { total: number; scenes: SceneCue[]; audio: { src: string; from: number; vol?: number }[]; sfx: Sfx[]; captions: Cap[] };
const T = TL as unknown as Timeline;
export const EP1_LENGTH = T.total;

const SCENES: Record<string, React.FC<any>> = { ...(S1 as any), ...(S2 as any), ...(S3 as any) };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Transition: React.FC<{ kind?: SceneCue["trans"]; children: React.ReactNode }> = ({ kind = "fade", children }) => {
  const frame = useCurrentFrame();
  const o = kind === "fade" ? interpolate(frame, [0, 14], [0, 1], clamp) : 1;
  const flash = kind === "flash" ? interpolate(frame, [0, 8], [0.85, 0], clamp) : 0;
  const black = kind === "black" ? interpolate(frame, [0, 10], [1, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {children}
      {flash > 0 ? <AbsoluteFill style={{ backgroundColor: "#fff3dd", opacity: flash }} /> : null}
      {black > 0 ? <AbsoluteFill style={{ backgroundColor: "#000", opacity: black }} /> : null}
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const cap = T.captions.find((c) => frame >= c.from && frame < c.to);
  if (!cap) return null;
  const o = interpolate(frame, [cap.from, cap.from + 4, cap.to - 4, cap.to], [0, 1, 1, 0], clamp);
  return (
    <>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 240, background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.42))", opacity: o }} />
    <div style={{ position: "absolute", bottom: 64, width: "100%", display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: 50, color: "#fff7e6", textAlign: "center", maxWidth: 1500, lineHeight: 1.25, textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.7)" }}>
        {cap.words.map((w, i) => {
          const on = frame >= w.t;
          const cur = on && (i === cap.words.length - 1 || frame < cap.words[i + 1].t);
          return <span key={i} style={{ color: cur ? "#ffcf6a" : on ? "#fff7e6" : "rgba(255,247,230,0.55)" }}>{w.w}{" "}</span>;
        })}
      </div>
    </div>
    </>
  );
};

const Watermark: React.FC = () => useCurrentFrame() < 80 ? null : <Img src={staticFile("logo.png")} style={{ position: "absolute", top: 28, right: 32, width: 104, opacity: 0.9, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />;

const vol = (s: Sfx) => (f: number) => {
  const len = s.len ?? 99999;
  const a = s.fadeIn ? Math.min(1, f / s.fadeIn) : 1;
  const b = s.fadeOut ? Math.min(1, Math.max(0, (len - f) / s.fadeOut)) : 1;
  return s.vol * a * b;
};

export const Episode1: React.FC = () => {
  const durationInFrames = T.total;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {T.scenes.map((c, i) => {
        const C = SCENES[c.scene];
        return (
          <Sequence key={i} from={c.from} durationInFrames={c.len}>
            <Transition kind={c.trans}>{C ? <C {...(c.props ?? {})} /> : null}</Transition>
          </Sequence>
        );
      })}
      <Grain opacity={0.05} />
      <Captions />
      <Watermark />
      {T.audio.map((a, i) => <Sequence key={`a${i}`} from={a.from}><Html5Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>)}
      {T.sfx.map((s, i) => (
        <Sequence key={`s${i}`} from={s.from} durationInFrames={Math.min(s.len ?? durationInFrames, durationInFrames - s.from)}>
          <Html5Audio src={staticFile(`trailer/sfx/${s.src}.mp3`)} volume={vol(s)} loop={s.loop} playbackRate={s.rate ?? 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// One TikTok part = a window of the full episode (no rotate card); see timeline "parts".
export const Ep1Part: React.FC<{ from: number }> = ({ from }) => (
  <Sequence from={-from}><Episode1 /></Sequence>
);
