"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/content/lessons/types";
import type { QuizScore } from "@/lib/progress/store";

type Props = {
  questions: QuizQuestion[];
  previous: QuizScore | undefined;
  onFinish: (score: QuizScore) => void;
};

/**
 * Короткий тест после урока. Не блокирует переход дальше.
 * После ошибки ребёнок сразу видит объяснение и может выбрать другой ответ.
 * Счёт — сколько вопросов отвечено верно с первой попытки.
 */
export function QuizBlock({ questions, previous, onFinish }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [firstTry, setFirstTry] = useState<(boolean | null)[]>(() => questions.map(() => null));
  const [reported, setReported] = useState(false);

  const choose = (qi: number, oi: number) => {
    const nextAnswers = answers.map((a, i) => (i === qi ? oi : a));
    const nextFirst = firstTry.map((f, i) => (i === qi && f === null ? oi === questions[qi]!.correct : f));
    setAnswers(nextAnswers);
    setFirstTry(nextFirst);
    const allRight = nextAnswers.every((a, i) => a === questions[i]!.correct);
    if (allRight && !reported) {
      setReported(true);
      onFinish({ correct: nextFirst.filter(Boolean).length, total: questions.length });
    }
  };

  const allRight = answers.every((a, i) => a === questions[i]!.correct);
  const score = firstTry.filter(Boolean).length;

  return (
    <section aria-labelledby="quiz-title" className="rounded-2xl border border-line bg-paper px-5 py-4">
      <h2 id="quiz-title" className="text-lg font-bold text-ink">
        Проверь себя
      </h2>
      <p className="mt-1 text-sm text-muted">
        {questions.length} вопроса по уроку. Ошибиться не страшно — сразу
        увидишь объяснение.
        {previous && ` В прошлый раз с первой попытки: ${previous.correct} из ${previous.total}.`}
      </p>
      <ol className="mt-4 space-y-5">
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          const answered = chosen !== null && chosen !== undefined;
          const right = answered && chosen === q.correct;
          return (
            <li key={qi}>
              <fieldset>
                <legend className="text-[15px] leading-snug font-semibold text-ink">
                  {qi + 1}. {q.question}
                </legend>
                {q.code && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-surface px-3 py-2 font-mono text-[13px] leading-relaxed">
                    {q.code}
                  </pre>
                )}
                <div className="mt-2 flex flex-col gap-2">
                  {q.options.map((opt, oi) => {
                    const isChosen = chosen === oi;
                    const style = !isChosen
                      ? "border-line bg-surface hover:border-route"
                      : right
                        ? "border-mint bg-surface text-mint"
                        : "border-coral bg-coral-soft text-coral";
                    return (
                      <button
                        key={oi}
                        type="button"
                        aria-pressed={isChosen}
                        disabled={right}
                        onClick={() => choose(qi, oi)}
                        className={`rounded-xl border-2 px-4 py-2.5 text-left text-[15px] font-medium disabled:cursor-default ${style}`}
                      >
                        {isChosen && (right ? "✓ " : "✗ ")}
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <p role="status" className={`mt-2 text-sm leading-relaxed ${right ? "text-ink" : "text-coral"}`}>
                    {right ? "Верно! " : "Не совсем. "}
                    {q.explain}
                    {!right && " Попробуй выбрать другой вариант."}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      {allRight && (
        <p className="mt-4 font-semibold text-ink">
          Тест пройден! С первой попытки: {score} из {questions.length}.
        </p>
      )}
    </section>
  );
}
