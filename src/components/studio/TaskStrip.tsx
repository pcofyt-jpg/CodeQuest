"use client";

import { useState } from "react";
import type { Lesson } from "@/content/lessons/types";
import { RichText } from "./RichText";

/**
 * Задание над кодом — только на телефоне, где задание и код на разных вкладках.
 * Свёрнуто: цель урока одной строкой. Развёрнуто: шаги задания и что проверит студия,
 * чтобы не уходить из кода, когда нужно свериться с условием.
 */
export function TaskStrip({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="shrink-0 border-b border-line lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <span className="shrink-0 rounded-md bg-sun-soft px-1.5 py-0.5 text-xs font-bold text-sun">Задание</span>
        <span className={`min-w-0 flex-1 text-sm text-ink ${open ? "" : "truncate"}`}>{lesson.goal}</span>
        <span aria-hidden="true" className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && (
        <div className="max-h-[45dvh] space-y-3 overflow-y-auto px-3 pb-3 text-[15px] leading-snug">
          {lesson.steps.length > 0 && (
            <ol className="list-decimal space-y-1.5 pl-5">
              {lesson.steps.map((s, i) => (
                <li key={i}>
                  <RichText text={s} />
                </li>
              ))}
            </ol>
          )}
          {lesson.checks.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted">Студия проверит:</p>
              <ul className="mt-1 space-y-1">
                {lesson.checks.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true" className="text-muted">
                      ○
                    </span>
                    <span>{c.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
