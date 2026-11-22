import type { Element, ElementContent, Root as HastRoot } from "hast";
import type { VFile } from "vfile";

export type Heading = {
  /** 見出しに付けた `data-heading` の値（本文の順の番号） */
  id: string;
  /** 見出しの中の文字だけ（飾りの要素は中の文字だけ） */
  text: string;
  depth: 2 | 3;
};

const depths: Record<string, 2 | 3> = { h2: 2, h3: 3 };

// raw（KaTeX・highlight.js の HTML）は数えない
function textOf(node: Element): string {
  return node.children
    .map((child: ElementContent) => {
      if (child.type === "text") return child.value;
      if (child.type === "element") return textOf(child);
      return "";
    })
    .join("");
}

/**
 * h2・h3 に `data-heading="<番号>"`（0 から本文の順）を付け、`file.data.headings` に一覧を置く。
 * 中の要素（コールアウトの div・details など）もたどる。文字が空の見出しは一覧に入れず、印も付けない。
 *
 * 印に HTML の `id` 属性を使わない。`id` を見出しの文字にすると、本文の中の `#見出し` のリンクで
 * ブラウザがその見出しへ移るようになり、アプリの `#見出し` のリンクの動きが変わる。番号なら同じ文字の
 * 見出しも別になる。`#見出し` のリンクで移れるようにするときは、ここを見直す。
 *
 * 前提：数式を式にする処理より後に動かす。前に動かすと、見出しの中の数式が TeX の文字のまま一覧に入る
 */
export function collectHeadings() {
  return (tree: HastRoot, file: VFile) => {
    const headings: Heading[] = [];
    file.data.headings = headings;
    const walk = (node: HastRoot | Element) => {
      for (const child of node.children) {
        if (child.type !== "element") continue;
        const depth = depths[child.tagName];
        if (depth === undefined) {
          walk(child);
          continue;
        }
        const text = textOf(child).trim();
        if (text === "") continue;
        const id = String(headings.length);
        child.properties.dataHeading = id;
        headings.push({ id, text, depth });
      }
    };
    walk(tree);
  };
}
