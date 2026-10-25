import type { ProjectFiles } from "@/content/lessons/types";
import { MAX_FILE_CHARS } from "@/lib/progress/store";

/**
 * «Мои проекты» — свободные проекты ребёнка вне уроков.
 * Как и прогресс, хранятся только в этом браузере (и в файле резервной копии).
 */
export type Project = {
  id: string;
  name: string;
  files: ProjectFiles;
  createdAt: number;
  updatedAt: number;
};

export const PROJECTS_KEY = "codequest:projects:v1";
export const MAX_PROJECTS = 50;
export const MAX_NAME = 60;

const EMPTY: Project[] = Object.freeze([]) as unknown as Project[];

function isFiles(v: unknown): v is ProjectFiles {
  if (typeof v !== "object" || v === null) return false;
  const f = v as Record<string, unknown>;
  return (["html", "css", "js"] as const).every((k) => typeof f[k] === "string" && (f[k] as string).length <= MAX_FILE_CHARS);
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, MAX_NAME) || "Без названия";
}

/** Разбирает список проектов, отбрасывая всё подозрительное. */
export function parseProjects(value: unknown): Project[] {
  if (!Array.isArray(value)) return [];
  const out: Project[] = [];
  const ids = new Set<string>();
  for (const v of value.slice(0, MAX_PROJECTS)) {
    const p = v as Record<string, unknown> | null;
    if (!p || typeof p.id !== "string" || !/^[a-z0-9-]{1,64}$/.test(p.id) || ids.has(p.id)) continue;
    if (typeof p.name !== "string" || !isFiles(p.files)) continue;
    if (typeof p.createdAt !== "number" || typeof p.updatedAt !== "number") continue;
    ids.add(p.id);
    out.push({ id: p.id, name: cleanName(p.name), files: p.files, createdAt: p.createdAt, updatedAt: p.updatedAt });
  }
  return out;
}

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: Project[] | null = null;

function read(): Project[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY);
    cache = raw ? parseProjects((JSON.parse(raw) as { projects?: unknown }).projects) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Project[]) {
  cache = next;
  try {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify({ version: 1, projects: next }));
  } catch {
    // не удалось сохранить: проекты останутся до перезагрузки страницы
  }
  listeners.forEach((l) => l());
}

export const projectsStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROJECTS_KEY) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: read,
  getServerSnapshot: () => EMPTY,

  /** Создаёт проект и возвращает его id; null — если проектов слишком много. */
  create(name: string, files: ProjectFiles): string | null {
    const cur = read();
    if (cur.length >= MAX_PROJECTS || !isFiles(files)) return null;
    const now = Date.now();
    const id = crypto.randomUUID();
    write([{ id, name: cleanName(name), files, createdAt: now, updatedAt: now }, ...cur]);
    return id;
  },
  update(id: string, files: ProjectFiles) {
    if (!isFiles(files)) return;
    write(read().map((p) => (p.id === id ? { ...p, files, updatedAt: Date.now() } : p)));
  },
  rename(id: string, name: string) {
    write(read().map((p) => (p.id === id ? { ...p, name: cleanName(name), updatedAt: Date.now() } : p)));
  },
  remove(id: string) {
    write(read().filter((p) => p.id !== id));
  },
  replaceAll(projects: Project[]) {
    write(parseProjects(projects));
  },
};
