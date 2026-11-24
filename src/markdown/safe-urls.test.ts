import { describe, expect, test } from "vitest";
import { renderMarkdown, type ResolveTarget } from "./render";

describe("危ないリンクを通さない", () => {
  test("javascript: のリンクはリンクにせず、リンクの文字だけを出す", () => {
    const result = renderMarkdown("前 [ここを押す](javascript:alert(1)) 後\n");
    expect(result.html).toBe("<p>前 ここを押す 後</p>");
  });

  test.each([
    ["大文字", "[a](JavaScript:alert(1))"],
    ["data:", "[a](data:text/html,x)"],
    ["vbscript:", "[a](vbscript:msgbox(1))"],
    ["文字の参照で隠したもの", "[a](&#106;avascript:alert(1))"],
    ["タブを挟んだもの", "[a](java&#9;script:alert(1))"],
    ["先頭の空白", "[a](<&#32;javascript:alert(1)>)"],
    ["% で符号化したタブを挟んだもの", "[a](java%09script:alert(1))"],
    ["自動リンク", "<javascript:alert(1)>"],
    ["参照の形", "[a][x]\n\n[x]: javascript:alert(1)"],
  ])("%s もリンクにしない", (_name, source) => {
    const result = renderMarkdown(`${source}\n`);
    expect(result.html).not.toMatch(/<a[\s>]/);
  });

  test.each([
    ["相対", "[a](memo.md)", 'href="memo.md"'],
    ["# で始まる", "[a](#見出し)", 'href="#'],
    ["/ で始まる", "[a](/notes/a)", 'href="/notes/a"'],
    ["http:", "[a](http://example.com)", 'href="http://example.com"'],
    ["https:", "[a](https://example.com)", 'href="https://example.com"'],
    ["mailto:", "[a](mailto:a@example.com)", 'href="mailto:a@example.com"'],
  ])("%s のリンクは通す", (_name, source, href) => {
    const result = renderMarkdown(`${source}\n`);
    expect(result.html).toContain(`<a ${href}`);
  });

  test("危ないリンクは、書き換えの関数に渡さない", () => {
    const calls: ResolveTarget[] = [];
    renderMarkdown("[a](java%09script:alert(1)) [b](memo.md)\n", {
      resolve: (target) => {
        calls.push(target);
        return undefined;
      },
    });
    expect(calls).toEqual([{ kind: "link", href: "memo.md" }]);
  });
});

describe("危ない画像を通さない", () => {
  test("javascript: の画像は画像にせず、代わりの文字だけを出す", () => {
    const result = renderMarkdown("前 ![図の説明](javascript:alert(1)) 後\n");
    expect(result.html).toBe("<p>前 図の説明 後</p>");
  });

  test("代わりの文字がなければ、何も出さない", () => {
    const result = renderMarkdown("前 ![](data:image/svg+xml,x) 後\n");
    expect(result.html).toBe("<p>前  後</p>");
  });

  test("画像だけの段落でも、figure にせず代わりの文字の段落にする", () => {
    const result = renderMarkdown("![図の説明](data:image/png;base64,x)\n");
    expect(result.html).toBe("<p>図の説明</p>");
  });

  test.each([
    ["# で始まる", "![a](#x)"],
    ["mailto:", "![a](mailto:a@example.com)"],
  ])("%s の画像も通さない", (_name, source) => {
    const result = renderMarkdown(`${source}\n`);
    expect(result.html).not.toContain("<img");
  });

  test.each([
    ["相対", "![a](図.png)"],
    ["/ で始まる", "![a](/images/a.png)"],
    ["http:", "![a](http://example.com/a.png)"],
    ["https:", "![a](https://example.com/a.png)"],
  ])("%s の画像は通す", (_name, source) => {
    const result = renderMarkdown(`${source}\n`);
    expect(result.html).toContain("<img");
  });
});

describe("ほかの安全にする決まり", () => {
  test("数式の中の \\href・\\url はリンクにならない", () => {
    const result = renderMarkdown(
      "$\\href{javascript:alert(1)}{x}$ と $\\url{https://example.com}$\n",
    );
    expect(result.html).not.toMatch(/<a[\s>]/);
  });

  test("危ないリンク・HTML のタグがあっても、変換は止まらず、ほかの部分はふつうに出る", () => {
    const result = renderMarkdown(
      "## 解説\n\n[ここを押す](javascript:alert(1)) と <script>alert(1)</script>\n\n**太字** と [安全](memo.md)\n",
    );
    expect(result.html).toBe(
      '<h2 data-heading="0">解説</h2>\n' +
        "<p>ここを押す と &#x3C;script>alert(1)&#x3C;/script></p>\n" +
        '<p><strong>太字</strong> と <a href="memo.md">安全</a></p>',
    );
  });
});

describe("「コードだけ」でも安全にする", () => {
  test("危ないリンクと HTML のタグは、書いたままの文字で出て、動かない", () => {
    const result = renderMarkdown(
      "[ここを押す](javascript:alert(1)) と <script>alert(1)</script> と ![x](javascript:alert(1))\n",
      { syntax: "code" },
    );
    expect(result.html).toBe(
      "<p>[ここを押す](javascript:alert(1)) と &#x3C;script>alert(1)&#x3C;/script> と ![x](javascript:alert(1))</p>",
    );
  });

  test("段落の外の HTML のタグも文字で出す", () => {
    const result = renderMarkdown("<script>alert(1)</script>\n", { syntax: "code" });
    expect(result.html).toBe("<p>&#x3C;script>alert(1)&#x3C;/script></p>");
  });
});
