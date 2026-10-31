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
    /** элементов не меньше min (и не больше max, если задан) */
    | { kind: "count"; selector: string; min: number; max?: number }
    /** контраст текста и фона по WCAG не ниже min (4.5 — норма для обычного текста) */
    | { kind: "contrast"; selector: string; min: number }
    /** вычисленный CSS-стиль подходит под регулярное выражение (например, 3 колонки сетки) */
    | { kind: "styleMatches"; selector: string; property: string; pattern: string }
    /** структура HTML/CSS без ошибок: теги закрыты, один <main>, имена классов и id совпадают */
    | { kind: "structureOk" }
    /** элементы идут на странице в этом порядке */
    | { kind: "order"; selectors: string[] }
    /** все элементы selector стоят друг под другом (vertical) или в ряд (horizontal) */
    | { kind: "stacked"; selector: string; direction: "vertical" | "horizontal" }
    /** вычисленный CSS-стиль равен одному из значений */
    | { kind: "styleIs"; selector: string; property: string; values: string[] }
    /** у элемента есть атрибут: не короче minLength и/или подходит под pattern */
    | { kind: "attr"; selector: string; attribute: string; minLength?: number; pattern?: string }
    /** ссылок вида href="#…" внутри selector не меньше min, и каждая ведёт на существующий id */
    | { kind: "anchorsResolve"; selector: string; min: number }
    /** страница не вылезает за край по ширине (проверяется на ширине checkWidth урока) */
    | { kind: "noOverflow" }
    /** Python: робот дошёл до флажка (и собрал все кристаллы, если allGems) */
    | { kind: "pyRobot"; allGems?: boolean }
    /** Python: при таком вводе в выводе по порядку есть эти фрагменты */
    | { kind: "pyOutput"; stdin: string[]; expect: string[] }
    /** Python: программа выполняется без ошибок */
    | { kind: "pyNoError"; stdin?: string[] }
    /** сценарий: студия играет в игру ребёнка по шагам и проверяет, что получилось */
    | { kind: "scenario"; steps: ScenarioStep[] }
  );

/** Шаг сценария проверки игры. */
export type ScenarioStep =
  | { click: string; times?: number }
  | { type: { selector: string; value: string } }
  | { key: string; times?: number }
  | { wait: number }
  | {
      expect: {
        selector: string;
        equals?: string;
        contains?: string;
        matches?: string;
        style?: { property: string; equals: string };
        /** ожидаемый текст зависит от текста другого элемента: map[текст from] */
        from?: { selector: string; map: Record<string, string> };
      };
    };

export type CodeFile = "html" | "css" | "js" | "py";

/** Файлы проекта. py есть только у уроков Python. */
export type ProjectFiles = { html: string; css: string; js: string; py?: string };

/**
 * Короткие задания внутри урока («Попробуй») — до основного задания.
 * Как у лучших платформ: понять → попробовать → применить, но для детей.
 */
export type Exercise =
  /** выбрать ответ (в том числе «что получится?» и «где ошибка?») */
  | { kind: "choice"; question: string; code?: string; options: string[]; correct: number; explain: string }
  /** собрать код из перемешанных строчек; lines — в правильном порядке */
  | { kind: "order"; prompt: string; lines: string[]; explain: string }
  /** вставить пропущенное: before[ввод]after; подходит любой из answers (без учёта регистра) */
  | { kind: "fill"; prompt: string; before: string; after: string; answers: string[]; explain: string }
  /** напечатать строку точно как в образце — тренировка клавиатуры */
  | { kind: "type"; prompt: string; target: string; explain: string };

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
  /** курс (см. src/content/courses.ts) */
  course: string;
  slug: string;
  /** номер урока внутри курса */
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
  /** короткие задания «Попробуй» перед основным заданием */
  practice?: Exercise[];
  /** эталонное решение: для тестов и как «контрольная точка» следующего урока */
  reference: ProjectFiles;
  /** урок задуман вместе с ИИ-наставником, которого пока нет */
  plannedWithMentor?: boolean;
  /** ширина проверочного фрейма, px (например 360 — как телефон); по умолчанию 800 */
  checkWidth?: number;
  /** язык урока: веб (по умолчанию) или Python */
  lang?: "web" | "python";
  /** поле робота для уроков Python */
  robot?: import("@/lib/python/prelude").RobotLevel;
  /** реплика персонажа в начале урока — сюжет, как в Ozaria */
  story?: string;
  /** показать в уроке живой образец — готовую страницу (эталон), которую нужно повторить */
  sample?: boolean;
};

/**
 * Урок основного проекта: продолжает код ребёнка из прошлого урока проекта
 * и дописывает в конец файлов заготовки (additions).
 * Первый урок проекта начинается со starter.
 */
/** Вставка заготовки перед тегом (например, перед </main>); если тега нет — в конец файла. */
export type Insertion = { before: string; text: string };
export type Addition = string | Insertion | Insertion[];

export type ProjectLesson = LessonBase & {
  track: "project";
  starter?: ProjectFiles;
  additions?: Partial<Record<CodeFile, Addition>>;
  /** проект с чистого листа: не продолжает прошлый урок, начинается со starter */
  freshStart?: boolean;
};

/** Тренировка на отдельном коде, не меняет проект ребёнка. */
export type PracticeLesson = LessonBase & {
  track: "practice";
  starter: ProjectFiles;
};

export type Lesson = ProjectLesson | PracticeLesson;

export type CheckResult = { ok: boolean; message: string; fix: string };
