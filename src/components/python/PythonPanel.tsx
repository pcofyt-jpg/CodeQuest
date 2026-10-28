"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Check, ProjectFiles } from "@/content/lessons/types";
import { evaluatePythonChecks } from "@/lib/python/checks";
import { explainPyError } from "@/lib/python/explain";
import type { PyRunResult, RobotLevel, RobotState } from "@/lib/python/prelude";
import { getPythonRunner, RUN_TIMEOUT_MS, type PythonStatus } from "@/lib/python/runner";
import type { CheckOutcome } from "@/components/studio/useCheckRunner";

// ---------- поле робота ----------

const CELL = 44;

export function RobotWorld({ level, state, step }: { level: RobotLevel; state: RobotState | null; step: number }) {
  const path = state?.path ?? [level.start];
  const shown = path.slice(0, Math.min(step + 1, path.length));
  const pos = shown[shown.length - 1] ?? level.start;
  const visited = new Set(shown.map(([x, y]) => `${x},${y}`));
  const finished = step >= path.length - 1;
  const crashed = !!state?.crashed && finished;
  const w = level.width * CELL;
  const h = level.height * CELL;
  return (
    <figure className="flex justify-center p-3">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        role="img"
        aria-label={`Поле робота: ${state?.atGoal && finished ? "робот дошёл до флажка" : "робот в пути"}`}
        className="h-auto max-w-full rounded-xl bg-[#e9f5ec]"
      >
        {Array.from({ length: level.height }, (_, y) =>
          Array.from({ length: level.width }, (_, x) => (
            <rect key={`${x}-${y}`} x={x * CELL} y={y * CELL} width={CELL} height={CELL} fill="none" stroke="#c3e6cb" />
          )),
        )}
        {level.walls.map(([x, y]) => (
          <rect key={`w${x}-${y}`} x={x * CELL + 2} y={y * CELL + 2} width={CELL - 4} height={CELL - 4} rx={6} fill="#868e96" />
        ))}
        {shown.slice(0, -1).map(([x, y], i) => (
          <circle key={`p${i}`} cx={x * CELL + CELL / 2} cy={y * CELL + CELL / 2} r={4} fill="#74c0fc" />
        ))}
        {level.gems
          .filter(([x, y]) => !visited.has(`${x},${y}`))
          .map(([x, y]) => (
            <path
              key={`g${x}-${y}`}
              d={`M${x * CELL + 22} ${y * CELL + 10} l10 10 l-10 14 l-10 -14 z`}
              fill="#be4bdb"
              stroke="#862e9c"
              strokeWidth={2}
            />
          ))}
        <g transform={`translate(${level.goal[0] * CELL + 14} ${level.goal[1] * CELL + 8})`}>
          <path d="M2 2 L2 30" stroke="#495057" strokeWidth={3} />
          <path d="M3 3 L20 9 L3 15 Z" fill="#fa5252" />
        </g>
        <g transform={`translate(${pos[0] * CELL + CELL / 2} ${pos[1] * CELL + CELL / 2})`}>
          <rect x={-15} y={-14} width={30} height={26} rx={8} fill={crashed ? "#fa5252" : "#2f5bea"} />
          <circle cx={-6} cy={-3} r={3.5} fill="white" />
          <circle cx={6} cy={-3} r={3.5} fill="white" />
          <path d="M-6 6 Q0 10 6 6" stroke="white" strokeWidth={2} fill="none" />
          <path d="M0 -14 L0 -20" stroke="#2f5bea" strokeWidth={2} />
          <circle cx={0} cy={-21} r={2.5} fill="#ffc53d" />
        </g>
      </svg>
    </figure>
  );
}

// ---------- статус загрузки Python ----------

export function usePythonStatus(): PythonStatus {
  const status = useSyncExternalStore(
    (onChange) => getPythonRunner().onStatus(onChange),
    () => getPythonRunner().status,
    () => "idle" as PythonStatus,
  );
  // Загружаем Python заранее, пока ребёнок читает урок.
  useEffect(() => {
    getPythonRunner().warmUp();
  }, []);
  return status;
}

// ---------- проверки урока ----------

export function usePythonChecks(level: RobotLevel | null) {
  const [outcome, setOutcome] = useState<CheckOutcome>({ status: "idle" });
  const start = useCallback(
    async (files: ProjectFiles, checks: Check[]) => {
      setOutcome({ status: "running" });
      const runner = getPythonRunner();
      const { results, lastRun } = await evaluatePythonChecks(
        (code, stdin, lvl) => runner.run(code, stdin, lvl),
        files,
        checks,
        level,
      );
      if (lastRun?.timedOut) {
        setOutcome({
          status: "failed",
          reason: `Программа работала дольше ${RUN_TIMEOUT_MS / 1000} секунд и была остановлена. Похоже, цикл никогда не заканчивается.`,
        });
        return;
      }
      setOutcome({ status: "done", results, passed: results.every((r) => r.ok), files });
    },
    [level],
  );
  const reset = useCallback(() => setOutcome({ status: "idle" }), []);
  return { start, outcome, reset };
}

// ---------- панель результата ----------

type Props = {
  code: string;
  level: RobotLevel | null;
  /** показывать поле ввода (в уроке есть input) */
  needsInput: boolean;
  defaultInput?: string;
  onJumpToLine: (line: number) => void;
};

export function PythonPanel({ code, level, needsInput, defaultInput = "", onJumpToLine }: Props) {
  const status = usePythonStatus();
  const [stdin, setStdin] = useState(defaultInput);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PyRunResult | null>(null);
  const [live, setLive] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  // Анимация пути робота: шаг за шагом после запуска.
  useEffect(() => {
    window.clearInterval(timer.current);
    const len = result?.robot?.path.length ?? 0;
    if (len <= 1) return;
    timer.current = window.setInterval(() => {
      setStep((s) => {
        if (s >= len - 1) {
          window.clearInterval(timer.current);
          return s;
        }
        return s + 1;
      });
    }, 260);
    return () => window.clearInterval(timer.current);
  }, [result]);

  const run = async () => {
    setRunning(true);
    setLive([]);
    setStep(0);
    const lines = stdin.split("\n").filter((l, i, arr) => l !== "" || i < arr.length - 1);
    const r = await getPythonRunner().run(code, lines, level, (line) => setLive((prev) => [...prev, line].slice(-300)));
    setResult(r);
    setRunning(false);
  };

  const finished = !result?.robot || step >= result.robot.path.length - 1;
  const output = result ? result.output : live;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <h2 className="text-sm font-semibold text-muted">Результат</h2>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="rounded-lg bg-mint px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {running ? "Выполняю…" : "▶ Запустить"}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {status === "loading" && (
          <p role="status" className="mx-4 mt-3 rounded-lg bg-sun-soft px-3 py-2 text-sm">
            Загружаю Python… В первый раз это занимает несколько секунд, потом — мгновенно.
          </p>
        )}
        {status === "failed" && (
          <p role="alert" className="mx-4 mt-3 rounded-lg bg-coral-soft px-3 py-2 text-sm text-coral">
            Python не загрузился. Проверь интернет и обнови страницу.
          </p>
        )}
        {level && <RobotWorld level={level} state={result?.robot ?? null} step={step} />}
        {level && result?.robot && finished && (
          <p role="status" className="px-4 text-center text-[15px] font-semibold">
            {result.robot.atGoal
              ? result.robot.gems === result.robot.totalGems
                ? "Робот у флажка и собрал все кристаллы!"
                : `Робот у флажка, кристаллов: ${result.robot.gems} из ${result.robot.totalGems}.`
              : result.robot.crashed
                ? ""
                : "Робот остановился, но не дошёл до флажка."}
          </p>
        )}
        {needsInput && (
          <div className="px-4 pt-3">
            <label htmlFor="py-stdin" className="text-sm font-semibold text-muted">
              Ввод для программы — по строке на каждый input()
            </label>
            <textarea
              id="py-stdin"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={3}
              spellCheck={false}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 font-mono text-[14px]"
            />
          </div>
        )}
      </div>
      <section aria-label="Консоль" className="flex max-h-[45%] min-h-[110px] flex-col border-t border-line">
        <h2 className="px-4 pt-2 pb-1 text-sm font-semibold text-muted">Вывод программы</h2>
        <ol aria-live="polite" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2 font-mono text-[13px] leading-relaxed">
          {output.length === 0 && !result?.error && !result?.timedOut && (
            <li className="px-2 font-sans text-sm text-muted">Нажми «▶ Запустить» — здесь появится то, что напечатает программа.</li>
          )}
          {output.map((line, i) => (
            <li key={i} className="px-2 break-words whitespace-pre-wrap">
              {line}
            </li>
          ))}
          {result?.timedOut && (
            <li className="rounded-lg bg-coral-soft px-2 py-1 font-sans text-sm text-coral">
              Программа работала дольше {RUN_TIMEOUT_MS / 1000} секунд и была остановлена. Похоже, цикл никогда не
              заканчивается — проверь его условие.
            </li>
          )}
          {result?.error && finished && (
            <li className="rounded-lg bg-coral-soft px-2 py-1 text-coral">
              <p className="mb-0.5 font-sans text-sm font-medium text-ink">{explainPyError(result.error)}</p>
              <p className="break-words whitespace-pre-wrap">
                {result.error.type}: {result.error.message.replace(/\s*\(<твой код>, line \d+\)/, "")}
                {result.error.line != null && (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={() => onJumpToLine(result.error!.line!)}
                      className="font-sans text-sm font-semibold text-route underline underline-offset-2"
                    >
                      строка {result.error.line}
                    </button>
                  </>
                )}
              </p>
            </li>
          )}
        </ol>
      </section>
    </div>
  );
}
