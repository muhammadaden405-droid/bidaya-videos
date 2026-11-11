import React from "react";
import { Composition } from "remotion";
import * as S1 from "./s1";
import * as S2 from "./s2";
import * as S3 from "./s3";

// Test compositions for checking each Episode 1 scene on its own (E1-<Scene>).
const ALL: Record<string, React.FC<any>> = { ...S1, ...S2, ...S3 } as any;
export const Ep1Previews: React.FC = () => (
  <>
    {Object.entries(ALL).filter(([, c]) => typeof c === "function").map(([name, C]) => (
      <Composition key={name} id={`E1-${name}`} component={C} durationInFrames={300} fps={30} width={1920} height={1080} />
    ))}
  </>
);
