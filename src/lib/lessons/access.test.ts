import { describe, expect, it } from "vitest";
import { lessonOpen, nextIndex } from "./access";
import type { Course } from "@/content/courses";

const courses: Course[] = [
  { id: "s", number: 0, title: "Старт", description: "", status: "ready", planet: "#000" },
  { id: "c1", number: 1, title: "Курс 1", description: "", status: "ready", planet: "#000" },
  { id: "c2", number: 2, title: "Курс 2", description: "", status: "ready", requires: "c1", planet: "#000" },
];
const items = [
  { slug: "s1", course: "s" },
  { slug: "s2", course: "s" },
  { slug: "a1", course: "c1" },
  { slug: "a2", course: "c1" },
  { slug: "b1", course: "c2" },
  { slug: "b2", course: "c2" },
];

describe("доступ к урокам", () => {
  it("«Старт» и курс 1 открыты сразу, внутри курса — по порядку", () => {
    expect(lessonOpen(items, 0, [], courses)).toBe(true);
    expect(lessonOpen(items, 1, [], courses)).toBe(false);
    expect(lessonOpen(items, 2, [], courses)).toBe(true); // курс 1 не ждёт «Старт»
    expect(lessonOpen(items, 3, [], courses)).toBe(false);
    expect(lessonOpen(items, 3, ["a1"], courses)).toBe(true);
  });

  it("курс 2 открывается только после всего курса 1", () => {
    expect(lessonOpen(items, 4, ["a1"], courses)).toBe(false);
    expect(lessonOpen(items, 4, ["a1", "a2"], courses)).toBe(true);
    expect(lessonOpen(items, 5, ["a1", "a2"], courses)).toBe(false);
  });

  it("«продолжить» ведёт дальше самого дальнего пройденного, а новичка — в «Старт»", () => {
    expect(nextIndex(items, [], courses)).toBe(0);
    expect(nextIndex(items, ["s1"], courses)).toBe(1);
    // прошёл курс 1 до появления «Старта» — продолжает курс 2, а не возвращается в «Старт»
    expect(nextIndex(items, ["a1", "a2"], courses)).toBe(4);
    expect(nextIndex(items, ["a1", "a2", "b1", "b2"], courses)).toBe(0);
    expect(nextIndex(items, items.map((x) => x.slug), courses)).toBe(5);
  });
});
