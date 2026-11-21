import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // 見本のページは sample/ にある（next の rootDir を合わせる）
    settings: { next: { rootDir: "sample/" } },
  },
  globalIgnores([
    // eslint-config-next の既定の除外（設定を書くと置き換わるため、書き直す）
    "**/.next/**",
    "out/**",
    "build/**",
    "**/next-env.d.ts",
  ]),
]);

export default eslintConfig;
