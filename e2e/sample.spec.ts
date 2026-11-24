import { expect, test, type Page } from "@playwright/test";
import { clickWhenHydrated } from "./hydration";

// スマホの幅（playwright.config.ts の mobile）で動かす。PC の幅は sample-pc.spec.ts

const diagram = ".kinari-body .mermaid-figure svg";

/** 図が描き終わるまで待つ（描き終わるまでは元のコードの pre が出ている） */
async function waitForDiagram(page: Page) {
  await expect(page.locator(diagram)).toBeVisible();
}

function button(page: Page, name: string) {
  return page.getByRole("button", { name, exact: true });
}

test("何もなければ、ライト・若葉・16px で開く", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(html).toHaveAttribute("data-accent", "leaf");
  await expect(html).toHaveAttribute("data-size", "16");
  for (const name of ["ライト", "若葉", "16px"]) {
    await expect(button(page, name)).toHaveAttribute("aria-pressed", "true");
  }
  for (const name of ["ダーク", "江戸紫", "14px"]) {
    await expect(button(page, name)).toHaveAttribute("aria-pressed", "false");
  }
});

test("帯のボタンを押すとすぐに変わり、URL に残り、その URL で開くと同じ見た目で開く", async ({
  page,
}) => {
  await page.goto("/");
  const html = page.locator("html");

  await clickWhenHydrated(button(page, "ダーク"));
  await button(page, "江戸紫").click();
  await button(page, "14px").click();

  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(html).toHaveAttribute("data-accent", "forge");
  await expect(html).toHaveAttribute("data-size", "14");
  for (const name of ["ダーク", "江戸紫", "14px"]) {
    await expect(button(page, name)).toHaveAttribute("aria-pressed", "true");
  }
  await expect(page).toHaveURL(/\?theme=dark&accent=forge&size=14$/);

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(html).toHaveAttribute("data-accent", "forge");
  await expect(html).toHaveAttribute("data-size", "14");
  for (const name of ["ダーク", "江戸紫", "14px"]) {
    await expect(button(page, name)).toHaveAttribute("aria-pressed", "true");
  }

  await button(page, "ライト").click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(page).toHaveURL(/\?theme=light&accent=forge&size=14$/);
});

test("帯はスクロールしても画面の上に残る", async ({ page }) => {
  await page.goto("/");
  await page.locator(".kinari-body h2", { hasText: "コールアウト" }).scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const box = await page.getByRole("banner").boundingBox();
  expect(box?.y).toBe(0);
});

test("14px にすると、見出しとコードも 16px のときの 14/16 倍になり、図の字は変わらない", async ({
  page,
}) => {
  const sizes = async () => {
    await waitForDiagram(page);
    return page.evaluate(() => {
      const px = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`${selector} がない`);
        return parseFloat(getComputedStyle(element).fontSize);
      };
      return {
        body: px(".kinari-body"),
        h2: px(".kinari-body h2"),
        code: px(".kinari-body pre"),
        diagram: px(".kinari-body .mermaid-figure .nodeLabel"),
      };
    });
  };

  await page.goto("/?size=16");
  const large = await sizes();
  await page.goto("/?size=14");
  const small = await sizes();

  expect(large.body).toBe(16);
  expect(small.body).toBe(14);
  expect(small.h2).toBeCloseTo((large.h2 * 14) / 16);
  expect(small.code).toBeCloseTo((large.code * 14) / 16);
  expect(small.diagram).toBe(large.diagram);
});

test("スマホの幅で、ページは横にスクロールしない", async ({ page }) => {
  await page.goto("/");
  await waitForDiagram(page);
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
});

test("折りたたみのコールアウトは、見出しを押すと開き、もう一度押すと閉じる", async ({ page }) => {
  await page.goto("/");
  const callout = page.locator(".kinari-body details.callout");
  const summary = callout.locator("summary");
  const content = callout.getByText("閉じた状態で始まるコールアウトです。");

  await expect(content).toBeHidden();
  await summary.click();
  await expect(callout).toHaveAttribute("open", "");
  await expect(content).toBeVisible();
  await summary.click();
  await expect(content).toBeHidden();
});

test("図は svg に描かれ、ダークにすると今の色で描き直され、描けない図は元のコードのまま残る", async ({
  page,
}) => {
  await page.goto("/");
  await waitForDiagram(page);
  const svg = page.locator(diagram);
  const firstId = await svg.getAttribute("id");

  // 見本の本文には描けない図を載せないので、ここで本文の先頭に入れる（描き直しは先頭から順に進む）
  await page.locator(".kinari-body").evaluate((body) => {
    const pre = document.createElement("pre");
    pre.dataset.mermaid = "";
    pre.className = "broken-diagram";
    pre.textContent = "flowchart LR\n  A[開く --> ";
    body.prepend(pre);
  });

  await clickWhenHydrated(button(page, "ダーク"));
  await expect(svg).not.toHaveAttribute("id", firstId ?? "");

  // 図の文字は、ページの文字（text）と同じ色
  const colors = await page.evaluate(() => ({
    label: getComputedStyle(document.querySelector(".kinari-body .mermaid-figure .nodeLabel")!)
      .color,
    text: getComputedStyle(document.body).color,
  }));
  expect(colors.label).toBe(colors.text);

  const broken = page.locator(".kinari-body pre.broken-diagram");
  await expect(broken).toBeVisible();
  await expect(broken).toHaveText("flowchart LR\n  A[開く --> ");
  await expect(page.getByText(/Syntax error/)).toHaveCount(0);
});

test("問題文のコードには行番号が出て、選んで写した文字には行番号が入らない", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const code = page.getByRole("region", { name: "問題" }).locator("pre.line-numbers code");
  await expect(code).toBeVisible();

  // 行番号は CSS（::before）で出ている
  const numbers = await code
    .locator(".code-line")
    .evaluateAll((lines) => lines.map((line) => getComputedStyle(line, "::before").content));
  expect(numbers).toHaveLength(3);
  for (const content of numbers) expect(content).not.toBe("none");

  // コードを全部選んで写す
  await code.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  await page.keyboard.press("ControlOrMeta+C");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.trimEnd()).toBe("items = [3, 1, 2]\nitems.sort()\nprint(items[0])");
});

test("ライト・若葉・16px の画像が基準と同じ", async ({ page }) => {
  await page.goto("/");
  await waitForDiagram(page);
  await expect(page).toHaveScreenshot("sample-light.png", { fullPage: true });
});

test("ダーク・若葉・16px の画像が基準と同じ", async ({ page }) => {
  await page.goto("/?theme=dark");
  await waitForDiagram(page);
  await expect(page).toHaveScreenshot("sample-dark.png", { fullPage: true });
});

test("ダーク・江戸紫の画像が基準と同じ", async ({ page }) => {
  await page.goto("/?theme=dark&accent=forge");
  await waitForDiagram(page);
  await expect(page).toHaveScreenshot("sample-dark-forge.png", { fullPage: true });
});

test("ライト・14px の画像が基準と同じ", async ({ page }) => {
  await page.goto("/?size=14");
  await waitForDiagram(page);
  await expect(page).toHaveScreenshot("sample-light-14.png", { fullPage: true });
});
