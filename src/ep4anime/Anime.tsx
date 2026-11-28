import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import V from "../ep4/vo.json";
import { Captions, Pinned, Watermark, MovingMark } from "../ep4/Episode";
import { G, TM, FM, V3 } from "./toon";
import { Person, Lying, Look, Pose } from "./Person";

// Episode 4, first 15 seconds, as a dark cinematic 3D anime (owner's picks: dark cinematic look, mouth only / no eyes,
// smash zooms, 9:16). Same narration, captions, pinned question and logo as the finished episode.
export const ANIME_LEN = 450;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const iv = (f: number, a: number[], b: number[], e?: (t: number) => number) => interpolate(f, a, b, { ...clamp, easing: e });

// ───────── cast (main characters distinct; crowd muted) ─────────
const SKIN = "#c8996f";
const MAN: Look = { robe: "#5d6638", sash: "#3b2a18", turban: "#cbb88e", skin: SKIN, beard: "short" };
const WIFE: Look = { robe: "#1d2234", scarf: "#2c3248", skin: SKIN, s: 0.94 };
const SON: Look = { robe: "#7a6646", turban: "#d9cba6", skin: SKIN, s: 0.78 };
const NEPHEW: Look = { robe: "#e08a17", sash: "#8a1c12", turban: "#151012", skin: SKIN, beard: "short", beardColor: "#140d0a" };
const OLD: Look = { robe: "#55284e", turban: "#ece5d6", skin: "#c29470", beard: "long" };
const CROWD: Look[] = ["#3a2d23", "#463627", "#2f2924", "#3d3128", "#4a3b2d"].map((robe, i) => ({ robe, turban: ["#5b4a39", "#4b3c2f", "#655341"][i % 3], skin: "#8a6a50", s: 0.96 + (i % 2) * 0.05 }));

/** lip-sync from the recorded voice (same envelope the 2D episode uses) */
const mouthOf = (id: "NE1" | "NE2", f: number) => {
  const env = (V as unknown as { mouth: Record<string, number[]> }).mouth[id]; const l = V.lines[id];
  const i = f - l.f0;
  if (!env || i < 0 || i >= env.length) return 0;
  const v = Math.max(0, Math.min(1, ((env[i] * 0.65 + (env[i - 1] ?? env[i]) * 0.35) - 0.1) * 1.3));
  return v * (0.5 + 0.5 * Math.abs(Math.sin(i * 0.62)));
};
const mix = (a: Pose, b: Pose, t: number): Pose => {
  const m = (x?: number, y?: number) => (x ?? 0) + ((y ?? 0) - (x ?? 0)) * t;
  const arm = (x: number[] = [0.08, 0.12, 0.15], y: number[] = [0.08, 0.12, 0.15]) => [m(x[0], y[0]), m(x[1], y[1]), m(x[2], y[2]), m(x[3], y[3])] as [number, number, number, number];
  return { L: arm(a.L, b.L), R: arm(a.R, b.R), lean: m(a.lean, b.lean), head: m(a.head, b.head), headY: m(a.headY, b.headY) };
};
const ease = Easing.inOut(Easing.cubic);

// ───────── camera: keyframed shots, smash zooms snap in over 5 frames with a decaying shake ─────────
type Key = { f: number; pos: V3; look: V3; fov: number; smash?: boolean };
const SHOTS: Key[][] = [
  // S1 "A man opens his door…" — street level on the closed door, light cracks open
  [{ f: 0, pos: [0.1, 1.35, 5.4], look: [0, 1.15, 0], fov: 58 }, { f: 48, pos: [0.05, 1.3, 4.2], look: [0, 1.0, 0.4], fov: 56 }],
  // S2 "…and there's a dead body on his doorstep." — straight down from above: the body across the frame, the man frozen in the doorway; lens smash on "dead"
  [{ f: 48, pos: [0.05, 4.1, 2.5], look: [0.0, 0.2, 0.95], fov: 64 }, { f: 55, pos: [0.05, 4.08, 2.48], look: [0.0, 0.2, 0.95], fov: 63 },
   { f: 60, pos: [0.05, 4.05, 2.46], look: [0.03, 0.2, 0.95], fov: 53, smash: true }, { f: 106, pos: [0.05, 3.95, 2.4], look: [0.03, 0.2, 0.95], fov: 50 }],
  // S3a "And now his family is accused…" — low, behind the gathering crowd
  [{ f: 106, pos: [0.4, 0.85, 7.2], look: [0, 1.25, 0], fov: 60 }, { f: 160, pos: [0.25, 0.95, 6.1], look: [0, 1.3, 0], fov: 58 }],
  // S3b "…of murder." — the family on the step, the body at their feet
  [{ f: 160, pos: [-0.3, 1.45, 3.4], look: [0.05, 1.2, 0.3], fov: 52 }, { f: 203, pos: [-0.2, 1.42, 2.8], look: [0.05, 1.2, 0.3], fov: 50 }],
  // S4 "The dead man's nephew is screaming for justice." — low angle, slow orbit, backlit by the doorway
  [{ f: 203, pos: [3.0, 0.55, 3.6], look: [1.45, 1.5, 1.35], fov: 64 }, { f: 284, pos: [2.2, 0.6, 3.95], look: [1.45, 1.55, 1.35], fov: 62 }],
  // S5a "My uncle!" — three-quarter on his face, lens smash
  [{ f: 284, pos: [-0.44, 1.74, 1.9], look: [1.5, 1.62, 1.38], fov: 56 }, { f: 290, pos: [-0.44, 1.74, 1.9], look: [1.5, 1.72, 1.38], fov: 26, smash: true }, { f: 334, pos: [-0.42, 1.74, 1.88], look: [1.5, 1.73, 1.38], fov: 23 }],
  // S5b "You killed my uncle!" — over his shoulder down the pointing arm, lens smash onto the accused man
  [{ f: 334, pos: [2.25, 1.95, 1.62], look: [0.1, 1.45, 0.2], fov: 60 }, { f: 340, pos: [2.25, 1.95, 1.62], look: [0.1, 1.72, 0.2], fov: 22, smash: true }, { f: 383, pos: [2.25, 1.95, 1.62], look: [0.1, 1.73, 0.2], fov: 20 }],
  // S6 "Pay me his blood money!" — low from the step, the body in the foreground, the nephew towering over it
  [{ f: 383, pos: [0.6, 0.5, 0.76], look: [1.4, 1.4, 1.36], fov: 66 }, { f: 450, pos: [0.64, 0.55, 0.8], look: [1.4, 1.48, 1.3], fov: 58 }],
];
const camAt = (f: number) => {
  const shot = [...SHOTS].reverse().find((s) => f >= s[0].f) ?? SHOTS[0];
  let k = 0;
  while (k < shot.length - 2 && f >= shot[k + 1].f) k++;
  const a = shot[k], b = shot[k + 1] ?? a;
  const t = b === a ? 0 : Math.max(0, Math.min(1, (f - a.f) / (b.f - a.f)));
  const e = b.smash ? Easing.out(Easing.exp)(t) : ease(t);
  const L = (x: V3, y: V3): V3 => [x[0] + (y[0] - x[0]) * e, x[1] + (y[1] - x[1]) * e, x[2] + (y[2] - x[2]) * e];
  let pos = L(a.pos, b.pos);
  const look = L(a.look, b.look);
  const fov = a.fov + (b.fov - a.fov) * e;
  // shake after a smash zoom
  const sm = shot.find((x) => x.smash);
  if (sm && f >= sm.f) {
    const d = Math.exp(-(f - sm.f) / 5) * 0.03;
    pos = [pos[0] + Math.sin(f * 2.7) * d, pos[1] + Math.cos(f * 3.1) * d, pos[2]];
  }
  return { pos, look, fov };
};
const Cam: React.FC = () => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  const { pos, look, fov } = camAt(f);
  c.position.set(...pos);
  c.lookAt(...look);
  if (Math.abs(c.fov - fov) > 1e-3) { c.fov = fov; c.updateProjectionMatrix(); }
  return null;
};

// ───────── set: a mud-brick house at dawn, the door, the street ─────────
const MUD = "#9c7a54", MUD2 = "#8a6a48", WOOD = "#4a2f1c";
const Box: React.FC<{ p: V3; s: V3; c: string; r?: V3; e?: string; ei?: number }> = ({ p, s, c, r, e, ei }) => <TM geo={G.box} color={c} p={p} s={s} r={r} emissive={e} ei={ei} />;
const House: React.FC<{ open: number }> = ({ open }) => (
  <group>
    {/* front wall with the doorway (1.0 × 2.0) */}
    <Box p={[-1.6, 1.55, -0.18]} s={[2.2, 3.1, 0.36]} c={MUD} />
    <Box p={[1.6, 1.55, -0.18]} s={[2.2, 3.1, 0.36]} c={MUD} />
    <Box p={[0, 2.55, -0.18]} s={[1.0, 1.1, 0.36]} c={MUD} />
    <Box p={[0, 2.06, 0.02]} s={[1.3, 0.12, 0.12]} c={WOOD} />
    {/* roof beams poking out, parapet */}
    {[-2.3, -1.5, -0.7, 0.7, 1.5, 2.3].map((x) => <TM key={x} geo={G.cyl} color={WOOD} p={[x, 2.85, 0.05]} r={[Math.PI / 2, 0, 0]} s={[0.06, 0.5, 0.06]} />)}
    <Box p={[0, 3.18, -0.18]} s={[5.4, 0.18, 0.4]} c={MUD2} />
    {/* doorstep */}
    <Box p={[0, 0.06, 0.25]} s={[1.5, 0.12, 0.5]} c="#6e655a" />
    {/* wooden door, hinged on the left, opening inward */}
    <group position={[-0.5, 0, -0.08]} rotation={[0, open * 1.55, 0]}>
      {[0.12, 0.36, 0.61, 0.86].map((x) => <Box key={x} p={[x, 1.0, 0]} s={[0.235, 1.98, 0.06]} c={WOOD} />)}
      {[0.5, 1.5].map((y) => <Box key={y} p={[0.5, y, 0.04]} s={[0.96, 0.08, 0.03]} c="#2e1d12" />)}
    </group>
    {/* the warm room inside */}
    <Box p={[0, 1.4, -3.0]} s={[3.0, 2.8, 0.1]} c="#7a4a24" e="#ff9a48" ei={0.55 * open + 0.05} />
    <Box p={[-1.5, 1.4, -1.6]} s={[0.1, 2.8, 2.8]} c="#6b4020" e="#ff8a3a" ei={0.25 * open} />
    <Box p={[1.5, 1.4, -1.6]} s={[0.1, 2.8, 2.8]} c="#6b4020" e="#ff8a3a" ei={0.25 * open} />
    <Box p={[0, 0.06, -1.6]} s={[3.0, 0.12, 2.8]} c="#5a3a22" />
    <Box p={[0, 2.85, -1.6]} s={[3.0, 0.1, 2.8]} c="#3a2414" />
    {/* oil lamp in a niche */}
    <FM geo={G.sphere} color="#ffd27a" p={[0.9, 1.7, -2.9]} s={0.05} />
    {/* neighbours and the street */}
    <Box p={[-4.4, 1.3, -0.6]} s={[3.2, 2.6, 0.4]} c={MUD2} />
    <Box p={[4.4, 1.45, -0.4]} s={[3.2, 2.9, 0.4]} c="#94744f" />
    <Box p={[-3.8, 1.2, -0.37]} s={[0.4, 0.5, 0.02]} c="#120c08" />
    <Box p={[4.0, 1.5, -0.17]} s={[0.45, 0.55, 0.02]} c="#120c08" />
    {[-5, -1.6, 2.2, 5.6].map((x, i) => <Box key={x} p={[x, 1.4 + (i % 2) * 0.3, 9]} s={[3.2, 2.8 + (i % 2) * 0.6, 0.4]} c={i % 2 ? MUD2 : MUD} />)}
    {/* jar and stones */}
    <TM geo={G.sphere} color="#7a4e2e" p={[-1.05, 0.28, 0.35]} s={[0.2, 0.28, 0.2]} ink={0.008} />
    {[[-2.2, 1.8], [2.6, 2.4], [-1.4, 3.6], [1.2, 4.8]].map(([x, z], i) => <TM key={i} geo={G.sphere} color="#5a4936" p={[x, 0.02, z]} s={[0.16, 0.06, 0.12]} />)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshToonMaterial color="#4c3c2d" />
    </mesh>
  </group>
);

// soft radial glow texture for additive light cards
let GLOW: THREE.CanvasTexture | null = null;
const glowTex = () => {
  if (!GLOW) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d")!; const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,0.45)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 256, 256); GLOW = new THREE.CanvasTexture(c);
  }
  return GLOW;
};
const Glow: React.FC<{ p: V3; s: [number, number]; c: string; o: number; r?: V3 }> = ({ p, s, c, o, r }) => (
  <mesh position={p} rotation={r} scale={[s[0], s[1], 1]} renderOrder={10}>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial map={glowTex()} color={c} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
  </mesh>
);
const Glows: React.FC = () => {
  const f = useCurrentFrame();
  const open = iv(f, [6, 34], [0, 1], Easing.out(Easing.cubic));
  const flick = 1 + 0.05 * Math.sin(f * 0.9) + 0.03 * Math.sin(f * 2.3);
  return (
    <group>
      {/* light pouring out of the doorway */}
      <Glow p={[0, 1.05, 0.02]} s={[1.9, 2.9]} c="#ffa24a" o={0.75 * open * flick} />
      <Glow p={[0, 1.2, 0.04]} s={[4.2, 4.6]} c="#ff7a2a" o={0.28 * open * flick} />
      {/* the pool of light on the ground and over the body */}
      <Glow p={[0.1, 0.015, 1.25]} s={[2.6, 3.4]} c="#ff9a48" o={0.38 * open * flick} r={[-Math.PI / 2, 0, 0]} />
      {/* the oil lamp */}
      <Glow p={[0.9, 1.7, -2.85]} s={[0.7, 0.7]} c="#ffc070" o={0.9 * flick} />
      {/* dawn glow low over the far roofs */}
      <Glow p={[0, 2.6, 11]} s={[22, 6]} c="#ff7040" o={0.35} r={[0, Math.PI, 0]} />
    </group>
  );
};

// ───────── the action ─────────
const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const open = iv(f, [6, 34], [0, 1], Easing.out(Easing.cubic));
  // the man walks out to the step, sees the body, recoils; later turns to face the nephew
  const manZ = iv(f, [8, 40], [-1.1, 0.2], ease);
  const walking = f >= 8 && f < 40;
  const recoil = iv(f, [58, 68], [0, 1], Easing.out(Easing.back(1.6)));
  const accused = iv(f, [336, 346], [0, 1], Easing.out(Easing.back(1.4)));
  let manPose = mix({ L: [0.08, 0.12, 0.15], R: [0.08, 0.12, 0.15] }, { L: [0.25, 1.1, 0, 1.75], R: [0.25, 1.1, 0, 1.75], lean: -0.12, head: 0.12 }, recoil);
  manPose = mix(manPose, { L: [0.4, 1.3, 0, 1.95], R: [0.4, 1.3, 0, 1.95], lean: -0.2, head: -0.05 }, accused);
  const manRy = iv(f, [203, 222], [0, 0.78], ease);
  // the family steps up behind him
  const famIn = f >= 106;
  const nTurnFam = iv(f, [205, 225], [0, 1], ease);
  // the nephew: screams at the sky for justice, then turns on the family
  const nIn = f >= 203;
  const turn = iv(f, [280, 292], [0, 1], ease);
  const nRy = 0.6 + (-2.22 - 0.6) * turn;
  const scream: Pose = { L: [0.45, 1.95, 0.75], R: [0.45, 1.95, 0.75], head: 0.38, lean: -0.06 };
  const shout: Pose = { L: [0.35, 0.3, 0.9], R: [0.55, 0.25, 1.1], head: 0.05, lean: 0.08 };
  const point: Pose = { L: [0.2, 0.2, 0.5], R: [1.5, 0.08, 0.04], head: 0.0, lean: 0.12 };
  const demand: Pose = { L: [0.2, 0.2, 0.5], R: [1.25, 0.12, 0.45], head: -0.05, lean: 0.14 };
  let nPose = mix(scream, shout, turn);
  nPose = mix(nPose, point, iv(f, [334, 342], [0, 1], Easing.out(Easing.back(1.5))));
  nPose = mix(nPose, demand, iv(f, [385, 396], [0, 1], ease));
  const nStep = iv(f, [386, 404], [0, 1], ease);
  const nPos: V3 = [1.5 - 0.08 * nStep, 0, 1.38 - 0.1 * nStep];
  const nMouth = f < 284 ? 0.7 + 0.3 * Math.abs(Math.sin(f * 0.21)) : f < 383 ? mouthOf("NE1", f) : mouthOf("NE2", f);
  const crowd = f >= 106 && f < 160;
  return (
    <group>
      <House open={open} />
      {/* the body lies across the doorstep — nobody stands on it */}
      <Lying look={OLD} p={[-0.9, 0, 1.06]} ry={-Math.PI / 2} />
      <Person look={MAN} p={[0.08 * iv(f, [8, 40], [0, 1]), 0.12, manZ]} ry={manRy} pose={{ ...manPose, walk: walking ? f * 0.42 : undefined }} mouth={f >= 60 ? 0.45 + 0.35 * accused : 0} shape={f >= 60 ? "o" : "line"} />
      {famIn ? <Person look={WIFE} p={[-0.7, 0.12, 0.3]} ry={0.15 + 0.35 * nTurnFam} pose={{ L: [0.45, 0.25, 2.0], R: [0.45, 0.25, 2.0], head: 0.12 }} mouth={0.35} shape="o" /> : null}
      {famIn ? <Person look={SON} p={[0.86, 0.12, 0.3]} ry={-0.1 + 0.6 * nTurnFam} pose={{ L: [0.4, 0.15, 0.6], R: [0.7, 0.2, 0.9], head: 0.1 }} mouth={0.3} shape="o" /> : null}
      {nIn ? <Person look={NEPHEW} p={nPos} ry={nRy} pose={{ ...nPose, walk: f >= 386 && f < 404 ? f * 0.42 : undefined }} mouth={nMouth} shape={f < 284 ? "wide" : "line"} /> : null}
      {crowd ? CROWD.map((c, i) => <Person key={i} look={c} p={([[-2.3, 3.2], [-1.35, 3.7], [1.35, 3.6], [2.3, 3.15], [-0.75, 4.6]] as [number, number][]).map(([x, z]) => [x, 0, z] as V3)[i]} ry={Math.PI + (i - 2) * 0.12} noMouth />) : null}
    </group>
  );
};

const Lights: React.FC = () => {
  const f = useCurrentFrame();
  const open = iv(f, [6, 34], [0, 1], Easing.out(Easing.cubic));
  const target = React.useMemo(() => { const o = new THREE.Object3D(); o.position.set(0.2, 0, 1.8); return o; }, []);
  return (
    <>
      <hemisphereLight args={["#3c4c86", "#150f0c", 0.7]} />
      <directionalLight position={[-6, 9, 8]} intensity={0.8} color="#8a9ee0" />
      <directionalLight position={[7, 3, -9]} intensity={1.4} color="#ff8a4a" />
      <primitive object={target} />
      <spotLight position={[0, 2.15, -1.0]} target={target} angle={0.62} penumbra={0.55} intensity={60 * open} distance={10} decay={1.5} color="#ffb565" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <pointLight position={[0, 1.5, -1.4]} intensity={14 * open + 1} distance={6} decay={2} color="#ffa555" />
    </>
  );
};

const Fill: React.FC = () => {
  const { pos } = camAt(useCurrentFrame());
  return <pointLight position={[pos[0], pos[1] + 0.4, pos[2]]} intensity={5} distance={9} decay={1} color="#a9b8ff" />;
};
const World: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#05081a 0%, #0d1430 30%, #1f2244 52%, #4a2f4a 70%, #a5503a 86%, #d9824a 100%)" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, near: 0.05, far: 80 }} gl={{ alpha: true, antialias: true }} shadows flat>
        <fog attach="fog" args={["#13152b", 7, 24]} />
        <Cam />
        <Lights />
        <Fill />
        <Scene />
        <Glows />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** cinematic grade: cold shadows, warm highlights, heavy vignette, moving film grain */
const Grade: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,40,90,0.35) 0%, rgba(0,0,0,0) 45%, rgba(255,120,40,0.18) 100%)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 52%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.85) 100%)" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 97} /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** white flash frame on each smash zoom */
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const at = [60, 290, 340].find((a) => f >= a - 1 && f < a + 5);
  if (at === undefined) return null;
  return <AbsoluteFill style={{ background: "#fff6e6", opacity: interpolate(f, [at - 1, at, at + 5], [0, 0.32, 0], clamp), mixBlendMode: "screen" }} />;
};

export const Ep4Anime: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <World />
    <Grade />
    <Flash />
    <Captions />
    <Pinned />
    <Watermark />
    <MovingMark />
    {/* narration: the finished episode's voice track, faded out before the next line */}
    <Html5Audio src={staticFile("ep4/voice.mp3")} volume={(f) => interpolate(f, [434, 440], [1, 0], clamp)} />
    <Sequence from={4}><Html5Audio src={staticFile("ep4/sfx/door-open.mp3")} volume={0.7} /></Sequence>
    {[56, 286, 336].map((a) => <Sequence key={a} from={a}><Html5Audio src={staticFile("trailer/sfx/short-video-whoosh-01.mp3")} volume={0.32} /></Sequence>)}
    {[48, 106, 160, 203, 383].map((a) => <Sequence key={a} from={a - 3}><Html5Audio src={staticFile("trailer/sfx/short-video-whoosh-01.mp3")} volume={0.12} /></Sequence>)}
  </AbsoluteFill>
);
