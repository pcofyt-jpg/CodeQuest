import { describe, expect, it } from "vitest";
import { pickDaily, todayKey } from "./pick";
import { lessons } from "@/content/lessons/catalog";

const done = ["kak-ustroen-sajt", "klaviatura", "tegi", "studiya", "zagolovok", "opisanie", "cveta", "kartochka"];

describe("«Разминка дня»", () => {
  it("один и тот же набор весь день и другой — в другой день", () => {
    const a = pickDaily(lessons, done, "2026-11-01");
    expect(pickDaily(lessons, done, "2026-11-01")).toEqual(a);
    expect(pickDaily(lessons, done, "2026-11-02")).not.toEqual(a);
    expect(a).toHaveLength(4);
  });

  it("только из пройденных уроков и не больше двух из одного урока", () => {
    for (let d = 1; d <= 20; d++) {
      const items = pickDaily(lessons, done, `2026-11-${d}`);
      const titles = items.map((x) => x.caption);
      for (const t of titles) expect(titles.filter((x) => x === t).length).toBeLessThanOrEqual(2);
      const allowed = new Set(done.map((s) => `из урока «${lessons.find((l) => l.slug === s)!.title}»`));
      for (const t of titles) expect(allowed.has(t), t).toBe(true);
    }
  });

  it("давно пройденные уроки попадаются чаще недавних", () => {
    const counts = new Map<string, number>();
    for (let d = 0; d < 300; d++) {
      for (const x of pickDaily(lessons, done, `день-${d}`)) counts.set(x.caption, (counts.get(x.caption) ?? 0) + 1);
    }
    const first = counts.get("из урока «Как устроен сайт»") ?? 0;
    const last = counts.get("из урока «Карточка»") ?? 0;
    expect(first).toBeGreaterThan(last);
  });

  it("без пройденных уроков разминки нет; дата в формате ГГГГ-ММ-ДД", () => {
    expect(pickDaily(lessons, [], "x")).toEqual([]);
    expect(todayKey(new Date(2026, 10, 1))).toBe("2026-11-01");
  });
});
