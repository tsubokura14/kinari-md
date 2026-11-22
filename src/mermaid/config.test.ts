import { describe, expect, test } from "vitest";
import { mermaidConfig } from "./config";

function reader(tokens: Record<string, string>) {
  return (name: string) => tokens[name] ?? "";
}

describe("図の字の大きさ", () => {
  test("--text-sm が rem なら、ルートの字の大きさをかけて px にする", () => {
    const config = mermaidConfig(reader({ "--text-sm": "0.875rem" }), "16px");
    expect(config.themeVariables?.fontSize).toBe("14px");
  });

  test("--text-sm が px なら、そのまま使う", () => {
    const config = mermaidConfig(reader({ "--text-sm": "13px" }), "20px");
    expect(config.themeVariables?.fontSize).toBe("13px");
  });

  test("--text-sm がなければ、字の大きさを渡さない（mermaid の既定にする）", () => {
    const config = mermaidConfig(reader({}), "16px");
    expect(config.themeVariables).not.toHaveProperty("fontSize");
  });
});
