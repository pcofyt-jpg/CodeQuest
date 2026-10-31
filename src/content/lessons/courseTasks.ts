import type { Check, CodeFile, Lesson, ProjectFiles } from "./types";
import referencesJson from "./references.json";

/**
 * Задачники и «Сверстай по образцу» — больше практики на каждую тему.
 * Короткие задачи с автопроверкой, без теста после урока. В каждой — «почему так»:
 * не только что сделать, но и почему правильный код именно такой (наблюдение пилота).
 */
const references = referencesJson as Record<string, ProjectFiles>;
const ref = (slug: string): ProjectFiles => {
  const r = references[slug];
  if (!r) throw new Error(`Нет эталонного решения для задачи ${slug}`);
  return r;
};

type TaskSpec = {
  slug: string;
  title: string;
  /** условие задачи */
  task: string;
  /** почему правильный код именно такой */
  why: string;
  steps: string[];
  starter: ProjectFiles;
  checks: Check[];
  hints: [string, string];
  learned: string;
  focusFile?: CodeFile;
  sample?: boolean;
  checkWidth?: number;
};

const task =
  (course: string) =>
  (t: TaskSpec, number: number): Lesson => ({
    track: "practice",
    course,
    slug: t.slug,
    number,
    title: t.title,
    goal: t.task,
    explanation: [t.task, `Почему так: ${t.why}`],
    newTerms: [],
    steps: t.steps,
    starter: t.starter,
    focusFile: t.focusFile ?? "html",
    hints: t.hints,
    checks: t.checks,
    learned: [t.learned],
    quiz: [],
    reference: ref(t.slug),
    sample: t.sample,
    checkWidth: t.checkWidth,
  });

const page = (html: string, css = "body {\n  font-family: Verdana, sans-serif;\n  margin: 16px;\n}\n", js = ""): ProjectFiles => ({ html, css, js });
const ok: Check = { kind: "structureOk", message: "Помощник в консоли молчит: структура в порядке", fix: "Посмотри подсказки в консоли — у каждой есть строка и причина." };

// ---------------------------------------------------------------- Задачник 1
const z1: TaskSpec[] = [
  {
    slug: "z1-zagolovki",
    title: "Заголовок и два абзаца",
    task: "Напиши на пустой странице заголовок «Мой день» и два абзаца: что ты делаешь утром и что вечером.",
    why: "<h1> — главный заголовок страницы, он один. Каждый абзац — отдельный <p>: так браузер ставит между ними отступ, и текст легко читать.",
    steps: ["Напиши <h1>Мой день</h1>.", "Под ним — <p> про утро.", "И ещё один <p> про вечер."],
    starter: page("<!-- Задача: заголовок «Мой день» и два абзаца -->\n\n"),
    checks: [
      { kind: "text", selector: "h1", minLength: 3, message: "Есть заголовок h1", fix: "Напиши <h1>Мой день</h1>." },
      { kind: "count", selector: "p", min: 2, message: "Есть два абзаца p", fix: "Добавь два абзаца: <p>…</p> и ещё <p>…</p>." },
      ok,
    ],
    hints: ["Каждый абзац — свой <p>…</p>, а заголовок — <h1>…</h1>.", "Например: <h1>Мой день</h1> <p>Утром я…</p> <p>Вечером я…</p>"],
    learned: "Заголовок — <h1>, каждый абзац — свой <p>.",
  },
  {
    slug: "z1-cveta",
    title: "Раскрась страницу",
    task: "Сделай фон страницы lightyellow, заголовок — tomato, а абзацы — navy.",
    why: "Каждое CSS-правило отвечает на два вопроса: кого оформляем (body, h1, p) и что меняем (background-color или color). Фон всей страницы задают у body.",
    steps: ["Правило body { } — фон: background-color: lightyellow;", "Правило h1 { } — color: tomato;", "Правило p { } — color: navy;"],
    starter: page("<h1>Моё лето</h1>\n<p>Я ездил на море.</p>\n<p>Я научился плавать.</p>\n", "/* Задача: фон lightyellow, заголовок tomato, абзацы navy */\n"),
    focusFile: "css",
    checks: [
      { kind: "styleIs", selector: "body", property: "background-color", values: ["rgb(255, 255, 224)"], message: "Фон страницы lightyellow", fix: "body { background-color: lightyellow; }" },
      { kind: "styleIs", selector: "h1", property: "color", values: ["rgb(255, 99, 71)"], message: "Заголовок tomato", fix: "h1 { color: tomato; }" },
      { kind: "styleIs", selector: "p", property: "color", values: ["rgb(0, 0, 128)"], message: "Абзацы navy", fix: "p { color: navy; }" },
    ],
    hints: ["Три правила: body, h1 и p.", "body { background-color: lightyellow; } h1 { color: tomato; } p { color: navy; }"],
    learned: "Правило CSS: кого оформляем { что меняем: значение; }.",
  },
  {
    slug: "z1-kartochka",
    title: "Две одинаковые карточки",
    task: "Сделай из двух блоков две одинаковые карточки: у обоих класс card, белый фон, отступ внутри 16px и скруглённые углы 12px.",
    why: "Одинаковым элементам дают один класс — тогда одно правило .card оформляет их все сразу. Если дать card1 и card2, пришлось бы писать два одинаковых правила.",
    steps: ["Добавь обоим блокам class=\"card\".", "Напиши правило .card { } с background-color: white; padding: 16px; border-radius: 12px;"],
    starter: page(
      "<div>Мой кот любит спать.</div>\n<div>Мой кот любит играть.</div>\n",
      "body {\n  font-family: Verdana, sans-serif;\n  margin: 16px;\n  background-color: #e7f5ff;\n}\n",
    ),
    checks: [
      { kind: "count", selector: ".card", min: 2, max: 2, message: "Два блока с классом card", fix: "Добавь обоим <div> атрибут class=\"card\"." },
      { kind: "styleNot", selector: ".card", property: "padding-top", values: ["0px"], message: "У карточек есть отступ внутри", fix: "В правило .card добавь padding: 16px;" },
      { kind: "styleNot", selector: ".card", property: "border-top-left-radius", values: ["0px"], message: "У карточек скруглены углы", fix: "В правило .card добавь border-radius: 12px;" },
      ok,
    ],
    hints: ["Класс пишут в открывающем теге: <div class=\"card\">.", ".card { background-color: white; padding: 16px; border-radius: 12px; }"],
    learned: "Одинаковым элементам — один класс и одно правило.",
  },
  {
    slug: "z1-knopka",
    title: "Кнопка-приветствие",
    task: "Сделай так, чтобы при нажатии на кнопку «Поздороваться» в абзаце под ней появлялось «Привет!».",
    why: "Любая кнопка на JavaScript — три шага: найти элементы (querySelector), слушать нажатие (addEventListener) и изменить текст (textContent).",
    steps: ["Найди кнопку: const button = document.querySelector(\"#hello\");", "Найди абзац: const answer = document.querySelector(\"#answer\");", "Слушай нажатие и меняй answer.textContent на «Привет!»."],
    starter: page('<button id="hello">Поздороваться</button>\n<p id="answer"></p>\n', undefined, "// Задача: при нажатии на #hello в #answer появляется «Привет!»\n"),
    focusFile: "js",
    checks: [
      {
        kind: "scenario",
        steps: [{ expect: { selector: "#answer", equals: "" } }, { click: "#hello" }, { expect: { selector: "#answer", equals: "Привет!" } }],
        message: "После нажатия в абзаце «Привет!»",
        fix: "button.addEventListener(\"click\", function () { answer.textContent = \"Привет!\"; });",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь id в querySelector — с решёткой, как в HTML." },
    ],
    hints: ["Три шага: найти, слушать, менять.", "button.addEventListener(\"click\", function () { answer.textContent = \"Привет!\"; });"],
    learned: "Кнопка = найти элементы + слушать нажатие + поменять текст.",
  },
  {
    slug: "z1-schetchik",
    title: "Обратный отсчёт",
    task: "Сделай кнопку «−1»: каждое нажатие уменьшает число на 1. Начинаем с 10.",
    why: "Число хранится в переменной let count = 10 — let, потому что оно меняется. После каждого изменения переменной нужно показать новое значение на странице: сама страница не обновится.",
    steps: ["В обработчике кнопки уменьши count: count = count - 1;", "Покажи новое значение: countText.textContent = count;"],
    starter: page(
      '<p>Осталось: <span id="count">10</span></p>\n<button id="minus">−1</button>\n',
      undefined,
      'let count = 10;\nconst countText = document.querySelector("#count");\nconst minus = document.querySelector("#minus");\n\nminus.addEventListener("click", function () {\n  // Задача: уменьши count на 1 и покажи его\n});\n',
    ),
    focusFile: "js",
    checks: [
      {
        kind: "scenario",
        steps: [{ click: "#minus", times: 3 }, { expect: { selector: "#count", equals: "7" } }],
        message: "После трёх нажатий — 7",
        fix: "count = count - 1; countText.textContent = count;",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь, что обе строки внутри фигурных скобок обработчика." },
    ],
    hints: ["Уменьшить: count = count - 1;", "Показать: countText.textContent = count;"],
    learned: "Изменил переменную — покажи её на странице.",
  },
  {
    slug: "z1-dizajn",
    title: "Кнопка с эффектом",
    task: "Оформи кнопку .btn: тень и другой цвет фона, когда на неё наводят курсор.",
    why: "Тень (box-shadow) делает кнопку «объёмной», а правило .btn:hover работает только пока курсор над кнопкой — так игрок понимает, что на неё можно нажать.",
    steps: ["В правило .btn добавь box-shadow, например 0 4px 10px rgba(0, 0, 0, 0.2);", "Напиши правило .btn:hover { } с другим background-color."],
    starter: page(
      '<button class="btn">Купить мороженое</button>\n',
      "body {\n  font-family: Verdana, sans-serif;\n  margin: 16px;\n}\n\n.btn {\n  background-color: #ffd43b;\n  border: none;\n  border-radius: 12px;\n  padding: 12px 20px;\n  font-size: 18px;\n}\n",
    ),
    focusFile: "css",
    checks: [
      { kind: "styleNot", selector: ".btn", property: "box-shadow", values: ["none"], message: "У кнопки есть тень", fix: "В .btn добавь box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);" },
      { kind: "source", file: "css", pattern: "\\.btn:hover\\s*\\{", message: "Есть правило для наведения .btn:hover", fix: "Напиши .btn:hover { background-color: orange; }" },
      ok,
    ],
    hints: ["box-shadow — в правило .btn, а новый цвет — в отдельное правило .btn:hover.", ".btn:hover { background-color: orange; }"],
    learned: ":hover — стиль, пока курсор над элементом; box-shadow — тень.",
  },
];

// ---------------------------------------------------------------- Задачник 2
const z2: TaskSpec[] = [
  {
    slug: "z2-karkas",
    title: "Каркас за минуту",
    task: "Собери каркас страницы: шапка с заголовком, основная часть с абзацем и подвал с подписью — в правильном порядке.",
    why: "Порядок в коде — это порядок на странице, а <main> один. Каркас header → main → footer есть почти у каждого сайта: начинать вёрстку стоит с него.",
    steps: ["<header> с <h1> внутри.", "<main> с <p> внутри.", "<footer> с <p> внутри."],
    starter: page("<!-- Задача: header (h1) → main (p) → footer (p) -->\n\n"),
    checks: [
      { kind: "order", selectors: ["header", "main", "footer"], message: "Порядок: header, main, footer", fix: "Сначала <header>, потом <main>, в конце <footer>." },
      { kind: "exists", selector: "header h1", message: "В шапке есть h1", fix: "<header> <h1>…</h1> </header>" },
      { kind: "exists", selector: "footer p", message: "В подвале есть p", fix: "<footer> <p>…</p> </footer>" },
      { kind: "count", selector: "main", min: 1, max: 1, message: "Один main", fix: "На странице один <main>." },
      ok,
    ],
    hints: ["Три коробки по порядку, и в каждой — свой тег.", "<header><h1>…</h1></header> <main><p>…</p></main> <footer><p>…</p></footer>"],
    learned: "Каркас: header → main → footer.",
  },
  {
    slug: "z2-menyu-spisok",
    title: "Меню из списка",
    task: "Сделай меню в шапке как настоящие сайты: внутри <nav> — список <ul>, в нём три пункта <li> со ссылками на три раздела.",
    why: "Меню — это список ссылок, поэтому его часто делают списком ul: так понятнее и программам для незрячих людей — они объявляют «список из трёх пунктов».",
    steps: ["В <header> напиши <nav> и внутри <ul>.", "Три пункта <li>, в каждом <a href=\"#…\"> на раздел.", "id разделов уже есть: a, b, c."],
    starter: page(
      '<header>\n  <h1>Мой сайт</h1>\n  <!-- Задача: меню — nav > ul > li > a -->\n</header>\n\n<main>\n  <section id="a"><h2>Раздел А</h2></section>\n  <section id="b"><h2>Раздел Б</h2></section>\n  <section id="c"><h2>Раздел В</h2></section>\n</main>\n',
    ),
    checks: [
      { kind: "count", selector: "nav ul li a", min: 3, message: "В меню три пункта списка со ссылками", fix: "<nav><ul><li><a href=\"#a\">А</a></li> … </ul></nav>" },
      { kind: "anchorsResolve", selector: "nav", min: 3, message: "Все ссылки ведут на разделы", fix: "href=\"#a\", \"#b\", \"#c\" — как id разделов." },
      ok,
    ],
    hints: ["Вложенность: nav → ul → li → a.", "<li><a href=\"#a\">Раздел А</a></li> — и так три раза."],
    learned: "Меню — это список ссылок: nav > ul > li > a.",
  },
  {
    slug: "z2-galereya",
    title: "Галерея из трёх картинок",
    task: "Сделай галерею: в контейнере .gallery три картинки из библиотеки, каждая с описанием alt. Картинки стоят в ряд с промежутком.",
    why: "Контейнер-родитель расставляет детей: display: flex и gap пишут ему. alt нужен каждой картинке — его читают программы для незрячих.",
    steps: ["Напиши <div class=\"gallery\"> и вставь три картинки (кнопка «Картинки»).", "Каждой картинке — своё описание alt.", "В CSS: .gallery { display: flex; gap: 12px; }"],
    starter: page("<h1>Мои любимые вещи</h1>\n<!-- Задача: div.gallery с тремя картинками -->\n\n"),
    checks: [
      { kind: "count", selector: ".gallery > img", min: 3, max: 3, message: "В .gallery три картинки", fix: "Внутри <div class=\"gallery\"> — три <img>." },
      { kind: "count", selector: "img:not([alt]), img[alt='']", min: 0, max: 0, message: "У каждой картинки есть alt", fix: "Добавь каждой <img> описание alt=\"…\"." },
      { kind: "styleIs", selector: ".gallery", property: "display", values: ["flex"], message: "Картинки в ряд", fix: ".gallery { display: flex; }" },
      { kind: "styleNot", selector: ".gallery", property: "column-gap", values: ["normal", "0px"], message: "Между картинками промежуток", fix: "В .gallery добавь gap: 12px;" },
    ],
    hints: ["Картинки копируй из библиотеки — кнопка «Картинки» над кодом.", ".gallery { display: flex; gap: 12px; }"],
    learned: "Родитель расставляет детей: flex и gap — контейнеру.",
  },
  {
    slug: "z2-centr",
    title: "Блок по центру",
    task: "Поставь блок .box по центру страницы: не шире 400px, текст внутри тоже по центру.",
    why: "max-width ограничивает ширину, а margin: 0 auto делит свободное место слева и справа поровну — блок встаёт по центру. text-align центрирует текст внутри блока, но не сам блок.",
    steps: ["В .box: max-width: 400px;", "И margin: 0 auto; — блок по центру.", "И text-align: center; — текст по центру."],
    starter: page(
      '<div class="box">\n  <h2>Привет!</h2>\n  <p>Я стою по центру страницы.</p>\n</div>\n',
      "body {\n  font-family: Verdana, sans-serif;\n  margin: 16px;\n}\n\n.box {\n  background-color: #e7f5ff;\n  padding: 16px;\n}\n",
    ),
    focusFile: "css",
    checks: [
      { kind: "styleNot", selector: ".box", property: "max-width", values: ["none"], message: "Ширина блока ограничена", fix: "В .box: max-width: 400px;" },
      { kind: "source", file: "css", pattern: "margin(-left|-right)?\\s*:[^;]*\\bauto\\b", message: "Блок по центру (margin: 0 auto)", fix: "В .box: margin: 0 auto;" },
      { kind: "styleIs", selector: ".box", property: "text-align", values: ["center"], message: "Текст по центру", fix: "В .box: text-align: center;" },
    ],
    hints: ["Три строки в правиле .box: ширина, центр блока, центр текста.", "max-width: 400px; margin: 0 auto; text-align: center;"],
    learned: "margin: 0 auto — блок по центру; text-align — текст по центру.",
  },
  {
    slug: "z2-otstupy",
    title: "Отступы между карточками",
    task: "Три карточки стоят вплотную. Дай каждой отступ внутри 12px и отступ снаружи снизу 16px.",
    why: "padding — отступ внутри, от края до текста; margin — снаружи, он отодвигает соседей. Нужны оба: без padding текст прилипает к краю, без margin карточки слипаются.",
    steps: ["В правило .card добавь padding: 12px;", "И margin-bottom: 16px;"],
    starter: page(
      '<div class="card">Понедельник — рисование</div>\n<div class="card">Среда — плавание</div>\n<div class="card">Пятница — шахматы</div>\n',
      "body {\n  font-family: Verdana, sans-serif;\n  margin: 16px;\n}\n\n.card {\n  background-color: #fff3bf;\n  border-radius: 10px;\n}\n",
    ),
    focusFile: "css",
    checks: [
      { kind: "styleNot", selector: ".card", property: "padding-top", values: ["0px"], message: "Отступ внутри карточек", fix: "В .card: padding: 12px;" },
      { kind: "styleNot", selector: ".card", property: "margin-bottom", values: ["0px"], message: "Отступ между карточками", fix: "В .card: margin-bottom: 16px;" },
      { kind: "stacked", selector: ".card", direction: "vertical", message: "Карточки стоят друг под другом", fix: "Не ставь карточки в ряд — оставь их столбиком." },
    ],
    hints: ["padding — внутри, margin — снаружи.", ".card { padding: 12px; margin-bottom: 16px; }"],
    learned: "padding — отступ внутри, margin — снаружи.",
  },
  {
    slug: "z2-perenos",
    title: "Ряд, который переносится",
    task: "Четыре карточки в ряд вылезают за край телефона. Сделай так, чтобы они переносились на новую строку. Проверка смотрит на ширине телефона.",
    why: "flex-wrap: wrap разрешает блокам ряда переходить на новую строку, когда им не хватает места. Без этого ряд упрямо стоит в одну линию и вылезает за край.",
    steps: ["В правило .cards добавь flex-wrap: wrap;", "Сузь окно результата или проверь — на телефоне всё должно помещаться."],
    starter: page(
      '<div class="cards">\n  <div class="card">Мяч</div>\n  <div class="card">Ракетка</div>\n  <div class="card">Шайба</div>\n  <div class="card">Клюшка</div>\n</div>\n',
      "body {\n  font-family: Verdana, sans-serif;\n  margin: 16px;\n}\n\n.cards {\n  display: flex;\n  gap: 12px;\n}\n\n.card {\n  flex: none;\n  width: 130px;\n  padding: 12px;\n  background-color: #d3f9d8;\n  border-radius: 10px;\n}\n",
    ),
    focusFile: "css",
    checkWidth: 360,
    checks: [
      { kind: "styleIs", selector: ".cards", property: "flex-wrap", values: ["wrap"], message: "Карточки переносятся", fix: "В .cards: flex-wrap: wrap;" },
      { kind: "noOverflow", message: "На телефоне ничего не вылезает за край", fix: "Добавь flex-wrap: wrap; в правило .cards." },
    ],
    hints: ["Перенос включают у контейнера .cards.", ".cards { flex-wrap: wrap; }"],
    learned: "flex-wrap: wrap — ряд переносится на новую строку.",
  },
];

// ---------------------------------------------------------------- Сверстай по образцу
const ob: TaskSpec[] = [
  {
    slug: "o-vizitka",
    title: "Визитка робота Кью",
    task: "Сверстай визитку как на образце: белая карточка по центру с тенью, в ней заголовок, абзац и список из трёх умений.",
    why: "Работа по образцу — главный навык верстальщика: сначала разбери, из каких блоков состоит страница (карточка → заголовок, абзац, список), потом пиши код сверху вниз.",
    steps: ["Карточка: <div class=\"vizitka\"> и внутри h1, p, ul с тремя li.", "CSS: max-width, margin: 0 auto, фон white, padding, border-radius, box-shadow."],
    starter: page("<!-- Сверстай по образцу: карточка .vizitka (h1, p, ul с тремя li) -->\n\n", "body {\n  font-family: Verdana, sans-serif;\n  margin: 16px;\n  background-color: #e7f5ff;\n}\n"),
    sample: true,
    checks: [
      { kind: "exists", selector: ".vizitka h1", message: "В визитке есть заголовок", fix: "<div class=\"vizitka\"> <h1>…</h1> …" },
      { kind: "count", selector: ".vizitka li", min: 3, message: "Три умения списком", fix: "<ul> с тремя <li> внутри визитки." },
      { kind: "styleNot", selector: ".vizitka", property: "max-width", values: ["none"], message: "Ширина визитки ограничена", fix: ".vizitka { max-width: 320px; }" },
      { kind: "styleNot", selector: ".vizitka", property: "box-shadow", values: ["none"], message: "У визитки есть тень", fix: ".vizitka { box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15); }" },
      ok,
    ],
    hints: ["Разбери образец сверху вниз: карточка, в ней заголовок, абзац, список.", ".vizitka { max-width: 320px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 16px; box-shadow: … }"],
    learned: "Сначала разбери образец на блоки, потом пиши код.",
  },
  {
    slug: "o-menyu-kafe",
    title: "Меню кафе",
    task: "Сверстай меню кафе: заголовок по центру, два раздела — «Напитки» и «Десерты», в каждом список из трёх блюд с ценами.",
    why: "Раздел = <section> с заголовком <h2>. Повторяющиеся части (два одинаковых раздела) строятся одинаково — и оформляются одним правилом.",
    steps: ["<h1> по центру (text-align: center).", "Два <section>: в каждом <h2> и <ul> с тремя <li>.", "Оформи разделы: фон, отступы, скругление."],
    starter: page("<!-- Сверстай по образцу: h1 и два раздела section (h2 + ul из трёх li) -->\n\n"),
    sample: true,
    checks: [
      { kind: "styleIs", selector: "h1", property: "text-align", values: ["center"], message: "Заголовок по центру", fix: "h1 { text-align: center; }" },
      { kind: "count", selector: "section", min: 2, message: "Два раздела", fix: "Два <section> — «Напитки» и «Десерты»." },
      { kind: "count", selector: "section li", min: 6, message: "По три блюда в каждом разделе", fix: "В каждом разделе <ul> с тремя <li>." },
      ok,
    ],
    hints: ["Два одинаковых раздела: section → h2 + ul.", "section { background-color: white; padding: 12px; border-radius: 12px; margin-bottom: 12px; }"],
    learned: "Одинаковые части строятся одинаково и оформляются одним правилом.",
  },
  {
    slug: "o-pitomec",
    title: "Страница питомца",
    task: "Сверстай страницу питомца: шапка с заголовком и меню из двух ссылок, раздел с фото (картинка из библиотеки), раздел с тремя фактами списком и подвал.",
    why: "Это полный каркас сайта: header с nav, main с разделами, footer. Меню ведёт на разделы по id — так работает навигация по странице.",
    steps: ["header: h1 и nav с двумя ссылками.", "main: section#foto с картинкой и section#fakty со списком.", "footer с подписью."],
    starter: page("<!-- Сверстай по образцу: header (h1 + nav) → main (section#foto, section#fakty) → footer -->\n\n"),
    sample: true,
    checks: [
      { kind: "anchorsResolve", selector: "nav", min: 2, message: "Меню ведёт на разделы", fix: "Ссылки <a href=\"#foto\"> и <a href=\"#fakty\">." },
      { kind: "attr", selector: "#foto img", attribute: "alt", minLength: 3, message: "В разделе фото картинка с описанием", fix: "В section#foto — картинка из библиотеки с alt." },
      { kind: "count", selector: "#fakty li", min: 3, message: "Три факта списком", fix: "В section#fakty — <ul> с тремя <li>." },
      { kind: "order", selectors: ["header", "main", "footer"], message: "Каркас по порядку", fix: "header → main → footer." },
      ok,
    ],
    hints: ["Каркас: header → main → footer, разделы с id внутри main.", "Картинку кота возьми в библиотеке: kartinki/kot.svg."],
    learned: "Полный каркас: шапка с меню, разделы с id, подвал.",
  },
  {
    slug: "o-galereya",
    title: "Галерея-сетка",
    task: "Сверстай галерею: заголовок и шесть картинок из библиотеки, которые стоят рядами и переносятся. У каждой картинки — alt.",
    why: "Когда картинок много, flex-wrap: wrap сам раскладывает их по строкам. Одинаковая ширина картинок делает ряды ровными.",
    steps: ["<div class=\"gallery\"> с шестью картинками.", "CSS: .gallery { display: flex; flex-wrap: wrap; gap: … }", "Картинкам — одинаковая ширина, например .gallery img { width: 90px; }"],
    starter: page("<!-- Сверстай по образцу: h1 и div.gallery с шестью картинками -->\n\n"),
    sample: true,
    checks: [
      { kind: "count", selector: ".gallery img", min: 6, message: "Шесть картинок в галерее", fix: "Вставь в .gallery шесть картинок из библиотеки." },
      { kind: "count", selector: "img:not([alt]), img[alt='']", min: 0, max: 0, message: "У всех картинок есть alt", fix: "Каждой <img> — описание alt." },
      { kind: "styleIs", selector: ".gallery", property: "display", values: ["flex"], message: "Картинки в ряд", fix: ".gallery { display: flex; }" },
      { kind: "styleIs", selector: ".gallery", property: "flex-wrap", values: ["wrap"], message: "Ряды переносятся", fix: ".gallery { flex-wrap: wrap; }" },
      ok,
    ],
    hints: ["Галерея = контейнер с display: flex и flex-wrap: wrap.", ".gallery img { width: 90px; background-color: white; padding: 8px; border-radius: 10px; }"],
    learned: "flex-wrap раскладывает много блоков по рядам.",
  },
  {
    slug: "o-landing",
    title: "Лендинг игры",
    task: "Сверстай рекламную страницу игры: яркая шапка по центру с заголовком и кнопкой «Играть», три карточки-преимущества в ряд и подвал.",
    why: "Лендинг — страница, которая продаёт одну вещь. У него всегда яркий первый экран с главной кнопкой и блок преимуществ — карточки в ряд.",
    steps: ["header: фон, text-align: center, h1, p и <button>Играть</button>.", "section.features: три div.feature в ряд (flex).", "footer с подписью."],
    starter: page("<!-- Сверстай по образцу: header (h1, p, button) → section.features (3 × div.feature) → footer -->\n\n"),
    sample: true,
    checks: [
      { kind: "styleIs", selector: "header", property: "text-align", values: ["center"], message: "Шапка по центру", fix: "header { text-align: center; }" },
      { kind: "exists", selector: "header button", message: "В шапке кнопка «Играть»", fix: "<button>Играть</button> внутри <header>." },
      { kind: "count", selector: ".features > .feature", min: 3, max: 3, message: "Три преимущества", fix: "<section class=\"features\"> и в нём три <div class=\"feature\">." },
      { kind: "styleIs", selector: ".features", property: "display", values: ["flex"], message: "Преимущества в ряд", fix: ".features { display: flex; gap: 12px; }" },
      ok,
    ],
    hints: ["Первый экран — header, преимущества — section.features с тремя .feature.", ".features { display: flex; gap: 12px; } .feature { flex: 1; … }"],
    learned: "Лендинг: яркий первый экран с кнопкой и блок преимуществ.",
  },
  {
    slug: "o-portfolio",
    title: "Портфолио — и на телефоне",
    task: "Сверстай портфолио: шапка с меню из трёх ссылок, раздел «Работы» с четырьмя карточками (картинка и заголовок h3), раздел «Контакты». Страница должна помещаться на экране телефона.",
    why: "Настоящий сайт смотрят и с компьютера, и с телефона. Ряд карточек с flex-wrap и картинки с max-width: 100% подстраиваются под любой экран.",
    steps: ["header: h1 и nav с ссылками на #raboty, #kontakty и #o-sebe.", "main: section#o-sebe, section#raboty с .cards (4 × .card: img + h3), section#kontakty.", "CSS: flex-wrap у .cards, img { max-width: 100%; }"],
    starter: page("<!-- Сверстай по образцу: header (h1 + nav из трёх ссылок) → main (#o-sebe, #raboty с .cards, #kontakty) -->\n\n"),
    sample: true,
    checkWidth: 360,
    checks: [
      { kind: "anchorsResolve", selector: "nav", min: 3, message: "Меню из трёх ссылок ведёт на разделы", fix: "Три ссылки в <nav> и разделы с такими же id." },
      { kind: "count", selector: ".cards > .card", min: 4, message: "Четыре работы карточками", fix: "В .cards — четыре <div class=\"card\">." },
      { kind: "count", selector: ".card h3", min: 4, message: "У каждой работы заголовок h3", fix: "В каждой карточке — <h3>." },
      { kind: "noOverflow", message: "На телефоне ничего не вылезает за край", fix: "flex-wrap: wrap у .cards и img { max-width: 100%; }" },
      ok,
    ],
    hints: ["Каркас как на странице питомца, плюс ряд карточек с переносом.", ".cards { display: flex; flex-wrap: wrap; gap: 12px; } img { max-width: 100%; }"],
    learned: "Сайт проверяют и на компьютере, и на телефоне.",
  },
];

export const courseZadachnik1: Lesson[] = z1.map((t, i) => task("zadachnik-1")(t, i + 1));
export const courseZadachnik2: Lesson[] = z2.map((t, i) => task("zadachnik-2")(t, i + 1));
export const courseObrazec: Lesson[] = ob.map((t, i) => task("obrazec")(t, i + 1));
