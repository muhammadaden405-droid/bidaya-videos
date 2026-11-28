import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { sans } from "../fonts";
import { Town, Seated, Cast, crowd } from "./scenes";
import { aim, Grade, Vignette } from "./kit";

// Episode 4 thumbnails: the dead man sitting up on the floor, mouth open, pointing into a crowd of black
// silhouettes — the killer is one of them and nobody can tell which (no spoiler). Mūsā is not shown.
// Ep4Thumb (16:9, props line1/line2, 3 versions for Test & Compare); Ep4ThumbV (9:16 TikTok cover, prop part).

const TXT = (color: string, size: number): React.CSSProperties => ({ fontFamily: sans, fontWeight: 800, fontSize: size, lineHeight: 0.95, color, letterSpacing: -2, WebkitTextStroke: "11px #000", paintOrder: "stroke fill", textShadow: "0 10px 0 #000, 0 16px 36px rgba(0,0,0,0.85)" } as React.CSSProperties);

const Scene: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  const cam = vertical ? aim(true, 830, 1330, 2.0) : aim(false, 1000, 1240, 1.65);
  // the crowd stands a step behind him (smaller, higher on the ground) so the dead man is the hero of the frame
  const shadows = crowd(vertical ? 3 : 5, vertical ? 930 : 1080, vertical ? 1170 : 1660, "th4", { mood: "tight", flip: true, s: 1.25, y: 1250 }).map((a) => ({ ...a, o: { ...a.o, skin: "#120c09", robe: "#120c09", robeShade: "#090504", wrap: "#120c09" } }));
  return (
    <AbsoluteFill>
      <Town cam={cam} sky="dusk" seed="th4" back={false}>
        <Cast acts={shadows} />
        <Seated x={vertical ? 690 : 720} mouth={1} point={1} mood="shock" />
      </Town>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${vertical ? "32% 66%" : "24% 64%"}, rgba(255,236,190,0.38) 0%, rgba(255,214,140,0.12) 22%, rgba(0,0,0,0) 42%)` }} />
      <Grade color="#5a0e0e" opacity={0.22} />
      <Vignette s={0.7} />
    </AbsoluteFill>
  );
};

/** a red question mark over the silhouettes: one of them did it */
const Q: React.FC<{ vertical: boolean }> = ({ vertical }) => (
  <div style={{ position: "absolute", ...(vertical ? { right: 70, top: 780 } : { right: 230, top: 330 }), fontFamily: sans, fontWeight: 800, fontSize: vertical ? 300 : 330, lineHeight: 1, color: "#ff2a1a", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", textShadow: "0 12px 0 #000, 0 0 60px rgba(255,40,20,0.6)", transform: "rotate(8deg)" } as React.CSSProperties}>?</div>
);

export const Ep4Thumb: React.FC<{ line1?: string; line2?: string }> = ({ line1 = "HE NAMED", line2 = "HIS KILLER" }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Scene vertical={false} />
    <Q vertical={false} />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-start", padding: "70px 0 0 70px" }}>
      <div style={{ transform: "rotate(-2deg)" }}>
        <div style={TXT("#ffd400", 168)}>{line1}</div>
        <div style={TXT("#ffffff", 168)}>{line2}</div>
      </div>
    </AbsoluteFill>
    <Img src={staticFile("logo.png")} style={{ position: "absolute", top: 30, right: 36, width: 110, opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
  </AbsoluteFill>
);

export const Ep4ThumbV: React.FC<{ part?: number }> = ({ part = 1 }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Scene vertical />
    <Q vertical />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 118, lineHeight: 1, color: "#fff", background: "#e0141c", padding: "18px 56px 24px", borderRadius: 26, border: "9px solid #000", letterSpacing: 2, boxShadow: "0 14px 0 #000, 0 20px 40px rgba(0,0,0,0.7)", WebkitTextStroke: "4px #000", paintOrder: "stroke fill" } as React.CSSProperties}>PART {part}</div>
      <div style={{ textAlign: "center", marginTop: 50, transform: "rotate(-2deg)" }}>
        <div style={TXT("#ffd400", 150)}>WHO</div>
        <div style={TXT("#ffffff", 150)}>KILLED HIM?</div>
      </div>
    </AbsoluteFill>
    <Img src={staticFile("logo.png")} style={{ position: "absolute", top: 120, right: 40, width: 104, opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
  </AbsoluteFill>
);
