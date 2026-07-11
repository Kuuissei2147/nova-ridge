# モーションガイドライン

「滑らかで、意図的で、邪魔をしない」。演出は常に山への接近という物語に従属する。

## 標準イージングと減衰

- **DOMアニメーションの標準イージング**:`cubic-bezier(0.16, 1, 0.3, 1)`(easeOutExpo系)。
  framer-motion では `ease: [0.16, 1, 0.3, 1]`。新しいアニメーションは原則これを使う
- **3D側の追従はフレームレート非依存の減衰**を使う:
  - 手動実装:`k = 1 - Math.exp(-3 * delta)` で目標値へ補間(カメラ)
  - three.js ヘルパー:`THREE.MathUtils.damp(current, target, λ, delta)`(ルート発光 λ=6)
  - **`+= 0.1` のようなフレーム依存の補間は禁止**(30fpsと120fpsで挙動が変わる)

## スクロール駆動の2方式

| 方式 | 用途 | 実装 |
|---|---|---|
| スクラブ(scrub) | スクロール量に完全同期 | 自作 `useSectionProgress` + `useTransform` |
| 入場(entrance) | 一度だけ再生 | framer-motion `whileInView` / `variants` |

**注意:framer-motion の `useScroll({ target })` は使わない。**
更新が止まる不具合に遭遇したため、`src/hooks/useSectionProgress.ts`(scrollイベント+
getBoundingClientRect の約30行)に統一している。新しいスクロール連動もこのフックを使うこと。

## 現在の主要パラメータ

- **カメラ**:z 26 → 10 / y 4.5 → 2.7(スクロール全体で)。マウスパララックス x±1.4(接近するほど半減)。lookAt も減衰させる(视点を跳ばさない)
- **フォグ**:near 14→6 / far 48→28(接近するほど濃く)
- **Journey セクション**:高さ 240vh の sticky。前半で CHASE THE WHITE. が消え(進捗 0.05–0.35)、後半で ENTER THE UNKNOWN. が現れる(0.45–0.72)
- **コース行の出現**:行上端が viewport 95%→55% の間で opacity 0→1 / y 70→0
- **スキーヤー**:12秒ループ。両端 7% でフェードして瞬間移動を隠す。トレイルは色減衰 `0.95^(delta*60)`

## パフォーマンス規律

- DOMアニメーションは **opacity / transform のみ**(layout を動かさない)
- パーティクル予算:雪 1100(モバイル 450)/ トレイル 90。増やす場合は必ずモバイル実機確認
- `will-change` は本当に動く要素だけに付ける
- Canvas は `dpr={[1, 1.75]}` を維持

## Reduced Motion

- CSSは対応済み:`prefers-reduced-motion: reduce` で transition/animation をほぼ無効化
- **オーロラは対応済み**:reduce 時は時間を停止(静止した光として見え続ける)。OS設定の
  切り替えにもリアルタイム追従する(`matchMedia` の change 監視)。他の3D要素の参考実装
- **既知の課題**:カメラのスクロール移動・雪・スキーヤーはまだ動き続ける。
  今後の対応方針:reduce 時はマウスパララックスを切り、カメラ移動を大幅に減衰、雪の速度を落とす
