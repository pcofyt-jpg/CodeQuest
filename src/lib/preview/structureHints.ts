/**
 * Помощник по структуре HTML и CSS — без ИИ и без браузера.
 *
 * Браузер молча «чинит» неправильный HTML, а CSS-правило с неверным именем просто не срабатывает,
 * поэтому консоль про такие ошибки молчит. Пилот показал, что именно на них дети и спотыкаются:
 * пропущенная >, незакрытый тег, второй <main>, card1/card2 вместо одного класса card, #box вместо .box.
 * Помощник находит их и объясняет: строка + причина, а не готовый код.
 */
import type { ProjectFiles } from "@/content/lessons/types";

export type StructureHint = { file: "html" | "css"; line: number; message: string };

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
/** Обёртки документа: в коде детей их обычно нет, а если есть — браузер прощает. */
const LENIENT = new Set(["html", "head", "body"]);

const lineAt = (text: string, index: number) => text.slice(0, index).split("\n").length;

/** Комментарии заменяем пробелами той же длины — номера строк не сдвигаются. */
function blankComments(text: string, re: RegExp): string {
  return text.replace(re, (m) => m.replace(/[^\n]/g, " "));
}

function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length]![b.length]!;
}

type Named = { name: string; line: number };

export function analyzeHtml(raw: string): { hints: StructureHint[]; classes: Named[]; ids: Named[] } {
  const html = blankComments(raw, /<!--[\s\S]*?-->/g);
  const hints: StructureHint[] = [];
  const classes: Named[] = [];
  const ids: Named[] = [];
  const stack: Named[] = [];
  let mainLine = 0;

  let i = 0;
  while ((i = html.indexOf("<", i)) !== -1) {
    const rest = html.slice(i);
    const m = /^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/.exec(rest);
    if (!m) {
      i++;
      continue;
    }
    const closing = m[1] === "/";
    const name = m[2]!.toLowerCase();
    const line = lineAt(html, i);
    const nextGt = html.indexOf(">", i + 1);
    const nextLt = html.indexOf("<", i + 1);
    // Нет «>» до следующего тега: <h1 Привет</h1>
    if (nextGt === -1 || (nextLt !== -1 && nextLt < nextGt)) {
      hints.push({
        file: "html",
        line,
        message: `У тега <${closing ? "/" : ""}${name} в строке ${line} нет закрывающей скобки >. Тег должен заканчиваться знаком >, например <${closing ? "/" : ""}${name}>.`,
      });
      // Считаем тег всё равно открытым (или закрытым), чтобы одна ошибка не тянула за собой цепочку подсказок.
      if (!closing && !VOID.has(name)) stack.push({ name, line });
      else if (closing) {
        const at = stack.map((s) => s.name).lastIndexOf(name);
        if (at !== -1) stack.length = at;
      }
      i = nextLt === -1 ? html.length : nextLt;
      continue;
    }
    const tag = html.slice(i, nextGt + 1);
    i = nextGt + 1;
    if (name === "script" || name === "style") {
      const end = html.toLowerCase().indexOf(`</${name}`, i);
      if (end !== -1) i = end;
      if (!closing) continue;
    }

    if (!closing) {
      for (const a of tag.matchAll(/\b(class|id)\s*=\s*["']([^"']*)["']/gi)) {
        const target = a[1]!.toLowerCase() === "class" ? classes : ids;
        for (const v of a[2]!.split(/\s+/).filter(Boolean)) target.push({ name: v, line });
      }
      if (name === "main") {
        if (mainLine)
          hints.push({
            file: "html",
            line,
            message: `Тег <main> открыт второй раз (строка ${line}, первый раз — строка ${mainLine}). На странице должен быть один <main>: всё основное содержание кладут внутрь него.`,
          });
        else mainLine = line;
      }
      if (!VOID.has(name) && !tag.endsWith("/>")) stack.push({ name, line });
      continue;
    }

    if (VOID.has(name)) continue;
    const at = stack.map((s) => s.name).lastIndexOf(name);
    if (at === -1) {
      if (!LENIENT.has(name))
        hints.push({
          file: "html",
          line,
          message: `Закрывающий </${name}> в строке ${line} лишний: открытого <${name}> перед ним нет. Проверь, не пропущен ли открывающий тег или не закрыт ли он уже раньше.`,
        });
      continue;
    }
    // Всё, что открыто внутри и не закрыто до </name>, — незакрытые теги.
    for (const open of stack.slice(at + 1).reverse()) {
      if (LENIENT.has(open.name)) continue;
      hints.push({
        file: "html",
        line: open.line,
        message: `Тег <${open.name}> из строки ${open.line} не закрыт до </${name}> в строке ${line}. Сначала закрывают внутренний тег, потом внешний.`,
      });
    }
    stack.length = at;
  }
  for (const open of stack) {
    if (LENIENT.has(open.name)) continue;
    hints.push({
      file: "html",
      line: open.line,
      message: `Тег <${open.name}> из строки ${open.line} не закрыт. Добавь </${open.name}> там, где он должен заканчиваться.`,
    });
  }
  // Одинаковые подсказки (два незакрытых <p> в одной строке) — одной строкой.
  const unique = hints.filter((h, k) => hints.findIndex((x) => x.line === h.line && x.message === h.message) === k);
  return { hints: unique, classes, ids };
}

/** Селекторы CSS: имена классов и id со строками (значения вроде #ff6b6b внутри { } не трогаем). */
export function cssSelectors(raw: string): { classes: Named[]; ids: Named[] } {
  const css = blankComments(raw, /\/\*[\s\S]*?\*\//g);
  const classes: Named[] = [];
  const ids: Named[] = [];
  for (const rule of css.matchAll(/([^{}]+)\{/g)) {
    const selector = rule[1]!;
    if (selector.trim().startsWith("@")) continue;
    const base = rule.index ?? 0;
    for (const s of selector.matchAll(/([.#])(-?[a-zA-Z_][\w-]*)/g)) {
      const line = lineAt(css, base + (s.index ?? 0));
      (s[1] === "." ? classes : ids).push({ name: s[2]!, line });
    }
  }
  return { classes, ids };
}

export function analyzeStructure(files: ProjectFiles): StructureHint[] {
  const { hints, classes: htmlClasses, ids: htmlIds } = analyzeHtml(files.html);
  const css = cssSelectors(files.css);
  const hasClass = new Set(htmlClasses.map((c) => c.name));
  const hasId = new Set(htmlIds.map((c) => c.name));
  const seen = new Set<string>();

  for (const c of css.classes) {
    if (hasClass.has(c.name) || seen.has(`.${c.name}`)) continue;
    seen.add(`.${c.name}`);
    if (hasId.has(c.name)) {
      hints.push({
        file: "css",
        line: c.line,
        message: `В CSS .${c.name} — это класс, а в HTML «${c.name}» — это id. Для id пиши #${c.name}, или поменяй в HTML на class="${c.name}".`,
      });
      continue;
    }
    const similar = [...hasClass].filter((n) => n.startsWith(c.name) || distance(n, c.name) <= 2);
    hints.push({
      file: "css",
      line: c.line,
      message: similar.length
        ? `Правило .${c.name} (строка ${c.line}) не сработает: в HTML нет элемента с class="${c.name}". Есть похожие: ${similar.join(", ")}. Одинаковым элементам дают один и тот же класс — например, всем карточкам class="${c.name}".`
        : `Правило .${c.name} (строка ${c.line}) пока ни к чему не применяется: в HTML нет элемента с class="${c.name}". Проверь название — до буквы.`,
    });
  }
  for (const c of css.ids) {
    if (hasId.has(c.name) || seen.has(`#${c.name}`)) continue;
    seen.add(`#${c.name}`);
    hints.push({
      file: "css",
      line: c.line,
      message: hasClass.has(c.name)
        ? `В CSS #${c.name} — это id, а в HTML «${c.name}» — это class. Для класса пиши .${c.name}, с точкой.`
        : `Правило #${c.name} (строка ${c.line}) пока ни к чему не применяется: в HTML нет элемента с id="${c.name}".`,
    });
  }
  return hints;
}
