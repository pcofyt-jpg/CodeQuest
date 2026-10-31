import { describe, expect, it } from "vitest";
import { courseLessons, lessons } from "./catalog";
import { courses } from "@/content/courses";
import { templates } from "@/content/templates";
import { images } from "@/content/images";
import { glossary, findTermId } from "@/content/glossary";
import { protectLoops } from "@/lib/preview/loopProtect";
import { runSourceCheck } from "@/lib/checks/sourceChecks";
import { applyAdditions, lessonCheckpoint, lessonStarter } from "@/lib/lessons/projectFlow";

const slugs = lessons.map((l) => l.slug);
/** Стартовый код, если ребёнок прошёл прошлые уроки ровно как в эталоне. */
const starterFromReferences = (i: number) =>
  lessonStarter(lessons, i, Object.fromEntries(lessons.map((l) => [l.slug, l.reference])));

describe("каталог уроков", () => {
  it("курсы 1 и 2: уникальные адреса, номера по порядку внутри курса", () => {
    expect(courseLessons("pervyj-sajt")).toHaveLength(10);
    expect(courseLessons("nastoyashchij-sajt")).toHaveLength(12);
    expect(new Set(slugs).size).toBe(lessons.length);
    for (const c of courses.filter((x) => x.status === "ready")) {
      courseLessons(c.id).forEach((l, i) => expect(l.number, l.slug).toBe(i + 1));
    }
    lessons.forEach((l) => expect(l.slug).toMatch(/^[a-z0-9-]+$/));
    // уроки одного курса идут подряд
    const order = lessons.map((l) => l.course);
    expect(order.filter((c, i) => i === 0 || c !== order[i - 1])).toEqual(["start", "pervyj-sajt", "struktura", "nastoyashchij-sajt", "python", "kiber", "igry"]);
    expect(courseLessons("struktura")).toHaveLength(8);
    expect(courseLessons("kiber")).toHaveLength(10);
    expect(courseLessons("igry")).toHaveLength(12);
    expect(courseLessons("start")).toHaveLength(4);
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

  it("внутри курса подсказок не становится больше от урока к уроку", () => {
    for (const c of courses.filter((x) => x.status === "ready")) {
      const ls = courseLessons(c.id);
      for (let i = 1; i < ls.length; i++) {
        expect(ls[i]!.hints.length, ls[i]!.slug).toBeLessThanOrEqual(ls[i - 1]!.hints.length);
      }
    }
  });

  it("сквозной проект: первый урок каждого курса с заготовкой, тренировки — со своим кодом", () => {
    for (const c of courses.filter((x) => x.status === "ready" && x.id !== "start" && !x.standalone)) {
      const first = courseLessons(c.id)[0]!;
      expect(first.track, c.id).toBe("project");
      expect(first.track === "project" && first.starter, c.id).toBeTruthy();
      expect(lessonCheckpoint(lessons, lessons.indexOf(first)), c.id).toBeNull();
    }
    // курс 2 не продолжает сайт из курса 1
    expect(starterFromReferences(slugs.indexOf("karkas")).html).not.toContain("Барсик");
    // финал курса 2 — с чистого листа
    expect(starterFromReferences(slugs.indexOf("sayt-s-nulya")).html).not.toContain("Мой футбол");
    expect(lessonCheckpoint(lessons, slugs.indexOf("sayt-s-nulya"))).toBeNull();
    // урок 2 курса 2 вставляет заготовку внутрь <main>
    expect(starterFromReferences(slugs.indexOf("spiski")).html).toMatch(/Урок 2[^]*<\/main>/);
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

describe("разминки «Попробуй»", () => {
  it("корректны во всех уроках, где есть", () => {
    let total = 0;
    for (const l of lessons) {
      for (const ex of l.practice ?? []) {
        total++;
        if (ex.kind === "choice") {
          expect(ex.correct, `${l.slug}: ${ex.question}`).toBeGreaterThanOrEqual(0);
          expect(ex.correct, `${l.slug}: ${ex.question}`).toBeLessThan(ex.options.length);
          expect(new Set(ex.options).size, l.slug).toBe(ex.options.length);
        } else if (ex.kind === "order") {
          expect(ex.lines.length, `${l.slug}: ${ex.prompt}`).toBeGreaterThanOrEqual(2);
        } else if (ex.kind === "fill") {
          expect(ex.answers.length, l.slug).toBeGreaterThan(0);
          expect(ex.answers.every((a) => a.trim().length > 0), l.slug).toBe(true);
        } else {
          expect(ex.target.length, l.slug).toBeGreaterThan(0);
        }
        expect(ex.explain.length, l.slug).toBeGreaterThan(10);
      }
    }
    expect(total).toBeGreaterThanOrEqual(35); // защита от случайной потери заданий
    // у каждого урока «Старта» и курса 1 есть разминка
    for (const l of [...courseLessons("start"), ...courseLessons("pervyj-sajt")]) {
      expect((l.practice ?? []).length, l.slug).toBeGreaterThan(0);
    }
  });
});

describe("шаблоны «Моих проектов»", () => {
  it("код разбирается, картинки есть в библиотеке", () => {
    for (const t of templates) {
      expect(protectLoops(t.files.js).ok, t.id).toBe(true);
      for (const m of t.files.html.matchAll(/kartinki\/([a-z0-9-]+)\.svg/g)) {
        expect(images.some((i) => i.name === m[1]), `${t.id}: ${m[1]}`).toBe(true);
      }
    }
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
    expect(findTermId("@media (max-width: 600px) { … }")).toBe("media");
    expect(findTermId("padding: 20px;")).toBe("padding");
    expect(findTermId("что-то-неизвестное")).toBeNull();
    // одно слово в двух языках: карточка по языку урока
    expect(findTermId("if")).toBe("js-if");
    expect(findTermId("if", "py")).toBe("py-if");
    expect(findTermId("else", "py")).toBe("py-if");
    expect(findTermId("setInterval")).toBe("js-timer");
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

describe("applyAdditions: вставка перед тегом", () => {
  it("вставляет перед последним </main>, а без тега — в конец", () => {
    const base = { html: "<main>\n  <p>a</p>\n</main>\n<footer></footer>\n", css: "", js: "" };
    const out = applyAdditions(base, { html: { before: "</main>", text: "  <!-- сюда -->\n" } });
    expect(out.html).toBe("<main>\n  <p>a</p>\n  <!-- сюда -->\n</main>\n<footer></footer>\n");
    const noMain = applyAdditions({ html: "<p>x</p>", css: "", js: "" }, { html: { before: "</main>", text: "<!-- y -->\n" } });
    expect(noMain.html).toBe("<p>x</p>\n<!-- y -->\n");
    const many = applyAdditions(base, { html: [{ before: "</main>", text: "1" }, { before: "</footer>", text: "2" }] });
    expect(many.html).toContain("1</main>");
    expect(many.html).toContain("2</footer>");
  });
});
