import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 山の背後にだけ見えるオーロラ。
// 遠景山脈(z=-34±20)よりさらに奥(z=-56)に縦長のプレーンを置き、
// カスタムシェーダーでカーテン状の光を描く。手前の山とリッジが自然に遮蔽するので、
// 「山の背後にだけ」という条件が深度テストだけで満たされる。
//
// - 色:下から わずかな緑 → シアン → ブルー → パープル のランプ × ノイズ2層
// - 加算合成・最大不透明度 約0.33(山より前に出ない)
// - モバイルはノイズのオクターブを減らして負荷を下げる
// - prefers-reduced-motion では時間を止める(静止したオーロラとして残る)

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < OCTAVES; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    float t = uTime * 0.03; // ゆっくり、優雅に

    // カーテンの揺らぎ:x方向をノイズでゆがめる
    float bend = fbm(vec2(vUv.x * 4.0, t)) * 1.4;

    // レイ(光条):xに細かく、yに引き伸ばされた縦筋。2層を別速度で流す
    float ray  = fbm(vec2(vUv.x * 14.0 + bend, vUv.y * 0.8 - t * 1.2));
    float ray2 = fbm(vec2(vUv.x * 23.0 - bend * 1.3 + 4.7, vUv.y * 1.1 - t * 0.7 + 2.3));
    // 常に薄く存在する土台の光(ノイズの位相で真っ暗になる瞬間を防ぐ)
    float glow = fbm(vec2(vUv.x * 2.5 + bend * 0.4, vUv.y * 1.4 - t * 0.5));
    ray  = pow(smoothstep(0.32, 0.82, ray), 1.5);
    ray2 = pow(smoothstep(0.38, 0.85, ray2), 1.8);
    glow = smoothstep(0.20, 0.85, glow);

    // 地平線側と天頂側をなだらかに消す(硬いエッジを出さない)
    float vfall = smoothstep(0.06, 0.26, vUv.y) * (1.0 - smoothstep(0.60, 0.97, vUv.y));

    vec3 cGreen  = vec3(0.35, 0.85, 0.60);
    vec3 cCyan   = vec3(0.35, 0.80, 0.95);
    vec3 cBlue   = vec3(0.30, 0.45, 1.00);
    vec3 cPurple = vec3(0.55, 0.35, 0.95);

    // 高さで色を変える:緑はごくわずか(裾)、シアン→ブルー→パープルへ
    vec3 ramp = mix(cGreen, cCyan, smoothstep(0.10, 0.28, vUv.y));
    ramp = mix(ramp, cBlue,   smoothstep(0.34, 0.52, vUv.y));
    ramp = mix(ramp, cPurple, smoothstep(0.55, 0.85, vUv.y));

    vec3 color = ramp * (ray + glow * 0.5) + cPurple * ray2 * 0.6 + cCyan * ray * ray2 * 0.5;
    float alpha = (ray * 0.9 + ray2 * 0.5 + glow * 0.25) * vfall * uIntensity * 0.9;
    alpha = min(alpha, 0.35); // 山より前に出ない上限

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function Aurora() {
  // reduced-motion:時間を止める(OS設定の切り替えにも追従する)
  const reduced = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = mq.matches;
    const onChange = () => {
      reduced.current = mq.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const material = useMemo(() => {
    const isMobile = window.innerWidth < 768;
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      defines: { OCTAVES: isMobile ? 2 : 3 },
      uniforms: {
        uTime: { value: Math.random() * 100 }, // 毎回違う表情で始まる
        uIntensity: { value: isMobile ? 0.8 : 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((_, delta) => {
    if (reduced.current) return;
    material.uniforms.uTime.value += delta;
  });

  return (
    <mesh material={material} position={[0, 26, -56]}>
      <planeGeometry args={[200, 60]} />
    </mesh>
  );
}
