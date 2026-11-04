/**
 * Сертификат в стиле игры: «LEVEL UP!», навыки как разблокированные значки, профиль игрока,
 * шкала опыта и медаль контрольной миссии. Рисуется на холсте A4 (альбомная ориентация):
 * все размеры в единицах cqw, поэтому сертификат одинаково выглядит на экране любой ширины и при печати.
 */

/** Размер в макетных пикселях (холст 1123 px — ширина A4 при 96 dpi) → доля ширины сертификата. */
const u = (px: number) => `${(px / 11.23).toFixed(3)}cqw`;

const C = {
  bg: "#15123a",
  panel: "#1b1d4a",
  cyan: "#38e8ff",
  mint: "#3ef2c6",
  lime: "#9dff5c",
  sun: "#ffd43b",
  ink: "#eef0ff",
  muted: "#a9add6",
};

/** Значок навыка по ключевым словам: навыки курсов написаны обычным текстом. */
const ICONS: [RegExp, string][] = [
  [/HTML|тег/i, "🧱"],
  [/CSS|оформл|цвет/i, "🎨"],
  [/JavaScript|кнопк/i, "⚡\uFE0F"],
  [/переменн|данн|массив/i, "🧰"],
  [/ошибк|консол/i, "🐞"],
  [/каркас|порядк/i, "🏗️"],
  [/родител|дет/i, "🌳"],
  [/\bid\b|class/i, "🏷️"],
  [/техническ|задани/i, "📋"],
  [/списк|меню|ссылк/i, "🧭"],
  [/картинк/i, "🖼️"],
  [/flexbox|ряд/i, "🧩"],
  [/телефон/i, "📱"],
  [/с нуля|план/i, "🚀"],
  [/Python/i, "🐍"],
  [/робот/i, "🤖"],
  [/игр/i, "🎮"],
  [/if|услови|решени/i, "🔀"],
  [/таймер|ввод|клавиатур/i, "⏱️"],
  [/функци/i, "⚙️"],
  [/хакер/i, "🕵️"],
  [/шифр/i, "🔐"],
  [/пароль|хеш/i, "🔑"],
  [/фишинг/i, "🎣"],
  [/Grid|сетк/i, "🔲"],
  [/position|sticky/i, "📌"],
  [/анимац/i, "✨"],
  [/форм|таблиц/i, "📝"],
  [/доступн/i, "🤝"],
  [/сообщени|счита/i, "💬"],
];
const iconFor = (skill: string) => ICONS.find(([re]) => re.test(skill))?.[1] ?? "⭐";
const RING = [C.cyan, "#5aa8ff", C.lime, C.mint, C.cyan, "#c7a4ff"];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Props = {
  name: string;
  courseTitle: string;
  lessons: number;
  skills: string[];
  date: string;
  control?: { correct: number; total: number };
};

export function QuestCertificate({ name, courseTitle, lessons, skills, date, control }: Props) {
  const many = skills.length > 5;
  return (
    <article
      aria-label="Сертификат"
      className="quest-cert relative w-full overflow-hidden [container-type:inline-size]"
      style={{ aspectRatio: "297 / 210", background: C.bg, color: C.ink, borderRadius: u(18) }}
    >
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 30%, #2a1f6e 0%, ${C.bg} 65%)` }} />
      <Pixels />

      {/* Неоновая рамка-окно */}
      <div
        className="absolute"
        style={{
          inset: u(22),
          bottom: u(44),
          border: `${u(3)} solid ${C.cyan}`,
          borderRadius: u(30),
          boxShadow: `0 0 ${u(14)} ${C.cyan}, inset 0 0 ${u(14)} rgba(56,232,255,.35)`,
        }}
      />
      <WindowBar />

      <Code style={{ left: u(52), top: u(70) }} lines={["if (quest.completed) {", "  celebrate();", "}"]} />
      <Code style={{ left: u(52), bottom: u(76) }} lines={["while (curious) {", "  learn();", "}"]} />

      {/* Шапка */}
      <div className="absolute inset-x-0 flex flex-col items-center" style={{ top: u(40) }}>
        <div className="flex items-center" style={{ gap: u(10) }}>
          <QBot size={42} />
          <span className="font-display font-extrabold" style={{ fontSize: u(30) }}>
            CodeQuest
          </span>
        </div>
        <p
          className="font-display font-black leading-none"
          style={{
            marginTop: u(10),
            fontSize: u(92),
            letterSpacing: "-0.02em",
            background: `linear-gradient(180deg, ${C.lime} 0%, ${C.mint} 55%, ${C.cyan} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: `drop-shadow(0 ${u(2)} 0 #e9fff8) drop-shadow(0 ${u(5)} 0 #0b5d6e) drop-shadow(0 0 ${u(16)} rgba(62,242,198,.55))`,
          }}
        >
          LEVEL UP!
        </p>
        <p className="font-display font-bold uppercase" style={{ marginTop: u(10), fontSize: u(21), color: C.sun }}>
          Сертификат прохождения квеста
        </p>
      </div>

      {/* Основная колонка */}
      <div className="absolute flex flex-col items-center" style={{ left: u(60), width: u(745), top: u(262) }}>
        <h1
          className="font-display w-full truncate text-center font-extrabold leading-tight"
          style={{ fontSize: u(name.length > 22 ? 36 : 46), color: "#e4fbff", textShadow: `0 0 ${u(14)} rgba(56,232,255,.45)` }}
        >
          {name}
        </h1>
        <p
          className="font-bold uppercase"
          style={{
            marginTop: u(10),
            padding: `${u(7)} ${u(26)}`,
            fontSize: u(17),
            border: `${u(2.5)} solid ${C.cyan}`,
            borderRadius: u(999),
            boxShadow: `0 0 ${u(10)} rgba(56,232,255,.6)`,
            background: "rgba(13,14,36,.55)",
          }}
        >
          Курс: <span style={{ color: C.sun }}>«{courseTitle}»</span> · Уровней пройдено:{" "}
          <span style={{ color: C.lime }}>{lessons}</span>
        </p>

        <section
          className="relative w-full"
          style={{
            marginTop: u(24),
            padding: `${u(22)} ${u(14)} ${u(14)}`,
            border: `${u(2)} solid #3a3f86`,
            borderRadius: u(20),
            background: "rgba(27,29,74,.55)",
          }}
        >
          <h2
            className="absolute left-1/2 -translate-x-1/2 font-bold whitespace-nowrap uppercase"
            style={{ top: u(-13), padding: `0 ${u(14)}`, fontSize: u(17), background: C.bg }}
          >
            Разблокированные навыки
          </h2>
          <ul className="flex justify-center" style={{ gap: u(many ? 6 : 12) }}>
            {skills.map((s, i) => (
              <li key={s} className="flex flex-1 flex-col items-center text-center" style={{ maxWidth: u(150) }}>
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: u(many ? 78 : 86),
                    height: u(many ? 78 : 86),
                    fontSize: u(many ? 36 : 40),
                    border: `${u(4)} solid ${RING[i % RING.length]}`,
                    boxShadow: `0 0 ${u(12)} ${RING[i % RING.length]}, inset 0 0 ${u(10)} rgba(255,255,255,.15)`,
                    background: "radial-gradient(circle at 35% 30%, #2f3480, #15173c)",
                  }}
                >
                  {iconFor(s)}
                </span>
                <span className="font-bold" style={{ marginTop: u(8), fontSize: u(14), color: C.lime }}>
                  ✓ Готово!
                </span>
                <span className="font-semibold leading-snug" style={{ marginTop: u(3), fontSize: u(many ? 12.5 : 13.5) }}>
                  {capitalize(s)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Профиль игрока */}
      <div className="absolute flex flex-col items-center" style={{ right: u(52), width: u(230), top: u(240) }}>
        <p className="font-bold uppercase" style={{ fontSize: u(16) }}>
          Профиль игрока
        </p>
        <div
          className="relative w-full overflow-hidden"
          style={{
            marginTop: u(6),
            height: u(150),
            border: `${u(2)} solid #3a5fa8`,
            borderRadius: u(16),
            background: "linear-gradient(180deg, #1f3a6e, #162550)",
          }}
        >
          <div className="absolute" style={{ left: u(12), top: u(14), width: u(46), height: u(5), background: C.lime, borderRadius: u(4) }} />
          <div className="absolute" style={{ left: u(12), top: u(26), width: u(70), height: u(5), background: "#3a6fb0", borderRadius: u(4) }} />
          <div className="absolute" style={{ left: u(12), top: u(38), width: u(34), height: u(5), background: "#3a6fb0", borderRadius: u(4) }} />
          <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: u(-8) }}>
            <QBot size={140} waving />
          </div>
        </div>
        <div
          className="w-full"
          style={{
            marginTop: u(16),
            height: u(18),
            padding: u(3),
            border: `${u(2.5)} solid ${C.cyan}`,
            borderRadius: u(999),
            boxShadow: `0 0 ${u(8)} rgba(56,232,255,.6)`,
          }}
        >
          <div className="h-full w-full" style={{ borderRadius: u(999), background: `linear-gradient(90deg, ${C.lime}, ${C.mint})` }} />
        </div>
        <p className="font-bold uppercase" style={{ marginTop: u(6), fontSize: u(14), color: C.cyan }}>
          Опыт: 100% · максимум
        </p>
        <Medal control={control} />
      </div>

      {/* Низ */}
      <div className="absolute inset-x-0 flex flex-col items-center" style={{ bottom: u(56) }}>
        <p className="font-bold" style={{ fontSize: u(19), color: C.cyan }}>
          {date}
        </p>
        <p
          className="font-display font-extrabold uppercase"
          style={{
            marginTop: u(8),
            padding: `${u(9)} ${u(30)}`,
            fontSize: u(21),
            color: "#08221f",
            borderRadius: u(14),
            background: `linear-gradient(180deg, ${C.lime}, ${C.mint})`,
            boxShadow: `0 ${u(4)} 0 #0b6b5c, 0 0 ${u(16)} rgba(62,242,198,.6)`,
          }}
        >
          Миссия выполнена!
        </p>
      </div>
      <p className="absolute inset-x-0 text-center" style={{ bottom: u(14), fontSize: u(12), color: C.muted }}>
        Документ о прохождении курса в учебной студии CodeQuest, а не государственный документ об образовании.
      </p>
    </article>
  );
}

function Code({ lines, style }: { lines: string[]; style: React.CSSProperties }) {
  return (
    <pre aria-hidden="true" className="absolute font-mono leading-snug" style={{ ...style, fontSize: u(15), color: "#9ee8ff" }}>
      {lines.map((l, i) => (
        <span key={i} className="block">
          {l.split(/(if|while|\(|\)|\{|\})/).map((part, j) =>
            part === "if" || part === "while" ? (
              <span key={j} style={{ color: "#c7a4ff" }}>
                {part}
              </span>
            ) : /[(){}]/.test(part) ? (
              <span key={j} style={{ color: C.ink }}>
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </span>
      ))}
    </pre>
  );
}

function WindowBar() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute flex items-center"
        style={{
          left: u(56),
          top: u(12),
          gap: u(5),
          padding: `${u(6)} ${u(12)}`,
          border: `${u(2.5)} solid ${C.cyan}`,
          borderRadius: u(12),
          background: C.bg,
          boxShadow: `0 0 ${u(8)} ${C.cyan}`,
        }}
      >
        <span style={{ fontSize: u(15) }}>⭐</span>
        {[1, 1, 1, 1, 1].map((_, i) => (
          <span key={i} style={{ width: u(13), height: u(13), borderRadius: u(3), background: C.lime }} />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="absolute flex"
        style={{
          right: u(56),
          top: u(12),
          gap: u(6),
          padding: `${u(6)} ${u(10)}`,
          border: `${u(2.5)} solid ${C.cyan}`,
          borderRadius: u(12),
          background: C.bg,
          boxShadow: `0 0 ${u(8)} ${C.cyan}`,
        }}
      >
        {["#3ddc6c", C.sun, "#ff5d6c"].map((c) => (
          <span key={c} style={{ width: u(18), height: u(18), borderRadius: u(5), background: c }} />
        ))}
      </div>
    </>
  );
}

/** Пиксельные россыпи и звёздочки по фону. */
function Pixels() {
  const dots: [number, number, number, string][] = [
    [80, 330, 10, "#2c4f9e"], [100, 350, 10, "#2c4f9e"], [70, 372, 10, "#3a6fd0"], [120, 300, 8, "#3a6fd0"],
    [150, 380, 8, "#2c4f9e"], [985, 225, 8, C.lime], [1000, 240, 8, C.lime], [1015, 210, 8, "#3ddc6c"],
    [1040, 120, 8, C.lime], [1052, 132, 8, "#3ddc6c"], [520, 690, 9, "#2c4f9e"], [540, 705, 9, "#3a6fd0"],
    [610, 700, 9, "#2c4f9e"],
  ];
  const stars: [number, number, number, string][] = [
    [110, 250, 22, C.sun], [250, 395, 20, C.sun], [890, 95, 22, C.sun], [930, 210, 18, C.lime],
    [395, 95, 18, C.cyan], [30, 470, 22, C.cyan],
  ];
  return (
    <div aria-hidden="true" className="absolute inset-0">
      {dots.map(([x, y, s, c], i) => (
        <span key={i} className="absolute" style={{ left: u(x), top: u(y), width: u(s), height: u(s), background: c }} />
      ))}
      {stars.map(([x, y, s, c], i) => (
        <span key={i} className="absolute leading-none" style={{ left: u(x), top: u(y), fontSize: u(s), color: c, textShadow: `0 0 ${u(8)} ${c}` }}>
          ✦
        </span>
      ))}
    </div>
  );
}

/** Робот Кью — талисман студии (тот же, что в логотипе), крупно и машет рукой. */
function QBot({ size, waving = false }: { size: number; waving?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" style={{ width: u(size), height: u(size), overflow: "visible" }}>
      {waving && (
        <>
          <rect x="22" y="70" width="56" height="34" rx="14" fill="#2ccfa9" />
          <rect x="38" y="78" width="24" height="14" rx="4" fill="#173a3b" />
          <circle cx="44" cy="85" r="2.5" fill={C.lime} />
          <circle cx="56" cy="85" r="2.5" fill={C.cyan} />
        </>
      )}
      <rect x="14" y="20" width="72" height="56" rx="20" fill={C.mint} />
      <rect x="22" y="29" width="56" height="38" rx="14" fill="#0d0e24" />
      <ellipse cx="38" cy="45" rx="6" ry="8" fill={C.cyan} />
      <ellipse cx="62" cy="45" rx="6" ry="8" fill={C.cyan} />
      <path d="M41 58 Q50 64 59 58" stroke={C.cyan} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M50 20 V8" stroke={C.mint} strokeWidth="5" />
      <circle cx="50" cy="7" r="6" fill={C.sun} />
      {waving && (
        <>
          <path d="M26 84 Q2 80 -2 56" stroke="#2ccfa9" strokeWidth="9" strokeLinecap="round" fill="none" />
          <circle cx="-3" cy="50" r="7.5" fill="#e9fff8" />
        </>
      )}
    </svg>
  );
}

/** Медаль: если есть результат контрольной миссии — пишем его. */
function Medal({ control }: { control?: { correct: number; total: number } }) {
  return (
    <div className="relative" style={{ marginTop: u(10), width: u(150), height: u(150) }}>
      <svg aria-hidden="true" viewBox="0 0 120 120" className="absolute inset-0 h-full w-full">
        <path d="M38 70 L22 116 L40 106 L50 120 L60 78Z" fill="#f2a516" />
        <path d="M82 70 L98 116 L80 106 L70 120 L60 78Z" fill="#f2a516" />
        <circle cx="60" cy="54" r="46" fill="#ffc83d" />
        <circle cx="60" cy="54" r="38" fill="#ffd95e" stroke="#f2a516" strokeWidth="3" strokeDasharray="4 3" />
      </svg>
      <p
        className="absolute flex flex-col items-center justify-center text-center font-display font-extrabold uppercase leading-tight"
        style={{ left: u(25), right: u(25), top: u(22), height: u(80), color: "#7a3d00", transform: "rotate(-8deg)", fontSize: u(12.5) }}
      >
        {control ? (
          <>
            Контрольная
            <span style={{ fontSize: u(24) }}>
              {control.correct}/{control.total}
            </span>
          </>
        ) : (
          <>Квест пройден!</>
        )}
      </p>
    </div>
  );
}
