# リリースプロセス

## ブランチとコミット

- `main` が常にリリース可能な状態。壊れたコードを main に置かない
- 機能追加・リファクタはブランチを切る:`feature/aurora-sky`、`refactor/course-data` など
- **1コミット=1つの関心事**。特に「見た目の改善」と「構造のリファクタ」を混ぜない
- コミットメッセージは「何を・なぜ」を1行目に(日本語可)

## リリース手順

1. 変更を実装する(`docs/` の関連ドキュメントも同時に更新)
2. `npm run build` を通す(型チェック+ビルド。**これを通さずに commit しない**)
3. `npm run dev` + ブラウザで quality-checklist.md を通す
   - 必ずリロード後の状態で確認(HMR直後の見た目は信用しない)
   - モバイル幅(375px)とキーボード操作を最低限確認
4. commit → push
   - gh CLI で認証済み(2026-07-11 設定)。`git push origin main` がそのまま使える
   - 認証が切れた場合は `gh auth login` を再実行(メールでの本人確認を求められることがある)
5. デプロイ
   - **Vercel が GitHub 連携済み**:main への push で自動デプロイされる(1〜2分)
   - 本番URL:https://nova-ridge.vercel.app/
   - 反映確認:本番のJSバンドルが新しいハッシュ名に変わっていること

## リリース後

- 本番URLで最低限のスモークチェック(ヒーロー表示・スクロール・予約フロー)
- 問題があれば `git revert` で戻す(直接 main を書き換えない)

## 自動化(未導入・Phase 2 で導入予定)

- GitHub Actions:push / PR 時に `npm run build` を実行し、壊れた状態の main を防ぐ
- 導入後は「Actions が緑であること」をリリース条件に追加する

## 注意事項

- リポジトリ直下に `nova-ridge/` という入れ子フォルダを作らない
  (過去に GitHub Desktop の操作ミスで発生し、整理済み)
- `node_modules` / `dist` / `.DS_Store` は .gitignore 済み。コミットに混入させない
