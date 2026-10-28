"use client";

import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import type { CodeFile, ProjectFiles } from "@/content/lessons/types";

const languages: Record<CodeFile, () => Extension> = {
  html: () => html({ autoCloseTags: true }),
  css: () => css(),
  js: () => javascript(),
  py: () => python(),
};

const labels: Record<CodeFile, string> = { html: "HTML", css: "CSS", js: "JavaScript", py: "Python" };

const theme = EditorView.theme({
  "&": { height: "100%", fontSize: "15px", backgroundColor: "var(--color-surface)" },
  ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.6" },
  ".cm-content": { padding: "12px 0" },
  ".cm-gutters": {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-muted)",
    borderRight: "1px solid var(--color-line)",
  },
  ".cm-activeLine": { backgroundColor: "#f3f6fd" },
  ".cm-activeLineGutter": { backgroundColor: "#e9eefb", color: "var(--color-ink)" },
  "&.cm-focused": { outline: "none" },
});

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
