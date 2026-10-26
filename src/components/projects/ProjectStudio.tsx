"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { GlossaryDrawer, GlossaryProvider } from "@/components/glossary/Glossary";
import { CodeEditor } from "@/components/studio/CodeEditor";
import { ImagesDrawer } from "@/components/images/ImagesDrawer";
import { ResultPanel } from "@/components/studio/ResultPanel";
import { usePreviewSession } from "@/components/studio/usePreviewSession";
import type { CodeFile, ProjectFiles } from "@/content/lessons/types";
import { downloadSite } from "@/lib/export/site";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";
import { projectsStore, type Project } from "@/lib/projects/store";
import { useProjects } from "@/lib/projects/useProjects";

const SAVE_DELAY_MS = 800;

export function ProjectStudio() {
  const hydrated = useHydrated();
  const projects = useProjects();
  const id = useSearchParams().get("id");
  const project = projects.find((p) => p.id === id);

  if (!hydrated) {
    return (
      <div className="flex h-dvh items-center justify-center text-muted" role="status">
        Открываю проект…
      </div>
    );
  }
  if (!project) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Проект не найден</h1>
        <p className="text-[17px]">Возможно, он был удалён или сохранён в другом браузере.</p>
        <Link href="/proekty/" className="rounded-xl bg-route px-6 py-3 font-semibold text-white">
          Мои проекты
        </Link>
      </main>
    );
  }
  return <ProjectWorkspace key={project.id} project={project} />;
}

function ProjectWorkspace({ project }: { project: Project }) {
  const progress = useProgress();
  const [files, setFiles] = useState<ProjectFiles>(project.files);
  const [activeFile, setActiveFile] = useState<CodeFile>("html");
  const [mobileView, setMobileView] = useState<"code" | "result">("code");
  const [jumpTo, setJumpTo] = useState<{ file: CodeFile; line: number; nonce: number } | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [glossaryTerm, setGlossaryTerm] = useState<string | null>(null);
  const session = usePreviewSession(files);

  const glossaryApi = useMemo(
    () => ({
      openTerm: (termId: string) => {
        setGlossaryTerm(termId);
        setGlossaryOpen(true);
      },
    }),
    [],
  );

  // Сохраняем проект, когда ребёнок перестал печатать.
  useEffect(() => {
    if (files === project.files) return;
    const t = window.setTimeout(() => projectsStore.update(project.id, files), SAVE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [files, project.id, project.files]);

  const handleChange = useCallback((file: CodeFile, value: string) => {
    setFiles((f) => (f[file] === value ? f : { ...f, [file]: value }));
  }, []);

  const panel = (view: "code" | "result") =>
    `${mobileView === view ? "flex" : "hidden"} lg:flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface`;

  return (
    <GlossaryProvider value={glossaryApi}>
      <div className="flex h-dvh flex-col bg-paper">
        <header className="flex items-center gap-3 border-b border-line bg-surface px-3 py-2 sm:px-4">
          <Link href="/" className="shrink-0 rounded-lg" aria-label="CodeQuest — к маршруту">
            <Logo />
          </Link>
          <p className="min-w-0 flex-1 truncate font-semibold" title={project.name}>
            {project.name}
          </p>
          <button
            type="button"
            onClick={() => {
              setGlossaryTerm(null);
              setGlossaryOpen(true);
            }}
            className="rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:bg-paper"
          >
            Шпаргалка
          </button>
          <Link
            href="/proekty/"
            className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-route hover:bg-route-soft sm:inline"
          >
            Мои проекты
          </Link>
        </header>

        <main className="grid min-h-0 flex-1 grid-rows-1 gap-3 p-2 pb-[calc(4.75rem+env(safe-area-inset-bottom))] sm:p-3 sm:pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:grid-cols-2 lg:pb-3">
          <section aria-label="Редактор кода" className={panel("code")}>
            <CodeEditor
              files={files}
              active={activeFile}
              onActiveChange={setActiveFile}
              onChange={handleChange}
              resetKey={0}
              jumpTo={jumpTo}
              toolbar={
                <button
                  type="button"
                  onClick={() => setImagesOpen(true)}
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-route hover:bg-route-soft"
                >
                  Картинки
                </button>
              }
            />
          </section>
          <section aria-label="Результат" className={panel("result")}>
            <ResultPanel
              session={session}
              title={`Результат проекта ${project.name}`}
              onRestart={() => session.restart(files)}
              mentorRequest={(entry) => ({
                mode: "explain-error",
                files,
                error: { message: entry.text, line: entry.line },
              })}
              onJumpToLine={(line) => {
                setActiveFile("js");
                setJumpTo({ file: "js", line, nonce: Date.now() });
                setMobileView("code");
              }}
              actions={
                <button
                  type="button"
                  onClick={() => downloadSite(project.name, files)}
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-route hover:bg-route-soft"
                >
                  Скачать сайт
                </button>
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
              <span className={`rounded-full px-4 py-1.5 ${mobileView === view ? "bg-route-soft" : ""}`}>{label}</span>
            </button>
          ))}
        </nav>

        <ImagesDrawer open={imagesOpen} onClose={() => setImagesOpen(false)} />

        <GlossaryDrawer
          open={glossaryOpen}
          onClose={() => setGlossaryOpen(false)}
          completed={progress.completed}
          highlight={glossaryTerm}
        />
      </div>
    </GlossaryProvider>
  );
}
