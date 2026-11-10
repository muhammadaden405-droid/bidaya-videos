import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// 2.5D "3D photo": a painting displaced by its AI depth map, filmed by a moving camera.
// Near parts of the painting shift more than far parts, so the camera seems to move through the scene.

export type CameraMove = {
  from: [number, number, number]; // camera x, y, z at the start (z = distance; smaller = closer)
  to: [number, number, number];
  lookFrom?: [number, number];
  lookTo?: [number, number];
};

const useTexture = (src: string) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender(`Loading ${src}`));
  useEffect(() => {
    new THREE.TextureLoader().load(
      staticFile(src),
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        setTex(t);
        continueRender(handle);
      },
      undefined,
      () => continueRender(handle)
    );
  }, [src, handle]);
  return tex;
};

const vertex = /* glsl */ `
  uniform sampler2D depthMap;
  uniform float strength;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float d = texture2D(depthMap, uv).r;
    vec3 p = position + vec3(0.0, 0.0, d * strength);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragment = /* glsl */ `
  uniform sampler2D colorMap;
  uniform float brightness;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(colorMap, vUv);
    gl_FragColor = vec4(c.rgb * brightness, 1.0);
    #include <colorspace_fragment>
  }
`;

const Plane: React.FC<{ color: THREE.Texture; depth: THREE.Texture; aspect: number; strength: number }> = ({ color, depth, aspect, strength }) => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { colorMap: { value: color }, depthMap: { value: depth }, strength: { value: strength }, brightness: { value: 1 } },
        vertexShader: vertex,
        fragmentShader: fragment,
      }),
    [color, depth, strength]
  );
  // Slightly oversized so the edges never show while the camera moves.
  const h = 1.25;
  return (
    <mesh material={material}>
      <planeGeometry args={[h * aspect, h, 384, 216]} />
    </mesh>
  );
};

const Rig: React.FC<{ t: number; move: CameraMove }> = ({ t, move }) => {
  const { camera } = useThree();
  const e = Easing.inOut(Easing.sin)(t);
  const lerp = (a: number, b: number) => a + (b - a) * e;
  camera.position.set(lerp(move.from[0], move.to[0]), lerp(move.from[1], move.to[1]), lerp(move.from[2], move.to[2]));
  const lf = move.lookFrom ?? [0, 0];
  const lt = move.lookTo ?? lf;
  camera.lookAt(lerp(lf[0], lt[0]), lerp(lf[1], lt[1]), 0);
  return null;
};

export const Photo3D: React.FC<{ src: string; depth: string; aspect: number; move: CameraMove; strength?: number }> = ({
  src,
  depth,
  aspect,
  move,
  strength = 0.18,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const color = useTexture(src);
  const depthTex = useTexture(depth);
  const t = interpolate(frame, [0, durationInFrames - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 30, near: 0.01, far: 100 }}>
        <Rig t={t} move={move} />
        {color && depthTex ? <Plane color={color} depth={depthTex} aspect={aspect} strength={strength} /> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
