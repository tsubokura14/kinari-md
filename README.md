# kinari-md

Claude が作った Markdown をブラウザで読むアプリのシリーズ（md-leaf、memory-forge）で共有する、Markdown の変換と本文の見た目のパッケージ。
Markdown の表示を直すときは、アプリではなくこのリポジトリで直す。

## 主な機能

- Markdown の変換（`kinari-md/markdown`）：GFM、フロントマターの題、コールアウト、コードの色分け、数式、表、見出しの一覧、リンクと画像の書き換え（アプリから関数で渡す）。書き方を絞る仕組み・サニタイズ・コードの行番号はまだない（#4）
- 本文の見た目（`kinari-md/body.css`）：見出し・リスト・コード・表・コールアウト・数式・図・画像。地・文字・差し色などはアプリのトークンを読み、Markdown の表示だけが使う色（`kinari-md/tokens.css`）はライトとダークの2組をこのパッケージが持つ
- Mermaid の図をブラウザで描く（`kinari-md/mermaid`。ライトとダークに合わせて描き直す）
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

入口は4つ。

| 入口 | 中身 |
| --- | --- |
| `kinari-md/markdown` | `renderMarkdown(source, options?)`。Markdown を HTML にし、題・見出しの一覧・切れたリンクと画像の一覧と一緒に返す。サーバーで呼べる |
| `kinari-md/body.css` | 本文の入れ物 `.kinari-body` の中の見た目（KaTeX の CSS も中で読み込む） |
| `kinari-md/mermaid` | `drawMermaid(body)`。本文の中の Mermaid の図をブラウザで描く |
| `kinari-md/tokens.css` | Markdown の色（コードの色分け・コードの地と行番号・コールアウトの3色）と表の列の幅。ライトとダークの2組で、`<html>` の `data-theme` に従う |

本文の CSS は、アプリのトークン（`--color-bg`・`--color-surface`・`--color-text`・`--color-muted`・`--color-border`・`--color-accent`・`--color-info`・`--color-success`・`--color-warning`・`--color-danger`、`--font-body`・`--font-ui`・`--font-mono`、`--spacing`・`--text-sm` など）と、本文の文字の大きさ `--reading-size` を読む。アプリの CSS でこれらを決めてから読み込む。

```css
/* アプリの globals.css */
@import "kinari-md/tokens.css";
@import "kinari-md/body.css";
```

変換はサーバーの部品で呼べる。相対のリンクと画像は、アプリが関数（`resolve`）を渡して書き換える。渡さなければ書き換えない。

```ts
import { renderMarkdown } from "kinari-md/markdown";

const { title, html, headings, brokenLinks, brokenImages } = renderMarkdown(source, {
  // 相対の href・src ごとに呼ばれる。書き換えないなら undefined を返す
  resolve: ({ kind, href }) => {
    if (kind === "link" && href.endsWith(".md")) {
      const path = `/notes/${href.slice(0, -".md".length)}`;
      return { href: path, missing: !noteExists(path) }; // missing なら brokenLinks に入る
    }
    return undefined;
  },
});
// title：フロントマターの title（なければ undefined）
// headings：h2・h3 の { id, text, depth }。id は見出しの data-heading の値
// 書き換えたリンクには data-internal-link が付く
```

図は、HTML を入れた本文の入れ物を渡してブラウザで描く。`<html>` の `data-theme` が変わると描き直し、返した関数でやめる。

```tsx
"use client";
import { drawMermaid } from "kinari-md/mermaid";
import { useEffect, useRef } from "react";

export function NoteBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return drawMermaid(ref.current);
  }, [html]);
  return <div ref={ref} className="kinari-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
```

詳しい動きは [docs/specs/markdown.md](docs/specs/markdown.md)。

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

3. アプリの `next.config.ts` に `transpilePackages: ["kinari-md"]` を足し（まだなければ）、使う場所で入口を読み込んで、`next build`（と `tsc --noEmit`）や `next dev` で確かめる

4. 確かめ終わったら、アプリを元に戻す（アプリにはコミットしない）
   - 足した行を `git checkout` で戻す
   - `node_modules/kinari-md` を消す（または `npm ci`）
   - `next build` が `tsconfig.json` の `include` を書き換えることがあるので、最後に `git status` で確かめ、変わっていれば戻す

kinari-md をさらに直したときは、1 からやり直す。tgz はコピーなので、kinari-md を直してもアプリの中身は自動では変わらない。

## 使っている技術

- TypeScript（ビルドせずに配り、アプリの Next.js の `transpilePackages` でビルドする）
- Markdown の変換：unified（remark・rehype）、highlight.js、KaTeX、yaml。図：mermaid
- 見本のページ：Next.js 16（App Router）、React 19、Tailwind CSS 4
- テスト：Vitest。見本のページの画像を、Playwright の公式の Docker イメージに日本語の書体を入れたイメージで撮って比べる（ライトとダーク、スマホと PC の幅）
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
