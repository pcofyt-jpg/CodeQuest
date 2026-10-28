import { PYTHON_PRELUDE, MAX_ROBOT_STEPS, runCall, type PyRunResult, type RobotLevel } from "./prelude";

/**
 * Python в браузере: Pyodide (настоящий Python 3) в отдельном фоновом потоке.
 *
 * Безопасность и надёжность:
 *  - поток создаётся из blob: и наследует политику безопасности страницы
 *    (connect-src 'self' + наставник) — код ребёнка не может ходить в интернет;
 *  - у потока нет доступа к странице, cookies и хранилищу браузера;
 *  - зависшая программа (бесконечный цикл) останавливается: поток уничтожается
 *    и создаётся заново, а страница при этом не замирает ни на миг;
 *  - файлы Python лежат на нашем же сайте (/pyodide/), внешние CDN не нужны.
 */
export const RUN_TIMEOUT_MS = 5000;

type Pending = {
  id: number;
  resolve: (r: PyRunResult) => void;
  onLine?: (line: string) => void;
  output: string[];
  timer: number;
};

export type PythonStatus = "idle" | "loading" | "ready" | "failed";

function pyodideBase(): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${window.location.origin}${basePath}/pyodide/`;
}

function workerSource(base: string): string {
  const prelude = PYTHON_PRELUDE.replace("${MAX_ROBOT_STEPS}", String(MAX_ROBOT_STEPS));
  return `
import { loadPyodide } from ${JSON.stringify(base + "pyodide.mjs")};
let currentId = 0;
const py = await loadPyodide({ indexURL: ${JSON.stringify(base)} });
py.setStdout({ batched: (text) => postMessage({ type: "out", id: currentId, text }) });
py.setStderr({ batched: () => {} });
py.runPython(${JSON.stringify(prelude)});
postMessage({ type: "ready" });
onmessage = (e) => {
  const m = e.data;
  if (!m || m.type !== "run") return;
  currentId = m.id;
  py.globals.set("__cq_code", String(m.code));
  py.globals.set("__cq_stdin", JSON.stringify(m.stdin || []));
  py.globals.set("__cq_level", JSON.stringify(m.level || null));
  let result;
  try { result = py.runPython(${JSON.stringify(runCall())}); }
  catch (err) { result = JSON.stringify({ error: { type: "InternalError", message: String(err && err.message || err), line: null }, robot: null, output: [] }); }
  postMessage({ type: "done", id: m.id, result });
};
`;
}

class PythonRunner {
  private worker: Worker | null = null;
  private readyPromise: Promise<void> | null = null;
  private pending: Pending | null = null;
  private nextId = 1;
  private queue: Promise<unknown> = Promise.resolve();
  status: PythonStatus = "idle";
  private listeners = new Set<(s: PythonStatus) => void>();

  onStatus(fn: (s: PythonStatus) => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private setStatus(s: PythonStatus) {
    this.status = s;
    this.listeners.forEach((l) => l(s));
  }

  /** Запускает загрузку Python заранее, чтобы первый запуск был быстрым. */
  warmUp() {
    void this.ensure().catch(() => {});
  }

  private ensure(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;
    this.setStatus("loading");
    const url = URL.createObjectURL(new Blob([workerSource(pyodideBase())], { type: "text/javascript" }));
    const worker = new Worker(url, { type: "module" });
    this.worker = worker;
    this.readyPromise = new Promise<void>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent) => {
        const m = e.data as { type?: string; id?: number; text?: string; result?: string };
        if (m?.type === "ready") {
          this.setStatus("ready");
          resolve();
          return;
        }
        const p = this.pending;
        if (!p || m?.id !== p.id) return;
        if (m.type === "out" && typeof m.text === "string") {
          p.output.push(m.text);
          p.onLine?.(m.text);
        } else if (m.type === "done" && typeof m.result === "string") {
          window.clearTimeout(p.timer);
          this.pending = null;
          try {
            p.resolve(JSON.parse(m.result) as PyRunResult);
          } catch {
            p.resolve({ error: { type: "InternalError", message: "не удалось прочитать результат", line: null }, robot: null, output: p.output });
          }
        }
      };
      worker.onerror = () => {
        this.setStatus("failed");
        this.reset();
        reject(new Error("Python не загрузился"));
      };
    });
    return this.readyPromise;
  }

  private reset() {
    this.worker?.terminate();
    this.worker = null;
    this.readyPromise = null;
  }

  /** Запускает программу. Запуски идут по очереди. */
  run(code: string, stdin: string[], level: RobotLevel | null, onLine?: (line: string) => void): Promise<PyRunResult> {
    const task = this.queue.then(() => this.runNow(code, stdin, level, onLine));
    this.queue = task.catch(() => {});
    return task;
  }

  private async runNow(code: string, stdin: string[], level: RobotLevel | null, onLine?: (line: string) => void): Promise<PyRunResult> {
    try {
      await this.ensure();
    } catch {
      return { error: { type: "LoadError", message: "Python не загрузился. Проверь интернет и обнови страницу.", line: null }, robot: null, output: [] };
    }
    return new Promise<PyRunResult>((resolve) => {
      const id = this.nextId++;
      const output: string[] = [];
      const timer = window.setTimeout(() => {
        // Программа зависла: останавливаем поток целиком и готовим новый.
        this.pending = null;
        this.reset();
        this.setStatus("idle");
        resolve({ error: null, robot: null, output, timedOut: true });
      }, RUN_TIMEOUT_MS);
      this.pending = { id, resolve, onLine, output, timer };
      this.worker!.postMessage({ type: "run", id, code, stdin, level });
    });
  }
}

let runner: PythonRunner | null = null;
export function getPythonRunner(): PythonRunner {
  runner ??= new PythonRunner();
  return runner;
}
