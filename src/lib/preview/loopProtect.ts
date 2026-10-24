import { parse, type Node } from "acorn";
import { ancestor } from "acorn-walk";

/**
 * Защита от бесконечных циклов в коде ребёнка.
 *
 * Зачем: предпросмотр работает в том же процессе браузера, что и приложение
 * (пока у него нет отдельного домена), поэтому `while (true) {}` заморозил бы
 * всю студию. Мы разбираем код парсером и вставляем в каждый цикл проверку
 * времени. Если цикл крутится дольше лимита, он прерывается понятной ошибкой.
 *
 * Вставки не содержат переводов строк, поэтому номера строк в ошибках
 * совпадают с тем, что ребёнок видит в редакторе.
 *
 * Это не граница безопасности (её обеспечивает песочница), а защита от
 * случайного зависания: обойти её можно намеренно, но навредить этим можно
 * только своему предпросмотру.
 */

export const LOOP_START_FN = "__cqLoopStart";
export const LOOP_TICK_FN = "__cqLoopTick";
export const INFINITE_LOOP_MARKER = "__CQ_INFINITE_LOOP__";

export type ProtectResult =
  | { ok: true; code: string; loops: number; /** строка каждого цикла по его номеру */ loopLines: number[] }
  | { ok: false; error: { message: string; line: number; column: number } };

type Insertion = {
  pos: number;
  text: string;
  /** закрывающие вставки идут раньше открывающих на той же позиции */
  closing: boolean;
  depth: number;
};

type LoopNode = Node & {
  body: Node & { type: string; start: number; end: number };
};

const LOOP_TYPES = [
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "WhileStatement",
  "DoWhileStatement",
] as const;

export function protectLoops(source: string): ProtectResult {
  let ast: Node;
  try {
    ast = parse(source, { ecmaVersion: "latest", sourceType: "script", locations: true });
  } catch (err) {
    const e = err as SyntaxError & { loc?: { line: number; column: number } };
    return {
      ok: false,
      error: {
        message: e.message.replace(/\s*\(\d+:\d+\)$/, ""),
        line: e.loc?.line ?? 1,
        column: (e.loc?.column ?? 0) + 1,
      },
    };
  }

  const insertions: Insertion[] = [];
  const loopLines: number[] = [];
  let nextId = 0;

  const visit = (node: Node, _state: unknown, ancestors: Node[]) => {
    const loop = node as LoopNode;
    const id = nextId++;
    loopLines[id] = loop.loc?.start.line ?? 1;
    const depth = ancestors.length;

    // 1. Внутри тела цикла — «тик» с проверкой времени.
    const tick = `${LOOP_TICK_FN}(${id});`;
    if (loop.body.type === "BlockStatement") {
      insertions.push({ pos: loop.body.start + 1, text: tick, closing: false, depth: depth + 1 });
    } else {
      insertions.push({ pos: loop.body.start, text: `{${tick}`, closing: false, depth: depth + 1 });
      insertions.push({ pos: loop.body.end, text: "}", closing: true, depth: depth + 1 });
    }

    // 2. Перед циклом — засекаем время. Если у цикла есть метка (`outer: for`),
    //    оборачиваем метку целиком, иначе `continue outer` сломается.
    let target: Node = loop;
    let targetDepth = depth;
    for (let i = ancestors.length - 2; i >= 0; i--) {
      const parent = ancestors[i];
      if (parent && parent.type === "LabeledStatement" && ancestors[i + 1] === target) {
        target = parent;
        targetDepth = i + 1;
      } else {
        break;
      }
    }
    insertions.push({ pos: target.start, text: `{${LOOP_START_FN}(${id});`, closing: false, depth: targetDepth });
    insertions.push({ pos: target.end, text: "}", closing: true, depth: targetDepth });
  };

  const visitors = Object.fromEntries(LOOP_TYPES.map((t) => [t, visit]));
  ancestor(ast, visitors);

  insertions.sort((a, b) => {
    if (a.pos !== b.pos) return a.pos - b.pos;
    if (a.closing !== b.closing) return a.closing ? -1 : 1;
    // открывающие: снаружи внутрь; закрывающие: изнутри наружу
    return a.closing ? b.depth - a.depth : a.depth - b.depth;
  });

  let out = "";
  let cursor = 0;
  for (const ins of insertions) {
    out += source.slice(cursor, ins.pos) + ins.text;
    cursor = ins.pos;
  }
  out += source.slice(cursor);

  return { ok: true, code: out, loops: nextId, loopLines };
}

/** Достаёт номер цикла из сообщения об ошибке, если цикл был остановлен. */
export function parseLoopError(message: string): number | null {
  const m = message.match(new RegExp(INFINITE_LOOP_MARKER + ":(\\d+)"));
  return m ? Number(m[1]) : null;
}

/**
 * Код, который выполняется в предпросмотре до кода ребёнка и определяет
 * функции проверки циклов. Функции нельзя перезаписать случайно.
 */
export function loopRuntime(limitMs: number): string {
  return `(function(){
  var starts = Object.create(null), counts = Object.create(null);
  function def(name, fn){ Object.defineProperty(window, name, { value: fn, writable: false, configurable: false }); }
  def(${JSON.stringify(LOOP_START_FN)}, function(id){ starts[id] = Date.now(); counts[id] = 0; });
  def(${JSON.stringify(LOOP_TICK_FN)}, function(id){
    if ((++counts[id] & 255) !== 0) return;
    if (Date.now() - starts[id] > ${Math.max(50, Math.floor(limitMs))}) {
      throw new Error(${JSON.stringify(INFINITE_LOOP_MARKER + ":")} + id);
    }
  });
})();`;
}
