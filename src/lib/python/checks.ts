import type { Check, CheckResult, ProjectFiles } from "@/content/lessons/types";
import { runSourceCheck } from "@/lib/checks/sourceChecks";
import type { PyRunResult, RobotLevel } from "./prelude";

/** Как запустить программу: в браузере — фоновый поток, в тестах — Pyodide в Node. */
export type PyRun = (code: string, stdin: string[], level: RobotLevel | null) => Promise<PyRunResult>;

/** Проверки урока Python. Каждая проверка с вводом — отдельный запуск программы. */
export async function evaluatePythonChecks(
  run: PyRun,
  files: ProjectFiles,
  checks: Check[],
  level: RobotLevel | null,
): Promise<{ results: CheckResult[]; lastRun: PyRunResult | null }> {
  const code = files.py ?? "";
  const results: CheckResult[] = [];
  let lastRun: PyRunResult | null = null;
  let plain: PyRunResult | null = null;
  const runPlain = async () => (plain ??= await run(code, [], level));

  for (const c of checks) {
    let ok = false;
    if (c.kind === "source") {
      ok = runSourceCheck(c, files);
    } else if (c.kind === "pyRobot") {
      const r = await runPlain();
      lastRun = r;
      ok = !!r.robot && !r.robot.crashed && r.robot.atGoal && (!c.allGems || r.robot.gems === r.robot.totalGems);
    } else if (c.kind === "pyOutput") {
      const r = await run(code, c.stdin, level);
      lastRun = r;
      // Ожидаемые фрагменты должны встретиться в выводе по порядку (без учёта регистра).
      const text = r.output.join("\n").toLowerCase();
      let at = 0;
      ok = !r.error && !r.timedOut;
      for (const piece of c.expect) {
        const i = text.indexOf(piece.toLowerCase(), at);
        if (i === -1) {
          ok = false;
          break;
        }
        at = i + piece.length;
      }
    } else if (c.kind === "pyNoError") {
      const r = c.stdin ? await run(code, c.stdin, level) : await runPlain();
      lastRun = r;
      ok = !r.error && !r.timedOut;
    }
    results.push({ ok, message: c.message, fix: c.fix });
  }
  return { results, lastRun };
}
