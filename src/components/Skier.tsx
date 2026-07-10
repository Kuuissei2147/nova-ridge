import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { terrainHeight } from './Mountain';

const DURATION = 12; // 1周(滑り出し→消える)の秒数
const TRAIL_COUNT = 90; // トレイルのポイント数(約1.5秒ぶんの軌跡)
const GLOW = new THREE.Color('#9fc4ff');

// 滑走ライン:山頂付近から左前方の斜面へ、S字ターンを描きながら降りる。
// 地形と同じ高さ関数を使うので、スキーヤーは常に斜面の上に乗る。
function pathPoint(t: number, out: THREE.Vector3): THREE.Vector3 {
  const px = 0.5 - t * 7.5 + Math.sin(t * Math.PI * 4) * (0.6 + t * 1.6);
  const py = 2 - t * 7.5;
  return out.set(px, terrainHeight(px, py) + 0.1, -py);
}

export default function Skier() {
  const group = useRef<THREE.Group>(null);
  const trailHead = useRef(0);

  // スキーヤー全体で1つのマテリアルを共有し、opacity でまとめてフェードさせる
  const skierMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#d9e9ff', transparent: true }),
    [],
  );

  // トレイル:加算合成のポイント群。色を毎フレーム減衰させて「光の尾」にする
  const trail = useMemo(() => {
    const positions = new Float32Array(TRAIL_COUNT * 3);
    const colors = new Float32Array(TRAIL_COUNT * 3);
    for (let i = 0; i < TRAIL_COUNT; i++) {
      positions[i * 3 + 1] = -100; // 最初は画面外に隠しておく
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  const pos = useMemo(() => new THREE.Vector3(), []);
  const next = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    const skier = group.current;
    if (!skier) return;

    const t = (clock.elapsedTime % DURATION) / DURATION;

    // 位置と向き:少し先のパス点を見て進行方向を向く
    pathPoint(t, pos);
    pathPoint(t + 0.01, next);
    skier.position.copy(pos);
    skier.lookAt(next);
    // ターンに合わせて体を内側に傾ける(S字の曲率から算出)
    skier.rotateZ(-Math.cos(t * Math.PI * 4) * 0.3);

    // ループの端でフェードイン/アウトして、瞬間移動を見せない
    const fade =
      THREE.MathUtils.smoothstep(t, 0, 0.07) * (1 - THREE.MathUtils.smoothstep(t, 0.93, 1));
    skierMaterial.opacity = fade;

    // トレイル更新:現在位置に新しい点を打ち、全体の色を減衰させる
    const positions = trail.attributes.position as THREE.BufferAttribute;
    const colors = trail.attributes.color as THREE.BufferAttribute;

    const decay = Math.pow(0.95, delta * 60); // フレームレート非依存の減衰
    const colorArr = colors.array as Float32Array;
    for (let i = 0; i < colorArr.length; i++) {
      colorArr[i] *= decay;
    }

    const head = trailHead.current;
    positions.setXYZ(head, pos.x, pos.y + 0.04, pos.z);
    colors.setXYZ(head, GLOW.r * fade, GLOW.g * fade, GLOW.b * fade);
    trailHead.current = (head + 1) % TRAIL_COUNT;

    positions.needsUpdate = true;
    colors.needsUpdate = true;
  });

  return (
    <>
      {/* スキーヤー本体:コーン(胴体)+ 球(頭)+ 板2枚。前方 = +Z */}
      <group ref={group} scale={0.6}>
        <mesh material={skierMaterial} position={[0, 0.24, 0]} rotation={[0.35, 0, 0]}>
          <coneGeometry args={[0.1, 0.34, 6]} />
        </mesh>
        <mesh material={skierMaterial} position={[0, 0.45, 0.06]}>
          <sphereGeometry args={[0.06, 8, 6]} />
        </mesh>
        <mesh material={skierMaterial} position={[-0.06, 0.01, 0.08]}>
          <boxGeometry args={[0.04, 0.02, 0.5]} />
        </mesh>
        <mesh material={skierMaterial} position={[0.06, 0.01, 0.08]}>
          <boxGeometry args={[0.04, 0.02, 0.5]} />
        </mesh>
      </group>

      {/* 発光トレイル */}
      <points geometry={trail}>
        <pointsMaterial
          size={0.16}
          vertexColors
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
}
