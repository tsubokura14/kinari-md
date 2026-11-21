import { defineConfig, devices } from "@playwright/test";

// worktree などでフォルダを分けて並べて撮るとき、ポートをぶつけないために変えられるようにする
const port = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "e2e",
  // 基準の画像は docs/specs/screens/ に置き、「今の画面」としても使う。
  // 撮るのはいつも同じ Docker イメージ（scripts/playwright-docker.mjs）なので、名前に OS 名を入れない
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
    // 開発サーバーは初回の変換が遅く表示が揺れやすいので、本番と同じビルドで撮る
    command: `npx next build sample && npx next start sample -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
