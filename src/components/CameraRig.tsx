import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';

import { COURSES } from '../data/courses';

interface CameraRigProps {
  scrollProgress: MotionValue<number>;
  activeRoute: number | null;
}

// カメラと大気(フォグ)をスクロールで演出する:
//  - マウス位置 → わずかなパララックス
//  - スクロール → 山の麓へと前進・下降し、視線は山頂を見上げていく
//  - 進むほどフォグが濃くなり、「未知の中へ入る」感覚をつくる
export default function CameraRig({ scrollProgress, activeRoute }: CameraRigProps) {
  const mouse = useRef({ x: 0, y: 0 });
  // スクロール値を減衰させて保持(急なスクロールでもカメラが滑らかに追従する)
  const smoothScroll = useRef(0);
  // 視線の先。lookAt を直接切り替えると視点が跳ぶので、こちらも減衰させる
  const lookTarget = useRef(new THREE.Vector3(0, 4.6, 0));

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame(({ camera, scene }, delta) => {
    // フレームレート非依存の減衰係数(30fpsでも120fpsでも同じ手応え)
    const k = 1 - Math.exp(-3 * delta);

    smoothScroll.current += (scrollProgress.get() - smoothScroll.current) * k;
    const s = smoothScroll.current;

    // アクティブなコースがあれば、その方向へわずかに寄る
    const focusX = activeRoute !== null ? COURSES[activeRoute].focusX : 0;

    // 接近:z 26 → 10、y 4.5 → 2.7(麓に降り立つ)
    const targetX = mouse.current.x * 1.4 * (1 - s * 0.5) + focusX * 0.45;
    const targetY = 4.5 - mouse.current.y * 0.6 - s * 1.8;
    const targetZ = 26 - s * 16 - (activeRoute !== null ? 1.8 : 0);

    camera.position.x += (targetX - camera.position.x) * k;
    camera.position.y += (targetY - camera.position.y) * k;
    camera.position.z += (targetZ - camera.position.z) * k;
    // 近づくほど視線が山頂へ上がる。コース選択中はその方向へ視線を振る
    lookTarget.current.x += (focusX * 0.5 - lookTarget.current.x) * k;
    lookTarget.current.y = 4.6 + s * 2.2;
    camera.lookAt(lookTarget.current);

    // フォグを徐々に濃くする:near 14 → 6、far 48 → 28
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.near = 14 - s * 8;
      fog.far = 48 - s * 20;
    }
  });

  return null;
}
