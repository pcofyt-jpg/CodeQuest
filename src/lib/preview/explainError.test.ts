import { describe, expect, it } from "vitest";
import { explainError, suggestName } from "./explainError";

describe("explainError", () => {
  it("подсказывает правильное название при опечатке", () => {
    expect(suggestName("button.addEventListner")).toBe("addEventListener");
    expect(suggestName("querySelecter")).toBe("querySelector");
    expect(suggestName("textContnet")).toBe("textContent");
    expect(suggestName("addEventListener")).toBeNull();
    expect(suggestName("myButton")).toBeNull();
  });

  it("объясняет ошибки по-русски и добавляет подсказку", () => {
    expect(explainError("Uncaught TypeError: button.addEventListner is not a function")).toContain(
      "Может быть, ты имел в виду addEventListener?",
    );
    expect(explainError("ReferenceError: documnet is not defined")).toContain("document");
    expect(explainError("TypeError: Cannot read properties of null (reading 'addEventListener')")).toContain(
      "селектор в querySelector",
    );
    expect(explainError("__CQ_INFINITE_LOOP__:0")).toContain("Цикл");
  });
});
