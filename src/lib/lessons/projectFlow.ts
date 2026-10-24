import type { CodeFile, Lesson, ProjectFiles, ProjectLesson } from "@/content/lessons/types";

/**
 * Сквозной проект: урок проекта продолжает код ребёнка из прошлого урока проекта.
 *
 * Стартовый код урока проекта = результат ребёнка в прошлом уроке проекта
 * (а если его нет — эталон прошлого урока) + заготовка этого урока в конце файлов.
 * Тренировки (track: "practice") всегда начинаются со своего стартового кода.
 */

const FILES: CodeFile[] = ["html", "css", "js"];

/** Дописывает заготовку урока в конец каждого файла. */
export function applyAdditions(base: ProjectFiles, additions: Partial<ProjectFiles> | undefined): ProjectFiles {
  const out = { ...base };
  if (!additions) return out;
  for (const f of FILES) {
    const add = additions[f];
    if (!add) continue;
    const cur = out[f];
    out[f] = cur === "" ? add.replace(/^\n+/, "") : (cur.endsWith("\n") ? cur : `${cur}\n`) + add;
  }
  return out;
}

/** Ближайший предыдущий урок проекта. */
export function previousProjectLesson(lessons: Lesson[], index: number): ProjectLesson | null {
  for (let i = index - 1; i >= 0; i--) {
    const l = lessons[i];
    if (l && l.track === "project") return l;
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
  if (lesson.track !== "project") return null;
  const prev = previousProjectLesson(lessons, index);
  if (!prev) return null;
  return applyAdditions(prev.reference, lesson.additions);
}
