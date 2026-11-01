import { describe, expect, it } from "vitest";
import { CONTROL_SIZE, isPassed, pickControl } from "./store";
import { lessons } from "@/content/lessons/catalog";
import { courses } from "@/content/courses";
import { PLACEMENT_PASS, placementQuestions } from "@/content/placement";

describe("контрольная миссия", () => {
  it("для каждого курса с сертификатом — 8 вопросов из тестов его уроков", () => {
    for (const c of courses.filter((x) => x.skills)) {
      const own = new Set(lessons.filter((l) => l.course === c.id).flatMap((l) => l.quiz.map((q) => q.question)));
      const qs = pickControl(lessons, c.id, "2026-11-01#0");
      expect(qs.length, c.id).toBe(CONTROL_SIZE);
      expect(new Set(qs.map((q) => q.question)).size, c.id).toBe(CONTROL_SIZE);
      for (const q of qs) expect(own.has(q.question), `${c.id}: ${q.question}`).toBe(true);
    }
  });

  it("одно зерно — одни вопросы, новая попытка — другие", () => {
    const a = pickControl(lessons, "pervyj-sajt", "день#0");
    expect(pickControl(lessons, "pervyj-sajt", "день#0")).toEqual(a);
    expect(pickControl(lessons, "pervyj-sajt", "день#1")).not.toEqual(a);
  });

  it("порог: 6 из 8 — пройдена, 5 из 8 — нет", () => {
    expect(isPassed({ correct: 6, total: 8, date: "" })).toBe(true);
    expect(isPassed({ correct: 5, total: 8, date: "" })).toBe(false);
    expect(isPassed(undefined)).toBe(false);
  });
});

describe("входная проверка", () => {
  it("10 корректных вопросов, порог 8", () => {
    expect(placementQuestions).toHaveLength(10);
    expect(PLACEMENT_PASS).toBe(8);
    for (const q of placementQuestions) {
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(q.options.length);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
});
