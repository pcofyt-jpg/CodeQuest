import type { PyError } from "./prelude";

/** Слова, с которыми сравниваем опечатки: встроенные функции и команды робота. */
const KNOWN = ["print", "input", "int", "str", "range", "len", "robot", "right", "left", "up", "down", "say", "True", "False", "while", "for", "if", "else", "elif"];

function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length]![b.length]!;
}

export function suggestPyName(name: string): string | null {
  if (KNOWN.includes(name)) return null;
  let best: string | null = null;
  let bestD = Infinity;
  for (const k of KNOWN) {
    const d = distance(name.toLowerCase(), k.toLowerCase());
    if (d <= (k.length <= 4 ? 1 : 2) && d < bestD) {
      best = k;
      bestD = d;
    }
  }
  return best;
}

/** Понятное объяснение ошибки Python для ребёнка. */
export function explainPyError(e: PyError): string {
  const msg = e.message.replace(/\s*\(<твой код>, line \d+\)/, "");
  switch (e.type) {
    case "RobotCrash":
      return `${msg}. Посмотри на поле: куда робот должен был повернуть раньше?`;
    case "RobotLost":
      return "Робот сделал слишком много шагов. Похоже, цикл повторяется больше раз, чем нужно.";
    case "IndentationError":
      if (/expected an indented block/.test(msg))
        return "После строки с двоеточием : следующая строка должна начинаться с отступа — 4 пробела. Так Python понимает, что она внутри.";
      if (/unexpected indent/.test(msg)) return "В начале строки лишний отступ. Отступы нужны только внутри for, if, while и def.";
      return "Отступы не совпадают. Строки внутри одного блока должны начинаться с одинакового числа пробелов.";
    case "SyntaxError":
      if (/expected ':'/.test(msg)) return "В конце строки с if, else, for, while или def нужно двоеточие :";
      if (/unterminated string/.test(msg)) return "Не закрыта кавычка: у текста должны быть кавычки с обеих сторон.";
      if (/was never closed/.test(msg)) return `Не закрыта скобка: ${msg.replace(/'(.)' was never closed/, "«$1» — у неё нет пары")}.`;
      if (/unmatched/.test(msg)) return "Лишняя закрывающая скобка — для неё нет открывающей.";
      return "В записи кода ошибка. Проверь скобки, кавычки и двоеточия рядом с этой строкой.";
    case "NameError": {
      const name = msg.match(/name '([^']+)' is not defined/)?.[1];
      const s = name ? suggestPyName(name) : null;
      return `Python не знает имя «${name ?? "?"}».${s ? ` Может быть, ты имел в виду ${s}?` : " Проверь опечатки и создана ли переменная выше."}`;
    }
    case "AttributeError": {
      const attr = msg.match(/has no attribute '([^']+)'/)?.[1];
      const s = attr ? suggestPyName(attr) : null;
      return `У объекта нет команды «${attr ?? "?"}».${s ? ` Может быть, ${s}?` : ""} У робота есть right, left, up, down и say.`;
    }
    case "TypeError":
      if (/can only concatenate str/.test(msg) || /unsupported operand type.*'str'/.test(msg))
        return "Нельзя складывать текст и число через +. Если это ввод — преврати его в число: int(input()). Если нужен текст — напиши через запятую в print.";
      if (/'(int|str)' object is not callable/.test(msg)) return "Скобки после числа или текста: похоже, пропущен знак действия, например *.";
      return "Ошибка в типах: возможно, складываются текст и число. Посмотри, что лежит в переменных.";
    case "ValueError":
      if (/invalid literal for int/.test(msg)) return "int() не может превратить этот ввод в число. Введи цифры, например 7.";
      return msg;
    case "ZeroDivisionError":
      return "Делить на ноль нельзя.";
    case "EOFError":
      return "Программа ждёт ещё ввода. Добавь строку в поле «Ввод для программы» — по одной строке на каждый input().";
    default:
      return `Ошибка ${e.type}: ${msg}`;
  }
}
