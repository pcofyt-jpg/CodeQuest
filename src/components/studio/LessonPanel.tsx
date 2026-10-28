"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lesson } from "@/content/lessons/types";
import { getTerm } from "@/content/glossary";
import { TermCard } from "@/components/glossary/Glossary";
import type { QuizScore } from "@/lib/progress/store";
import type { CheckOutcome } from "./useCheckRunner";
import type { CheckResult } from "@/content/lessons/types";
import type { MentorRequest } from "@/lib/mentor/client";
import { MentorBox } from "@/components/mentor/MentorBox";
import { QuizBlock } from "./QuizBlock";
import { PracticeBlock } from "./PracticeBlock";
import { RichText } from "./RichText";

type Props = {
  lesson: Lesson;
  total: number;
  completed: boolean;
  nextLesson: Lesson | null;
  hintsShown: number;
  onShowHint: () => void;
  outcome: CheckOutcome;
  onCheck: () => void;
  onReset: () => void;
  /** взять рабочую версию прошлого урока; null — если контрольной точки нет */
  onCheckpoint: (() => void) | null;
  quizScore: QuizScore | undefined;
  onQuizFinish: (score: QuizScore) => void;
  mentorCheckRequest?: (failed: CheckResult[]) => MentorRequest;
};

export function LessonPanel({
  lesson,
  total,
  completed,
  nextLesson,
  hintsShown,
  onShowHint,
  outcome,
  onCheck,
  onReset,
  onCheckpoint,
  quizScore,
  onQuizFinish,
  mentorCheckRequest,
}: Props) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmCheckpoint, setConfirmCheckpoint] = useState(false);
  const newTerms = lesson.newTerms.map(getTerm).filter((t) => t !== undefined);
  const hintsLeft = lesson.hints.length - hintsShown;
  const justPassed = outcome.status === "done" && outcome.passed;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <header>
          <p className="text-sm font-medium text-muted">
            Урок {lesson.number} из {total}
            {completed && <span className="text-mint"> · пройден</span>}
          </p>
          <h1 className="mt-1 text-2xl leading-tight font-bold text-ink">{lesson.title}</h1>
          <p className="mt-2 text-[17px] leading-snug text-ink">{lesson.goal}</p>
          {lesson.track === "practice" && lesson.course !== "start" && lesson.lang !== "python" && (
            <p className="mt-3 inline-flex rounded-full bg-paper px-3 py-1 text-sm font-semibold text-muted">
              Тренировка на чужом коде — твой сайт она не меняет
            </p>
          )}
          <ol aria-label="Этапы урока" className="mt-4 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted">
            {["Понять", "Попробуй", "Сделай", "Проверь себя"]
              .filter((step) => step !== "Попробуй" || (lesson.practice?.length ?? 0) > 0)
              .map((step, i, arr) => (
                <li key={step} className="flex items-center gap-1.5">
                  <span className="rounded-full bg-paper px-2.5 py-1">
                    {i + 1}. {step}
                  </span>
                  {i < arr.length - 1 && <span aria-hidden="true">→</span>}
                </li>
              ))}
          </ol>
        </header>

        {lesson.story && (
          <figure className="flex gap-3 rounded-2xl bg-route-soft px-4 py-3">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-route text-xl">
              🤖
            </span>
            <blockquote className="text-[15px] leading-relaxed text-ink">
              <span className="font-semibold">Кью: </span>
              {lesson.story}
            </blockquote>
          </figure>
        )}

        {lesson.plannedWithMentor && (
          <p className="rounded-xl border border-route/30 bg-route-soft px-4 py-3 text-sm leading-relaxed text-ink">
            Этот урок задуман вместе с ИИ-наставником. Наставник появится в одной из следующих версий
            студии, а пока его советы — в подсказках ниже.
          </p>
        )}

        <div className="space-y-3 text-[15px] leading-relaxed text-ink">
          {lesson.explanation.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
        </div>

        {newTerms.length > 0 && (
          <section aria-labelledby="terms-title">
            <h2 id="terms-title" className="text-lg font-bold text-ink">
              Новое в этом уроке
            </h2>
            <p className="mt-1 text-sm text-muted">
              Все эти карточки потом будут в шпаргалке. Слова с пунктирным подчёркиванием можно нажать.
            </p>
            <div className="mt-3 space-y-3">
              {newTerms.map((t) => (
                <TermCard key={t.id} term={t} compact />
              ))}
            </div>
          </section>
        )}

        {lesson.practice && lesson.practice.length > 0 && (
          <PracticeBlock key={lesson.slug} exercises={lesson.practice} />
        )}

        <section aria-labelledby="task-title">
          <h2 id="task-title" className="text-lg font-bold text-ink">
            Сделай
          </h2>
          <ol className="mt-2 space-y-2">
            {lesson.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-route-soft text-xs font-bold text-route"
                >
                  {i + 1}
                </span>
                <span>
                  <RichText text={s} />
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="hints-title">
          <h2 id="hints-title" className="sr-only">
            Подсказки
          </h2>
          {hintsShown > 0 && (
            <ol className="mb-3 space-y-2">
              {lesson.hints.slice(0, hintsShown).map((h, i) => (
                <li key={i} className="rounded-xl bg-paper px-4 py-3 text-[15px] leading-relaxed">
                  <span className="font-semibold">Подсказка {i + 1}. </span>
                  <RichText text={h} />
                </li>
              ))}
            </ol>
          )}
          {hintsLeft > 0 ? (
            <button
              type="button"
              onClick={onShowHint}
              className="rounded-lg text-sm font-semibold text-route underline-offset-4 hover:underline"
            >
              {hintsShown === 0 ? "Нужна подсказка" : "Ещё подсказка"} (осталось {hintsLeft})
            </button>
          ) : (
            <p className="text-sm text-muted">Подсказки закончились — дальше ты справишься сам.</p>
          )}
        </section>

        {outcome.status === "failed" && (
          <p role="status" className="rounded-xl bg-coral-soft px-4 py-3 text-[15px] text-coral">
            {outcome.reason}
          </p>
        )}

        {outcome.status === "done" && (
          <section aria-labelledby="results-title" role="status">
            <h2 id="results-title" className="text-lg font-bold text-ink">
              {outcome.passed ? "Все проверки пройдены" : "Почти получилось"}
            </h2>
            <ul className="mt-2 space-y-1.5">
              {outcome.results.map((r, i) => (
                <li key={i} className="flex gap-2 text-[15px] leading-snug">
                  <span aria-hidden="true" className={r.ok ? "text-mint" : "text-coral"}>
                    {r.ok ? "✓" : "✗"}
                  </span>
                  <span>
                    <span className={r.ok ? "text-ink" : "font-medium text-coral"}>
                      <span className="sr-only">{r.ok ? "Выполнено: " : "Не выполнено: "}</span>
                      {r.message}
                    </span>
                    {!r.ok && (
                      <span className="mt-1 block rounded-lg bg-paper px-3 py-2 text-ink">
                        <span className="font-semibold">Что сделать: </span>
                        <RichText text={r.fix} />
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {!outcome.passed && mentorCheckRequest && (
              <MentorBox
                key={outcome.results.map((r) => (r.ok ? 1 : 0)).join("")}
                label="Спросить наставника, что не так"
                buildRequest={() => mentorCheckRequest(outcome.results.filter((r) => !r.ok))}
              />
            )}
          </section>
        )}

        {(justPassed || completed) && (
          <section
            aria-labelledby="learned-title"
            className="rounded-2xl border-2 border-sun bg-sun-soft px-5 py-4"
          >
            <h2 id="learned-title" className="text-lg font-bold text-ink">
              Чему ты научился
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed">
              {lesson.learned.map((l, i) => (
                <li key={i}>
                  <RichText text={l} />
                </li>
              ))}
            </ul>
            {nextLesson ? (
              <>
              {lesson.track === "project" && nextLesson.track === "project" && (
                <p className="mt-3 text-[15px]">Следующий урок продолжит твой сайт с того места, где ты остановился.</p>
              )}
              <Link
                href={`/learn/${nextLesson.slug}`}
                className="mt-4 inline-flex rounded-xl bg-ink px-5 py-3 font-semibold text-white"
              >
                Следующий урок: {nextLesson.title}
              </Link>
              </>
            ) : (
              <p className="mt-3 font-semibold">Ты прошёл весь маршрут. Это настоящий результат!</p>
            )}
          </section>
        )}

        {(justPassed || completed) && (
          <QuizBlock key={lesson.slug} questions={lesson.quiz} previous={quizScore} onFinish={onQuizFinish} />
        )}

        {onCheckpoint && (
          <section className="rounded-xl border border-dashed border-line px-4 py-3 text-sm leading-relaxed">
            <p className="font-semibold text-ink">Код сломался и не получается найти ошибку?</p>
            {confirmCheckpoint ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span>Твой код этого урока заменится на рабочую версию прошлого урока с заданием этого.</span>
                <button
                  type="button"
                  onClick={() => {
                    onCheckpoint();
                    setConfirmCheckpoint(false);
                  }}
                  className="rounded-lg px-2 py-1 font-semibold text-coral"
                >
                  Заменить
                </button>
                <button type="button" onClick={() => setConfirmCheckpoint(false)} className="rounded-lg px-2 py-1 font-semibold">
                  Оставить мой код
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmCheckpoint(true)}
                className="mt-1 font-semibold text-route underline-offset-4 hover:underline"
              >
                Взять рабочую версию прошлого урока
              </button>
            )}
          </section>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
        <button
          type="button"
          onClick={onCheck}
          disabled={outcome.status === "running"}
          className="rounded-xl bg-route px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {outcome.status === "running" ? "Проверяю…" : "Проверить"}
        </button>
        {confirmReset ? (
          <span className="flex flex-wrap items-center gap-2 text-sm">
            <span>Твои изменения в этом уроке пропадут.</span>
            <button
              type="button"
              onClick={() => {
                onReset();
                setConfirmReset(false);
              }}
              className="rounded-lg px-2 py-1 font-semibold text-coral"
            >
              Начать заново
            </button>
            <button type="button" onClick={() => setConfirmReset(false)} className="rounded-lg px-2 py-1 font-semibold">
              Оставить
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:text-ink"
          >
            Начать урок заново
          </button>
        )}
      </footer>
    </div>
  );
}
