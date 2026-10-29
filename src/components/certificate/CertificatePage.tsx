"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Logo } from "@/components/Logo";
import { courses } from "@/content/courses";
import { courseLessons } from "@/content/lessons/catalog";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";

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
  const course = courses.find((c) => c.id === courseId && c.status === "ready" && c.number > 0);
  const items = course ? courseLessons(course.id) : [];
  const done = items.filter((l) => progress.completed.includes(l.slug));
  const finished = items.length > 0 && done.length === items.length;
  const finishedAt = Math.max(0, ...items.map((l) => progress.results[l.slug]?.savedAt ?? 0));

  if (!hydrated) return <div className="p-6 text-muted">Открываю сертификат…</div>;

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
    <main className="mx-auto max-w-3xl px-5 py-8">
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

      <article
        aria-label="Сертификат"
        className="rounded-3xl border-[6px] border-double border-[#2f5bea] bg-white px-8 py-10 text-center text-[#111827] shadow-sm print:shadow-none"
      >
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <p className="mt-6 text-sm font-bold tracking-[0.3em] text-[#4b5563] uppercase">Сертификат</p>
        <h1 className="mt-3 text-3xl font-extrabold text-[#111827]">{name.trim() || "Юный разработчик"}</h1>
        <p className="mt-3 text-[17px]">прошёл(ла) курс</p>
        <p className="mt-1 text-2xl font-bold text-[#2f5bea]">
          «{course.title}» · {items.length} уроков
        </p>
        {course.skills && (
          <div className="mx-auto mt-6 max-w-xl text-left">
            <p className="text-center text-sm font-semibold text-[#4b5563]">Теперь умеет:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-[15px] leading-relaxed text-[#111827]">
              {course.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-6 text-sm text-[#4b5563]">
          {finishedAt ? new Date(finishedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : ""}
        </p>
        <p className="mt-6 text-xs text-[#4b5563]">
          Документ о прохождении курса в учебной студии CodeQuest, а не государственный документ об образовании.
        </p>
      </article>
    </main>
  );
}
