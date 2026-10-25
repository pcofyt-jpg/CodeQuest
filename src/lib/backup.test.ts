import { describe, expect, it } from "vitest";
import { makeBackup, parseBackup } from "./backup";
import { EMPTY_PROGRESS } from "./progress/store";
import { buildStandaloneHtml, safeFileName } from "./export/site";

const files = { html: "<h1>Мой сайт</h1>", css: "h1 { color: red; }", js: "console.log(1);" };

describe("резервная копия", () => {
  it("сохраняет и восстанавливает прогресс и проекты", () => {
    const progress = { ...EMPTY_PROGRESS, completed: ["zagolovok"], quiz: { zagolovok: { correct: 2, total: 2 } } };
    const projects = [{ id: "a1", name: "Игра", files, createdAt: 1, updatedAt: 2 }];
    const parsed = parseBackup(makeBackup(progress, projects));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.progress.completed).toEqual(["zagolovok"]);
      expect(parsed.projects).toHaveLength(1);
      expect(parsed.projects[0]!.files.html).toBe(files.html);
    }
  });

  it("отклоняет чужие и испорченные файлы с понятной причиной", () => {
    expect(parseBackup("не json").ok).toBe(false);
    expect(parseBackup(JSON.stringify({ kind: "other" })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ kind: "codequest-backup", version: 99 })).ok).toBe(false);
    const bad = parseBackup(
      JSON.stringify({ kind: "codequest-backup", version: 1, progress: { version: 2, completed: [1, "x"] }, projects: [{ id: "../x" }] }),
    );
    expect(bad.ok && bad.progress.completed).toEqual(["x"]);
    expect(bad.ok && bad.projects).toEqual([]);
  });
});

describe("скачивание сайта", () => {
  it("собирает самостоятельный HTML без служебного кода студии", () => {
    const html = buildStandaloneHtml("Мой <сайт>", { ...files, js: 'const s = "</script>";' });
    expect(html).toContain("<title>Мой &lt;сайт&gt;</title>");
    expect(html).toContain("<h1>Мой сайт</h1>");
    expect(html).not.toContain("__cqLoop");
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });

  it("делает безопасное имя файла", () => {
    expect(safeFileName("Мой кот Барсик!", "html")).toBe("мой-кот-барсик.html");
    expect(safeFileName("  ../../  ", "html")).toBe("moy-sayt.html");
  });
});
