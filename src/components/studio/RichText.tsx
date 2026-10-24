"use client";

import { findTermId, glossary } from "@/content/glossary";
import { useGlossary } from "@/components/glossary/Glossary";

/**
 * Показывает текст урока, выделяя моноширинным шрифтом фрагменты кода:
 * теги (<h1>), правила CSS (h1 { color: black; }) и латинские слова кода.
 * Если фрагмент или русское слово («функция», «тег») есть в шпаргалке,
 * он становится кнопкой, которая открывает карточку понятия.
 * React экранирует текст, поэтому теги показываются как текст, а не как HTML.
 */
const CODE_SOURCES = [
  String.raw`<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?>`, // теги
  String.raw`[.#]?[a-zA-Z][\w-]*(?::[a-z]+)?\s*\{[^}]*\}`, // правила CSS
  String.raw`[a-zA-Z_$.#:][\w$.\-#:]*(?:\([^)]*\))?(?:\s*=\s*"[^"]*";?)?`, // слова кода
];

const cyrillicAliases = glossary
  .flatMap((t) => t.aliases)
  .filter((a) => /[а-яё]/i.test(a))
  .sort((a, b) => b.length - a.length)
  .map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

const PATTERN = new RegExp(
  `(${CODE_SOURCES.join("|")})|(?<![\\p{L}])(${cyrillicAliases.join("|")})(?![\\p{L}])`,
  "giu",
);

const PLAIN_WORDS = new Set(["HTML", "CSS", "JavaScript", "paragraph"]);

export function RichText({ text }: { text: string }) {
  const glossaryApi = useGlossary();
  const parts: React.ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(PATTERN)) {
    const value = match[0];
    const index = match.index ?? 0;
    const isCode = match[1] !== undefined;
    if (isCode && (PLAIN_WORDS.has(value) || value === ":" || value === ".")) continue;

    const termId = findTermId(value);
    const clickable = termId !== null && glossaryApi !== null;
    if (!isCode && !clickable) continue;

    if (index > last) parts.push(text.slice(last, index));
    const label = isCode ? (
      <code className="rounded bg-paper px-1 py-px font-mono text-[0.9em] text-ink">{value}</code>
    ) : (
      value
    );
    parts.push(
      clickable ? (
        <button
          key={index}
          type="button"
          onClick={() => glossaryApi.openTerm(termId)}
          title="Открыть в шпаргалке"
          className="cursor-help rounded underline decoration-route/60 decoration-dotted decoration-2 underline-offset-4 hover:decoration-route"
        >
          {label}
        </button>
      ) : (
        <span key={index}>{label}</span>
      ),
    );
    last = index + value.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
