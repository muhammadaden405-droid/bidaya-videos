import React from "react";
import { AbsoluteFill } from "remotion";
import { Layer, Defs, Sky, SKIES, Elephant2, Fig, useShot, iv, ease, ridge } from "./kit2";
import { STAND, walkPose } from "../cartoon/Rig";
import { OUT, SOLDIER } from "../ep1/kit";
export const RigTest: React.FC = () => {
  const { frame } = useShot();
  const cam = { x: 0, y: 0, zoom: 1 };
  const k = iv(frame, [60, 100], [0, 1], ease);
  return (
    <AbsoluteFill>
      <Sky stops={SKIES.dawn} />
      <Layer d={0.2} cam={cam}><Defs /><path d={ridge("t", 1100, 160, 120)} fill="#5a3a52" /></Layer>
      <Layer d={1} cam={cam}>
        <Defs />
        <rect x={-500} y={1300} width={3000} height={800} fill="#a0784e" />
        <g transform="translate(1000 1300) scale(1)"><Elephant2 walk={frame * 0.12} gait={1} kneel={k} ear={(Math.sin(frame * 0.1) + 1) / 2} driver={<Fig x={0} y={0} s={0.55} outfit={SOLDIER(1, false)} pose={{ ...STAND, legLU: -80, legLL: 80, legRU: -86, legRL: 84 }} />} /></g>
        <Fig x={560} y={1310} s={0.9} outfit={OUT.guide} pose={walkPose(frame * 0.2)} sway={frame * 0.2} />
        <Fig x={1450} y={1310} s={0.9} outfit={SOLDIER(0)} prop="axe" pose={{ ...STAND, armRU: -150 + Math.sin(frame * 0.3) * 40, armRL: -20 }} flip />
      </Layer>
    </AbsoluteFill>
  );
};
