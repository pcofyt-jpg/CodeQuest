import type { Check, CheckResult, ProjectFiles } from "@/content/lessons/types";
import { isDomCheck } from "@/lib/preview/buildDocument";

/** Проверяет исходный код регулярным выражением. Без выполнения кода. */
export function runSourceCheck(check: Extract<Check, { kind: "source" }>, files: ProjectFiles): boolean {
  // Комментарии не считаются: ребёнок не должен пройти задание кодом в комментарии.
  const code = stripComments(files[check.file], check.file);
  const flags = check.flags?.includes("g") ? check.flags : `${check.flags ?? ""}g`;
  const matches = code.match(new RegExp(check.pattern, flags));
  return (matches?.length ?? 0) >= (check.minMatches ?? 1);
}

export function stripComments(code: string, file: "html" | "css" | "js"): string {
  if (file === "html") return code.replace(/<!--[\s\S]*?-->/g, "");
  if (file === "css") return code.replace(/\/\*[\s\S]*?\*\//g, "");
  // Простое удаление комментариев JS. Строки с // внутри кавычек могут
  // обрезаться, но для учебных проверок этого достаточно.
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}

/**
 * Объединяет результаты: DOM-проверки пришли из предпросмотра (по порядку),
 * проверки исходного кода и отсутствия ошибок считаются здесь.
 */
export function combineResults(
  checks: Check[],
  domResults: boolean[],
  files: ProjectFiles,
  errorCount: number,
): CheckResult[] {
  let domIndex = 0;
  return checks.map((check) => {
    let ok: boolean;
    if (isDomCheck(check)) {
      ok = domResults[domIndex++] === true;
    } else if (check.kind === "source") {
      ok = runSourceCheck(check, files);
    } else {
      ok = errorCount === 0;
    }
    return { ok, message: check.message };
  });
}
