# Mermaid

書いた時点のバージョン：12.3.0

## 何か

文字で書いた図（流れ図・順序の図など）を、ブラウザで SVG に描く道具。大きいので、使うときだけ読み込む。

- 公式：https://mermaid.js.org/ 、設定：https://mermaid.js.org/config/schema-docs/config.html

## このプロジェクトで使っている部分

- `src/mermaid/index.ts`（入口 `kinari-md/mermaid`）で、描くときに `import("mermaid")` で読み込む
  - 描くたびに `mermaid.initialize(設定)` で今の色を渡し、`mermaid.render(id, 図の文字)` で SVG を作る。描けない図は例外になるので、元のコードのまま残す
  - `render` は描くために一時の要素をページに置くので、描いたあと（失敗したときも）その要素を消している
- `src/mermaid/config.ts` で設定（`MermaidConfig` の型）を作る
  - `theme: "base"` と `themeVariables` で、色をアプリのトークン（text・surface・bg・border・accent）から渡す
  - `look: "classic"` と `flowchart` の余白で、12 の既定（影つきの `neo`、幅をそろえる `minNodeWidth`）をやめている
  - `securityLevel` は既定の `strict` のまま、`startOnLoad: false`（ページを開いたときに勝手に描かせない）
