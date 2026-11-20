import React, { useMemo } from "react";
import { AbsoluteFill, random, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { iv, useShot, useView, useL, Vignette } from "./kit";

// Episode 3 — a few 3D scenes (owner's request): the same green valley with its river, trees and village,
// built low-poly so it sits next to the flat 2D style. Units are metres (a man ≈ 1.75, a house ≈ 3.6 tall).
// People stay faceless; the angel is drawn on his own canvas and blurred, as in every other scene.

const riverX = (z: number) => Math.sin(z * 0.025) * 12 + Math.sin(z * 0.061) * 3;
const ground = (x: number, z: number) => {
  const d = Math.abs(x - riverX(z));
  const base = d < 5 ? -0.9 + d * 0.1 : d < 16 ? -0.4 + (d - 5) * 0.06 : 0.26 + Math.pow(d - 16, 1.5) * 0.018;
  return base + Math.sin(x * 0.11) * Math.cos(z * 0.13) * 0.35 + Math.sin(x * 0.031 + z * 0.02) * 0.6;
};
const FOLK_ROBES = ["#6b4a32", "#5a4636", "#7a5c3e", "#4e3b30", "#6e5a48"];
const HAIR = ["#2a1c12", "#3b2716", "#1e1510"];

const Terrain: React.FC<{ tint: string }> = ({ tint }) => {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(520, 520, 170, 170);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const col: number[] = [];
    const a = new THREE.Color(tint), b = new THREE.Color("#4f8a3c"), c = new THREE.Color("#8cc263");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i) - 100;
      const y = ground(x, z);
      p.setY(i, y); p.setZ(i, z);
      const k = random(`tc${i}`);
      const m = a.clone().lerp(k < 0.5 ? b : c, k * 0.35);
      col.push(m.r, m.g, m.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, [tint]);
  return <mesh geometry={geom}><meshStandardMaterial vertexColors flatShading roughness={1} /></mesh>;
};
const River: React.FC<{ frame: number; color: string }> = ({ frame, color }) => {
  const geom = useMemo(() => {
    const v: number[] = [], idx: number[] = [];
    let n = 0;
    for (let z = -360; z <= 160; z += 2) {
      const x = riverX(z);
      v.push(x - 4, -0.45, z, x + 4, -0.45, z);
      if (n > 0) idx.push(2 * n - 2, 2 * n - 1, 2 * n, 2 * n - 1, 2 * n + 1, 2 * n);
      n++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={geom}><meshStandardMaterial color={color} roughness={0.25} metalness={0.15} side={THREE.DoubleSide} /></mesh>
      {new Array(60).fill(0).map((_, i) => {
        const z = ((random(`rz${i}`) * 520 + frame * 0.12) % 520) - 360;
        return <mesh key={i} position={[riverX(z) + (random(`rx${i}`) - 0.5) * 5, -0.4, z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.18, 1.6]} /><meshBasicMaterial color="#e6f3fb" transparent opacity={0.7} /></mesh>;
      })}
    </group>
  );
};
const Tree: React.FC<{ x: number; z: number; s: number; kind: number }> = ({ x, z, s, kind }) => {
  const y = ground(x, z);
  if (kind === 1) return (
    <group position={[x, y, z]} scale={s}>
      <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.15, 0.2, 1.2, 5]} /><meshStandardMaterial color="#5a4030" flatShading /></mesh>
      <mesh position={[0, 4, 0]}><coneGeometry args={[1.1, 6.5, 6]} /><meshStandardMaterial color="#2f6a2e" flatShading /></mesh>
    </group>
  );
  if (kind === 2) return (
    <group position={[x, y, z]} scale={s}>
      <mesh position={[0.3, 3.5, 0]} rotation={[0, 0, -0.08]}><cylinderGeometry args={[0.16, 0.24, 7, 5]} /><meshStandardMaterial color="#7a5a3a" flatShading /></mesh>
      {[0, 1, 2, 3, 4, 5].map((k) => <mesh key={k} position={[0.6 + Math.cos(k) * 1.2, 6.9, Math.sin(k) * 1.2]} rotation={[Math.sin(k) * 0.5, k, Math.cos(k) * 0.5 + 0.3]}><boxGeometry args={[3.2, 0.08, 0.7]} /><meshStandardMaterial color={k % 2 ? "#3d7a35" : "#4f9142"} flatShading /></mesh>)}
    </group>
  );
  return (
    <group position={[x, y, z]} scale={s}>
      <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.22, 0.3, 2.4, 5]} /><meshStandardMaterial color="#6b4a32" flatShading /></mesh>
      <mesh position={[0, 3.6, 0]}><icosahedronGeometry args={[2.3, 0]} /><meshStandardMaterial color="#3d7a35" flatShading /></mesh>
      <mesh position={[0.9, 4.4, 0.6]}><icosahedronGeometry args={[1.4, 0]} /><meshStandardMaterial color="#4f9142" flatShading /></mesh>
    </group>
  );
};
const VILLAGE: [number, number, number][] = [[-14, -8, 0.2], [-22, -20, -0.1], [-12, -30, 0.3], [-26, -4, 0], [-20, 8, -0.2], [-34, -16, 0.15], [16, -14, -0.2], [24, -2, 0.1], [20, -28, 0], [32, -18, 0.25], [28, 10, -0.15]];
const House3D: React.FC<{ x: number; z: number; r: number; i: number }> = ({ x, z, r, i }) => {
  const y = ground(x, z);
  const wall = ["#e6d3ae", "#d9c39a", "#cdb488", "#e2cfa8"][i % 4];
  return (
    <group position={[x, y, z]} rotation={[0, r, 0]}>
      <mesh position={[0, 1.6, 0]}><boxGeometry args={[6, 4.2, 5.5]} /><meshStandardMaterial color={wall} flatShading roughness={1} /></mesh>
      <mesh position={[0, 3.8, 0]}><boxGeometry args={[6.3, 0.3, 5.8]} /><meshStandardMaterial color="#9b7b52" flatShading /></mesh>
      <mesh position={[0, 0.9, 2.76]}><boxGeometry args={[1.2, 2.4, 0.06]} /><meshStandardMaterial color="#4a3220" /></mesh>
      {[-1.9, 1.9].map((wx) => <mesh key={wx} position={[wx, 2.4, 2.76]}><boxGeometry args={[0.8, 0.9, 0.06]} /><meshStandardMaterial color="#3a2718" /></mesh>)}
    </group>
  );
};
/** a small faceless villager (only seen from afar in these shots); hair or a wrap on every head */
const Villager: React.FC<{ x: number; z: number; a: number; i: number; t: number; walk: boolean }> = ({ x, z, a, i, t, walk }) => {
  const bob = walk ? Math.abs(Math.sin(t * 0.3 + i)) * 0.06 : 0;
  return (
    <group position={[x, ground(x, z) + bob, z]} rotation={[0, a, 0]}>
      <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.22, 0.34, 1.4, 7]} /><meshStandardMaterial color={FOLK_ROBES[i % 5]} flatShading /></mesh>
      <mesh position={[0, 1.55, 0]}><sphereGeometry args={[0.18, 10, 8]} /><meshStandardMaterial color="#a8774f" flatShading /></mesh>
      <mesh position={[0, 1.6, -0.03]}><sphereGeometry args={[0.19, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={i % 3 === 0 ? "#e8dcc0" : HAIR[i % 3]} flatShading /></mesh>
    </group>
  );
};
const Sheep3D: React.FC<{ x: number; z: number; a: number }> = ({ x, z, a }) => (
  <group position={[x, ground(x, z), z]} rotation={[0, a, 0]}>
    <mesh position={[0, 0.55, 0]} scale={[1.3, 0.85, 0.8]}><icosahedronGeometry args={[0.5, 1]} /><meshStandardMaterial color="#f1ece2" flatShading /></mesh>
    <mesh position={[0.65, 0.5, 0]}><boxGeometry args={[0.32, 0.3, 0.26]} /><meshStandardMaterial color="#2e2620" /></mesh>
    {[[-0.35, -0.2], [-0.35, 0.2], [0.35, -0.2], [0.35, 0.2]].map(([lx, lz], k) => <mesh key={k} position={[lx, 0.15, lz]}><boxGeometry args={[0.1, 0.3, 0.1]} /><meshStandardMaterial color="#2e2620" /></mesh>)}
  </group>
);

/** the valley: terrain, river, trees, far mountains, the village and its people, sheep on the slopes */
const Valley: React.FC<{ frame: number; dawn?: boolean; village?: boolean; clear?: [number, number, number, number] }> = ({ frame, dawn, village = true, clear }) => {
  const trees = useMemo(() => {
    const out: { x: number; z: number; s: number; kind: number }[] = [];
    for (let i = 0; out.length < 170 && i < 900; i++) {
      const z = -330 + random(`tz${i}`) * 400, x = riverX(z) + (random(`tx${i}`) - 0.5) * 260;
      const d = Math.abs(x - riverX(z));
      if (d < 7) continue;
      if (clear && x > clear[0] && x < clear[1] && z > clear[2] && z < clear[3]) continue;
      if (village && z > -40 && z < 16 && d < 42) continue;
      out.push({ x, z, s: 0.8 + random(`ts${i}`) * 0.6, kind: random(`tk${i}`) < 0.2 ? 1 : random(`tk${i}`) < 0.32 ? 2 : 0 });
    }
    return out;
  }, [village, clear?.join()]);
  return (
    <group>
      <Terrain tint={dawn ? "#5f9a48" : "#6fa84f"} />
      <River frame={frame} color={dawn ? "#7c9fc4" : "#4f8fbf"} />
      {new Array(26).fill(0).map((_, i) => <mesh key={i} position={[-300 + i * 24 + random(`mx${i}`) * 10, 10, -330 - random(`mz${i}`) * 60]}><coneGeometry args={[34 + random(`mr${i}`) * 20, 50 + random(`mh${i}`) * 40, 6]} /><meshStandardMaterial color={dawn ? "#7f86a8" : "#8fb0c4"} flatShading /></mesh>)}
      {trees.map((t, i) => <Tree key={i} {...t} />)}
      {village ? <>
        {VILLAGE.map(([x, z, r], i) => <House3D key={i} x={riverX(z) + x} z={z} r={r} i={i} />)}
        {[[-8, 0], [-8, -14], [-10, 4], [9, -6], [10, -22], [-18, 14], [13, 4], [-9, -24]].map(([x, z], i) => {
          const dz = ((frame * (0.02 + i * 0.004)) % 16) * (i % 2 ? -1 : 1);
          return <Villager key={i} x={riverX(z + dz) + x} z={z + dz} a={i % 2 ? Math.PI : 0} i={i} t={frame} walk />;
        })}
      </> : null}
      {new Array(30).fill(0).map((_, i) => { const z = -120 + random(`sz${i}`) * 90, side = i % 2 ? 1 : -1; return <Sheep3D key={i} x={riverX(z) + side * (34 + random(`sx${i}`) * 30)} z={z} a={random(`sa${i}`) * 6} />; })}
    </group>
  );
};

type V3 = [number, number, number];
const CamRig: React.FC<{ pos: V3; look: V3 }> = ({ pos, look }) => {
  const { camera } = useThree();
  camera.position.set(...pos);
  camera.lookAt(...look);
  return null;
};
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const Canvas3D: React.FC<{ fog: string; children: React.ReactNode; style?: React.CSSProperties; dawn?: boolean }> = ({ fog, children, style, dawn }) => {
  const { width, height } = useVideoConfig();
  const { vertical } = useView();
  return (
    <AbsoluteFill style={style}>
      <ThreeCanvas width={width} height={height} camera={{ fov: vertical ? 62 : 40, near: 0.1, far: 900 }} gl={{ alpha: true, antialias: true }}>
        <fog attach="fog" args={[fog, 110, 430]} />
        <hemisphereLight args={[dawn ? "#ffe0c0" : "#d8ecff", "#3e5a30", 1.0]} />
        <directionalLight position={dawn ? [-60, 40, -200] : [80, 120, -60]} intensity={dawn ? 2.0 : 2.4} color={dawn ? "#ffc890" : "#fff2d8"} />
        <ambientLight intensity={0.3} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** "Long ago, among the Children of Israel, there were three men." — a fly-over down the valley to the village */
export const Village3D: React.FC = () => {
  const { frame, dur } = useShot();
  const t = Easing.inOut(Easing.cubic)(Math.min(1, frame / Math.max(1, dur - 1)));
  const z0 = riverX(-10);
  const pos = lerp3([z0 - 30, 46, 150], [z0 + 26, 9, 34], t);
  const look = lerp3([z0, 0, -60], [z0 + 2, 2, -10], t);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#5d9fd8 0%, #a9d2ee 45%, #e7f1f2 70%)" }}>
      <Canvas3D fog="#d6e8ee">
        <CamRig pos={pos} look={look} />
        <mesh position={[120, 120, -420]}><sphereGeometry args={[14, 20, 14]} /><meshBasicMaterial color="#fff6d8" fog={false} /></mesh>
        <Valley frame={frame} />
      </Canvas3D>
      <Vignette s={0.35} />
    </AbsoluteFill>
  );
};

/** "So He sent them an angel." — at dawn a column of light comes down into the meadow; a blurred figure walks out of it */
const BX = riverX(-30) + 22, BZ = -30;
const AngelBody: React.FC<{ frame: number; walk: number }> = ({ frame, walk }) => {
  const z = BZ + walk * 4.5;
  const bob = walk > 0 && walk < 1 ? Math.abs(Math.sin(frame * 0.3)) * 0.05 : 0;
  const mat = <meshStandardMaterial color="#fffaf0" emissive="#fff3d6" emissiveIntensity={0.9} flatShading />;
  return (
    <group position={[BX, ground(BX, z) + bob, z]}>
      <mesh position={[0, 0.75, 0]}><cylinderGeometry args={[0.24, 0.42, 1.5, 9]} />{mat}</mesh>
      <mesh position={[0, 1.62, 0]}><sphereGeometry args={[0.2, 12, 10]} />{mat}</mesh>
    </group>
  );
};
export const AngelSent3D: React.FC = () => {
  const { frame, dur } = useShot();
  const { Wd } = useL();
  const sent = Wd("N08", "sent") - 4;
  const beam = iv(frame, [6, 34], [0, 1]);
  const show = iv(frame, [sent - 12, sent + 4], [0, 1]);
  const walk = iv(frame, [sent + 4, dur], [0, 1]);
  const gy = ground(BX, BZ);
  // shot 1: wide, low over the river looking up the valley at the light; shot 2 (cut on "sent"): close on the meadow
  const t1 = frame / Math.max(1, sent);
  const t2 = (frame - sent) / Math.max(1, dur - sent);
  const pos: V3 = frame < sent - 2 ? lerp3([BX - 34, 7, BZ + 70], [BX - 26, 5, BZ + 56], t1) : lerp3([BX + 5, gy + 1.9, BZ + 15], [BX + 3.5, gy + 1.7, BZ + 11.5], t2);
  const look: V3 = frame < sent - 2 ? [BX, gy + 14 - t1 * 6, BZ] : [BX, gy + 1.3, BZ + walk * 4];
  const beamEl = (
    <group position={[BX, gy, BZ]}>
      <mesh position={[0, 70, 0]}><cylinderGeometry args={[7, 2.6, 140, 24, 1, true]} /><meshBasicMaterial color="#fff2cc" transparent opacity={0.28 * beam} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} fog={false} /></mesh>
      <mesh position={[0, 70, 0]}><cylinderGeometry args={[3.5, 1.2, 140, 24, 1, true]} /><meshBasicMaterial color="#fffbe8" transparent opacity={(frame < sent ? 0.35 : 0.2) * beam} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} fog={false} /></mesh>
      <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[6, 32]} /><meshBasicMaterial color="#fff4d0" transparent opacity={0.45 * beam} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    </group>
  );
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#3e4f86 0%, #c9879a 40%, #f6c48f 62%, #fbe3bd 78%)" }}>
      <Canvas3D fog="#f1d4bc" dawn>
        <CamRig pos={pos} look={look} />
        <mesh position={[-80, 30, -420]}><sphereGeometry args={[16, 20, 14]} /><meshBasicMaterial color="#fff0cc" fog={false} /></mesh>
        <Valley frame={frame} dawn village={false} clear={[BX - 50, BX + 14, BZ - 6, BZ + 90]} />
        {beamEl}
      </Canvas3D>
      {show > 0 ? (
        <Canvas3D fog="#f1d4bc" dawn style={{ filter: "blur(9px)", opacity: show }}>
          <CamRig pos={pos} look={look} />
          <AngelBody frame={frame} walk={walk} />
        </Canvas3D>
      ) : null}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, rgba(255,244,214,${0.25 * beam}) 0%, rgba(255,244,214,0) 55%)` }} />
      <Vignette s={0.4} />
    </AbsoluteFill>
  );
};
