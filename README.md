# kinari-md

Claude が作った Markdown をブラウザで読むアプリのシリーズ（md-leaf、memory-forge）で共有する、Markdown の変換と本文の見た目のパッケージ。
Markdown の表示を直すときは、アプリではなくこのリポジトリで直す。

いまは土台だけで、変換の中身と本文の見た目はまだない（#2 で md-leaf から移す）。入口は、読み込めることを確かめるための値と、Markdown の色のトークンだけを出している。

## 主な機能

- Markdown の変換（`kinari-md/markdown`）：GFM、フロントマター、コールアウト、コードの色分け、数式、表、見出しの一覧（#2 から）。サニタイズ（#4 から。書き方を絞る仕組み・コードの行番号と同じ）
- 本文の見た目（CSS）：見出し・リスト・コード・表・コールアウト・数式。地・文字・差し色などはアプリのトークンを読み、Markdown の表示だけが使う色（`kinari-md/tokens.css`）はライトとダークの2組をこのパッケージが持つ
- Mermaid の図をブラウザで描く（ライトとダークに合わせる）
- 見本のページ（`sample/`）：変換した Markdown を並べ、ライトとダークを切り替えて見え方を確かめる。パッケージには入らない

## アプリへの入れ方

GitHub のタグを指定して入れる（npm には公開していない）。

```bash
npm install github:tsubokura14/kinari-md#v0.1.0
```

TypeScript のまま配っているので、アプリの Next.js でビルドする。`next.config.ts` に足す。

```ts
const nextConfig: NextConfig = {
  transpilePackages: ["kinari-md"],
};
```

入口は2つ。

| 入口 | 中身 |
| --- | --- |
| `kinari-md/markdown` | Markdown の変換（いまは `packageName` だけ） |
| `kinari-md/tokens.css` | Markdown の色（コードの色分け・コードの地と行番号・コールアウトの3色）。ライトとダークの2組で、`<html>` の `data-theme` に従う |

```ts
import { packageName } from "kinari-md/markdown";
import "kinari-md/tokens.css";
```

版を上げたときに変わったところは `CHANGELOG.md` に書く（v0.1.0 から。v0.x のあいだは、壊れる変更も版を上げて入れる）。

## 手元のアプリで確かめる手順

タグを打たずに、手元の kinari-md の変更を手元のアプリ（例：md-leaf）に入れて確かめる。
`npm pack` で作った tgz を入れると、GitHub から入れるときと同じく `files` で絞った中身が `node_modules` にコピーされる（リンクではない）ので、Turbopack がプロジェクトの外のファイルを読む問題が起きない。

1. kinari-md のフォルダで tgz を作る

   ```bash
   npm pack --pack-destination <置き場所>
   ```

   `kinari-md-<版>.tgz` ができる（中身は `README.md`・`package.json`・`src/` の下のファイル）。

2. アプリのフォルダで、保存せずに入れる

   ```bash
   npm install --no-save <tgz のパス>
   ```

   `node_modules/kinari-md` に入る。アプリの `package.json` と `package-lock.json` は変わらない。

3. アプリの `next.config.ts` に `transpilePackages: ["kinari-md"]` を足し（まだなければ）、使う場所で `kinari-md/markdown` や `kinari-md/tokens.css` を読み込んで、`next build`（と `tsc --noEmit`）や `next dev` で確かめる

4. 確かめ終わったら、アプリを元に戻す（アプリにはコミットしない）
   - 足した行を `git checkout` で戻す
   - `node_modules/kinari-md` を消す（または `npm ci`）
   - `next build` が `tsconfig.json` の `include` を書き換えることがあるので、最後に `git status` で確かめ、変わっていれば戻す

kinari-md をさらに直したときは、1 からやり直す。tgz はコピーなので、kinari-md を直してもアプリの中身は自動では変わらない。

## 使っている技術

- TypeScript（ビルドせずに配り、アプリの Next.js の `transpilePackages` でビルドする）
- Markdown の変換：unified（remark・rehype）、highlight.js、KaTeX、mermaid（#2 から）
- 見本のページ：Next.js 16（App Router）、React 19、Tailwind CSS 4
- テスト：Vitest。見本のページの画像を、Playwright の公式の Docker イメージで撮って比べる（ライトとダーク）
- Lint・整形：ESLint、Prettier

## セットアップ

### 必要なもの

- Node.js 24
- Docker Desktop（見本のページの画像を撮り直す・比べるとき）

### 手順

```bash
git clone https://github.com/tsubokura14/kinari-md.git
cd kinari-md
npm install
npm run dev
```

環境変数はない。

## 開発コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 見本のページの開発サーバー（http://localhost:3000） |
| `npm run build` | 見本のページをビルドする |
| `npm test` | 単体のテストを一度だけ実行する。ファイルを絞るときは `npm test -- <パス>` |
| `npm run lint` | Lint（ESLint と、CSS のトークンにない値を見つける `scripts/check-tokens.mjs`） |
| `npm run typecheck` | 型チェック |
| `npm run screenshots` | 見本のページの画像を Docker の Playwright で撮り直す（`docs/specs/screens/`）。Docker Desktop が要る |
| `npm run test:visual` | 見本のページの画像を基準と比べる（撮り直さない）。失敗したら `playwright-report/` に基準・今回・差分の画像が残る。Docker Desktop が要る |
| `npm run format` | コードを Prettier でまとめて整形する |

## 開発の進め方

このリポジトリは、**人間が主導するハーネスエンジニアリング** で開発している。
何を作るかを決めること、レビュー、マージは人間がする。AI（Claude Code・GitHub Copilot）は、決まった流れ・決まり・止める仕組み（ハーネス）の中で、設計の下書きと実装をする。
詳しくは [docs/how-we-work.md](docs/how-we-work.md) にある。

## ドキュメント

| ファイル | 内容 |
| --- | --- |
| [docs/overview.md](docs/overview.md) | 目的、やらないこと、技術、用語 |
| [docs/specs/](docs/specs/) | パッケージと見本のページが今どう動くか、今の画面 |
| [docs/design.md](docs/design.md) | 今どう作られているか（複数の場所に関わる決まりと、その理由） |
| [docs/ui.md](docs/ui.md) | 見た目の決まり（色・余白・文字・部品の使い分け） |
| [docs/changes/](docs/changes/) | 機能ごとの変更の記録（何を・なぜ・どう変えたか） |
| [docs/libraries/](docs/libraries/) | コードを読むために必要なライブラリの前提知識 |
| [docs/how-we-work.md](docs/how-we-work.md) | 開発の進め方 |
| [AGENTS.md](AGENTS.md) | AIへのルール（Claude Code と GitHub Copilot が読む） |
| [.claude/skills/](.claude/skills/) | AIが作業で使う手順と決まり（テストの基準、画面の撮り方など） |
