import type { Lesson, ProjectFiles } from "./types";
import referencesJson from "./references.json";
import { course0 } from "./course0";
import { course2 } from "./course2";
import { coursePython } from "./coursePython";
import { course3 } from "./course3";

/**
 * Учебный маршрут MVP.
 *
 * Уроки с track: "project" развивают ОДИН сайт ребёнка на его тему:
 *   1 заголовок → 2 описание → 3 цвета → 4 карточка → 5 кнопка → 6 дизайн → 8 счётчик → 10 своя функция.
 * Каждый такой урок берёт код ребёнка из прошлого урока проекта и дописывает
 * в конец файлов только заготовку (additions).
 *
 * Уроки 7 и 9 — тренировки на чужом коде (track: "practice"): найти ошибку и переделать готовое.
 *
 * Подсказок становится меньше: 3 → 3 → 3 → 3 → 3 → 2 → 2 → 2 → 1 → 1.
 * Проверки только программные; ИИ в оценке не участвует.
 * Эталонные решения — в references.json (их используют тесты и «контрольная точка»).
 */

const references = referencesJson as Record<string, ProjectFiles>;

function ref(slug: string): ProjectFiles {
  const r = references[slug];
  if (!r) throw new Error(`Нет эталонного решения для урока ${slug}`);
  return r;
}

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

const course1: Lesson[] = [
  {
    track: "project",
    course: "pervyj-sajt",
    slug: "zagolovok",
    number: 1,
    title: "Первый заголовок",
    goal: "Ты выберешь тему своего сайта и напишешь для него главный заголовок.",
    explanation: [
      "Во всех уроках ты будешь строить один сайт — свой. Сначала придумай тему: твой питомец, любимая игра, футбольная команда, космос, динозавры — что угодно, о чём тебе интересно рассказать. Каждый урок будет добавлять к сайту что-то новое.",
      "Любая веб-страница написана на языке HTML. Он говорит браузеру, что где лежит: вот заголовок, вот абзац, вот кнопка. Для этого используются теги — слова в угловых скобках.",
      "Главный заголовок создаёт тег <h1>. Пишется он так: открывающий тег <h1>, потом твой текст, потом закрывающий тег </h1>. Закрывающий тег отличается косой чертой — она говорит браузеру «заголовок закончился». Всё, что между тегами, браузер покажет крупным шрифтом.",
    ],
    newTerms: ["tag", "h1", "comment"],
    steps: [
      "Придумай тему своего сайта.",
      "Во вкладке HTML поставь курсор на пустую строку под серым комментарием.",
      "Напиши <h1>, затем название своего сайта, затем </h1>. Например: <h1>Мой кот Барсик</h1>.",
      "Посмотри в окно результата — заголовок появится сам. Потом нажми «Проверить».",
    ],
    starter: {
      html: `<!-- Это комментарий: заметка для тебя, браузер её не показывает.
     О чём будет твой сайт? О питомце, игре, спорте, космосе —
     выбирай сам. Этот сайт ты будешь развивать во всех уроках.
     Напиши заголовок на пустой строке ниже. -->

`,
      css: "",
      js: "",
    },
    focusFile: "html",
    hints: [
      "Заголовок пишется между двумя тегами: открывающим <h1> и закрывающим </h1>.",
      "Закрывающий тег отличается от открывающего только косой чертой: </h1>.",
      "Готовая строка выглядит так: <h1>Сайт про котов</h1>. Поменяй текст на свою тему.",
    ],
    practice: [
      {
        kind: "fill",
        prompt: "Допиши закрывающий тег заголовка.",
        before: "<h1>Мой сайт",
        after: "",
        answers: ["</h1>"],
        explain: "Закрывающий тег — тот же тег с косой чертой.",
      },
      {
        kind: "choice",
        question: "Какой из них — закрывающий тег?",
        options: ["<h1>", "</h1>", "h1"],
        correct: 1,
        explain: "Косая черта / после < означает «здесь тег заканчивается».",
      },
      {
        kind: "type",
        prompt: "Напечатай заголовок целиком.",
        target: "<h1>Мой сайт</h1>",
        explain: "Теги — в английской раскладке, текст — в любой.",
      },
    ],
    checks: [
      {
        kind: "exists",
        selector: "h1",
        message: "На странице есть заголовок <h1>",
        fix: "Напиши под комментарием строку вида <h1>Название сайта</h1>. Проверь, что строка не внутри комментария — после -->.",
      },
      {
        kind: "text",
        selector: "h1",
        minLength: 3,
        message: "В заголовке хотя бы 3 символа",
        fix: "Между <h1> и </h1> напиши название своего сайта.",
      },
    ],
    learned: [
      "HTML описывает, из чего состоит страница.",
      "Тег <h1> создаёт главный заголовок.",
      "У большинства тегов есть пара: открывающий и закрывающий с косой чертой.",
    ],
    quiz: [
      {
        question: "Какой тег создаёт главный заголовок?",
        options: ["<p>", "<h1>", "<button>"],
        correct: 1,
        explain: "<h1> — главный заголовок, самый крупный текст на странице.",
      },
      {
        question: "Что не так в этой строке?",
        code: "<h1>Мой сайт<h1>",
        options: ["У закрывающего тега нет косой черты", "Заголовок слишком короткий", "Всё правильно"],
        correct: 0,
        explain: "Закрывающий тег пишется с косой чертой: </h1>. Без неё браузер решит, что начался ещё один заголовок.",
      },
    ],
    reference: ref("zagolovok"),
  },
  {
    track: "project",
    course: "pervyj-sajt",
    slug: "opisanie",
    number: 2,
    title: "Описание под заголовком",
    goal: "Под заголовком твоего сайта появится рассказ о его теме.",
    explanation: [
      "Заголовок есть — теперь расскажем, о чём сайт. Обычный текст на странице пишут в абзацах. Абзац создаёт тег <p> (от английского paragraph — «абзац»).",
      "Абзац устроен так же, как заголовок: открывающий тег <p>, текст, закрывающий тег </p>. Браузер сам переносит длинный текст на новую строку, поэтому писать можно сколько угодно. Можно сделать несколько абзацев — каждый в своих тегах.",
    ],
    newTerms: ["p"],
    steps: [
      "Во вкладке HTML найди комментарий «Урок 2» — он внизу, под твоим заголовком.",
      "На пустой строке под ним напиши <p>, потом расскажи о теме сайта хотя бы одним предложением, потом </p>.",
      "Если хочешь, добавь ещё абзац — так же, в своих тегах <p> и </p>.",
    ],
    additions: {
      html: "\n<!-- Урок 2: на строке ниже напиши абзац <p>…</p> — расскажи о теме своего сайта -->\n\n",
    },
    focusFile: "html",
    hints: [
      "Абзац устроен как заголовок, только тег другой: <p> и </p>.",
      "Текст абзаца пишется между <p> и </p>, а строка — после комментария, не внутри него.",
      "Например: <p>Барсику три года. Он любит спать на клавиатуре.</p>",
    ],
    practice: [
      {
        kind: "choice",
        question: "Что покажет браузер?",
        code: "<p>Привет</p>\n<p>Пока</p>",
        options: ["Два абзаца: «Привет» и ниже «Пока»", "Одну строку «ПриветПока»", "Ничего"],
        correct: 0,
        explain: "Каждый <p> — отдельный абзац, браузер ставит их друг под другом.",
      },
      {
        kind: "fill",
        prompt: "Допиши открывающий тег абзаца.",
        before: "",
        after: "Мой кот любит спать.</p>",
        answers: ["<p>"],
        explain: "Абзац начинается тегом <p>.",
      },
    ],
    checks: [
      {
        kind: "exists",
        selector: "p",
        message: "На странице есть абзац <p>",
        fix: "Под комментарием «Урок 2» напиши строку <p>…</p> со своим текстом.",
      },
      {
        kind: "text",
        selector: "p",
        minLength: 20,
        message: "В абзаце хотя бы 20 символов",
        fix: "Напиши в абзаце хотя бы одно полное предложение о теме сайта.",
      },
    ],
    learned: ["Тег <p> создаёт абзац обычного текста.", "На одной странице может быть много разных тегов."],
    quiz: [
      {
        question: "Какой тег создаёт абзац текста?",
        options: ["<a>", "<p>", "<h1>"],
        correct: 1,
        explain: "<p> — абзац. <h1> — заголовок, а <a> — ссылка, её мы пока не проходили.",
      },
      {
        question: "Сколько абзацев в этом коде?",
        code: "<h1>Космос</h1>\n<p>Планеты</p>\n<p>Звёзды</p>",
        options: ["1", "2", "3"],
        correct: 1,
        explain: "Абзацы — это теги <p>, их два. <h1> — заголовок, а не абзац.",
      },
    ],
    reference: ref("opisanie"),
  },
  {
    track: "project",
    course: "pervyj-sajt",
    slug: "cveta",
    number: 3,
    title: "Цвета и оформление",
    goal: "Твой сайт станет цветным: свой фон и свой цвет заголовка.",
    explanation: [
      "HTML отвечает за то, что лежит на странице, а за то, как это выглядит, отвечает другой язык — CSS. Он пишется во вкладке CSS.",
      "В CSS пишут правила. Правило состоит из двух частей. Сначала — кого оформляем, например body (вся страница) или h1 (заголовки). Потом в фигурных скобках { } — что меняем. Каждая строка внутри скобок устроена одинаково: название свойства, двоеточие, значение, точка с запятой.",
      "Свойство color меняет цвет текста, background-color — цвет фона. Цвет можно написать словом на английском: tomato (томатный), gold (золотой), skyblue (небесный), lavender (сиреневый), navy (тёмно-синий) — или кодом вроде #ff6b6b.",
    ],
    newTerms: ["css-rule", "color", "background-color"],
    steps: [
      "Открой вкладку CSS. Там уже есть два правила — для body и для h1.",
      "В правиле body замени слово white на другой цвет — это цвет фона всей страницы.",
      "В правиле h1 замени black на другой цвет — это цвет заголовка.",
      "Подбери цвета так, чтобы текст хорошо читался на фоне.",
    ],
    additions: {
      css: `/* Урок 3: поменяй цвета. Заменяй только слова white и black,
   двоеточие и точку с запятой не трогай. */
body {
  background-color: white;
  color: black;
}

h1 {
  color: black;
}
`,
    },
    focusFile: "css",
    hints: [
      "Цвет фона задаёт свойство background-color, а цвет текста — свойство color.",
      "Заменяй только слово перед точкой с запятой: background-color: lavender;",
      "Попробуй так: в body напиши background-color: midnightblue; и color: white; а в h1 — color: gold;",
    ],
    practice: [
      {
        kind: "fill",
        prompt: "Какое свойство меняет цвет текста?",
        before: "h1 { ",
        after: ": tomato; }",
        answers: ["color"],
        explain: "color — цвет текста, background-color — цвет фона.",
      },
      {
        kind: "order",
        prompt: "Собери правило CSS, которое делает заголовок золотым.",
        lines: ["h1 {", "  color: gold;", "}"],
        explain: "Сначала кого оформляем и {, потом свойство, потом }.",
      },
    ],
    checks: [
      {
        kind: "styleNot",
        selector: "body",
        property: "background-color",
        values: ["rgb(255, 255, 255)", "rgba(0, 0, 0, 0)"],
        message: "Фон страницы больше не белый",
        fix: "В правиле body замени white в строке background-color на другой цвет, например lavender.",
      },
      {
        kind: "styleNot",
        selector: "h1",
        property: "color",
        values: ["rgb(0, 0, 0)"],
        message: "Цвет заголовка больше не чёрный",
        fix: "В правиле h1 замени black на другой цвет, например tomato. Проверь, что после цвета стоит точка с запятой.",
      },
    ],
    learned: [
      "CSS отвечает за то, как страница выглядит.",
      "Правило CSS: кого оформляем, а в фигурных скобках — свойства.",
      "color меняет цвет текста, background-color — цвет фона.",
    ],
    quiz: [
      {
        question: "Какая строка сделает фон страницы жёлтым?",
        options: ["color: yellow;", "background-color: yellow;", "yellow: background;"],
        correct: 1,
        explain: "Фон меняет background-color. Свойство color меняет цвет текста.",
      },
      {
        question: "Что поменяет это правило?",
        code: "h1 {\n  color: tomato;\n}",
        options: ["Цвет фона страницы", "Цвет текста заголовков h1", "Размер заголовка"],
        correct: 1,
        explain: "h1 — кого оформляем, color — цвет текста. Значит, заголовки станут томатного цвета.",
      },
      {
        question: "Чего не хватает в этом правиле?",
        code: "body\n  color: navy;\n}",
        options: ["Открывающей фигурной скобки {", "Точки после body", "Слова px"],
        correct: 0,
        explain: "Свойства пишутся между { и }. Здесь есть закрывающая скобка, но нет открывающей после body.",
      },
    ],
    reference: ref("cveta"),
  },
  {
    track: "project",
    course: "pervyj-sajt",
    slug: "kartochka",
    number: 4,
    title: "Карточка",
    goal: "На твоём сайте появится аккуратная карточка с заголовком и текстом.",
    explanation: [
      "Карточки есть почти на каждом сайте: товар в магазине, видео, профиль игрока. Карточка — это блок-коробка, внутри которой лежат другие элементы.",
      "Блок создаёт тег <div>. Чтобы оформить именно его, даём ему имя-класс: <div class=\"card\">. В CSS к классу обращаются через точку: правило .card { … } оформит все элементы с классом card.",
      "Чтобы блок стал похож на карточку, ему нужны три свойства. background-color — свой фон. padding — внутренний отступ: расстояние от края карточки до текста, чтобы текст не прилипал к краю. border-radius — скругление углов. Размеры в CSS пишут в пикселях: px — это одна точка экрана. 20px — двадцать точек. Число и px пишутся слитно, без пробела.",
    ],
    newTerms: ["div", "class", "h2", "padding", "px", "border-radius"],
    steps: [
      "Во вкладке HTML под комментарием «Урок 4» напиши <div class=\"card\"> и на следующей строке </div>.",
      "Между ними напиши заголовок карточки <h2>…</h2> и абзац <p>…</p> — про свою тему.",
      "Во вкладке CSS под комментарием «Урок 4» напиши правило .card { } и внутри три строки: background-color: white; padding: 20px; border-radius: 16px;",
      "Поиграй с числами: попробуй padding: 40px; или border-radius: 4px; и посмотри, что изменится.",
    ],
    additions: {
      html: "\n<!-- Урок 4: создай здесь карточку: <div class=\"card\"> с <h2> и <p> внутри -->\n\n",
      css: "\n/* Урок 4: напиши здесь правило .card { … } */\n\n",
    },
    focusFile: "html",
    hints: [
      "Сначала HTML: <div class=\"card\"> … </div>, а внутри — <h2> и <p>.",
      "В CSS правило для класса начинается с точки: .card { }. Свойства пишутся внутри фигурных скобок.",
      "Внутрь правила .card напиши: background-color: white; padding: 20px; border-radius: 16px;",
    ],
    practice: [
      {
        kind: "order",
        prompt: "Собери карточку: блок с классом card, внутри заголовок и абзац.",
        lines: ['<div class="card">', "  <h2>Барсик</h2>", "  <p>Любит спать.</p>", "</div>"],
        explain: "Коробка открывается, внутри лежат заголовок и абзац, коробка закрывается.",
      },
      {
        kind: "fill",
        prompt: "Допиши единицу размера.",
        before: ".card { padding: 20",
        after: "; }",
        answers: ["px"],
        explain: "Размеры пишут в пикселях: число и px слитно — 20px.",
      },
      {
        kind: "choice",
        question: "Как обратиться в CSS к элементу с class=\"card\"?",
        options: [".card", "#card", "card"],
        correct: 0,
        explain: "Класс в CSS пишется через точку.",
      },
    ],
    checks: [
      {
        kind: "exists",
        selector: ".card",
        message: "Есть блок с классом card",
        fix: "В HTML напиши <div class=\"card\"> … </div>. Слово card — в кавычках, после знака =.",
      },
      {
        kind: "exists",
        selector: ".card h2",
        message: "Внутри карточки есть заголовок <h2>",
        fix: "Напиши <h2>…</h2> между <div class=\"card\"> и </div>.",
      },
      {
        kind: "exists",
        selector: ".card p",
        message: "Внутри карточки есть абзац <p>",
        fix: "Напиши <p>…</p> между <div class=\"card\"> и </div>, под заголовком <h2>.",
      },
      {
        kind: "styleNot",
        selector: ".card",
        property: "background-color",
        values: ["rgba(0, 0, 0, 0)"],
        message: "У карточки есть свой фон",
        fix: "В CSS внутри правила .card { } напиши строку background-color: white;",
      },
      {
        kind: "styleNot",
        selector: ".card",
        property: "padding-top",
        values: ["0px"],
        message: "У карточки есть внутренний отступ padding",
        fix: "Внутри правила .card { } напиши строку padding: 20px; — число и px слитно.",
      },
      {
        kind: "styleNot",
        selector: ".card",
        property: "border-top-left-radius",
        values: ["0px"],
        message: "У карточки скруглены углы",
        fix: "Внутри правила .card { } напиши строку border-radius: 16px;",
      },
    ],
    learned: [
      "Тег <div> создаёт блок, в который можно класть другие элементы.",
      "Класс помогает оформить нужный элемент: в CSS он пишется через точку.",
      "padding — отступ внутри блока, border-radius — скругление углов, px — пиксели.",
    ],
    quiz: [
      {
        question: "Что делает строка padding: 20px; ?",
        options: ["Скругляет углы", "Делает отступ внутри блока — от края до текста", "Меняет цвет фона"],
        correct: 1,
        explain: "padding — внутренний отступ. Углы скругляет border-radius, а фон меняет background-color.",
      },
      {
        question: "Какая запись правильная?",
        options: ["padding: 20 px;", "padding: 20px;", "padding = 20px;"],
        correct: 1,
        explain: "Число и px пишутся слитно, а между свойством и значением ставится двоеточие.",
      },
      {
        question: "Как в CSS обратиться к элементу с class=\"card\"?",
        options: [".card", "#card", "card()"],
        correct: 0,
        explain: "Класс в CSS пишется через точку: .card { … }.",
      },
    ],
    reference: ref("kartochka"),
  },
  {
    track: "project",
    course: "pervyj-sajt",
    slug: "knopka",
    number: 5,
    title: "Кнопка, которая работает",
    goal: "На твоём сайте появится кнопка: нажмёшь — и на странице появится сообщение.",
    explanation: [
      "HTML и CSS создают страницу, а третий язык — JavaScript — делает её живой: реагирует на нажатия, меняет текст, считает.",
      "Мы уже добавили на твою страницу кнопку и пустой абзац для сообщения (посмотри в самый низ вкладки HTML). У каждого из них есть id — уникальное имя, по которому JavaScript их найдёт.",
      "Во вкладке JavaScript код уже почти готов. Сначала он находит кнопку и абзац. Потом говорит кнопке: «когда тебя нажмут, выполни то, что написано между фигурными скобками { }». Осталось написать, ЧТО должно произойти, — поменять текст абзаца. Для этого есть textContent: message.textContent = \"текст\"; Текст пишется в кавычках.",
      "Как читать этот код по строчкам. const button = document.querySelector(\"#like-button\"); — «найди на странице элемент с id like-button и назови его button». Следующая строка так же находит абзац и называет его message. button.addEventListener(\"click\", function () { … }); — «когда на button нажмут, выполни то, что внутри фигурных скобок». Твоя строка пойдёт именно туда, внутрь скобок.",
    ],
    newTerms: ["id", "button", "querySelector", "addEventListener", "function", "textContent", "string"],
    steps: [
      "Посмотри в самый низ вкладки HTML: там появились кнопка «Нравится» и пустой абзац с id=\"message\".",
      "Открой вкладку JavaScript и найди серую строку «// Замени эту строку на…» — она между фигурными скобками { }.",
      "Удали эту серую строку целиком — она начинается с двух косых черт //. На её месте напиши: message.textContent = \"Твой текст\"; Свой текст пиши между кавычками, а кавычки и точку с запятой оставь.",
      "Нажми кнопку в окне результата: под ней должно появиться твоё сообщение.",
    ],
    additions: {
      html: `
<!-- Урок 5: кнопка и пустой абзац для сообщения.
     Можешь перенести их внутрь карточки — перед </div>. -->
<button id="like-button">Нравится</button>
<p id="message"></p>
`,
      js: `// 1. Находим кнопку и абзац для сообщения
const button = document.querySelector("#like-button");
const message = document.querySelector("#message");

// 2. Говорим кнопке: «когда тебя нажмут, выполни то, что в фигурных скобках»
button.addEventListener("click", function () {
  // Замени эту строку на: message.textContent = "Твой текст";
});
`,
    },
    focusFile: "js",
    hints: [
      "Нужна одна строка, и пишется она между { и } — на месте серого комментария.",
      "Строка начинается с message.textContent = и заканчивается текстом в кавычках и точкой с запятой.",
      "Вот так: message.textContent = \"Спасибо за лайк!\";",
    ],
    practice: [
      {
        kind: "order",
        prompt: "Собери код: найти кнопку и оживить её.",
        lines: [
          'const button = document.querySelector("#like-button");',
          'button.addEventListener("click", function () {',
          '  message.textContent = "Ура!";',
          "});",
        ],
        explain: "Сначала находим кнопку, потом говорим ей, что делать при нажатии.",
      },
      {
        kind: "fill",
        prompt: "Чем поменять текст элемента?",
        before: "message.",
        after: ' = "Привет!";',
        answers: ["textContent"],
        explain: "textContent — текст внутри элемента. Буква C в середине — заглавная.",
      },
      {
        kind: "choice",
        question: "Когда выполнится строка внутри фигурных скобок?",
        code: 'button.addEventListener("click", function () {\n  message.textContent = "Ура!";\n});',
        options: ["Сразу при открытии страницы", "Каждый раз при нажатии на кнопку", "Никогда"],
        correct: 1,
        explain: "addEventListener(\"click\", …) запускает функцию при каждом нажатии.",
      },
    ],
    checks: [
      {
        kind: "clickChangesText",
        click: "#like-button",
        watch: "#message",
        message: "После нажатия на кнопку появляется сообщение",
        fix: "Между { и } в JavaScript напиши строку message.textContent = \"Твой текст\"; Проверь кавычки и что строка стоит внутри фигурных скобок.",
      },
      {
        kind: "noErrors",
        message: "В консоли нет ошибок",
        fix: "Открой консоль под результатом: там написано, в какой строке ошибка. Нажми на номер строки, чтобы перейти к ней.",
      },
    ],
    learned: [
      "JavaScript делает страницу живой.",
      "document.querySelector находит элемент на странице по id.",
      "addEventListener запускает код при нажатии, а textContent меняет текст.",
    ],
    quiz: [
      {
        question: "Что делает эта строка?",
        code: 'message.textContent = "Привет!";',
        options: ["Находит элемент на странице", "Меняет текст элемента message на «Привет!»", "Создаёт новую кнопку"],
        correct: 1,
        explain: "textContent — текст элемента. Знак = кладёт туда новый текст.",
      },
      {
        question: "Где пишется код, который выполнится при нажатии на кнопку?",
        code: 'button.addEventListener("click", function () {\n  // ?\n});',
        options: ["Перед addEventListener", "Между фигурными скобками { }", "В HTML внутри <button>"],
        correct: 1,
        explain: "Всё, что между { и } функции, выполняется каждый раз при нажатии.",
      },
      {
        question: "Что найдёт document.querySelector(\"#like-button\")?",
        options: ["Элемент с id=\"like-button\"", "Все кнопки на странице", "Элемент с class=\"like-button\""],
        correct: 0,
        explain: "Решётка # означает id. Для класса была бы точка: \".like-button\".",
      },
    ],
    reference: ref("knopka"),
  },
  {
    track: "project",
    course: "pervyj-sajt",
    slug: "dizajn",
    number: 6,
    title: "Улучшаем дизайн",
    goal: "Твой сайт станет заметно красивее: тень у карточки, свой шрифт и живая кнопка.",
    plannedWithMentor: true,
    explanation: [
      "Хороший дизайн складывается из мелочей. Мягкая тень отделяет карточку от фона — свойство box-shadow. Шрифт задаёт настроение — свойство font-family. Кнопка, которая меняется под курсором, подсказывает, что на неё можно нажать.",
      "Чтобы кнопка менялась при наведении, пишут отдельное правило с :hover — например button:hover { … }. Оно действует, только пока курсор над кнопкой (на телефоне — при касании).",
      "Новые правила пиши в конец вкладки CSS, под комментарием «Урок 6». Если правило для того же элемента уже есть выше, ничего страшного: браузер сложит их, а при споре победит то, что ниже.",
    ],
    newTerms: ["box-shadow", "font-family", "font-size", "hover"],
    steps: [
      "Во вкладке CSS под комментарием «Урок 6» напиши правило .card { } и внутри — тень: box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);",
      "Напиши правило body { } и внутри выбери шрифт: font-family: Verdana, sans-serif;",
      "Напиши правило button { } и задай кнопке свой цвет фона через background-color. Можно добавить border-radius и color для текста.",
      "Напиши правило button:hover { } и внутри — другой background-color. Наведи курсор на кнопку и проверь.",
    ],
    additions: {
      css: "\n/* Урок 6: сделай дизайн лучше — тень карточки, шрифт, кнопка и :hover */\n\n",
    },
    focusFile: "css",
    hints: [
      "Тень: box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); Шрифт: font-family: Verdana, sans-serif;",
      "Кнопка: button { background-color: tomato; } а ниже — button:hover { background-color: gold; }",
    ],
    practice: [
      {
        kind: "fill",
        prompt: "Допиши правило для кнопки под курсором.",
        before: "button:",
        after: " { background-color: gold; }",
        answers: ["hover"],
        explain: ":hover — пока курсор над элементом.",
      },
      {
        kind: "choice",
        question: "Что делает box-shadow?",
        options: ["Добавляет тень", "Меняет шрифт", "Скругляет углы"],
        correct: 0,
        explain: "box-shadow — тень блока.",
      },
    ],
    checks: [
      {
        kind: "styleNot",
        selector: ".card",
        property: "box-shadow",
        values: ["none"],
        message: "У карточки есть тень",
        fix: "Напиши правило .card { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); } — числа через пробел, в конце точка с запятой.",
      },
      {
        kind: "source",
        file: "css",
        pattern: "font-family\\s*:",
        message: "Выбран шрифт через font-family",
        fix: "Напиши правило body { font-family: Verdana, sans-serif; }",
      },
      {
        kind: "source",
        file: "css",
        pattern: "button\\s*\\{[^}]*background(-color)?\\s*:",
        message: "У кнопки свой цвет фона",
        fix: "Напиши правило button { background-color: tomato; } — любой цвет, который тебе нравится.",
      },
      {
        kind: "source",
        file: "css",
        pattern: ":hover\\s*\\{[^}]*:",
        message: "Кнопка меняется при наведении (:hover)",
        fix: "Напиши правило button:hover { background-color: gold; } — двоеточие перед hover без пробела.",
      },
    ],
    learned: [
      "box-shadow добавляет тень, font-family меняет шрифт.",
      ":hover задаёт вид элемента под курсором.",
      "Дизайн улучшают маленькими шагами, проверяя результат после каждого.",
    ],
    quiz: [
      {
        question: "Когда сработает правило button:hover?",
        options: ["Всегда", "Когда курсор над кнопкой", "Когда кнопку нажали два раза"],
        correct: 1,
        explain: ":hover — «под курсором». Стоит увести мышь, и кнопка вернётся к обычному виду.",
      },
      {
        question: "Какое свойство добавляет тень?",
        options: ["box-shadow", "font-family", "border-radius"],
        correct: 0,
        explain: "box-shadow — тень блока. font-family — шрифт, border-radius — скругление углов.",
      },
    ],
    reference: ref("dizajn"),
  },
  {
    track: "practice",
    course: "pervyj-sajt",
    slug: "oshibka",
    number: 7,
    title: "Тренировка: найди ошибку",
    goal: "Кнопка «Старт» снова заработает.",
    explanation: [
      "Это тренировка на чужом коде — твой сайт она не меняет. Ошибки бывают у всех программистов, даже у самых опытных. Главное — уметь их находить.",
      "Когда что-то не работает, первым делом загляни в консоль под окном результата: там написано, что пошло не так и в какой строке. Нажми на номер строки — редактор сам покажет её. Исправь одну ошибку, проверь, и только потом ищи следующую.",
      "Красный текст в консоли пишет браузер, и он частично по-английски — это нормально, его не нужно переводить целиком. Над ним студия пишет объяснение по-русски, а если видит опечатку в названии команды, подсказывает, как оно пишется правильно.",
    ],
    newTerms: ["console"],
    steps: [
      "Нажми «Старт» в окне результата и посмотри в консоль.",
      "Прочитай объяснение ошибки и нажми на номер строки — редактор покажет её.",
      "Исправь ошибку и снова посмотри в консоль: ошибок здесь две.",
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
      "Сравни id кнопки во вкладке HTML с тем, что написано в querySelector.",
      "Внимательно прочитай по буквам название addEventListener — в коде одна буква пропущена.",
    ],
    practice: [
      {
        kind: "choice",
        question: "В какой строке ошибка?",
        code: '1: const button = document.querySelector("#start-button");\n2: button.addEventListner("click", function () {\n3:   alert("Старт!");\n4: });',
        options: ["В строке 1", "В строке 2", "В строке 4"],
        correct: 1,
        explain: "addEventListner — пропущена буква e: правильно addEventListener.",
      },
      {
        kind: "fill",
        prompt: "У кнопки id=\"start-button\". Как её найти?",
        before: 'document.querySelector("',
        after: '")',
        answers: ["#start-button"],
        explain: "Решётка # и id — до буквы как в HTML.",
      },
    ],
    checks: [
      {
        kind: "clickChangesText",
        click: "#start-button",
        watch: "#status",
        message: "Кнопка «Старт» меняет текст статуса",
        fix: "Сравни id кнопки в HTML (start-button) с тем, что написано в querySelector в первой строке JavaScript.",
      },
      {
        kind: "noErrors",
        message: "В консоли нет ошибок",
        fix: "Посмотри в консоль: если там осталась ошибка, проверь по буквам слово addEventListener.",
      },
    ],
    learned: [
      "Консоль показывает, что за ошибка и в какой она строке.",
      "id в HTML и в querySelector должны совпадать до буквы.",
      "Ошибки исправляют по одной, проверяя результат после каждой.",
    ],
    quiz: [
      {
        question: "Что первым делом стоит сделать, если код не работает?",
        options: ["Удалить весь код", "Посмотреть в консоль", "Начать урок заново"],
        correct: 1,
        explain: "В консоли написано, что случилось и в какой строке. С неё и начинают поиск.",
      },
      {
        question: "Почему этот код не найдёт кнопку?",
        code: '<button id="go">Старт</button>\n\ndocument.querySelector("#start")',
        options: ["id в HTML и в querySelector не совпадают", "Решётку # писать не нужно", "У кнопки нет текста"],
        correct: 0,
        explain: "В HTML id кнопки — go, а код ищет start. Имена должны совпадать до буквы.",
      },
    ],
    reference: ref("oshibka"),
  },
  {
    track: "project",
    course: "pervyj-sajt",
    slug: "schetchik",
    number: 8,
    title: "Счётчик лайков",
    goal: "На твоём сайте появится счётчик: каждое нажатие на «+1» увеличит число.",
    explanation: [
      "Возвращаемся к твоему сайту. Чтобы программа что-то запомнила — например, сколько раз нажали кнопку, — используют переменные. Переменная — это коробка с именем. let count = 0; создаёт коробку count и кладёт туда 0. Слово let значит, что содержимое коробки можно менять.",
      "count = count + 1; значит: возьми то, что лежит в count, прибавь один и положи обратно. Но на странице число само не поменяется — новое значение нужно показать через textContent, как в уроке 5.",
      "Мы добавили в конец HTML строку «Лайков: 0» и кнопку «+1», а в конец JavaScript — начало кода. Тег <span> выделяет кусочек текста — число, — чтобы код мог его найти.",
    ],
    newTerms: ["variable", "count-plus", "span"],
    steps: [
      "Посмотри в низ вкладки JavaScript: там новый блок «Урок 8» с переменными count, countText и plusButton.",
      "Под комментариями напиши обработчик нажатия, как в уроке 5: plusButton.addEventListener(\"click\", function () { … });",
      "Между { и } напиши две строки: сначала увеличь count на 1, потом покажи count в countText.",
      "Понажимай «+1» в окне результата. Если получится — сделай сам кнопку «−1».",
    ],
    additions: {
      html: `
<!-- Урок 8: счётчик лайков -->
<p>Лайков: <span id="count">0</span></p>
<button id="plus">+1</button>
`,
      js: `
// Урок 8: счётчик
let count = 0;
const countText = document.querySelector("#count");
const plusButton = document.querySelector("#plus");

// Когда нажимают «+1»:
// 1) увеличь count на 1
// 2) покажи новое значение в countText
`,
    },
    focusFile: "js",
    hints: [
      "Обработчик пишется так же, как в уроке 5: plusButton.addEventListener(\"click\", function () { … });",
      "Внутри функции две строки: count = count + 1; и countText.textContent = count;",
    ],
    practice: [
      {
        kind: "choice",
        question: "Что будет в count после трёх нажатий?",
        code: "let count = 0;\n// при каждом нажатии:\ncount = count + 1;",
        options: ["1", "3", "0"],
        correct: 1,
        explain: "Каждое нажатие прибавляет 1: 0 → 1 → 2 → 3.",
      },
      {
        kind: "fill",
        prompt: "Допиши знак, чтобы счёт увеличивался.",
        before: "count = count ",
        after: " 1;",
        answers: ["+"],
        explain: "Плюс прибавляет единицу к старому значению.",
      },
    ],
    checks: [
      {
        kind: "clickSequence",
        click: "#plus",
        watch: "#count",
        expect: ["1", "2", "3"],
        message: "Три нажатия на «+1» показывают 1, 2, 3",
        fix: "Внутри обработчика нужны две строки: count = count + 1; и countText.textContent = count; — именно в таком порядке.",
      },
      {
        kind: "noErrors",
        message: "В консоли нет ошибок",
        fix: "Посмотри в консоль и нажми на номер строки с ошибкой. Частая причина — пропущенная скобка ) или } в конце обработчика.",
      },
    ],
    learned: [
      "Переменная хранит значение, а let позволяет его менять.",
      "count = count + 1 увеличивает значение на один.",
      "Чтобы увидеть изменение, новое значение надо показать на странице.",
    ],
    quiz: [
      {
        question: "Чему будет равен count?",
        code: "let count = 5;\ncount = count + 1;",
        options: ["5", "6", "51"],
        correct: 1,
        explain: "Берём 5, прибавляем 1 и кладём обратно в count — получается 6.",
      },
      {
        question: "Почему для счёта используют let, а не const?",
        options: ["let работает быстрее", "Значение в let можно менять", "const нельзя использовать с числами"],
        correct: 1,
        explain: "Счёт растёт с каждым нажатием, значит, значение меняется. const менять нельзя.",
      },
    ],
    reference: ref("schetchik"),
  },
  {
    track: "practice",
    course: "pervyj-sajt",
    slug: "svoya-versiya",
    number: 9,
    title: "Тренировка: переделай чужой проект",
    goal: "Чужой генератор фактов станет твоим: своя тема, свои факты, свой цвет.",
    explanation: [
      "Это тренировка на чужом коде — твой сайт она не меняет. Программисты часто начинают не с пустого листа, а с готового рабочего кода, который нужно понять и изменить.",
      "Здесь факты хранятся в массиве facts. Массив — это список в квадратных скобках [ ]. Каждый элемент — строка в кавычках, а между элементами стоит запятая. Math.random выбирает из списка случайный факт. Этот приём пригодится тебе в последнем уроке.",
    ],
    newTerms: ["array", "random"],
    steps: [
      "Выбери свою тему и поменяй заголовок во вкладке HTML.",
      "Во вкладке JavaScript добавь в массив facts минимум два своих факта (всего — не меньше пяти). Не забудь кавычки и запятые.",
      "Во вкладке CSS поменяй цвет кнопки.",
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
    practice: [
      {
        kind: "choice",
        question: "Что такое facts[0]?",
        code: 'const facts = ["Кот", "Пёс", "Хомяк"];',
        options: ["«Кот»", "«Пёс»", "Ошибка"],
        correct: 0,
        explain: "Элементы массива нумеруются с нуля: facts[0] — первый.",
      },
      {
        kind: "fill",
        prompt: "Чего не хватает между элементами массива?",
        before: '["Кот"',
        after: ' "Пёс"]',
        answers: [","],
        explain: "Элементы массива разделяют запятыми.",
      },
    ],
    checks: [
      {
        kind: "text",
        selector: "h1",
        minLength: 3,
        notEquals: ["Факты о космосе"],
        message: "Заголовок изменён на твою тему",
        fix: "Во вкладке HTML замени текст между <h1> и </h1> на свою тему.",
      },
      {
        kind: "clickDistinct",
        click: "#next-fact",
        watch: "#fact",
        clicks: 60,
        minDistinct: 5,
        message: "Кнопка показывает не меньше пяти разных фактов",
        fix: "В массиве facts должно быть хотя бы пять разных строк в кавычках, с запятой после каждой.",
      },
      {
        kind: "styleNot",
        selector: "button",
        property: "background-color",
        values: ["rgb(59, 91, 219)"],
        message: "У кнопки новый цвет",
        fix: "Во вкладке CSS в правиле button замени #3b5bdb на другой цвет, например seagreen.",
      },
    ],
    learned: [
      "Массив хранит список значений в квадратных скобках.",
      "Math.random помогает выбрать случайный элемент.",
      "Чужой код можно понять по частям и аккуратно изменить.",
    ],
    quiz: [
      {
        question: "Сколько элементов в этом массиве?",
        code: 'const pets = ["кот", "пёс", "хомяк"];',
        options: ["2", "3", "4"],
        correct: 1,
        explain: "Элементы — это строки в кавычках через запятую: кот, пёс, хомяк.",
      },
      {
        question: "Чего не хватает в этом массиве?",
        code: 'const facts = [\n  "Первый факт"\n  "Второй факт",\n];',
        options: ["Запятой после первого факта", "Точки в конце", "Ещё одного факта"],
        correct: 0,
        explain: "Элементы массива разделяются запятыми. Без запятой JavaScript не поймёт, где кончается первый факт.",
      },
    ],
    reference: ref("svoya-versiya"),
  },
  {
    track: "project",
    course: "pervyj-sajt",
    slug: "moj-proekt",
    number: 10,
    title: "Своя функция для сайта",
    goal: "Ты сам придумаешь и добавишь на свой сайт новую кнопку, которая что-то делает.",
    explanation: [
      "Финал! Ты умеешь создавать страницу, оформлять её и оживлять кнопками. Теперь добавь на свой сайт что-то своё — без готовой заготовки.",
      "Идеи: кнопка «Случайный факт» о теме сайта (приём из урока 9), кнопка «−1» для счётчика, кнопка, которая меняет текст заголовка, «магический шар», который отвечает на вопросы. Можно придумать своё.",
      "Помни порядок: сначала в HTML добавь кнопку с id и элемент, который будет меняться. Потом в JavaScript найди их через querySelector и напиши обработчик через addEventListener.",
      "Разберём пример — кнопку, которая меняет заголовок сайта. В HTML: <button id=\"title-button\">Сменить заголовок</button>. В JavaScript три шага. Найти кнопку: const titleButton = document.querySelector(\"#title-button\"); Найти заголовок: const title = document.querySelector(\"h1\"); Сказать кнопке, что делать: titleButton.addEventListener(\"click\", function () { title.textContent = \"Барсик — король дивана\"; }); Свою кнопку можно собрать по тому же рецепту — поменяй id, текст и то, что происходит внутри { }.",
    ],
    newTerms: [],
    steps: [
      "Придумай, что будет делать твоя новая кнопка.",
      "Во вкладке HTML под комментарием «Урок 10» напиши кнопку с новым id — не таким, как у кнопок «Нравится» и «+1». Например: <button id=\"title-button\">Сменить заголовок</button>.",
      "Во вкладке JavaScript под комментарием «Урок 10» найди кнопку через querySelector и напиши для неё addEventListener — по рецепту из примера выше.",
      "Если хочешь, оформи новые элементы в CSS. Проверь, что старые кнопки тоже работают.",
    ],
    additions: {
      html: "\n<!-- Урок 10: добавь сюда свою новую кнопку -->\n\n",
      js: "\n// Урок 10: здесь оживи свою новую кнопку\n\n",
    },
    focusFile: "html",
    hints: [
      "Загляни в уроки 5, 8 и 9 и в шпаргалку: там есть готовые приёмы для кнопок, счётчиков и случайного выбора.",
    ],
    practice: [
      {
        kind: "order",
        prompt: "Собери рецепт новой кнопки, которая меняет заголовок.",
        lines: [
          'const titleButton = document.querySelector("#title-button");',
          'const title = document.querySelector("h1");',
          'titleButton.addEventListener("click", function () {',
          '  title.textContent = "Новый заголовок";',
          "});",
        ],
        explain: "Найти кнопку → найти, что менять → сказать кнопке, что делать при нажатии.",
      },
    ],
    checks: [
      {
        kind: "text",
        selector: "h1",
        minLength: 3,
        message: "У сайта есть заголовок",
        fix: "Проверь, что на странице остался заголовок <h1> с названием сайта.",
      },
      {
        kind: "source",
        file: "html",
        pattern: "<button\\b",
        minMatches: 3,
        message: "На странице есть твоя новая кнопка (кроме «Нравится» и «+1»)",
        fix: "Под комментарием «Урок 10» во вкладке HTML добавь кнопку со своим id, например: <button id=\"title-button\">Сменить заголовок</button>.",
      },
      {
        kind: "source",
        file: "js",
        pattern: "addEventListener\\s*\\(",
        minMatches: 3,
        message: "Новая кнопка что-то делает: для неё есть свой addEventListener",
        fix: "В JavaScript найди новую кнопку через document.querySelector(\"#новое-имя\") и напиши для неё addEventListener — как в уроке 5.",
      },
      {
        kind: "noErrors",
        message: "В консоли нет ошибок",
        fix: "Посмотри в консоль и нажми на номер строки. Частая причина — id в HTML и в querySelector не совпадают.",
      },
    ],
    learned: [
      "Ты прошёл путь от первого тега до своего сайта.",
      "HTML, CSS и JavaScript работают вместе.",
      "Большой проект собирается из маленьких шагов.",
    ],
    quiz: [
      {
        question: "Ты хочешь, чтобы по кнопке менялся текст. Что для этого понадобится?",
        options: ["querySelector, addEventListener и textContent", "Только CSS", "Только тег <p>"],
        correct: 0,
        explain: "querySelector находит элементы, addEventListener ловит нажатие, textContent меняет текст.",
      },
      {
        question: "Какой язык отвечает за цвета и отступы?",
        options: ["HTML", "CSS", "JavaScript"],
        correct: 1,
        explain: "HTML — что на странице, CSS — как это выглядит, JavaScript — как это оживает.",
      },
    ],
    reference: ref("moj-proekt"),
  },
];

/** Все уроки маршрута по порядку: «Старт», курс 1, курс 2, Python. */
export const lessons: Lesson[] = [...course0, ...course1, ...course2, ...coursePython, ...course3];

/** Уроки одного курса. */
export function courseLessons(course: string): Lesson[] {
  return lessons.filter((l) => l.course === course);
}

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getLessonIndex(slug: string): number {
  return lessons.findIndex((l) => l.slug === slug);
}
