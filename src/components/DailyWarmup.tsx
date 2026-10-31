"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { PracticeBlock } from "@/components/studio/PracticeBlock";
import { lessons } from "@/content/lessons/catalog";
import { pickDaily, todayKey } from "@/lib/daily/pick";

const KEY = "codequest:daily:v1";
const listeners = new Set<() => void>();
const readDone = (): string => {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};
const saveDone = (date: string) => {
  try {
    window.localStorage.setItem(KEY, date);
  } catch {
    // не сохранилось — разминку можно пройти ещё раз
  }
  listeners.forEach((l) => l());
};

/** «Разминка дня» на главной: повторение пройденного, чтобы ничего не забывалось. */
export function DailyWarmup({ completed }: { completed: string[] }) {
  const date = todayKey();
  const [round, setRound] = useState(0);
  const doneDate = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    readDone,
    () => "",
  );
  const items = useMemo(() => pickDaily(lessons, completed, `${date}#${round}`), [completed, date, round]);
  if (items.length < 2) return null;
  const doneToday = doneDate === date && round === 0;

  return (
    <section aria-labelledby="daily-title" className="flex flex-col gap-3">
      {doneToday ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-surface px-5 py-4">
          <p id="daily-title" className="text-[16px]">
            <b className="text-mint">Разминка на сегодня сделана ✓</b> Завтра будут новые задания.
          </p>
          <button
            type="button"
            onClick={() => setRound((r) => r + 1)}
            className="rounded-xl border border-line-strong px-4 py-2 font-semibold hover:border-route"
          >
            Ещё одна разминка
          </button>
        </div>
      ) : (
        <div>
          <PracticeBlock
            key={`${date}#${round}`}
            title="Разминка дня"
            exercises={items.map((x) => x.exercise)}
            captions={items.map((x) => x.caption)}
            doneText="Разминка на сегодня пройдена! Так пройденное не забывается."
            onAllDone={() => saveDone(date)}
          />
        </div>
      )}
    </section>
  );
}
