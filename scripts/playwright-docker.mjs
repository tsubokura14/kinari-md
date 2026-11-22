// 見本のページの画像を撮る・比べる Playwright を、日本語の書体を入れたイメージ（docker/playwright/）の中で走らせる。
// docs/design.md の「見本のページの画像は、日本語の書体を入れた Playwright のイメージで撮って比べる」
//
// 使い方：node scripts/playwright-docker.mjs [Playwright に渡す引数...]
//   npm run screenshots -- e2e/sample.spec.ts のように、後ろの引数はそのまま渡す
//
// - 手元でも CI でも、同じ手順でイメージを作り、その中で走らせる
// - Windows の Git Bash から docker を呼ぶとパスが書き換えられる（MSYS）ので、
//   シェルを通さずに child_process から docker を直接起動する
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const IMAGE_FILES = ["Dockerfile", "fonts.conf"];

/**
 * イメージの名前。入れた Playwright の版と、イメージの材料（Dockerfile・fonts.conf）の中身から作る。
 * 材料を変えると名前が変わり、作り直される。改行は LF にそろえてから数える（Windows で CRLF で取り出しても同じ名前にする）
 */
export function imageTag({ version, files }) {
  const hash = createHash("sha256");
  for (const content of files) {
    const normalized = content.replaceAll("\r\n", "\n");
    // 長さを先に入れて、ファイルの区切りが違えば別の値にする
    hash.update(`${Buffer.byteLength(normalized)}\n${normalized}`);
  }
  return `kinari-md-playwright:v${version}-${hash.digest("hex").slice(0, 12)}`;
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, { stdio: "inherit", ...options });
  if (result.error) {
    console.error(result.error.message);
    return 1;
  }
  return result.status ?? 1;
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const args = process.argv.slice(2);
  const context = resolve(root, "docker/playwright");

  // イメージのもとは、入れた Playwright と同じ版にする（違うとブラウザが見つからない）
  const { version } = JSON.parse(
    readFileSync(resolve(root, "node_modules/@playwright/test/package.json"), "utf8"),
  );
  const image = imageTag({
    version,
    files: IMAGE_FILES.map((name) => readFileSync(resolve(context, name), "utf8")),
  });

  // 同じ名前のイメージがあれば作らない
  const exists = spawnSync("docker", ["image", "inspect", image], { stdio: "ignore" });
  if (exists.error) {
    console.error(exists.error.message);
    return 1;
  }
  if (exists.status !== 0) {
    const built = run("docker", [
      "build",
      "--build-arg",
      `PLAYWRIGHT_VERSION=${version}`,
      "--tag",
      image,
      context,
    ]);
    if (built !== 0) return built;
  }

  // node_modules と sample/.next は、フォルダごとの名前つきボリュームに分ける。
  // worktree で並べても混ざらないよう、名前にフォルダの場所から作った値を入れる
  const id = createHash("sha256").update(root).digest("hex").slice(0, 12);
  const work = "/work";

  // package-lock.json が前回と同じなら npm ci を飛ばす（毎回入れ直すと遅いため）。
  // sample/.next のボリュームは前回のまま残るので、ページを消す・移したあとは、前回の型のファイル
  // （tsconfig.json の include で tsc が読む）が消えたページを指したまま残り、
  // next build が型チェックで止まる。型のファイルは next build が毎回作り直すので、撮る前に消す
  const inner = [
    "stamp=node_modules/.package-lock.stamp",
    'if ! cmp -s package-lock.json "$stamp"; then npm ci && cp package-lock.json "$stamp"; fi',
    "rm -rf sample/.next/types sample/.next/dev/types",
    'exec npx playwright test "$@"',
  ].join(" && ");

  const dockerArgs = [
    "run",
    "--rm",
    "--init",
    "--ipc=host",
    "--mount",
    `type=bind,source=${root},target=${work}`,
    "--mount",
    `type=volume,source=kinari-md-${id}-node_modules,target=${work}/node_modules`,
    "--mount",
    `type=volume,source=kinari-md-${id}-next,target=${work}/sample/.next`,
    "--workdir",
    work,
    "--env",
    "NEXT_TELEMETRY_DISABLED=1",
    "--env",
    "NPM_CONFIG_UPDATE_NOTIFIER=false",
    // playwright.config.ts の forbidOnly が CI で効くように渡す
    ...(process.env.CI ? ["--env", `CI=${process.env.CI}`] : []),
    ...(process.env.PORT ? ["--env", `PORT=${process.env.PORT}`] : []),
    ...(process.stdout.isTTY ? ["-t"] : []),
    image,
    "sh",
    "-c",
    inner,
    "sh",
    ...args,
  ];

  return run("docker", dockerArgs);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(main());
}
