# yaml

書いた時点のバージョン：2.9.1

## 何か

YAML を JavaScript の値に読む（と書く）道具。

- 公式：https://eemeli.org/yaml/ 、https://github.com/eemeli/yaml

## このプロジェクトで使っている部分

- `src/markdown/render.ts` で、フロントマター（`remark-frontmatter` が取り出した先頭の YAML）を `parse` で読み、`title` を取り出す
  - 壊れた YAML は `parse` が例外を出すので、受け止めて「題なし」にする
  - `title: 2024` のような値は数として読まれる
