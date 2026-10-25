"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getLessonIndex, lessons } from "@/content/lessons/catalog";
import type { CodeFile, Lesson, ProjectFiles } from "@/content/lessons/types";
import { downloadSite } from "@/lib/export/site";
import { isUnlocked, progressStore, type QuizScore } from "@/lib/progress/store";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";
import { lessonCheckpoint, lessonStarter } from "@/lib/lessons/projectFlow";
import { GlossaryDrawer, GlossaryProvider } from "@/components/glossary/Glossary";
import { CodeEditor } from "./CodeEditor";
import { ResultPanel } from "./ResultPanel";
import { usePreviewSession } from "./usePreviewSession";
import { LessonPanel } from "./LessonPanel";
import { StudioHeader } from "./StudioHeader";
import { useCheckRunner } from "./useCheckRunner";

const slugs = lessons.map((l) => l.slug);
const DRAFT_DELAY_MS = 800;

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
  const [hintsShown, setHintsShown] = useState(0);
  const [mobileView, setMobileView] = useState<MobileView>("lesson");
  const [resetKey, setResetKey] = useState(0);
  const [jumpTo, setJumpTo] = useState<{ file: CodeFile; line: number; nonce: number } | null>(null);
  const runner = useCheckRunner();
  const session = usePreviewSession(files);

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

  const handleChange = useCallback((file: CodeFile, value: string) => {
    setFiles((f) => (f[file] === value ? f : { ...f, [file]: value }));
  }, []);

  const replaceCode = (next: ProjectFiles) => {
    setFiles(next);
    session.restart(next);
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
            mentorCheckRequest={(failed) => ({
              mode: "check-help",
              files,
              lesson: { title: lesson.title, goal: lesson.goal },
              failedChecks: failed.map((r) => ({ message: r.message })),
            })}
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
          <ResultPanel
            session={session}
            title={`Результат урока ${lesson.number}`}
            onRestart={() => session.restart(files)}
            onJumpToLine={jumpToJsLine}
            mentorRequest={(entry) => ({
              mode: "explain-error",
              files,
              lesson: { title: lesson.title, goal: lesson.goal },
              error: { message: entry.text, line: entry.line },
            })}
            actions={
              lesson.track === "project" ? (
                <button
                  type="button"
                  onClick={() => downloadSite("Мой сайт", files)}
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-route hover:bg-route-soft"
                >
                  Скачать сайт
                </button>
              ) : null
            }
          />
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
              {view === "result" && session.entries.some((e) => e.level === "error") && (
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
