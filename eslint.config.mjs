import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwind from "eslint-plugin-better-tailwindcss";

// 文字列やテンプレートの中の、トークンにない値（色コードと px）
const HEX_COLOR = "/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/";
const PX_VALUE = "/\\b[0-9]*\\.?[0-9]+px\\b/";
const TOKEN_MESSAGE =
  "トークンにない値は使わない。src/styles/tokens.css・sample/app/tokens.css のトークン（CSS 変数か Tailwind のクラス）を使う";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // 見本のページは sample/ にある（next の rootDir を合わせる）
    settings: { next: { rootDir: "sample/" } },
  },
  {
    files: ["src/**/*.{ts,tsx}", "sample/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: { "better-tailwindcss": betterTailwind },
    settings: {
      "better-tailwindcss": { entryPoint: "sample/app/globals.css" },
    },
    rules: {
      // kinari-body は本文の CSS（kinari-md/body.css）のクラスで、Tailwind のクラスではない
      "better-tailwindcss/no-unknown-classes": ["error", { ignore: ["^kinari-body$"] }],
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              pattern: "\\[",
              message: "任意の値のクラスは使わない。トークンにある段階のクラスを使う",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        { selector: `Literal[value=${HEX_COLOR}]`, message: TOKEN_MESSAGE },
        { selector: `Literal[value=${PX_VALUE}]`, message: TOKEN_MESSAGE },
        { selector: `TemplateElement[value.raw=${HEX_COLOR}]`, message: TOKEN_MESSAGE },
        { selector: `TemplateElement[value.raw=${PX_VALUE}]`, message: TOKEN_MESSAGE },
      ],
    },
  },
  globalIgnores([
    // eslint-config-next の既定の除外（設定を書くと置き換わるため、書き直す）
    "**/.next/**",
    "out/**",
    "build/**",
    "**/next-env.d.ts",
    // Playwright の結果（レポートの HTML に入る JS を読まない）
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
