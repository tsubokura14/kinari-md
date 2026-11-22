import type { MermaidConfig } from "mermaid";

/** トークン（CSS 変数）の値を読む関数。ふつうは `<html>` の計算後のスタイルから読む */
export type ReadToken = (name: string) => string;

// 図の字は、画面の部品と同じ小さめの字（アプリのトークン --text-sm）。mermaid は字の大きさを px の数として測るので、
// rem で書かれていればルートの字の大きさをかけて px にする。読めなければ mermaid の既定に任せる
function fontSizeOf(read: ReadToken, rootFontSize: string): string | undefined {
  const value = read("--text-sm");
  const size = parseFloat(value);
  if (Number.isNaN(size)) return undefined;
  if (value.endsWith("rem")) return `${size * parseFloat(rootFontSize)}px`;
  return `${size}px`;
}

/**
 * 今のトークンから mermaid の設定を作る。描くたびに呼ぶので、ライト・ダークが変わったあとに描けば今の色になる。
 * 線と文字は text、地は surface、強調は accent（docs/ui.md の「図（Mermaid）」）。
 * 箱の地は、図の枠（surface）の上で見分けられるよう bg にする
 */
export function mermaidConfig(read: ReadToken, rootFontSize: string): MermaidConfig {
  const text = read("--color-text");
  const border = read("--color-border");
  const surface = read("--color-surface");
  const accent = read("--color-accent");
  const fontFamily = read("--font-ui");
  const fontSize = fontSizeOf(read, rootFontSize);
  return {
    startOnLoad: false,
    // 既定の strict のまま（図の中のスクリプト・クリックの動作を許さない）
    securityLevel: "strict",
    theme: "base",
    // mermaid 12 の流れ図の既定は、影つきの look "neo" と、箱の幅をそろえる minNodeWidth（120）。
    // 箱が大きく、スマホの幅で小さな図も収まらないので、線だけの classic にし、箱は字の幅に合わせ、間を詰める
    // （padding は箱の中の字のまわりの余白で、左右には2倍で効く）
    look: "classic",
    flowchart: { minNodeWidth: 0, padding: 4, nodeSpacing: 20, rankSpacing: 20 },
    fontFamily,
    themeVariables: {
      background: surface,
      primaryColor: read("--color-bg"),
      primaryTextColor: text,
      primaryBorderColor: text,
      secondaryColor: surface,
      secondaryBorderColor: accent,
      tertiaryColor: surface,
      tertiaryBorderColor: border,
      lineColor: text,
      textColor: text,
      clusterBkg: surface,
      clusterBorder: border,
      fontFamily,
      ...(fontSize ? { fontSize } : {}),
    },
  };
}
