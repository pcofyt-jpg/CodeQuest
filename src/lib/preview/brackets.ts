/**
 * Точная проверка скобок в JavaScript — без ИИ.
 * Модели плохо считают скобки (в проверке 25.10.2026 обе версии YandexGPT
 * назвали не ту скобку), а программа считает их без ошибок.
 * Строки и комментарии пропускаются. Регулярные выражения и вложенные шаблоны
 * `${…}` не разбираются — в коде детей они почти не встречаются.
 */
export type BracketProblem =
  | { kind: "unclosed"; open: string; need: string; line: number }
  | { kind: "extra"; found: string; line: number }
  | { kind: "mismatch"; found: string; need: string; line: number; openLine: number };

const PAIRS: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
const OPENERS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

export function analyzeBrackets(code: string): BracketProblem | null {
  const stack: { ch: string; line: number }[] = [];
  let line = 1;
  let mode: "code" | "str" | "line" | "block" = "code";
  let quote = "";
  for (let i = 0; i < code.length; i++) {
    const c = code[i]!;
    const next = code[i + 1];
    if (c === "\n") {
      line++;
      if (mode === "line") mode = "code";
      if (mode === "str" && quote !== "`") mode = "code"; // незакрытая строка заканчивается на переводе строки
      continue;
    }
    if (mode === "line") continue;
    if (mode === "block") {
      if (c === "*" && next === "/") {
        mode = "code";
        i++;
      }
      continue;
    }
    if (mode === "str") {
      if (c === "\\") i++;
      else if (c === quote) mode = "code";
      continue;
    }
    if (c === "/" && next === "/") {
      mode = "line";
      i++;
    } else if (c === "/" && next === "*") {
      mode = "block";
      i++;
    } else if (c === '"' || c === "'" || c === "`") {
      mode = "str";
      quote = c;
    } else if (PAIRS[c]) {
      stack.push({ ch: c, line });
    } else if (OPENERS[c]) {
      const top = stack.pop();
      if (!top) return { kind: "extra", found: c, line };
      if (top.ch !== OPENERS[c]) return { kind: "mismatch", found: c, need: PAIRS[top.ch]!, line, openLine: top.line };
    }
  }
  const top = stack[stack.length - 1];
  return top ? { kind: "unclosed", open: top.ch, need: PAIRS[top.ch]!, line: top.line } : null;
}

export function describeBrackets(p: BracketProblem): string {
  switch (p.kind) {
    case "unclosed":
      return `Не закрыта скобка «${p.open}» из строки ${p.line} — ей нужна пара «${p.need}».`;
    case "extra":
      return `В строке ${p.line} лишняя скобка «${p.found}»: для неё нет открывающей.`;
    case "mismatch":
      return `В строке ${p.line} стоит «${p.found}», а нужна «${p.need}» — она закрывает скобку из строки ${p.openLine}.`;
  }
}
