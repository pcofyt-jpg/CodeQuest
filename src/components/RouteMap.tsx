"use client";

import Link from "next/link";
import { useState } from "react";
import { lessons } from "@/content/lessons/catalog";
import { isUnlocked, nextLessonIndex, progressStore } from "@/lib/progress/store";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";
import { Logo } from "./Logo";
import { BackupControls } from "./BackupControls";
import { courses } from "@/content/courses";

const slugs = lessons.map((l) => l.slug);

export function RouteMap() {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [confirmReset, setConfirmReset] = useState(false);
  const { completed } = progress;
  const currentIndex = nextLessonIndex(slugs, completed);
  const doneCount = completed.filter((s) => slugs.includes(s)).length;
  const allDone = doneCount === lessons.length;

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-8">
      <header className="flex items-center justify-between">
        <Logo size="lg" />
        {hydrated && (
          <p className="text-sm font-semibold text-muted">
            Пройдено {doneCount} из {lessons.length}
          </p>
        )}
      </header>

      <section className="mt-10 sm:mt-14">
        <h1 className="text-[2rem] leading-[1.1] font-extrabold tracking-tight text-ink sm:text-[2.75rem]">
          От первого тега
          <br />
          до своего проекта
        </h1>
        <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink">
          Ты построишь свой собственный сайт — на любую тему. В каждом уроке добавляешь к нему что-то
          новое и сразу видишь результат. Следующий урок открывается, когда пройден предыдущий.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/proekty/"
            className="inline-flex rounded-xl border border-line bg-surface px-4 py-2 text-[15px] font-semibold text-ink hover:border-route"
          >
            Мои проекты
          </Link>
          <Link
            href="/shpargalka/"
            className="inline-flex rounded-xl border border-line bg-surface px-4 py-2 text-[15px] font-semibold text-ink hover:border-route"
          >
            Шпаргалка
          </Link>
        </div>
      </section>

      <h2 className="mt-12 text-sm font-bold tracking-wide text-muted uppercase">
        Курс {courses[0]!.number} · {courses[0]!.title}
      </h2>
      <nav aria-label="Маршрут уроков" className="mt-4">
        <ol className={hydrated ? "" : "opacity-0"}>
          {lessons.map((lesson, i) => {
            const done = completed.includes(lesson.slug);
            const open = isUnlocked(i, slugs, completed);
            const current = i === currentIndex && !allDone;
            const last = i === lessons.length - 1;
            const lineDone = done && !last;

            return (
              <li key={lesson.slug} className="relative flex gap-4 pb-6 last:pb-0">
                {!last && (
                  <span
                    aria-hidden="true"
                    className={`absolute top-11 bottom-1 left-[21px] w-[3px] rounded-full ${
                      lineDone ? "bg-ink" : "bg-[repeating-linear-gradient(to_bottom,var(--color-line)_0_6px,transparent_6px_12px)]"
                    }`}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                    current
                      ? "bg-route text-white ring-[6px] ring-route-soft"
                      : done
                        ? "bg-ink text-sun"
                        : open
                          ? "border-[3px] border-route bg-surface text-route"
                          : "border-[3px] border-dashed border-line bg-paper text-muted"
                  }`}
                >
                  {done ? "✓" : lesson.number}
                </span>

                <div className={`min-w-0 flex-1 ${current ? "rounded-2xl border border-line bg-surface p-4 sm:p-5" : "pt-2"}`}>
                  {open ? (
                    <Link
                      href={`/learn/${lesson.slug}`}
                      className={`font-bold underline-offset-4 hover:underline text-ink ${current ? "text-xl" : "text-[17px]"}`}
                    >
                      <span className="sr-only">Урок {lesson.number}: </span>
                      {lesson.title}
                      {lesson.track === "practice" && (
                        <span className="ml-2 align-middle text-xs font-semibold text-muted">тренировка</span>
                      )}
                      {done && <span className="sr-only"> (пройден)</span>}
                    </Link>
                  ) : (
                    <p className="text-[17px] font-semibold text-muted">
                      <span className="sr-only">Урок {lesson.number}, пока закрыт: </span>
                      {lesson.title}
                    </p>
                  )}
                  {current && (
                    <>
                      <p className="mt-1 text-[15px] leading-relaxed text-ink">{lesson.goal}</p>
                      <Link
                        href={`/learn/${lesson.slug}`}
                        className="mt-4 inline-flex rounded-xl bg-route px-6 py-3 font-semibold text-white"
                      >
                        {doneCount === 0 ? "Начать первый урок" : "Продолжить"}
                      </Link>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {allDone && (
        <p className="mt-8 rounded-2xl border-2 border-sun bg-sun-soft p-5 text-[17px] font-semibold">
          Весь маршрут пройден. Можно вернуться к любому уроку и улучшить свои проекты.
        </p>
      )}

      <section aria-label="Следующие курсы" className="mt-10 space-y-3">
        {courses
          .filter((c) => c.status === "soon")
          .map((c) => (
            <article key={c.id} className="rounded-2xl border border-dashed border-line px-5 py-4">
              <p className="text-sm font-bold tracking-wide text-muted uppercase">
                Курс {c.number} · готовится
              </p>
              <h2 className="mt-1 text-lg font-bold text-ink">{c.title}</h2>
              <p className="mt-1 text-[15px] leading-relaxed text-ink">{c.description}</p>
            </article>
          ))}
      </section>

      <footer className="mt-auto pt-12 text-sm leading-relaxed text-muted">
        <p>Демо-версия: прогресс и код хранятся только в этом браузере и никуда не отправляются.</p>
        {hydrated && <BackupControls />}
        {hydrated && doneCount + Object.keys(progress.drafts).length > 0 && (
          <div className="mt-2">
            {confirmReset ? (
              <span className="flex flex-wrap items-center gap-2">
                <span>Удалить весь прогресс и код из этого браузера?</span>
                <button
                  type="button"
                  className="font-semibold text-coral"
                  onClick={() => {
                    progressStore.resetAll();
                    setConfirmReset(false);
                  }}
                >
                  Удалить
                </button>
                <button type="button" className="font-semibold text-ink" onClick={() => setConfirmReset(false)}>
                  Оставить
                </button>
              </span>
            ) : (
              <button type="button" className="font-semibold underline underline-offset-4" onClick={() => setConfirmReset(true)}>
                Начать маршрут заново
              </button>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
