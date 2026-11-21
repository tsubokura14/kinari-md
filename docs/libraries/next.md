# Next.js

書いた時点のバージョン：16.4.6（React 19.3.0）

## 何か

React でサイトを作るフレームワーク。ページの置き場所（フォルダ）がそのまま URL になる App Router を使う。

- 公式：https://nextjs.org/docs
- 入れた版のドキュメントは `node_modules/next/dist/docs/` にもある

## このプロジェクトで使っている部分

パッケージ（`src/`）は Next.js を使わない。見本のページ（`sample/`）だけが使い、`devDependencies` に入れている。

- `next dev sample`・`next build sample`・`next typegen sample`：見本のフォルダを指して動かす（`package.json` の `scripts`）
- App Router：`sample/app/` の `layout.tsx`・`page.tsx` がページになる
- `sample/next.config.ts`
  - `transpilePackages: ["kinari-md"]`：TypeScript のまま配る kinari-md をビルドに通す。アプリも同じ設定で入れる
  - `agentRules: false`：`next dev` が `AGENTS.md` に案内を書き足すのを止める
- 見本のページは `kinari-md/markdown` をパッケージの名前で読み込む。一番上の `package.json` の `exports` を、自分自身の参照（self-reference）として Turbopack が解決する
- `sample/tsconfig.json`：Next.js が見本のフォルダで読む。一番上の `tsconfig.json` を `extends` するだけ
- `eslint-config-next`：Next.js 向けの Lint の規則（`eslint.config.mjs`）。`settings.next.rootDir` で見本のフォルダを指す
