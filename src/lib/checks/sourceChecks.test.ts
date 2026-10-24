import { describe, expect, it } from "vitest";
import { combineResults, runSourceCheck } from "./sourceChecks";
import type { Check } from "@/content/lessons/types";

const files = { html: "<!-- <p>в комментарии</p> --><h1>x</h1>", css: "/* a { color: red; } */ a { color: red; }", js: "// addEventListener(\nfoo()" };

describe("source checks", () => {
  it("игнорирует комментарии", () => {
    expect(runSourceCheck({ kind: "source", file: "html", pattern: "<p\\b", message: "" }, files)).toBe(false);
    expect(runSourceCheck({ kind: "source", file: "js", pattern: "addEventListener\\(", message: "" }, files)).toBe(false);
    expect(runSourceCheck({ kind: "source", file: "css", pattern: "\\{[^}]*:[^}]*\\}", minMatches: 2, message: "" }, files)).toBe(false);
  });

  it("объединяет DOM-результаты по порядку", () => {
    const checks: Check[] = [
      { kind: "exists", selector: "h1", message: "a" },
      { kind: "noErrors", message: "b" },
      { kind: "exists", selector: "p", message: "c" },
    ];
    expect(combineResults(checks, [true, false], files, 0).map((r) => r.ok)).toEqual([true, true, false]);
    expect(combineResults(checks, [true, true], files, 2).map((r) => r.ok)).toEqual([true, false, true]);
  });
});
