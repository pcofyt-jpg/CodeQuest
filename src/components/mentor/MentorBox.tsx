"use client";

import { useState } from "react";
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

type State =
  | { s: "idle" }
  | { s: "need-code"; note?: string }
  | { s: "loading" }
  | { s: "answer"; text: string; left: number | null }
  | { s: "error"; text: string };

/**
 * Кнопка «Спросить наставника» и его ответ.
 * Запрос собирается в момент нажатия: в нём только код урока и ошибка или проверки.
 */
export function MentorBox({ label, buildRequest }: { label: string; buildRequest: () => MentorRequest }) {
  const code = useMentorCode();
  const [state, setState] = useState<State>({ s: "idle" });
  if (!mentorEnabled) return null;

  const ask = async (withCode: string) => {
    setState({ s: "loading" });
    const r = await askMentor(buildRequest(), withCode);
    if (r.ok) setState({ s: "answer", text: r.answer, left: r.left });
    else if (r.kind === "code") {
      mentorCode.clear();
      setState({ s: "need-code", note: r.message });
    } else setState({ s: "error", text: r.message });
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
          void ask(value.toLowerCase());
        }}
      >
        {state.note && <p className="mb-2 font-semibold text-coral">{state.note}</p>}
        <p className="font-semibold">Наставнику нужен код доступа. Попроси родителя ввести его.</p>
        <p className="mt-1 text-muted">
          Для родителя: наставник — это ИИ (YandexGPT от Яндекса). Чтобы ответить, он получает только код урока и
          текст ошибки. Имя и другие личные данные не передаются; Яндекс не сохраняет эти запросы. Вводя код, вы
          соглашаетесь на такую передачу на время пилота.
        </p>
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
          <button type="submit" className="rounded-lg bg-route px-4 py-2 font-semibold text-white">
            Сохранить
          </button>
          <button type="button" onClick={() => setState({ s: "idle" })} className="rounded-lg px-2 py-2 font-semibold">
            Отмена
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-1.5 font-sans">
      {state.s !== "answer" && (
        <button
          type="button"
          disabled={state.s === "loading"}
          onClick={() => (code ? void ask(code) : setState({ s: "need-code" }))}
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
    </div>
  );
}
