import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { STAND } from "../cartoon/Rig";
import { sans } from "../fonts";
import { LEPER_RICH, ANGEL_AS } from "./cast";
import { Herd } from "./animals";
import { Meadow, House } from "./env";
import { Actor, Layer, Defs, aim, Grade, Vignette, Glow, FLOOR } from "./kit";

// Episode 3 thumbnails: the rich man (the former leper) by his big house and his camels, turning away the
// blurred, glowing stranger (the angel in his old form) — the moment he lied. Faceless, angel blurred.
// Ep3Thumb (16:9, props line1/line2, 3 versions for Test & Compare); Ep3ThumbV (9:16 cover, prop part).

const S = 2;
const TXT = (color: string, size: number): React.CSSProperties => ({ fontFamily: sans, fontWeight: 800, fontSize: size, lineHeight: 0.95, color, letterSpacing: -2, WebkitTextStroke: "11px #000", paintOrder: "stroke fill", textShadow: "0 10px 0 #000, 0 16px 36px rgba(0,0,0,0.85)" } as React.CSSProperties);

const Scene: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  const cam = vertical ? aim(true, 1190, 1040, 1.5) : aim(false, 1180, 980, 1.22);
  const refuse = { ...STAND, armRU: -14, armRL: -80, armLU: -10, armLL: -84, head: -12 }; // arms folded, chin up
  return (
    <AbsoluteFill>
      <Meadow cam={cam} seed="thumb" sky="dusk" sunX={420} sunY={860}
        back={<Herd kind="camel" n={70} x0={-400} x1={2400} y0={1192} y1={1234} frame={0} seed="thb" s={0.2} />}
        far={<Herd kind="camel" n={50} x0={-500} x1={2500} y0={1128} y1={1168} frame={0} seed="thf" s={0.11} />} bridge={520} />
      <Layer d={1} cam={cam}>
        <Defs />
        <House x={2160} rich />
        <Glow x={1000} y={1020} r={380} o={1} />
        <Actor x={1000} y={FLOOR} s={S} outfit={ANGEL_AS.leper} pose={{ ...STAND, head: 8 }} blur={7} mood="neutral" />
        <Actor x={1330} y={FLOOR} s={S} outfit={LEPER_RICH} pose={refuse} flip mood="smile" />
      </Layer>
      <Grade color="#4a1d3a" opacity={0.18} />
      <Vignette s={0.6} />
    </AbsoluteFill>
  );
};

export const Ep3Thumb: React.FC<{ line1?: string; line2?: string }> = ({ line1 = "HE LIED TO", line2 = "AN ANGEL" }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Scene vertical={false} />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-start", padding: "150px 0 0 70px" }}>
      <div style={{ transform: "rotate(-2deg)" }}>
        <div style={TXT("#ffd400", 168)}>{line1}</div>
        <div style={TXT("#ffffff", 168)}>{line2}</div>
      </div>
    </AbsoluteFill>
    <Img src={staticFile("logo.png")} style={{ position: "absolute", top: 30, right: 36, width: 110, opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
  </AbsoluteFill>
);

export const Ep3ThumbV: React.FC<{ part?: number }> = ({ part = 1 }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Scene vertical />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 118, lineHeight: 1, color: "#fff", background: "#e0141c", padding: "18px 56px 24px", borderRadius: 26, border: "9px solid #000", letterSpacing: 2, boxShadow: "0 14px 0 #000, 0 20px 40px rgba(0,0,0,0.7)", WebkitTextStroke: "4px #000", paintOrder: "stroke fill" } as React.CSSProperties}>PART {part}</div>
      <div style={{ textAlign: "center", marginTop: 50, transform: "rotate(-2deg)" }}>
        <div style={TXT("#ffd400", 150)}>HE LIED TO</div>
        <div style={TXT("#ffffff", 150)}>AN ANGEL</div>
      </div>
    </AbsoluteFill>
    <Img src={staticFile("logo.png")} style={{ position: "absolute", top: 120, right: 40, width: 104, opacity: 0.95, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }} />
  </AbsoluteFill>
);
