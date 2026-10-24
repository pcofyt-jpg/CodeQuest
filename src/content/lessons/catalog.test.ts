import { describe, expect, it } from "vitest";
import { lessons } from "./catalog";
import { protectLoops } from "@/lib/preview/loopProtect";
import { runSourceCheck } from "@/lib/checks/sourceChecks";

describe("каталог уроков", () => {
  it("содержит 10 уроков с уникальными адресами и номерами по порядку", () => {
    expect(lessons).toHaveLength(10);
    expect(new Set(lessons.map((l) => l.slug)).size).toBe(10);
    lessons.forEach((l, i) => expect(l.number).toBe(i + 1));
  });

  it("у каждого урока есть всё необходимое", () => {
    for (const l of lessons) {
      expect(l.goal, l.slug).toBeTruthy();
      expect(l.steps.length, l.slug).toBeGreaterThan(0);
      expect(l.hints.length, l.slug).toBeGreaterThan(0);
      expect(l.checks.length, l.slug).toBeGreaterThan(0);
      expect(l.learned.length, l.slug).toBeGreaterThan(0);
      expect(l.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("подсказок не становится больше от урока к уроку", () => {
    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i]!.hints.length).toBeLessThanOrEqual(lessons[i - 1]!.hints.length);
    }
  });

  it("стартовый JS разбирается (кроме намеренных ошибок)", () => {
    for (const l of lessons) expect(protectLoops(l.starter.js).ok, l.slug).toBe(true);
  });

  it("регулярные выражения проверок корректны, а стартовый код их не проходит целиком", () => {
    for (const l of lessons) {
      for (const c of l.checks) {
        if (c.kind === "source") {
          expect(() => new RegExp(c.pattern, c.flags)).not.toThrow();
        }
      }
      const sourceChecks = l.checks.filter((c) => c.kind === "source");
      if (sourceChecks.length > 0) {
        const allPass = sourceChecks.every((c) => c.kind === "source" && runSourceCheck(c, l.starter));
        expect(allPass, l.slug).toBe(false);
      }
    }
  });
});
