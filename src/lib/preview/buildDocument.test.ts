import { describe, expect, it } from "vitest";
import { buildPreviewDocument, PREVIEW_CSP, toUserJsLine } from "./buildDocument";

const files = { html: "<h1>Привет</h1>", css: "h1 { color: red; }", js: "const a = 1;\nconsole.log(a);" };

describe("buildPreviewDocument", () => {
  it("встраивает CSP, запрещающую сеть", () => {
    const built = buildPreviewDocument(files, { token: "t1" });
    expect(built.html).toContain(PREVIEW_CSP);
    expect(PREVIEW_CSP).toContain("connect-src 'none'");
    expect(PREVIEW_CSP).toContain("default-src 'none'");
  });

  it("правильно переводит номера строк JS", () => {
    const built = buildPreviewDocument(files, { token: "t1" });
    const lines = built.html.split("\n");
    const docLine = lines.findIndex((l) => l.includes("console.log(a)")) + 1;
    expect(toUserJsLine(built, docLine)).toBe(2);
    expect(toUserJsLine(built, 1)).toBeNull();
  });

  it("не даёт тексту закрыть служебные теги", () => {
    const built = buildPreviewDocument(
      { html: "", css: "</style><script>x()</script>", js: 'const s = "</script><b>";' },
      { token: "t" },
    );
    expect(built.html).not.toMatch(/<\/style><script>x\(\)/);
    expect(built.html).toContain('"<\\/script><b>"');
  });

  it("при синтаксической ошибке не вставляет JS и возвращает ошибку", () => {
    const built = buildPreviewDocument({ ...files, js: "uniqueMarker42(" }, { token: "t" });
    expect(built.syntaxError).not.toBeNull();
    expect(built.html).not.toContain("uniqueMarker42");
  });

  it("экранирует токен и проверки внутри скрипта", () => {
    const built = buildPreviewDocument(files, {
      token: "</script>",
      checks: [{ kind: "exists", selector: "h1", message: "</script>" }],
    });
    const scripts = built.html.match(/<\/script>/g) ?? [];
    expect(scripts.length).toBe(2); // только наши два закрывающих тега
  });
});

describe("errorLine", () => {
  it("для остановленного цикла указывает строку цикла в файле ребёнка", async () => {
    const { errorLine } = await import("./buildDocument");
    const built = buildPreviewDocument({ html: "", css: "", js: "let n = 0;\nwhile (true) {\n  n++;\n}" }, { token: "t" });
    expect(errorLine(built, "Uncaught Error: __CQ_INFINITE_LOOP__:0", 5)).toBe(2);
  });
});
