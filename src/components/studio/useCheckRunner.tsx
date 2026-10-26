"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Check, CheckResult, ProjectFiles } from "@/content/lessons/types";
import { buildPreviewDocument, isDomCheck, isPreviewMessage } from "@/lib/preview/buildDocument";
import { combineResults } from "@/lib/checks/sourceChecks";

const CHECK_TIMEOUT_MS = 10000;

type Run = { token: string; html: string; files: ProjectFiles; checks: Check[]; width: number };

export type CheckOutcome =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; results: CheckResult[]; passed: boolean; files: ProjectFiles }
  | { status: "failed"; reason: string };

/**
 * Проверка выполняется в отдельном невидимом фрейме с той же песочницей,
 * что и предпросмотр: клики проверки не сбивают то, что видит ребёнок.
 *
 * Результат на этом этапе вычисляется в браузере и потому не является
 * доказательством для сервера. На этапе 5 сервер будет повторять проверки
 * исходного кода и принимать решение о засчитывании урока сам.
 */
export function useCheckRunner() {
  const [run, setRun] = useState<Run | null>(null);
  const [outcome, setOutcome] = useState<CheckOutcome>({ status: "idle" });
  const frameRef = useRef<HTMLIFrameElement>(null);
  const errorsRef = useRef(0);

  const start = useCallback((files: ProjectFiles, checks: Check[], width = 800) => {
    const token = crypto.randomUUID();
    const built = buildPreviewDocument(files, { token, checks: checks.filter(isDomCheck) });
    if (built.syntaxError) {
      setOutcome({
        status: "failed",
        reason: `В JavaScript ошибка записи на строке ${built.syntaxError.line}. Исправь её — и проверка заработает.`,
      });
      return;
    }
    errorsRef.current = 0;
    setOutcome({ status: "running" });
    setRun({ token, html: built.html, files, checks, width });
  }, []);

  useEffect(() => {
    if (!run) return;
    const finish = (o: CheckOutcome) => {
      setOutcome(o);
      setRun(null);
    };
    const handler = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!isPreviewMessage(event.data, run.token)) return;
      const msg = event.data;
      if (msg.type === "error") errorsRef.current += 1;
      if (msg.type === "console" && msg.level === "error") errorsRef.current += 1;
      if (msg.type === "checks") {
        const results = combineResults(run.checks, msg.results, run.files, errorsRef.current);
        finish({ status: "done", results, passed: results.every((r) => r.ok), files: run.files });
      }
    };
    window.addEventListener("message", handler);
    const timer = window.setTimeout(
      () =>
        finish({
          status: "failed",
          reason:
            "Проверка не успела закончиться. Нажми «Проверить» ещё раз. Если сообщение повторяется, загляни в консоль: возможно, в коде есть бесконечный цикл.",
        }),
      CHECK_TIMEOUT_MS,
    );
    return () => {
      window.removeEventListener("message", handler);
      window.clearTimeout(timer);
    };
  }, [run]);

  const frame = run ? (
    <iframe
      key={run.token}
      ref={frameRef}
      title="Проверка задания"
      aria-hidden="true"
      tabIndex={-1}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      srcDoc={run.html}
      // Фрейм в пределах экрана, но невидимый: браузеры сильнее замедляют
      // фреймы за пределами экрана, а проверке нужна обычная скорость.
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: -1,
        visibility: "visible",
        width: `${run.width}px`,
        height: "600px",
        opacity: 0,
        pointerEvents: "none",
        border: 0,
      }}
    />
  ) : null;

  const reset = useCallback(() => setOutcome({ status: "idle" }), []);

  return { start, outcome, frame, reset };
}
