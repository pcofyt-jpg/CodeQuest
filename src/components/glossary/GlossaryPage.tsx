"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";
import { GlossaryList } from "./Glossary";

export function GlossaryPage() {
  const progress = useProgress();
  const hydrated = useHydrated();
  return (
    <div className="mx-auto max-w-2xl px-5 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-8">
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="CodeQuest — к маршруту" className="rounded-lg">
          <Logo size="lg" />
        </Link>
        <Link href="/" className="text-sm font-semibold text-route underline-offset-4 hover:underline">
          К маршруту
        </Link>
      </header>
      <h1 className="mt-10 text-[2rem] leading-tight font-extrabold tracking-tight">Шпаргалка</h1>
      <p className="mt-3 text-[17px] leading-relaxed">
        Всё, что ты уже изучил: что это, как пишется и как выглядит. Новые карточки появляются, когда открываются
        новые уроки.
      </p>
      <div className={`mt-8 ${hydrated ? "" : "opacity-0"}`}>
        <GlossaryList completed={progress.completed} />
      </div>
    </div>
  );
}
