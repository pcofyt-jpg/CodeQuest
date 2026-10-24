import { INFINITE_LOOP_MARKER } from "./loopProtect";

/**
 * Превращает техническое сообщение об ошибке в объяснение для ребёнка.
 * Оригинальный текст тоже показываем — к нему стоит привыкать,
 * но первым ребёнок видит понятную фразу.
 */
export function explainError(raw: string): string {
  const msg = raw.replace(/^Uncaught\s+/, "");

  if (msg.includes(INFINITE_LOOP_MARKER)) {
    return "Цикл работал дольше секунды, и студия его остановила. Похоже, он никогда не заканчивается — проверь условие цикла.";
  }

  let m = msg.match(/^ReferenceError: (\S+) is not defined/);
  if (m) {
    return `Имя «${m[1]}» не найдено. Проверь, нет ли в нём опечатки и создано ли оно выше в коде.`;
  }

  m = msg.match(/Cannot read propert(?:y|ies) of (null|undefined) \(reading '([^']+)'\)/);
  if (m) {
    return m[1] === "null"
      ? `Код пытается использовать «${m[2]}» у элемента, которого нет на странице. Проверь, совпадает ли селектор в querySelector с id или классом в HTML.`
      : `Код пытается использовать «${m[2]}» у чего-то пустого (undefined). Проверь, что переменная получила значение.`;
  }

  m = msg.match(/Cannot set propert(?:y|ies) of (null|undefined)/);
  if (m) {
    return "Код пытается изменить элемент, которого нет на странице. Проверь селектор в querySelector.";
  }

  m = msg.match(/^TypeError: (\S+) is not a function/);
  if (m) {
    return `«${m[1]}» — не функция. Возможно, в названии опечатка: сравни с примером в задании.`;
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
