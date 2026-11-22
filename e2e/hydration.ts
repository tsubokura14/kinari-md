import { expect, type Locator } from "@playwright/test";

// 見本のページはビルドのときに HTML にしてあるので、ボタンは React がつながる（ハイドレーション）前から見えていて押せる。
// その前に押すと、何も起きずに終わる（ライト・ダークが切り替わらない）。Playwright は見えていれば押すので、
// ページを開いてすぐボタンを押すときは、先にこれで待つ。
//
// 前提（React 19 で確かめた。版を上げて崩れたら見直す）：React はハイドレーションのときに、要素へ
// `__reactProps$<乱数>` という名前のプロパティを置き、押されたときにここから onClick を探す。
// 置かれていれば、押したことは React に届く。Suspense ごとに別々につながるので、ページ全体ではなく、押す要素で確かめる

/** locator の要素に React がつながるまで待つ */
export async function waitForHydration(locator: Locator): Promise<void> {
  await expect
    .poll(() =>
      locator.evaluate((element) =>
        Object.keys(element).some((key) => key.startsWith("__reactProps$")),
      ),
    )
    .toBe(true);
}

/** React がつながるのを待ってから押す */
export async function clickWhenHydrated(locator: Locator): Promise<void> {
  await waitForHydration(locator);
  await locator.click();
}
