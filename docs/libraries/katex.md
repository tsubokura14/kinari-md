# KaTeX

書いた時点のバージョン：0.19.1

## 何か

TeX の数式を HTML にする道具。ブラウザでもサーバーでも動き、出した HTML は KaTeX の CSS と書体で数式の形になる。

- 公式：https://katex.org/ 、https://katex.org/docs/api

## このプロジェクトで使っている部分

- `src/markdown/math.ts` で `katex.renderToString(式, { displayMode, throwOnError: true })` を呼ぶ。文の中の式は `displayMode: false`、ブロックは `true`
  - 式にできないと例外が出るので、受け止めて、書いたままの文字を出す
- `src/styles/body.css` の先頭で `katex/dist/katex.min.css` を読み込む（書体のファイルもその CSS から読まれる）。アプリは `kinari-md/body.css` を読み込めば、KaTeX の CSS を別に読み込まなくてよい
