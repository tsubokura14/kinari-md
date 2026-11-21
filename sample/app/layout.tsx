import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kinari-md 見本",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" data-theme="light" data-accent="leaf">
      <body className="bg-bg font-ui text-text">{children}</body>
    </html>
  );
}
