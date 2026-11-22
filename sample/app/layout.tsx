import type { Metadata } from "next";
import "./globals.css";
import { ThemeSwitch } from "./theme-switch";

export const metadata: Metadata = {
  title: "kinari-md 見本",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" data-theme="light" data-accent="leaf">
      <body className="bg-bg font-ui text-text">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-2">
          <p className="text-sm font-bold">kinari-md 見本</p>
          <ThemeSwitch />
        </header>
        {children}
      </body>
    </html>
  );
}
