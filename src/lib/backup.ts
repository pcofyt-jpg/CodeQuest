import { parseProgress, type ProgressData } from "@/lib/progress/store";
import { parseProjects, type Project } from "@/lib/projects/store";

/**
 * Резервная копия: прогресс и проекты в одном файле.
 * Нужна, чтобы перенести обучение на другое устройство или не потерять его
 * при очистке браузера. Файл никуда не отправляется — его скачивает и загружает сам пользователь.
 */
export const BACKUP_KIND = "codequest-backup";
export const MAX_BACKUP_BYTES = 3_000_000;

export function makeBackup(progress: ProgressData, projects: Project[]): string {
  return JSON.stringify({ kind: BACKUP_KIND, version: 1, exportedAt: new Date().toISOString(), progress, projects });
}

export type ParsedBackup =
  | { ok: true; progress: ProgressData; projects: Project[] }
  | { ok: false; reason: string };

/** Проверяет файл: это наша копия, формат знакомый, данные целы. */
export function parseBackup(text: string): ParsedBackup {
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, reason: "Файл слишком большой — это не копия CodeQuest." };
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { ok: false, reason: "Не получается прочитать файл. Выбери файл, который сохранила студия CodeQuest." };
  }
  if (data?.kind !== BACKUP_KIND) return { ok: false, reason: "Это не файл прогресса CodeQuest." };
  if (data.version !== 1) return { ok: false, reason: "Файл сохранён другой версией студии и не подходит." };
  const progress = parseProgress(JSON.stringify(data.progress ?? null));
  const projects = parseProjects(data.projects);
  return { ok: true, progress, projects };
}
