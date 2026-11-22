// 見本のページの帯で選ぶもの（ライト/ダーク・差し色・本文の文字の大きさ）。
// 選んだものは URL（?theme=・accent=・size=）にだけ持ち、保存しない。<html> の data-theme・data-accent・data-size に映す
// （値ごとの見た目は sample/app/tokens.css）

export const SETTINGS = {
  theme: [
    { value: "light", label: "ライト" },
    { value: "dark", label: "ダーク" },
  ],
  accent: [
    { value: "leaf", label: "若葉" },
    { value: "forge", label: "江戸紫" },
  ],
  // 本文の文字の大きさ（--reading-size。値は sample/app/tokens.css）。
  // ボタンの文字「14px」「16px」は画面に出す文言で、CSS の値ではないので、px の規則から外す
  size: [
    // eslint-disable-next-line no-restricted-syntax
    { value: "14", label: "14px" },
    // eslint-disable-next-line no-restricted-syntax
    { value: "16", label: "16px" },
  ],
} as const;

export type SettingKey = keyof typeof SETTINGS;
export type Settings = Record<SettingKey, string>;

export const SETTING_KEYS = Object.keys(SETTINGS) as SettingKey[];

/** URL に何もないとき（と、知らない値のとき） */
export const DEFAULT_SETTINGS: Settings = { theme: "light", accent: "leaf", size: "16" };

function allowed(key: SettingKey): string[] {
  return SETTINGS[key].map(({ value }) => value);
}

/** URL の検索の部分（`?theme=dark` など）から選んだものを読む。知らない値は既定にする */
export function parseSettings(search: string): Settings {
  const params = new URLSearchParams(search);
  const settings = { ...DEFAULT_SETTINGS };
  for (const key of SETTING_KEYS) {
    const value = params.get(key);
    if (value !== null && allowed(key).includes(value)) settings[key] = value;
  }
  return settings;
}

export function toSearch(settings: Settings): string {
  return `?${new URLSearchParams(settings).toString()}`;
}

/**
 * 最初の描画の前に、URL の選んだものを <html> に映すスクリプト（layout.tsx の head に置く）。
 * ページはビルドのときに既定の見た目で HTML にしてあるので、これがないと一瞬ライトで出てから変わる。
 * 決まりは parseSettings と同じ（許す値の一覧をここに埋め込む）
 */
export const applySettingsScript = `(function(){var o=${JSON.stringify(
  Object.fromEntries(SETTING_KEYS.map((key) => [key, allowed(key)])),
)};var p=new URLSearchParams(location.search);for(var k in o){var v=p.get(k);if(v!==null&&o[k].indexOf(v)>=0)document.documentElement.setAttribute("data-"+k,v)}})()`;
