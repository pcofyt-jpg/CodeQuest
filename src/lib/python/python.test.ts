import { beforeAll, describe, expect, it } from "vitest";
import { loadPyodide, type PyodideInterface } from "pyodide";
import { PYTHON_PRELUDE, MAX_ROBOT_STEPS, runCall, type PyRunResult, type RobotLevel } from "./prelude";
import { evaluatePythonChecks } from "./checks";
import { explainPyError, suggestPyName } from "./explain";
import { courseLessons } from "@/content/lessons/catalog";

/** Тот же запуск, что в браузере, только Pyodide — в Node. */
let pyo: PyodideInterface;
const run = async (code: string, stdin: string[], level: RobotLevel | null): Promise<PyRunResult> => {
  pyo.globals.set("__cq_code", code);
  pyo.globals.set("__cq_stdin", JSON.stringify(stdin));
  pyo.globals.set("__cq_level", JSON.stringify(level));
  return JSON.parse(pyo.runPython(runCall()) as string) as PyRunResult;
};

beforeAll(async () => {
  pyo = await loadPyodide({ stdout: () => {}, stderr: () => {} });
  pyo.runPython(PYTHON_PRELUDE.replace("${MAX_ROBOT_STEPS}", String(MAX_ROBOT_STEPS)));
}, 120_000);

describe("курс Python: эталоны проходят, стартовый код — нет", () => {
  const lessons = courseLessons("python");
  it("в курсе 8 уроков на Python", () => {
    expect(lessons).toHaveLength(8);
    for (const l of lessons) expect(l.lang, l.slug).toBe("python");
  });

  for (const l of lessons) {
    it(l.slug, async () => {
      const level = l.robot ?? null;
      const good = await evaluatePythonChecks(run, l.reference, l.checks, level);
      expect(good.results.filter((r) => !r.ok).map((r) => r.message), "эталон").toEqual([]);
      const starter = l.track === "practice" ? l.starter : l.starter!;
      const bad = await evaluatePythonChecks(run, starter, l.checks, level);
      expect(bad.results.every((r) => r.ok), "стартовый код не должен проходить").toBe(false);
    }, 30_000);
  }
});

describe("робот и ввод", () => {
  const L: RobotLevel = { width: 4, height: 2, start: [0, 0], goal: [3, 0], walls: [[1, 1]], gems: [[2, 0]] };
  it("врезается в стену и сообщает строку", async () => {
    const r = await run("robot.right()\nrobot.down()", [], L);
    expect(r.error?.type).toBe("RobotCrash");
    expect(r.error?.line).toBe(2);
    expect(r.robot?.crashed).toBe(true);
  });
  it("бесконечное хождение по кругу останавливается", async () => {
    const r = await run("while True:\n    robot.right()\n    robot.left()", [], L);
    expect(r.error?.type).toBe("RobotLost");
  });
  it("input показывает вопрос и ответ, нехватка ввода — понятная ошибка", async () => {
    const r = await run('a = input("Кто? ")\nprint("Привет,", a)\nb = input()', ["кот"], null);
    expect(r.output).toEqual(["Кто? кот", "Привет, кот"]);
    expect(r.error?.type).toBe("EOFError");
  });
});

describe("объяснения ошибок Python", () => {
  it("по-русски и с подсказкой", () => {
    expect(explainPyError({ type: "SyntaxError", message: "expected ':' (<твой код>, line 1)", line: 1 })).toContain("двоеточие");
    expect(explainPyError({ type: "IndentationError", message: "expected an indented block after 'for' statement on line 1", line: 2 })).toContain("4 пробела");
    expect(explainPyError({ type: "NameError", message: "name 'pritn' is not defined", line: 1 })).toContain("print");
    expect(explainPyError({ type: "AttributeError", message: "'Robot' object has no attribute 'rigth'", line: 1 })).toContain("right");
    expect(explainPyError({ type: "TypeError", message: 'can only concatenate str (not "int") to str', line: 1 })).toContain("int(input())");
    expect(suggestPyName("prnt")).toBe("print");
    expect(suggestPyName("robot")).toBeNull();
  });
});
