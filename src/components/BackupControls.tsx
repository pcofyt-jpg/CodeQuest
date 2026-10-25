"use client";

import { useRef, useState } from "react";
import { makeBackup, parseBackup, type ParsedBackup } from "@/lib/backup";
import { downloadFile } from "@/lib/export/site";
import { progressStore } from "@/lib/progress/store";
import { useProgress } from "@/lib/progress/useProgress";
import { projectsStore } from "@/lib/projects/store";
import { useProjects } from "@/lib/projects/useProjects";

/** Перенос прогресса и проектов на другое устройство через файл. Файл никуда не отправляется. */
export function BackupControls() {
  const progress = useProgress();
  const projects = useProjects();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Extract<ParsedBackup, { ok: true }> | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(`codequest-progress-${date}.json`, makeBackup(progress, projects), "application/json");
    setMessage({ ok: true, text: "Файл сохранён. Открой студию на другом устройстве и загрузи его там." });
  };

  const onFile = async (file: File | undefined) => {
    setMessage(null);
    setPending(null);
    if (!file) return;
    const parsed = parseBackup(await file.text());
    if (!parsed.ok) setMessage({ ok: false, text: parsed.reason });
    else setPending(parsed);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section aria-labelledby="backup-title" className="mt-4">
      <h2 id="backup-title" className="font-semibold text-ink">
        Перенести на другое устройство
      </h2>
      <p className="mt-1">Сохрани прогресс и проекты в файл, а на другом устройстве загрузи его.</p>
      <div className="mt-2 flex flex-wrap gap-3 font-semibold">
        <button type="button" onClick={save} className="text-route underline-offset-4 hover:underline">
          Сохранить в файл
        </button>
        <button type="button" onClick={() => inputRef.current?.click()} className="text-route underline-offset-4 hover:underline">
          Загрузить из файла
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          aria-label="Файл прогресса"
          tabIndex={-1}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      {pending && (
        <div role="alert" className="mt-3 rounded-xl border border-line bg-surface p-3 text-ink">
          <p>
            В файле: пройдено уроков — {pending.progress.completed.length}, проектов — {pending.projects.length}.
            Заменить ими то, что сейчас в этом браузере?
          </p>
          <div className="mt-2 flex gap-3 font-semibold">
            <button
              type="button"
              className="text-coral"
              onClick={() => {
                progressStore.replaceAll(pending.progress);
                projectsStore.replaceAll(pending.projects);
                setPending(null);
                setMessage({ ok: true, text: "Готово! Прогресс и проекты загружены." });
              }}
            >
              Заменить
            </button>
            <button type="button" onClick={() => setPending(null)}>
              Отмена
            </button>
          </div>
        </div>
      )}
      {message && (
        <p role="status" className={`mt-2 ${message.ok ? "text-mint" : "text-coral"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
