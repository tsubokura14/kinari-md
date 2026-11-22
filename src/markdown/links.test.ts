import { describe, expect, test } from "vitest";
import { renderMarkdown, type ResolveTarget } from "./render";

// md-leaf の markdown.test.ts の「ノートへのリンク」「画像」から、ノートの置き場所に頼らないものを、関数を渡す形で移したもの

describe("リンクの書き換え（resolve を渡したとき）", () => {
  test("相対リンクを関数の答えに書き換え、data-internal-link を付ける。関数には符号化された href が渡る", () => {
    const calls: ResolveTarget[] = [];
    const result = renderMarkdown("[手順](リリースの手順.md) [Docker](<Docker のメモ.md#見出し>)", {
      resolve: (target) => {
        calls.push(target);
        return { href: `/notes/${calls.length}` };
      },
    });
    expect(calls).toEqual([
      { kind: "link", href: encodeURI("リリースの手順.md") },
      { kind: "link", href: encodeURI("Docker のメモ.md#見出し") },
    ]);
    expect(result.html).toBe(
      '<p><a href="/notes/1" data-internal-link="">手順</a> ' +
        '<a href="/notes/2" data-internal-link="">Docker</a></p>',
    );
    expect(result.brokenLinks).toEqual([]);
  });

  test("関数が書き換えないと答えたリンクは、そのまま出し、印を付けない", () => {
    const result = renderMarkdown("[図](図.png)", { resolve: () => undefined });
    expect(result.html).toBe(`<p><a href="${encodeURI("図.png")}">図</a></p>`);
    expect(result.brokenLinks).toEqual([]);
  });

  test("行き先がないと答えたリンクも書き換え、書かれたままのリンク先を brokenLinks に返す", () => {
    const result = renderMarkdown("[古い](<../開発/古い名前.md>) [ある](a.md)", {
      resolve: ({ href }) => ({ href: "/x", missing: href.startsWith("..") }),
    });
    expect(result.html).toBe(
      '<p><a href="/x" data-internal-link="">古い</a> <a href="/x" data-internal-link="">ある</a></p>',
    );
    expect(result.brokenLinks).toEqual(["../開発/古い名前.md"]);
  });

  test("相対でないリンク（外へのリンク、/ で始まる、#見出し だけ）は関数に渡さず、変えない", () => {
    const calls: ResolveTarget[] = [];
    const result = renderMarkdown(
      "[外](https://example.com/a.md) [根](/a.md) [節](#節) [メール](mailto:a@example.com)",
      {
        resolve: (target) => {
          calls.push(target);
          return { href: "/x" };
        },
      },
    );
    expect(calls).toEqual([]);
    expect(result.html).toBe(
      '<p><a href="https://example.com/a.md" target="_blank" rel="noopener noreferrer">外</a> ' +
        `<a href="/a.md">根</a> <a href="${encodeURI("#節")}">節</a> <a href="mailto:a@example.com">メール</a></p>`,
    );
  });

  test("[[ ]] の書き方はリンクにせず、文字のまま出す", () => {
    const result = renderMarkdown("[[リリースの手順]]", {
      resolve: () => ({ href: "/x", missing: true }),
    });
    expect(result.html).toBe("<p>[[リリースの手順]]</p>");
    expect(result.brokenLinks).toEqual([]);
  });
});

describe("画像の書き換え（resolve を渡したとき）", () => {
  test("相対の画像の場所を関数の答えに書き換え、印は付けない。画像だけの段落は、代わりの文字の説明を付ける", () => {
    const calls: ResolveTarget[] = [];
    const result = renderMarkdown("![ブランチの図](branch-graph.png)", {
      resolve: (target) => {
        calls.push(target);
        return { href: "/files/branch-graph.png" };
      },
    });
    expect(calls).toEqual([{ kind: "image", href: "branch-graph.png" }]);
    expect(result.html).toBe(
      '<figure><img src="/files/branch-graph.png" alt="ブランチの図">' +
        "<figcaption>ブランチの図</figcaption></figure>",
    );
    expect(result.brokenImages).toEqual([]);
  });

  test("行き先がないと答えた画像も書き換え、書かれたままのパスを brokenImages に返す", () => {
    const result = renderMarkdown("![a](<ない 図.png>) ![b](ある.png)", {
      resolve: ({ href }) => ({ href: "/files/x", missing: href !== encodeURI("ある.png") }),
    });
    expect(result.brokenImages).toEqual(["ない 図.png"]);
    expect(result.brokenLinks).toEqual([]);
    expect(result.html).toBe('<p><img src="/files/x" alt="a"> <img src="/files/x" alt="b"></p>');
  });

  test("関数が書き換えないと答えた画像は、そのまま出す", () => {
    const result = renderMarkdown("![a](memo.txt)", { resolve: () => undefined });
    expect(result.html).toBe(
      '<figure><img src="memo.txt" alt="a"><figcaption>a</figcaption></figure>',
    );
    expect(result.brokenImages).toEqual([]);
  });

  test("http(s):// の画像は関数に渡さずそのまま出し、切れた画像にしない", () => {
    const calls: ResolveTarget[] = [];
    const result = renderMarkdown("![外](https://example.com/a.png)", {
      resolve: (target) => {
        calls.push(target);
        return { href: "/x", missing: true };
      },
    });
    expect(calls).toEqual([]);
    expect(result.html).toBe(
      '<figure><img src="https://example.com/a.png" alt="外"><figcaption>外</figcaption></figure>',
    );
    expect(result.brokenImages).toEqual([]);
  });

  test("![[ ]] の書き方は画像にせず、文字のまま出す", () => {
    const result = renderMarkdown("![[branch-graph.png]]", {
      resolve: () => ({ href: "/x", missing: true }),
    });
    expect(result.html).toBe("<p>![[branch-graph.png]]</p>");
    expect(result.brokenImages).toEqual([]);
  });
});

describe("関数を渡さないとき", () => {
  test("リンクも画像も書き換えず、切れたものともしない", () => {
    const result = renderMarkdown("[中](../dev/memo.md) 図 ![図](ない.png) を見る");
    expect(result.html).toBe(
      `<p><a href="../dev/memo.md">中</a> 図 <img src="${encodeURI("ない.png")}" alt="図"> を見る</p>`,
    );
    expect(result.brokenLinks).toEqual([]);
    expect(result.brokenImages).toEqual([]);
  });
});

describe("画像だけの段落", () => {
  test("代わりの文字が空なら、説明を出さない", () => {
    const result = renderMarkdown("![](<../images/a b.png>)");
    expect(result.html).toBe(
      `<figure><img src="${encodeURI("../images/a b.png")}" alt=""></figure>`,
    );
  });

  test("文の途中の画像は、説明を付けず img のまま", () => {
    const result = renderMarkdown("図 ![ブランチの図](branch-graph.png) を見る");
    expect(result.html).toBe('<p>図 <img src="branch-graph.png" alt="ブランチの図"> を見る</p>');
  });
});
