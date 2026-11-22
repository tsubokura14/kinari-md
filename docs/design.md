<!--
今の設計。アプリが今どう作られているかのうち、複数の場所に関わるものを、理由と前提つきで現在形で書く。
書き方は code-notes スキル（.claude/skills/code-notes/SKILL.md）。
-->

# 今の設計

## 全体の構成

| 場所 | 中身 | アプリに入るか |
| --- | --- | --- |
| `package.json`（一番上） | パッケージ `kinari-md`。`exports` で4つの入口（下の「入口は4つに分ける」）を決め、`files` で `src/` だけを配る。見本・テストの道具は `devDependencies` | 入る（`files` の中身） |
| `src/` | パッケージの中身。`src/markdown/`（変換）、`src/mermaid/`（図を描く）、`src/styles/`（トークンと本文の CSS） | 入る |
| `sample/` | 見本のページ（Next.js の App Router。`next dev sample` で動かす） | 入らない |
| `e2e/` | 見本のページを動かすテストと、画像を比べるテスト（Playwright） | 入らない |
| `scripts/` | Docker で Playwright を動かす、トークンにない値を見つける、などの道具 | 入らない |
| `docker/playwright/` | 見本のページの画像を撮るイメージ（日本語の書体を入れたもの） | 入らない |

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

- `sample/` は4つの入口（`kinari-md/markdown`・`body.css`・`mermaid`・`tokens.css`）を、`exports` の自分自身の参照（self-reference）で読み込み、`transpilePackages` を通す（`sample/next.config.ts`）。`src/` を相対パスで読まない
- 理由：アプリと同じ入れ方を見本で先に試せる。`exports` に書き漏れがあると、見本のビルドで気づける
- 当てはまる場所：`sample/`

### 入口は4つに分ける

| 入口 | 中身 | 動く場所 |
| --- | --- | --- |
| `kinari-md/markdown`（`src/markdown/index.ts`） | `renderMarkdown(source, options?)` と型だけ | サーバー（ブラウザでも動く） |
| `kinari-md/body.css`（`src/styles/body.css`） | 本文の入れ物 `.kinari-body` の中の見た目。先頭で KaTeX の CSS を読み込む | ― |
| `kinari-md/mermaid`（`src/mermaid/index.ts`） | `drawMermaid(body)`。React に頼らない関数で、`mermaid` は描くときにだけ読み込む | ブラウザ |
| `kinari-md/tokens.css`（`src/styles/tokens.css`） | Markdown の色と表の列の幅（下の「トークンは2つのファイルに分ける」） | ― |

- 理由：サーバーで動く変換と、ブラウザで動く図を分け、大きい `mermaid` を図のあるページでだけ読み込めるようにする。図を React の部品にしないのは、アプリの作りや React の版に頼らず、どのアプリでも呼べるようにするため
- 前提（崩れたら見直す）：変換に `mermaid` を読み込まない（図は `src/markdown/highlight.ts` が `pre[data-mermaid]` の印を付けるだけ）。入口を足したら `package.json` の `exports` と、見本のページの読み込みにも足す
- 当てはまる場所：`package.json` の `exports`、`src/markdown/index.ts`・`src/mermaid/index.ts`・`src/styles/`

### 依存は版を固定して `dependencies` に入れる

- 変換・図に使うもの（unified 一式・highlight.js・KaTeX・mermaid・yaml）は、md-leaf と同じ版を固定して `dependencies` に入れる。配る `src/` が型で使う `vfile`・`@types/hast`・`@types/mdast` も `dependencies` に入れる
- 理由：アプリが自分で入れなくても md-leaf と同じ出し方になる。アプリの `tsc` が `node_modules/kinari-md/src` を型チェックするので、型の依存がアプリに入っていないと型が見つからない
- 前提（崩れたら見直す）：アプリが同じライブラリを別の版で使い、二重に入るのが困るようになったら `peerDependencies` を考える
- 当てはまる場所：`package.json`

## データ

<!-- 保存するものの持ち方（テーブルなど）と、その理由・前提 -->

保存するデータはない。アプリとの受け渡しの形だけを持つ。

### アプリから渡す関数の形（リンクと画像の書き換え）

```ts
renderMarkdown(source: string, options?: { resolve?: Resolve }): RenderedMarkdown
type Resolve = (target: { kind: "link" | "image"; href: string }) =>
  | { href: string; missing?: boolean } // 書き換えたあとの場所と、行き先がないか
  | undefined; // 書き換えない
type RenderedMarkdown = {
  title: string | undefined;
  html: string;
  headings: { id: string; text: string; depth: 2 | 3 }[];
  brokenLinks: string[]; // 書かれたままの形（decodeURI したもの）
  brokenImages: string[];
};
```

- 関数に渡すのは相対のもの（スキーム付き・`/` で始まる・`#` で始まるものは渡さない）。`href` は HTML に出る形（符号化されたもの。`#`・`?` のあとも含む）。`.md` かどうかなどの見分けはアプリがする
- 書き換えたリンクには `data-internal-link` を付ける（画像には付けない）。アプリはこの印でアプリの中へのリンクを見分ける
- 関数は呼ぶたびに違うので、unified の処理は1つだけ作り、関数は `VFile` の `data` で渡す（`src/markdown/render.ts`・`links.ts`）
- 理由：ノートの置き場所と URL の形はアプリごとに違う（`docs/overview.md`）。切れたリンクの一覧を作るため、書き換えたあとの場所と「行き先がない」を一緒に返す。`href` を符号化された形で渡すのは、md-leaf の今の読み解き（`resolveNoteLink`・`resolveImageSrc`）を変えずに渡せるようにするため
- 前提（崩れたら見直す）：書き換えるのが a の `href` と img の `src` だけ。ほかの要素（`source` など）を書き換えたくなったら、`kind` を足す
- 当てはまる場所：`src/markdown/render.ts`・`links.ts`、アプリの呼び出し

## どこでも守る決まり

<!-- 複数のファイルで守る決まり。命名、エラーの扱い、コードの書き方を縛るライブラリの注意など -->

### ノートの HTML は文字にし、raw を作るのは KaTeX と highlight.js だけにする

- ノートの中の HTML のタグは、動かさず文字として出す（`render.ts` の `htmlAsText`）。HTML の文字列をそのまま出す raw ノードを作るのは、KaTeX（`math.ts`）と highlight.js（`highlight.ts`）の結果だけにする。`rehype-stringify` は `allowDangerousHtml` で raw をそのまま出す
- 理由：アプリは返した HTML をそのまま本文に入れるので、ノートの文字が raw に入るとスクリプトが動く穴になる。KaTeX と highlight.js は中の文字を符号化済み
- 前提（崩れたら見直す）：raw を作る処理を足すときは、中の文字が符号化済みかを確かめる。サニタイズ（#4）を入れたら見直す
- 当てはまる場所：`src/markdown/` の rehype の処理すべて

### トークンは2つのファイルに分ける

- `src/styles/tokens.css`（入口 `kinari-md/tokens.css`）：kinari-md が持つ Markdown の色（`--color-code-*`・`--color-callout-*`）をライト（`:root`）とダーク（`[data-theme="dark"]`）の2組で、表の列の幅（`--table-col-*`）とあわせて持つ。アプリはこれを読み込む
- `sample/app/tokens.css`：アプリが持つもの（地・文字・差し色・意味の色・書体・文字の段階・角丸・余白、`--reading-size`）を、見本のページでだけ代わりに決める。見本は Markdown の色を、アプリと同じく `kinari-md/tokens.css` から読む（`sample/app/globals.css`）
- 理由：`docs/ui.md` の「トークン」
- 前提（崩れたら見直す）：アプリが `<html>` に `data-theme` を付け、ダークでは `dark` にする
- 当てはまる場所：`src/` の CSS と、見本のページ

### Markdown の色は普通の CSS 変数で配る

- `src/styles/tokens.css` は Tailwind の `@theme` を使わず、`--color-code-bg` のような普通の CSS 変数だけを書く。本文の CSS は `var(--color-code-bg)` で読む
- 本文の CSS（`src/styles/body.css`）も、Tailwind に頼らない普通の CSS にする。`@reference`・`@apply`・`@variant` を使わず、アプリのトークンも `var(--color-text)`・`var(--spacing)` などで読む。スマホと PC の切り替えは `@media (min-width: 64rem)`（見本の `--breakpoint-lg` と同じ値。CSS 変数はメディアクエリに書けないため、`body.css` に直接書く）
- 本文の文字の大きさは `.kinari-body` の `font-size: var(--reading-size)` で決め、見出し・コードなどは `em` で倍率をかける（`body.css` の先頭のコメント）
- 理由：アプリの Tailwind の設定（`@theme` の `--*: initial` や読み込む順番、ブレークポイント）に左右されずに使えるようにするため。名前はアプリのトークンと同じく `--color-` で始める
- 前提（崩れたら見直す）：アプリが Markdown の色を Tailwind のクラス（`bg-code-bg` など）として使わない。使いたくなったら、アプリの `@theme` で名前を足す。アプリのブレークポイントが `64rem` と違うものになったら、`body.css` の `@media` を見直す
- 当てはまる場所：`src/styles/tokens.css`、`src/styles/body.css`

### トークンの値はトークンファイルにだけ書く

- 色コード・`rgb()`・`hsl()`・`px` は、上の2つのトークンファイルにだけ書く。ほかの CSS・TS・TSX はトークン（CSS 変数か Tailwind のクラス）を使い、Tailwind の任意の値のクラス（`p-[13px]`）も使わない
- 理由：同じ値を2か所に書くと、片方だけ直してずれるため（`docs/ui.md`）
- `npm run lint` が見つける：CSS は `scripts/check-tokens.mjs`、`src/`・`sample/` の TS・TSX は `eslint.config.mjs` の規則（文字列の色コード・`px`、任意の値のクラス、Tailwind にないクラス）
- 前提（崩れたら見直す）：トークンファイルを増やしたり移したりしたら、`scripts/check-tokens.mjs` の `TOKEN_FILES` と `eslint.config.mjs` のメッセージを直す
- 当てはまる場所：トークンファイル以外の `.css`・`.ts`・`.tsx`

### 見本のページの画像は、日本語の書体を入れた Playwright のイメージで撮って比べる

- `npm run screenshots`（撮り直す）と `npm run test:visual`（比べるだけ）は、`scripts/playwright-docker.mjs` で、`docker/playwright/` のイメージを作り、その中で `playwright test` を走らせる。手元でも CI でも同じスクリプトで動かす
- イメージは、入れた `@playwright/test` と同じ版の公式イメージ（`mcr.microsoft.com/playwright:v<版>-noble`）に、日本語の書体 `fonts-noto-cjk`（Noto Sans CJK JP・Noto Serif CJK JP。Regular と Bold）を版を固定して入れたもの。トークンの書体の並びにある `Noto Serif JP`・`Noto Sans JP` は、`docker/playwright/fonts.conf` で CJK JP の書体に当てる
- イメージの名前（`kinari-md-playwright:v<版>-<Dockerfile と fonts.conf の中身から作った値>`）が変わったときだけ作り直す
- 基準の画像は `docs/specs/screens/<画面>-<状態>.png`（名前に OS 名を入れない。`playwright.config.ts` の `snapshotPathTemplate`）。「今の画面」としても使う
- サーバーは `next build sample` のあと `next start sample` で1つだけ立てる（開発サーバーは初回の変換が遅く、表示が揺れるため）。ポートは環境変数 `PORT`（既定 3100）
- コンテナの中の `node_modules` と `sample/.next` は、フォルダごとの名前つきボリューム（`kinari-md-<フォルダの場所から作った値>-node_modules`・`-next`）に分ける
- 理由：OS が違うと文字の描き方が変わり、画像が一致しないため。公式のイメージの日本語の書体は Regular だけで明朝もなく、太字と明朝の崩れが画像に出ないため。Windows で入れた `node_modules` は Linux で動かないため
- 前提（崩れたら見直す）：手元に Docker Desktop があり、CI の実行環境で `docker` が使える。書体の版を上げたら画像を撮り直す。見本のページはデータを取ってこないので、撮る状態はページそのもので作る（状態を足すときは、ここに作り方を書く）
- 状態の作り方：ライト/ダーク・差し色・文字の大きさは URL（`?theme=dark&accent=forge&size=14`）で開いて作る。PC の幅は `playwright.config.ts` の project `pc`（`*-pc.spec.ts`）で撮る。図は描き終わる（`.mermaid-figure svg` が出る）のを待ってから撮る
- 当てはまる場所：`e2e/`、`playwright.config.ts`、`scripts/playwright-docker.mjs`、`docker/playwright/`、`.github/workflows/ci.yml`
