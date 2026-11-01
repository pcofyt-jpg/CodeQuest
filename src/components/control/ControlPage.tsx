"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { QuizBlock } from "@/components/studio/QuizBlock";
import { courses } from "@/content/courses";
import { courseLessons, lessons } from "@/content/lessons/catalog";
import { CONTROL_PASS, CONTROL_SIZE, controlStore, isPassed, pickControl, type ControlResult } from "@/lib/control/store";
import { todayKey } from "@/lib/daily/pick";
import type { QuizScore } from "@/lib/progress/store";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";

const EMPTY = {};

/** Контрольная миссия курса: 8 вопросов из тестов уроков, нужно 6 верных с первой попытки. */
export function ControlPage() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const courseId = useSearchParams().get("kurs") ?? "";
  const results = useSyncExternalStore(controlStore.subscribe, controlStore.getAll, () => EMPTY);
  const [round, setRound] = useState(0);
  const [last, setLast] = useState<QuizScore | null>(null);
  const course = courses.find((c) => c.id === courseId && c.skills);
  const items = course ? courseLessons(course.id) : [];
  const allDone = items.length > 0 && items.every((l) => progress.completed.includes(l.slug));
  const need = Math.ceil(CONTROL_SIZE * CONTROL_PASS);

  if (!hydrated) return <div className="p-6 text-muted">Открываю контрольную миссию…</div>;
  if (!course || !allDone) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Контрольная пока закрыта</h1>
        <p className="text-[17px]">{course ? `Она откроется, когда ты пройдёшь все уроки курса «${course.title}».` : "Такого курса нет."}</p>
        <Link href="/" className="rounded-xl bg-route px-6 py-3 font-semibold text-on-accent">
          К карте миссий
        </Link>
      </main>
    );
  }

  const questions = pickControl(lessons, course.id, `${todayKey()}#${round}`);
  const best = (results as Record<string, ControlResult>)[course.id];

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 py-8">
      <Link href="/" className="text-sm font-semibold text-route underline-offset-4 hover:underline">
        ← К карте миссий
      </Link>
      <header>
        <p className="font-mono text-sm font-bold tracking-wide text-route uppercase">Контрольная миссия</p>
        <h1 className="mt-1 text-3xl font-extrabold">{course.title}</h1>
        <p className="mt-2 text-[17px] leading-relaxed text-ink/80">
          {questions.length} вопросов по всему курсу. Чтобы открыть сертификат, ответь верно с первой попытки хотя бы на {need}.
          Ошибся — увидишь объяснение и сможешь выбрать другой ответ.
        </p>
        {isPassed(best) && (
          <p className="mt-2 rounded-xl border border-mint px-3 py-2 text-[15px]">
            Ты уже прошёл контрольную: {best!.correct} из {best!.total}. Можно пройти ещё раз для тренировки.
          </p>
        )}
      </header>

      <QuizBlock
        key={round}
        questions={questions}
        previous={undefined}
        onFinish={(score) => {
          setLast(score);
          controlStore.save(course.id, { ...score, date: todayKey() });
        }}
      />

      {last &&
        (isPassed({ ...last, date: "" }) ? (
          <section role="status" className="rounded-2xl border border-sun bg-sun-soft p-5">
            <p className="text-lg font-bold">Контрольная пройдена: {last.correct} из {last.total}!</p>
            <Link href={`/sertifikat/?kurs=${course.id}`} className="mt-3 inline-flex rounded-xl bg-route px-5 py-3 font-semibold text-on-accent">
              Получить сертификат курса
            </Link>
          </section>
        ) : (
          <section role="status" className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-lg font-bold">
              {last.correct} из {last.total} — пока не хватает до {need}.
            </p>
            <p className="mt-1 text-[15px] text-ink/80">Перечитай объяснения выше или загляни в шпаргалку. Новые вопросы будут другими.</p>
            <button
              type="button"
              onClick={() => {
                setRound((r) => r + 1);
                setLast(null);
              }}
              className="mt-3 rounded-xl bg-route px-5 py-3 font-semibold text-on-accent"
            >
              Попробовать ещё раз
            </button>
          </section>
        ))}
    </main>
  );
}
