#!/usr/bin/env node
/**
 * Копирует файлы Python (Pyodide) из node_modules в public/pyodide,
 * чтобы сайт отдавал их сам, без внешних CDN. Запускается перед dev и build.
 * В репозиторий эти файлы не попадают (.gitignore) — они берутся из установленного пакета.
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const FILES = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
const from = join("node_modules", "pyodide");
const to = join("public", "pyodide");
mkdirSync(to, { recursive: true });
let bytes = 0;
for (const f of FILES) {
  const src = join(from, f);
  if (!existsSync(src)) {
    console.error(`Нет файла ${src}. Выполните npm install.`);
    process.exit(1);
  }
  copyFileSync(src, join(to, f));
  bytes += statSync(src).size;
}
console.log(`Python (Pyodide) скопирован в public/pyodide: ${(bytes / 1e6).toFixed(1)} МБ`);
