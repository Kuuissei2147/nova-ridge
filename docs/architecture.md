# アーキテクチャ

## 技術スタック(依存は5つだけ。増やす前に必ず再考する)

react / react-dom / three / @react-three/fiber / framer-motion
(dev: vite, typescript, @vitejs/plugin-react, @types/*)

drei は不使用。画像・フォント・音源ファイルも不使用(すべてプロシージャル生成)。

## ファイル構成と責務

```
src/
├── main.tsx                  エントリ(StrictMode)
├── App.tsx                   状態の中枢:scrollYProgress / activeRoute / soundOn
│                             ヘッダー(サウンドトグル)・フッターもここ
├── styles/global.css         スタイル全部(1ファイル主義)
├── hooks/
│   └── useSectionProgress.ts スクロール進捗 0〜1 を返す自作フック(framerのtarget版の代替)
├── i18n/
│   └── content.ts            日英コピーの辞書(Copy型で両言語の抜け漏れを型チェック)
├── audio/
│   └── engine.ts             Web Audio シングルトン。風+ドローン+効果音3種を合成
└── components/
    ├── Scene.tsx             固定<Canvas>。ライト・フォグ・3D子要素の親
    ├── Aurora.tsx            オーロラ(カスタムシェーダーの1枚プレーン、z=-56)
    ├── Mountain.tsx          地形。terrainHeight(x,y) をエクスポート(共有高さ関数)
    ├── DistantRidge.tsx      遠景の山脈シルエット(奥行き)
    ├── Routes.tsx            コース3本のTubeGeometry。activeRouteで発光
    ├── Skier.tsx             滑走スキーヤー+発光トレイル(12秒ループ)
    ├── Snow.tsx              降雪パーティクル(デスクトップ1100/モバイル450)
    ├── CameraRig.tsx         カメラ+フォグの演出中枢(スクロール・マウス・コース寄り)
    ├── Hero.tsx              タイトル・コピー・山岳データ・CTA
    ├── Journey.tsx           sticky 240vh の見出し転換セクション
    ├── Experiences.tsx       コース3行(ボタン化・詳細パネル・スクラブ出現)
    └── Booking.tsx           架空予約フォーム+確認オーバーレイ
```

## データフロー

```
App
├─ scrollYProgress(framerのグローバルuseScroll)──→ Scene → CameraRig(カメラ・フォグ)
│                                                └→ audio.setWind(風の強さ)
├─ activeRoute: number | null
│    Experiences(ホバー/フォーカス/タップ)─ activateRoute() ─→ App
│    App ─→ Scene ─→ Routes(発光)・CameraRig(寄り)
├─ soundOn ─→ audio.enable() / disable()
└─ lang: 'ja' | 'en' ─→ CONTENT[lang] を各コンポーネントへ props で配布
     (localStorage 'nova-lang' に記憶。<html lang> と document.title も連動)
```

- **`terrainHeight(x, y)`**(Mountain.tsx)が地形の単一の真実。山のジオメトリ、
  スキーヤーのパス、コースルートのチューブがすべてこれを参照する
- **コースの対応はインデックス(0,1,2)で暗黙に結合**している:
  `Experiences.RUNS` ↔ `Routes.ROUTE_DEFS` ↔ `CameraRig.ROUTE_FOCUS_X`。
  順序を変えると壊れる(architecture上の既知の弱点。リファクタ候補)
- **audio はモジュールシングルトン**。コンポーネントは `audio.playX()` を直接呼ぶ。
  オフ時は各メソッドが no-op。AudioContext はユーザー操作後にのみ生成/resume

## 座標系の約束

地形はXY平面を -90°回転して使う:**プレーン(x, y) → ワールド(x, 高さ, -y)**。
スキーヤー・ルートのパス定義はプレーン座標で書き、変換して配置する。

## 環境に関する知見(ハマりどころ)

- framer-motion `useScroll({ target })` が動かない環境がある → 自作フックで代替(motion-guidelines.md 参照)
- 埋め込みプレビューはバックグラウンド時に rAF / scroll イベント / focus イベントが止まる。
  検証はスクリーンショットでフレームを進めながら行う(実ブラウザでは問題ない)
- HMR直後は framer の入場アニメーション状態が壊れることがある → リロードで確認する

## ビルド・確認コマンド

```bash
npm run dev      # 開発サーバー(localhost:5173)
npm run build    # tsc --noEmit + vite build(リリース前必須)
```
