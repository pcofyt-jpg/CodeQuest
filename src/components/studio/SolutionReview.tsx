"use client";

import { useState } from "react";
import type { CodeFile, Lesson, ProjectFiles } from "@/content/lessons/types";

const LABELS: Record<CodeFile, string> = { html: "HTML", css: "CSS", js: "JavaScript", py: "Python" };

/**
 * «Разбор решения»: открывается, когда проверка не прошла три раза и подсказки кончились.
 * Показывает правильный код и выделяет строки, которых нет у ребёнка, — плюс «почему так».
 * Это страховка от тупика, а не замена самостоятельной работы: перепиши сам и разберись в каждой строке.
 */
export function SolutionReview({ lesson, current }: { lesson: Lesson; current: ProjectFiles }) {
  const [open, setOpen] = useState(false);
  const files = (["html", "css", "js", "py"] as CodeFile[]).filter(
    (f) => (lesson.reference[f] ?? "").trim() !== "" && (lesson.reference[f] ?? "") !== (current[f] ?? ""),
  );
  if (files.length === 0) return null;

  return (
    <section aria-labelledby="review-title" className="rounded-2xl border border-sun bg-sun-soft px-4 py-3">
      <h2 id="review-title" className="text-[15px] font-bold text-ink">
        Разбор решения
      </h2>
      {!open ? (
        <>
          <p className="mt-1 text-sm leading-relaxed">
            Не получается уже несколько раз, и подсказки кончились — это нормально. Можно посмотреть правильное решение и
            разобраться в нём.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-2 rounded-xl bg-sun px-4 py-2 font-semibold text-on-accent"
          >
            Открыть разбор
          </button>
        </>
      ) : (
        <div className="mt-2 flex flex-col gap-3">
          <p className="text-sm leading-relaxed">
            Строки со знаком <b>+</b> — те, которых нет в твоём коде. Не копируй: перепиши их сам и подумай, что делает
            каждая. Так решение запомнится.
          </p>
          {files.map((f) => {
            const mine = new Set((current[f] ?? "").split("\n").map((l) => l.trim()).filter(Boolean));
            const lines = (lesson.reference[f] ?? "").replace(/\n$/, "").split("\n");
            return (
              <div key={f}>
                <p className="text-sm font-semibold text-muted">{LABELS[f]}</p>
                <pre className="mt-1 overflow-x-auto rounded-lg bg-deep py-2 font-mono text-[13px] leading-relaxed">
                  {lines.map((line, i) => {
                    const missing = line.trim() !== "" && !mine.has(line.trim());
                    return (
                      <div key={i} className={`px-3 ${missing ? "bg-sun/20 text-ink" : "text-ink/70"}`}>
                        <span aria-hidden="true" className="mr-2 inline-block w-3 text-sun">
                          {missing ? "+" : " "}
                        </span>
                        {missing && <span className="sr-only">Нет у тебя: </span>}
                        {line || " "}
                      </div>
                    );
                  })}
                </pre>
              </div>
            );
          })}
          <div>
            <p className="text-sm font-semibold text-muted">Почему так</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px] leading-relaxed">
              {lesson.learned.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
