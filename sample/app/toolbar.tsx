"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import {
  DEFAULT_SETTINGS,
  parseSettings,
  SETTING_KEYS,
  SETTINGS,
  toSearch,
  type SettingKey,
} from "./settings";

// URL を変えたことを知らせる相手（history.replaceState は popstate を出さないため、自分で知らせる）
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

const getSearch = () => window.location.search;
// サーバーと、つながる（ハイドレーション）ときは既定の見た目。つながったあと URL のものに描き直す
const getServerSearch = () => toSearch(DEFAULT_SETTINGS);

/** 帯のボタンの組（ライト/ダーク・若葉/江戸紫・14px/16px）。選んだものは URL にだけ持つ */
export function Toolbar() {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const settings = parseSettings(search);

  // 最初は layout.tsx のスクリプトが映してある。開発のときに React が <html> の属性を戻すことがあるので、ここでも映す
  useLayoutEffect(() => {
    const current = parseSettings(search);
    const root = document.documentElement;
    for (const key of SETTING_KEYS) root.setAttribute(`data-${key}`, current[key]);
  }, [search]);

  const select = (key: SettingKey, value: string) => {
    window.history.replaceState(null, "", toSearch({ ...settings, [key]: value }));
    for (const listener of listeners) listener();
  };

  // ボタンの組は帯（layout.tsx）の並びにそのまま入れ、幅が足りなければ組ごとに折り返す
  return (
    <>
      {SETTING_KEYS.map((key) => (
        <div key={key} className="flex gap-1">
          {SETTINGS[key].map(({ value, label }) => {
            const selected = settings[key] === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => select(key, value)}
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
      ))}
    </>
  );
}
