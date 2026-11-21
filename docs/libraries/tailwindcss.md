# Tailwind CSS

書いた時点のバージョン：4.3.3（`@tailwindcss/turbopack` 4.3.3、`eslint-plugin-better-tailwindcss` 4.11.0）

## 何か

`bg-bg`・`p-4` のようなクラスを HTML に書いて見た目を付ける CSS の道具。使ったクラスの CSS だけが作られる。v4 では、設定を JavaScript ではなく CSS の `@theme` に書く。

- 公式：https://tailwindcss.com/docs
- eslint-plugin-better-tailwindcss：https://github.com/schoero/eslint-plugin-better-tailwindcss

## このプロジェクトで使っている部分

パッケージ（`src/`）は Tailwind を使わない（`src/styles/tokens.css` は普通の CSS 変数）。見本のページ（`sample/`）だけが、アプリと同じ入れ方を試すために使い、`devDependencies` に入れている。

- `sample/app/globals.css` の `@import "tailwindcss";` で読み込み、見本のトークン `sample/app/tokens.css` と `kinari-md/tokens.css` を続けて読み込む
- `sample/app/tokens.css` の `@theme`：`--*: initial` で Tailwind の既定の値を消し、アプリが持つトークンだけをクラスにする（`bg-bg`・`text-text`・`font-ui` など）
- `@tailwindcss/turbopack`：Next.js のビルド（Turbopack）で CSS を変換する。`sample/next.config.ts` の `turbopack.rules` で指定している（PostCSS の設定ファイルは使わない）
- `@import "kinari-md/tokens.css"` は、一番上の `package.json` の `exports` を自分自身の参照として解決している
- eslint-plugin-better-tailwindcss（`eslint.config.mjs`）：`src/`・`sample/` の TS・TSX で、Tailwind にないクラス（`no-unknown-classes`）と任意の値のクラス（`no-restricted-classes`）を見つける。どのクラスがあるかは `sample/app/globals.css` から読む
