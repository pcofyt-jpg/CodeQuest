import { describe, expect, it } from "vitest";
import { lessons } from "./catalog";
import { glossary, findTermId } from "@/content/glossary";
import { protectLoops } from "@/lib/preview/loopProtect";
import { runSourceCheck } from "@/lib/checks/sourceChecks";
import { applyAdditions, lessonCheckpoint, lessonStarter } from "@/lib/lessons/projectFlow";

const slugs = lessons.map((l) => l.slug);
/** Стартовый код, если ребёнок прошёл прошлые уроки ровно как в эталоне. */
const starterFromReferences = (i: number) =>
  lessonStarter(lessons, i, Object.fromEntries(lessons.map((l) => [l.slug, l.reference])));

describe("каталог уроков", () => {
  it("10 уроков с уникальными адресами и номерами по порядку", () => {
    expect(lessons).toHaveLength(10);
    expect(new Set(slugs).size).toBe(10);
    lessons.forEach((l, i) => expect(l.number).toBe(i + 1));
    lessons.forEach((l) => expect(l.slug).toMatch(/^[a-z0-9-]+$/));
  });

  it("у каждого урока есть всё необходимое", () => {
    for (const l of lessons) {
      expect(l.goal, l.slug).toBeTruthy();
      expect(l.explanation.length, l.slug).toBeGreaterThan(0);
      expect(l.steps.length, l.slug).toBeGreaterThan(0);
      expect(l.hints.length, l.slug).toBeGreaterThan(0);
      expect(l.checks.length, l.slug).toBeGreaterThan(0);
      expect(l.learned.length, l.slug).toBeGreaterThan(0);
      for (const c of l.checks) expect(c.fix.length, `${l.slug}: ${c.message}`).toBeGreaterThan(10);
    }
  });

  it("тесты после уроков корректны", () => {
    for (const l of lessons) {
      expect(l.quiz.length, l.slug).toBeGreaterThanOrEqual(2);
      expect(l.quiz.length, l.slug).toBeLessThanOrEqual(3);
      for (const q of l.quiz) {
        expect(q.options.length, q.question).toBeGreaterThanOrEqual(2);
        expect(q.correct, q.question).toBeGreaterThanOrEqual(0);
        expect(q.correct, q.question).toBeLessThan(q.options.length);
        expect(new Set(q.options).size, q.question).toBe(q.options.length);
        expect(q.explain.length, q.question).toBeGreaterThan(10);
      }
    }
  });

  it("подсказок не становится больше от урока к уроку", () => {
    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i]!.hints.length).toBeLessThanOrEqual(lessons[i - 1]!.hints.length);
    }
  });

  it("сквозной проект: первый урок с заготовкой, тренировки — со своим кодом", () => {
    const first = lessons[0]!;
    expect(first.track).toBe("project");
    expect(first.track === "project" && first.starter).toBeTruthy();
    for (const l of lessons) if (l.track === "practice") expect(l.starter, l.slug).toBeTruthy();
    expect(lessonCheckpoint(lessons, 0)).toBeNull();
    expect(lessonCheckpoint(lessons, slugs.indexOf("oshibka"))).toBeNull();
    // урок 8 продолжает урок 6, пропуская тренировку 7
    expect(starterFromReferences(slugs.indexOf("schetchik")).css).toBe(lessons[slugs.indexOf("dizajn")]!.reference.css);
  });

  it("стартовый код и эталоны разбираются как JavaScript", () => {
    lessons.forEach((l, i) => {
      expect(protectLoops(starterFromReferences(i).js).ok, `${l.slug} старт`).toBe(true);
      expect(protectLoops(l.reference.js).ok, `${l.slug} эталон`).toBe(true);
    });
  });

  it("эталон проходит проверки кода, а стартовый код — нет", () => {
    lessons.forEach((l, i) => {
      const sourceChecks = l.checks.filter((c) => c.kind === "source");
      for (const c of sourceChecks) {
        if (c.kind !== "source") continue;
        expect(() => new RegExp(c.pattern, c.flags)).not.toThrow();
        expect(runSourceCheck(c, l.reference), `${l.slug}: эталон, ${c.message}`).toBe(true);
      }
      if (sourceChecks.length > 0) {
        const start = starterFromReferences(i);
        const allPass = sourceChecks.every((c) => c.kind === "source" && runSourceCheck(c, start));
        expect(allPass, `${l.slug}: стартовый код не должен проходить`).toBe(false);
      }
    });
  });
});

describe("шпаргалка", () => {
  it("уникальные понятия, уроки существуют, примеры не пустые", () => {
    expect(new Set(glossary.map((t) => t.id)).size).toBe(glossary.length);
    for (const t of glossary) {
      expect(slugs, t.id).toContain(t.introducedIn);
      expect(t.what.length, t.id).toBeGreaterThan(20);
      expect(t.example.length, t.id).toBeGreaterThan(0);
    }
  });

  it("новые понятия урока есть в шпаргалке и появляются именно в этом уроке", () => {
    for (const l of lessons) {
      for (const id of l.newTerms) {
        const term = glossary.find((t) => t.id === id);
        expect(term, `${l.slug}: ${id}`).toBeDefined();
        expect(term?.introducedIn, `${l.slug}: ${id}`).toBe(l.slug);
      }
    }
  });

  it("находит понятие по фрагменту кода из урока", () => {
    expect(findTermId("padding")).toBe("padding");
    expect(findTermId("padding:")).toBe("padding");
    expect(findTermId("<h1>")).toBe("h1");
    expect(findTermId("document.querySelector")).toBe("querySelector");
    expect(findTermId("message.textContent")).toBe("textContent");
    expect(findTermId("функция")).toBe("function");
    expect(findTermId("что-то-неизвестное")).toBeNull();
  });
});

describe("applyAdditions", () => {
  it("дописывает заготовку в конец, не склеивая строки", () => {
    const out = applyAdditions({ html: "<h1>x</h1>", css: "", js: "a();\n" }, { html: "\n<p>y</p>\n", css: "\nb {}\n" });
    expect(out.html).toBe("<h1>x</h1>\n\n<p>y</p>\n");
    expect(out.css).toBe("b {}\n");
    expect(out.js).toBe("a();\n");
  });
});
