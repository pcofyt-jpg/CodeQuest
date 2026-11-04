"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { QuestCertificate } from "./QuestCertificate";
import { courses } from "@/content/courses";
import { courseLessons } from "@/content/lessons/catalog";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";
import { controlStore, isPassed, type ControlResult } from "@/lib/control/store";

const EMPTY_CONTROL = {};

/**
 * Сертификат о прохождении курса — бесплатно (у многих платформ он только по подписке).
 * Имя вводится по желанию и хранится только в этом браузере.
 */
const NAME_KEY = "codequest:cert-name:v1";
const listeners = new Set<() => void>();
const readName = () => {
  try {
    return window.localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
};
const saveName = (v: string) => {
  try {
    window.localStorage.setItem(NAME_KEY, v.slice(0, 60));
  } catch {
    // имя просто не сохранится
  }
  listeners.forEach((l) => l());
};

export function CertificatePage() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const courseId = useSearchParams().get("kurs") ?? "";
  const name = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    readName,
    () => "",
  );
  const course = courses.find((c) => c.id === courseId && c.status === "ready" && c.skills);
  const control = useSyncExternalStore(controlStore.subscribe, controlStore.getAll, () => EMPTY_CONTROL);
  const items = course ? courseLessons(course.id) : [];
  const done = items.filter((l) => progress.completed.includes(l.slug));
  const finished = items.length > 0 && done.length === items.length;
  const finishedAt = Math.max(0, ...items.map((l) => progress.results[l.slug]?.savedAt ?? 0));

  if (!hydrated) return <div className="p-6 text-muted">Открываю сертификат…</div>;

  // Уроки, засчитанные входной проверкой, не дают сертификата: его дают за пройденное самому.
  const solvedAll = items.every((l) => progress.results[l.slug]);
  const controlResult = course ? (control as Record<string, ControlResult>)[course.id] : undefined;
  if (course && finished && (!solvedAll || !isPassed(controlResult))) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Почти готово</h1>
        <p className="text-[17px]">
          {!solvedAll
            ? "Часть уроков этого курса засчитана по входной проверке. Сертификат выдаётся за уроки, пройденные самостоятельно."
            : `Осталась контрольная миссия по курсу «${course.title}» — 8 вопросов по всему курсу.`}
        </p>
        {solvedAll && (
          <Link href={`/kontrolnaya/?kurs=${course.id}`} className="rounded-xl bg-route px-6 py-3 font-semibold text-on-accent">
            Пройти контрольную миссию
          </Link>
        )}
        <Link href="/" className="font-semibold text-route underline underline-offset-4">
          К карте миссий
        </Link>
      </main>
    );
  }

  if (!course || !finished) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Сертификат пока не готов</h1>
        <p className="text-[17px]">
          {course
            ? `Он появится, когда ты пройдёшь все уроки курса «${course.title}». Пройдено ${done.length} из ${items.length}.`
            : "Такого курса нет."}
        </p>
        <Link href="/" className="rounded-xl bg-route px-6 py-3 font-semibold text-on-accent">
          К маршруту
        </Link>
      </main>
    );
  }

  return (
    <main className="cert-page mx-auto max-w-5xl px-3 py-8 sm:px-5">
      <div className="mb-6 print:hidden">
        <Link href="/" className="text-sm font-semibold text-route underline-offset-4 hover:underline">
          ← К маршруту
        </Link>
        <label htmlFor="cert-name" className="mt-4 block font-semibold">
          Имя на сертификате (по желанию)
        </label>
        <input
          id="cert-name"
          value={name}
          onChange={(e) => saveName(e.target.value)}
          maxLength={60}
          placeholder="Например, Миша"
          className="mt-1 w-full max-w-sm rounded-lg border border-line bg-surface px-3 py-2"
        />
        <p className="mt-1 text-sm text-muted">Имя хранится только в этом браузере и никуда не отправляется.</p>
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-4 rounded-xl bg-route px-6 py-3 font-semibold text-on-accent"
        >
          Распечатать или сохранить в PDF
        </button>
      </div>

      <QuestCertificate
        name={name.trim() || "Юный разработчик"}
        courseTitle={course.title}
        lessons={items.length}
        skills={course.skills ?? []}
        date={finishedAt ? new Date(finishedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : ""}
        control={controlResult}
      />
      {/* Печать: только сертификат, на весь альбомный лист A4, с тёмным фоном. */}
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print {
          html, body { background: #15123a !important; }
          .quest-cert { width: 297mm !important; border-radius: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .cert-page { max-width: none !important; padding: 0 !important; }
        }
      `}</style>
    </main>
  );
}
