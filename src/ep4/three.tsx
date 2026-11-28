import React, { useMemo } from "react";
import { AbsoluteFill, random, Easing } from "remotion";
import * as THREE from "three";
import { iv, useShot, Vignette } from "./kit";
import { Canvas3D, CamRig, lerp3, V3 } from "../ep3/three";

// Episode 4 — 3D shots of the land only (owner: 3D for the land, not the characters): a valley ringed by red rocky
// mountains, an oasis spring with green meadows and fields, palm groves, and the flat-roofed mud-brick town.
// Units are metres. Low-poly + flat shading so it sits next to the 2D style; fog gives the depth.
const SPRING: [number, number] = [-46, -24];
const TOWN: [number, number] = [34, 6];
const smooth = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const noise = (x: number, z: number) => Math.sin(x * 0.071 + 1.3) * Math.cos(z * 0.053) * 0.5 + Math.sin(x * 0.19 + z * 0.13) * 0.25 + Math.sin(x * 0.41 - z * 0.37) * 0.12;
/** height of the land: flat valley floor, mountains rising beyond ~110 m from the centre line and at the far end */
export const land = (x: number, z: number) => {
  const side = smooth(95, 190, Math.abs(x + Math.sin(z * 0.012) * 30));
  const far = smooth(-260, -420, z);
  const m = Math.max(side, far);
  const jag = Math.abs(Math.sin(x * 0.045 + z * 0.02)) * 38 + Math.abs(Math.sin(x * 0.11 - z * 0.07)) * 18 + noise(x, z) * 14;
  const sp = Math.hypot(x - SPRING[0], z - SPRING[1]);
  const dip = sp < 18 ? -1.6 * (1 - sp / 18) : 0;
  return m * (60 + jag) + noise(x, z) * 0.8 + dip;
};
const meadowAt = (x: number, z: number) => {
  const sp = Math.hypot(x - SPRING[0], (z - SPRING[1]) * 0.7);
  const field = Math.abs(x + 30) < 60 && z < 60 && z > -230 && Math.sin(z * 0.09) > -0.55;
  return sp < 70 || field;
};
const Terrain: React.FC<{ night?: boolean; dusk?: boolean }> = ({ night, dusk }) => {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(1300, 1300, 230, 230);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position; const col: number[] = [];
    const sand = new THREE.Color("#d4b383"), sandD = new THREE.Color("#bf9a68"), grass = new THREE.Color("#6fa84f"), grassD = new THREE.Color("#4f8a3c"), rock = new THREE.Color("#b2704f"), rockD = new THREE.Color("#7e4a36"), crop = new THREE.Color("#c9b24a");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i) - 200; const y = land(x, z);
      p.setY(i, y); p.setZ(i, z);
      const k = random(`t4${i}`);
      let c: THREE.Color;
      if (y > 6) c = rock.clone().lerp(rockD, Math.min(1, k * 0.6 + (Math.sin(y * 0.35) > 0.6 ? 0.4 : 0)));
      else if (meadowAt(x, z)) c = (Math.sin(z * 0.09) > 0.75 && Math.abs(x + 30) < 60 ? crop : grass).clone().lerp(grassD, k * 0.4);
      else c = sand.clone().lerp(sandD, k * 0.5);
      col.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geom}><meshStandardMaterial vertexColors flatShading roughness={1} color={night ? "#6d77a8" : dusk ? "#f0c4a8" : "#ffffff"} /></mesh>;
};
const Spring: React.FC<{ night?: boolean }> = ({ night }) => (
  <mesh position={[SPRING[0], -0.7, SPRING[1]]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[15, 40]} /><meshStandardMaterial color={night ? "#2a3a6a" : "#4f9fd0"} roughness={0.15} metalness={0.2} /></mesh>
);
const Palms: React.FC = () => {
  const list = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < 150; i++) {
      const a = random(`pa${i}`) * Math.PI * 2, r = 16 + random(`pr${i}`) * 60;
      const grove = i < 90;
      const x = grove ? SPRING[0] + Math.cos(a) * r : -90 + random(`px${i}`) * 140, z = grove ? SPRING[1] + Math.sin(a) * r * 0.8 : -220 + random(`pz${i}`) * 260;
      if (Math.hypot(x - TOWN[0], z - TOWN[1]) < 30 || land(x, z) > 3) continue;
      out.push([x, z, 0.8 + random(`ps${i}`) * 0.5]);
    }
    return out;
  }, []);
  return (
    <group>
      {list.map(([x, z, s], i) => (
        <group key={i} position={[x, land(x, z), z]} scale={s} rotation={[0, random(`pw${i}`) * 6, 0]}>
          <mesh position={[0, 4, 0]} rotation={[0, 0, 0.08]}><cylinderGeometry args={[0.18, 0.3, 8, 6]} /><meshStandardMaterial color="#7a5a3a" flatShading /></mesh>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <mesh key={k} position={[Math.cos(k) * 1.4, 7.7, Math.sin(k) * 1.4]} rotation={[0.5 * Math.sin(k), k, 0.9]}><coneGeometry args={[0.7, 3.6, 4]} /><meshStandardMaterial color={k % 2 ? "#3d7a35" : "#4f9142"} flatShading /></mesh>
          ))}
        </group>
      ))}
    </group>
  );
};
const Town: React.FC<{ night?: boolean }> = ({ night }) => {
  const houses = useMemo(() => {
    const out: { x: number; z: number; w: number; d: number; h: number; c: string }[] = [];
    for (let i = 0; i < 70; i++) {
      const a = random(`ha${i}`) * Math.PI * 2, r = 9 + random(`hr${i}`) * 34;
      const x = TOWN[0] + Math.cos(a) * r, z = TOWN[1] + Math.sin(a) * r * 0.8;
      if (out.some((h) => Math.abs(h.x - x) < 6 && Math.abs(h.z - z) < 6)) continue;
      out.push({ x, z, w: 4 + random(`hw${i}`) * 3, d: 4 + random(`hd${i}`) * 3, h: 3 + random(`hh${i}`) * 3.5, c: ["#d9b98a", "#cfa978", "#e0c39a", "#c9a070"][i % 4] });
    }
    return out;
  }, []);
  return (
    <group>
      {houses.map((h, i) => (
        <group key={i} position={[h.x, land(h.x, h.z), h.z]} rotation={[0, (random(`hy${i}`) - 0.5) * 0.4, 0]}>
          <mesh position={[0, h.h / 2, 0]}><boxGeometry args={[h.w, h.h, h.d]} /><meshStandardMaterial color={h.c} flatShading roughness={1} /></mesh>
          <mesh position={[0, h.h + 0.2, 0]}><boxGeometry args={[h.w + 0.3, 0.4, h.d + 0.3]} /><meshStandardMaterial color="#b88e5c" flatShading /></mesh>
          <mesh position={[0, h.h * 0.55, h.d / 2 + 0.02]}><planeGeometry args={[0.8, 1.0]} /><meshStandardMaterial color={night && i % 3 === 0 ? "#ffb04a" : "#3a2818"} emissive={night && i % 3 === 0 ? "#ff9a2a" : "#000000"} emissiveIntensity={night ? 1.4 : 0} /></mesh>
        </group>
      ))}
      <mesh position={[TOWN[0], 0.05, TOWN[1]]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[8, 24]} /><meshStandardMaterial color="#e2c79c" /></mesh>
    </group>
  );
};
const Sun: React.FC<{ p: V3; c?: string; r?: number }> = ({ p, c = "#fff6d8", r = 16 }) => <mesh position={p}><sphereGeometry args={[r, 20, 14]} /><meshBasicMaterial color={c} fog={false} /></mesh>;

type ShotName = "night" | "farms" | "dusk" | "present" | "dawn";
const SKY: Record<ShotName, string> = {
  night: "linear-gradient(#03040c 0%, #0b1230 45%, #1a2550 80%)",
  farms: "linear-gradient(#2f6fa8 0%, #7fb2d6 45%, #f3d6a4 75%)",
  dusk: "linear-gradient(#0f0b1e 0%, #3a1d3c 30%, #8f3a42 52%, #e0703e 66%, #ffb86a 78%)",
  present: "linear-gradient(#2f6fa8 0%, #7fb2d6 45%, #f3d6a4 75%)",
  dawn: "linear-gradient(#120f2a 0%, #3b2a55 25%, #a0566a 45%, #f0965e 60%, #ffd08a 72%, #ffe6b0 85%)",
};
const FOG: Record<ShotName, string> = { night: "#141c3c", farms: "#f0dcb4", dusk: "#d08a6a", present: "#f0dcb4", dawn: "#f1c8a4" };
/** a drone shot over the land; each shot is one continuous eased camera move (no cuts inside) */
export const Land3D: React.FC<{ shot: ShotName; span?: [number, number]; fadeIn?: number }> = ({ shot, span, fadeIn = 0 }) => {
  const sh = useShot();
  const frame = span ? sh.frame - span[0] : sh.frame, dur = span ? span[1] - span[0] : sh.dur;
  const t = Easing.inOut(Easing.cubic)(Math.min(1, frame / Math.max(1, dur - 1)));
  const night = shot === "night", dusk = shot === "dusk", dawn = shot === "dawn";
  let pos: V3, look: V3;
  if (shot === "night") { pos = lerp3([TOWN[0] - 60, 34, TOWN[1] + 90], [TOWN[0] - 20, 18, TOWN[1] + 44], t); look = [TOWN[0], 2, TOWN[1]]; }
  else if (shot === "farms") { const z = 60 - t * 230; pos = [-30 + Math.sin(t * 3) * 8, 16, z]; look = [-24, 2, z - 60]; }
  else if (shot === "dusk") { const a = 0.6 + t * 0.7; pos = [TOWN[0] + Math.cos(a) * 70, 40, TOWN[1] + Math.sin(a) * 70]; look = [TOWN[0], 2, TOWN[1]]; }
  else if (shot === "present") { pos = lerp3([TOWN[0] - 80, 70, TOWN[1] + 120], [TOWN[0] - 14, 14, TOWN[1] + 30], t); look = lerp3([TOWN[0], 0, TOWN[1] - 20], [TOWN[0], 3, TOWN[1]], t); }
  else { pos = lerp3([-10, 22, 140], [-30, 60, 40], t); look = lerp3([-30, 10, -200], [-40, 0, -260], t); }
  const sun = iv(frame, [0, dur], [0, 1]);
  return (
    <AbsoluteFill style={{ background: SKY[shot] }}>
      <Canvas3D fog={FOG[shot]} dawn={dawn || dusk}>
        <CamRig pos={pos} look={look} />
        {night ? <Sun p={[120, 160, -500]} c="#f2efe0" r={12} /> : dawn ? <Sun p={[-40, -10 + sun * 70, -560]} c="#ffe8b0" r={22} /> : dusk ? <Sun p={[160, 20, -520]} c="#ffcf8a" r={20} /> : <Sun p={[140, 140, -520]} />}
        {night ? <ambientLight intensity={-0.15} /> : null}
        <Terrain night={night} dusk={dusk || dawn} />
        <Spring night={night} />
        <Palms />
        <Town night={night} />
      </Canvas3D>
      {night ? <AbsoluteFill style={{ background: "rgba(10,16,48,0.35)", mixBlendMode: "multiply" }} /> : null}
      {fadeIn ? <AbsoluteFill style={{ backgroundColor: "#fff2d0", opacity: iv(frame, [0, fadeIn], [0.9, 0]) }} /> : null}
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
