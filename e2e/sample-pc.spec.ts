import { expect, test } from "@playwright/test";

// PC の幅（playwright.config.ts の pc）で動かす

test("ライト（PC）の画像が基準と同じ", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".kinari-body .mermaid-figure svg")).toBeVisible();
  await expect(page).toHaveScreenshot("sample-light-pc.png", { fullPage: true });
});

test("ダーク（PC）の画像が基準と同じ", async ({ page }) => {
  await page.goto("/?theme=dark");
  await expect(page.locator(".kinari-body .mermaid-figure svg")).toBeVisible();
  await expect(page).toHaveScreenshot("sample-dark-pc.png", { fullPage: true });
});
