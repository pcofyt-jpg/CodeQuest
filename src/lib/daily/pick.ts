import type { Exercise, Lesson } from "@/content/lessons/types";

/**
 * «Разминка дня»: короткие задания из уже пройденных уроков — вперемешку HTML, CSS, JavaScript и Python.
 * Повторение с промежутками: чем раньше пройден урок, тем чаще его задания попадаются.
 * Набор один на весь день (зерно — дата), из одного урока — не больше двух заданий.
 */
export type DailyItem = { exercise: Exercise; caption: string };

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619);
  return h >>> 0;
}

export function pickDaily(lessons: Lesson[], completed: string[], seedText: string, count = 4): DailyItem[] {
  const pool: (DailyItem & { weight: number; slug: string })[] = [];
  completed.forEach((slug, order) => {
    const l = lessons.find((x) => x.slug === slug);
    if (!l?.practice?.length) return;
    const weight = completed.length - order; // раньше пройден — больше вес
    for (const exercise of l.practice) pool.push({ exercise, caption: `из урока «${l.title}»`, weight, slug });
  });
  const random = rng(hash(seedText));
  const picked: DailyItem[] = [];
  const perLesson = new Map<string, number>();
  const left = [...pool];
  while (picked.length < count && left.length > 0) {
    const total = left.reduce((s, x) => s + x.weight, 0);
    let r = random() * total;
    let idx = 0;
    while (idx < left.length - 1 && r >= left[idx]!.weight) r -= left[idx++]!.weight;
    const item = left.splice(idx, 1)[0]!;
    if ((perLesson.get(item.slug) ?? 0) >= 2) continue;
    perLesson.set(item.slug, (perLesson.get(item.slug) ?? 0) + 1);
    picked.push({ exercise: item.exercise, caption: item.caption });
  }
  return picked;
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
