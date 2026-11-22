import type { Metadata } from "next";
import "./globals.css";
import { applySettingsScript } from "./settings";
import { Toolbar } from "./toolbar";

export const metadata: Metadata = {
  title: "kinari-md 見本",
};

// <html> の data-* は既定の見た目。URL で選んだものは head のスクリプトが描く前に映す（sample/app/settings.ts）。
// スクリプトが変えた属性を React が戻そうとしないよう、suppressHydrationWarning を付ける
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" data-theme="light" data-accent="leaf" data-size="16" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: applySettingsScript }} />
      </head>
      <body className="bg-bg font-ui text-text">
        <header className="sticky top-0 z-10 border-b border-border bg-bg">
          <div className="mx-auto flex max-w-prose flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
            <p className="text-sm font-bold">kinari-md 見本</p>
            <Toolbar />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
