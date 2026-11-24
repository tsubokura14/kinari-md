import { describe, expect, test } from "vitest";
import { renderMarkdown } from "./render";

describe("行番号", () => {
  test("選ばなければ、コードブロックに行番号を付けない", () => {
    const result = renderMarkdown("```js\nconst a = 1;\n```\n");
    expect(result.html).toBe(
      '<pre><code class="language-js"><span class="hljs-keyword">const</span> a = <span class="hljs-number">1</span>;\n</code></pre>',
    );
  });

  test("選ぶと、色分けしたコードを行ごとに分け、pre に行数の桁を付ける", () => {
    const result = renderMarkdown("```js\nconst a = 1;\nconst b = 2;\n```\n", {
      lineNumbers: true,
    });
    expect(result.html).toBe(
      '<pre class="line-numbers" style="--line-digits: 1"><code class="language-js">' +
        '<span class="code-line"><span class="hljs-keyword">const</span> a = <span class="hljs-number">1</span>;</span>\n' +
        '<span class="code-line"><span class="hljs-keyword">const</span> b = <span class="hljs-number">2</span>;</span>\n' +
        "</code></pre>",
    );
  });

  test("10行あれば、桁は2になる（9行なら1）", () => {
    const lines = (n: number) => Array.from({ length: n }, (_, i) => `l${i + 1}`).join("\n");
    const nine = renderMarkdown("```\n" + lines(9) + "\n```\n", { lineNumbers: true });
    const ten = renderMarkdown("```\n" + lines(10) + "\n```\n", { lineNumbers: true });
    expect(nine.html).toContain('style="--line-digits: 1"');
    expect(ten.html).toContain('style="--line-digits: 2"');
    expect(ten.html.match(/class="code-line"/g)).toHaveLength(10);
  });

  test("複数行のコメントは、行の終わりで閉じ、次の行の頭で開き直す", () => {
    const result = renderMarkdown("```js\n/* a\nb */\n```\n", { lineNumbers: true });
    expect(result.html).toContain(
      '<span class="code-line"><span class="hljs-comment">/* a</span></span>\n' +
        '<span class="code-line"><span class="hljs-comment">b */</span></span>\n',
    );
  });

  test("複数行の文字列は、行の終わりで閉じ、次の行の頭で開き直す", () => {
    const source = '```python\nx = """a\nb"""\n```\n';
    const result = renderMarkdown(source, { lineNumbers: true });
    expect(result.html).toContain(
      '<span class="code-line">x = <span class="hljs-string">&quot;&quot;&quot;a</span></span>\n' +
        '<span class="code-line"><span class="hljs-string">b&quot;&quot;&quot;</span></span>\n',
    );
  });

  test("色分けしないコードも、文字を符号化したまま行ごとに分ける", () => {
    const result = renderMarkdown("```\n<b>\n\nx\n```\n", { lineNumbers: true });
    expect(result.html).toBe(
      '<pre class="line-numbers" style="--line-digits: 1"><code>' +
        '<span class="code-line">&#x3C;b></span>\n' +
        '<span class="code-line"></span>\n' +
        '<span class="code-line">x</span>\n' +
        "</code></pre>",
    );
  });

  test("mermaid のブロックと文の中のコードには付けない（ほかのブロックには付ける）", () => {
    const source = "`a`\n\n```mermaid\nflowchart LR\n```\n\n```sh\nls\n```\n";
    const result = renderMarkdown(source, { lineNumbers: true });
    expect(result.html).toContain(
      '<pre data-mermaid=""><code class="language-mermaid">flowchart LR\n</code></pre>',
    );
    expect(result.html).toContain("<p><code>a</code></p>");
    expect(result.html.match(/class="line-numbers"/g)).toHaveLength(1);
  });

  test("コードだけでも付けられる。mermaid のブロックには付けない", () => {
    const source = "```mermaid\nflowchart LR\n```\n\n```python\nprint(1)\n```\n";
    const result = renderMarkdown(source, { syntax: "code", lineNumbers: true });
    expect(result.html).toContain(
      '<pre><code class="language-mermaid">flowchart LR\n</code></pre>',
    );
    expect(result.html).toContain(
      '<pre class="line-numbers" style="--line-digits: 1"><code class="language-python"><span class="code-line">',
    );
  });
});
