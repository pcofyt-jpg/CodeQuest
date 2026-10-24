"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLessonIndex, lessons } from "@/content/lessons/catalog";
import type { CodeFile, Lesson, ProjectFiles } from "@/content/lessons/types";
import { buildPreviewDocument, errorLine, type PreviewMessage } from "@/lib/preview/buildDocument";
import { explainError } from "@/lib/preview/explainError";
import { isUnlocked, progressStore, type QuizScore } from "@/lib/progress/store";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";
import { lessonCheckpoint, lessonStarter } from "@/lib/lessons/projectFlow";
import { GlossaryDrawer, GlossaryProvider } from "@/components/glossary/Glossary";
import { CodeEditor } from "./CodeEditor";
import { ConsolePanel, type ConsoleEntry } from "./ConsolePanel";
import { LessonPanel } from "./LessonPanel";
import { PreviewFrame } from "./PreviewFrame";
import { StudioHeader } from "./StudioHeader";
import { useCheckRunner } from "./useCheckRunner";

const slugs = lessons.map((l) => l.slug);
const PREVIEW_DELAY_MS = 450;
const DRAFT_DELAY_MS = 800;
const MAX_CONSOLE_ENTRIES = 200;

type MobileView = "lesson" | "code" | "result";

export function Studio({ slug }: { slug: string }) {
  const hydrated = useHydrated();
  const progress = useProgress();
  const index = getLessonIndex(slug);
  const lesson = lessons[index]!;

  if (!hydrated) {
    return (
      <div className="flex h-dvh items-center justify-center bg-paper text-muted" role="status">
        Открываю студию…
      </div>
    );
  }

  if (!isUnlocked(index, slugs, progress.completed)) {
    const prev = lessons[index - 1]!;
    return (
      <div className="flex h-dvh flex-col bg-paper">
        <StudioHeader currentIndex={index} completed={progress.completed} />
        <main className="m-auto max-w-md p-6 text-center">
          <h1 className="text-2xl font-bold">Урок {lesson.number} пока закрыт</h1>
          <p className="mt-3 text-[17px]">
            Он откроется, когда ты пройдёшь урок {prev.number} «{prev.title}».
          </p>
          <Link
            href={`/learn/${prev.slug}`}
            className="mt-6 inline-flex rounded-xl bg-route px-6 py-3 font-semibold text-white"
          >
            Перейти к уроку {prev.number}
          </Link>
        </main>
      </div>
    );
  }

  const results = Object.fromEntries(Object.entries(progress.results).map(([k, v]) => [k, v.files]));
  const starter = lessonStarter(lessons, index, results);

  return (
    <Workspace
      key={slug}
      lesson={lesson}
      index={index}
      completedSlugs={progress.completed}
      starter={starter}
      checkpoint={lessonCheckpoint(lessons, index)}
      initialFiles={progress.drafts[slug]?.files ?? starter}
      quizScore={progress.quiz[slug]}
    />
  );
}

type WorkspaceProps = {
  lesson: Lesson;
  index: number;
  completedSlugs: string[];
  /** стартовый код урока: для сквозного проекта — продолжение прошлого урока */
  starter: ProjectFiles;
  checkpoint: ProjectFiles | null;
  initialFiles: ProjectFiles;
  quizScore: QuizScore | undefined;
};

function Workspace({ lesson, index, completedSlugs, starter, checkpoint, initialFiles, quizScore }: WorkspaceProps) {
  // Стартовый код фиксируем при открытии урока: он не должен меняться,
  // пока ребёнок работает (например, после сохранения результата этого же урока).
  const [lessonStart] = useState(starter);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryTerm, setGlossaryTerm] = useState<string | null>(null);
  const glossaryApi = useMemo(
    () => ({
      openTerm: (id: string) => {
        setGlossaryTerm(id);
        setGlossaryOpen(true);
      },
    }),
    [],
  );
  const [files, setFiles] = useState<ProjectFiles>(initialFiles);
  const [activeFile, setActiveFile] = useState<CodeFile>(lesson.focusFile);
  const [preview, setPreview] = useState(() => ({ files: initialFiles, token: crypto.randomUUID() }));
  const [log, setLog] = useState<{ token: string; entries: ConsoleEntry[] }>({ token: "", entries: [] });
  const [hintsShown, setHintsShown] = useState(0);
  const [mobileView, setMobileView] = useState<MobileView>("lesson");
  const [resetKey, setResetKey] = useState(0);
  const [jumpTo, setJumpTo] = useState<{ file: CodeFile; line: number; nonce: number } | null>(null);
  const entryId = useRef(0);
  const runner = useCheckRunner();

  const built = useMemo(
    () => buildPreviewDocument(preview.files, { token: preview.token }),
    [preview],
  );

  // Обновляем предпросмотр, когда ребёнок перестал печатать.
  useEffect(() => {
    if (files === preview.files) return;
    const t = window.setTimeout(() => setPreview({ files, token: crypto.randomUUID() }), PREVIEW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [files, preview.files]);

  // Сохраняем черновик в этом браузере.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const unchanged = (Object.keys(files) as CodeFile[]).every((k) => files[k] === lessonStart[k]);
      if (unchanged) progressStore.clearDraft(lesson.slug);
      else progressStore.saveDraft(lesson.slug, files);
    }, DRAFT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [files, lesson, lessonStart]);

  // Засчитываем урок, когда все проверки пройдены.
  useEffect(() => {
    if (runner.outcome.status === "done" && runner.outcome.passed) {
      progressStore.markCompleted(lesson.slug, runner.outcome.files);
    }
  }, [runner.outcome, lesson.slug]);

  const pushEntry = useCallback(
    (token: string, entry: Omit<ConsoleEntry, "id">) => {
      setLog((prev) => {
        const base = prev.token === token ? prev.entries : [];
        const entries = [...base, { ...entry, id: entryId.current++ }].slice(-MAX_CONSOLE_ENTRIES);
        return { token, entries };
      });
    },
    [],
  );

  const handleMessage = (msg: PreviewMessage) => {
    if (msg.type === "console") {
      pushEntry(preview.token, { level: msg.level, text: msg.text });
    } else if (msg.type === "error") {
      pushEntry(preview.token, {
        level: "error",
        text: msg.message,
        explanation: explainError(msg.message),
        line: errorLine(built, msg.message, msg.line),
      });
    }
  };

  const entries: ConsoleEntry[] = useMemo(() => {
    const live = log.token === preview.token ? log.entries : [];
    if (!built.syntaxError) return live;
    const e = built.syntaxError;
    return [
      {
        id: -1,
        level: "error",
        text: `SyntaxError: ${e.message} (символ ${e.column})`,
        explanation: `${explainError(e.message)} JavaScript не запустился, пока ошибка не исправлена.`,
        line: e.line,
      },
      ...live,
    ];
  }, [log, preview.token, built.syntaxError]);

  const handleChange = useCallback((file: CodeFile, value: string) => {
    setFiles((f) => (f[file] === value ? f : { ...f, [file]: value }));
  }, []);

  const replaceCode = (next: ProjectFiles) => {
    setFiles(next);
    setPreview({ files: next, token: crypto.randomUUID() });
    setActiveFile(lesson.focusFile);
    setResetKey((k) => k + 1);
    runner.reset();
  };

  const handleReset = () => {
    replaceCode(lessonStart);
    progressStore.clearDraft(lesson.slug);
  };

  const handleCheckpoint = checkpoint ? () => replaceCode(checkpoint) : null;

  const handleCheck = () => {
    runner.start(files, lesson.checks);
    setMobileView("lesson");
  };

  const jumpToJsLine = (line: number) => {
    setActiveFile("js");
    setJumpTo({ file: "js", line, nonce: Date.now() });
    setMobileView("code");
  };

  const panel = (view: MobileView) =>
    `${mobileView === view ? "flex" : "hidden"} lg:flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface`;

  const nextLesson = lessons[index + 1] ?? null;

  return (
    <GlossaryProvider value={glossaryApi}>
    <div className="flex h-dvh flex-col bg-paper">
      <StudioHeader
        currentIndex={index}
        completed={completedSlugs}
        onOpenGlossary={() => {
          setGlossaryTerm(null);
          setGlossaryOpen(true);
        }}
      />

      <main className="grid min-h-0 flex-1 grid-rows-1 gap-3 p-2 pb-[calc(4.75rem+env(safe-area-inset-bottom))] sm:p-3 sm:pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)_minmax(0,1fr)] lg:pb-3">
        <section aria-label="Урок" className={panel("lesson")}>
          <LessonPanel
            lesson={lesson}
            total={lessons.length}
            completed={completedSlugs.includes(lesson.slug)}
            nextLesson={nextLesson}
            hintsShown={hintsShown}
            onShowHint={() => setHintsShown((n) => Math.min(n + 1, lesson.hints.length))}
            outcome={runner.outcome}
            onCheck={handleCheck}
            onReset={handleReset}
            onCheckpoint={handleCheckpoint}
            quizScore={quizScore}
            onQuizFinish={(score) => progressStore.saveQuiz(lesson.slug, score)}
          />
        </section>

        <section aria-label="Редактор кода" className={panel("code")}>
          <CodeEditor
            files={files}
            active={activeFile}
            onActiveChange={setActiveFile}
            onChange={handleChange}
            resetKey={resetKey}
            jumpTo={jumpTo}
          />
        </section>

        <section aria-label="Результат" className={panel("result")}>
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <h2 className="text-sm font-semibold text-muted">Результат</h2>
            <button
              type="button"
              onClick={() => setPreview({ files, token: crypto.randomUUID() })}
              className="rounded-lg px-2 py-1 text-sm font-semibold text-route hover:bg-route-soft"
            >
              Перезапустить
            </button>
          </div>
          <PreviewFrame
            key={preview.token}
            html={built.html}
            token={preview.token}
            title={`Результат урока ${lesson.number}`}
            onMessage={handleMessage}
            onNavigationBlocked={() =>
              pushEntry(preview.token, {
                level: "warn",
                text: "Страница попробовала перейти по другому адресу. В предпросмотре работает только твоя страница, поэтому она открыта заново.",
              })
            }
            className="min-h-0 w-full flex-1 bg-white"
          />
          <ConsolePanel entries={entries} onJumpToLine={jumpToJsLine} />
        </section>
      </main>

      <nav
        aria-label="Разделы студии"
        className="fixed inset-x-0 bottom-0 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {(
          [
            ["lesson", "Задание"],
            ["code", "Код"],
            ["result", "Результат"],
          ] as const
        ).map(([view, label]) => (
          <button
            key={view}
            type="button"
            aria-pressed={mobileView === view}
            onClick={() => setMobileView(view)}
            className={`flex h-16 flex-1 items-center justify-center text-[15px] font-semibold ${
              mobileView === view ? "text-route" : "text-muted"
            }`}
          >
            <span
              className={`rounded-full px-4 py-1.5 ${mobileView === view ? "bg-route-soft" : ""}`}
            >
              {label}
              {view === "result" && entries.some((e) => e.level === "error") && (
                <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-coral align-middle" aria-label="есть ошибки" />
              )}
            </span>
          </button>
        ))}
      </nav>

      {runner.frame}

      <GlossaryDrawer
        open={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        completed={completedSlugs}
        highlight={glossaryTerm}
      />
    </div>
    </GlossaryProvider>
  );
}
