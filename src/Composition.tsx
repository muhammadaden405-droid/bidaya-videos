import { Composition, AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { loadFont as loadSerif } from "@remotion/google-fonts/CormorantGaramond";

const { fontFamily: amiri } = loadAmiri();
const { fontFamily: serif } = loadSerif();

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

export const MyComposition = () => (
  <Composition id="TitleTest" component={TitleTest} durationInFrames={150} fps={30} width={1920} height={1080} />
);
