import React from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Cel-shading kit for the 3D anime test: hard 3-band toon ramp + inverted-hull ink outlines.
export type V3 = [number, number, number];

let GRAD: THREE.DataTexture | null = null;
/** 3 hard bands: deep shadow, mid, lit — the "anime" look */
export const grad = () => {
  if (!GRAD) {
    const d = new Uint8Array([78, 78, 78, 255, 158, 158, 158, 255, 255, 255, 255, 255]);
    GRAD = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
    GRAD.minFilter = THREE.NearestFilter;
    GRAD.magFilter = THREE.NearestFilter;
    GRAD.generateMipmaps = false;
    GRAD.needsUpdate = true;
  }
  return GRAD;
};

const OUT = new Map<string, THREE.ShaderMaterial>();
/** ink outline: the mesh drawn again, pushed out along its normals, back faces only */
export const inkMat = (t: number, color = "#0a0505") => {
  const k = `${t}|${color}`;
  let m = OUT.get(k);
  if (!m) {
    m = new THREE.ShaderMaterial({
      uniforms: { t: { value: t }, c: { value: new THREE.Color(color) } },
      vertexShader: "uniform float t; void main(){ vec3 p = position + normal * t; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
      fragmentShader: "uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }",
      side: THREE.BackSide,
    });
    OUT.set(k, m);
  }
  return m;
};

/** smooth normals across seams (lathe/sphere seams would otherwise split the outline) */
export const smooth = (g: THREE.BufferGeometry) => {
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  const m = mergeVertices(g, 1e-4);
  m.computeVertexNormals();
  return m;
};

type TMProps = {
  geo: THREE.BufferGeometry; color: string; ink?: number; p?: V3; r?: V3; s?: V3 | number;
  emissive?: string; ei?: number; cast?: boolean; receive?: boolean; opacity?: number; double?: boolean;
};
/** a toon-shaded mesh with an optional ink outline */
export const TM: React.FC<TMProps> = ({ geo, color, ink, p, r, s, emissive, ei, cast = true, receive = true, opacity, double }) => (
  <group position={p} rotation={r} scale={typeof s === "number" ? [s, s, s] : s}>
    <mesh geometry={geo} castShadow={cast} receiveShadow={receive}>
      <meshToonMaterial color={color} gradientMap={grad()} emissive={emissive ?? "#000000"} emissiveIntensity={ei ?? 0} transparent={opacity !== undefined} opacity={opacity ?? 1} side={double ? THREE.DoubleSide : THREE.FrontSide} />
    </mesh>
    {ink ? <mesh geometry={geo} material={inkMat(ink)} /> : null}
  </group>
);

/** flat-colour mesh (mouths, glows): not lit */
export const FM: React.FC<{ geo: THREE.BufferGeometry; color: string; p?: V3; r?: V3; s?: V3 | number; opacity?: number; additive?: boolean }> = ({ geo, color, p, r, s, opacity, additive }) => (
  <mesh geometry={geo} position={p} rotation={r} scale={typeof s === "number" ? [s, s, s] : s}>
    <meshBasicMaterial color={color} transparent={opacity !== undefined || additive} opacity={opacity ?? 1} blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending} depthWrite={!additive} polygonOffset polygonOffsetFactor={-4} fog={!additive} toneMapped={false} />
  </mesh>
);

// shared geometries
export const G = {
  sphere: smooth(new THREE.SphereGeometry(1, 40, 28)),
  disc: new THREE.CircleGeometry(1, 40),
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: smooth(new THREE.CylinderGeometry(1, 1, 1, 28, 1, false)),
  torus: smooth(new THREE.TorusGeometry(1, 0.42, 18, 44)),
  ring: smooth(new THREE.TorusGeometry(1, 0.085, 12, 56)),
};
