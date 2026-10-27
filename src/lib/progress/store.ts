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

export type QuizScore = { correct: number; total: number };

export type ProgressData = {
  version: 2;
  completed: string[];
  /** незаконченный код урока */
  drafts: Record<string, Draft>;
  /** код ребёнка в момент прохождения урока — с него начинается следующий урок проекта */
  results: Record<string, Draft>;
  /** результат теста после урока: сколько ответов верны с первой попытки */
  quiz: Record<string, QuizScore>;
};

/** v2: сквозной проект. Данные v1 (отдельные страницы на урок) не переносятся. */
export const STORAGE_KEY = "codequest:progress:v2";
/** Ограничение на размер одного файла, чтобы не переполнить хранилище. */
export const MAX_FILE_CHARS = 50_000;

export const EMPTY_PROGRESS: ProgressData = Object.freeze({
  version: 2,
  completed: [],
  drafts: {},
  results: {},
  quiz: {},
}) as ProgressData;

function emptyProgress(): ProgressData {
  return { version: 2, completed: [], drafts: {}, results: {}, quiz: {} };
}

function isFiles(v: unknown): v is ProjectFiles {
  if (typeof v !== "object" || v === null) return false;
  const f = v as Record<string, unknown>;
  return (["html", "css", "js"] as const).every(
    (k) => typeof f[k] === "string" && (f[k] as string).length <= MAX_FILE_CHARS,
  );
}

function parseDrafts(v: unknown): Record<string, Draft> {
  const out: Record<string, Draft> = {};
  if (typeof v !== "object" || v === null) return out;
  for (const [slug, d] of Object.entries(v as Record<string, unknown>)) {
    const draft = d as Record<string, unknown> | null;
    if (draft && isFiles(draft.files) && typeof draft.savedAt === "number") {
      out[slug] = { files: draft.files, savedAt: draft.savedAt };
    }
  }
  return out;
}

/** Разбирает сохранённые данные, отбрасывая всё, что не похоже на прогресс. */
export function parseProgress(raw: string | null): ProgressData {
  if (!raw) return EMPTY_PROGRESS;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (data.version !== 2) return EMPTY_PROGRESS;
    const completed = Array.isArray(data.completed)
      ? data.completed.filter((s): s is string => typeof s === "string").slice(0, 500)
      : [];
    const quiz: Record<string, QuizScore> = {};
    if (typeof data.quiz === "object" && data.quiz !== null) {
      for (const [slug, q] of Object.entries(data.quiz as Record<string, unknown>)) {
        const score = q as Record<string, unknown> | null;
        if (score && Number.isInteger(score.correct) && Number.isInteger(score.total)) {
          quiz[slug] = { correct: score.correct as number, total: score.total as number };
        }
      }
    }
    return {
      version: 2,
      completed: [...new Set(completed)],
      drafts: parseDrafts(data.drafts),
      results: parseDrafts(data.results),
      quiz,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
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

  /** Урок пройден: запоминаем и сам факт, и код — с него продолжится проект. */
  markCompleted(slug: string, files: ProjectFiles) {
    const cur = read();
    const completed = cur.completed.includes(slug) ? cur.completed : [...cur.completed, slug];
    const results = isFiles(files) ? { ...cur.results, [slug]: { files, savedAt: Date.now() } } : cur.results;
    write({ ...cur, completed, results });
  },
  saveQuiz(slug: string, score: QuizScore) {
    const cur = read();
    write({ ...cur, quiz: { ...cur.quiz, [slug]: score } });
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
    write(emptyProgress());
  },
  /** Заменить всё (загрузка резервной копии); данные уже проверены parseProgress. */
  replaceAll(data: ProgressData) {
    write(data);
  },
};
