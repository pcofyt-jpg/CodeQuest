import { describe, expect, it } from "vitest";
import { isUnlocked, nextLessonIndex, parseProgress } from "./store";

describe("progress", () => {
  it("отбрасывает повреждённые данные", () => {
    expect(parseProgress("{не json").completed).toEqual([]);
    expect(parseProgress(JSON.stringify({ version: 1, completed: ["a"] })).completed).toEqual([]);
    const files = { html: "", css: "", js: "" };
    const p = parseProgress(
      JSON.stringify({
        version: 2,
        completed: ["a", "a", 5],
        drafts: { a: { files, savedAt: 1 }, b: { files: 1 } },
        results: { a: { files, savedAt: 2 }, c: "мусор" },
        quiz: { a: { correct: 2, total: 3 }, b: { correct: "x" } },
      }),
    );
    expect(p.completed).toEqual(["a"]);
    expect(Object.keys(p.drafts)).toEqual(["a"]);
    expect(Object.keys(p.results)).toEqual(["a"]);
    expect(p.quiz).toEqual({ a: { correct: 2, total: 3 } });
  });

  it("открывает уроки по порядку", () => {
    const slugs = ["a", "b", "c"];
    expect(isUnlocked(0, slugs, [])).toBe(true);
    expect(isUnlocked(1, slugs, [])).toBe(false);
    expect(isUnlocked(1, slugs, ["a"])).toBe(true);
    expect(nextLessonIndex(slugs, ["a"])).toBe(1);
    expect(nextLessonIndex(slugs, ["a", "b", "c"])).toBe(2);
  });
});
