// アプリと同じく、パッケージの名前で読み込む（入口が読み込めることを見本のビルドで確かめる）
import { packageName } from "kinari-md/markdown";

export default function Home() {
  return (
    <main className="px-4 py-6 text-sm text-muted">
      <p>{packageName} で変換した Markdown を、ここに並べる（これから入れる）。</p>
    </main>
  );
}
