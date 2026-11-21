import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkTokens, findOffTokenValues } from "./check-tokens.mjs";

describe("findOffTokenValues", () => {
  it("色コードを、行の番号つきで見つける", () => {
    const css = ".a {\n  color: var(--color-text);\n  background: #3366ff;\n}";
    expect(findOffTokenValues(css)).toEqual([{ line: 3, value: "#3366ff" }]);
  });

  it("rgb() と hsl() の色を見つける", () => {
    const css = ".a { color: rgb(0 0 0 / 0.5); border-color: hsl(10 20% 30%); }";
    expect(findOffTokenValues(css).map((v) => v.value)).toEqual(["rgb(", "hsl("]);
  });

  it("px の値を見つける", () => {
    const css = ".a { padding: 13px; }";
    expect(findOffTokenValues(css)).toEqual([{ line: 1, value: "13px" }]);
  });

  it("トークンの変数と rem だけなら、何も見つけない（セレクタの # や : は見ない）", () => {
    const css =
      '@import "tailwindcss";\n.a:hover { color: var(--color-accent); margin: 1rem; }\n#main { width: 100%; }';
    expect(findOffTokenValues(css)).toEqual([]);
  });

  it("コメントの中の値は見つけない", () => {
    const css = "/* 以前は #3366ff と 13px だった */\n.a { color: var(--color-text); }";
    expect(findOffTokenValues(css)).toEqual([]);
  });
});

describe("checkTokens", () => {
  let root;

  function put(path, content) {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }

  afterEach(() => {
    if (root) rmSync(root, { recursive: true, force: true });
  });

  it("2つのトークンファイルと node_modules は見ず、ほかの .css の値を見つける", () => {
    root = mkdtempSync(join(tmpdir(), "check-tokens-"));
    put("src/styles/tokens.css", ":root { --color-code-bg: #f2ede0; }");
    put("sample/app/tokens.css", ":root { --c-bg: #fbf8f1; --reading-size: 16px; }");
    put("node_modules/x/a.css", ".a { color: #000; }");
    put("src/styles/body.css", ".a {\n  color: #123456;\n}");
    expect(checkTokens(root)).toEqual(["src/styles/body.css:2  #123456"]);
  });
});
