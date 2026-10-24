/**
 * Проверки задания описываются данными, а не функциями.
 * Так их можно безопасно передать в изолированный предпросмотр,
 * хранить в базе и позже повторить на сервере.
 */
export type Check =
  /** элемент существует */
  | { kind: "exists"; selector: string; message: string }
  /** у элемента есть текст нужной длины / с нужным содержимым */
  | {
      kind: "text";
      selector: string;
      minLength?: number;
      notEquals?: string[];
      message: string;
    }
  /** вычисленный CSS-стиль элемента отличается от перечисленных значений */
  | { kind: "styleNot"; selector: string; property: string; values: string[]; message: string }
  /** после клика по одному элементу меняется текст другого */
  | { kind: "clickChangesText"; click: string; watch: string; message: string }
  /** после каждого клика текст равен очередному ожидаемому значению */
  | { kind: "clickSequence"; click: string; watch: string; expect: string[]; message: string }
  /** после многих кликов появляется не меньше N разных текстов */
  | { kind: "clickDistinct"; click: string; watch: string; clicks: number; minDistinct: number; message: string }
  /** проверка исходного кода регулярным выражением (выполняется вне предпросмотра) */
  | { kind: "source"; file: CodeFile; pattern: string; flags?: string; minMatches?: number; message: string }
  /** в консоли нет ошибок */
  | { kind: "noErrors"; message: string };

export type CodeFile = "html" | "css" | "js";

export type ProjectFiles = Record<CodeFile, string>;

export type Lesson = {
  slug: string;
  number: number;
  title: string;
  /** одна фраза: что получится в конце */
  goal: string;
  /** короткое объяснение, абзацы */
  explanation: string[];
  /** шаги задания */
  steps: string[];
  starter: ProjectFiles;
  /** какой файл открыть первым */
  focusFile: CodeFile;
  /** подсказки — от мягкой к почти готовому ответу; с каждым уроком их меньше */
  hints: string[];
  checks: Check[];
  /** чему научился ребёнок */
  learned: string[];
  /** урок задуман вместе с ИИ-наставником, которого пока нет */
  plannedWithMentor?: boolean;
};

export type CheckResult = { ok: boolean; message: string };
