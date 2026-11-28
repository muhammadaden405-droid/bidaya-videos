import React from "react";
import * as THREE from "three";
import { G, TM, FM, smooth, V3 } from "./toon";

// A robed, faceless anime figure (series rule: a mouth that lip-syncs and shows emotion, no eyes).
// Origin at the feet, facing +z, ~1.75 m tall. Arms are two-joint chains so poses stay readable.

const lathe = (pts: [number, number][], seg = 64, folds = 0) => {
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, Math.PI, Math.PI * 2);
  if (folds) {
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const r = Math.hypot(x, z);
      if (r < 0.01) continue;
      const a = Math.atan2(z, x), k = Math.max(0, 1 - y / 0.95);
      const nr = r * (1 + folds * k * Math.sin(a * 9) + folds * 0.6 * k * Math.sin(a * 4 + 1));
      pos.setX(i, (x / r) * nr);
      pos.setZ(i, (z / r) * nr);
    }
  }
  return smooth(g);
};
const ROBE = lathe([[0.001, 0], [0.335, 0], [0.346, 0.03], [0.33, 0.25], [0.3, 0.6], [0.272, 0.88], [0.256, 1.02], [0.268, 1.18], [0.282, 1.3], [0.28, 1.38], [0.24, 1.445], [0.14, 1.49], [0.055, 1.515], [0.001, 1.52]], 72, 0.03);
const SLEEVE_U = lathe([[0.001, -0.31], [0.08, -0.3], [0.084, -0.04], [0.078, 0], [0.001, 0.01]], 28);
const SLEEVE_L = lathe([[0.001, -0.285], [0.07, -0.28], [0.118, -0.27], [0.092, -0.12], [0.076, 0.01], [0.001, 0.015]], 28);
const BEARD_L = lathe([[0.001, -0.36], [0.03, -0.32], [0.07, -0.2], [0.098, -0.07], [0.104, 0], [0.085, 0.035], [0.001, 0.04]], 32);
// headscarf: open at the front (phi 0 = +z) so the face and mouth show
const SCARF = smooth(new THREE.LatheGeometry([[0.06, -0.24], [0.2, -0.2], [0.205, -0.16], [0.17, -0.06], [0.152, 0.06], [0.147, 0.16], [0.11, 0.24], [0.001, 0.27]].map(([r, y]) => new THREE.Vector2(r, y)), 48, 0.85, Math.PI * 2 - 1.7));

export type Look = { robe: string; sash?: string; turban?: string; scarf?: string; skin: string; beard?: "long" | "short"; beardColor?: string; s?: number };
/** arm: [forward raise (rad, + = forward), out (rad, + = away from body), elbow bend forward (rad), elbow fold upward (rad, optional)] */
export type Arm = [number, number, number] | [number, number, number, number];
export type Pose = { L?: Arm; R?: Arm; lean?: number; head?: number; headY?: number; walk?: number; bob?: number };
export type MouthShape = "line" | "o" | "wide";

const ArmChain: React.FC<{ side: 1 | -1; a: Arm; look: Look; ink: number }> = ({ side, a, look, ink: ink0 }) => { const ink = ink0 * 0.55; return (
  <group position={[0.3 * side, 1.39, 0]} rotation={[0, 0, a[1] * side]}>
    <group rotation={[-a[0], 0, 0]}>
      <TM geo={SLEEVE_U} color={look.robe} ink={ink} />
      <group position={[0, -0.29, 0]} rotation={[-a[2], 0, (a[3] ?? 0) * side]}>
        <TM geo={SLEEVE_L} color={look.robe} ink={ink} />
        <TM geo={G.sphere} color={look.skin} ink={ink} p={[0, -0.3, 0.005]} s={[0.034, 0.046, 0.028]} emissive={look.skin} ei={0.12} />
      </group>
    </group>
  </group>
); };

const Mouth: React.FC<{ open: number; shape: MouthShape; z: number; y: number }> = ({ open, shape, z, y }) => {
  const o = Math.max(0, Math.min(1, open));
  const w = shape === "o" ? 0.021 + 0.007 * o : shape === "wide" ? 0.04 : 0.034;
  const h = shape === "o" ? 0.016 + 0.022 * o : 0.005 + 0.036 * o;
  return (
    <group position={[0, y, z]}>
      <FM geo={G.disc} color="#8a4a3a" s={[w + 0.004, h + 0.004, 1]} />
      <FM geo={G.disc} color={o > 0.05 || shape === "o" ? "#240907" : "#4a1c15"} p={[0, 0, 0.0005]} s={[w, h, 1]} />
      {o > 0.3 ? <FM geo={G.disc} color="#b0403a" p={[0, -h * 0.45, 0.001]} s={[w * 0.55, h * 0.35, 1]} /> : null}
    </group>
  );
};

export const Person: React.FC<{ look: Look; pose?: Pose; p?: V3; ry?: number; mouth?: number; shape?: MouthShape; ink?: number; noMouth?: boolean }> = ({ look, pose = {}, p = [0, 0, 0], ry = 0, mouth = 0, shape = "line", ink = 0.011, noMouth }) => {
  const L: Arm = pose.L ?? [0.08, 0.12, 0.15], R: Arm = pose.R ?? [0.08, 0.12, 0.15];
  const walk = pose.walk ?? 0, moving = pose.walk !== undefined;
  const bob = (pose.bob ?? 0) + (moving ? 0.018 * Math.abs(Math.sin(walk)) : 0);
  const sway = moving ? 0.03 * Math.sin(walk) : 0;
  const fz = (k: number) => (moving ? 0.12 * Math.sin(walk + k * Math.PI) : 0);
  return (
    <group position={p} rotation={[0, ry, 0]} scale={look.s ?? 1}>
      {/* feet peek out under the hem */}
      <TM geo={G.sphere} color="#2a1a10" p={[0.1, 0.03, 0.19 + fz(0)]} s={[0.055, 0.035, 0.1]} ink={ink} />
      <TM geo={G.sphere} color="#2a1a10" p={[-0.1, 0.03, 0.19 + fz(1)]} s={[0.055, 0.035, 0.1]} ink={ink} />
      <group position={[0, bob, 0]} rotation={[-(pose.lean ?? 0), 0, sway]}>
        <group scale={[1.15, 1, 0.8]}>
          <TM geo={ROBE} color={look.robe} ink={ink / 1.0} />
          {look.sash ? <TM geo={G.ring} color={look.sash} p={[0, 1.03, 0]} r={[Math.PI / 2, 0, 0]} s={[0.252, 0.252, 0.45]} ink={ink} /> : null}
        </group>
        <ArmChain side={1} a={L} look={look} ink={ink} />
        <ArmChain side={-1} a={R} look={look} ink={ink} />
        {/* neck + head */}
        <group position={[0, 1.5, 0]} rotation={[-(pose.head ?? 0), pose.headY ?? 0, 0]}>
          <TM geo={G.cyl} color={look.skin} p={[0, 0.04, 0]} s={[0.05, 0.1, 0.05]} ink={ink} />
          <group position={[0, 0.17, 0]}>
            <TM geo={G.sphere} color={look.skin} s={[0.112, 0.132, 0.12]} ink={ink} emissive={look.skin} ei={0.16} />
            {look.beard === "long" ? <TM geo={BEARD_L} color={look.beardColor ?? "#eeeae0"} p={[0, -0.07, 0.045]} s={[1, 1, 0.62]} ink={ink} /> : null}
            {look.beard === "short" ? <TM geo={G.sphere} color={look.beardColor ?? "#2e2016"} p={[0, -0.088, 0.026]} s={[0.1, 0.062, 0.092]} ink={ink} /> : null}
            {look.turban ? (
              <group position={[0, 0.06, -0.005]}>
                <TM geo={G.torus} color={look.turban} r={[Math.PI / 2 + 0.12, 0, 0]} s={[0.104, 0.104, 0.12]} ink={ink} />
                <TM geo={G.torus} color={look.turban} p={[0, 0.05, -0.01]} r={[Math.PI / 2 - 0.1, 0.2, 0]} s={[0.088, 0.088, 0.1]} ink={ink} />
                <TM geo={G.sphere} color={look.turban} p={[0, 0.07, -0.01]} s={[0.098, 0.075, 0.1]} ink={ink} />
              </group>
            ) : null}
            {look.scarf ? <TM geo={SCARF} color={look.scarf} p={[0, -0.02, -0.03]} s={[1, 1, 0.98]} ink={ink} double /> : null}
            {noMouth ? null : <Mouth open={mouth} shape={shape} z={look.beard === "short" ? 0.121 : 0.113} y={look.beard === "short" ? -0.07 : -0.052} />}
          </group>
        </group>
      </group>
    </group>
  );
};

/** the dead old man lying on his back across the doorstep (feet at p, head toward +x when ry = -PI/2) */
export const Lying: React.FC<{ look: Look; p: V3; ry: number }> = ({ look, p, ry }) => (
  <group position={p} rotation={[0, ry, 0]}>
    <group position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <Person look={look} pose={{ L: [0, 0.05, 0.05], R: [0, 0.05, 0.05], head: -0.15 }} mouth={0} />
    </group>
  </group>
);
