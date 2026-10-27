import { courses as allCourses, type Course } from "@/content/courses";
import { lessons } from "@/content/lessons/catalog";

/**
 * Какие уроки открыты.
 * Внутри курса — по порядку. Первый урок курса открыт, если у курса нет условия
 * (requires) или все уроки нужного курса пройдены. Поэтому вводный «Старт»
 * рекомендован, но не запирает курс 1 — его могли пройти до появления «Старта».
 */
type Item = { slug: string; course: string };

export function lessonOpen(items: Item[], index: number, completed: string[], courses: Course[] = allCourses): boolean {
  const l = items[index];
  if (!l) return false;
  const prev = items[index - 1];
  if (prev && prev.course === l.course) return completed.includes(prev.slug);
  const req = courses.find((c) => c.id === l.course)?.requires;
  if (!req) return true;
  return items.filter((x) => x.course === req).every((x) => completed.includes(x.slug));
}

/** «Куда продолжить»: следующий непройденный урок после самого дальнего пройденного. */
export function nextIndex(items: Item[], completed: string[], courses: Course[] = allCourses): number {
  let furthest = -1;
  items.forEach((x, i) => {
    if (completed.includes(x.slug)) furthest = i;
  });
  for (let i = furthest + 1; i < items.length; i++) {
    if (!completed.includes(items[i]!.slug) && lessonOpen(items, i, completed, courses)) return i;
  }
  const firstOpen = items.findIndex((x, i) => !completed.includes(x.slug) && lessonOpen(items, i, completed, courses));
  return firstOpen === -1 ? items.length - 1 : firstOpen;
}

export const isLessonOpen = (index: number, completed: string[]) => lessonOpen(lessons, index, completed);
export const currentLessonIndex = (completed: string[]) => nextIndex(lessons, completed);
