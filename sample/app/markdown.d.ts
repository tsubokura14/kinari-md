// *.md は Markdown の文字のまま読み込む（sample/next.config.ts の turbopack.rules）
declare module "*.md" {
  const source: string;
  export default source;
}
