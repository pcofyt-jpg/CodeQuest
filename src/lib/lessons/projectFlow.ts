import type { Addition, CodeFile, Insertion, Lesson, ProjectFiles, ProjectLesson } from "@/content/lessons/types";

/**
 * Сквозной проект: урок проекта продолжает код ребёнка из прошлого урока проекта.
 *
 * Стартовый код урока проекта = результат ребёнка в прошлом уроке проекта
 * (а если его нет — эталон прошлого урока) + заготовка этого урока в конце файлов.
 * Тренировки (track: "practice") всегда начинаются со своего стартового кода.
 */

const FILES: CodeFile[] = ["html", "css", "js"];

function appendText(cur: string, add: string): string {
  return cur === "" ? add.replace(/^\n+/, "") : (cur.endsWith("\n") ? cur : `${cur}\n`) + add;
}

/** Вставляет перед последним вхождением тега; если тега нет (ребёнок его удалил) — в конец. */
function insertBefore(cur: string, ins: Insertion): string {
  const at = cur.lastIndexOf(ins.before);
  return at === -1 ? appendText(cur, ins.text) : cur.slice(0, at) + ins.text + cur.slice(at);
}

/** Добавляет заготовку урока: в конец файла или перед нужным тегом. */
export function applyAdditions(base: ProjectFiles, additions: Partial<Record<CodeFile, Addition>> | undefined): ProjectFiles {
  const out = { ...base };
  if (!additions) return out;
  for (const f of FILES) {
    const add = additions[f];
    if (!add) continue;
    if (typeof add === "string") out[f] = appendText(out[f], add);
    else for (const ins of Array.isArray(add) ? add : [add]) out[f] = insertBefore(out[f], ins);
  }
  return out;
}

/** Ближайший предыдущий урок проекта в том же курсе (у каждого курса свой сайт). */
export function previousProjectLesson(lessons: Lesson[], index: number): ProjectLesson | null {
  const course = lessons[index]?.course;
  for (let i = index - 1; i >= 0; i--) {
    const l = lessons[i];
    if (!l || l.course !== course) break;
    if (l.track === "project") return l;
  }
  return null;
}

/**
 * Стартовый код урока.
 * results — сохранённые результаты ребёнка по урокам (код в момент прохождения).
 */
export function lessonStarter(
  lessons: Lesson[],
  index: number,
  results: Record<string, ProjectFiles | undefined>,
): ProjectFiles {
  const lesson = lessons[index]!;
  if (lesson.track === "practice") return lesson.starter;
  if (lesson.freshStart && lesson.starter) return lesson.starter;
  const prev = previousProjectLesson(lessons, index);
  if (!prev) return lesson.starter ?? { html: "", css: "", js: "" };
  const base = results[prev.slug] ?? prev.reference;
  return applyAdditions(base, lesson.additions);
}

/**
 * «Контрольная точка»: рабочая версия прошлого урока проекта + заготовка этого урока.
 * Нужна, если код ребёнка сломался и он не может найти ошибку.
 * null — если для урока контрольной точки нет (первый урок, тренировка).
 */
export function lessonCheckpoint(lessons: Lesson[], index: number): ProjectFiles | null {
  const lesson = lessons[index]!;
  if (lesson.track !== "project" || lesson.freshStart) return null;
  const prev = previousProjectLesson(lessons, index);
  if (!prev) return null;
  return applyAdditions(prev.reference, lesson.additions);
}
