import type { Lesson, ProjectFiles } from "./types";
import referencesJson from "./references.json";

/**
 * Курс 4 «Профессиональная вёрстка»: приёмы, которыми пользуются настоящие верстальщики.
 * CSS Grid, позиционирование, sticky, переменные CSS, плавность и анимации, формы и их проверка,
 * таблицы, доступность (сайт для всех) и финальный лендинг. Каждый урок — своя небольшая страница.
 * Многостраничные сайты — позже, вместе с доработкой студии (сейчас проект — одна страница).
 */
const references = referencesJson as Record<string, ProjectFiles>;
const ref = (slug: string): ProjectFiles => {
  const r = references[slug];
  if (!r) throw new Error(`Нет эталонного решения для урока ${slug}`);
  return r;
};
const C = "pro-verstka";
const B = "body {\n  font-family: Verdana, sans-serif;\n  margin: 16px;\n}\n";

export const course4: Lesson[] = [
  {
    track: "practice",
    course: C,
    slug: "pro-grid",
    number: 1,
    title: "Сетка: CSS Grid",
    goal: "Ты разложишь шесть карточек ровной сеткой — три колонки и два ряда.",
    explanation: [
      "Flexbox ставит блоки в одну линию — ряд или столбик. CSS Grid — сетка: строки и колонки сразу, как клетки в тетради. Для галерей, каталогов и целых страниц её используют чаще всего.",
      "Сетку включают у контейнера: display: grid. Колонки задаёт grid-template-columns: repeat(3, 1fr) — «три колонки, каждая по одной доле». fr — доля свободного места. Расстояние между клетками — gap, как у flex.",
    ],
    newTerms: ["css-grid"],
    practice: [
      {
        kind: "choice",
        question: "Что значит grid-template-columns: repeat(4, 1fr) ?",
        options: ["Четыре колонки равной ширины", "Четыре ряда", "Одна колонка шириной 4"],
        correct: 0,
        explain: "repeat(4, 1fr) — четыре колонки, каждая по одной доле.",
      },
      {
        kind: "fill",
        prompt: "Включи сетку у контейнера.",
        before: ".gallery { display: ",
        after: "; }",
        answers: ["grid"],
        explain: "display: grid — сетка, display: flex — ряд.",
      },
    ],
    steps: [
      "В правило .gallery добавь display: grid;",
      "Задай три колонки: grid-template-columns: repeat(3, 1fr);",
      "Добавь промежутки: gap: 12px;",
    ],
    starter: {
      html: `<h1>Мои достижения</h1>
<div class="gallery">
  <div class="item">🏅 Бег</div>
  <div class="item">🎨 Рисунок</div>
  <div class="item">♟️ Шахматы</div>
  <div class="item">🏊 Плавание</div>
  <div class="item">📚 Чтение</div>
  <div class="item">💻 Код</div>
</div>
`,
      css: `${B}
.gallery {
}

.item {
  background-color: #e7f5ff;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}
`,
      js: "",
    },
    focusFile: "css",
    hints: [
      "Все три строки пишутся в правило .gallery — это контейнер.",
      "display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;",
      "Проверь: в окне результата должно быть два ряда по три карточки.",
    ],
    checks: [
      { kind: "styleIs", selector: ".gallery", property: "display", values: ["grid"], message: "Контейнер — сетка (display: grid)", fix: "В .gallery: display: grid;" },
      {
        kind: "styleMatches",
        selector: ".gallery",
        property: "grid-template-columns",
        pattern: "^[\\d.]+px [\\d.]+px [\\d.]+px$",
        message: "В сетке три колонки",
        fix: "В .gallery: grid-template-columns: repeat(3, 1fr);",
      },
      { kind: "styleNot", selector: ".gallery", property: "column-gap", values: ["normal", "0px"], message: "Между клетками промежутки", fix: "В .gallery: gap: 12px;" },
    ],
    learned: [
      "Grid — сетка из строк и колонок сразу.",
      "grid-template-columns: repeat(3, 1fr) — три равные колонки.",
      "fr — доля свободного места.",
    ],
    quiz: [
      {
        question: "Чем Grid отличается от Flexbox?",
        options: ["Grid раскладывает по строкам и колонкам сразу, Flexbox — в одну линию", "Ничем", "Grid только для картинок"],
        correct: 0,
        explain: "Flexbox — одно направление, Grid — два.",
      },
      {
        question: "Что такое 1fr?",
        options: ["Одна доля свободного места", "Один пиксель", "Один ряд"],
        correct: 0,
        explain: "1fr 2fr — вторая колонка вдвое шире первой.",
      },
    ],
    reference: ref("pro-grid"),
  },
  {
    track: "practice",
    course: C,
    slug: "pro-grid-oblasti",
    number: 2,
    title: "Сетка страницы: области",
    goal: "Ты разметишь всю страницу сеткой: шапка, меню сбоку, содержание и подвал.",
    explanation: [
      "Сеткой раскладывают не только карточки, но и всю страницу. Самый наглядный способ — области: grid-template-areas рисует «карту» страницы словами, а каждый блок получает своё место через grid-area.",
      "Запись \"header header\" \"menu content\" \"footer footer\" — это три строки по две колонки: шапка во всю ширину, меню и содержание рядом, подвал во всю ширину.",
    ],
    newTerms: ["grid-areas"],
    practice: [
      {
        kind: "choice",
        question: "Сколько колонок в этой карте?",
        code: 'grid-template-areas:\n  "header header"\n  "menu content";',
        options: ["2", "4", "1"],
        correct: 0,
        explain: "В каждой строке карты по два слова — значит, две колонки.",
      },
      {
        kind: "fill",
        prompt: "Поставь меню в область menu.",
        before: "aside { grid-area: ",
        after: "; }",
        answers: ["menu"],
        explain: "grid-area — имя области из карты.",
      },
    ],
    steps: [
      "В .page: display: grid; grid-template-columns: 160px 1fr;",
      "Нарисуй карту: grid-template-areas: \"header header\" \"menu content\" \"footer footer\";",
      "Раздай места: header { grid-area: header; } aside { grid-area: menu; } main { grid-area: content; } footer { grid-area: footer; }",
    ],
    starter: {
      html: `<div class="page">
  <header>Шапка: Мой блог</header>
  <aside>Меню: О себе · Статьи</aside>
  <main>Здесь статьи блога.</main>
  <footer>Подвал</footer>
</div>
`,
      css: `${B}
.page {
  gap: 8px;
}

header, aside, main, footer {
  background-color: #e7f5ff;
  padding: 16px;
  border-radius: 10px;
}
`,
      js: "",
    },
    focusFile: "css",
    hints: [
      "Карту и колонки пишут контейнеру .page, а имена областей — каждому блоку.",
      "Колонки: grid-template-columns: 160px 1fr; карта — три строки в кавычках.",
      "header { grid-area: header; } и так же для aside (menu), main (content), footer (footer).",
    ],
    checks: [
      { kind: "styleIs", selector: ".page", property: "display", values: ["grid"], message: "Страница — сетка", fix: "В .page: display: grid;" },
      {
        kind: "styleMatches",
        selector: ".page",
        property: "grid-template-areas",
        pattern: "header.*menu.*content.*footer",
        message: "Нарисована карта областей",
        fix: "grid-template-areas: \"header header\" \"menu content\" \"footer footer\";",
      },
      { kind: "styleIs", selector: "aside", property: "grid-row-start", values: ["menu"], message: "Меню стоит в своей области", fix: "aside { grid-area: menu; }" },
      { kind: "styleIs", selector: "main", property: "grid-row-start", values: ["content"], message: "Содержание стоит в своей области", fix: "main { grid-area: content; }" },
    ],
    learned: [
      "grid-template-areas — карта страницы словами.",
      "grid-area ставит блок в его область.",
      "Сеткой раскладывают целые страницы.",
    ],
    quiz: [
      {
        question: "Как сделать шапку во всю ширину в сетке из двух колонок?",
        options: ["Написать её имя дважды в строке карты: \"header header\"", "Дать ей width: 100%", "Никак"],
        correct: 0,
        explain: "Повтор имени в строке растягивает область на несколько колонок.",
      },
      {
        question: "Где пишут grid-template-areas?",
        options: ["У контейнера-сетки", "У каждого блока", "В HTML"],
        correct: 0,
        explain: "Карта — у контейнера, а имена областей (grid-area) — у блоков.",
      },
    ],
    reference: ref("pro-grid-oblasti"),
  },
  {
    track: "practice",
    course: C,
    slug: "pro-poziciya",
    number: 3,
    title: "Значок в углу: position",
    goal: "Ты прикрепишь значок «Новинка!» в угол карточки — точно на своё место.",
    explanation: [
      "Обычно блоки стоят друг за другом. Но иногда элемент нужно поставить точно в определённое место — например, значок в угол карточки. Для этого есть position.",
      "Пара, которую используют чаще всего: родителю — position: relative (он становится «точкой отсчёта»), а значку — position: absolute и координаты top, right, bottom или left от краёв родителя.",
    ],
    newTerms: ["position"],
    practice: [
      {
        kind: "choice",
        question: "От чего отсчитывается top у элемента с position: absolute?",
        options: ["От ближайшего родителя с position: relative", "Всегда от верха экрана", "От соседнего элемента"],
        correct: 0,
        explain: "Поэтому родителю и ставят relative — он становится точкой отсчёта.",
      },
      {
        kind: "fill",
        prompt: "Вынь значок из потока и поставь точно.",
        before: ".badge { position: ",
        after: "; }",
        answers: ["absolute"],
        explain: "absolute — элемент встаёт по координатам.",
      },
    ],
    steps: [
      "Карточке .card: position: relative;",
      "Значку .badge: position: absolute; top: -10px; right: -10px;",
    ],
    starter: {
      html: `<div class="card">
  <span class="badge">Новинка!</span>
  <h2>Конструктор «Ракета»</h2>
  <p>200 деталей и инструкция.</p>
</div>
`,
      css: `${B}
.card {
  max-width: 260px;
  margin: 24px;
  background-color: #e7f5ff;
  padding: 16px;
  border-radius: 12px;
}

.badge {
  background-color: #fa5252;
  color: white;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 13px;
}
`,
      js: "",
    },
    focusFile: "css",
    hints: [
      "Две половины: relative у родителя (.card) и absolute у значка (.badge).",
      "Координаты значка: top: -10px; right: -10px; — чуть за краем карточки.",
      ".card { position: relative; } .badge { position: absolute; top: -10px; right: -10px; }",
    ],
    checks: [
      { kind: "styleIs", selector: ".card", property: "position", values: ["relative"], message: "Карточка — точка отсчёта (relative)", fix: "В .card: position: relative;" },
      { kind: "styleIs", selector: ".badge", property: "position", values: ["absolute"], message: "Значок поставлен точно (absolute)", fix: "В .badge: position: absolute;" },
      { kind: "styleNot", selector: ".badge", property: "top", values: ["auto"], message: "У значка есть координата сверху", fix: "В .badge: top: -10px; right: -10px;" },
    ],
    learned: [
      "position: relative у родителя — точка отсчёта.",
      "position: absolute + top/right — точное место.",
      "Так делают значки, бейджи и подписи на картинках.",
    ],
    quiz: [
      {
        question: "Значок улетел в угол всей страницы. Что забыли?",
        options: ["position: relative у карточки", "position: absolute у значка", "z-index"],
        correct: 0,
        explain: "Без relative у родителя точкой отсчёта становится вся страница.",
      },
      {
        question: "Что делает right: 0 у элемента с absolute?",
        options: ["Прижимает его к правому краю родителя", "Сдвигает вправо на 0 строк", "Ничего"],
        correct: 0,
        explain: "Координаты — расстояния от краёв родителя.",
      },
    ],
    reference: ref("pro-poziciya"),
  },
  {
    track: "practice",
    course: C,
    slug: "pro-sticky",
    number: 4,
    title: "Липкая шапка: sticky",
    goal: "Шапка с меню будет «прилипать» к верху экрана, пока ты листаешь страницу.",
    explanation: [
      "На длинных страницах меню удобно держать всегда под рукой. position: sticky делает элемент «липким»: он едет со страницей, пока не дойдёт до края экрана, а потом прилипает к нему.",
      "Нужно указать, к какому краю липнуть: top: 0. И дать шапке фон — иначе текст страницы будет просвечивать сквозь неё.",
    ],
    newTerms: ["sticky"],
    practice: [
      {
        kind: "choice",
        question: "Что сделает position: sticky; top: 0; у шапки?",
        options: ["Шапка прилипнет к верху экрана при прокрутке", "Шапка исчезнет", "Шапка встанет вниз"],
        correct: 0,
        explain: "sticky + top: 0 — прилипнуть к верху.",
      },
      {
        kind: "choice",
        question: "Зачем липкой шапке фон?",
        options: ["Чтобы текст страницы не просвечивал под ней", "Для красоты, он не обязателен", "Без фона sticky не работает"],
        correct: 0,
        explain: "Страница прокручивается под шапкой — без фона буквы наложатся.",
      },
    ],
    steps: ["В правило header добавь position: sticky; и top: 0;", "Прокрути окно результата: шапка должна остаться наверху."],
    starter: {
      html: `<header>
  <b>Энциклопедия динозавров</b>
  <nav><a href="#t-rex">Тираннозавр</a> · <a href="#triceratops">Трицератопс</a></nav>
</header>
<section id="t-rex"><h2>Тираннозавр</h2><p>Самый известный хищник. Длина — до 12 метров.</p><p>Жил около 66 миллионов лет назад.</p></section>
<section id="triceratops"><h2>Трицератопс</h2><p>Травоядный, с тремя рогами.</p><p>Весил как два слона.</p></section>
`,
      css: `body {
  font-family: Verdana, sans-serif;
  margin: 0;
}

header {
  background-color: #2f5be8;
  color: white;
  padding: 12px 16px;
}

header a {
  color: white;
}

section {
  padding: 16px;
  min-height: 400px;
}
`,
      js: "",
    },
    focusFile: "css",
    hints: [
      "Две строки в правило header.",
      "header { position: sticky; top: 0; }",
      "Если шапка прячется под текстом, добавь ей z-index: 1;",
    ],
    checks: [
      { kind: "styleIs", selector: "header", property: "position", values: ["sticky"], message: "Шапка липкая (sticky)", fix: "В header: position: sticky;" },
      { kind: "styleIs", selector: "header", property: "top", values: ["0px"], message: "Липнет к верху (top: 0)", fix: "В header: top: 0;" },
    ],
    learned: ["position: sticky — элемент прилипает к краю при прокрутке.", "Нужно указать край: top: 0.", "Липкой шапке нужен фон."],
    quiz: [
      {
        question: "Где липкая шапка особенно полезна?",
        options: ["На длинных страницах с меню", "На странице из одного абзаца", "Нигде"],
        correct: 0,
        explain: "Меню всегда под рукой, сколько ни листай.",
      },
      {
        question: "Чем sticky отличается от absolute?",
        options: ["sticky едет со страницей и прилипает у края, absolute стоит на месте по координатам", "Ничем", "absolute прилипает"],
        correct: 0,
        explain: "sticky — смесь обычного положения и прилипания.",
      },
    ],
    reference: ref("pro-sticky"),
  },
  {
    track: "practice",
    course: C,
    slug: "pro-peremennye",
    number: 5,
    title: "Переменные CSS",
    goal: "Ты вынесешь главный цвет сайта в переменную — и сможешь перекрасить сайт одной строкой.",
    explanation: [
      "На этой странице один и тот же цвет #8f7cf5 написан в трёх местах. Захочешь сменить цвет — придётся искать его везде. Профессионалы выносят такие значения в переменные CSS.",
      "Переменную объявляют в :root (это вся страница): --accent: #8f7cf5; — имя начинается с двух дефисов. Используют через var(): color: var(--accent);. Теперь цвет меняется в одном месте.",
    ],
    newTerms: ["css-var"],
    practice: [
      {
        kind: "fill",
        prompt: "Используй переменную --accent как цвет текста.",
        before: "h1 { color: ",
        after: "; }",
        answers: ["var(--accent)"],
        explain: "Переменную достают функцией var().",
      },
      {
        kind: "choice",
        question: "Какое имя переменной CSS правильное?",
        options: ["--main-color", "main-color", "$main-color"],
        correct: 0,
        explain: "Имя переменной CSS начинается с двух дефисов.",
      },
    ],
    steps: [
      "Напиши в начале CSS: :root { --accent: #8f7cf5; }",
      "Замени все три #8f7cf5 на var(--accent).",
      "Попробуй поменять цвет в :root — перекрасится всё сразу.",
    ],
    starter: {
      html: `<h1>Клуб любителей космоса</h1>
<p>Встречаемся по пятницам.</p>
<button>Записаться</button>
`,
      css: `${B}
h1 {
  color: #8f7cf5;
}

p {
  border-left: 4px solid #8f7cf5;
  padding-left: 8px;
}

button {
  background-color: #8f7cf5;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
}
`,
      js: "",
    },
    focusFile: "css",
    hints: [
      "Сначала объяви: :root { --accent: #8f7cf5; }",
      "Потом в трёх местах вместо #8f7cf5 — var(--accent).",
      "Пример: h1 { color: var(--accent); }",
    ],
    checks: [
      { kind: "source", file: "css", pattern: "--[\\w-]+\\s*:", message: "Объявлена переменная CSS", fix: "Напиши :root { --accent: #8f7cf5; }" },
      { kind: "source", file: "css", pattern: "var\\(\\s*--", minMatches: 3, message: "Переменная используется в трёх местах", fix: "Замени три #8f7cf5 на var(--accent)." },
      { kind: "styleIs", selector: "h1", property: "color", values: ["rgb(143, 124, 245)"], message: "Цвет заголовка сохранился", fix: "Проверь значение переменной: --accent: #8f7cf5;" },
    ],
    learned: ["Переменная CSS: --имя: значение; в :root.", "Использование: var(--имя).", "Одно значение — одно место, где его менять."],
    quiz: [
      {
        question: "Зачем переменные CSS?",
        options: ["Менять повторяющееся значение в одном месте", "Чтобы страница грузилась быстрее", "Они нужны только для чисел"],
        correct: 0,
        explain: "Например, сменить цветовую тему всего сайта одной строкой.",
      },
      {
        question: "Где обычно объявляют общие переменные?",
        options: [":root", "В каждом правиле", "В HTML"],
        correct: 0,
        explain: ":root — корень страницы, оттуда переменные видны везде.",
      },
    ],
    reference: ref("pro-peremennye"),
  },
  {
    track: "practice",
    course: C,
    slug: "pro-plavnost",
    number: 6,
    title: "Плавность: transition",
    goal: "Кнопка будет менять цвет и увеличиваться при наведении — плавно, а не рывком.",
    explanation: [
      "Сейчас кнопка при наведении меняется мгновенно — рывком. transition делает изменение плавным: transition: background-color 0.3s, transform 0.3s; — «меняй фон и размер за 0,3 секунды».",
      "transform: scale(1.1) увеличивает элемент на 10% — не сдвигая соседей. Вместе с transition получается приятный «живой» эффект, как у кнопок в играх.",
    ],
    newTerms: ["transition"],
    practice: [
      {
        kind: "choice",
        question: "Что делает transition: color 0.5s ?",
        options: ["Цвет меняется плавно за полсекунды", "Цвет меняется каждые полсекунды", "Ничего"],
        correct: 0,
        explain: "transition — длительность смены значения.",
      },
      {
        kind: "fill",
        prompt: "Увеличь кнопку на 10% при наведении.",
        before: ".btn:hover { transform: ",
        after: "; }",
        answers: ["scale(1.1)"],
        explain: "scale(1.1) — в 1,1 раза больше.",
      },
    ],
    steps: [
      "В правило .btn добавь transition: background-color 0.3s, transform 0.3s;",
      "В правило .btn:hover добавь transform: scale(1.1);",
      "Наведи курсор на кнопку и посмотри на плавность.",
    ],
    starter: {
      html: '<button class="btn">Начать игру</button>\n',
      css: `${B}
.btn {
  background-color: #3ef2c6;
  border: none;
  padding: 14px 24px;
  font-size: 18px;
  border-radius: 14px;
}

.btn:hover {
  background-color: #ffb84d;
}
`,
      js: "",
    },
    focusFile: "css",
    hints: [
      "transition пишут в обычном правиле .btn, а не в :hover.",
      ".btn { transition: background-color 0.3s, transform 0.3s; }",
    ],
    checks: [
      { kind: "styleNot", selector: ".btn", property: "transition-duration", values: ["0s"], message: "Изменения плавные (transition)", fix: "В .btn: transition: background-color 0.3s, transform 0.3s;" },
      { kind: "source", file: "css", pattern: "\\.btn:hover\\s*\\{[^}]*transform\\s*:", message: "При наведении кнопка увеличивается", fix: "В .btn:hover: transform: scale(1.1);" },
    ],
    learned: ["transition делает смену стиля плавной.", "transform: scale() увеличивает, не сдвигая соседей.", "transition пишут в обычном правиле."],
    quiz: [
      {
        question: "Почему transition пишут в .btn, а не в .btn:hover?",
        options: ["Чтобы плавно было и при наведении, и когда курсор уходит", "Так короче", "В :hover он не работает"],
        correct: 0,
        explain: "Из :hover плавным было бы только «туда», а обратно — рывком.",
      },
      {
        question: "Что значит 0.3s?",
        options: ["0,3 секунды", "3 секунды", "30 секунд"],
        correct: 0,
        explain: "s — секунды; 0.3s — меньше трети секунды.",
      },
    ],
    reference: ref("pro-plavnost"),
  },
  {
    track: "practice",
    course: C,
    slug: "pro-animaciya",
    number: 7,
    title: "Анимация: @keyframes",
    goal: "Звезда на странице будет плавно «парить» вверх-вниз — сама, без нажатий.",
    explanation: [
      "transition срабатывает, когда что-то меняется (например, при наведении). А анимация работает сама. Её кадры описывают через @keyframes: from — начало, to — конец.",
      "Анимацию подключают к элементу: animation: float 1s infinite alternate; — имя кадров, длительность, «повторять бесконечно» и «туда-обратно».",
    ],
    newTerms: ["keyframes"],
    practice: [
      {
        kind: "choice",
        question: "Что значит infinite в animation?",
        options: ["Повторять бесконечно", "Один раз", "Бесконечно быстро"],
        correct: 0,
        explain: "infinite — без конца.",
      },
      {
        kind: "order",
        prompt: "Собери кадры анимации «парения».",
        lines: ["@keyframes float {", "  from { transform: translateY(0); }", "  to { transform: translateY(-12px); }", "}"],
        explain: "Имя кадров, начало (from) и конец (to).",
      },
    ],
    steps: [
      "Напиши кадры: @keyframes float { from { transform: translateY(0); } to { transform: translateY(-12px); } }",
      "Подключи их к звезде: .star { animation: float 1s infinite alternate; }",
    ],
    starter: {
      html: '<h1>Ночное небо</h1>\n<div class="star">⭐</div>\n',
      css: `body {
  font-family: Verdana, sans-serif;
  margin: 16px;
  background-color: #11122b;
  color: white;
}

.star {
  font-size: 64px;
  display: inline-block;
}
`,
      js: "",
    },
    focusFile: "css",
    hints: [
      "Две части: кадры @keyframes и подключение animation у .star.",
      ".star { animation: float 1s infinite alternate; }",
    ],
    checks: [
      { kind: "source", file: "css", pattern: "@keyframes\\s+[\\w-]+", message: "Описаны кадры анимации", fix: "@keyframes float { from { … } to { … } }" },
      { kind: "styleNot", selector: ".star", property: "animation-name", values: ["none"], message: "Анимация подключена к звезде", fix: ".star { animation: float 1s infinite alternate; }" },
      { kind: "styleMatches", selector: ".star", property: "animation-iteration-count", pattern: "infinite", message: "Анимация повторяется без конца", fix: "Добавь в animation слово infinite." },
    ],
    learned: ["@keyframes — кадры анимации: from и to.", "animation подключает кадры к элементу.", "infinite alternate — бесконечно, туда-обратно."],
    quiz: [
      {
        question: "Чем animation отличается от transition?",
        options: ["animation работает сама, transition — при изменении стиля", "Ничем", "transition бесконечный"],
        correct: 0,
        explain: "Анимация не ждёт наведения или нажатия.",
      },
      {
        question: "Что делает translateY(-12px)?",
        options: ["Сдвигает вверх на 12 пикселей", "Сдвигает вниз", "Увеличивает"],
        correct: 0,
        explain: "Y — по вертикали, минус — вверх.",
      },
    ],
    reference: ref("pro-animaciya"),
  },
  {
    track: "practice",
    course: C,
    slug: "pro-forma",
    number: 8,
    title: "Форма: подписи и поля",
    goal: "Ты сделаешь правильную форму записи: у каждого поля подпись и подходящий тип.",
    explanation: [
      "У каждого поля формы должна быть подпись <label>. Её связывают с полем: for у подписи равен id у поля — <label for=\"email\"> и <input id=\"email\">. Тогда нажатие на подпись ставит курсор в поле, а программы для незрячих читают, что это за поле.",
      "Тип поля подсказывает телефону клавиатуру: type=\"email\" — клавиатура с @, type=\"number\" — с цифрами. Кнопке в студии даём type=\"button\" — её нажатие обработает JavaScript.",
    ],
    newTerms: ["form-label"],
    practice: [
      {
        kind: "choice",
        question: "Как связать подпись с полем <input id=\"age\">?",
        options: ['<label for="age">', '<label id="age">', '<label name="age">'],
        correct: 0,
        explain: "for у подписи = id у поля.",
      },
      {
        kind: "choice",
        question: "Какой тип поля для возраста?",
        options: ['type="number"', 'type="text"', 'type="email"'],
        correct: 0,
        explain: "number — только числа и цифровая клавиатура на телефоне.",
      },
    ],
    steps: [
      "Дай полям id: name, email, age.",
      "Перед каждым полем — подпись: <label for=\"name\">Имя героя</label> и так далее.",
      "Поменяй типы: у почты type=\"email\", у возраста type=\"number\".",
    ],
    starter: {
      html: `<h1>Запись в клуб</h1>
<div class="form">
  Имя героя
  <input type="text">
  Почта родителя
  <input type="text">
  Возраст
  <input type="text">
  <button type="button">Записаться</button>
</div>
`,
      css: `${B}
.form {
  display: grid;
  gap: 8px;
  max-width: 280px;
}

input {
  padding: 8px;
  font-size: 16px;
}
`,
      js: "",
    },
    focusFile: "html",
    hints: [
      "Подписи — теги <label>, а связь — for = id.",
      "<label for=\"email\">Почта родителя</label> <input id=\"email\" type=\"email\"> — и так же для name (type=\"text\") и age (type=\"number\").",
    ],
    checks: [
      { kind: "exists", selector: 'label[for="name"]', message: "Подпись для имени", fix: "<label for=\"name\">Имя героя</label>" },
      { kind: "exists", selector: "input#name", message: "Поле имени с id=\"name\"", fix: "<input id=\"name\" type=\"text\">" },
      { kind: "exists", selector: 'label[for="email"]', message: "Подпись для почты", fix: "<label for=\"email\">Почта родителя</label>" },
      { kind: "exists", selector: 'input#email[type="email"]', message: "Поле почты с типом email", fix: "<input id=\"email\" type=\"email\">" },
      { kind: "exists", selector: 'label[for="age"]', message: "Подпись для возраста", fix: "<label for=\"age\">Возраст</label>" },
      { kind: "exists", selector: 'input#age[type="number"]', message: "Поле возраста с типом number", fix: "<input id=\"age\" type=\"number\">" },
    ],
    learned: ["У каждого поля — <label>, связь: for = id.", "Тип поля подсказывает нужную клавиатуру.", "Подписи помогают и людям, и программам для незрячих."],
    quiz: [
      {
        question: "Что произойдёт при нажатии на связанную подпись?",
        options: ["Курсор встанет в её поле", "Форма отправится", "Ничего"],
        correct: 0,
        explain: "Это удобно, особенно на телефоне: в подпись проще попасть пальцем.",
      },
      {
        question: "Какое поле для почты?",
        options: ['type="email"', 'type="mail"', 'type="text"'],
        correct: 0,
        explain: "email — клавиатура с @ и проверка формата.",
      },
    ],
    reference: ref("pro-forma"),
  },
  {
    track: "practice",
    course: C,
    slug: "pro-forma-proverka",
    number: 9,
    title: "Проверка формы",
    goal: "Форма будет проверять, что поле заполнено, и вежливо подсказывать, если нет.",
    explanation: [
      "Хорошая форма не даёт отправить пустое поле и подсказывает, что не так. Значение поля — input.value, а value.trim() убирает пробелы по краям: строка из одних пробелов тоже считается пустой.",
      "Если поле пустое — показываем ошибку рядом с полем. Если всё хорошо — убираем ошибку и показываем результат.",
    ],
    newTerms: [],
    practice: [
      {
        kind: "choice",
        question: "Что даст \"   \".trim() ?",
        options: ["Пустую строку \"\"", "Три пробела", "Ошибку"],
        correct: 0,
        explain: "trim убирает пробелы по краям.",
      },
      {
        kind: "choice",
        question: "Где лучше показывать ошибку формы?",
        options: ["Рядом с полем, понятными словами", "Всплывающим окном с кодом ошибки", "Нигде"],
        correct: 0,
        explain: "Так человек сразу видит, что исправить.",
      },
    ],
    steps: [
      "В обработчике кнопки возьми имя: const name = nameInput.value.trim();",
      "Если name === \"\" — error.textContent = \"Напиши имя героя\", а result очисти.",
      "Иначе — очисти error и напиши в result «Спасибо, » + name + «!».",
    ],
    starter: {
      html: `<h1>Запись в клуб</h1>
<label for="name">Имя героя</label>
<input id="name" type="text">
<p id="error"></p>
<button id="send" type="button">Записаться</button>
<p id="result"></p>
`,
      css: `${B}
#error {
  color: #c92a2a;
}
`,
      js: `const nameInput = document.querySelector("#name");
const error = document.querySelector("#error");
const result = document.querySelector("#result");

document.querySelector("#send").addEventListener("click", function () {
  // Урок 9: если поле пустое — ошибка «Напиши имя героя», иначе — «Спасибо, …!»
});
`,
    },
    focusFile: "js",
    hints: [
      "const name = nameInput.value.trim(); и if (name === \"\") { … } else { … }",
      "В ветке else: error.textContent = \"\"; result.textContent = \"Спасибо, \" + name + \"!\";",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { click: "#send" },
          { expect: { selector: "#error", contains: "Напиши" } },
          { type: { selector: "#name", value: "   " } },
          { click: "#send" },
          { expect: { selector: "#error", contains: "Напиши" } },
          { type: { selector: "#name", value: "Кью" } },
          { click: "#send" },
          { expect: { selector: "#error", equals: "" } },
          { expect: { selector: "#result", contains: "Кью" } },
        ],
        message: "Пустое поле (и одни пробелы) — подсказка, заполненное — «Спасибо»",
        fix: "Проверь name === \"\" после trim(); в ветке else очисти error и напиши результат.",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь скобки if / else." },
    ],
    learned: ["value.trim() — значение поля без пробелов по краям.", "Пустое поле — понятная подсказка рядом.", "Хорошая форма помогает, а не ругается."],
    quiz: [
      {
        question: "Зачем trim() при проверке?",
        options: ["Чтобы строка из пробелов тоже считалась пустой", "Чтобы сделать буквы большими", "Чтобы отправить форму"],
        correct: 0,
        explain: "Иначе «   » прошла бы проверку.",
      },
      {
        question: "Ошибку исправили. Что сделать с подсказкой?",
        options: ["Убрать её", "Оставить навсегда", "Сделать красной"],
        correct: 0,
        explain: "Старая подсказка путает — её очищают.",
      },
    ],
    reference: ref("pro-forma-proverka"),
  },
  {
    track: "practice",
    course: C,
    slug: "pro-tablica",
    number: 10,
    title: "Таблицы",
    goal: "Ты сверстаешь расписание кружков таблицей — с заголовками и аккуратными рамками.",
    explanation: [
      "Для данных в строках и столбцах есть таблица <table>. Строка — <tr>, ячейка — <td>, ячейка-заголовок — <th>. Заголовки собирают в <thead>, данные — в <tbody>.",
      "По умолчанию у ячеек двойные рамки. border-collapse: collapse у таблицы склеивает их в одну аккуратную линию.",
      "Таблицы — только для данных (расписание, результаты, цены). Раскладывать страницу таблицами не нужно — для этого есть flex и grid.",
    ],
    newTerms: ["table"],
    practice: [
      {
        kind: "choice",
        question: "Какой тег — строка таблицы?",
        options: ["<tr>", "<td>", "<th>"],
        correct: 0,
        explain: "tr — table row, строка. td — ячейка, th — заголовок.",
      },
      {
        kind: "fill",
        prompt: "Склей двойные рамки в одну.",
        before: "table { border-collapse: ",
        after: "; }",
        answers: ["collapse"],
        explain: "collapse — рамки соседних ячеек сливаются.",
      },
    ],
    steps: [
      "Внутри <table> напиши <thead> со строкой из трёх <th>: День, Кружок, Время.",
      "Ниже — <tbody> с тремя строками <tr>, в каждой три <td>.",
      "В CSS: table { border-collapse: collapse; } и рамки у th, td.",
    ],
    starter: {
      html: "<h1>Расписание кружков</h1>\n<table>\n  <!-- Урок 10: заголовки (thead) и три строки расписания (tbody) -->\n</table>\n",
      css: `${B}
th, td {
  border: 1px solid #adb5bd;
  padding: 8px 12px;
}

th {
  background-color: #e7f5ff;
}
`,
      js: "",
    },
    focusFile: "html",
    hints: [
      "Скелет: <table> → <thead><tr><th>…</th>…</tr></thead> → <tbody><tr><td>…</td>…</tr>…</tbody>",
      "И в CSS: table { border-collapse: collapse; }",
    ],
    checks: [
      { kind: "count", selector: "thead th", min: 3, message: "Три заголовка столбцов", fix: "<thead><tr><th>День</th><th>Кружок</th><th>Время</th></tr></thead>" },
      { kind: "count", selector: "tbody tr", min: 3, message: "Три строки расписания", fix: "В <tbody> — три <tr>, в каждой три <td>." },
      { kind: "styleIs", selector: "table", property: "border-collapse", values: ["collapse"], message: "Рамки склеены в одну линию", fix: "table { border-collapse: collapse; }" },
      { kind: "structureOk", message: "Все теги таблицы закрыты", fix: "Посмотри подсказки в консоли." },
    ],
    learned: ["Таблица: table → tr → td, заголовки — th.", "thead — заголовки, tbody — данные.", "Таблицы — для данных, не для раскладки страницы."],
    quiz: [
      {
        question: "Для чего НЕ стоит использовать таблицу?",
        options: ["Чтобы раскладывать блоки страницы", "Для расписания", "Для таблицы результатов"],
        correct: 0,
        explain: "Раскладку делают flex и grid, таблица — для данных.",
      },
      {
        question: "Чем <th> отличается от <td>?",
        options: ["th — ячейка-заголовок, td — обычная", "Ничем", "th — строка"],
        correct: 0,
        explain: "Заголовки браузер выделяет жирным, а программы для незрячих объявляют их.",
      },
    ],
    reference: ref("pro-tablica"),
  },
  {
    track: "practice",
    course: C,
    slug: "pro-dostupnost",
    number: 11,
    title: "Сайт для всех",
    goal: "Ты исправишь страницу так, чтобы ей могли пользоваться все — и люди со слабым зрением, и незрячие.",
    explanation: [
      "Сайтом пользуются очень разные люди: кто-то плохо видит, кто-то не видит совсем и слушает страницу через программу чтения с экрана, кто-то управляет только клавиатурой. Доступность — это когда сайт удобен всем.",
      "Главные правила: у картинок есть alt; кнопка — это <button>, а не <div> (на div не нажать клавиатурой); у полей есть <label>; текст контрастный — светло-серый на белом прочитать трудно.",
      "Контраст считают по формуле: для обычного текста нужно не меньше 4,5. Студия проверит это сама.",
    ],
    newTerms: ["a11y"],
    practice: [
      {
        kind: "choice",
        question: "Почему кнопку делают тегом <button>, а не <div>?",
        options: ["На <button> можно нажать клавиатурой, и программы знают, что это кнопка", "<button> красивее", "<div> нельзя покрасить"],
        correct: 0,
        explain: "<button> доступна с клавиатуры и для программ чтения с экрана.",
      },
      {
        kind: "choice",
        question: "Какой текст легче прочитать на белом фоне?",
        options: ["Тёмно-серый #495057", "Светло-серый #cccccc", "Бледно-жёлтый #fff3bf"],
        correct: 0,
        explain: "Чем больше разница яркости текста и фона, тем выше контраст.",
      },
    ],
    steps: [
      "Картинкам добавь описания alt.",
      "Замени <div class=\"buy\"> на <button class=\"buy\" type=\"button\">.",
      "Добавь подпись к полю поиска: <label for=\"search\">Поиск</label>.",
      "Сделай подсказку .hint тёмнее, например color: #495057.",
    ],
    starter: {
      html: `<h1>Магазин игрушек</h1>
<input id="search" type="text">
<p class="hint">Найди игрушку по названию</p>
<img src="kartinki/raketa.svg">
<img src="kartinki/myach.svg">
<div class="buy">Купить</div>
`,
      css: `${B}
.hint {
  color: #cccccc;
}

.buy {
  background-color: #2f5be8;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  display: inline-block;
}
`,
      js: "",
    },
    focusFile: "html",
    hints: ["Четыре исправления: alt, <button>, <label for=\"search\"> и тёмный цвет у .hint.", "Контраст: замени #cccccc на #495057 — разница с белым станет большой."],
    checks: [
      { kind: "count", selector: "img:not([alt]), img[alt='']", min: 0, max: 0, message: "У всех картинок есть alt", fix: "Добавь каждой картинке alt=\"…\"." },
      { kind: "exists", selector: "button.buy", message: "Кнопка — это <button>", fix: "Замени <div class=\"buy\"> на <button class=\"buy\" type=\"button\">." },
      { kind: "exists", selector: 'label[for="search"]', message: "У поля поиска есть подпись", fix: "<label for=\"search\">Поиск</label> перед полем." },
      { kind: "contrast", selector: ".hint", min: 4.5, message: "Подсказку легко прочитать (контраст не меньше 4,5)", fix: "Сделай .hint тёмнее: color: #495057;" },
    ],
    learned: ["Доступность — сайт удобен всем.", "alt, <button>, <label> и контрастный текст.", "Контраст обычного текста — не меньше 4,5."],
    quiz: [
      {
        question: "Кому помогает alt у картинки?",
        options: ["Незрячим — программа прочитает описание", "Только поисковикам", "Никому"],
        correct: 0,
        explain: "А ещё alt видно, если картинка не загрузилась.",
      },
      {
        question: "Что такое доступность сайта?",
        options: ["Когда сайтом удобно пользоваться всем людям", "Когда сайт бесплатный", "Когда сайт быстро грузится"],
        correct: 0,
        explain: "Это забота о людях с разными возможностями.",
      },
    ],
    reference: ref("pro-dostupnost"),
  },
  {
    track: "project",
    course: C,
    slug: "pro-final",
    number: 12,
    title: "Финал: профессиональный лендинг",
    goal: "Ты соберёшь с нуля лендинг, в котором есть всё из курса: сетка, переменные, плавность, форма и доступность.",
    freshStart: true,
    checkWidth: 360,
    explanation: [
      "Финал курса! Придумай, что рекламирует твой лендинг: кружок, игру, книгу, поход. И собери страницу как профессионал.",
      "Чек-лист в комментарии — это требования заказчика. Проверка смотрит на каждый пункт, а ещё на то, что страница помещается на экране телефона.",
    ],
    newTerms: [],
    steps: [
      "Объяви цвета переменными в :root и используй их через var().",
      "Сделай блок преимуществ сеткой (display: grid).",
      "Добавь кнопку с плавным :hover (transition).",
      "Сделай форму записи: у каждого поля <label>. Не забудь alt у картинок и проверь страницу на ширине телефона.",
    ],
    starter: {
      html: `<!-- Финал: профессиональный лендинг. Чек-лист заказчика:
     1. Цвета — переменными CSS (:root и var(--…)), минимум в двух местах.
     2. Блок преимуществ — сеткой (display: grid).
     3. Кнопка с плавным эффектом (transition и :hover).
     4. Форма: у каждого поля <label for="…"> и <input id="…">.
     5. У всех картинок есть alt.
     6. Страница помещается на экране телефона. -->

`,
      css: "",
      js: "",
    },
    focusFile: "html",
    hints: ["Иди по чек-листу и нажимай «Проверить» после каждого пункта — сразу видно, что уже готово."],
    checks: [
      { kind: "source", file: "css", pattern: "var\\(\\s*--", minMatches: 2, message: "Цвета — переменными CSS", fix: ":root { --accent: …; } и var(--accent) минимум в двух местах." },
      { kind: "source", file: "css", pattern: "display\\s*:\\s*grid", message: "Есть сетка (display: grid)", fix: "Сделай блок преимуществ сеткой: display: grid;" },
      { kind: "source", file: "css", pattern: "transition\\s*:", message: "Есть плавный эффект (transition)", fix: "Кнопке: transition: transform 0.3s; и правило :hover." },
      { kind: "count", selector: "label[for]", min: 1, message: "В форме есть подписи <label>", fix: "<label for=\"name\">…</label> <input id=\"name\">" },
      { kind: "count", selector: "img:not([alt]), img[alt='']", min: 0, max: 0, message: "У всех картинок есть alt", fix: "Каждой <img> — alt=\"…\"." },
      { kind: "noOverflow", message: "На телефоне ничего не вылезает за край", fix: "Проверь ширины: max-width: 100% у картинок, сетка с 1fr." },
      { kind: "structureOk", message: "Помощник в консоли молчит", fix: "Посмотри подсказки в консоли." },
    ],
    learned: ["Ты собрал лендинг профессиональными приёмами.", "Сетка, переменные, плавность, формы и доступность — твои инструменты.", "Ты работаешь по чек-листу заказчика, как настоящий верстальщик."],
    quiz: [
      {
        question: "Заказчик хочет сменить главный цвет сайта. Что облегчит задачу?",
        options: ["Переменные CSS", "Таблицы", "Много <br>"],
        correct: 0,
        explain: "Поменять значение в :root — и цвет сменится везде.",
      },
      {
        question: "Что обязательно проверить перед сдачей сайта?",
        options: ["Как он выглядит на телефоне и доступен ли всем", "Только цвет кнопки", "Ничего"],
        correct: 0,
        explain: "Телефон и доступность — признаки профессиональной работы.",
      },
    ],
    reference: ref("pro-final"),
  },
];
