"use client";

import Link from "next/link";
import { useState } from "react";
import { QuizBlock } from "@/components/studio/QuizBlock";
import { courseLessons } from "@/content/lessons/catalog";
import { PLACEMENT_PASS, placementQuestions } from "@/content/placement";
import { progressStore, type QuizScore } from "@/lib/progress/store";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";

/** Входная проверка: кто уже делал сайты, может начать сразу с практикума и курса 2. */
export function PlacementPage() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const [score, setScore] = useState<QuizScore | null>(null);
  const passed = !!score && score.correct >= PLACEMENT_PASS;

  if (!hydrated) return <div className="p-6 text-muted">Открываю проверку…</div>;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 py-8">
      <Link href="/" className="text-sm font-semibold text-route underline-offset-4 hover:underline">
        ← К карте миссий
      </Link>
      <header>
        <p className="font-mono text-sm font-bold tracking-wide text-route uppercase">Входная проверка</p>
        <h1 className="mt-1 text-3xl font-extrabold">Уже делал сайты?</h1>
        <p className="mt-2 text-[17px] leading-relaxed text-ink/80">
          {placementQuestions.length} вопросов по HTML, CSS и JavaScript. Ответишь верно с первой попытки хотя бы на {PLACEMENT_PASS} —
          «Старт» и курс «Первый сайт» засчитаются, и можно сразу браться за практикум и курс 2. Сертификат за засчитанные курсы
          не выдаётся: его дают за уроки, пройденные самому.
        </p>
        {progress.completed.length > 0 && !score && (
          <p className="mt-2 rounded-xl border border-line-strong px-3 py-2 text-[15px]">
            У тебя уже есть пройденные уроки — проверка может не понадобиться, но пройти её можно.
          </p>
        )}
      </header>

      <QuizBlock
        questions={placementQuestions}
        previous={undefined}
        onFinish={(s) => {
          setScore(s);
          if (s.correct >= PLACEMENT_PASS) {
            progressStore.markSkipped([...courseLessons("start"), ...courseLessons("pervyj-sajt")].map((l) => l.slug));
          }
        }}
      />

      {score && (
        <section role="status" className={`rounded-2xl border p-5 ${passed ? "border-sun bg-sun-soft" : "border-line bg-surface"}`}>
          <p className="text-lg font-bold">
            {passed
              ? `${score.correct} из ${score.total}! «Старт» и «Первый сайт» засчитаны.`
              : `${score.correct} из ${score.total}. Начни со «Старта» — знакомое пройдёшь быстро, а новое не пропустишь.`}
          </p>
          <Link href="/" className="mt-3 inline-flex rounded-xl bg-route px-5 py-3 font-semibold text-on-accent">
            {passed ? "К практикуму и курсу 2" : "К первому уроку"}
          </Link>
        </section>
      )}
    </main>
  );
}
