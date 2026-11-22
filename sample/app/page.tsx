// アプリと同じく、パッケージの名前で読み込む（入口が読み込めることを見本のビルドで確かめる）
import { renderMarkdown } from "kinari-md/markdown";

const { html } = renderMarkdown(
  "kinari-md で変換した Markdown を、ここに並べる（これから入れる）。",
);

export default function Home() {
  return (
    <main className="px-4 py-6 text-sm text-muted" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
