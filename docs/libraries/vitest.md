# Vitest

書いた時点のバージョン：5.1.0

## 何か

Vite の仕組みで動くテストの道具。TypeScript をそのまま実行でき、Jest に近い書き方（`test`、`expect`）をする。

- 公式：https://vitest.dev/

## このプロジェクトで使っている部分

- `npm test` は `vitest run`（一度だけ実行し、ファイルの変更を見張らない）。`npm test -- <パス>` でファイルを絞る
- `vitest.config.mts`
  - `include`：`src/`・`scripts/`・`.claude/hooks/` の `*.test.ts`・`*.test.mts`・`*.test.mjs`。どれも Node で動かす
  - `passWithNoTests`：テストのファイルがなくても成功にする
- `test` などは `vitest` から import して使う（グローバルにしていない）
