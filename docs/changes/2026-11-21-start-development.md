<!--
変更の仕様のひな形。コピーして docs/changes/<年-月-日>-<何をするか>.md を作る（例：2026-09-17-add-due-date.md）。
「なぜ」〜「調べたこと」は、AIが下書きし、人間がプロトタイプを触って直し、合意して決める（/dev-proto）。「画面」のスクリーンショットは、合意したときに足す。
「設計」以降はAIが書いて実装まで進め、人間は機能の PR でレビューする（/dev-build）。
スクリーンショットは、このファイルと同じ名前のフォルダに置く（例：2026-09-17-add-due-date/list-empty.png）。
-->

# 開発を始められる（#1）

## なぜ

kinari-md は、シリーズのアプリ（md-leaf・memory-forge）の Markdown の表示を1か所にまとめるパッケージ（`docs/overview.md`）。中身を移す前に、テストを先に書いて進められる土台と、アプリと同じ入れ方を試せる見本のページの入れ物、画像を比べる仕組みを作る。
また、このリポジトリを手元のアプリから入れて確かめる方法を、最初に決めておく。決まらないと、中身を移すたびにタグを打って確かめることになり、手間が大きいため（手間が大きすぎれば、別のリポジトリにする決めごと自体を見直す）。

## 影響する今の仕様

- 新規（`docs/specs/` に書く動きはない）

## 使う場面

1. 開発する人が、Markdown の変換のテストを1つ書いて実行すると、失敗したことが分かり、直すと通る
2. 開発する人が、見本のページを手元で開くと、ライトとダークを切り替えて見られる。画像を撮り直すコマンドで、ライトとダークの両方の画像が残る
3. 開発する人が、md-leaf のフォルダで、手元の kinari-md の変更を入れて md-leaf を動かし、変更が md-leaf の画面に出ることを確かめられる

## 受け入れ条件

- 単体のテストを、1つのコマンドで実行できる。ファイルを絞って実行することもできる
- Lint と型チェックを、それぞれ1つのコマンドで実行できる。トークンにない値（色コード・px など）を書くと Lint が見つける
- アプリがこのリポジトリを GitHub のタグを指定して入れると、`kinari-md/markdown` などの入口から読み込める（中身はまだ空でよい。入口が読み込めることを確かめる）
- Markdown の色（コードの色分け・コードの地と行番号・コールアウトの3色）のトークンファイルが、ライトとダークの2組である。値は `docs/tokens.css`（立ち上げで仮置きしたもの）の Markdown の色と同じ
- 見本のページの入れ物を手元で開ける。上の帯でライト・ダークを切り替えられる（中身の Markdown は #2 で入れる）
- 見本のページの画像を、決まった環境（Docker）で撮り直せ、基準の画像と比べるテストができる。ライトとダークの両方を撮る
- PR を出すと、テスト・Lint・型チェック・画像を比べるテストが自動で走り、結果が PR に出る。失敗したら、基準・今回・差分の画像が残る
- AI がファイルを編集すると、そのファイルだけが自動で整形される
- 手元のアプリ（md-leaf）から、手元の kinari-md の変更を入れて確かめる手順が決まり、`README.md` か `CLAUDE.project.md` に書いてある。その手順で、実際に md-leaf から kinari-md の入口を読み込めた
- `README.md` に、このパッケージが何か、アプリへの入れ方、手元での確かめ方が書いてある

## 画面

- なし（見本のページの入れ物だけ。中身と見た目は #2 で、立ち上げで合意した `docs/agreed-screens/sample-*.png` に合わせる）

## やらないこと

- Markdown の変換と本文の見た目を移すこと（#2）
- 見本のページのデプロイ（#3）
- 書き方を絞る仕組み・サニタイズ・行番号（#4）
- アプリ（md-leaf・memory-forge）の中を変えること。確かめるために手元で入れるだけで、アプリのリポジトリにはコミットしない

## 先に要る機能

- なし

## 決まっていないこと

- [x] 見本のページを公開する？（推す答え：公開しない） → 誰でも見られる形では公開しない。本人だけが見られる形でデプロイし、スマホで確かめる（#3）
- [x] 本文の文字の大きさのメニューを入れる？（推す答え：入れない。本文の大きさを外から変えられる作りだけ） → おすすめのまま
- [x] 目次はどこまで入れる？（推す答え：見出しの一覧を作る処理だけ） → おすすめのまま
- [x] 版の付け方は？（推す答え：v0.x のあいだ `CHANGELOG.md` に変わったところを書き、壊れる変更も版を上げて入れてよい） → おすすめのまま
- [x] トークンと画面の部品も共有する？（推す答え：今は共有しない。各アプリが持ち、名前だけ揃える） → おすすめのまま。kinari-md は Markdown の部分だけ
- [x] Markdown の表示だけの色はどこに置く？（推す答え：kinari-md がライト・ダークで持つ） → おすすめのまま
- [x] 見本のページの作り（推す答え：同じリポジトリの中に見本用の Next.js 16。比べた案：Vite の静的なページ＝軽いがアプリと入れ方が違う／スクリプトで HTML を作る＝いちばん軽いが、ブラウザで動く部分を本物の形で試せない） → おすすめのまま
- [x] デプロイ先と見られる人の絞り方（推す答え：Vercel の Hobby に、Vercel の認証を全部のデプロイにかける。比べた案：md-leaf と同じ Google ログイン＝確実だが仕組みと鍵が増える／パスワードの保護＝Hobby では使えない／GitHub Pages＝本人だけに絞れない） → おすすめのまま（デプロイは #3）

## 技術の確認表

| 項目 | 当てはまるもの | 決めた人 |
| --- | --- | --- |
| 保存するデータ | なし | 人（`docs/overview.md`） |
| 外部サービス | Vercel（見本のページだけ。デプロイは #3） | 人 |
| 認証・権限 | アプリの認証はなし。見本のページは Vercel の認証で本人だけ（#3） | 人 |
| 費用 | なし（Vercel の Hobby、GitHub Actions は公開リポジトリで無料） | 人 |
| 個人情報 | なし | 人 |
| デプロイの環境 | パッケージは GitHub のタグで配り、デプロイしない。見本のページは Vercel（#3） | 人 |
| 新しいライブラリ | TypeScript・unified 一式・highlight.js・KaTeX・mermaid（人。`docs/overview.md`）。見本用の Next.js 16（人）。Vitest・Playwright・ESLint・Prettier（AI。条件に合う） | 人・AI |
| 取り消せない操作 | なし | AI |
| 共通の部品・トークン | Markdown の色のトークンを新しく作る（`docs/ui.md`） | 人（立ち上げで合意） |
| `docs/design.md` の決まり | 新しく書く（構成、トークンの分け方、画像の比べ方） | AI（仕上げで書く） |

## 調べたこと

- Vercel の認証（Vercel Authentication）：公式ドキュメント（Deployment Protection）では、すべてのプランで使え、「全部のデプロイ」の範囲も選べるとある。標準の範囲（Standard Protection）は本番のドメインを守らない。`<名前>.vercel.app` が守られるかはドキュメントで読み切れなかったので、#3 で実際に開いて確かめる

---

## 設計

<!--
変えるファイル、データの変更、やり方を選んだ理由。
理由と前提には、仕上げたあとに残す場所も書く（そのコードだけに関わるならコメント、複数の場所に関わるなら docs/design.md）。
docs/design.md と食い違う設計になるなら、そのことも書く
-->

### 構成（仕上げで `docs/design.md` の「全体の構成」に移す）

| 場所 | 中身 | アプリに入るか |
| --- | --- | --- |
| `package.json`（一番上） | パッケージ `kinari-md`。`exports` で入口を決め、`files` で `src/` だけを配る。見本・テストの道具は `devDependencies` | 入る（`dependencies` と `files` の中身だけ） |
| `src/markdown/index.ts` | 入口 `kinari-md/markdown`。今は空に近い（値を1つ出すだけ）。中身は #2 | 入る |
| `src/styles/tokens.css` | 入口 `kinari-md/tokens.css`。kinari-md が持つ Markdown の値（色のライト・ダーク2組と、表の列の幅） | 入る |
| `sample/` | 見本のページ（Next.js 16 の App Router。`next dev sample` で動かす）。見本だけの「アプリが持つ」トークン `sample/app/tokens.css` もここ | 入らない |
| `e2e/` | 見本のページを動かすテストと、画像を比べるテスト（Playwright） | 入らない |
| `scripts/` | Docker で Playwright を動かす、トークンにない値を見つける、などの道具 | 入らない |

- package.json を1つにする理由：GitHub のタグで入れると一番上のパッケージしか入らない（`docs/overview.md` の「やらないこと」）。見本を別の package.json にすると、npm の workspaces か `file:` のリンクが要り、Turbopack がリンクの先を扱いにくい
- `src/` は TypeScript のまま配り、ビルドしない。アプリは `transpilePackages: ["kinari-md"]` でビルドする。前提（崩れたら見直す）：使うアプリがどれも Next.js で `transpilePackages` を使える。アプリの `tsc` が `node_modules/kinari-md/src` の `.ts` も型チェックするので、`src/` は strict で通る書き方にする
- `package.json` に `prepare` などのスクリプトを置かない。GitHub から入れるとき、npm が `prepare` を見つけると devDependencies まで入れて実行するため
- 見本のページは、アプリと同じく `kinari-md/markdown` のようにパッケージの名前で読み込み、`transpilePackages` を通す（アプリと同じ入れ方を見本で先に試すため）。名前の解決は、まず `exports` の自分自身の参照（self-reference）で試す。Turbopack で解決できなければ、`sample/next.config.ts` の `turbopack.resolveAlias` で `src/` を指し、「AIが決めたこと」に書く

### トークン（仕上げで `docs/ui.md` の「トークン」と `docs/design.md` に移す）

- `docs/tokens.css` を2つに分けて移し、`docs/tokens.css` は消す
  - `src/styles/tokens.css`（kinari-md が持つ）：`--color-code-bg`・`--color-code-line`・`--color-code-keyword`・`--color-code-string`・`--color-code-comment`・`--color-callout-abstract`・`--color-callout-important`・`--color-callout-caution` を `:root`（ライト）と `[data-theme="dark"]`（ダーク）に、値をそのまま書く。表の列の幅 `--table-col-m`・`--table-col-l` も置く。Tailwind の `@theme` を使わない普通の CSS 変数にする（アプリの Tailwind の設定と `--*: initial` に左右されないため）
  - `sample/app/tokens.css`（見本だけ。アプリが持つものの代わり）：`docs/tokens.css` の残り（`@theme`、`--c-*` の地・文字・差し色・意味の色、書体、文字の段階、`--reading-size`、`data-accent`）。`@theme` の Markdown の色の行は外し、`src/styles/tokens.css` を読み込む
- トークンにない値を見つける Lint：トークンファイル（上の2つ）以外の `.css` から色コード・`rgb()`・`px` を見つける `scripts/check-tokens.mjs` と、`.ts`・`.tsx` の文字列の色コード・`px` と Tailwind の任意の値のクラス（`p-[13px]`）を見つける ESLint の規則。`npm run lint` で両方を走らせる

### 見本のページ（入れ物だけ）

- `sample/app/layout.tsx`：`<html data-theme="light" data-accent="leaf">`。上の帯（題「kinari-md 見本」と、ライト・ダークの2つのボタン）
- `sample/app/theme-switch.tsx`（クライアントの部品）：押すと `document.documentElement.dataset.theme` を `light`・`dark` にし、選んでいるボタンを差し色の地にする（`aria-pressed`）。選んだものは保存しない（仕様にないため）
- 本文の場所には、中身は #2 で入れることを示す仮の1文だけを置く。`kinari-md/markdown` から読み込んだ値を1つ使い、入口が読み込めることを見本のビルドで確かめる

### 画像を撮る仕組み（仕上げで `docs/design.md` に移す）

- md-leaf と同じ作り：`scripts/playwright-docker.mjs` が Playwright 公式の Docker イメージ（入れた Playwright と同じ版）の中で `playwright test` を動かす。`node_modules` と `sample/.next` は、フォルダごとの名前つきボリュームに分ける。環境変数 `CI` があれば Docker を使わずそのまま動く
- `playwright.config.ts`：`snapshotPathTemplate` を `docs/specs/screens/{arg}{ext}`、幅 390×844（スマホ）、サーバーは `next build sample` のあと `next start sample`（ポートは環境変数 `PORT`、既定 3100）
- 撮る画像：`sample-empty-light.png`・`sample-empty-dark.png`（中身のない入れ物。合意した `docs/agreed-screens/sample-*.png` は中身が入った状態なので、#2 で撮るまで消さない）

### 手元のアプリから確かめる手順（README.md に書く）

- kinari-md で `npm pack --pack-destination <置き場所>` で tgz を作り、アプリで `npm install --no-save <tgz のパス>` で入れる。アプリの `package.json` と `package-lock.json` は変わらない。戻すときはアプリで `npm ci`
- 理由：GitHub から入れるときと同じく `files` で絞った中身が `node_modules` にコピーされる（リンクではない）ので、Turbopack がプロジェクトの外を読む問題が起きない
- 確かめるには、アプリの `next.config.ts` に `transpilePackages: ["kinari-md"]` を足し、どこかで `kinari-md/markdown` を読み込んで `next build` する（確かめたら戻す。アプリにはコミットしない）

### CI（`.github/workflows/ci.yml`）

- `pull_request` で2つのジョブ：テスト・Lint・型チェック（ubuntu、Node 24）と、画像を比べるテスト（`container:` に `mcr.microsoft.com/playwright:v<版>-noble`）。失敗したら `playwright-report/` をアーティファクトに残す。CI では基準の画像を更新しない

### 編集したあとのフック

- md-leaf と同じ `.claude/hooks/format-on-edit.mjs`：`PostToolUse`（`Edit|Write`）で、編集したファイルだけに Prettier と（JS・TS なら）ESLint の `--fix` をかける。`.md` などは何もしない。必ず exit 0。`.claude/settings.json` に `command: node` と `args` で足す
- `.claude/rules/testing.md` の `paths:` を、`src/**/*.test.ts`・`scripts/**/*.test.mjs`・`.claude/hooks/**/*.test.mjs`・`e2e/**` に合わせる

## AIが決めたこと

<!--
decisions スキルの「AIが決めてよいもの」で、AIが選んだもの。人は PR で見る。
例：- 日付の表示に date-fns を入れる。理由：表示の書式を1つのファイルに閉じられる。比べた案：Intl.DateTimeFormat（相対表示「あと3日」が書けない）
-->

- 版：Next.js 16.4.6・React 19.3.0・Tailwind CSS 4.3.3（`@tailwindcss/turbopack`）・Playwright 1.65.0・Vitest 5・ESLint 9・Prettier 3 を、md-leaf と同じ版で入れる。理由：アプリと同じ入れ方を見本で試すのが目的で、Docker のイメージも共有できる。比べた案：それぞれの最新（アプリと版がずれ、見本で試した結果がアプリに当てはまらないことがある）
- テストの道具：Vitest（単体）、Playwright（見本のページを動かすテストと画像）、ESLint と Prettier。理由：md-leaf の変換のテストをそのまま移せる（`docs/overview.md`）。比べた案：Jest（ESM と TypeScript の設定が要る）
- リポジトリの形：package.json を1つにし、見本を `sample/` に置く。比べた案：npm の workspaces で見本を別のパッケージにする（リンクになり、Turbopack がリンクの先を扱いにくい）／見本の `app/` を一番上に置く（パッケージの `src/` と見本が混ざる）
- 手元のアプリで確かめる方法：`npm pack` の tgz を `npm install --no-save` で入れる。比べた案：`file:../kinari-md`・`npm link`（シンボリックリンクになり、Turbopack はプロジェクトの外を読めないので、アプリの `turbopack.root` を変える必要がある）／ブランチを push して `github:…#<ブランチ>` で入れる（毎回 push が要り遅い）
- Markdown の色のトークンは、Tailwind の `@theme` ではなく普通の CSS 変数（`--color-code-bg` など）で配る。理由：アプリの Tailwind の設定に左右されない。名前はアプリのトークンと同じく `--color-` で始める。比べた案：`@theme` で配る（アプリが Tailwind を使い、読み込む順番まで合わせる必要がある）
- 見本のページのライト・ダークは、保存せず、開くたびにライトから始める。理由：仕様にない機能を作らない。比べた案：localStorage に保存する（仕様にない）
- 画像の幅：スマホの 390×844 で撮る（md-leaf と同じ）。PC の幅は #2 で中身と一緒に足す
- `package.json` は `"private": true`、版は v0.1.0 のタグを打つまで `0.0.0`。理由：npm に公開しない（`docs/overview.md`）ので、誤って `npm publish` しても止まるようにする。`private` は GitHub のタグで入れるのには影響しない。比べた案：`private` を付けない（公開の操作を止めるものがない）
- 型チェックは一番上の `tsconfig.json` 1つで `src/` と `sample/` をまとめて行い、`sample/tsconfig.json` はそれを `extends` するだけにする。理由：Next.js は見本のフォルダの `tsconfig.json` を読み、なければ作るため要るが、設定を2か所に書かずに済む。比べた案：`sample/` だけの設定を別に持つ（strict などが2か所に分かれる）
- Tailwind のクラスを Lint で確かめるのに eslint-plugin-better-tailwindcss を md-leaf と同じ版（4.11.0、MIT）で入れ、`src/`・`sample/` の TS・TSX に、Tailwind にないクラスと任意の値のクラスを見つける規則をかける。理由：md-leaf と同じ規則で、任意の値のクラス（`p-[13px]`）を見つけられる。比べた案：`no-restricted-syntax` の正規表現だけで見つける（クラスの書き方の揺れを拾いきれず、Tailwind にないクラスは見つけられない）

## 確かめ方

<!-- 受け入れ条件ごとに「テスト」「触って確かめる」「コードを見て確かめる」のどれか。選び方は testing スキル -->

| 受け入れ条件 | 確かめ方 | 場所 |
| --- | --- | --- |
| 単体のテストを1つのコマンドで、ファイルを絞っても実行できる | 触って確かめる | `npm test`、`npm test -- scripts/check-tokens.test.mjs` |
| Lint・型チェックが1つのコマンド。トークンにない値を Lint が見つける | テスト ＋ 触って確かめる | `scripts/check-tokens.test.mjs`（色コード・px・rgb を見つける／セレクタとコメントは見ない）。`npm run lint`・`npm run typecheck` |
| GitHub のタグで入れると入口から読み込める | 触って確かめる | PR のブランチを push したあと、空のフォルダで `npm install github:tsubokura14/kinari-md#1-foundation` し、`node_modules/kinari-md` に `src/` と `exports` があること。見本のページがパッケージの名前で読み込んでビルドできること（画像を比べるテストの中でビルドされる） |
| Markdown の色のトークンファイルがライト・ダークの2組で、値が `docs/tokens.css` と同じ | コードを見て確かめる | `src/styles/tokens.css` |
| 見本のページの入れ物を開け、上の帯でライト・ダークを切り替えられる | テスト | `e2e/sample.spec.ts`（ダークを押すと `<html data-theme="dark">`、ライトで戻る） |
| 見本のページの画像を Docker で撮り直し、比べられる。ライトとダーク | テスト ＋ 触って確かめる | `e2e/sample.spec.ts` の画像（`sample-empty-light`・`sample-empty-dark`）、`npm run screenshots`・`npm run test:visual` |
| PR で自動で走り、失敗したら画像が残る | 触って確かめる | PR の Checks。`.github/workflows/ci.yml` |
| AI が編集したファイルだけ整形される | テスト ＋ 触って確かめる | `.claude/hooks/format-on-edit.test.mjs`（対象の拡張子だけ・リポジトリの外は何もしない）。Windows で実際に `.ts` を崩して編集し、整形されること |
| 手元の md-leaf で確かめる手順が書いてあり、実際に読み込めた | 触って確かめる ＋ コードを見て確かめる | `README.md` の手順。進行役が md-leaf で `npm pack` の tgz を入れ、`next build` を通した結果を PR に書く |
| README に何か・入れ方・確かめ方がある | コードを見て確かめる | `README.md` |

## タスク

<!-- 機能全体で1つのブランチ・1つの PR。タスクはその中のコミットのまとまりで、implementer が1回で作り終えられる、「〜ができたら完了」と1文で言える大きさ。データと画面は分ける。画面のタスクには合わせるスクリーンショットを書く -->

- [x] ひな形とテストの実行：一番上の `package.json`（`exports`・`files`）、`src/markdown/index.ts`、`sample/` の見本の Next.js（題だけのページで `kinari-md/markdown` を読み込む）、Vitest・ESLint・Prettier・tsconfig を作り、`npm test`・`npm run lint`・`npm run typecheck`・`npm run dev` が動き、`docs/overview.md` の「技術」と `CLAUDE.project.md` の「技術」「よく使うコマンド」、`docs/libraries/`（next・vitest）の下書きを書いたら完了
- [x] 本番のトークンファイル：`src/styles/tokens.css` と `sample/app/tokens.css` に分けて移し、`docs/tokens.css` を消し、トークンにない値を見つける Lint（`scripts/check-tokens.mjs` とテスト、ESLint の規則）を足し、`docs/ui.md` の「トークン」と `docs/design.md` を書いたら完了
- [x] 画像を撮る仕組み：Playwright を Docker で動かす `scripts/playwright-docker.mjs`、`playwright.config.ts`、今の見本のページを撮るテスト（`sample-empty-light.png`）を作り、`npm run screenshots`・`npm run test:visual` を `CLAUDE.project.md` に書き、`docs/design.md` と `docs/libraries/playwright.md` を書いたら完了
- [x] 見本のページの帯（画面。合わせるスクリーンショット：`docs/agreed-screens/sample-light.png`・`sample-dark.png` の上の帯のうち、題とライト・ダークのボタンだけ）：切り替えのテスト（`e2e/sample.spec.ts`）を先に書き、帯と切り替えを作り、`sample-empty-light.png`・`sample-empty-dark.png` を撮ったら完了
- [x] CI：`.github/workflows/ci.yml` を足したら完了
- [x] 編集したあとのフック：`.claude/hooks/format-on-edit.mjs` とテスト、`.claude/settings.json` の `PostToolUse` を足し、`.claude/rules/testing.md` の `paths:` を直し、Windows で実際に整形されることを確かめたら完了
- [ ] README：`README.md` に、何か・アプリへの入れ方（GitHub のタグと `transpilePackages`）・手元のアプリで確かめる手順（`npm pack`）・開発コマンドを書いたら完了
