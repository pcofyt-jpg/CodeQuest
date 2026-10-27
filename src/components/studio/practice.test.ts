import { describe, expect, it } from "vitest";
import { wrongLayout } from "./PracticeBlock";

describe("подсказка о раскладке", () => {
  it("замечает русскую раскладку там, где нужны символы кода", () => {
    expect(wrongLayout("<h1>", "Бр1Ю")).toBe(true);
    expect(wrongLayout("h1 { color: red; }", "р1 Х сщдщк")).toBe(true);
    expect(wrongLayout("#start", "№ыефке")).toBe(true);
  });

  it("не мешает, когда всё правильно или русский текст есть в образце", () => {
    expect(wrongLayout("<h1>", "<h1>")).toBe(false);
    expect(wrongLayout('console.log("Привет!");', 'console.log("Привет!");')).toBe(false);
    expect(wrongLayout("<p>Привет</p>", "<p>Приве")).toBe(false);
  });
});
