import { describe, expect, it } from "vitest";
import { imageTag } from "./playwright-docker.mjs";

const dockerfile =
  "ARG PLAYWRIGHT_VERSION\nFROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble\n";
const fontsConf = "<fontconfig></fontconfig>\n";

describe("imageTag", () => {
  it("入れた Playwright の版と、Dockerfile・fonts.conf の中身から作った値を名前に入れる", () => {
    const tag = imageTag({ version: "1.65.0", files: [dockerfile, fontsConf] });
    expect(tag).toMatch(/^kinari-md-playwright:v1\.65\.0-[0-9a-f]{12}$/);
  });

  it("Playwright の版が変わると、名前が変わる", () => {
    const a = imageTag({ version: "1.65.0", files: [dockerfile, fontsConf] });
    const b = imageTag({ version: "1.66.0", files: [dockerfile, fontsConf] });
    expect(a).not.toBe(b);
  });

  it("Dockerfile か fonts.conf の中身が変わると、名前が変わる", () => {
    const base = imageTag({ version: "1.65.0", files: [dockerfile, fontsConf] });
    const changedDockerfile = imageTag({
      version: "1.65.0",
      files: [`${dockerfile}RUN true\n`, fontsConf],
    });
    const changedFonts = imageTag({
      version: "1.65.0",
      files: [dockerfile, "<fontconfig><alias/></fontconfig>\n"],
    });
    expect(changedDockerfile).not.toBe(base);
    expect(changedFonts).not.toBe(base);
  });

  it("ファイルの区切りが違えば、つなげた文字が同じでも名前が変わる", () => {
    const a = imageTag({ version: "1.65.0", files: ["ab", "c"] });
    const b = imageTag({ version: "1.65.0", files: ["a", "bc"] });
    expect(a).not.toBe(b);
  });

  it("改行が CRLF でも LF でも、同じ名前になる（Windows で取り出したとき）", () => {
    const lf = imageTag({ version: "1.65.0", files: [dockerfile, fontsConf] });
    const crlf = imageTag({
      version: "1.65.0",
      files: [dockerfile.replaceAll("\n", "\r\n"), fontsConf.replaceAll("\n", "\r\n")],
    });
    expect(crlf).toBe(lf);
  });
});
