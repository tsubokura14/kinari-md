<!--
今の設計。アプリが今どう作られているかのうち、複数の場所に関わるものを、理由と前提つきで現在形で書く。
書き方は code-notes スキル（.claude/skills/code-notes/SKILL.md）。
-->

# 今の設計

## 全体の構成

<!-- フォルダ構成、層の分け方、どの層に何を書くかと、その理由・前提。立ち上げ（foundation スキル）で書く -->

## データ

<!-- 保存するものの持ち方（テーブルなど）と、その理由・前提 -->

## どこでも守る決まり

<!-- 複数のファイルで守る決まり。命名、エラーの扱い、コードの書き方を縛るライブラリの注意など -->

### トークンは2つのファイルに分ける

- `src/styles/tokens.css`（入口 `kinari-md/tokens.css`）：kinari-md が持つ Markdown の色（`--color-code-*`・`--color-callout-*`）をライト（`:root`）とダーク（`[data-theme="dark"]`）の2組で、表の列の幅（`--table-col-*`）とあわせて持つ。アプリはこれを読み込む
- `sample/app/tokens.css`：アプリが持つもの（地・文字・差し色・意味の色・書体・文字の段階・角丸・余白、`--reading-size`）を、見本のページでだけ代わりに決める。見本は Markdown の色を、アプリと同じく `kinari-md/tokens.css` から読む（`sample/app/globals.css`）
- 理由：Markdown の表示だけが使う色はアプリごとに書くとずれるので kinari-md が持ち、地や差し色はアプリの画面全体と揃える必要があるのでアプリが持つ（`docs/ui.md` の「トークン」）
- 前提（崩れたら見直す）：アプリが `<html>` に `data-theme` を付け、ダークでは `dark` にする
- 当てはまる場所：`src/` の CSS と、見本のページ

### Markdown の色は普通の CSS 変数で配る

- `src/styles/tokens.css` は Tailwind の `@theme` を使わず、`--color-code-bg` のような普通の CSS 変数だけを書く。本文の CSS は `var(--color-code-bg)` で読む
- 理由：アプリの Tailwind の設定（`@theme` の `--*: initial` や読み込む順番）に左右されずに使えるようにするため。名前はアプリのトークンと同じく `--color-` で始める
- 前提（崩れたら見直す）：アプリが Markdown の色を Tailwind のクラス（`bg-code-bg` など）として使わない。使いたくなったら、アプリの `@theme` で名前を足す
- 当てはまる場所：`src/styles/tokens.css`、`src/` の CSS

### トークンの値はトークンファイルにだけ書く

- 色コード・`rgb()`・`hsl()`・`px` は、上の2つのトークンファイルにだけ書く。ほかの CSS・TS・TSX はトークン（CSS 変数か Tailwind のクラス）を使い、Tailwind の任意の値のクラス（`p-[13px]`）も使わない
- 理由：同じ値を2か所に書くと、片方だけ直してずれるため（`docs/ui.md`）
- `npm run lint` が見つける：CSS は `scripts/check-tokens.mjs`、`src/`・`sample/` の TS・TSX は `eslint.config.mjs` の規則（文字列の色コード・`px`、任意の値のクラス、Tailwind にないクラス）
- 前提（崩れたら見直す）：トークンファイルを増やしたり移したりしたら、`scripts/check-tokens.mjs` の `TOKEN_FILES` と `eslint.config.mjs` のメッセージを直す
- 当てはまる場所：トークンファイル以外の `.css`・`.ts`・`.tsx`
