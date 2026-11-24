// アプリと同じく、パッケージの名前で読み込む（入口が読み込めることを見本のビルドで確かめる）
import { renderMarkdown } from "kinari-md/markdown";
import { NoteBody } from "./note-body";
// 見本の本文。Markdown の文字のまま読み込む（sample/next.config.ts の *.md）
import note from "./note.md";
import { choices, explanation, question } from "./question";

const { title, html } = renderMarkdown(note);
const questionHtml = renderMarkdown(question, { syntax: "code", lineNumbers: true }).html;
const choiceHtmls = choices.map(({ label, body }) => ({
  label,
  html: renderMarkdown(body, { syntax: "code" }).html,
}));
const explanationHtml = renderMarkdown(explanation).html;

export default function Home() {
  return (
    <main className="mx-auto max-w-prose px-4 py-6">
      <p className="text-xs text-muted">ノート（md-leaf での使い方。書き方はすべて使える）</p>
      <h1 className="mt-1 mb-6 font-body text-2xl font-bold">{title}</h1>
      <NoteBody html={html} />

      <section aria-label="問題" className="mt-12 border-t border-border pt-12 pb-10">
        <p className="text-xs text-muted">
          問題（memory-forge での使い方。問題文のコードに行番号、選択肢はコードと文字だけ）
        </p>
        <div className="mt-3">
          <NoteBody html={questionHtml} />
        </div>
        {/* 選択肢の箱は見本のための仮の見た目（本物は memory-forge が持つ。docs/ui.md の「見本のページ」） */}
        <ol className="mt-4 space-y-2">
          {choiceHtmls.map(({ label, html: choiceHtml }) => (
            <li key={label} className="flex items-center gap-3 rounded-md bg-choice px-3 py-2.5">
              <span className="font-ui text-base font-bold text-muted">{label}</span>
              <NoteBody html={choiceHtml} />
            </li>
          ))}
        </ol>
        <p className="mt-8 text-xs text-muted">解説</p>
        <div className="mt-3">
          <NoteBody html={explanationHtml} />
        </div>
      </section>
    </main>
  );
}
