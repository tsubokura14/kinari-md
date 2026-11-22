import type { Element, ElementContent, Root as HastRoot } from "hast";
import type { VFile } from "vfile";

/** 書き換えの関数に渡すもの。href は HTML に出る形（符号化されたもの。`#` や `?` のあとも含む） */
export type ResolveTarget = { kind: "link" | "image"; href: string };

/** 書き換えたあとの場所と、行き先がないか。undefined なら書き換えない */
export type ResolveResult = { href: string; missing?: boolean } | undefined;

export type Resolve = (target: ResolveTarget) => ResolveResult;

// スキーム付き（https:・mailto: など）・`/` で始まる・`#` で始まるものは相対でないので、関数に渡さない
const schemePattern = /^[a-z][a-z\d+.-]*:/i;

function isRelative(href: string): boolean {
  return !schemePattern.test(href) && !href.startsWith("/") && !href.startsWith("#");
}

function decodeForDisplay(href: string): string {
  try {
    return decodeURI(href);
  } catch {
    return href;
  }
}

function isBlank(node: ElementContent): boolean {
  return node.type === "text" && node.value.trim() === "";
}

// 画像1つだけの段落なら、その img を返す
function onlyImage(paragraph: Element): Element | undefined {
  const contents = paragraph.children.filter((child) => !isBlank(child));
  const [first] = contents;
  if (contents.length !== 1 || first?.type !== "element" || first.tagName !== "img") {
    return undefined;
  }
  return first;
}

function toFigure(image: Element): Element {
  const alt = typeof image.properties.alt === "string" ? image.properties.alt : "";
  const children: ElementContent[] = [image];
  if (alt !== "") {
    children.push({
      type: "element",
      tagName: "figcaption",
      properties: {},
      children: [{ type: "text", value: alt }],
    });
  }
  return { type: "element", tagName: "figure", properties: {}, children };
}

/**
 * 相対のリンク（a の href）と画像（img の src）を、アプリの関数（file.data.resolve）で書き換え、
 * 行き先がないものを file.data.brokenLinks・brokenImages に集める。関数がなければ書き換えない。
 * 画像だけの段落は figure にし、代わりの文字を説明に出す（関数の有無にかかわらず）。
 */
export function rewriteLinks() {
  return (tree: HastRoot, file: VFile) => {
    const resolve = file.data.resolve as Resolve | undefined;
    const brokenLinks: string[] = [];
    const brokenImages: string[] = [];
    file.data.brokenLinks = brokenLinks;
    file.data.brokenImages = brokenImages;

    const rewrite = (element: Element, kind: ResolveTarget["kind"]) => {
      const key = kind === "link" ? "href" : "src";
      const href = element.properties[key];
      if (!resolve || typeof href !== "string" || !isRelative(href)) return;
      const resolved = resolve({ kind, href });
      if (!resolved) return;
      element.properties[key] = resolved.href;
      // アプリの中へのリンクだと、アプリが見分けられる印（画像には付けない）
      if (kind === "link") element.properties.dataInternalLink = "";
      if (resolved.missing) {
        (kind === "link" ? brokenLinks : brokenImages).push(decodeForDisplay(href));
      }
    };

    const walk = (node: HastRoot | Element) => {
      node.children.forEach((child, index) => {
        if (child.type !== "element") return;
        if (child.tagName === "a") rewrite(child, "link");
        if (child.tagName === "img") rewrite(child, "image");
        walk(child);
        if (child.tagName === "p") {
          const image = onlyImage(child);
          if (image) node.children[index] = toFigure(image);
        }
      });
    };
    walk(tree);
  };
}
