# unified（remark・rehype）

書いた時点のバージョン：unified 11.0.5、remark-parse 11.0.0、remark-gfm 4.0.1、remark-frontmatter 5.0.0、remark-math 6.0.0、remark-breaks 4.0.0、remark-cjk-friendly 2.3.4、remark-rehype 11.1.2、rehype-stringify 10.0.1、vfile 6.0.3、@types/mdast 4.0.4、@types/hast 3.0.5

## 何か

文章を木（構文木）にして、プラグインで順に書き換え、最後に文字に戻す仕組み。Markdown の木（mdast）を扱うのが remark、HTML の木（hast）を扱うのが rehype。

- 公式：https://unifiedjs.com/ 、https://github.com/unifiedjs/unified
- remark のプラグイン：https://github.com/remarkjs/remark/blob/main/doc/plugins.md
- remark-cjk-friendly：https://github.com/tats-u/markdown-cjk-friendly
- vfile：https://github.com/vfile/vfile

## このプロジェクトで使っている部分

- `src/markdown/render.ts` に、処理の並び（`unified().use(...)`）を1つだけ作り、`processSync` で同期で変換する
  - Markdown の側：`remark-parse`（読み込み）→ `remark-cjk-friendly`（日本語の強調）→ `remark-frontmatter`（先頭の YAML を `yaml` のノードにする）→ `remark-gfm` → `remark-math` → 自前のコールアウト（`callouts.ts`）→ `remark-breaks`（1つの改行を改行に）
  - `remark-rehype` で HTML の木にする。`handlers.html` で、本文の HTML のタグを文字にする
  - HTML の側：自前の処理（外へのリンク・`links.ts`・`math.ts`・`highlight.ts`・`tables.ts`・`headings.ts`）→ `rehype-stringify`（`allowDangerousHtml: true` で、KaTeX と highlight.js の結果の raw ノードをそのまま出す）
- 自前の処理は「木を受け取って書き換える関数」を返すプラグインとして書いている（`(tree, file) => void`）。木の型は `@types/mdast`・`@types/hast` から読む
- `vfile` の `VFile` を、変換に渡す入れ物に使う。`data` に呼ぶ側の `resolve` を入れて渡し、処理の途中で題・見出しの一覧・切れたリンクを `file.data` に置いて、`renderMarkdown` が取り出す
