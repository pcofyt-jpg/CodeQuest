import type { Check, ProjectFiles } from "@/content/lessons/types";
import { INFINITE_LOOP_MARKER, loopRuntime, parseLoopError, protectLoops } from "./loopProtect";
import { resolveLibraryImages } from "@/content/images";

/**
 * Собирает HTML-документ, который загружается в изолированный iframe.
 *
 * Слои защиты (подробно — docs/adr/0001-preview-isolation.md):
 *  1. iframe sandbox="allow-scripts" без allow-same-origin → непрозрачный origin:
 *     нет доступа к DOM, cookies и localStorage приложения;
 *  2. CSP внутри документа: никаких сетевых запросов и внешних ресурсов;
 *  3. CSP приложения frame-src 'none': фрейм не может уйти на чужой сайт;
 *  4. защита циклов: зависший цикл прерывается, а не замораживает студию.
 */

export const PREVIEW_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "media-src data: blob:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join("; ");

export const LOOP_LIMIT_MS = 1000;

/** Проверки, которые выполняются внутри предпросмотра (им нужен живой DOM). */
export type DomCheck = Exclude<Check, { kind: "source" } | { kind: "noErrors" }>;

export function isDomCheck(check: Check): check is DomCheck {
  return check.kind !== "source" && check.kind !== "noErrors";
}

export type PreviewMessage =
  | { type: "console"; level: "log" | "info" | "warn" | "error" | "alert"; text: string }
  | { type: "error"; message: string; line: number; column: number }
  | { type: "checks"; results: boolean[] }
  /** документ ребёнка полностью загрузился (а не чужая страница) */
  | { type: "loaded" };

export type BuiltPreview = {
  html: string;
  /** строка документа, с которой начинается JS ребёнка (для перевода номеров строк) */
  jsStartLine: number;
  jsLineCount: number;
  /** строка в JS ребёнка для каждого цикла (для ошибки «бесконечный цикл») */
  loopLines: number[];
  syntaxError: { message: string; line: number; column: number } | null;
};

/** Безопасно встраивает JSON внутрь <script>. */
function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, " ");
}

/** Не даёт тексту ребёнка случайно закрыть служебный тег раньше времени. */
function escapeClosingTag(text: string, tag: "style" | "script"): string {
  return text.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);
}

function bridgeScript(config: { token: string; checks: DomCheck[] | null; marker: string }): string {
  return `(function (cfg) {
  "use strict";
  var parentWin = window.parent;
  function send(msg) {
    msg.cq = "preview"; msg.token = cfg.token;
    try { parentWin.postMessage(msg, "*"); } catch (e) {}
  }
  function fmt(v) {
    try {
      if (typeof v === "string") return v;
      if (v instanceof Error) return v.name + ": " + v.message;
      if (typeof Element !== "undefined" && v instanceof Element) return "<" + v.tagName.toLowerCase() + ">";
      if (typeof v === "function") return "функция " + (v.name || "");
      var s = JSON.stringify(v);
      return s === undefined ? String(v) : s;
    } catch (e) { return String(v); }
  }
  var sent = 0;
  function sendConsole(level, text) {
    if (sent++ > 300) return;
    send({ type: "console", level: level, text: String(text).slice(0, 1000) });
  }
  ["log", "info", "warn", "error"].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      sendConsole(level, Array.prototype.map.call(arguments, fmt).join(" "));
      try { original.apply(console, arguments); } catch (e) {}
    };
  });
  window.addEventListener("error", function (e) {
    var message = String(e.message || "Ошибка");
    var at = message.indexOf(cfg.marker);
    if (at !== -1) message = message.slice(at);
    send({ type: "error", message: message, line: e.lineno || 0, column: e.colno || 0 });
  });
  window.addEventListener("unhandledrejection", function (e) {
    send({ type: "error", message: "Ошибка в обещании (Promise): " + fmt(e.reason), line: 0, column: 0 });
  });

  // Модальные окна в песочнице запрещены — показываем сообщение прямо на странице.
  function toast(text) {
    var box = document.createElement("div");
    box.textContent = text;
    box.setAttribute("style", "position:fixed;left:12px;right:12px;bottom:12px;padding:12px 14px;border-radius:10px;background:#1b2440;color:#fff;font:15px/1.4 system-ui,sans-serif;z-index:2147483647;box-shadow:0 6px 20px rgba(0,0,0,.25)");
    (document.body || document.documentElement).appendChild(box);
    setTimeout(function () { box.remove(); }, 3000);
  }
  window.alert = function (m) { sendConsole("alert", fmt(m)); toast(fmt(m)); };
  window.confirm = function () { sendConsole("warn", "confirm() в предпросмотре не работает и всегда возвращает false."); return false; };
  window.prompt = function () { sendConsole("warn", "prompt() в предпросмотре не работает и всегда возвращает null."); return null; };

  // Ссылки на другие страницы не открываем (а внешние ещё и блокирует CSP приложения).
  document.addEventListener("click", function (e) {
    var t = e.target;
    var a = t && t.closest ? t.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.charAt(0) !== "#") {
      e.preventDefault();
      sendConsole("warn", "Ссылка «" + href + "» не открывается в предпросмотре — здесь работает только твоя страница.");
    }
  }, true);

  window.addEventListener("load", function () { send({ type: "loaded" }); });

  if (!cfg.checks) return;

  // Проверка не должна зависеть от таймеров: браузер может сильно замедлять их
  // в невидимых фреймах (энергосбережение, фоновая вкладка). Обработчики кликов
  // срабатывают сразу, поэтому текст читаем без ожидания, а «уступить ход»
  // браузеру помогает MessageChannel — его не замедляют как setTimeout.
  function yieldTask() {
    return new Promise(function (r) {
      var ch = new MessageChannel();
      ch.port1.onmessage = function () { r(); };
      ch.port2.postMessage(0);
    });
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function textOf(sel) { var el = document.querySelector(sel); return el ? (el.textContent || "").trim() : null; }
  /** Ждёт, пока текст изменится: сразу, после хода браузера и, в крайнем случае, после короткого таймера. */
  async function textAfterClick(sel, before) {
    var t = textOf(sel);
    if (t !== before) return t;
    await yieldTask();
    t = textOf(sel);
    if (t !== before) return t;
    await wait(50); // для обработчиков, которые сами меняют текст через setTimeout
    return textOf(sel);
  }
  async function runOne(c) {
    var el;
    switch (c.kind) {
      case "exists":
        return !!document.querySelector(c.selector);
      case "text":
        var t = textOf(c.selector);
        if (t === null) return false;
        if (c.minLength && t.length < c.minLength) return false;
        if (c.notEquals && c.notEquals.some(function (x) { return x.trim().toLowerCase() === t.toLowerCase(); })) return false;
        return true;
      case "styleNot":
        el = document.querySelector(c.selector);
        if (!el) return false;
        var v = getComputedStyle(el).getPropertyValue(c.property).trim();
        return c.values.indexOf(v) === -1;
      case "clickChangesText":
        el = document.querySelector(c.click);
        var before = textOf(c.watch);
        if (!el || before === null) return false;
        el.click();
        return (await textAfterClick(c.watch, before)) !== before;
      case "clickSequence":
        el = document.querySelector(c.click);
        if (!el) return false;
        for (var i = 0; i < c.expect.length; i++) {
          var prev = textOf(c.watch);
          el.click();
          if ((await textAfterClick(c.watch, prev)) !== c.expect[i]) return false;
        }
        return true;
      case "count":
        return document.querySelectorAll(c.selector).length >= c.min;
      case "styleIs":
        el = document.querySelector(c.selector);
        if (!el) return false;
        return c.values.indexOf(getComputedStyle(el).getPropertyValue(c.property).trim()) !== -1;
      case "attr":
        el = document.querySelector(c.selector);
        if (!el) return false;
        var val = (el.getAttribute(c.attribute) || "").trim();
        if (c.minLength && val.length < c.minLength) return false;
        if (c.pattern && !new RegExp(c.pattern).test(val)) return false;
        return val.length > 0;
      case "anchorsResolve":
        var box = document.querySelector(c.selector);
        if (!box) return false;
        var links = box.querySelectorAll('a[href^="#"]');
        if (links.length < c.min) return false;
        for (var a = 0; a < links.length; a++) {
          var id = decodeURIComponent((links[a].getAttribute("href") || "").slice(1));
          if (!id || !document.getElementById(id)) return false;
        }
        return true;
      case "noOverflow":
        return document.documentElement.scrollWidth <= window.innerWidth + 1;
      case "clickDistinct":
        el = document.querySelector(c.click);
        if (!el) return false;
        var seen = {}, n = 0;
        for (var j = 0; j < c.clicks; j++) {
          el.click();
          var s = textOf(c.watch);
          if (s && !seen[s]) { seen[s] = true; n++; }
          if (n >= c.minDistinct) break;
          if (j % 10 === 9) await yieldTask();
        }
        return n >= c.minDistinct;
    }
    return false;
  }
  window.addEventListener("load", function () {
    yieldTask().then(async function () {
      var results = [];
      for (var k = 0; k < cfg.checks.length; k++) {
        try { results.push(await runOne(cfg.checks[k])); }
        catch (e) { results.push(false); }
      }
      send({ type: "checks", results: results });
    });
  });
})(${jsonForScript(config)});`;
}

export function buildPreviewDocument(
  rawFiles: ProjectFiles,
  options: { token: string; checks?: DomCheck[]; loopLimitMs?: number },
): BuiltPreview {
  // Картинки из библиотеки студии: kartinki/kot.svg → data:image/svg+xml;base64,…
  // (переводов строк не добавляет, поэтому номера строк в ошибках не сдвигаются)
  const files: ProjectFiles = {
    html: resolveLibraryImages(rawFiles.html),
    css: resolveLibraryImages(rawFiles.css),
    js: resolveLibraryImages(rawFiles.js),
  };
  const protectedJs = protectLoops(files.js);
  const userJs = protectedJs.ok ? escapeClosingTag(protectedJs.code, "script") : "";

  const head = [
    "<!doctype html>",
    '<html lang="ru">',
    "<head>",
    '<meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">`,
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<script>${loopRuntime(options.loopLimitMs ?? LOOP_LIMIT_MS)}\n${bridgeScript({
      token: options.token,
      checks: options.checks ?? null,
      marker: INFINITE_LOOP_MARKER,
    })}</script>`,
    `<style>\n${escapeClosingTag(files.css, "style")}\n</style>`,
    "</head>",
    "<body>",
    files.html,
    "<script>",
  ].join("\n");

  const jsStartLine = head.split("\n").length;
  const html = `${head}${userJs}\n</script>\n</body>\n</html>`;

  return {
    html,
    jsStartLine,
    jsLineCount: rawFiles.js.split("\n").length,
    loopLines: protectedJs.ok ? protectedJs.loopLines : [],
    syntaxError: protectedJs.ok ? null : protectedJs.error,
  };
}

/** Строка в JS ребёнка, где находится ошибка: для остановленного цикла — строка цикла. */
export function errorLine(built: BuiltPreview, message: string, documentLine: number): number | null {
  const loopId = parseLoopError(message);
  if (loopId !== null) return built.loopLines[loopId] ?? null;
  return toUserJsLine(built, documentLine);
}

/** Переводит номер строки документа в номер строки JS-файла ребёнка. */
export function toUserJsLine(built: BuiltPreview, documentLine: number): number | null {
  const line = documentLine - built.jsStartLine + 1;
  return line >= 1 && line <= built.jsLineCount ? line : null;
}

export function isPreviewMessage(data: unknown, token: string): data is PreviewMessage {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return d.cq === "preview" && d.token === token && typeof d.type === "string";
}
