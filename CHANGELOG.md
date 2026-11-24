# 変更の記録

版を上げるたびに、変わったところを書く。v0.x のあいだは、名前を変えるなどの壊れる変更も入る（`docs/overview.md` の「技術」の版の付け方）。
入れるときは `npm install github:tsubokura14/kinari-md#v<版>`。

## v0.2.0

### 入ったもの

- `kinari-md/markdown`：`renderMarkdown(source, options?)` の `options` に2つ足した。どちらも選ばなければ今までと同じ
  - `syntax: "all" | "code"`（既定 `"all"`）：`"code"` にすると、段落・改行・文の中のコード・コードブロック（色分けあり）だけを出し、ほかの書き方は書いたままの文字で出す（`mermaid` は図にせず、`title` はいつも `undefined`、`headings` はいつも空）
  - `lineNumbers: boolean`（既定 `false`）：`true` にすると、その変換のコードブロックすべて（`mermaid` を除く）に、1から始まる行番号を付ける（`pre.line-numbers` と行ごとの `span.code-line`）。番号は CSS で出すので、選んで写すときに入らない
- `kinari-md/body.css`：行番号の見た目（code-line の色で右にそろえる）

### 変わったもの

- `kinari-md/markdown`：いつも安全にする。リンクの行き先が相対・`#`・`/`・`http:`・`https:`・`mailto:` のどれでもないとき（`javascript:` など）は、リンクにせず文字だけを出す。画像の場所が相対・`/`・`http:`・`https:` のどれでもないときは、画像にせず代わりの文字だけを出す。今まで通っていたこれらのリンクと画像は、出なくなる
- `kinari-md/body.css`：文の中のコードの見た目を変えた（md-leaf の本文も変わる）
  - 地：code-bg から、文字の色を地に 9% 混ぜた色に（コールアウトや箱の中でも見分けられる）
  - 余白：上下 0 → 上 0.13em・下 0.17em、左右 `calc(var(--spacing) * 1)` → 0.2em。`vertical-align: 0.12em` で、箱を日本語の文字の高さにそろえる
  - 表の中のコードは今までどおり地を付けない

## v0.1.1

### 直したもの

- `kinari-md/body.css`：文字の倍率を、移す前の md-leaf と同じにした（本文の大きさ `--reading-size` を1として、h2 は 1.5 → 1.41 倍、h3 は 1.25 → 1.18 倍、コード・文の中のコード・表・コールアウトの見出し・画像の代わりの文字は 0.875 → 0.82 倍）

## v0.1.0

md-leaf の Markdown の変換と本文の見た目を移した、最初の版。

### 入ったもの

- `kinari-md/markdown`：`renderMarkdown(source, options?)` が、題・HTML・見出しの一覧・切れたリンクと画像の一覧を返す
  - フロントマターの `title` を題にする（数も題にする。ない・空・壊れた YAML は `undefined`）。フロントマターは本文に出さない
  - GFM（表・タスク・取り消し線・自動リンク）、1つの改行を改行にする、閉じの強調の直前が日本語の括弧・句読点でも強調にする
  - コールアウト（Obsidian 標準の種類と別名、題、折りたたみの `-`・`+`）
  - コードの色分け（highlight.js）、数式（KaTeX。文の中とブロック）、表の列の幅（3段階）と横のスクロールの枠、Mermaid のブロックに図にする印
  - 本文の HTML のタグは文字として出す。外へのリンクは別のタブで開く
  - 見出しの一覧は h2・h3 を本文の順に返し、見出しに印（id と `data-heading`）を付ける
  - `options.resolve` で相対のリンクと画像を書き換える。書き換えたリンクには `data-internal-link` を付ける。行き先がないと答えたものは `brokenLinks`・`brokenImages` に入る。画像だけの段落は `figure` にする
- `kinari-md/body.css`：本文の入れ物 `.kinari-body` の中の見た目（KaTeX の CSS も中で読み込む）。色・書体・余白はアプリのトークンと `kinari-md/tokens.css` を読み、ライト・ダークは `<html>` の `data-theme` に従う。本文の文字の大きさは `--reading-size` で変えられる
- `kinari-md/mermaid`：`drawMermaid(body)` が本文の中の図をブラウザで描き、`data-theme` が変わると描き直す。返した関数を呼ぶとやめる
- `kinari-md/tokens.css`：Markdown の色（コードの色分け・コードの地と行番号・コールアウトの abstract・important・caution）のライトとダークの2組と、表の列の幅
- ライセンス：MIT
