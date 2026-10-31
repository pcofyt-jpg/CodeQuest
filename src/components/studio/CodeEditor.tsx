"use client";

import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { EditorState, type Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting, syntaxTree } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { Decoration, EditorView, ViewPlugin, keymap, type DecorationSet, type ViewUpdate } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import type { CodeFile, ProjectFiles } from "@/content/lessons/types";

const languages: Record<CodeFile, () => Extension> = {
  html: () => [html({ autoCloseTags: true }), tagPairs],
  css: () => css(),
  js: () => javascript(),
  py: () => python(),
};

const labels: Record<CodeFile, string> = { html: "HTML", css: "CSS", js: "JavaScript", py: "Python" };

/**
 * Подсветка пары тега: курсор на <div> — светится и его </div>.
 * Незакрытый тег светится коралловым — сразу видно, где ошибка.
 * (Наблюдение пилота: ребёнок путал открывающие и закрывающие теги.)
 */
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const pairMark = Decoration.mark({ class: "cm-tag-pair" });
const unpairedMark = Decoration.mark({ class: "cm-tag-unpaired" });

function findTagPair(view: EditorView): DecorationSet {
  const pos = view.state.selection.main.head;
  for (let n = syntaxTree(view.state).resolveInner(pos, -1); n; n = n.parent!) {
    if (n.name === "OpenTag" || n.name === "CloseTag") {
      const el = n.parent;
      if (!el || el.name !== "Element") return Decoration.none;
      const open = el.getChild("OpenTag");
      const close = el.getChild("CloseTag");
      const nameNode = open?.getChild("TagName");
      const name = nameNode ? view.state.sliceDoc(nameNode.from, nameNode.to).toLowerCase() : "";
      if (open && close) return Decoration.set([pairMark.range(open.from, open.to), pairMark.range(close.from, close.to)]);
      if (open && !VOID_TAGS.has(name)) return Decoration.set([unpairedMark.range(open.from, open.to)]);
      return Decoration.none;
    }
    if (n.name === "Element" || n.name === "Document" || !n.parent) break;
  }
  return Decoration.none;
}

const tagPairs = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = findTagPair(view);
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.selectionSet || syntaxTree(u.startState) !== syntaxTree(u.state)) {
        this.decorations = findTagPair(u.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);

/** Тёмный редактор в цветах темы «Ночная миссия». */
const theme = EditorView.theme(
  {
    "&": { height: "100%", fontSize: "15px", backgroundColor: "var(--color-deep)", color: "#dfe1fb" },
    ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.65" },
    ".cm-content": { padding: "12px 0", caretColor: "var(--color-route)" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--color-route)", borderLeftWidth: "2px" },
    ".cm-gutters": { backgroundColor: "var(--color-deep)", color: "#5c619e", borderRight: "1px solid var(--color-line)" },
    ".cm-activeLine": { backgroundColor: "rgba(124, 196, 255, 0.06)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(124, 196, 255, 0.1)", color: "var(--color-ink)" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "rgba(62, 242, 198, 0.22)" },
    ".cm-matchingBracket": { backgroundColor: "rgba(255, 184, 77, 0.25)", outline: "none" },
    ".cm-tag-pair": { backgroundColor: "rgba(255, 184, 77, 0.22)", outline: "1px solid rgba(255, 184, 77, 0.6)", borderRadius: "3px" },
    ".cm-tag-unpaired": { backgroundColor: "rgba(255, 122, 138, 0.25)", outline: "1px solid rgba(255, 122, 138, 0.75)", borderRadius: "3px" },
    ".cm-tooltip": { backgroundColor: "var(--color-surface)", border: "1px solid var(--color-line-strong)", color: "var(--color-ink)" },
    ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: "var(--color-raised)", color: "var(--color-ink)" },
    ".cm-panels": { backgroundColor: "var(--color-surface)", color: "var(--color-ink)" },
    "&.cm-focused": { outline: "none" },
  },
  { dark: true },
);

/** Подсветка кода: как в макете — теги голубые, атрибуты янтарные, строки мятные. */
const highlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: [t.tagName, t.angleBracket], color: "#7cc4ff" },
    { tag: t.attributeName, color: "#ffb84d" },
    { tag: [t.string, t.attributeValue, t.special(t.string)], color: "#3ef2c6" },
    { tag: [t.comment, t.lineComment, t.blockComment], color: "#8a8fc0", fontStyle: "italic" },
    { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: "#c7a4ff" },
    { tag: [t.number, t.bool, t.null], color: "#ffb84d" },
    { tag: [t.propertyName, t.className], color: "#7cc4ff" },
    { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#9ee8ff" },
    { tag: [t.operator, t.punctuation, t.bracket], color: "#c9ccec" },
    { tag: t.variableName, color: "#eef0ff" },
    { tag: t.invalid, color: "#ff7a8a" },
  ]),
);

// Русские подписи для встроенных панелей редактора.
const phrases = EditorState.phrases.of({
  Find: "Найти",
  Replace: "Заменить",
  next: "далее",
  previous: "назад",
  all: "все",
  "match case": "с учётом регистра",
  regexp: "рег. выражение",
  "by word": "целое слово",
  replace: "заменить",
  "replace all": "заменить все",
  close: "закрыть",
  "Go to line": "Перейти к строке",
  go: "перейти",
  "Control character": "Управляющий символ",
});

function createState(file: CodeFile, doc: string, onChange: (file: CodeFile, value: string) => void) {
  return EditorState.create({
    doc,
    extensions: [
      basicSetup,
      keymap.of([indentWithTab]),
      languages[file](),
      theme,
      highlight,
      phrases,
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        "aria-label": `Код ${labels[file]}`,
        spellcheck: "false",
        autocapitalize: "off",
        autocorrect: "off",
      }),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) onChange(file, u.state.doc.toString());
      }),
    ],
  });
}

type Props = {
  files: ProjectFiles;
  active: CodeFile;
  onActiveChange: (file: CodeFile) => void;
  onChange: (file: CodeFile, value: string) => void;
  /** меняется, когда код заменён снаружи (сброс урока) */
  resetKey: number;
  /** строка с ошибкой, к которой нужно перейти */
  jumpTo: { file: CodeFile; line: number; nonce: number } | null;
  /** кнопки справа от вкладок (например, «Картинки») */
  toolbar?: React.ReactNode;
  /** какие файлы показывать вкладками; по умолчанию HTML, CSS и JavaScript */
  fileTabs?: CodeFile[];
};

export function CodeEditor({
  files,
  active,
  onActiveChange,
  onChange,
  resetKey,
  jumpTo,
  toolbar,
  fileTabs = ["html", "css", "js"],
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const statesRef = useRef<Partial<Record<CodeFile, EditorState>>>({});
  const activeRef = useRef(active);
  const onChangeRef = useRef(onChange);
  const filesRef = useRef(files);

  useEffect(() => {
    onChangeRef.current = onChange;
    filesRef.current = files;
  });

  const emit = (file: CodeFile, value: string) => onChangeRef.current(file, value);

  const stateFor = (file: CodeFile) => {
    let s = statesRef.current[file];
    if (!s) {
      s = createState(file, filesRef.current[file] ?? "", emit);
      statesRef.current[file] = s;
    }
    return s;
  };

  // Создаём редактор один раз и пересоздаём состояния при сбросе урока.
  useEffect(() => {
    statesRef.current = {};
    const view = new EditorView({ state: stateFor(activeRef.current), parent: hostRef.current! });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // stateFor читает данные из ref-ов, пересоздавать редактор нужно только при сбросе
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Переключение вкладки: сохраняем состояние (с историей отмен) и показываем другое.
  useEffect(() => {
    const view = viewRef.current;
    if (!view || activeRef.current === active) return;
    statesRef.current[activeRef.current] = view.state;
    activeRef.current = active;
    view.setState(stateFor(active));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Переход к строке с ошибкой.
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !jumpTo || jumpTo.file !== activeRef.current) return;
    const line = Math.min(Math.max(1, jumpTo.line), view.state.doc.lines);
    const pos = view.state.doc.line(line).from;
    view.dispatch({ selection: { anchor: pos }, effects: EditorView.scrollIntoView(pos, { y: "center" }) });
    view.focus();
  }, [jumpTo]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" aria-label="Файлы проекта" className="flex gap-1 border-b border-line px-2 pt-2">
        {fileTabs.map((file) => (
          <button
            key={file}
            role="tab"
            type="button"
            aria-selected={active === file}
            onClick={() => onActiveChange(file)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
              active === file
                ? "border border-b-0 border-line bg-surface text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {labels[file]}
          </button>
        ))}
        {toolbar && <div className="ml-auto flex items-center pb-1">{toolbar}</div>}
      </div>
      <div ref={hostRef} className="min-h-0 flex-1 overflow-hidden" />
    </div>
  );
}
