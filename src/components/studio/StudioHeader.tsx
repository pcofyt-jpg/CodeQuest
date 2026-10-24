"use client";

import Link from "next/link";
import { lessons } from "@/content/lessons/catalog";
import { isUnlocked } from "@/lib/progress/store";
import { Logo } from "@/components/Logo";

const slugs = lessons.map((l) => l.slug);

type Props = { currentIndex: number; completed: string[]; onOpenGlossary?: () => void };

export function StudioHeader({ currentIndex, completed, onOpenGlossary }: Props) {
  const prev = lessons[currentIndex - 1];
  const next = lessons[currentIndex + 1];
  const nextOpen = next ? isUnlocked(currentIndex + 1, slugs, completed) : false;

  return (
    <header className="flex items-center gap-3 border-b border-line bg-surface px-3 py-2 sm:px-4">
      <Link href="/" className="shrink-0 rounded-lg" aria-label="CodeQuest — к маршруту">
        <Logo />
      </Link>

      <nav aria-label="Маршрут уроков" className="hidden min-w-0 flex-1 justify-center md:flex">
        <ol className="flex items-center">
          {lessons.map((l, i) => {
            const done = completed.includes(l.slug);
            const open = isUnlocked(i, slugs, completed);
            const current = i === currentIndex;
            const node = (
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  current
                    ? "bg-route text-white ring-4 ring-route-soft"
                    : done
                      ? "bg-ink text-sun"
                      : open
                        ? "border-2 border-route bg-surface text-route"
                        : "border-2 border-dashed border-line bg-surface text-muted"
                }`}
              >
                {done && !current ? "✓" : l.number}
              </span>
            );
            return (
              <li key={l.slug} className="flex items-center">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className={`h-0.5 w-3 lg:w-5 ${completed.includes(lessons[i - 1]!.slug) ? "bg-ink" : "bg-line"}`}
                  />
                )}
                {open ? (
                  <Link
                    href={`/learn/${l.slug}`}
                    aria-current={current ? "step" : undefined}
                    aria-label={`Урок ${l.number}: ${l.title}${done ? ", пройден" : ""}`}
                    title={l.title}
                    className="rounded-full"
                  >
                    {node}
                  </Link>
                ) : (
                  <span aria-label={`Урок ${l.number} пока закрыт`} title="Откроется после предыдущего урока">
                    {node}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        {onOpenGlossary && (
          <button
            type="button"
            onClick={onOpenGlossary}
            className="mr-1 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-paper"
          >
            Шпаргалка
          </button>
        )}
        <span className="mr-1 text-sm font-semibold text-muted md:hidden">
          {currentIndex + 1} / {lessons.length}
        </span>
        {prev ? (
          <Link
            href={`/learn/${prev.slug}`}
            aria-label={`Предыдущий урок: ${prev.title}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-ink hover:bg-paper"
          >
            ‹
          </Link>
        ) : (
          <span aria-hidden="true" className="h-10 w-10" />
        )}
        {next && nextOpen ? (
          <Link
            href={`/learn/${next.slug}`}
            aria-label={`Следующий урок: ${next.title}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-ink hover:bg-paper"
          >
            ›
          </Link>
        ) : (
          <span
            aria-label={next ? "Следующий урок откроется после проверки" : undefined}
            className="flex h-10 w-10 items-center justify-center text-xl text-line"
          >
            {next ? "›" : ""}
          </span>
        )}
      </div>
    </header>
  );
}
