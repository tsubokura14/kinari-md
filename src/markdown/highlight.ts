import type { Element, ElementContent, Root as HastRoot } from "hast";
import hljs from "highlight.js/lib/common";
import type { VFile } from "vfile";

// 色分けしない言語。mermaid はブラウザで図に描き、math は数式にする
const notHighlighted = new Set(["mermaid", "math"]);

function languageOf(code: Element): string | undefined {
  const className = code.properties.className;
  if (!Array.isArray(className)) return undefined;
  for (const name of className) {
    if (typeof name === "string" && name.startsWith("language-")) {
      return name.slice("language-".length);
    }
  }
  return undefined;
}

function textOf(node: Element): string {
  return node.children.map((child) => (child.type === "text" ? child.value : "")).join("");
}

// コードの行（最後の改行のあとの空の行は数えない）
function linesOf(text: string): string[] {
  const lines = text.split("\n");
  if (lines.length > 1 && lines.at(-1) === "") lines.pop();
  return lines;
}

const lineOpen = '<span class="code-line">';

/**
 * highlight.js の結果（HTML の文字列）を、行ごとの `span.code-line` に分ける。
 * 複数行の文字列・コメントは1つの span で行をまたぐので、行の終わりで開いている span を閉じ、
 * 次の行の頭で同じ span を開き直す（行の要素が入れ子を壊さず、色分けもずれない）。
 * highlight.js の結果にあるタグは `<span class="…">` と `</span>` だけ
 */
function splitHighlighted(html: string): { value: string; count: number } {
  const lines = linesOf(html);
  const open: string[] = [];
  const parts: string[] = [];
  for (const line of lines) {
    let part = lineOpen + open.join("");
    for (const token of line.split(/(<span[^>]*>|<\/span>)/)) {
      if (token.startsWith("<span")) open.push(token);
      else if (token === "</span>") open.pop();
      part += token;
    }
    parts.push(part + "</span>".repeat(open.length) + "</span>");
  }
  return { value: parts.join("\n") + "\n", count: lines.length };
}

// 色分けしないコードは、raw を作らず文字のノード（hast）のまま行に分ける（文字は書き出すときに符号化される）
function splitText(text: string): { children: ElementContent[]; count: number } {
  const lines = linesOf(text);
  const children: ElementContent[] = [];
  for (const line of lines) {
    children.push({
      type: "element",
      tagName: "span",
      properties: { className: ["code-line"] },
      children: line === "" ? [] : [{ type: "text", value: line }],
    });
    children.push({ type: "text", value: "\n" });
  }
  return { children, count: lines.length };
}

/**
 * `pre > code.language-<言語>` を、highlight.js が知っている言語なら色分けする。mermaid の pre には印を付ける
 * （書き方が「コードだけ」のときは付けず、色を付けないコードブロックのまま出す）。
 * 結果の HTML（中の文字は highlight.js が符号化済み）を raw ノードとして code の中に入れる。
 * 行番号を選んだときは、mermaid のほかのブロックを行ごとに分け、pre に `line-numbers` と行数の桁 `--line-digits` を付ける。
 * 番号そのものは body.css が CSS のカウンターで出す。桁を属性で渡すのは、何桁でもコードの始まりをそろえる幅に
 * 行数の桁が要り、CSS の attr() は幅に使えないため
 */
export function highlightCode() {
  return (tree: HastRoot, file: VFile) => {
    const drawsMermaid = file.data.syntax !== "code";
    const lineNumbers = file.data.lineNumbers === true;
    const walk = (node: HastRoot | Element) => {
      for (const child of node.children) {
        if (child.type !== "element") continue;
        const code = child.children[0];
        if (child.tagName === "pre" && code?.type === "element" && code.tagName === "code") {
          const language = languageOf(code);
          // Mermaid の図はブラウザで描く（入口 kinari-md/mermaid）。その印を付ける
          if (language === "mermaid" && drawsMermaid) child.properties.dataMermaid = "";
          const numbered = lineNumbers && language !== "mermaid";
          let count = 0;
          if (language && !notHighlighted.has(language) && hljs.getLanguage(language)) {
            const { value } = hljs.highlight(textOf(code), { language, ignoreIllegals: true });
            if (numbered) {
              const split = splitHighlighted(value);
              code.children = [{ type: "raw", value: split.value }];
              count = split.count;
            } else {
              code.children = [{ type: "raw", value }];
            }
          } else if (numbered) {
            const split = splitText(textOf(code));
            code.children = split.children;
            count = split.count;
          }
          if (numbered) {
            child.properties.className = ["line-numbers"];
            child.properties.style = `--line-digits: ${String(count).length}`;
          }
          continue;
        }
        walk(child);
      }
    };
    walk(tree);
  };
}
