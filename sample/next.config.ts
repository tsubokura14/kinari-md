import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // アプリと同じく、TypeScript のまま配る kinari-md をビルドに通す
  transpilePackages: ["kinari-md"],
  // next dev が AI のエージェントを見つけると AGENTS.md に Next.js の案内を書き足す。
  // AGENTS.md はテンプレートのファイルで、このプロジェクトでは書き換えないため止める
  agentRules: false,
  // Tailwind CSS を md-leaf と同じく Turbopack の loader で通す（PostCSS の設定ファイルを置かない）
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      // 見本の本文（sample/app/note.md）を文字のまま読み込む
      "*.md": {
        type: "raw",
      },
    },
  },
};

export default nextConfig;
