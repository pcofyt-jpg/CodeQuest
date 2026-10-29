"use client";

import Link from "next/link";
import { useState } from "react";
import { courseLabel, courses, type Course } from "@/content/courses";
import { lessons } from "@/content/lessons/catalog";
import { currentLessonIndex, isLessonOpen } from "@/lib/lessons/access";
import { progressStore } from "@/lib/progress/store";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";
import { useProjects } from "@/lib/projects/useProjects";
import { BackupControls } from "./BackupControls";
import { Logo } from "./Logo";

type Stat = { done: number; total: number; open: boolean };

/** Главная «Ночная миссия»: текущий урок, Кью на связи, карта миссий, этапы, проекты. */
export function RouteMap() {
  const progress = useProgress();
  const projects = useProjects();
  const hydrated = useHydrated();
  const [confirmReset, setConfirmReset] = useState(false);
  const { completed } = progress;

  const currentIndex = currentLessonIndex(completed);
  const current = lessons[currentIndex]!;
  const currentCourse = courses.find((c) => c.id === current.course)!;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = courses.find((c) => c.id === (selectedId ?? current.course)) ?? currentCourse;

  const doneCount = completed.filter((s) => lessons.some((l) => l.slug === s)).length;
  const stat = (c: Course): Stat => {
    const items = lessons.map((l, i) => ({ l, i })).filter((x) => x.l.course === c.id);
    return {
      done: items.filter((x) => completed.includes(x.l.slug)).length,
      total: items.length,
      open: items.length > 0 && isLessonOpen(items[0]!.i, completed),
    };
  };
  const cur = stat(currentCourse);
  const allReadyDone = courses.filter((c) => c.status === "ready").every((c) => {
    const s = stat(c);
    return s.done === s.total;
  });
  const ring = cur.total ? cur.done / cur.total : 0;

  const statusOf = (c: Course): { text: string; color: string } => {
    if (c.status === "soon") return { text: "Скоро", color: "text-muted" };
    const s = stat(c);
    if (s.done === s.total) return { text: "Пройдено ✓", color: "text-mint" };
    if (s.done > 0) return { text: `Идёт · ${s.done} из ${s.total}`, color: "text-sun" };
    if (s.open) return { text: "Открыто", color: "text-sky" };
    const req = courses.find((x) => x.id === c.requires);
    return { text: req ? `После: ${courseLabel(req).toLowerCase()}` : "Закрыто", color: "text-muted" };
  };

  const stages = lessons.map((l, i) => ({ l, i })).filter((x) => x.l.course === selected.id);
  const selStat = stat(selected);
  const recent = [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-5 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Logo size="lg" />
        <nav aria-label="Главное меню" className="flex flex-wrap items-center gap-1.5">
          <span aria-current="page" className="rounded-xl border border-line-strong bg-surface px-4 py-2.5 font-semibold">
            Карта миссий
          </span>
          <Link href="/proekty/" className="rounded-xl px-4 py-2.5 font-medium hover:text-route">
            Мои проекты
          </Link>
          <Link href="/shpargalka/" className="rounded-xl px-4 py-2.5 font-medium hover:text-route">
            Шпаргалка
          </Link>
          {hydrated && (
            <span className="ml-1 hidden font-mono text-sm text-muted sm:inline">
              Пройдено {doneCount} из {lessons.length}
            </span>
          )}
        </nav>
      </header>

      <section className={`flex flex-wrap items-stretch gap-6 ${hydrated ? "" : "opacity-0"}`}>
        <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-4 pt-2">
          <p className="font-mono text-sm font-bold tracking-wide text-route uppercase">
            {courseLabel(currentCourse)} · урок {current.number} из {cur.total}
          </p>
          <h1 className="text-[2.25rem] leading-[1.08] font-extrabold sm:text-[3.25rem]">{current.title}</h1>
          <p className="max-w-xl text-[18px] leading-relaxed text-ink/80">{current.goal}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href={`/learn/${current.slug}`}
              className="rounded-2xl bg-route px-7 py-4 text-[17px] font-bold text-on-accent hover:brightness-110"
            >
              {doneCount === 0 ? "Начать первый урок" : "Продолжить миссию"}
            </Link>
            <Link href="/shpargalka/" className="rounded-2xl border border-line-strong px-6 py-4 text-[17px] font-semibold hover:border-route">
              Шпаргалка
            </Link>
          </div>
        </div>

        <aside aria-label="Кью на связи" className="flex min-w-0 flex-[1_1_320px] flex-col gap-4 rounded-3xl border border-line bg-surface p-6">
          <p className="font-mono text-xs tracking-widest text-muted">КЬЮ НА СВЯЗИ</p>
          <div className="flex items-center gap-4">
            <svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label={`Пройдено ${cur.done} из ${cur.total}`} className="shrink-0">
              <circle cx="48" cy="48" r="40" stroke="var(--color-line)" strokeWidth="10" fill="none" />
              {ring > 0 && (
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="var(--color-sun)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(ring * 251.3, 6)} 252`}
                transform="rotate(-90 48 48)"
              />
              )}
              <text x="48" y="54" textAnchor="middle" fontFamily="var(--font-display)" fontSize="19" fontWeight="800" fill="var(--color-ink)">
                {cur.done}/{cur.total}
              </text>
            </svg>
            <p className="text-[16px] leading-relaxed">
              {doneCount === 0
                ? "Привет! Я Кью. Начнём со «Старта» — там всё с самых азов."
                : cur.done === cur.total
                  ? "Эта миссия пройдена! Выбирай следующую на карте."
                  : <>Ещё <b className="text-sun">{cur.total - cur.done}</b> {plural(cur.total - cur.done)} — и миссия «{currentCourse.title}» пройдена.</>}
            </p>
          </div>
          {currentCourse.number > 0 && (
            <p className="rounded-full bg-raised px-3 py-1.5 text-sm">Сертификат — после последнего урока миссии</p>
          )}
        </aside>
      </section>

      {hydrated && allReadyDone && (
        <p className="rounded-2xl border border-sun bg-sun-soft p-5 text-[17px] font-semibold">
          Все открытые миссии пройдены! Возвращайся к любому уроку, улучшай свои сайты или делай новое в «Моих проектах».
        </p>
      )}

      <section aria-labelledby="map-title" className="flex flex-col gap-5">
        <h2 id="map-title" className="text-2xl font-bold">
          Карта миссий
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          {courses.map((c) => {
            const st = statusOf(c);
            const s = c.status === "ready" ? stat(c) : null;
            const active = c.id === selected.id;
            return (
              <li key={c.id} className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={c.status !== "ready"}
                  aria-pressed={active}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex flex-1 flex-col items-start gap-2.5 rounded-3xl border bg-surface p-5 text-left transition-colors disabled:cursor-default ${
                    active ? "border-sun" : "border-line hover:border-line-strong"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-16 w-16 rounded-full shadow-[inset_-10px_-8px_0_rgba(0,0,0,0.22)]"
                    style={{ background: c.planet, outline: active ? "2px dashed var(--color-sun)" : "none", outlineOffset: 5 }}
                  />
                  <span className="font-mono text-xs tracking-wide text-muted uppercase">{courseLabel(c)}</span>
                  <span className="text-[19px] leading-tight font-bold">{c.title}</span>
                  {hydrated && <span className={`text-sm ${st.color}`}>{st.text}</span>}
                </button>
                {hydrated && s && c.number > 0 && s.done === s.total && (
                  <Link
                    href={`/sertifikat/?kurs=${c.id}`}
                    className="rounded-xl border border-sun bg-sun-soft px-3 py-2 text-center text-sm font-semibold"
                  >
                    Получить сертификат курса
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="stages-title" className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="stages-title" className="text-xl font-bold">
            {courseLabel(selected)} · {selected.title}
          </h2>
          {hydrated && (
            <span className="font-mono text-sm text-sun">
              ПРОЙДЕНО {selStat.done} ИЗ {selStat.total}
            </span>
          )}
        </div>
        <p className="-mt-2 text-[15px] text-muted">{selected.description}</p>
        <ol className={`grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 ${hydrated ? "" : "opacity-0"}`}>
          {stages.map(({ l, i }) => {
            const done = completed.includes(l.slug);
            const open = isLessonOpen(i, completed);
            const isCurrent = i === currentIndex && !done;
            const tag = l.track === "practice" && l.course !== "start" && l.lang !== "python";
            const inner = (
              <>
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold ${
                    done ? "bg-route text-on-accent" : isCurrent ? "bg-sun text-on-accent" : open ? "bg-raised text-ink" : "bg-deep text-muted"
                  }`}
                >
                  {done ? "✓" : l.number}
                </span>
                <span className="min-w-0 text-[15px] leading-snug">
                  <span className="sr-only">Урок {l.number}: </span>
                  {l.title}
                  {tag && <span className="ml-1.5 align-middle font-mono text-[11px] text-muted">тренировка</span>}
                  {done && <span className="sr-only"> (пройден)</span>}
                  {!open && <span className="sr-only"> (пока закрыт)</span>}
                </span>
              </>
            );
            const box = `flex items-center gap-3 rounded-2xl border p-3 ${
              isCurrent ? "border-sun bg-sun-soft" : open ? "border-line bg-deep/40 hover:border-line-strong" : "border-line/60 bg-deep/30 text-muted"
            }`;
            return (
              <li key={l.slug}>
                {open ? (
                  <Link href={`/learn/${l.slug}`} className={box}>
                    {inner}
                  </Link>
                ) : (
                  <div className={box}>{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="projects-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="projects-title" className="text-2xl font-bold">
            Мои проекты
          </h2>
          <Link href="/proekty/" className="font-semibold text-route underline-offset-4 hover:underline">
            Все проекты и шаблоны
          </Link>
        </div>
        {hydrated && recent.length === 0 ? (
          <Link href="/proekty/" className="rounded-3xl border border-dashed border-line-strong p-6 text-[16px] hover:border-route">
            Здесь появятся твои проекты. Начни с шаблона: открытка, викторина или кликер →
          </Link>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/proekt/?id=${p.id}`} className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface hover:border-line-strong">
                  <span className="flex h-24 items-center overflow-hidden bg-deep px-4 font-mono text-[13px] whitespace-nowrap text-route">
                    {firstLine(p.files.html || p.files.py || "")}
                  </span>
                  <span className="flex flex-col gap-1 px-4 py-3">
                    <b className="text-[16px]">{p.name}</b>
                    <span className="text-sm text-muted">
                      {new Date(p.updatedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-auto pt-6 text-sm leading-relaxed text-muted">
        <p>Демо-версия: прогресс и код хранятся только в этом браузере и никуда не отправляются.</p>
        {hydrated && <BackupControls />}
        {hydrated && doneCount + Object.keys(progress.drafts).length > 0 && (
          <div className="mt-3">
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

function plural(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "урок";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "урока";
  return "уроков";
}

function firstLine(code: string): string {
  const line = code.split("\n").find((l) => l.trim() && !l.trim().startsWith("<!--") && !l.trim().startsWith("#"));
  return (line ?? "Пустой проект").trim().slice(0, 60);
}
