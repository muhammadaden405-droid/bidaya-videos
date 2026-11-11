import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Reframe } from "../cartoon/Trailer";
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

// ---- 9:16: where to look inside each 16:9 scene (x in the 1920-wide frame). Keyframes are
// [t, x] with t = fraction of the shot, or "bN" = the scene's Nth beat. Scenes not listed sit at the centre.
type KF = [number | string, number][];
const VFOCUS: Record<string, KF> = {
  ColdOpen: [[0, 860]],
  MapScene: [[0, 1300], ["b1", 1440], ["b2", 1250], ["b3", 620], ["b4", 980]],
  Fleet: [[0, 700], [1, 1250]],
  SeaRide: [[0, 470], [0.5, 640], [0.92, 1390]],
  TwoArmies: [[0, 520], ["b0", 640], [1, 1350]],
  Duel: [[0, 960], ["b0", 900], ["b1", 1060], ["b2", 860], ["b3", 1150]],
  DuelAftermath: [[0, 900], ["b0", 1000], ["b1", 1150], [1, 960]],
  SoilBag: [[0, 990], ["b0", 400], [1, 1500]],
  Letter: [[0, 900], [1, 1100]],
  March: [[0, 880], [1, 1000]],
  Battle: [[0, 800], ["b0", 960], ["b1", 1150]],
  Prisoner: [[0, 1150], ["b0", 1150], ["b1", 760]],
  GuideMarch: [[0, 1150], [0.5, 1350], [1, 1450]],
  Taif: [[0, 820], ["b0", 1050], ["b1", 1300]],
  MakkahWatch: [[0, 900], [0.5, 1200], ["b0", 1350]],
  KaabaMeet: [[0, 760], ["b0", 1100], [1, 900]],
  CampNight: [[0, 560], ["b0", 1000], [1, 1250]],
  Exodus: [[0, 700], [1, 1300]],
  KaabaNight: [[0, 880], ["b0", 980], ["b1", 1150]],
  EmptyDawn: [[0, 1000]],
  Whisper: [[0, 700], ["b0", 880], ["b1", 900], ["b2", 760]],
  Refuse: [[0, 960], ["b1", 1150], ["b2", 1150], ["b3", 1150], ["b4", 960]],
  Birds: [[0, 1300], [0.5, 960]],
  Beggars: [[0, 1000]],
  Ruins: [[0, 960], ["b0", 1000]],
  RoyalTent: [[0, 1300], [0.2, 960]],
};
const NATIVE = new Set(["Recitation", "EndCard", "RotateCard"]);
const TENT: Record<string, number> = { wide: 960, two: 990, abraha: 830, chief: 1150 };
const VScene: React.FC<{ cue: SceneCue; children: React.ReactNode }> = ({ cue, children }) => {
  const frame = useCurrentFrame();
  const b = ((cue.props?.b as number[]) ?? []);
  const raw = VFOCUS[cue.scene] ?? [[0, 960]];
  let kf: [number, number, boolean][] = raw.map(([t, x]) => [typeof t === "string" ? (b[Number(t.slice(1))] ?? 0) : t * cue.len, x, typeof t === "string"]);
  if (cue.scene === "RoyalTent" && cue.props?.focus) kf = [kf[0], ...(cue.props.focus as [number, string][]).map(([f, v]) => [f, TENT[v] ?? 960, true] as [number, number, boolean])];
  kf.sort((p, q) => p[0] - q[0]);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  let x = kf[0][1];
  for (let k = 1; k < kf.length; k++) {
    const [f1, x1, beat] = kf[k];
    const [f0, x0] = kf[k - 1];
    const a = beat ? f1 - 18 : f0;
    const z = beat ? f1 + 6 : f1;
    if (frame >= a) x = interpolate(frame, [a, Math.max(a + 1, z)], [x0, x1], { ...clamp, easing: beat ? smooth : (t: number) => t });
  }
  return <Reframe focusX={x} zoom={1}>{children}</Reframe>;
};

const Captions: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const cap = T.captions.find((c) => frame >= c.from && frame < c.to);
  if (!cap) return null;
  const fd = Math.max(0, Math.min(4, Math.floor((cap.to - cap.from) / 2) - 1));
  const o = fd > 0 ? interpolate(frame, [cap.from, cap.from + fd, cap.to - fd, cap.to], [0, 1, 1, 0], clamp) : 1;
  return (
    <>
    {vertical ? null : <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 240, background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.42))", opacity: o }} />}
    <div style={{ position: "absolute", bottom: vertical ? 560 : 64, width: "100%", display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: `"${serif}", "${amiri}"`, fontSize: vertical ? 66 : 50, fontWeight: vertical ? 600 : 400, color: "#fff7e6", textAlign: "center", maxWidth: vertical ? 940 : 1500, ...(vertical ? { background: "rgba(12,8,6,0.5)", padding: "14px 30px", borderRadius: 22 } : {}), lineHeight: 1.25, textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.7)" }}>
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

const Watermark: React.FC<{ vertical?: boolean }> = ({ vertical }) => <Img src={staticFile("logo.png")} style={{ position: "absolute", top: vertical ? 150 : 28, right: 32, width: vertical ? 120 : 104, opacity: 0.9, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />;

const vol = (s: Sfx) => (f: number) => {
  const len = s.len ?? 99999;
  const a = s.fadeIn ? Math.min(1, f / s.fadeIn) : 1;
  const b = s.fadeOut ? Math.min(1, Math.max(0, (len - f) / s.fadeOut)) : 1;
  return s.vol * a * b;
};

export const Episode1: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const durationInFrames = T.total;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {T.scenes.map((c, i) => {
        const C = SCENES[c.scene];
        return (
          <Sequence key={i} from={c.from} durationInFrames={c.len}>
            <Transition kind={c.trans}>{C ? (vertical && !NATIVE.has(c.scene) ? <VScene cue={c}><C {...(c.props ?? {})} /></VScene> : <C {...(c.props ?? {})} />) : null}</Transition>
          </Sequence>
        );
      })}
      <Grain opacity={0.05} />
      <Captions vertical={vertical} />
      <Watermark vertical={vertical} />
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
export const Ep1Part: React.FC<{ from: number; vertical?: boolean }> = ({ from, vertical }) => (
  <Sequence from={-from}><Episode1 vertical={vertical} /></Sequence>
);
export const Episode1Vertical: React.FC = () => <Episode1 vertical />;
