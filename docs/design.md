<!--
今の設計。アプリが今どう作られているかのうち、複数の場所に関わるものを、理由と前提つきで現在形で書く。
書き方は code-notes スキル（.claude/skills/code-notes/SKILL.md）。
-->

# 今の設計

## 全体の構成

| 場所 | 中身 | アプリに入るか |
| --- | --- | --- |
| `package.json`（一番上） | パッケージ `kinari-md`。`exports` で入口（`kinari-md/markdown`・`kinari-md/tokens.css`）を決め、`files` で `src/` だけを配る。見本・テストの道具は `devDependencies` | 入る（`files` の中身） |
| `src/` | パッケージの中身。`src/markdown/`（変換）、`src/styles/`（トークンと本文の CSS） | 入る |
| `sample/` | 見本のページ（Next.js の App Router。`next dev sample` で動かす） | 入らない |
| `e2e/` | 見本のページを動かすテストと、画像を比べるテスト（Playwright） | 入らない |
| `scripts/` | Docker で Playwright を動かす、トークンにない値を見つける、などの道具 | 入らない |

### package.json は一番上の1つだけにする

- 理由：GitHub のタグで入れると、一番上のパッケージしか入らない。見本を別の package.json にすると、npm の workspaces か `file:` のリンクが要り、Turbopack がリンクの先を扱いにくい
- 前提（崩れたら見直す）：配り方が GitHub のタグのまま（`docs/overview.md`）
- 当てはまる場所：リポジトリ全体

### `src/` は TypeScript のまま配り、アプリがビルドする

- アプリは `transpilePackages: ["kinari-md"]` でビルドする。アプリの `tsc` も `node_modules/kinari-md/src` を型チェックするので、`src/` は strict で通る書き方にする
- `package.json` に `prepare` などのスクリプトを置かない。GitHub から入れるとき、npm が `prepare` を見つけると devDependencies まで入れて実行するため
- 理由：このリポジトリにビルドの手順を持たずに済む
- 前提（崩れたら見直す）：使うアプリがどれも Next.js で `transpilePackages` を使える
- 当てはまる場所：`src/`、`package.json`

### 見本のページは、パッケージの名前で読み込む

- `sample/` は `kinari-md/markdown`・`kinari-md/tokens.css` を、`exports` の自分自身の参照（self-reference）で読み込み、`transpilePackages` を通す（`sample/next.config.ts`）。`src/` を相対パスで読まない
- 理由：アプリと同じ入れ方を見本で先に試せる。`exports` に書き漏れがあると、見本のビルドで気づける
- 当てはまる場所：`sample/`

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

### 見本のページの画像は、Playwright 公式の Docker イメージで撮って比べる

- `npm run screenshots`（撮り直す）と `npm run test:visual`（比べるだけ）は、`scripts/playwright-docker.mjs` で、入れた `@playwright/test` と同じ版の公式イメージ（`mcr.microsoft.com/playwright:v<版>-noble`）の中で `playwright test` を走らせる。環境変数 `CI` があれば Docker を使わずそのまま走らせる（CI はそのイメージのコンテナの中で動かす）
- 基準の画像は `docs/specs/screens/<画面>-<状態>.png`（名前に OS 名を入れない。`playwright.config.ts` の `snapshotPathTemplate`）。「今の画面」としても使う
- サーバーは `next build sample` のあと `next start sample` で1つだけ立てる（開発サーバーは初回の変換が遅く、表示が揺れるため）。ポートは環境変数 `PORT`（既定 3100）
- コンテナの中の `node_modules` と `sample/.next` は、フォルダごとの名前つきボリューム（`kinari-md-<フォルダの場所から作った値>-node_modules`・`-next`）に分ける
- 理由：OS が違うと文字の描き方が変わり、画像が一致しないため。Windows で入れた `node_modules` は Linux で動かないため
- 前提（崩れたら見直す）：手元に Docker Desktop がある。見本のページはデータを取ってこないので、撮る状態はページそのもので作る（状態を足すときは、ここに作り方を書く）
- 当てはまる場所：`e2e/`、`playwright.config.ts`、`scripts/playwright-docker.mjs`
