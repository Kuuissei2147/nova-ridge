import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { terrainHeight } from './Mountain';

// 3本のコースを山肌の上のチューブとして描く。
// 普段は不透明度 0 で見えず、対応するコース名がアクティブになると発光する。
// パスは Experiences.tsx のコース一覧とインデックスで対応(0=WHITE LINE, 1=NOVA RUN, 2=BLACK VOID)。

interface RouteDef {
  color: string;
  // t(0〜1)→ プレーン座標。地形の高さ関数で山肌に沿わせる
  point: (t: number) => { x: number; y: number };
}

const ROUTE_DEFS: RouteDef[] = [
  {
    // WHITE LINE:左前方へ、広く緩やかな大回り
    color: '#d7e8ff',
    point: (t) => ({
      x: 0.5 - t * 9 + Math.sin(t * Math.PI * 3) * 1.8 * (0.4 + t),
      y: 2.2 - t * 8.5,
    }),
  },
  {
    // NOVA RUN:山頂から右中央へ、鋭い直線的なライン
    color: '#9fc4ff',
    point: (t) => ({
      x: 0.2 + t * 4.8 + Math.sin(t * Math.PI * 2) * 0.7,
      y: 2.6 - t * 9,
    }),
  },
  {
    // BLACK VOID:右肩の暗部へ沈んでいくライン
    color: '#8b7bff',
    point: (t) => ({
      x: 1 + t * 7.5 - Math.sin(t * Math.PI * 2.5) * 0.9,
      y: 2.2 - t * 5.5,
    }),
  },
];

interface RoutesProps {
  activeRoute: number | null;
}

export default function Routes({ activeRoute }: RoutesProps) {
  const geometries = useMemo(
    () =>
      ROUTE_DEFS.map((def) => {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= 40; i++) {
          const t = i / 40;
          const { x, y } = def.point(t);
          points.push(new THREE.Vector3(x, terrainHeight(x, y) + 0.12, -y));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        return new THREE.TubeGeometry(curve, 80, 0.07, 5, false);
      }),
    [],
  );

  const materials = useMemo(
    () =>
      ROUTE_DEFS.map(
        (def) =>
          new THREE.MeshBasicMaterial({
            color: def.color,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
      ),
    [],
  );

  // アクティブなルートだけ滑らかに光らせる(フレームレート非依存の減衰)
  useFrame((_, delta) => {
    materials.forEach((mat, i) => {
      const target = activeRoute === i ? 0.9 : 0;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, target, 6, delta);
    });
  });

  return (
    <>
      {geometries.map((geo, i) => (
        <mesh key={ROUTE_DEFS[i].color} geometry={geo} material={materials[i]} />
      ))}
    </>
  );
}
