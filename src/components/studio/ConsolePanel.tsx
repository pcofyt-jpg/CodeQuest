"use client";

export type ConsoleEntry = {
  id: number;
  level: "log" | "info" | "warn" | "error" | "alert";
  text: string;
  /** объяснение для ребёнка (для ошибок) */
  explanation?: string;
  /** строка в файле JS, если известна */
  line?: number | null;
};

const levelStyle: Record<ConsoleEntry["level"], string> = {
  log: "text-ink",
  info: "text-ink",
  alert: "text-ink",
  warn: "bg-sun-soft text-ink",
  error: "bg-coral-soft text-coral",
};

type Props = {
  entries: ConsoleEntry[];
  onJumpToLine: (line: number) => void;
};

export function ConsolePanel({ entries, onJumpToLine }: Props) {
  return (
    <section aria-label="Консоль" className="flex max-h-[40%] min-h-[96px] flex-col border-t border-line">
      <h2 className="px-4 pt-2 pb-1 text-sm font-semibold text-muted">Консоль</h2>
      <ol
        aria-live="polite"
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2 font-mono text-[13px] leading-relaxed"
      >
        {entries.length === 0 ? (
          <li className="px-2 font-sans text-sm text-muted">
            Здесь появятся сообщения из console.log и ошибки. Пока всё спокойно.
          </li>
        ) : (
          entries.map((e) => (
            <li key={e.id} className={`rounded-lg px-2 py-1 ${levelStyle[e.level]}`}>
              {e.explanation && <p className="mb-0.5 font-sans text-sm font-medium text-ink">{e.explanation}</p>}
              <p className="break-words whitespace-pre-wrap">
                {e.level === "alert" && <span className="font-sans text-muted">alert: </span>}
                {e.text}
                {e.line != null && (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={() => onJumpToLine(e.line!)}
                      className="font-sans text-sm font-semibold text-route underline underline-offset-2"
                    >
                      строка {e.line}
                    </button>
                  </>
                )}
              </p>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
