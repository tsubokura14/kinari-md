# highlight.js

書いた時点のバージョン：11.12.0

## 何か

コードを言語に合わせて色分けする道具。コードの文字を、種類ごとのクラス（`hljs-keyword` など）を付けた `span` の HTML にする。

- 公式：https://highlightjs.org/ 、https://github.com/highlightjs/highlight.js

## このプロジェクトで使っている部分

- `src/markdown/highlight.ts` で、よく使う言語だけを入れた `highlight.js/lib/common` を読み込む
  - `hljs.getLanguage(言語)` で知っている言語か確かめ、知っていれば `hljs.highlight(コード, { language, ignoreIllegals: true })` の `value`（HTML）を使う。知らない言語は色を付けない
- highlight.js のテーマの CSS は読み込まない。色は `src/styles/body.css` の `.hljs-*` が、`kinari-md/tokens.css` の `--color-code-*` を読んで付ける
