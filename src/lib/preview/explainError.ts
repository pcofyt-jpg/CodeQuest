import { INFINITE_LOOP_MARKER } from "./loopProtect";

/**
 * Превращает техническое сообщение об ошибке в объяснение для ребёнка.
 * Оригинальный текст тоже показываем — к нему стоит привыкать,
 * но первым ребёнок видит понятную фразу.
 */
/** Команды и свойства, которые встречаются в уроках: с ними сравниваем опечатки. */
const KNOWN_NAMES = [
  "addEventListener", "querySelector", "querySelectorAll", "textContent", "document", "console", "log",
  "getElementById", "innerHTML", "style", "classList", "value", "Math", "random", "floor", "length",
  "push", "setTimeout", "setInterval", "alert", "function", "const", "let", "window", "backgroundColor",
];

function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  return dp[a.length]![b.length]!;
}

/** Похожее известное название: «addEventListner» → «addEventListener». */
export function suggestName(name: string): string | null {
  const last = name.split(".").pop() ?? name;
  if (last.length < 3 || KNOWN_NAMES.includes(last)) return null;
  let best: string | null = null;
  let bestD = Infinity;
  for (const k of KNOWN_NAMES) {
    const d = distance(last.toLowerCase(), k.toLowerCase());
    const limit = k.length <= 5 ? 1 : 2;
    if (d <= limit && d < bestD) {
      best = k;
      bestD = d;
    }
  }
  // Отличие только в регистре букв — тоже опечатка: textcontent → textContent
  return best;
}

function withSuggestion(text: string, name: string | undefined): string {
  const s = name ? suggestName(name) : null;
  return s ? `${text} Может быть, ты имел в виду ${s}? Сравни по буквам.` : text;
}

export function explainError(raw: string): string {
  const msg = raw.replace(/^Uncaught\s+/, "");

  if (msg.includes(INFINITE_LOOP_MARKER)) {
    return "Цикл работал дольше секунды, и студия его остановила. Похоже, он никогда не заканчивается — проверь условие цикла.";
  }

  let m = msg.match(/^ReferenceError: (\S+) is not defined/);
  if (m) {
    return withSuggestion(`Имя «${m[1]}» не найдено. Проверь, нет ли в нём опечатки и создано ли оно выше в коде.`, m[1]);
  }

  m = msg.match(/Cannot read propert(?:y|ies) of (null|undefined) \(reading '([^']+)'\)/);
  if (m) {
    return m[1] === "null"
      ? `Код пытается использовать «${m[2]}» у элемента, которого нет на странице. Проверь, совпадает ли селектор в querySelector с id или классом в HTML — до буквы.`
      : `Код пытается использовать «${m[2]}» у чего-то пустого (undefined). Проверь, что переменная получила значение.`;
  }

  m = msg.match(/Cannot set propert(?:y|ies) of (null|undefined)/);
  if (m) {
    return "Код пытается изменить элемент, которого нет на странице. Проверь селектор в querySelector.";
  }

  m = msg.match(/^TypeError: (\S+) is not a function/);
  if (m) {
    return withSuggestion(`«${m[1]}» — не функция. Возможно, в названии опечатка: сравни с примером в задании.`, m[1]);
  }

  if (/Assignment to constant variable/.test(msg)) {
    return "Ты меняешь значение переменной, объявленной через const. Если значение должно меняться, объяви её через let.";
  }

  if (/Unexpected end of input/i.test(msg)) {
    return "Код закончился раньше времени. Скорее всего, не хватает закрывающей скобки } или ).";
  }

  if (/Unexpected token|Unterminated string|Unexpected character|Invalid or unexpected token/i.test(msg)) {
    return "В записи кода есть ошибка: лишний или пропущенный символ. Проверь скобки и кавычки рядом с указанной строкой.";
  }

  return "В коде произошла ошибка. Прочитай сообщение ниже и проверь строку, которую оно указывает.";
}
