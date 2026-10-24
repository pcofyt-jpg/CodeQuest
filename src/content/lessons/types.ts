/**
 * Проверки задания описываются данными, а не функциями.
 * Так их можно безопасно передать в изолированный предпросмотр,
 * хранить в базе и позже повторить на сервере.
 *
 * message — что проверяем («У карточки скруглены углы»),
 * fix — что сделать, если не получилось (показывается при ✗).
 */
type CheckBase = { message: string; fix: string };

export type Check = CheckBase &
  (
    | { kind: "exists"; selector: string }
    | { kind: "text"; selector: string; minLength?: number; notEquals?: string[] }
    | { kind: "styleNot"; selector: string; property: string; values: string[] }
    | { kind: "clickChangesText"; click: string; watch: string }
    | { kind: "clickSequence"; click: string; watch: string; expect: string[] }
    | { kind: "clickDistinct"; click: string; watch: string; clicks: number; minDistinct: number }
    | { kind: "source"; file: CodeFile; pattern: string; flags?: string; minMatches?: number }
    | { kind: "noErrors" }
  );

export type CodeFile = "html" | "css" | "js";

export type ProjectFiles = Record<CodeFile, string>;

export type QuizQuestion = {
  question: string;
  /** фрагмент кода к вопросу */
  code?: string;
  options: string[];
  correct: number;
  /** объяснение — показывается после ответа, верного или нет */
  explain: string;
};

type LessonBase = {
  slug: string;
  number: number;
  title: string;
  /** одна фраза: что получится в конце */
  goal: string;
  /** объяснение, абзацы */
  explanation: string[];
  /** понятия из словаря, которые появляются в уроке */
  newTerms: string[];
  /** шаги задания: конкретно, что и где сделать */
  steps: string[];
  focusFile: CodeFile;
  /** подсказки — от мягкой к почти готовому ответу; с каждым уроком их меньше */
  hints: string[];
  checks: Check[];
  /** чему научился ребёнок */
  learned: string[];
  /** короткий тест после урока */
  quiz: QuizQuestion[];
  /** эталонное решение: для тестов и как «контрольная точка» следующего урока */
  reference: ProjectFiles;
  /** урок задуман вместе с ИИ-наставником, которого пока нет */
  plannedWithMentor?: boolean;
};

/**
 * Урок основного проекта: продолжает код ребёнка из прошлого урока проекта
 * и дописывает в конец файлов заготовки (additions).
 * Первый урок проекта начинается со starter.
 */
export type ProjectLesson = LessonBase & {
  track: "project";
  starter?: ProjectFiles;
  additions?: Partial<ProjectFiles>;
};

/** Тренировка на отдельном коде, не меняет проект ребёнка. */
export type PracticeLesson = LessonBase & {
  track: "practice";
  starter: ProjectFiles;
};

export type Lesson = ProjectLesson | PracticeLesson;

export type CheckResult = { ok: boolean; message: string; fix: string };
