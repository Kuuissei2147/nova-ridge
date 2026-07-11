import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COURSES, pointOnCourse } from '../data/courses';

// 3本のコースを山肌の上のチューブとして描く。
// 普段は不透明度 0 で見えず、対応するコース名がアクティブになると発光する。
// コースの形状・色は src/data/courses.ts に一元化されている。

interface RoutesProps {
  activeRoute: number | null;
}

export default function Routes({ activeRoute }: RoutesProps) {
  const geometries = useMemo(
    () =>
      COURSES.map((course) => {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= 40; i++) {
          points.push(pointOnCourse(course, i / 40, new THREE.Vector3()));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        return new THREE.TubeGeometry(curve, 80, 0.07, 5, false);
      }),
    [],
  );

  const materials = useMemo(
    () =>
      COURSES.map(
        (course) =>
          new THREE.MeshBasicMaterial({
            color: course.color,
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
        <mesh key={COURSES[i].name} geometry={geo} material={materials[i]} />
      ))}
    </>
  );
}
