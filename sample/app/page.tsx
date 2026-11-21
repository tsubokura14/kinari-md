// アプリと同じく、パッケージの名前で読み込む（入口が読み込めることを見本のビルドで確かめる）
import { packageName } from "kinari-md/markdown";

export default function Home() {
  return (
    <main>
      <h1>{packageName} 見本</h1>
    </main>
  );
}
