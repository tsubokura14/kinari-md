// 入口 kinari-md/mermaid。本文の中の Mermaid の図をブラウザで描く（React に頼らない関数）。
// mermaid は大きいので、描くときにだけ読み込む
import { mermaidConfig } from "./config";

// 描くあいだと描いたあとの SVG の id。ページの中で重ならないよう、描くたびに数を進める
let diagramCount = 0;

async function renderDiagram(source: string): Promise<string> {
  const { default: mermaid } = await import("mermaid");
  const styles = getComputedStyle(document.documentElement);
  mermaid.initialize(
    mermaidConfig((name) => styles.getPropertyValue(name).trim(), styles.fontSize),
  );
  diagramCount += 1;
  const id = `kinari-mermaid-${diagramCount}`;
  try {
    const { svg } = await mermaid.render(id, source);
    return svg;
  } finally {
    // 描けなかったとき、描くために置いた要素がページに残ることがあるので消す
    document.getElementById(`d${id}`)?.remove();
    document.getElementById(id)?.remove();
  }
}

// mermaid が付ける幅（width="100%" と、もとの幅の max-width）を、もとの幅に直す。
// 縮めず、収まらない図は枠の中で横にスクロールする（body.css の .mermaid-figure）
function keepNaturalWidth(svg: SVGSVGElement) {
  const naturalWidth = svg.style.maxWidth;
  if (!naturalWidth) return;
  svg.setAttribute("width", naturalWidth);
  svg.style.removeProperty("max-width");
}

// 本文の中の pre[data-mermaid]（src/markdown/highlight.ts が付ける）を、1つずつ図に替える。
// 描き終わるまでと、描けなかったときは pre（元のコード）を残す（エラーの文は出さない）。
// 図（.mermaid-figure）には元のコードを data-mermaid-source に残し、ライト・ダークが変わったら、それから描き直す
async function drawDiagrams(body: HTMLElement, isCancelled: () => boolean) {
  const targets = body.querySelectorAll<HTMLElement>(
    "pre[data-mermaid], .mermaid-figure[data-mermaid-source]",
  );
  for (const target of targets) {
    const source =
      target.tagName === "PRE" ? (target.textContent ?? "") : (target.dataset.mermaidSource ?? "");
    let svg: string;
    try {
      svg = await renderDiagram(source);
    } catch {
      continue;
    }
    if (isCancelled() || !target.isConnected) return;
    const figure = document.createElement("div");
    figure.className = "mermaid-figure";
    figure.dataset.mermaidSource = source;
    figure.innerHTML = svg;
    const svgElement = figure.querySelector("svg");
    if (svgElement) keepNaturalWidth(svgElement);
    target.replaceWith(figure);
  }
}

/**
 * 本文の入れ物（`.kinari-body`）の中の Mermaid の図を描き、`<html>` の `data-theme` が変わると今の色で描き直す。
 * 返した関数を呼ぶと、描き直しをやめる（React なら useEffect の後片付けで呼ぶ）。
 * 入れ物の中身を差し替えたら、やめてから呼び直す
 */
export function drawMermaid(body: HTMLElement): () => void {
  // 描くたびに数を進め、新しく描き始めたら、前の描きかけ（古い色）は捨てる
  let run = 0;
  const draw = () => {
    run += 1;
    const current = run;
    void drawDiagrams(body, () => current !== run);
  };
  draw();
  // ライト・ダークはアプリが <html> に付けた data-theme だけで決まる（docs/design.md の「トークンは2つのファイルに分ける」）。
  // ほかの属性の変化では描き直さない
  const root = document.documentElement;
  let theme = root.dataset.theme;
  const observer = new MutationObserver(() => {
    if (root.dataset.theme === theme) return;
    theme = root.dataset.theme;
    draw();
  });
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    observer.disconnect();
    run += 1;
  };
}
