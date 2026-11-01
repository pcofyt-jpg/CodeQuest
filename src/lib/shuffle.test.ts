import { describe, expect, it } from "vitest";
import { optionOrder } from "./shuffle";
import { lessons } from "@/content/lessons/catalog";

describe("порядок вариантов ответа", () => {
  it("постоянный, полный и не совпадает с исходным", () => {
    expect(optionOrder("вопрос", 3)).toEqual(optionOrder("вопрос", 3));
    for (const n of [2, 3, 4]) {
      for (let k = 0; k < 50; k++) {
        const o = optionOrder(`q${k}`, n);
        expect([...o].sort()).toEqual(Array.from({ length: n }, (_, i) => i));
        expect(o.every((v, i) => v === i)).toBe(false);
      }
    }
  });

  it("правильный ответ на экране стоит на разных местах, а не всегда первым", () => {
    const places = new Map<number, number>();
    for (const l of lessons) {
      for (const q of l.quiz) {
        const shownAt = optionOrder(q.question + q.options.join("|"), q.options.length).indexOf(q.correct);
        places.set(shownAt, (places.get(shownAt) ?? 0) + 1);
      }
    }
    const total = [...places.values()].reduce((a, b) => a + b, 0);
    expect((places.get(0) ?? 0) / total).toBeLessThan(0.5);
    expect(places.size).toBeGreaterThanOrEqual(3);
  });
});
