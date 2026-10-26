import type { ProjectFiles } from "@/content/lessons/types";
import { resolveLibraryImages } from "@/content/images";

/**
 * «Скачать мой сайт»: собирает код ребёнка в один HTML-файл, который открывается
 * в любом браузере без студии. Это его собственный код на его компьютере,
 * поэтому песочница здесь не нужна; служебный код студии в файл не попадает.
 */
export function buildStandaloneHtml(title: string, files: ProjectFiles): string {
  const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  // Картинки из библиотеки встраиваются в файл — сайт работает без студии и без интернета.
  const css = resolveLibraryImages(files.css).replace(/<\/style/gi, "<\\/style");
  const js = resolveLibraryImages(files.js).replace(/<\/script/gi, "<\\/script");
  const html = resolveLibraryImages(files.html);
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
${css}
</style>
</head>
<body>
${html}
<script>
${js}
</script>
</body>
</html>
`;
}

/** Имя файла из названия: буквы, цифры и дефисы. */
export function safeFileName(name: string, ext: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "moy-sayt"}.${ext}`;
}

export function downloadFile(fileName: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSite(title: string, files: ProjectFiles) {
  downloadFile(safeFileName(title, "html"), buildStandaloneHtml(title, files), "text/html;charset=utf-8");
}
