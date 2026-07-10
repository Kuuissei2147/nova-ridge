import { useMemo } from 'react';
import * as THREE from 'three';

// メインの山の背後に置く遠景の山脈。
// フォグに沈むシルエットとして、シーンに奥行きを与える。
function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

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

export default function DistantRidge() {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(140, 40, 64, 18);
    const pos = plane.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // なだらかな連峰:大きなうねり + 細かいギザギザ
      let h = valueNoise(x * 0.08 + 21, y * 0.1 + 8) * 11;
      h += valueNoise(x * 0.3 + 4, y * 0.3 + 15) * 3.5;
      // 手前側(カメラ寄り)は低く抑えてメインの山を邪魔しない
      h *= THREE.MathUtils.smoothstep(-y, -18, 2);
      pos.setZ(i, h);
    }

    const geo = plane.toNonIndexed();
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -34]}>
      <meshStandardMaterial color="#16233c" flatShading roughness={1} metalness={0} />
    </mesh>
  );
}
