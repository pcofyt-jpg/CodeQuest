import type { ProjectFiles } from "@/content/lessons/types";

/**
 * Прогресс и черновики ученика.
 *
 * Этап 1: данные живут только в этом браузере (localStorage), без аккаунтов
 * и без отправки на сервер. Это демо-режим: ребёнок может «открыть» уроки,
 * отредактировав localStorage, и это допустимо, пока прогресс ничего не даёт.
 *
 * Этап 5: тот же интерфейс реализует серверное хранилище, а завершение урока
 * подтверждает сервер (см. docs/ARCHITECTURE.md).
 */

export type Draft = { files: ProjectFiles; savedAt: number };

export type ProgressData = {
  version: 1;
  completed: string[];
  drafts: Record<string, Draft>;
};

export const STORAGE_KEY = "codequest:progress:v1";
/** Ограничение на размер одного файла, чтобы не переполнить хранилище. */
export const MAX_FILE_CHARS = 50_000;

export const EMPTY_PROGRESS: ProgressData = Object.freeze({
  version: 1,
  completed: [],
  drafts: {},
}) as ProgressData;

function isFiles(v: unknown): v is ProjectFiles {
  if (typeof v !== "object" || v === null) return false;
  const f = v as Record<string, unknown>;
  return (["html", "css", "js"] as const).every(
    (k) => typeof f[k] === "string" && (f[k] as string).length <= MAX_FILE_CHARS,
  );
}

/** Разбирает сохранённые данные, отбрасывая всё, что не похоже на прогресс. */
export function parseProgress(raw: string | null): ProgressData {
  if (!raw) return EMPTY_PROGRESS;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (data.version !== 1) return EMPTY_PROGRESS;
    const completed = Array.isArray(data.completed)
      ? data.completed.filter((s): s is string => typeof s === "string").slice(0, 500)
      : [];
    const drafts: Record<string, Draft> = {};
    if (typeof data.drafts === "object" && data.drafts !== null) {
      for (const [slug, d] of Object.entries(data.drafts as Record<string, unknown>)) {
        const draft = d as Record<string, unknown> | null;
        if (draft && isFiles(draft.files) && typeof draft.savedAt === "number") {
          drafts[slug] = { files: draft.files, savedAt: draft.savedAt };
        }
      }
    }
    return { version: 1, completed: [...new Set(completed)], drafts };
  } catch {
    return EMPTY_PROGRESS;
  }
}

/** Урок открыт, если это первый урок или предыдущий пройден. */
export function isUnlocked(index: number, slugs: string[], completed: string[]): boolean {
  if (index <= 0) return true;
  const prev = slugs[index - 1];
  return prev !== undefined && completed.includes(prev);
}

/** Первый непройденный открытый урок — «куда продолжить». */
export function nextLessonIndex(slugs: string[], completed: string[]): number {
  const i = slugs.findIndex((s) => !completed.includes(s));
  return i === -1 ? slugs.length - 1 : i;
}

// ---- Хранилище в браузере с подпиской для React (useSyncExternalStore) ----

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: ProgressData | null = null;

function read(): ProgressData {
  if (cache) return cache;
  try {
    cache = parseProgress(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    cache = EMPTY_PROGRESS; // хранилище недоступно (например, приватный режим)
  }
  return cache;
}

function write(next: ProgressData) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Не удалось сохранить: прогресс останется до перезагрузки страницы.
  }
  listeners.forEach((l) => l());
}

export const progressStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: read,
  getServerSnapshot: () => EMPTY_PROGRESS,

  markCompleted(slug: string) {
    const cur = read();
    if (cur.completed.includes(slug)) return;
    write({ ...cur, completed: [...cur.completed, slug] });
  },
  saveDraft(slug: string, files: ProjectFiles) {
    if (!isFiles(files)) return;
    const cur = read();
    write({ ...cur, drafts: { ...cur.drafts, [slug]: { files, savedAt: Date.now() } } });
  },
  clearDraft(slug: string) {
    const cur = read();
    if (!cur.drafts[slug]) return;
    const drafts = { ...cur.drafts };
    delete drafts[slug];
    write({ ...cur, drafts });
  },
  resetAll() {
    write({ version: 1, completed: [], drafts: {} });
  },
};
