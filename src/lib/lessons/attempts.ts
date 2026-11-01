/**
 * Неудачные проверки урока — для «Разбора решения».
 * Хранятся только до перезагрузки страницы: после неё ребёнок снова пробует сам.
 */
const failed = new Map<string, number>();
const listeners = new Set<() => void>();

export const attemptsStore = {
  noteFailed(slug: string) {
    failed.set(slug, (failed.get(slug) ?? 0) + 1);
    listeners.forEach((l) => l());
  },
  get(slug: string): number {
    return failed.get(slug) ?? 0;
  },
  subscribe(l: () => void): () => void {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

/** Сколько раз нужно не пройти проверку, чтобы открылся разбор (и все подсказки уже показаны). */
export const REVIEW_AFTER_FAILS = 3;
