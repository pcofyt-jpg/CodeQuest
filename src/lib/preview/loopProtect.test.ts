import { describe, expect, it } from "vitest";
import { parse } from "acorn";
import { INFINITE_LOOP_MARKER, loopRuntime, protectLoops } from "./loopProtect";

/** Выполняет защищённый код в Node, подставляя globalThis вместо window. */
function run(code: string, limitMs = 100): unknown {
  const result = protectLoops(code);
  if (!result.ok) throw new Error("syntax: " + result.error.message);
  const g = {} as Record<string, unknown>;
  new Function("window", loopRuntime(limitMs))(g);
  return new Function("__cqLoopStart", "__cqLoopTick", result.code + "\n;return typeof out === 'undefined' ? undefined : out;")(
    g.__cqLoopStart,
    g.__cqLoopTick,
  );
}

describe("protectLoops", () => {
  it("прерывает бесконечный while", () => {
    expect(() => run("while (true) {}")).toThrow(INFINITE_LOOP_MARKER);
  });

  it("прерывает бесконечные for и do-while без фигурных скобок", () => {
    expect(() => run("for (;;) ;")).toThrow(INFINITE_LOOP_MARKER);
    expect(() => run("let i = 0; do i++; while (true)")).toThrow(INFINITE_LOOP_MARKER);
  });

  it("не мешает обычным циклам и сохраняет результат", () => {
    const code = `var out = 0;
for (let i = 0; i < 1000; i++) out += i;
var arr = [1, 2, 3]; for (const x of arr) { out += x; }
var o = { a: 1 }; for (var k in o) out += o[k];
var j = 0; while (j < 5) j++; out += j;`;
    expect(run(code)).toBe(499500 + 6 + 1 + 5);
  });

  it("сохраняет метки циклов (continue outer)", () => {
    const code = `var out = 0;
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) { if (j === 1) continue outer; out++; }
}`;
    expect(run(code)).toBe(3);
  });

  it("работает с вложенными циклами без скобок и в if без скобок", () => {
    const code = `var out = 0; var a = 3;
if (a) while (a-- > 0) for (var b = 0; b < 2; b++) out++;`;
    expect(run(code)).toBe(6);
  });

  it("не меняет номера строк", () => {
    const src = "let a = 1;\nwhile (a < 3) {\n  a++;\n}\nfor (;;) break;\n";
    const res = protectLoops(src);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.code.split("\n").length).toBe(src.split("\n").length);
      expect(() => parse(res.code, { ecmaVersion: "latest" })).not.toThrow();
    }
  });

  it("сообщает о синтаксической ошибке с номером строки", () => {
    const res = protectLoops("const a = 1;\nconst b = (2;\n");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.line).toBe(2);
  });
});

describe("parseLoopError", () => {
  it("достаёт номер остановленного цикла", async () => {
    const { parseLoopError } = await import("./loopProtect");
    expect(parseLoopError("Uncaught Error: __CQ_INFINITE_LOOP__:3")).toBe(3);
    expect(parseLoopError("TypeError: x is not a function")).toBeNull();
  });

  it("запоминает строку каждого цикла", () => {
    const res = protectLoops("let a = 0;\n\nwhile (true) {}\nfor (;;) {}");
    expect(res.ok && res.loopLines).toEqual([3, 4]);
  });
});
