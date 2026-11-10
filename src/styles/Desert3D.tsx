import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, random, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { amiri, serif } from "../fonts";

// Style C — low-poly 3D desert at dusk.
// The camera glides over the dunes and comes alongside Abraha's army, led by its elephant.
// Characters are simple and faceless by design.

const SAND = "#c98a52";
const DARK = "#2a1a1c";

// Deterministic dune height so terrain and characters agree on the ground level.
const duneHeight = (x: number, z: number) =>
  Math.sin(x * 0.08) * 1.6 + Math.cos(z * 0.06 + x * 0.03) * 2.2 + Math.sin((x + z) * 0.15) * 0.5;

const Terrain: React.FC = () => {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(400, 400, 160, 160);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, duneHeight(x, z));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={SAND} flatShading roughness={1} />
    </mesh>
  );
};

const Mountains: React.FC = () => {
  const peaks = useMemo(
    () =>
      new Array(30).fill(0).map((_, i) => ({
        x: -260 + i * 18 + random(`mx${i}`) * 8,
        z: -230 - random(`mz${i}`) * 50,
        h: 14 + random(`mh${i}`) * 18,
        r: 16 + random(`mr${i}`) * 12,
      })),
    []
  );
  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2 - 2, p.z]}>
          <coneGeometry args={[p.r, p.h, 5]} />
          <meshStandardMaterial color="#4a2a3e" flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

const Elephant: React.FC<{ step: number }> = ({ step }) => {
  const skin = "#6e625c";
  const legs = [
    [-1.3, 1.0],
    [-1.3, -1.0],
    [1.4, 1.0],
    [1.4, -1.0],
  ];
  const trunkCurve = useMemo(() => {
    const sway = Math.sin(step * 0.5) * 0.3;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.3, 3.6, 0),
      new THREE.Vector3(-4.1, 2.6, sway * 0.5),
      new THREE.Vector3(-4.3, 1.2, sway),
      new THREE.Vector3(-4.0, 0.3, sway),
    ]);
  }, [step]);
  return (
    <group>
      <mesh position={[0, 4, 0]} scale={[3.2, 2.3, 2.1]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={skin} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[-2.9, 4.4, 0]} scale={[1.3, 1.4, 1.2]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={skin} flatShading roughness={0.9} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[-2.3, 4.6, s * 1.25]} rotation={[0, s * 0.3, 0]} scale={[0.9, 1.3, 0.15]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#5e524d" flatShading />
        </mesh>
      ))}
      <mesh>
        <tubeGeometry args={[trunkCurve, 16, 0.32, 8, false]} />
        <meshStandardMaterial color={skin} flatShading />
      </mesh>
      {[0.5, -0.5].map((s) => (
        <mesh key={s} position={[-3.7, 3.2, s]} rotation={[0, 0, 2.2]}>
          <coneGeometry args={[0.15, 1.4, 6]} />
          <meshStandardMaterial color="#efe6cf" />
        </mesh>
      ))}
      {legs.map(([x, z], i) => {
        const swing = Math.sin(step + (i % 2 === 0 ? 0 : Math.PI)) * 0.25;
        return (
          <group key={i} position={[x, 3, z]} rotation={[0, 0, swing]}>
            <mesh position={[0, -1.5, 0]}>
              <cylinderGeometry args={[0.55, 0.6, 3, 8]} />
              <meshStandardMaterial color={skin} flatShading />
            </mesh>
          </group>
        );
      })}
      {/* howdah and banner */}
      <mesh position={[0.3, 6.6, 0]}>
        <boxGeometry args={[2.2, 1.2, 1.9]} />
        <meshStandardMaterial color="#7a2a1e" flatShading />
      </mesh>
      <mesh position={[0.3, 8.6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 3, 6]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      <mesh position={[1.1, 9.6, 0]} rotation={[0, 0, Math.sin(step * 0.8) * 0.08]}>
        <boxGeometry args={[1.6, 0.8, 0.04]} />
        <meshStandardMaterial color="#9c2b1b" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Soldier: React.FC<{ step: number; tint: string }> = ({ step, tint }) => {
  const bob = Math.abs(Math.sin(step)) * 0.12;
  const leg = Math.sin(step) * 0.45;
  return (
    <group position={[0, bob, 0]}>
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.32, 10, 8]} />
        <meshStandardMaterial color="#3a2a24" flatShading />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.32, 0.45, 1.4, 8]} />
        <meshStandardMaterial color={tint} flatShading />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0.5, s * 0.15]} rotation={[0, 0, s * leg]}>
          <cylinderGeometry args={[0.1, 0.1, 1, 6]} />
          <meshStandardMaterial color={DARK} />
        </mesh>
      ))}
      <mesh position={[0.1, 2.3, -0.45]} rotation={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.04, 0.04, 3.4, 5]} />
        <meshStandardMaterial color="#4a3324" />
      </mesh>
      <mesh position={[0.31, 4.0, -0.45]} rotation={[0, 0, 0.12]}>
        <coneGeometry args={[0.1, 0.4, 5]} />
        <meshStandardMaterial color="#b9b2a5" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.7, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.08, 12]} />
        <meshStandardMaterial color="#5a3b22" flatShading />
      </mesh>
    </group>
  );
};

const Dust: React.FC<{ frame: number }> = ({ frame }) => {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 600;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = random(`px${i}`) * 140 - 70;
      arr[i * 3 + 1] = random(`py${i}`) * 8;
      arr[i * 3 + 2] = random(`pz${i}`) * 80 - 40;
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  return (
    <points geometry={geom} position={[(frame * 0.05) % 10, Math.sin(frame * 0.02) * 0.3, 0]}>
      <pointsMaterial color="#ffd9a0" size={0.18} transparent opacity={0.55} />
    </points>
  );
};

const CameraRig: React.FC<{ t: number; follow: number }> = ({ t, follow }) => {
  const { camera } = useThree();
  const e = Easing.inOut(Easing.cubic)(t);
  const x = follow + interpolate(e, [0, 1], [30, 4]);
  const y = interpolate(e, [0, 1], [26, 7]);
  const z = interpolate(e, [0, 1], [60, 22]);
  camera.position.set(x, y, z);
  camera.lookAt(follow + interpolate(e, [0, 1], [0, -1]), 4, 0);
  return null;
};

export const Desert3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const t = frame / (durationInFrames - 1);
  const step = frame * 0.18;
  const march = -frame * 0.05; // army walks toward -x (west, toward Makkah)
  const titleIn = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOut = interpolate(frame, [durationInFrames - 30, durationInFrames - 5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const tints = ["#5b3a2a", "#6b4a2e", "#4e3b30", "#73502f"];

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#22183a 0%, #7d3346 38%, #e2793c 62%, #f5b862 74%)" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 42, near: 0.1, far: 900 }} gl={{ alpha: true, antialias: true }}>
        <fog attach="fog" args={["#e08a55", 80, 330]} />
        <hemisphereLight args={["#ffcf9a", "#4a2a2e", 0.9]} />
        <directionalLight position={[120, 40, -160]} intensity={2.4} color="#ffb070" />
        <ambientLight intensity={0.25} />
        <mesh position={[60, 22, -330]}>
          <sphereGeometry args={[16, 24, 16]} />
          <meshBasicMaterial color="#fff0c0" fog={false} />
        </mesh>
        <CameraRig t={t} follow={march} />
        <Terrain />
        <Mountains />
        <group position={[march, 0, 0]}>
          <group position={[-6, duneHeight(-6 + march, 0) - 0.2, 0]}>
            <Elephant step={step} />
          </group>
          {new Array(4).fill(0).map((_, r) =>
            new Array(6).fill(0).map((__, c) => {
              const x = 2 + c * 2.2;
              const z = -3 + r * 2;
              return (
                <group key={`${r}-${c}`} position={[x, duneHeight(x + march, z) - 0.1, z]}>
                  <Soldier step={step + r * 0.7 + c * 1.3} tint={tints[(r + c) % tints.length]} />
                </group>
              );
            })
          )}
        </group>
        <Dust frame={frame} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)" }} />
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", opacity: titleIn * titleOut }}>
        <div style={{ fontFamily: amiri, fontSize: 84, color: "#ffe2a6", direction: "rtl", textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>عام الفيل</div>
        <div style={{ fontFamily: serif, fontSize: 46, color: "#fff3dc", letterSpacing: 3, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>The Year of the Elephant</div>
      </div>
    </AbsoluteFill>
  );
};
