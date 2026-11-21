import { expect, test } from "@playwright/test";

test("中身のない見本のページ（ライト）の画像が基準と同じ", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("sample-empty-light.png", { fullPage: true });
});
