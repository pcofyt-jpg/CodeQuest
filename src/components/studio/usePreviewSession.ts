"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProjectFiles } from "@/content/lessons/types";
import { buildPreviewDocument, errorLine, type PreviewMessage } from "@/lib/preview/buildDocument";
import { explainError } from "@/lib/preview/explainError";
import { analyzeBrackets, describeBrackets } from "@/lib/preview/brackets";
import type { ConsoleEntry } from "./ConsolePanel";

const PREVIEW_DELAY_MS = 450;
const MAX_CONSOLE_ENTRIES = 200;

/**
 * Предпросмотр и консоль для любого кода: урока или своего проекта.
 * Пересобирает документ, когда ребёнок перестал печатать, и превращает
 * сообщения из песочницы в записи консоли с понятными объяснениями.
 */
export function usePreviewSession(files: ProjectFiles) {
  const [preview, setPreview] = useState(() => ({ files, token: crypto.randomUUID() }));
  const [log, setLog] = useState<{ token: string; entries: ConsoleEntry[] }>({ token: "", entries: [] });
  const entryId = useRef(0);

  const built = useMemo(() => buildPreviewDocument(preview.files, { token: preview.token }), [preview]);

  useEffect(() => {
    if (files === preview.files) return;
    const t = window.setTimeout(() => setPreview({ files, token: crypto.randomUUID() }), PREVIEW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [files, preview.files]);

  const pushEntry = useCallback((token: string, entry: Omit<ConsoleEntry, "id">) => {
    setLog((prev) => {
      const base = prev.token === token ? prev.entries : [];
      const entries = [...base, { ...entry, id: entryId.current++ }].slice(-MAX_CONSOLE_ENTRIES);
      return { token, entries };
    });
  }, []);

  const handleMessage = (msg: PreviewMessage) => {
    if (msg.type === "console") {
      pushEntry(preview.token, { level: msg.level, text: msg.text });
    } else if (msg.type === "error") {
      pushEntry(preview.token, {
        level: "error",
        text: msg.message,
        explanation: explainError(msg.message),
        line: errorLine(built, msg.message, msg.line),
      });
    }
  };

  const onNavigationBlocked = () =>
    pushEntry(preview.token, {
      level: "warn",
      text: "Страница попробовала перейти по другому адресу. В предпросмотре работает только твоя страница, поэтому она открыта заново.",
    });

  const entries: ConsoleEntry[] = useMemo(() => {
    const live = log.token === preview.token ? log.entries : [];
    if (!built.syntaxError) return live;
    const e = built.syntaxError;
    // Скобки проверяем точно, программой: это частая причина и тут нельзя ошибиться.
    const brackets = analyzeBrackets(preview.files.js);
    return [
      {
        id: -1,
        level: "error",
        text: `SyntaxError: ${e.message} (символ ${e.column})`,
        explanation: brackets
          ? `${describeBrackets(brackets)} JavaScript не запустился, пока ошибка не исправлена.`
          : `${explainError(e.message)} JavaScript не запустился, пока ошибка не исправлена.`,
        line: brackets ? brackets.line : e.line,
      },
      ...live,
    ];
  }, [log, preview.token, preview.files.js, built.syntaxError]);

  /** Перезапуск: с текущим кодом или сразу с новым (сброс, контрольная точка). */
  const restart = useCallback((next: ProjectFiles) => setPreview({ files: next, token: crypto.randomUUID() }), []);

  return { token: preview.token, built, entries, handleMessage, onNavigationBlocked, restart };
}

export type PreviewSession = ReturnType<typeof usePreviewSession>;
