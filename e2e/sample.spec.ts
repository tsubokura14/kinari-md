import { expect, test } from "@playwright/test";
import { clickWhenHydrated } from "./hydration";

test("上の帯のボタンで、ライトとダークを切り替えられる", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const light = page.getByRole("button", { name: "ライト" });
  const dark = page.getByRole("button", { name: "ダーク" });

  await clickWhenHydrated(dark);
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(dark).toHaveAttribute("aria-pressed", "true");
  await expect(light).toHaveAttribute("aria-pressed", "false");

  await light.click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(light).toHaveAttribute("aria-pressed", "true");
  await expect(dark).toHaveAttribute("aria-pressed", "false");
});

test("中身のない見本のページ（ライト）の画像が基準と同じ", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("sample-empty-light.png", { fullPage: true });
});

test("中身のない見本のページ（ダーク）の画像が基準と同じ", async ({ page }) => {
  await page.goto("/");
  await clickWhenHydrated(page.getByRole("button", { name: "ダーク" }));
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page).toHaveScreenshot("sample-empty-dark.png", { fullPage: true });
});
