import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Snow() {
  const pointsRef = useRef<THREE.Points>(null);

  // Fewer particles on small screens to keep mobile smooth.
  const count = useMemo(() => (window.innerWidth < 768 ? 450 : 1100), []);

  const { geometry, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speedArr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = Math.random() * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 + 4;
      speedArr[i] = 0.6 + Math.random() * 1.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { geometry: geo, speeds: speedArr };
  }, [count]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    const pos = points.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) - speeds[i] * delta;
      if (y < -0.5) y = 15.5; // recycle flakes back to the top
      pos.setY(i, y);
      // Gentle horizontal drift, phase-shifted per flake.
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.6 + i) * delta * 0.25);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.07}
        color="#ffffff"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
