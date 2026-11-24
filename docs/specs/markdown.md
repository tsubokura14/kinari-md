# Markdown の変換と本文の見た目

アプリは `transpilePackages: ["kinari-md"]` でビルドし、次の4つの入口から読み込む。

| 入口 | 中身 |
| --- | --- |
| `kinari-md/markdown` | `renderMarkdown(source, options?)` と型（`RenderedMarkdown`・`RenderOptions`・`Heading`・`Resolve`・`ResolveTarget`・`ResolveResult`） |
| `kinari-md/body.css` | 本文の入れ物 `.kinari-body` の中の見た目。KaTeX の CSS も中で読み込む |
| `kinari-md/mermaid` | `drawMermaid(body)`。本文の中の Mermaid の図をブラウザで描く |
| `kinari-md/tokens.css` | Markdown の色（コードの地・行番号・色分けの3色、コールアウトの abstract・important・caution）のライト（`:root`）とダーク（`[data-theme="dark"]`）の2組と、表の列の幅（`--table-col-m`・`--table-col-l`） |

## 変換（`renderMarkdown`）

`renderMarkdown(source, options?)` は次を返す。

| 返すもの | 中身 |
| --- | --- |
| `title` | フロントマター（先頭の `---` で囲んだ YAML）の `title`。数として読まれたもの（`title: 2024`）も文字にして返す。`title` がない・空・YAML が壊れているときは `undefined` |
| `html` | 本文の HTML。フロントマターは入らない |
| `headings` | 本文の h2・h3 の一覧（本文の順）。`{ id, text, depth }`。`id` は見出しに付けた `data-heading` の値（0 から本文の順の番号）。文字が空の見出しは入らず、印も付かない。コールアウトの中の見出しも入る |
| `brokenLinks` | 書き換えの関数が「行き先がない」と答えたリンク（書かれたままの形。`decodeURI` したもの）。関数を渡さなければいつも空 |
| `brokenImages` | 同じく画像 |

### 書き方ごとの出し方

- GFM：表・タスク（チェックボックス）・取り消し線・自動リンク
- 1つの改行は改行（`<br>`）になる
- 閉じの強調（`**`）の直前が日本語の括弧・句読点でも強調になる（見出しの一覧の文字も同じ）
- コールアウト（`> [!種類] 題`）
  - Obsidian 標準の11種類と別名を読む。決まりにない種類は note と同じ色とアイコンで出す
  - 色は `data-callout` の7つ（abstract・note・tip・important・warning・caution・danger）のどれかになる。info は note、example は abstract、question は warning、success は tip の色
  - 題を書かないときは、書いた種類名ごとの日本語の題（「メモ」「ヒント」「注意」など）。知らない種類は種類名をそのまま題にする
  - `-` は閉じた `details`、`+` は開いた `details` で出し、見出し（`summary`）を押すと開閉する。どちらもなければ `div`
  - 見出しの行は `.callout-title`（アイコン・題・開閉するものは矢印）、中身は `.callout-content`
- コード：言語を書いたブロックは、highlight.js が知っている言語なら色分けする。言語のないもの・知らない言語は色を付けずに出す
- 数式：文の中（`$…$`）とブロック（`$$…$$`）を KaTeX で出す。式にできないものは、書いたままの文字（`$` を含む）を `.math-error` で出す
- 表：`div.table-scroll`（横にスクロールする枠）で包む。セルには、その列のいちばん長いセルの文字数（全角2・半角1）で `col-s`（10まで）・`col-m`（24まで）・`col-l` のクラスが付く
- Mermaid：` ```mermaid ` のブロックは、色分けせず、`pre` に `data-mermaid` の印を付けて出す
- 外へのリンク（`http://`・`https://`）には `target="_blank"` と `rel="noopener noreferrer"` が付く
- 画像1つだけの段落は `figure` になり、代わりの文字（alt）があれば `figcaption` に出す

### 書き方を絞る（`options.syntax`）

- `"all"`（既定）：上の「書き方ごとの出し方」のすべて
- `"code"`：段落・改行（1つの改行も改行）・文の中のコード・コードブロック（色分けあり）だけを出す
  - それ以外（見出し・リスト・引用・コールアウト・表・強調・取り消し線・リンク・自動リンク・画像・数式・タスク・区切り線・フロントマター・字下げのコード・文字の参照・`\` の逃がし）は、書いたままの文字で出す（`# 1` は「# 1」、`**1**` は「\*\*1\*\*」）
  - ` ```mermaid ` のブロックは図の印を付けず、色を付けないコードブロックで出す
  - `title` はいつも `undefined`、`headings` はいつも空。`resolve` は渡せるが、リンクと画像がないので呼ばれない

### 行番号（`options.lineNumbers`）

- `true` にすると、その変換のコードブロックすべて（`mermaid` を除く）に、1から始まる行番号を付ける。既定は付けない。文の中のコードには付けない
- 行番号を付けたブロックは、`pre` に `line-numbers` のクラスと行数の桁（`style="--line-digits: N"`）が付き、コードは行ごとの `span.code-line` に分かれる。複数行にまたがる文字列やコメントも、行ごとに色分けが続く
- 番号は CSS（`body.css`）で出すので、HTML の文字には入らず、選んで写すときにも入らない

### 安全にする

書き方を選んでも選ばなくても、いつも行う。

- ノートの中の HTML のタグは、文字として出す（段落の外に書いたタグは文字の段落になる）
- リンクの行き先が、相対・`#` で始まるもの・`/` で始まるもの・`http:`・`https:`・`mailto:` のどれでもないとき（`javascript:`・`data:` など。大文字・前後の空白・タブ・文字の参照・`%` の符号化で隠したものも）は、リンクにせず、リンクの文字だけを出す
- 画像の場所が、相対・`/` で始まるもの・`http:`・`https:` のどれでもないときは、画像にせず、代わりの文字（alt）だけを出す。代わりの文字がなければ何も出さない
- 数式の中のリンク（`\href`・`\url`）はリンクにならない
- どれに当たっても、変換は止まらず、ほかの部分はふつうに出る

### リンクと画像の書き換え（`options.resolve`）

- `resolve` を渡すと、相対のリンク（a の `href`）と画像（img の `src`）ごとに `resolve({ kind: "link" | "image", href })` を呼ぶ
  - 相対でないもの（スキーム付き・`/` で始まる・`#` で始まる）では呼ばない
  - `href` は HTML に出る形（符号化されたもの。`#`・`?` のあとも含む）
- 関数が `{ href }` を返すと、その場所に書き換える。リンクには `data-internal-link` が付く（画像には付かない）
- `{ href, missing: true }` を返すと、書き換えたうえで `brokenLinks`・`brokenImages` に入る
- `undefined` を返すと、書き換えずにそのまま出す。`resolve` を渡さなければ何も書き換えない

## 本文の見た目（`kinari-md/body.css`）

- アプリは `html` を `.kinari-body` の入れ物に入れ、`kinari-md/tokens.css` と `kinari-md/body.css` を読み込む
- 色・書体・余白は、アプリのトークン（`--color-bg`・`surface`・`text`・`muted`・`border`・`accent`・`info`・`success`・`warning`・`danger`、`--font-body`・`--font-ui`・`--font-mono`、`--spacing` など）と `kinari-md/tokens.css` を読む。見た目の使い分けは `docs/ui.md`
- ライト・ダークは `<html data-theme>` だけで変わる
- 本文の文字の大きさは `--reading-size`。見出し（h2 は 1.41 倍、h3 は 1.18 倍）・コード・表・コールアウトの見出し・画像の代わりの文字（0.82 倍）も同じ倍率で変わる。余白は変わらない
- 文の中のコードは、枠のない、文字の色を 9% の濃さで置かれた場所の地に重ねた地で出す（コールアウトや箱の中ではその地より少し濃い。余白は上 0.13em・左右 0.2em・下 0.17em、`vertical-align: 0.12em`）。表の中のコードは地を付けず等幅にするだけ
- 行番号は code-line の色で、行数の桁の幅に右にそろえ、番号とコードのあいだを空ける。長い行は番号ごと枠の中で横にスクロールする
- 幅が `64rem` より狭いときは、コールアウトとコードの内側の余白が狭くなる
- コード・表・数式・図は、それぞれの枠の中でだけ横にスクロールし、本文全体は横に広がらない

## 図（`drawMermaid`）

- `drawMermaid(body)` に本文の入れ物を渡すと、中の `pre[data-mermaid]` を1つずつ SVG の図（`.mermaid-figure`）に替える。`mermaid` は描くときに読み込む
- 図の線と文字は `--color-text`、図の地は `--color-surface`、箱の地は `--color-bg`、強調は `--color-accent`、字は `--font-ui` の `--text-sm` の大きさ（`--reading-size` では変わらない）
- `<html>` の `data-theme` が変わると、今の色で描き直す（ほかの属性の変化では描き直さない）
- 描き終わるまでと、書き方を間違えて描けない図は、元のコードの `pre` のまま残る（エラーの文は出さない）
- 図は縮めず、もとの幅で出す。収まらなければ枠の中で横にスクロールする
- 返した関数を呼ぶと、描き直しをやめる。入れ物の中身を差し替えたら、やめてから呼び直す
