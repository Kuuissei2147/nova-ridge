# NOVA RIDGE

架空の近未来スキーリゾートの、シネマティックなインタラクティブ 3D ランディングページ。
React / Vite / TypeScript / Three.js / React Three Fiber / Framer Motion で構築しています。

## ローカルでの起動方法

```bash
npm install
npm run dev
```

Vite が表示する URL(通常 http://localhost:5173)をブラウザで開いてください。

## プロジェクト構成

```
src/
├── main.tsx            エントリーポイント
├── App.tsx             ページレイアウト、ヘッダー/フッター、スクロール進捗
├── styles/global.css   スタイル全部(1ファイル)
└── components/
    ├── Scene.tsx       固定フルスクリーンの <Canvas>、ライト、フォグ
    ├── Mountain.tsx    プロシージャル生成のローポリ山(決定的ノイズ)
    ├── Snow.tsx        降雪パーティクル(THREE.Points)
    ├── CameraRig.tsx   マウスパララックス + スクロール連動のカメラ接近
    ├── Hero.tsx        タイトル、コピー、山岳データ、CTA ボタン
    └── Experiences.tsx WHITE LINE / NOVA RUN / BLACK VOID の紹介
```

## メモ

- 画像・フォント・有料アセットは一切不使用。すべてプロシージャル生成です。
- 音もファイルなし:Web Audio API で風・ドローン・効果音をその場で合成しています。
  ヘッダーの「SOUND ON/OFF」で切り替え(ブラウザの自動再生制限のため初期状態はオフ)。
- 山の地形は決定的(毎回同じ形が生成されます)。
- スクロールすると 3D カメラが山に向かって前進し、マウスで視点が微妙に動きます。
- 小さい画面ではパーティクル数を自動で減らし、モバイルでも滑らかに動きます。
- 欧文は Futura 系、日本語はヒラギノ系のシステムフォントで表示されます。
