"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];

// 選んだものは保存せず、開くたびにライトから始める（layout.tsx の data-theme="light" と揃える）
export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="flex gap-1">
      {THEMES.map(({ value, label }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={() => setTheme(value)}
            className={
              selected
                ? "rounded-md border border-accent bg-accent px-2 py-1 text-sm text-on-accent"
                : "rounded-md border border-border px-2 py-1 text-sm text-text"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
