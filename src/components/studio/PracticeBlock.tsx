"use client";

import { useMemo, useState } from "react";
import type { Exercise } from "@/content/lessons/types";

/**
 * «Попробуй»: короткие задания перед основным заданием урока.
 * Не блокируют урок — это разминка: понять → попробовать → применить.
 */
export function PracticeBlock({ exercises }: { exercises: Exercise[] }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<boolean[]>(() => exercises.map(() => false));
  const allDone = done.every(Boolean);
  const ex = exercises[current]!;

  const markDone = () => setDone((d) => d.map((v, i) => (i === current ? true : v)));

  return (
    <section aria-labelledby="practice-title" className="rounded-2xl border border-line bg-paper px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="practice-title" className="text-lg font-bold text-ink">
          Попробуй
        </h2>
        <ol aria-label="Задания разминки" className="flex gap-1.5">
          {exercises.map((_, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-current={i === current ? "step" : undefined}
                aria-label={`Задание ${i + 1}${done[i] ? ", выполнено" : ""}`}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  done[i]
                    ? "bg-mint text-white"
                    : i === current
                      ? "bg-route text-white"
                      : "border-2 border-line bg-surface text-muted"
                }`}
              >
                {done[i] ? "✓" : i + 1}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-1 text-sm text-muted">
        Короткая разминка: задание {current + 1} из {exercises.length}.
      </p>

      <div className="mt-3">
        {ex.kind === "choice" && <ChoiceEx key={current} ex={ex} onDone={markDone} />}
        {ex.kind === "order" && <OrderEx key={current} ex={ex} seed={current + 1} onDone={markDone} />}
        {ex.kind === "fill" && <FillEx key={current} ex={ex} onDone={markDone} />}
        {ex.kind === "type" && <TypeEx key={current} ex={ex} onDone={markDone} />}
      </div>

      {done[current] && current < exercises.length - 1 && (
        <button
          type="button"
          onClick={() => setCurrent(current + 1)}
          className="mt-3 rounded-xl bg-ink px-5 py-2.5 font-semibold text-white"
        >
          Дальше →
        </button>
      )}
      {allDone && (
        <p role="status" className="mt-3 font-semibold text-mint">
          Разминка пройдена! Теперь — главное задание ниже.
        </p>
      )}
    </section>
  );
}

function Explain({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p role="status" className={`mt-2 text-sm leading-relaxed ${ok ? "text-ink" : "text-coral"}`}>
      {ok ? "Верно! " : "Не совсем. "}
      {text}
    </p>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg bg-surface px-3 py-2 font-mono text-[13px] leading-relaxed">{children}</pre>
  );
}

// ---------- выбери ответ ----------

function ChoiceEx({ ex, onDone }: { ex: Extract<Exercise, { kind: "choice" }>; onDone: () => void }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const right = chosen === ex.correct;
  return (
    <div>
      <p className="text-[15px] font-semibold">{ex.question}</p>
      {ex.code && <Code>{ex.code}</Code>}
      <div className="mt-2 flex flex-col gap-2">
        {ex.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={right}
            aria-pressed={chosen === i}
            onClick={() => {
              setChosen(i);
              if (i === ex.correct) onDone();
            }}
            className={`rounded-xl border-2 px-4 py-2.5 text-left text-[15px] font-medium disabled:cursor-default ${
              chosen !== i
                ? "border-line bg-surface hover:border-route"
                : i === ex.correct
                  ? "border-mint bg-surface text-mint"
                  : "border-coral bg-coral-soft text-coral"
            }`}
          >
            {chosen === i && (i === ex.correct ? "✓ " : "✗ ")}
            {opt}
          </button>
        ))}
      </div>
      {chosen !== null && <Explain ok={right} text={right ? ex.explain : "Подумай ещё и выбери другой вариант."} />}
    </div>
  );
}

// ---------- собери код из строчек ----------

/** Перемешивание, одинаковое при каждом открытии (без случайности), и всегда не совпадающее с ответом. */
function shuffled(lines: string[], seed: number): number[] {
  const idx = lines.map((_, i) => i);
  let s = seed * 9301 + 49297;
  for (let i = idx.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  if (idx.every((v, i) => v === i) && idx.length > 1) idx.push(idx.shift()!);
  return idx;
}

function OrderEx({ ex, seed, onDone }: { ex: Extract<Exercise, { kind: "order" }>; seed: number; onDone: () => void }) {
  const start = useMemo(() => shuffled(ex.lines, seed), [ex.lines, seed]);
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const pool = start.filter((i) => !picked.includes(i));
  const full = picked.length === ex.lines.length;

  const check = () => {
    // Сравниваем тексты: одинаковые строчки взаимозаменяемы.
    const ok = picked.every((i, k) => ex.lines[i] === ex.lines[k]);
    setResult(ok);
    if (ok) onDone();
  };

  return (
    <div>
      <p className="text-[15px] font-semibold">{ex.prompt}</p>
      <p className="mt-1 text-sm text-muted">Нажимай строчки по порядку. Ошибся — нажми строчку в своём коде, и она вернётся.</p>
      <div aria-label="Твой код" className="mt-2 min-h-12 rounded-lg border-2 border-dashed border-line bg-surface p-2">
        {picked.length === 0 && <p className="px-1 py-1 text-sm text-muted">Здесь соберётся твой код</p>}
        {picked.map((i, k) => (
          <button
            key={`${i}-${k}`}
            type="button"
            disabled={result === true}
            onClick={() => {
              setPicked(picked.filter((_, n) => n !== k));
              setResult(null);
            }}
            className="block w-full rounded px-2 py-1 text-left font-mono text-[13px] whitespace-pre hover:bg-coral-soft disabled:hover:bg-transparent"
          >
            {ex.lines[i]}
          </button>
        ))}
      </div>
      <div aria-label="Строчки" className="mt-2 flex flex-col gap-1.5">
        {pool.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setPicked([...picked, i]);
              setResult(null);
            }}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-left font-mono text-[13px] whitespace-pre hover:border-route"
          >
            {ex.lines[i]}
          </button>
        ))}
      </div>
      {full && result !== true && (
        <button type="button" onClick={check} className="mt-2 rounded-xl bg-route px-4 py-2 font-semibold text-white">
          Проверить порядок
        </button>
      )}
      {result !== null && (
        <Explain ok={result} text={result ? ex.explain : "Порядок другой. Подумай, что должно идти первым, а что — закрывать код."} />
      )}
    </div>
  );
}

// ---------- вставь пропущенное ----------

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

function FillEx({ ex, onDone }: { ex: Extract<Exercise, { kind: "fill" }>; onDone: () => void }) {
  const [value, setValue] = useState("");
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const check = () => {
    const ok = ex.answers.some((a) => norm(a) === norm(value));
    setResult(ok);
    setTries((t) => t + 1);
    if (ok) onDone();
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) check();
      }}
    >
      <p className="text-[15px] font-semibold">{ex.prompt}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1 rounded-lg bg-surface px-3 py-2 font-mono text-[14px]">
        <span className="whitespace-pre">{ex.before}</span>
        <input
          aria-label="Пропущенный кусочек кода"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setResult(null);
          }}
          disabled={result === true}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          size={Math.max(4, ...ex.answers.map((a) => a.length))}
          className="rounded border-2 border-route/50 bg-paper px-1.5 py-0.5 font-mono focus:border-route"
        />
        <span className="whitespace-pre">{ex.after}</span>
      </div>
      {result !== true && (
        <button type="submit" className="mt-2 rounded-xl bg-route px-4 py-2 font-semibold text-white">
          Проверить ответ
        </button>
      )}
      {result !== null && <Explain ok={result} text={result ? ex.explain : "Посмотри на образец и попробуй ещё."} />}
      {result === false && tries >= 2 && (
        <p className="mt-1 text-sm text-muted">
          Подсказка: здесь подойдёт <code className="font-mono">{ex.answers[0]}</code>
        </p>
      )}
    </form>
  );
}

// ---------- напечатай ----------

const CYRILLIC = /[а-яё]/i;
/** Ребёнок печатает в русской раскладке, а нужна английская: в образце латиница или символы кода. */
export function wrongLayout(target: string, typed: string): boolean {
  const needsLatin = /[a-z<>{}[\]#/;'"`]/i.test(target);
  if (!needsLatin) return false;
  // Русские буквы там, где в образце их нет (например «Бр1Ю» вместо «<h1>»)
  const extraCyr = [...typed].some((ch) => CYRILLIC.test(ch) && !target.toLowerCase().includes(ch.toLowerCase()));
  return extraCyr;
}

function TypeEx({ ex, onDone }: { ex: Extract<Exercise, { kind: "type" }>; onDone: () => void }) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const layoutHint = value.length > 0 && wrongLayout(ex.target, value);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const ok = value.trim() === ex.target;
        setResult(ok);
        if (ok) onDone();
      }}
    >
      <p className="text-[15px] font-semibold">{ex.prompt}</p>
      <p className="mt-2 text-sm text-muted">Образец:</p>
      <Code>{ex.target}</Code>
      <label htmlFor="type-ex" className="mt-2 block text-sm text-muted">
        Напечатай здесь:
      </label>
      <input
        id="type-ex"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setResult(null);
        }}
        disabled={result === true}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="mt-1 w-full rounded-lg border-2 border-route/50 bg-surface px-3 py-2 font-mono text-[15px] focus:border-route"
      />
      {layoutHint && (
        <p role="status" className="mt-2 rounded-lg bg-sun-soft px-3 py-2 text-sm text-ink">
          Похоже, включена русская раскладка. Переключи на английскую (EN): на компьютере — Alt+Shift или Win+Пробел,
          на телефоне — кнопка с глобусом.
        </p>
      )}
      {result !== true && (
        <button type="submit" className="mt-2 rounded-xl bg-route px-4 py-2 font-semibold text-white">
          Проверить ответ
        </button>
      )}
      {result !== null && (
        <Explain ok={result} text={result ? ex.explain : "Сравни с образцом символ за символом: скобки, косая черта, кавычки."} />
      )}
    </form>
  );
}
