import type { Element, ElementContent, Root as HastRoot } from "hast";
import type { Html, Root as MdastRoot } from "mdast";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { type Processor, unified } from "unified";
import { VFile } from "vfile";
import { parse as parseYaml } from "yaml";
import { callouts } from "./callouts";
import { collectHeadings, type Heading } from "./headings";
import { highlightCode } from "./highlight";
import { type Resolve, rewriteLinks } from "./links";
import { renderMath } from "./math";
import { safeUrls } from "./safe-urls";
import { wrapTables } from "./tables";

export type { Heading } from "./headings";
export type { Resolve, ResolveResult, ResolveTarget } from "./links";

export type RenderOptions = {
  /** 相対のリンク（a の href）と画像（img の src）を書き換える。渡さなければ書き換えない */
  resolve?: Resolve;
  /** 使う書き方。"all"（既定）はすべて、"code" は段落・改行・文の中のコード・コードブロックだけ（ほかは書いたままの文字） */
  syntax?: "all" | "code";
  /** true なら、コードブロック（mermaid を除く）すべてに 1 から始まる行番号を付ける。既定は付けない */
  lineNumbers?: boolean;
};

export type RenderedMarkdown = {
  /** フロントマターの `title`。ないときは undefined（ファイル名を使うかは呼ぶ側が決める） */
  title: string | undefined;
  html: string;
  /** 本文の h2・h3 の一覧（本文の順） */
  headings: Heading[];
  /** resolve が行き先がないと答えたリンク（書かれたままの形）。resolve を渡さなければいつも空 */
  brokenLinks: string[];
  /** resolve が行き先がないと答えた画像（書かれたままの形）。resolve を渡さなければいつも空 */
  brokenImages: string[];
};

// フロントマター（先頭の yaml）を本文から外し、title を file.data に置く
function extractFrontmatter() {
  return (tree: MdastRoot, file: VFile) => {
    const first = tree.children[0];
    if (first?.type !== "yaml") return;
    tree.children.shift();
    file.data.title = readTitle(first.value);
  };
}

function readTitle(yaml: string): string | undefined {
  let data: unknown;
  try {
    data = parseYaml(yaml);
  } catch {
    // 壊れた YAML で変換を止めず、title がないものとして扱う（題をどうするかは呼ぶ側が決める）
    return undefined;
  }
  if (typeof data !== "object" || data === null || !("title" in data)) return undefined;
  const title = data.title;
  // `title: 2024` のように数として読まれたものも題に使う
  if (typeof title === "number") return String(title);
  if (typeof title === "string" && title.trim() !== "") return title;
  return undefined;
}

// 本文の中の HTML のタグは、動かさず、消さずに文字として出す
// （remark-rehype の既定では消える。allowDangerousHtml にすると HTML として動く）。
// 段落の外に書かれたタグ（ブロックの HTML）は、文字の段落にする
function htmlAsText(_state: unknown, node: Html, parent: { type: string } | undefined) {
  const text: ElementContent = { type: "text", value: node.value };
  if (parent && ["root", "blockquote", "listItem"].includes(parent.type)) {
    const paragraph: Element = {
      type: "element",
      tagName: "p",
      properties: {},
      children: [text],
    };
    return paragraph;
  }
  return text;
}

const externalLinkPattern = /^https?:\/\//;

// 外へのリンク（http(s)://）を別のタブで開く
function externalLinksInNewTab() {
  return (tree: HastRoot) => {
    const walk = (node: HastRoot | Element) => {
      for (const child of node.children) {
        if (child.type !== "element") continue;
        const href = child.properties.href;
        if (child.tagName === "a" && typeof href === "string" && externalLinkPattern.test(href)) {
          child.properties.target = "_blank";
          child.properties.rel = ["noopener", "noreferrer"];
        }
        walk(child);
      }
    };
    walk(tree);
  };
}

const allProcessor = unified()
  .use(remarkParse)
  // 閉じの強調の直前が日本語の括弧・句読点でも強調にする（Obsidian と同じ読み方）。読み込み（micromark）の拡張なので
  // 読み込みのすぐ後に置く。見出しの中も同じ読み込みを通るので、見出しの一覧（headings.ts）も同じ読み方になる
  .use(remarkCjkFriendly)
  .use(remarkFrontmatter, ["yaml"])
  .use(extractFrontmatter)
  .use(remarkGfm)
  .use(remarkMath)
  .use(callouts)
  // 1つの改行を改行にする（Obsidian の既定）。callouts の後に置く：callouts.ts はコールアウトの1行目を文字の中の
  // 改行で見つけるので、先に改行を break にすると、1行目の次の行が題に入る
  .use(remarkBreaks)
  .use(remarkRehype, { handlers: { html: htmlAsText } })
  .use(safeUrls)
  .use(externalLinksInNewTab)
  .use(rewriteLinks)
  .use(renderMath)
  .use(highlightCode)
  .use(wrapTables)
  .use(collectHeadings)
  // raw ノード（HTML の文字列）をそのまま出す。raw や URL を持つ要素を作る処理を足すときは、
  // docs/design.md の「安全にする」を見直す
  .use(rehypeStringify, { allowDangerousHtml: true });

// 「コードだけ」で止める読み込み（micromark）の書き方。止めた書き方は読まれないので、書いたままの文字になる。
// すべてで読んでから絞った外のノードを元の文字に戻すやり方は、元の文字の位置を拾い直す処理が要り、入れ子で崩れやすい。
// 字下げのコード・文字の参照・\ の逃がし（行の終わりの \ も）も止める：書いたものと違う文字が出ないようにし、
// memory-forge の今の変換（フェンスのコードしか読まない）とそろえる。
// GFM・数式・フロントマター・コールアウトのプラグインは入れない（表・取り消し線・題なども文字のまま）
const disabledInCode = [
  "headingAtx",
  "setextUnderline",
  "list",
  "blockQuote",
  "thematicBreak",
  "attention",
  "labelStartLink",
  "labelStartImage",
  "labelEnd",
  "definition",
  "autolink",
  "htmlFlow",
  "htmlText",
  "codeIndented",
  "characterReference",
  "characterEscape",
  "hardBreakEscape",
];

function disableSyntax(this: Processor) {
  const data = this.data();
  const extensions = (data.micromarkExtensions ??= []);
  extensions.push({ disable: { null: disabledInCode } });
}

const codeProcessor = unified()
  .use(remarkParse)
  .use(disableSyntax)
  .use(remarkBreaks)
  // htmlFlow・htmlText を止めているので html のノードはできないが、すべてと同じ扱いにそろえておく
  .use(remarkRehype, { handlers: { html: htmlAsText } })
  .use(safeUrls)
  .use(rewriteLinks)
  .use(highlightCode)
  .use(rehypeStringify, { allowDangerousHtml: true });

export function renderMarkdown(source: string, options: RenderOptions = {}): RenderedMarkdown {
  const syntax = options.syntax ?? "all";
  const processor = syntax === "code" ? codeProcessor : allProcessor;
  const file = processor.processSync(
    new VFile({
      value: source,
      data: { resolve: options.resolve, syntax, lineNumbers: options.lineNumbers ?? false },
    }),
  );
  const title = file.data.title;
  return {
    title: typeof title === "string" ? title : undefined,
    html: String(file),
    headings: (file.data.headings as Heading[] | undefined) ?? [],
    brokenLinks: (file.data.brokenLinks as string[] | undefined) ?? [],
    brokenImages: (file.data.brokenImages as string[] | undefined) ?? [],
  };
}
