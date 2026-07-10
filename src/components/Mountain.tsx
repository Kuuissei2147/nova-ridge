import { useMemo } from 'react';
import * as THREE from 'three';

// Deterministic pseudo-random hash — same mountain on every load.
function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

// Smooth value noise built on the hash.
function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

// Fractal noise: several octaves layered for ridged detail.
function fbm(x: number, y: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < 4; i++) {
    value += amplitude * valueNoise(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

// A simple cone: height at the tip, fading to 0 at the given radius.
function peak(x: number, y: number, px: number, py: number, height: number, radius: number): number {
  const d = Math.hypot(x - px, y - py);
  return Math.max(0, height * (1 - d / radius));
}

// 地形の高さ関数。ジオメトリ生成と、斜面を滑るスキーヤーのパス計算の両方で使う。
// (x, y はプレーン座標。ワールド座標では x → X、高さ → Y、-y → Z になる)
export function terrainHeight(x: number, y: number): number {
  let h = peak(x, y, 0, 3, 10, 13);
  h = Math.max(h, peak(x, y, -8.5, -2, 5.5, 9));
  h = Math.max(h, peak(x, y, 9, -1, 4.5, 8));
  h += fbm(x * 0.4 + 7.3, y * 0.4 + 2.1) * (0.5 + h * 0.4);

  // Fade the terrain out toward the edges so it melts into the fog.
  const edge = Math.max(Math.abs(x), Math.abs(y));
  h *= 1 - THREE.MathUtils.smoothstep(edge, 14, 20);
  return h;
}

export default function Mountain() {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(40, 40, 68, 68);
    const pos = plane.attributes.position as THREE.BufferAttribute;

    // Displace each vertex: one main summit, two shoulders, noise on top.
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, terrainHeight(pos.getX(i), pos.getY(i)));
    }

    // Un-index so every triangle gets its own flat normal (the low-poly look).
    const geo = plane.toNonIndexed();
    geo.computeVertexNormals();

    // Color each face by altitude: dark rock low, snow white high.
    const facePos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(facePos.count * 3);
    const rock = new THREE.Color('#1d2f4d');
    const snow = new THREE.Color('#e9f2fb');
    const faceColor = new THREE.Color();

    for (let f = 0; f < facePos.count; f += 3) {
      const avgHeight = (facePos.getZ(f) + facePos.getZ(f + 1) + facePos.getZ(f + 2)) / 3;
      const t = THREE.MathUtils.clamp((avgHeight - 0.3) / 6.5, 0, 1);
      faceColor.copy(rock).lerp(snow, Math.pow(t, 0.65));
      faceColor.offsetHSL(0, 0, (hash(f, 1) - 0.5) * 0.04);
      for (let k = 0; k < 3; k++) {
        colors[(f + k) * 3] = faceColor.r;
        colors[(f + k) * 3 + 1] = faceColor.g;
        colors[(f + k) * 3 + 2] = faceColor.b;
      }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial vertexColors flatShading roughness={0.95} metalness={0} />
    </mesh>
  );
}
