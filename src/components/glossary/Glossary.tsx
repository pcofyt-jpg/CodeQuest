"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { glossary, groupTitles, type GlossaryTerm, type TermGroup } from "@/content/glossary";
import { lessons } from "@/content/lessons/catalog";
import { PREVIEW_CSP } from "@/lib/preview/buildDocument";
import { isLessonOpen } from "@/lib/lessons/access";

// ---------- какие понятия уже открыты ----------

const lessonIndex = new Map(lessons.map((l, i) => [l.slug, i]));

/** Понятие открыто, если открыт урок, где оно появляется. */
export function visibleTerms(completed: string[]): GlossaryTerm[] {
  return glossary.filter((t) => isLessonOpen(lessonIndex.get(t.introducedIn) ?? 0, completed));
}

// ---------- контекст: открыть понятие из любого места студии ----------

type GlossaryApi = { openTerm: (id: string) => void; prefer?: "py" | "web" };
const GlossaryContext = createContext<GlossaryApi | null>(null);
export const GlossaryProvider = GlossaryContext.Provider;
export function useGlossary() {
  return useContext(GlossaryContext);
}

// ---------- живой пример ----------

/**
 * Пример «как это выглядит». Только HTML и CSS: sandbox без allow-scripts,
 * поэтому скрипты здесь не выполняются вовсе.
 */
function TermDemo({ demo }: { demo: NonNullable<GlossaryTerm["demo"]> }) {
  const doc = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">
<style>body{margin:12px;font-family:system-ui,sans-serif;color:#1b2440}h1,h2,p{margin:0 0 8px}${demo.css ?? ""}</style>
</head><body>${demo.html}</body></html>`;
  return (
    <figure className="mt-3">
      <figcaption className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Как это выглядит</figcaption>
      <iframe
        title="Пример"
        sandbox=""
        srcDoc={doc}
        loading="lazy"
        tabIndex={-1}
        className="h-28 w-full rounded-lg border border-line bg-white"
      />
    </figure>
  );
}

// ---------- карточка понятия ----------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
      className="absolute top-1.5 right-1.5 rounded-md bg-surface px-2 py-0.5 font-sans text-xs font-semibold text-route shadow-sm"
    >
      {copied ? "Скопировано" : "Скопировать"}
    </button>
  );
}

export function TermCard({ term, compact = false }: { term: GlossaryTerm; compact?: boolean }) {
  return (
    <article id={`term-${term.id}`} className="scroll-mt-4 rounded-xl border border-line bg-surface p-4">
      <h3 className="font-mono text-[15px] font-bold text-route">{term.term}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{term.what}</p>
      <div className="relative mt-3">
        <pre className="overflow-x-auto rounded-lg bg-paper px-3 py-2 pr-24 font-mono text-[13px] leading-relaxed text-ink">
          {term.example}
        </pre>
        <CopyButton text={term.example} />
      </div>
      {term.note && <p className="mt-2 text-sm leading-relaxed text-muted">{term.note}</p>}
      {!compact && term.demo && <TermDemo demo={term.demo} />}
      {compact && term.demo && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-semibold text-route">Показать, как это выглядит</summary>
          <TermDemo demo={term.demo} />
        </details>
      )}
    </article>
  );
}

// ---------- список ----------

export function GlossaryList({ completed, highlight }: { completed: string[]; highlight?: string | null }) {
  const opened = visibleTerms(completed);
  // Понятие, открытое по нажатию из урока, показываем, даже если его урок ещё впереди.
  const extra = highlight && !opened.some((t) => t.id === highlight) ? glossary.filter((t) => t.id === highlight) : [];
  const terms = [...opened, ...extra];
  const hidden = glossary.length - terms.length;
  const groups = (Object.keys(groupTitles) as TermGroup[])
    .map((g) => ({ group: g, items: terms.filter((t) => t.group === g) }))
    .filter((g) => g.items.length > 0);

  useEffect(() => {
    if (!highlight) return;
    document.getElementById(`term-${highlight}`)?.scrollIntoView({ block: "start" });
  }, [highlight]);

  return (
    <div className="space-y-8">
      {groups.map(({ group, items }) => (
        <section key={group} aria-labelledby={`group-${group}`}>
          <h2 id={`group-${group}`} className="mb-3 text-lg font-bold text-ink">
            {groupTitles[group]}
          </h2>
          <div className="space-y-3">
            {items.map((t) => (
              <div key={t.id} className={highlight === t.id ? "rounded-2xl ring-4 ring-route-soft" : ""}>
                <TermCard term={t} />
              </div>
            ))}
          </div>
        </section>
      ))}
      {hidden > 0 && (
        <p className="text-sm text-muted">Ещё {hidden} понятий появятся здесь, когда ты дойдёшь до новых уроков.</p>
      )}
    </div>
  );
}

// ---------- выезжающая панель ----------

export function GlossaryDrawer({
  open,
  onClose,
  completed,
  highlight,
}: {
  open: boolean;
  onClose: () => void;
  completed: string[];
  highlight: string | null;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Закрыть шпаргалку" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-title"
        className="relative flex h-full w-full max-w-md flex-col bg-paper pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-3">
          <h2 id="glossary-title" className="text-xl font-bold">
            Шпаргалка
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 font-semibold text-route hover:bg-route-soft"
          >
            Закрыть
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <GlossaryList completed={completed} highlight={highlight} />
        </div>
      </aside>
    </div>
  );
}
