"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MENTOR_PARENT_COPY, MENTOR_REMINDER_COPY } from "@/content/pendingOwnerCopy";
import { askMentor, mentorEnabled, type MentorRequest } from "@/lib/mentor/client";
import { mentorCode, useMentorCode } from "@/lib/mentor/codeStore";

/** Фрагменты в обратных кавычках (`addEventListener`) показываем как код, а не как символы. */
function MentorText({ text }: { text: string }) {
  const parts = text.split(/`([^`\n]{1,200})`/g);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-surface px-1 py-px font-mono text-[0.92em]">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </p>
  );
}

/** Первые миллисекунды обе кнопки не срабатывают: повторный клик по «Спросить» не отправляет код и не закрывает окно. */
const BUTTONS_ARM_MS = 500;

type ScrollLock = () => void;

/** Замораживает окно и внутренние прокрутки. Возвращает функцию, которая ставит всё как было. */
function lockBackgroundScroll(): ScrollLock {
  const html = document.documentElement;
  const body = document.body;
  const x = window.scrollX;
  const y = window.scrollY;
  const htmlOverflow = html.style.overflow;
  const bodyOverflow = body.style.overflow;
  const scrollers: { el: HTMLElement; overflowY: string; top: number }[] = [];
  const walk = (el: Element) => {
    if (!(el instanceof HTMLElement) || el === html || el === body) return;
    const style = getComputedStyle(el);
    if (/(auto|scroll)/.test(style.overflowY)) {
      scrollers.push({ el, overflowY: el.style.overflowY, top: el.scrollTop });
    }
    for (const child of el.children) walk(child);
  };
  walk(body);
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  window.scrollTo(x, y);
  for (const s of scrollers) {
    s.el.style.overflowY = "hidden";
    s.el.scrollTop = s.top;
  }
  return () => {
    html.style.overflow = htmlOverflow;
    body.style.overflow = bodyOverflow;
    window.scrollTo(x, y);
    for (const s of scrollers) {
      s.el.style.overflowY = s.overflowY;
      s.el.scrollTop = s.top;
    }
  };
}

function readVisualViewport() {
  const vv = window.visualViewport;
  return {
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
    x: vv?.offsetLeft ?? 0,
    y: vv?.offsetTop ?? 0,
  };
}

function trapFocus(dialog: HTMLElement, event: KeyboardEvent) {
  if (event.key === "Tab") {
    const nodes = [...dialog.querySelectorAll<HTMLElement>("button:not([disabled])")];
    if (nodes.length === 0) {
      event.preventDefault();
      return;
    }
    const first = nodes[0]!;
    const last = nodes[nodes.length - 1]!;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }
}

type State =
  | { s: "idle" }
  | { s: "need-code"; note?: string }
  | { s: "confirm"; code: string }
  | { s: "loading" }
  | { s: "answer"; text: string; left: number | null }
  | { s: "error"; text: string };

/**
 * Кнопка «Спросить наставника» и его ответ.
 * Если кода доступа ещё нет — сначала экран кода, затем напоминание, затем отправка.
 * Если код уже сохранён — напоминание перед каждой отправкой. «Отмена» ничего не отправляет.
 */
export function MentorBox({ label, buildRequest }: { label: string; buildRequest: () => MentorRequest }) {
  const code = useMentorCode();
  const [state, setState] = useState<State>({ s: "idle" });
  const [buttonsArmed, setButtonsArmed] = useState(false);
  const busy = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef(0);
  const wasConfirm = useRef(false);
  const scrollEpoch = useRef(0);
  const remindTitleId = useId();
  const [frame, setFrame] = useState({ width: 0, height: 0, x: 0, y: 0 });

  useEffect(() => {
    if (state.s !== "confirm") return;
    const read = () => setFrame(readVisualViewport());
    read();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", read);
    vv?.addEventListener("scroll", read);
    window.addEventListener("resize", read);
    return () => {
      vv?.removeEventListener("resize", read);
      vv?.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [state.s]);

  useEffect(() => {
    if (state.s === "confirm") {
      wasConfirm.current = true;
      const epoch = ++scrollEpoch.current;
      const y = scrollYRef.current;
      const unlock = lockBackgroundScroll();
      const timer = window.setTimeout(() => setButtonsArmed(true), BUTTONS_ARM_MS);
      const keepWindow = () => {
        if (scrollEpoch.current !== epoch) return;
        if (Math.abs(window.scrollY - y) > 0) window.scrollTo(window.scrollX, y);
      };
      dialogRef.current?.focus({ preventScroll: true });
      keepWindow();
      const blockGesture = (event: Event) => {
        event.preventDefault();
      };
      const onKey = (event: KeyboardEvent) => {
        if (scrollEpoch.current !== epoch) return;
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setState({ s: "idle" });
          return;
        }
        if (event.key === "PageDown" || event.key === "PageUp" || event.key === "Home" || event.key === "End") {
          event.preventDefault();
          return;
        }
        if (
          (event.key === " " || event.key === "ArrowDown" || event.key === "ArrowUp") &&
          !(event.target instanceof HTMLElement && event.target.closest("button"))
        ) {
          event.preventDefault();
          return;
        }
        const dialog = dialogRef.current;
        if (dialog) trapFocus(dialog, event);
      };
      document.addEventListener("keydown", onKey);
      document.addEventListener("wheel", blockGesture, { passive: false, capture: true });
      document.addEventListener("touchmove", blockGesture, { passive: false, capture: true });
      const frameId = window.requestAnimationFrame(keepWindow);
      return () => {
        window.clearTimeout(timer);
        window.cancelAnimationFrame(frameId);
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("wheel", blockGesture, true);
        document.removeEventListener("touchmove", blockGesture, true);
        unlock();
      };
    }
    if (!wasConfirm.current) return;
    wasConfirm.current = false;
    const epoch = ++scrollEpoch.current;
    const y = scrollYRef.current;
    triggerRef.current?.focus({ preventScroll: true });
    window.scrollTo(window.scrollX, y);
    const frame = window.requestAnimationFrame(() => {
      if (scrollEpoch.current !== epoch) return;
      triggerRef.current?.focus({ preventScroll: true });
      window.scrollTo(window.scrollX, y);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [state.s]);

  if (!mentorEnabled) return null;

  const showConfirm = (nextCode: string) => {
    scrollYRef.current = window.scrollY;
    setFrame(readVisualViewport());
    setButtonsArmed(false);
    setState({ s: "confirm", code: nextCode });
  };

  const closeConfirm = () => setState({ s: "idle" });

  const ask = async (withCode: string) => {
    if (busy.current) return;
    busy.current = true;
    setState({ s: "loading" });
    try {
      const r = await askMentor(buildRequest(), withCode);
      if (r.ok) setState({ s: "answer", text: r.answer, left: r.left });
      else if (r.kind === "code") {
        mentorCode.clear();
        setState({ s: "need-code", note: r.message });
      } else setState({ s: "error", text: r.message });
    } finally {
      busy.current = false;
    }
  };

  if (state.s === "need-code") {
    return (
      <form
        className="mt-2 rounded-xl border border-route/30 bg-route-soft p-3 font-sans text-sm leading-relaxed text-ink"
        onSubmit={(e) => {
          e.preventDefault();
          const value = String(new FormData(e.currentTarget).get("mentor-code") ?? "").trim();
          if (!value) return;
          mentorCode.set(value);
          showConfirm(value.toLowerCase());
        }}
      >
        {state.note && <p className="mb-2 font-semibold text-coral">{state.note}</p>}
        <p className="font-semibold">Наставнику нужен код доступа. Попроси родителя ввести его.</p>
        <div className="mt-1 text-muted">
          <p>{MENTOR_PARENT_COPY.lead}</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {MENTOR_PARENT_COPY.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-1">{MENTOR_PARENT_COPY.tail}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <label htmlFor="mentor-code" className="sr-only">
            Код доступа
          </label>
          <input
            id="mentor-code"
            name="mentor-code"
            autoComplete="off"
            maxLength={100}
            className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2"
            placeholder="например, kot-raketa-123"
          />
          <button type="submit" className="rounded-lg bg-route px-4 py-2 font-semibold text-on-accent">
            Сохранить
          </button>
          <button type="button" onClick={() => setState({ s: "idle" })} className="rounded-lg px-2 py-2 font-semibold">
            Отмена
          </button>
        </div>
      </form>
    );
  }

  const reminder =
    state.s === "confirm" && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed z-50 flex items-center justify-center overscroll-contain px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-4"
            style={{ top: frame.y, left: frame.x, width: frame.width || "100dvw", height: frame.height || "100dvh" }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div
              ref={dialogRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={remindTitleId}
              tabIndex={-1}
              className="relative z-10 max-w-md rounded-xl border border-route/30 bg-route-soft p-4 font-sans text-sm leading-relaxed text-ink outline-none"
              style={{ width: "min(28rem, calc(100dvw - 2rem))", maxWidth: Math.max(0, (frame.width || window.innerWidth) - 32) }}
            >
              <p id={remindTitleId}>{MENTOR_REMINDER_COPY.text}</p>
              <div className="mt-4 flex flex-nowrap items-center gap-2">
                <button
                  type="button"
                  disabled={!buttonsArmed}
                  onClick={() => {
                    if (!buttonsArmed) return;
                    closeConfirm();
                  }}
                  className="inline-flex items-center justify-center rounded-lg px-4 font-semibold disabled:opacity-60"
                  style={{ minHeight: 44, minWidth: 44 }}
                >
                  {MENTOR_REMINDER_COPY.cancel}
                </button>
                <button
                  type="button"
                  disabled={!buttonsArmed}
                  onClick={() => {
                    if (!buttonsArmed) return;
                    void ask(state.code);
                  }}
                  className="ml-auto inline-flex items-center justify-center rounded-lg bg-route px-4 font-semibold text-on-accent disabled:opacity-60"
                  style={{ minHeight: 44, minWidth: 44 }}
                >
                  {MENTOR_REMINDER_COPY.send}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="mt-1.5 font-sans">
      {state.s !== "answer" && (
        <button
          ref={triggerRef}
          type="button"
          disabled={state.s === "loading"}
          onClick={() => (code ? showConfirm(code) : setState({ s: "need-code" }))}
          className="rounded-lg border border-route/40 bg-surface px-3 py-1.5 text-sm font-semibold text-route hover:bg-route-soft disabled:opacity-60"
        >
          {state.s === "loading" ? "Наставник думает…" : label}
        </button>
      )}
      {state.s === "error" && <p className="mt-1.5 text-sm text-coral">{state.text}</p>}
      {state.s === "answer" && (
        <div role="status" className="rounded-xl border border-route/30 bg-route-soft px-3 py-2.5 text-sm leading-relaxed text-ink">
          <p className="mb-1 font-semibold text-route">Наставник</p>
          <MentorText text={state.text} />
          <p className="mt-2 text-xs text-muted">
            Наставник — это ИИ и может ошибаться: проверяй его советы в окне результата.
            {state.left !== null && ` Вопросов на сегодня осталось: ${state.left}.`}
          </p>
        </div>
      )}
      {reminder}
    </div>
  );
}
