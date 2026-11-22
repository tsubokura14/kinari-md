import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/**/*.test.{ts,mts}",
      "scripts/**/*.test.{ts,mts,mjs}",
      ".claude/hooks/**/*.test.{ts,mts,mjs}",
    ],
  },
});
