import { describe, expect, it } from "vitest";
import { analyzeBrackets, describeBrackets } from "./brackets";

describe("проверка скобок", () => {
  it("находит незакрытую круглую скобку (случай, где ошиблись обе модели)", () => {
    const code = 'document.querySelector("#go").addEventListener("click", function () {\n  document.querySelector("#out").textContent = "Привет";\n}\n';
    const p = analyzeBrackets(code);
    expect(p).toEqual({ kind: "unclosed", open: "(", need: ")", line: 1 });
    expect(describeBrackets(p!)).toBe("Не закрыта скобка «(» из строки 1 — ей нужна пара «)».");
  });

  it("находит лишнюю и перепутанную скобку", () => {
    expect(analyzeBrackets("a();\n}")).toEqual({ kind: "extra", found: "}", line: 2 });
    expect(analyzeBrackets("f(function () {\n  x();\n)};")).toMatchObject({ kind: "mismatch", found: ")", need: "}", line: 3, openLine: 1 });
  });

  it("не считает скобки внутри строк и комментариев", () => {
    expect(analyzeBrackets('const s = "(((";\n// )))\n/* { */ f(\'}\');')).toBeNull();
    expect(analyzeBrackets("const t = `a ( b`;")).toBeNull();
  });

  it("правильный код без замечаний", () => {
    expect(analyzeBrackets('button.addEventListener("click", function () {\n  count = count + 1;\n});')).toBeNull();
  });
});
