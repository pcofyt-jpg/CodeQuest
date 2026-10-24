/**
 * Показывает текст урока, выделяя моноширинным шрифтом фрагменты кода:
 * теги (<h1>), правила CSS (h1 { color: black; }) и латинские слова кода
 * (textContent, background-color, Math.random). Названия языков не выделяем.
 * React экранирует текст, поэтому теги показываются как текст, а не как HTML.
 */
const CODE_PATTERN = new RegExp(
  [
    String.raw`<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?>`, // теги
    String.raw`[.#]?[a-zA-Z][\w-]*(?::[a-z]+)?\s*\{[^}]*\}`, // правила CSS
    String.raw`[a-zA-Z_$.#:][\w$.\-#:]*(?:\([^)]*\))?(?:\s*=\s*"[^"]*";?)?`, // слова кода
  ].join("|"),
  "g",
);

const PLAIN_WORDS = new Set(["HTML", "CSS", "JavaScript", "paragraph"]);

export function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(CODE_PATTERN)) {
    const value = match[0];
    const index = match.index ?? 0;
    if (PLAIN_WORDS.has(value) || value === ":" || value === ".") continue;
    if (index > last) parts.push(text.slice(last, index));
    parts.push(
      <code key={index} className="rounded bg-paper px-1 py-px font-mono text-[0.9em] text-ink">
        {value}
      </code>,
    );
    last = index + value.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
