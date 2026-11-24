// 見本の問題（memory-forge での使い方の例）。問題文・選択肢・解説の Markdown

/** 問題文。コードだけ・行番号ありで変換する */
export const question = `次のコードを実行したとき、3行目で出力される値はどれか。

\`\`\`python
items = [3, 1, 2]
items.sort()
print(items[0])
\`\`\`
`;

/** 選択肢。コードだけで変換し、A〜D の記号を付けて並べる */
export const choices = [
  { label: "A", body: "`1`" },
  { label: "B", body: "`2`" },
  { label: "C", body: "`3`" },
  { label: "D", body: "`[1, 2, 3]`" },
];

/** 解説。すべての書き方で変換する */
export const explanation = `\`sort()\` は、リストそのものを小さい順に並べ替えます。並べ替えたあとの \`items\` は \`[1, 2, 3]\` なので、\`items[0]\` は **1** です。

> [!tip] ヒント
> 並べ替えた新しいリストがほしいときは \`sorted(items)\` を使います。
`;
