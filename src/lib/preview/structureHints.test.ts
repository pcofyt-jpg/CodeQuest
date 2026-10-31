import { describe, expect, it } from "vitest";
import { analyzeStructure } from "./structureHints";
import { lessons } from "@/content/lessons/catalog";
import { templates } from "@/content/templates";

const files = (html: string, css = "") => ({ html, css, js: "" });

describe("помощник по структуре: случаи из наблюдений пилота", () => {
  it("пропущенная > в открывающем теге", () => {
    const h = analyzeStructure(files("<h1 Мой сайт</h1>\n<p>Текст</p>"));
    expect(h).toHaveLength(1); // одна ошибка — одна подсказка, без цепочки «лишний </h1>»
    expect(h[0]).toMatchObject({ file: "html", line: 1 });
    expect(h[0]!.message).toContain("нет закрывающей скобки >");
  });

  it("незакрытый и перепутанный порядок тегов — со строкой", () => {
    const h = analyzeStructure(files("<div>\n  <p>Текст\n</div>"));
    expect(h).toHaveLength(1);
    expect(h[0]!.message).toContain("<p> из строки 2 не закрыт до </div> в строке 3");
    expect(analyzeStructure(files("<p>Текст</p>\n</div>"))[0]!.message).toContain("лишний");
  });

  it("стартовый код урока «Пары тегов»: по подсказке на ошибку, без повторов", () => {
    const h = analyzeStructure(files("<h1 Мой питомец</h1>\n<p>Его зовут Рыжик.<p>\n<p>Он любит <b>спать на солнце</b>\n"));
    expect(h.map((x) => x.line)).toEqual([1, 2, 3]);
  });

  it("второй <main>", () => {
    const h = analyzeStructure(files("<main>\n  <p>а</p>\n</main>\n<main>\n  <p>б</p>\n</main>"));
    expect(h.some((x) => x.message.includes("Тег <main> открыт второй раз (строка 4, первый раз — строка 1)"))).toBe(true);
  });

  it("card1/card2 вместо одного класса card", () => {
    const h = analyzeStructure(files('<div class="card1"></div>\n<div class="card2"></div>', ".card {\n  padding: 8px;\n}"));
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ file: "css", line: 1 });
    expect(h[0]!.message).toContain("Есть похожие: card1, card2");
  });

  it("#id и .class перепутаны", () => {
    const h = analyzeStructure(files('<p id="note">а</p>\n<div class="box">б</div>', ".note { color: red; }\n#box { color: blue; }"));
    expect(h.map((x) => x.message).join(" ")).toContain("Для id пиши #note");
    expect(h.map((x) => x.message).join(" ")).toContain("Для класса пиши .box");
  });

  it("не путает цвета #ff6b6b и комментарии с селекторами, разрешает <br> и <img>", () => {
    const ok = analyzeStructure(
      files('<!-- <div> в комментарии -->\n<p>а<br>б</p>\n<img src="x.svg" alt="x">', "/* .ghost {} */\np {\n  color: #ff6b6b;\n}\n@media (max-width: 600px) {\n  p {\n    color: #fff;\n  }\n}"),
    );
    expect(ok).toEqual([]);
  });
});

describe("в правильном коде уроков и шаблонов — ни одной ложной подсказки", () => {
  for (const l of lessons.filter((x) => x.lang !== "python")) {
    it(l.slug, () => {
      expect(analyzeStructure(l.reference).map((h) => `${h.file}:${h.line} ${h.message}`)).toEqual([]);
    });
  }
  it("шаблоны «Моих проектов»", () => {
    for (const t of templates) expect(analyzeStructure(t.files), t.id).toEqual([]);
  });
});
