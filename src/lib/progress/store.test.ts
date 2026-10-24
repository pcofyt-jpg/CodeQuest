import { describe, expect, it } from "vitest";
import { isUnlocked, nextLessonIndex, parseProgress } from "./store";

describe("progress", () => {
  it("отбрасывает повреждённые данные", () => {
    expect(parseProgress("{не json").completed).toEqual([]);
    expect(parseProgress(JSON.stringify({ version: 2, completed: ["a"] })).completed).toEqual([]);
    const p = parseProgress(
      JSON.stringify({ version: 1, completed: ["a", "a", 5], drafts: { a: { files: { html: "", css: "", js: "" }, savedAt: 1 }, b: { files: 1 } } }),
    );
    expect(p.completed).toEqual(["a"]);
    expect(Object.keys(p.drafts)).toEqual(["a"]);
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
