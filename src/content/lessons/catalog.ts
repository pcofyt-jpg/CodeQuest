import type { Lesson } from "./types";

/**
 * Учебный маршрут MVP: HTML → CSS → JavaScript.
 * Подсказок становится меньше: 3 → 3 → 3 → 3 → 3 → 2 → 2 → 2 → 1 → 1.
 * Проверки только программные; ИИ в оценке не участвует.
 */

const cardCss = `body {
  background-color: #eef3fb;
  font-family: sans-serif;
  padding: 16px;
}

.card {
  max-width: 320px;
  padding: 20px;
  border-radius: 16px;
  background-color: white;
}

button {
  padding: 10px 18px;
  font-size: 16px;
}
`;

export const lessons: Lesson[] = [
  {
    slug: "zagolovok",
    number: 1,
    title: "Первый заголовок",
    goal: "На твоей странице появится большой заголовок.",
    explanation: [
      "Любая веб-страница написана на языке HTML. Он говорит браузеру, что где лежит: вот заголовок, вот абзац, вот кнопка.",
      "Для этого используются теги — слова в угловых скобках. Заголовок начинается тегом <h1> и заканчивается тегом </h1>. Всё, что между ними, браузер покажет крупным шрифтом.",
    ],
    steps: [
      "Открой вкладку HTML.",
      "Под комментарием напиши тег <h1>, затем свой текст, затем </h1>.",
      "Посмотри в окно результата — заголовок должен появиться сразу.",
      "Нажми «Проверить».",
    ],
    starter: {
      html: `<!-- Это комментарий. Браузер его не показывает.
     Напиши заголовок на строке ниже. -->

`,
      css: "/* Стили понадобятся в третьем уроке */\n",
      js: "// JavaScript понадобится в пятом уроке\n",
    },
    focusFile: "html",
    hints: [
      "Заголовок пишется между двумя тегами: открывающим <h1> и закрывающим </h1>.",
      "Закрывающий тег отличается от открывающего только косой чертой: </h1>.",
      "Готовая строка выглядит так: <h1>Сайт про котов</h1>. Поменяй текст на свой.",
    ],
    checks: [
      { kind: "exists", selector: "h1", message: "На странице есть заголовок <h1>" },
      { kind: "text", selector: "h1", minLength: 3, message: "В заголовке хотя бы 3 символа" },
    ],
    learned: [
      "HTML описывает, из чего состоит страница.",
      "Тег <h1> создаёт главный заголовок.",
      "Почти у каждого тега есть пара: открывающий и закрывающий.",
    ],
  },
  {
    slug: "opisanie",
    number: 2,
    title: "Описание под заголовком",
    goal: "Под заголовком появится абзац, который рассказывает о странице.",
    explanation: [
      "Обычный текст на странице пишут в абзацах. Абзац создаёт тег <p> — от английского paragraph.",
      "Браузер сам переносит длинный текст на новую строку, поэтому писать можно сколько угодно.",
    ],
    steps: [
      "Под заголовком добавь тег <p> с описанием своей страницы.",
      "Напиши хотя бы одно полное предложение.",
      "Если хочешь, добавь второй абзац.",
    ],
    starter: {
      html: `<h1>Сайт про космос</h1>

<!-- Добавь абзац с описанием ниже -->
`,
      css: "/* Стили понадобятся в следующем уроке */\n",
      js: "",
    },
    focusFile: "html",
    hints: [
      "Абзац устроен как заголовок, только тег другой: <p> и </p>.",
      "Текст абзаца пишется между <p> и </p>.",
      "Например: <p>Здесь я собираю интересные факты о планетах.</p>",
    ],
    checks: [
      { kind: "exists", selector: "p", message: "На странице есть абзац <p>" },
      { kind: "text", selector: "p", minLength: 20, message: "В абзаце хотя бы 20 символов" },
    ],
    learned: [
      "Тег <p> создаёт абзац обычного текста.",
      "На одной странице может быть много разных тегов.",
    ],
  },
  {
    slug: "cveta",
    number: 3,
    title: "Цвета и оформление",
    goal: "Страница станет цветной: свой фон и свой цвет заголовка.",
    explanation: [
      "HTML отвечает за содержание, а за внешний вид отвечает CSS. В CSS пишут правила: кого оформляем и как.",
      "Правило h1 { color: black; } значит: у всех заголовков h1 цвет текста — чёрный. Цвет можно задать словом на английском — tomato, gold, skyblue — или кодом вроде #ff6b6b.",
    ],
    steps: [
      "Открой вкладку CSS.",
      "Поменяй цвет фона страницы: замени white в правиле body на другой цвет.",
      "Поменяй цвет заголовка в правиле h1.",
      "Подбери цвета так, чтобы текст хорошо читался.",
    ],
    starter: {
      html: `<h1>Сайт про космос</h1>
<p>Здесь я собираю интересные факты о планетах и звёздах.</p>
`,
      css: `body {
  background-color: white;
  color: black;
}

h1 {
  color: black;
}
`,
      js: "",
    },
    focusFile: "css",
    hints: [
      "Цвет фона задаёт свойство background-color, а цвет текста — свойство color.",
      "Заменяй только слово перед точкой с запятой: background-color: lavender;",
      "Попробуй так: в body напиши background-color: midnightblue; color: white; а в h1 — color: gold;",
    ],
    checks: [
      {
        kind: "styleNot",
        selector: "body",
        property: "background-color",
        values: ["rgb(255, 255, 255)", "rgba(0, 0, 0, 0)"],
        message: "Фон страницы больше не белый",
      },
      {
        kind: "styleNot",
        selector: "h1",
        property: "color",
        values: ["rgb(0, 0, 0)"],
        message: "Цвет заголовка больше не чёрный",
      },
    ],
    learned: [
      "CSS отвечает за то, как страница выглядит.",
      "Правило CSS состоит из селектора и свойств в фигурных скобках.",
      "color меняет цвет текста, background-color — цвет фона.",
    ],
  },
  {
    slug: "kartochka",
    number: 4,
    title: "Карточка",
    goal: "Ты соберёшь аккуратную карточку с заголовком и текстом.",
    explanation: [
      "Карточки есть почти на каждом сайте: товар в магазине, видео, профиль игрока. Это блок, внутри которого лежат другие элементы.",
      "Блок создаёт тег <div>. Чтобы оформить именно его, даём ему класс: <div class=\"card\">. В CSS к классу обращаются через точку: .card { ... }.",
    ],
    steps: [
      "В HTML создай <div class=\"card\">.",
      "Положи внутрь заголовок <h2> и абзац <p>.",
      "В CSS напиши правило .card: задай фон, внутренние отступы padding и скругление углов border-radius.",
    ],
    starter: {
      html: `<h1>Мой любимый питомец</h1>

<!-- Создай здесь карточку: блок div с классом card -->
`,
      css: `body {
  background-color: #eef3fb;
  font-family: sans-serif;
}

/* Оформи карточку здесь */
`,
      js: "",
    },
    focusFile: "html",
    hints: [
      "Сначала HTML: <div class=\"card\"> ... </div>, а внутри — <h2> и <p>.",
      "В CSS правило для класса начинается с точки: .card { }.",
      "Внутрь правила можно написать: background-color: white; padding: 20px; border-radius: 16px;",
    ],
    checks: [
      { kind: "exists", selector: ".card", message: "Есть блок с классом card" },
      { kind: "exists", selector: ".card h2", message: "Внутри карточки есть заголовок <h2>" },
      { kind: "exists", selector: ".card p", message: "Внутри карточки есть абзац <p>" },
      {
        kind: "styleNot",
        selector: ".card",
        property: "background-color",
        values: ["rgba(0, 0, 0, 0)"],
        message: "У карточки есть свой фон",
      },
      { kind: "styleNot", selector: ".card", property: "padding-top", values: ["0px"], message: "У карточки есть внутренний отступ padding" },
      {
        kind: "styleNot",
        selector: ".card",
        property: "border-top-left-radius",
        values: ["0px"],
        message: "У карточки скруглены углы",
      },
    ],
    learned: [
      "Тег <div> создаёт блок, в который можно класть другие элементы.",
      "Класс помогает оформить нужный элемент: в CSS он пишется через точку.",
      "padding — отступ внутри блока, border-radius — скругление углов.",
    ],
  },
  {
    slug: "knopka",
    number: 5,
    title: "Кнопка, которая работает",
    goal: "При нажатии на кнопку на странице появится сообщение.",
    explanation: [
      "HTML и CSS создают страницу, а JavaScript делает её живой: реагирует на нажатия, меняет текст, считает.",
      "Сначала код находит элемент с помощью document.querySelector. Потом говорит кнопке: «когда тебя нажмут, выполни эту функцию» — это addEventListener. Внутри функции можно поменять текст любого элемента через textContent.",
    ],
    steps: [
      "Открой вкладку JS и прочитай код с комментариями.",
      "Внутри функции напиши строку, которая меняет текст message.",
      "Нажми кнопку в окне результата и проверь, что сообщение появилось.",
    ],
    starter: {
      html: `<div class="card">
  <h2>Котик Барсик</h2>
  <p>Любит спать на клавиатуре.</p>
  <button id="like-button">Нравится</button>
  <p id="message"></p>
</div>
`,
      css: cardCss,
      js: `// 1. Находим кнопку и абзац для сообщения
const button = document.querySelector("#like-button");
const message = document.querySelector("#message");

// 2. Говорим кнопке: «когда тебя нажмут, выполни эту функцию»
button.addEventListener("click", function () {
  // Напиши здесь, что должно произойти.
});
`,
    },
    focusFile: "js",
    hints: [
      "Чтобы поменять текст элемента, присвой ему textContent.",
      "Строка пишется внутри фигурных скобок функции, на месте комментария.",
      "Вот так: message.textContent = \"Барсик доволен!\";",
    ],
    checks: [
      {
        kind: "clickChangesText",
        click: "#like-button",
        watch: "#message",
        message: "После нажатия на кнопку появляется сообщение",
      },
      { kind: "noErrors", message: "В консоли нет ошибок" },
    ],
    learned: [
      "JavaScript делает страницу интерактивной.",
      "document.querySelector находит элемент на странице.",
      "addEventListener запускает код, когда что-то происходит, например клик.",
    ],
  },
  {
    slug: "dizajn",
    number: 6,
    title: "Улучшаем дизайн",
    goal: "Карточка станет заметно красивее: тень, шрифт и живая кнопка.",
    plannedWithMentor: true,
    explanation: [
      "Хороший дизайн складывается из мелочей: мягкая тень отделяет карточку от фона, удачный шрифт задаёт настроение, а кнопка меняется под курсором и показывает, что на неё можно нажать.",
      "Эффект при наведении задаёт правило с :hover — например, button:hover { ... }. Оно действует, только пока курсор над кнопкой.",
    ],
    steps: [
      "Добавь карточке тень через box-shadow.",
      "Выбери шрифт для страницы через font-family.",
      "Оформи кнопку: свой цвет фона в правиле button.",
      "Добавь правило button:hover, чтобы кнопка менялась при наведении.",
    ],
    starter: {
      html: `<div class="card">
  <h2>Котик Барсик</h2>
  <p>Любит спать на клавиатуре.</p>
  <button id="like-button">Нравится</button>
  <p id="message"></p>
</div>
`,
      css: `body {
  background-color: #eef3fb;
  padding: 16px;
}

.card {
  max-width: 320px;
  padding: 20px;
  border-radius: 16px;
  background-color: white;
}

button {
  padding: 10px 18px;
  font-size: 16px;
}
`,
      js: `const button = document.querySelector("#like-button");
const message = document.querySelector("#message");

button.addEventListener("click", function () {
  message.textContent = "Барсик доволен!";
});
`,
    },
    focusFile: "css",
    hints: [
      "Тень: box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); Шрифт: font-family: Verdana, sans-serif;",
      "Кнопка: в button добавь background-color и border-radius, а ниже напиши button:hover { background-color: другой цвет; }",
    ],
    checks: [
      { kind: "styleNot", selector: ".card", property: "box-shadow", values: ["none"], message: "У карточки есть тень" },
      { kind: "source", file: "css", pattern: "font-family\\s*:", message: "Выбран шрифт через font-family" },
      {
        kind: "source",
        file: "css",
        pattern: "button\\s*\\{[^}]*background(-color)?\\s*:",
        message: "У кнопки свой цвет фона",
      },
      { kind: "source", file: "css", pattern: ":hover\\s*\\{[^}]*:", message: "Кнопка меняется при наведении (:hover)" },
    ],
    learned: [
      "box-shadow добавляет тень, font-family меняет шрифт.",
      ":hover задаёт вид элемента под курсором.",
      "Дизайн улучшают маленькими шагами, проверяя результат после каждого.",
    ],
  },
  {
    slug: "oshibka",
    number: 7,
    title: "Найди и исправь ошибку",
    goal: "Кнопка «Старт» снова заработает.",
    explanation: [
      "Ошибки бывают у всех программистов, даже у самых опытных. Главное — уметь их находить.",
      "Когда что-то не работает, сначала загляни в консоль под окном результата: там написано, что пошло не так и в какой строке. Исправь одну ошибку, проверь, и только потом ищи следующую.",
    ],
    steps: [
      "Нажми «Старт» в окне результата и посмотри в консоль.",
      "Прочитай сообщение об ошибке и найди строку, на которую оно указывает.",
      "Исправь ошибку и снова посмотри в консоль — ошибок здесь две.",
    ],
    starter: {
      html: `<div class="card">
  <h2>Ракета готова?</h2>
  <p id="status">Ракета ждёт команды.</p>
  <button id="start-button">Старт</button>
</div>
`,
      css: cardCss,
      js: `const button = document.querySelector("#start");
const statusText = document.querySelector("#status");

button.addEventListner("click", function () {
  statusText.textContent = "3... 2... 1... Поехали!";
});
`,
    },
    focusFile: "js",
    hints: [
      "Сравни id кнопки в HTML с тем, что написано в querySelector.",
      "Внимательно прочитай по буквам название метода addEventListener.",
    ],
    checks: [
      {
        kind: "clickChangesText",
        click: "#start-button",
        watch: "#status",
        message: "Кнопка «Старт» меняет текст статуса",
      },
      { kind: "noErrors", message: "В консоли нет ошибок" },
    ],
    learned: [
      "Консоль показывает, что за ошибка и в какой она строке.",
      "Селектор в querySelector должен совпадать с id в HTML.",
      "Ошибки исправляют по одной, проверяя результат после каждой.",
    ],
  },
  {
    slug: "schetchik",
    number: 8,
    title: "Счётчик",
    goal: "Каждое нажатие на «+1» будет увеличивать число на экране.",
    explanation: [
      "Чтобы программа что-то запомнила, используют переменные. let count = 0; создаёт переменную count со значением 0. Объявленную через let переменную можно менять.",
      "count = count + 1; значит: возьми старое значение, прибавь один и запиши обратно. После этого новое число нужно показать на странице.",
    ],
    steps: [
      "Добавь обработчик нажатия для кнопки «+1».",
      "Внутри увеличь count на 1.",
      "Покажи новое значение в countText.",
      "Если получится — сделай кнопку «−1» сам.",
    ],
    starter: {
      html: `<div class="card counter">
  <h2>Счётчик прыжков</h2>
  <p id="count">0</p>
  <button id="plus">+1</button>
</div>
`,
      css: `${cardCss}
#count {
  font-size: 48px;
  font-weight: bold;
  margin: 8px 0 16px;
}
`,
      js: `let count = 0;
const countText = document.querySelector("#count");
const plusButton = document.querySelector("#plus");

// Когда нажимают «+1»:
// 1) увеличь count на 1
// 2) покажи новое значение в countText
`,
    },
    focusFile: "js",
    hints: [
      "Обработчик пишется так же, как в уроке 5: plusButton.addEventListener(\"click\", function () { ... });",
      "Внутри функции две строки: count = count + 1; и countText.textContent = count;",
    ],
    checks: [
      {
        kind: "clickSequence",
        click: "#plus",
        watch: "#count",
        expect: ["1", "2", "3"],
        message: "Три нажатия показывают 1, 2, 3",
      },
      { kind: "noErrors", message: "В консоли нет ошибок" },
    ],
    learned: [
      "Переменная хранит значение, а let позволяет его менять.",
      "count = count + 1 увеличивает значение на один.",
      "Чтобы увидеть изменения, новое значение надо показать на странице.",
    ],
  },
  {
    slug: "svoya-versiya",
    number: 9,
    title: "Переделай готовый проект",
    goal: "Генератор фактов станет твоим: своя тема, свои факты, свой цвет.",
    explanation: [
      "Программисты часто начинают не с пустого листа, а с чужого рабочего кода, который нужно понять и изменить.",
      "Здесь факты хранятся в массиве facts — это список в квадратных скобках. Каждый элемент — строка в кавычках, а между элементами стоит запятая.",
    ],
    steps: [
      "Выбери свою тему и поменяй заголовок.",
      "Добавь в массив facts минимум два своих факта (всего — не меньше пяти).",
      "Поменяй цвет кнопки в CSS.",
    ],
    starter: {
      html: `<div class="card">
  <h1>Факты о космосе</h1>
  <p id="fact">Нажми на кнопку, чтобы узнать факт.</p>
  <button id="next-fact">Новый факт</button>
</div>
`,
      css: `body {
  background-color: #eef3fb;
  font-family: sans-serif;
  padding: 16px;
}

.card {
  max-width: 340px;
  padding: 20px;
  border-radius: 16px;
  background-color: white;
}

button {
  padding: 10px 18px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  color: white;
  background-color: #3b5bdb;
}
`,
      js: `const facts = [
  "На Венере сутки длиннее, чем год.",
  "Солнце примерно в 109 раз шире Земли.",
  "На Луне нет ветра, поэтому следы астронавтов сохраняются очень долго.",
];

const factText = document.querySelector("#fact");
const button = document.querySelector("#next-fact");

button.addEventListener("click", function () {
  const index = Math.floor(Math.random() * facts.length);
  factText.textContent = facts[index];
});
`,
    },
    focusFile: "js",
    hints: [
      "Новый факт — строка в кавычках с запятой после неё, например: \"У улитки тысячи зубов.\", — добавь её внутрь квадратных скобок.",
    ],
    checks: [
      {
        kind: "text",
        selector: "h1",
        minLength: 3,
        notEquals: ["Факты о космосе"],
        message: "Заголовок изменён на твою тему",
      },
      {
        kind: "clickDistinct",
        click: "#next-fact",
        watch: "#fact",
        clicks: 60,
        minDistinct: 5,
        message: "Кнопка показывает не меньше пяти разных фактов",
      },
      {
        kind: "styleNot",
        selector: "button",
        property: "background-color",
        values: ["rgb(59, 91, 219)"],
        message: "У кнопки новый цвет",
      },
    ],
    learned: [
      "Массив хранит список значений в квадратных скобках.",
      "Math.random помогает выбрать случайный элемент.",
      "Чужой код можно понять по частям и аккуратно изменить.",
    ],
  },
  {
    slug: "moj-proekt",
    number: 10,
    title: "Твой собственный проект",
    goal: "Ты сделаешь небольшой проект целиком сам.",
    explanation: [
      "Теперь ты умеешь создавать страницу, оформлять её и оживлять кнопками. Пора собрать всё вместе.",
      "Идеи: карточка любимой игры с кнопкой «случайный совет», счётчик очков для игры с другом, «магический шар», который отвечает на вопросы. Можно придумать своё.",
    ],
    steps: [
      "Придумай, что будет делать твоя страница.",
      "Сделай заголовок и ещё хотя бы два элемента в HTML.",
      "Оформи страницу: не меньше трёх правил CSS.",
      "Добавь кнопку, которая что-то делает.",
    ],
    starter: {
      html: `<!-- Твой проект начинается здесь -->
<h1>Мой проект</h1>
`,
      css: `body {
  font-family: sans-serif;
}
`,
      js: "// Добавь сюда интерактивность\n",
    },
    focusFile: "html",
    hints: ["Загляни в уроки 5, 8 и 9: там есть готовые приёмы для кнопок, счётчиков и случайного выбора."],
    checks: [
      {
        kind: "text",
        selector: "h1",
        minLength: 3,
        notEquals: ["Мой проект"],
        message: "У проекта своё название",
      },
      {
        kind: "source",
        file: "html",
        pattern: "<(p|h2|h3|ul|ol|div|button|img)\\b",
        minMatches: 2,
        message: "Кроме заголовка на странице ещё хотя бы два элемента",
      },
      {
        kind: "source",
        file: "css",
        pattern: "\\{[^}]*:[^}]*\\}",
        minMatches: 3,
        message: "В CSS не меньше трёх правил",
      },
      {
        kind: "source",
        file: "js",
        pattern: "addEventListener\\s*\\(",
        message: "JavaScript реагирует на действие",
      },
      { kind: "noErrors", message: "В консоли нет ошибок" },
    ],
    learned: [
      "Ты прошёл путь от первого тега до своего проекта.",
      "HTML, CSS и JavaScript работают вместе.",
      "Большой проект собирается из маленьких шагов.",
    ],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getLessonIndex(slug: string): number {
  return lessons.findIndex((l) => l.slug === slug);
}
