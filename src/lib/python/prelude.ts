/**
 * Python-обвязка, которая запускает программу ребёнка.
 * Одна и та же для браузера (Pyodide в фоновом потоке) и для тестов (Pyodide в Node).
 *
 * - каждый запуск — с чистыми переменными;
 * - input() берёт строки из заранее заданного ввода и показывает их в выводе, как в консоли;
 * - робот (если в уроке есть поле) ходит по клеткам: стены, кристаллы, флажок;
 * - ошибка возвращается с типом, текстом и строкой в коде ребёнка.
 * Результат — JSON-строка.
 */

/** Поле робота: x — вправо, y — вниз; координаты клеток [x, y]. */
export type RobotLevel = {
  width: number;
  height: number;
  start: [number, number];
  goal: [number, number];
  walls: [number, number][];
  gems: [number, number][];
};

export type RobotState = {
  path: [number, number][];
  pos: [number, number];
  gems: number;
  totalGems: number;
  atGoal: boolean;
  crashed: boolean;
};

export type PyError = { type: string; message: string; line: number | null };

export type PyRunResult = {
  error: PyError | null;
  robot: RobotState | null;
  output: string[];
  timedOut?: boolean;
};

export const MAX_ROBOT_STEPS = 300;

const PRELUDE = String.raw`
import json, sys, traceback

class RobotCrash(Exception):
    pass

class RobotLost(Exception):
    pass

def __cq_run(_cq_code, _cq_stdin, _cq_level):
    _cq_out = []
    _cq_ns = {"__name__": "__main__"}
    _cq_inputs = list(_cq_stdin)

    def _cq_print(*args, sep=" ", end="\n", file=None, flush=False):
        text = sep.join(str(a) for a in args) + end
        sys.stdout.write(text)
        for line in text.split("\n")[:-1] if text.endswith("\n") else text.split("\n"):
            _cq_out.append(line)

    def _cq_input(prompt=""):
        if not _cq_inputs:
            raise EOFError("программе нужен ещё ввод")
        value = str(_cq_inputs.pop(0))
        _cq_print(str(prompt) + value)
        return value

    _cq_ns["print"] = _cq_print
    _cq_ns["input"] = _cq_input

    _cq_robot = None
    if _cq_level is not None:
        class Robot:
            """Робот Кью. Команды: right, left, up, down (можно с числом шагов) и say."""
            def __init__(self, level):
                self._w = level["width"]; self._h = level["height"]
                self._walls = set(tuple(w) for w in level["walls"])
                self._gems = set(tuple(g) for g in level["gems"])
                self._total = len(self._gems)
                self._goal = tuple(level["goal"])
                self._pos = tuple(level["start"])
                self._path = [list(self._pos)]
                self._crashed = False
            def _move(self, dx, dy, steps):
                if not isinstance(steps, int) or steps < 1:
                    raise ValueError("число шагов должно быть целым и больше нуля")
                for _ in range(steps):
                    if len(self._path) > ${MAX_ROBOT_STEPS}:
                        raise RobotLost("Робот сделал слишком много шагов и заблудился")
                    nx, ny = self._pos[0] + dx, self._pos[1] + dy
                    if not (0 <= nx < self._w and 0 <= ny < self._h):
                        self._crashed = True
                        raise RobotCrash("Робот упёрся в край поля")
                    if (nx, ny) in self._walls:
                        self._crashed = True
                        raise RobotCrash("Робот врезался в стену")
                    self._pos = (nx, ny)
                    self._path.append([nx, ny])
                    self._gems.discard(self._pos)
            def right(self, steps=1): self._move(1, 0, steps)
            def left(self, steps=1): self._move(-1, 0, steps)
            def up(self, steps=1): self._move(0, -1, steps)
            def down(self, steps=1): self._move(0, 1, steps)
            def say(self, text): _cq_print("🤖 " + str(text))
            def _state(self):
                return {"path": self._path, "pos": list(self._pos), "gems": self._total - len(self._gems),
                        "totalGems": self._total, "atGoal": self._pos == self._goal, "crashed": self._crashed}
        _cq_robot = Robot(_cq_level)
        _cq_ns["robot"] = _cq_robot

    _cq_err = None
    try:
        exec(compile(_cq_code, "<твой код>", "exec"), _cq_ns)
    except SystemExit:
        pass
    except BaseException as e:
        line = None
        if isinstance(e, SyntaxError) and getattr(e, "filename", None) == "<твой код>":
            line = e.lineno
        else:
            for frame in traceback.extract_tb(e.__traceback__):
                if frame.filename == "<твой код>":
                    line = frame.lineno
        _cq_err = {"type": type(e).__name__, "message": str(e), "line": line}
    return json.dumps({
        "error": _cq_err,
        "robot": _cq_robot._state() if _cq_robot is not None else None,
        "output": _cq_out,
    }, ensure_ascii=False)
`;

/** Код, который определяет __cq_run (выполняется один раз после загрузки Python). */
export const PYTHON_PRELUDE = PRELUDE;

/** Вызов запуска с данными урока (данные передаются как JSON, без подстановки в код). */
export function runCall(): string {
  return "__cq_run(__cq_code, json.loads(__cq_stdin), json.loads(__cq_level))";
}
