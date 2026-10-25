import type { ProjectFiles } from "@/content/lessons/types";

/**
 * Клиент ИИ-наставника. Адрес функции задаётся при сборке (NEXT_PUBLIC_AI_MENTOR_URL).
 * Если адреса нет, наставник в студии не показывается вовсе.
 */
export const MENTOR_URL = process.env.NEXT_PUBLIC_AI_MENTOR_URL ?? "";
export const mentorEnabled = /^https:\/\/|^http:\/\/(localhost|127\.0\.0\.1)[:/]/.test(MENTOR_URL);

export type MentorRequest =
  | { mode: "explain-error"; files: ProjectFiles; lesson?: { title: string; goal: string }; error: { message: string; line?: number | null } }
  | { mode: "check-help"; files: ProjectFiles; lesson?: { title: string; goal: string }; failedChecks: { message: string }[] };

export type MentorResult =
  | { ok: true; answer: string; left: number | null }
  | { ok: false; kind: "code" | "limit" | "other"; message: string };

export async function askMentor(req: MentorRequest, code: string, fetchFn: typeof fetch = fetch): Promise<MentorResult> {
  try {
    // text/plain — «простой» запрос: браузеру не нужен предварительный CORS-запрос.
    const res = await fetchFn(MENTOR_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ ...req, code }),
      signal: AbortSignal.timeout(35_000),
    });
    const data = (await res.json().catch(() => ({}))) as { answer?: string; left?: number; message?: string; error?: string };
    if (res.ok && typeof data.answer === "string" && data.answer.trim()) {
      return { ok: true, answer: data.answer.trim().slice(0, 1500), left: typeof data.left === "number" ? data.left : null };
    }
    const kind = res.status === 401 ? "code" : res.status === 429 ? "limit" : "other";
    return { ok: false, kind, message: data.message || "Наставник сейчас не отвечает. Попробуй чуть позже." };
  } catch {
    return { ok: false, kind: "other", message: "Не получилось связаться с наставником. Проверь интернет и попробуй ещё раз." };
  }
}
