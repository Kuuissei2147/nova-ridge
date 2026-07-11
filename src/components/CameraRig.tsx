import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import { COURSES, pointOnCourse } from '../data/courses';
import { terrainHeight } from './Mountain';

interface CameraRigProps {
  scrollProgress: MotionValue<number>;
  activeRoute: number | null;
  flyover: number | null;
  onFlyoverEnd: () => void;
}

const FLYOVER_DURATION = 16; // 滑空1本ぶんの秒数

// カメラと大気(フォグ)の演出中枢:
//  - 通常:スクロールで山へ接近 + マウスパララックス + コースへの寄り
//  - FIRST TRACKS:選んだコースの滑走ラインに沿って滑空する
export default function CameraRig({
  scrollProgress,
  activeRoute,
  flyover,
  onFlyoverEnd,
}: CameraRigProps) {
  const mouse = useRef({ x: 0, y: 0 });
  // スクロール値を減衰させて保持(急なスクロールでもカメラが滑らかに追従する)
  const smoothScroll = useRef(0);
  // 視線の先。lookAt を直接切り替えると視点が跳ぶので、こちらも減衰させる
  const lookTarget = useRef(new THREE.Vector3(0, 4.6, 0));
  // 滑空の進捗(0〜1)
  const flyProgress = useRef(0);
  const prevFlyover = useRef<number | null>(null);
  const reduced = useRef(false);

  // 毎フレームの new を避けるための作業用ベクタ
  const posA = useRef(new THREE.Vector3()).current;
  const posB = useRef(new THREE.Vector3()).current;
  const camTarget = useRef(new THREE.Vector3()).current;
  const dir = useRef(new THREE.Vector3()).current;
  const side = useRef(new THREE.Vector3()).current;
  const UP = useRef(new THREE.Vector3(0, 1, 0)).current;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // reduced-motion:滑空せず、ルート中腹の定点から眺める
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = mq.matches;
    const onChange = () => {
      reduced.current = mq.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useFrame(({ camera, scene }, delta) => {
    // フレームレート非依存の減衰係数(30fpsでも120fpsでも同じ手応え)
    const k = 1 - Math.exp(-3 * delta);
    const fog = scene.fog as THREE.Fog | null;

    // --- FIRST TRACKS:コースに沿った滑空 ---
    if (flyover !== null) {
      const course = COURSES[flyover];
      if (prevFlyover.current !== flyover) {
        flyProgress.current = 0;
        prevFlyover.current = flyover;
      }
      if (reduced.current) {
        flyProgress.current = 0.45; // 定点鑑賞(自動では動かない・終わらない)
      } else {
        // delta をクランプ:タブ切替などの巨大なフレーム間隔で滑空が飛ばないように
        flyProgress.current = Math.min(
          1,
          flyProgress.current + Math.min(delta, 0.05) / FLYOVER_DURATION,
        );
      }
      const t = flyProgress.current;

      pointOnCourse(course, t, posA);
      pointOnCourse(course, Math.min(1, t + 0.06), posB);

      // 進行方向の「後ろ・横・上」にカメラを置き、少し先のラインを見る。
      // 横にずらすことで、ラインが画面を斜めに流れる映画的アングルになる
      dir.copy(posB).sub(posA).normalize();
      side.copy(dir).cross(UP).normalize();
      camTarget.copy(posA).addScaledVector(dir, -2.8).addScaledVector(side, 1.7);
      camTarget.y = posA.y + 1.8;
      // 地形へのめり込み防止(ワールド z → プレーン y は符号反転)
      camTarget.y = Math.max(camTarget.y, terrainHeight(camTarget.x, -camTarget.z) + 1.0);

      const kf = 1 - Math.exp(-2.2 * delta);
      camera.position.lerp(camTarget, kf);
      lookTarget.current.lerp(posB, kf);
      camera.lookAt(lookTarget.current);

      // 滑空中は霧を少し晴らして、ラインの先まで見せる
      if (fog) {
        fog.near += (10 - fog.near) * k;
        fog.far += (60 - fog.far) * k;
      }

      if (!reduced.current && flyProgress.current >= 1) onFlyoverEnd();
      return;
    }
    prevFlyover.current = null;

    // --- 通常:スクロール接近 + マウスパララックス ---
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
    lookTarget.current.y += (4.6 + s * 2.2 - lookTarget.current.y) * k;
    lookTarget.current.z += (0 - lookTarget.current.z) * k;
    camera.lookAt(lookTarget.current);

    // フォグを徐々に濃くする:near 14 → 6、far 48 → 28
    if (fog) {
      fog.near += (14 - s * 8 - fog.near) * k;
      fog.far += (48 - s * 20 - fog.far) * k;
    }
  });

  return null;
}
