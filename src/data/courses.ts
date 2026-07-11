import * as THREE from 'three';
import { terrainHeight } from '../components/Mountain';

// コース定義の「単一の真実」。
// ルート形状・発光色・カメラの寄り先・コース名をここに集約し、
// Routes.tsx(発光チューブ)/ CameraRig.tsx(カメラ)/ Booking.tsx(選択肢)が参照する。
//
// 表示テキスト(説明文・難易度など)は src/i18n/content.ts が持ち、
// 並び順のインデックス(0=WHITE LINE, 1=NOVA RUN, 2=BLACK VOID)で対応する。
// 【重要】このインデックス対応があるため、並び順を変えないこと。

export interface CourseDef {
  name: string; // ブランド要素(両言語で英語固定)。予約フォームの選択肢にも使う
  color: string; // ルート発光色
  focusX: number; // ホバー時にカメラが寄る先(ルート中腹のワールドX)
  // t(0〜1)→ プレーン座標。地形の高さ関数で山肌に沿わせる
  point: (t: number) => { x: number; y: number };
}

export const COURSES: CourseDef[] = [
  {
    // WHITE LINE:左前方へ、広く緩やかな大回り
    name: 'WHITE LINE',
    color: '#d7e8ff',
    focusX: -4.5,
    point: (t) => ({
      x: 0.5 - t * 9 + Math.sin(t * Math.PI * 3) * 1.8 * (0.4 + t),
      y: 2.2 - t * 8.5,
    }),
  },
  {
    // NOVA RUN:山頂から右中央へ、鋭い直線的なライン
    name: 'NOVA RUN',
    color: '#9fc4ff',
    focusX: 3,
    point: (t) => ({
      x: 0.2 + t * 4.8 + Math.sin(t * Math.PI * 2) * 0.7,
      y: 2.6 - t * 9,
    }),
  },
  {
    // BLACK VOID:右肩の暗部へ沈んでいくライン
    name: 'BLACK VOID',
    color: '#8b7bff',
    focusX: 5.5,
    point: (t) => ({
      x: 1 + t * 7.5 - Math.sin(t * Math.PI * 2.5) * 0.9,
      y: 2.2 - t * 5.5,
    }),
  },
];

// コース上のワールド座標を返す(プレーン(x, y) → ワールド(x, 高さ, -y))
export function pointOnCourse(course: CourseDef, t: number, out: THREE.Vector3): THREE.Vector3 {
  const p = course.point(t);
  return out.set(p.x, terrainHeight(p.x, p.y) + 0.12, -p.y);
}
