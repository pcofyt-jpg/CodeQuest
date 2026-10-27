"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { lessons } from "@/content/lessons/catalog";
import { useHydrated, useProgress } from "@/lib/progress/useProgress";
import { MAX_PROJECTS, projectsStore } from "@/lib/projects/store";
import { useProjects } from "@/lib/projects/useProjects";
import { templates } from "@/content/templates";

const BLANK = {
  html: "<!-- Здесь начинается твой проект -->\n<h1>Новый проект</h1>\n",
  css: "body {\n  font-family: sans-serif;\n}\n",
  js: "",
};

export function ProjectsPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const projects = useProjects();
  const progress = useProgress();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Самый свежий результат уроков проекта — «мой сайт из курса 1».
  const projectLessons = lessons.filter((l) => l.track === "project").map((l) => l.slug);
  const latestSite = Object.entries(progress.results)
    .filter(([slug]) => projectLessons.includes(slug))
    .sort((a, b) => b[1].savedAt - a[1].savedAt)[0];

  const create = (name: string, files: typeof BLANK) => {
    const id = projectsStore.create(name, files);
    if (!id) {
      setError(`Можно хранить до ${MAX_PROJECTS} проектов. Удали ненужный, чтобы создать новый.`);
      return;
    }
    router.push(`/proekt/?id=${id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-8">
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="CodeQuest — к маршруту" className="rounded-lg">
          <Logo size="lg" />
        </Link>
        <Link href="/" className="text-sm font-semibold text-route underline-offset-4 hover:underline">
          К маршруту
        </Link>
      </header>

      <h1 className="mt-10 text-[2rem] leading-tight font-extrabold tracking-tight">Мои проекты</h1>
      <p className="mt-3 text-[17px] leading-relaxed">
        Здесь можно делать что угодно — без заданий и проверок. Придумай сайт или игру и попробуй собрать сам.
        Если забыл, как что-то пишется, загляни в шпаргалку.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => create("Новый проект", BLANK)}
          className="rounded-xl bg-route px-5 py-3 font-semibold text-white"
        >
          Новый проект
        </button>
        {hydrated && latestSite && (
          <button
            type="button"
            onClick={() => create("Мой сайт", latestSite[1].files)}
            className="rounded-xl border border-line bg-surface px-5 py-3 font-semibold text-ink hover:border-route"
          >
            Продолжить мой сайт из уроков
          </button>
        )}
      </div>
      <section aria-labelledby="templates-title" className="mt-8">
        <h2 id="templates-title" className="text-lg font-bold">
          Начать с шаблона
        </h2>
        <p className="mt-1 text-[15px] text-muted">Готовая рабочая заготовка — переделай её под себя.</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {templates.map((t) => (
            <li key={t.id} className="flex flex-col rounded-2xl border border-line bg-surface p-4">
              <p className="font-bold">{t.title}</p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{t.description}</p>
              <button
                type="button"
                onClick={() => create(t.title, t.files)}
                className="mt-3 rounded-lg border border-route px-3 py-1.5 text-sm font-semibold text-route hover:bg-route-soft"
              >
                Начать «{t.title}»
              </button>
            </li>
          ))}
        </ul>
      </section>

      {error && (
        <p role="alert" className="mt-3 text-coral">
          {error}
        </p>
      )}

      <section aria-label="Список проектов" className={`mt-8 space-y-3 ${hydrated ? "" : "opacity-0"}`}>
        {projects.length === 0 ? (
          <p className="text-muted">Пока проектов нет. Создай первый!</p>
        ) : (
          projects.map((p) => (
            <article key={p.id} className="rounded-2xl border border-line bg-surface p-4">
              {editing === p.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = new FormData(e.currentTarget).get("name");
                    projectsStore.rename(p.id, String(name ?? ""));
                    setEditing(null);
                  }}
                  className="flex flex-wrap gap-2"
                >
                  <label className="sr-only" htmlFor={`name-${p.id}`}>
                    Название проекта
                  </label>
                  <input
                    id={`name-${p.id}`}
                    name="name"
                    defaultValue={p.name}
                    maxLength={60}
                    autoFocus
                    className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2"
                  />
                  <button type="submit" className="rounded-lg bg-ink px-4 py-2 font-semibold text-white">
                    Сохранить
                  </button>
                </form>
              ) : (
                <Link href={`/proekt/?id=${p.id}`} className="text-lg font-bold underline-offset-4 hover:underline">
                  {p.name}
                </Link>
              )}
              <p className="mt-1 text-sm text-muted">
                Изменён {new Date(p.updatedAt).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold">
                <button type="button" className="text-route" onClick={() => setEditing(p.id)}>
                  Переименовать
                </button>
                {confirmDelete === p.id ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-normal">Удалить проект навсегда?</span>
                    <button
                      type="button"
                      className="text-coral"
                      onClick={() => {
                        projectsStore.remove(p.id);
                        setConfirmDelete(null);
                      }}
                    >
                      Удалить
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(null)}>
                      Оставить
                    </button>
                  </span>
                ) : (
                  <button type="button" className="text-muted hover:text-ink" onClick={() => setConfirmDelete(p.id)}>
                    Удалить
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
