import type { Element, ElementContent, Root as HastRoot, RootContent } from "hast";

const schemePattern = /^([a-z][a-z\d+.-]*):/i;

const linkSchemes = new Set(["http", "https", "mailto"]);
const imageSchemes = new Set(["http", "https"]);

// ブラウザが URL を読むときと同じく、前後の制御文字・空白を除き、タブ・改行を消してからスキームを読む
// （` javascript:`・`java\tscript:` を見逃さない）
function schemeOf(url: string): string | undefined {
  const normalized = url.replace(/^[\u0000- ]+|[\u0000- ]+$/g, "").replace(/[\t\n\r]/g, "");
  return schemePattern.exec(normalized)?.[1]?.toLowerCase();
}

function decoded(url: string): string {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

function isSafe(url: string, kind: "link" | "image"): boolean {
  const schemes = kind === "link" ? linkSchemes : imageSchemes;
  // remark-rehype が href を % で符号化する（タブは `%09` になる）ので、戻した形でも確かめる。
  // ブラウザは `java%09script:` をスキームと読まないが、決まった形だけ通す決まりにそろえて止める
  for (const candidate of [url, decoded(url)]) {
    const scheme = schemeOf(candidate);
    if (scheme !== undefined && !schemes.has(scheme)) return false;
  }
  if (schemeOf(url) !== undefined) return true;
  // スキームのないもの：相対と `/` で始まるもの。`#` で始まるものはリンクだけ
  return kind === "link" || !url.trimStart().startsWith("#");
}

function replacement(element: Element): ElementContent[] | undefined {
  const { tagName, properties } = element;
  if (tagName === "a") {
    const href = properties.href;
    if (typeof href !== "string" || isSafe(href, "link")) return undefined;
    return element.children;
  }
  if (tagName === "img") {
    const src = properties.src;
    if (typeof src !== "string" || isSafe(src, "image")) return undefined;
    const alt = typeof properties.alt === "string" ? properties.alt : "";
    return alt === "" ? [] : [{ type: "text", value: alt }];
  }
  return undefined;
}

/**
 * リンク（a の href）と画像（img の src）の行き先を決まった形だけ通す。通さないリンクは中の文字に、
 * 通さない画像は代わりの文字（なければ何も出さない）に置き換える。
 * 書き換えの関数（links.ts）に危ない行き先を渡さないよう、remark-rehype のすぐ後に置く
 */
export function safeUrls() {
  return (tree: HastRoot) => {
    const walk = (node: HastRoot | Element) => {
      node.children = (node.children as RootContent[]).flatMap((child): RootContent[] => {
        if (child.type !== "element") return [child];
        walk(child);
        return replacement(child) ?? [child];
      }) as typeof node.children;
    };
    walk(tree);
  };
}
