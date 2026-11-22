// アプリと同じく、パッケージの名前で読み込む（入口が読み込めることを見本のビルドで確かめる）
import { renderMarkdown } from "kinari-md/markdown";
import { NoteBody } from "./note-body";
// 見本の本文。Markdown の文字のまま読み込む（sample/next.config.ts の *.md）
import note from "./note.md";

const { title, html } = renderMarkdown(note);

export default function Home() {
  return (
    <main className="mx-auto max-w-prose px-4 py-6">
      <p className="text-xs text-muted">ノート（md-leaf での使い方。書き方はすべて使える）</p>
      <h1 className="mt-1 mb-6 font-body text-2xl font-bold">{title}</h1>
      <NoteBody html={html} />
    </main>
  );
}
