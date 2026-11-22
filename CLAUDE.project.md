<!--
このプロジェクトだけのAIへのルール。Claude Code は CLAUDE.md から @ で読み込み、GitHub Copilot は AGENTS.md の指示で読む。
AGENTS.md と CLAUDE.md はテンプレートのものなので、このプロジェクトで決まりを足すときはこのファイルに書く（docs/template-files.md）
-->

# このプロジェクトのルール

## 技術

<!-- 立ち上げで決めたら書く。詳しくは docs/overview.md -->

- パッケージ：TypeScript 5.9 のまま配る（ビルドしない）。入口は一番上の `package.json` の `exports`（`kinari-md/markdown` → `src/markdown/index.ts`）、配る中身は `files`（`src/` だけ）。Node.js 24
  - `src/` は strict で通る書き方にする。`package.json` に `prepare` などのスクリプトを置かない（`docs/design.md` の「`src/` は TypeScript のまま配り、アプリがビルドする」）
- 見本のページ：`sample/` の Next.js 16（App Router）＋ React 19。パッケージには入らない。アプリと同じく `kinari-md/markdown` をパッケージの名前で読み込み（`exports` の自分自身の参照）、`transpilePackages` でビルドする（`sample/next.config.ts`）
  - 型チェックは一番上の `tsconfig.json` でまとめて行う。`sample/tsconfig.json` はそれを `extends` するだけ（Next.js が見本のフォルダで読むため）
- トークン：`src/styles/tokens.css`（入口 `kinari-md/tokens.css`。Markdown の色と表の列の幅）と、見本だけの `sample/app/tokens.css`。値はこの2つにだけ書く（`docs/design.md`）
- 見た目（見本のページ）：Tailwind CSS 4.3.3（`@tailwindcss/turbopack`。`sample/app/globals.css`）
- テスト：Vitest 5（`src/`・`scripts/`・`.claude/hooks/` の `*.test.ts`・`*.test.mjs` を Node で動かす。`vitest.config.mts`）
- 画像のテスト：Playwright 1.65.0（`e2e/`、`playwright.config.ts`）。公式の Docker イメージに日本語の書体を入れたイメージ（`docker/playwright/`）の中で動かす（`scripts/playwright-docker.mjs`。Docker Desktop が要る）
- Lint：ESLint 9（`eslint-config-next`、`eslint-plugin-better-tailwindcss`）と、CSS のトークンにない値を見つける `scripts/check-tokens.mjs`
- 整形：Prettier 3（`.prettierrc.json`）
- Next.js の使い方は、学習した知識ではなく `node_modules/next/dist/docs/` で確かめる（16 は前の版と書き方が違うところがある）

## よく使うコマンド

<!-- 起動、テスト、Lint、型チェック、本番の画面を撮り直す、画像を比べるテスト -->

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 見本のページの開発サーバー（http://localhost:3000、`next dev sample`） |
| `npm run build` | 見本のページを `next build sample` でビルドする |
| `npm test` | 単体のテストを一度だけ実行する。ファイルを絞るときは `npm test -- <パス>` |
| `npm run lint` | Lint（ESLint と、CSS のトークンにない値を見つける `scripts/check-tokens.mjs`） |
| `npm run typecheck` | 型チェック（見本のページのルートの型を作ってから `tsc --noEmit`） |
| `npm run screenshots` | 見本のページの画像を Docker の Playwright で撮り直す（違うものとないものだけ。`docs/specs/screens/`）。絞るときは `npm run screenshots -- <パス>` |
| `npm run test:visual` | 見本のページの画像を基準と比べる（撮り直さない）。失敗したら `playwright-report/` に基準・今回・差分の画像が残る |
| `npm run format` | コード（`.ts .tsx .js .mjs .cjs .jsx .css .json`）を Prettier でまとめて整形する |

## うまくいかなかったことから追加したルール

<!-- 同じ注意を2回しないために、日付つきで書き足す。使わなくなったら消してよい。例：
- 2026-09-17: 日付の比較は、時刻を切り捨ててから行う
-->
