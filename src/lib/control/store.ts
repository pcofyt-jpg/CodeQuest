import type { Lesson, QuizQuestion } from "@/content/lessons/types";

/**
 * Контрольная миссия в конце курса: 8 вопросов из тестов уроков курса, вперемешку.
 * Пройдена, если верно с первой попытки хотя бы 6 из 8. Открывает сертификат.
 * Результат хранится в этом браузере.
 */
const KEY = "codequest:control:v1";
export const CONTROL_SIZE = 8;
export const CONTROL_PASS = 0.75;

export type ControlResult = { correct: number; total: number; date: string };
type ControlData = Record<string, ControlResult>;

const listeners = new Set<() => void>();
let cache: { raw: string | null; data: ControlData } = { raw: null, data: {} };

function read(): ControlData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.data;
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    const data: ControlData = {};
    if (parsed && typeof parsed === "object") {
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        const r = v as Partial<ControlResult>;
        if (typeof r?.correct === "number" && typeof r?.total === "number" && r.total > 0) {
          data[k] = { correct: r.correct, total: r.total, date: String(r.date ?? "") };
        }
      }
    }
    cache = { raw, data };
    return data;
  } catch {
    return {};
  }
}

export const controlStore = {
  subscribe(l: () => void): () => void {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  getAll: read,
  save(courseId: string, result: ControlResult) {
    const best = read()[courseId];
    // Сохраняем лучший результат: повторная неудачная попытка не отнимает пройденную контрольную.
    if (best && best.correct / best.total >= result.correct / result.total) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ ...read(), [courseId]: result }));
    } catch {
      // не сохранилось — контрольную можно пройти ещё раз
    }
    listeners.forEach((l) => l());
  },
};

export const isPassed = (r: ControlResult | undefined) => !!r && r.correct / r.total >= CONTROL_PASS;

function hash(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619);
  return h >>> 0;
}

/** Вопросы контрольной: случайные 8 из тестов уроков курса (одинаковые для одного зерна). */
export function pickControl(lessons: Lesson[], courseId: string, seed: string): QuizQuestion[] {
  const pool = lessons.filter((l) => l.course === courseId).flatMap((l) => l.quiz);
  let s = hash(`${courseId}#${seed}`) || 1;
  const random = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled.slice(0, CONTROL_SIZE);
}
