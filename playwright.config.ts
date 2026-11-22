import { defineConfig, devices } from "@playwright/test";

// worktree などでフォルダを分けて並べて撮るとき、ポートをぶつけないために変えられるようにする
const port = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "e2e",
  // docs/design.md の「見本のページの画像は、日本語の書体を入れた Playwright のイメージで撮って比べる」
  snapshotPathTemplate: "docs/specs/screens/{arg}{ext}",
  forbidOnly: !!process.env.CI,
  reporter: [["list"], ["html", { open: "never" }]],
  expect: {
    toHaveScreenshot: { animations: "disabled" },
  },
  use: {
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      // 幅はスマホ（md-leaf と同じ）。PC の幅は #2 で中身と一緒に足す
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        baseURL: `http://localhost:${port}`,
      },
    },
  ],
  webServer: {
    command: `npx next build sample && npx next start sample -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
