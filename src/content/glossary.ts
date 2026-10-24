/**
 * Шпаргалка: понятия, которые ребёнок встречает в уроках.
 * Карточка открывается из текста урока (по нажатию на выделенное слово)
 * и из раздела «Шпаргалка». Понятие становится видно в шпаргалке,
 * когда открыт урок, в котором оно появляется (introducedIn).
 */
export type TermGroup = "html" | "css" | "js";

export type GlossaryTerm = {
  id: string;
  /** как понятие пишется в коде или называется */
  term: string;
  group: TermGroup;
  /** простыми словами: что это и зачем */
  what: string;
  /** готовый пример, который можно скопировать */
  example: string;
  /** пояснение к примеру или частая ошибка */
  note?: string;
  /** живой пример: как это выглядит (только HTML и CSS, без скриптов) */
  demo?: { html: string; css?: string };
  /** как понятие может встретиться в тексте урока */
  aliases: string[];
  /** урок, в котором понятие появляется впервые */
  introducedIn: string;
};

export const groupTitles: Record<TermGroup, string> = {
  html: "HTML — из чего состоит страница",
  css: "CSS — как страница выглядит",
  js: "JavaScript — как страница оживает",
};

export const glossary: GlossaryTerm[] = [
  // ---------- HTML ----------
  {
    id: "tag",
    term: "Тег",
    group: "html",
    what: "Слово в угловых скобках, которое говорит браузеру, что это за кусочек страницы. Обычно теги идут парой: открывающий <h1> и закрывающий </h1>. Всё, что между ними, — содержимое.",
    example: "<h1>Мой сайт</h1>",
    note: "Закрывающий тег отличается от открывающего только косой чертой /. Если её забыть, браузер не поймёт, где заканчивается элемент.",
    aliases: ["тег", "теги"],
    introducedIn: "zagolovok",
  },
  {
    id: "comment",
    term: "<!-- комментарий -->",
    group: "html",
    what: "Заметка для человека, который читает код. Браузер её не показывает. В HTML комментарий начинается с <!-- и заканчивается -->, в CSS пишется между /* и */, в JavaScript — после //.",
    example: "<!-- Здесь будет карточка -->",
    aliases: ["<!--", "-->", "//", "/*", "*/"],
    introducedIn: "zagolovok",
  },
  {
    id: "h1",
    term: "<h1>",
    group: "html",
    what: "Главный заголовок страницы — самый крупный текст. Обычно он один на странице. Есть и заголовки поменьше: <h2>, <h3> и так до <h6>.",
    example: "<h1>Сайт про котов</h1>",
    demo: { html: "<h1>Сайт про котов</h1>" },
    aliases: ["<h1>", "</h1>", "h1"],
    introducedIn: "zagolovok",
  },
  {
    id: "p",
    term: "<p>",
    group: "html",
    what: "Абзац обычного текста. Браузер сам переносит длинный текст на новую строку и делает отступ между абзацами.",
    example: "<p>Барсику три года. Он любит спать на клавиатуре.</p>",
    demo: { html: "<p>Барсику три года. Он любит спать на клавиатуре.</p><p>А это второй абзац.</p>" },
    aliases: ["<p>", "</p>"],
    introducedIn: "opisanie",
  },
  {
    id: "h2",
    term: "<h2>",
    group: "html",
    what: "Заголовок второго уровня — поменьше главного. Подходит для названия раздела или карточки.",
    example: "<h2>Чем занимается Барсик</h2>",
    demo: { html: "<h1>Главный заголовок</h1><h2>Заголовок поменьше</h2>" },
    aliases: ["<h2>", "</h2>"],
    introducedIn: "kartochka",
  },
  {
    id: "div",
    term: "<div>",
    group: "html",
    what: "Блок-коробка, в которую кладут другие элементы. Сам по себе невидим, но его можно оформить: дать фон, отступы, скругление — и получится карточка.",
    example: '<div class="card">\n  <h2>Заголовок</h2>\n  <p>Текст</p>\n</div>',
    note: "Элементы внутри блока пишут с отступом — так легче видеть, что лежит внутри чего.",
    aliases: ["<div>", "</div>", "div", '<div class="card">'],
    introducedIn: "kartochka",
  },
  {
    id: "class",
    term: "class",
    group: "html",
    what: "Имя, которое мы даём элементу, чтобы оформить его в CSS. Одно и то же имя класса можно дать многим элементам. В CSS к классу обращаются через точку: .card.",
    example: '<div class="card">…</div>\n\n.card {\n  background-color: white;\n}',
    aliases: ["class", "класс", "классом", ".card"],
    introducedIn: "kartochka",
  },
  {
    id: "id",
    term: "id",
    group: "html",
    what: "Уникальное имя элемента — как номер на футболке: на странице он должен быть только у одного элемента. По id элемент находит JavaScript: в querySelector перед ним ставят решётку #.",
    example: '<button id="like-button">Нравится</button>\n\ndocument.querySelector("#like-button")',
    note: "id в HTML и в querySelector должны совпадать до буквы, иначе код элемент не найдёт.",
    aliases: ["id"],
    introducedIn: "knopka",
  },
  {
    id: "button",
    term: "<button>",
    group: "html",
    what: "Кнопка. Сама по себе ничего не делает — что произойдёт при нажатии, решает JavaScript.",
    example: '<button id="like-button">Нравится</button>',
    demo: { html: "<button>Нравится</button>" },
    aliases: ["<button>", "</button>", "button"],
    introducedIn: "knopka",
  },
  {
    id: "span",
    term: "<span>",
    group: "html",
    what: "Кусочек текста внутри строки, который нужно найти или оформить отдельно. В отличие от <div>, не начинается с новой строки.",
    example: '<p>Лайков: <span id="count">0</span></p>',
    aliases: ["<span>", "</span>", "span"],
    introducedIn: "schetchik",
  },

  // ---------- CSS ----------
  {
    id: "css-rule",
    term: "Правило CSS",
    group: "css",
    what: "Инструкция, как оформить элементы. Сначала пишем, кого оформляем (это селектор), потом в фигурных скобках — что меняем. Каждая строка внутри: название свойства, двоеточие, значение, точка с запятой.",
    example: "h1 {\n  color: tomato;\n}",
    note: "Частая ошибка — забытая точка с запятой или фигурная скобка. Тогда правило может перестать работать.",
    aliases: ["селектор", "свойство", "свойства", "свойств"],
    introducedIn: "cveta",
  },
  {
    id: "color",
    term: "color",
    group: "css",
    what: "Цвет текста. Цвет можно написать словом на английском (tomato, gold, skyblue, white) или кодом вроде #ff6b6b.",
    example: "h1 {\n  color: tomato;\n}",
    demo: { html: "<h1>Цветной заголовок</h1>", css: "h1 { color: tomato; }" },
    aliases: ["color"],
    introducedIn: "cveta",
  },
  {
    id: "background-color",
    term: "background-color",
    group: "css",
    what: "Цвет фона элемента. Если написать его в правиле body — поменяется фон всей страницы.",
    example: "body {\n  background-color: lavender;\n}",
    demo: { html: "<p>Текст на сиреневом фоне</p>", css: "body { background-color: lavender; }" },
    aliases: ["background-color", "background"],
    introducedIn: "cveta",
  },
  {
    id: "px",
    term: "px (пиксели)",
    group: "css",
    what: "Единица размера: пиксель — одна крошечная точка экрана. 20px — это 20 таких точек. Число и px пишутся слитно, без пробела.",
    example: "padding: 20px;\nfont-size: 18px;",
    note: "Правильно: 20px. Неправильно: 20 px (с пробелом) или просто 20 — без px браузер такое значение не поймёт.",
    aliases: ["px", "20px", "16px", "40px", "4px"],
    introducedIn: "kartochka",
  },
  {
    id: "padding",
    term: "padding",
    group: "css",
    what: "Внутренний отступ: расстояние от края блока до его содержимого. Без него текст прилипает к краю карточки, с ним — «дышит».",
    example: ".card {\n  padding: 20px;\n}",
    note: "Сравни две карточки в примере: слева без padding, справа с padding: 20px.",
    demo: {
      html: '<div class="box">Без отступа</div><div class="box pad">С отступом 20px</div>',
      css: "body{display:flex;gap:12px;align-items:flex-start;font-family:sans-serif}.box{background:#ffd8a8;}.pad{padding:20px}",
    },
    aliases: ["padding"],
    introducedIn: "kartochka",
  },
  {
    id: "border-radius",
    term: "border-radius",
    group: "css",
    what: "Скругление углов. Чем больше число, тем круглее углы.",
    example: ".card {\n  border-radius: 16px;\n}",
    demo: {
      html: '<div class="box">0px</div><div class="box r">16px</div>',
      css: "body{display:flex;gap:12px;font-family:sans-serif}.box{background:#a5d8ff;padding:16px}.r{border-radius:16px}",
    },
    aliases: ["border-radius"],
    introducedIn: "kartochka",
  },
  {
    id: "font-size",
    term: "font-size",
    group: "css",
    what: "Размер шрифта. Обычный текст на сайтах — около 16px.",
    example: "p {\n  font-size: 18px;\n}",
    demo: { html: '<p style="font-size:12px">12px</p><p style="font-size:24px">24px</p>' },
    aliases: ["font-size"],
    introducedIn: "dizajn",
  },
  {
    id: "font-family",
    term: "font-family",
    group: "css",
    what: "Шрифт текста. Пишут несколько шрифтов через запятую: если первого нет на компьютере, браузер возьмёт следующий. В конце ставят общий вид шрифта — например sans-serif (без засечек).",
    example: "body {\n  font-family: Verdana, sans-serif;\n}",
    demo: {
      html: '<p class="a">Шрифт с засечками</p><p class="b">Шрифт без засечек</p>',
      css: ".a{font-family:Georgia,serif;font-size:18px}.b{font-family:Verdana,sans-serif;font-size:18px}",
    },
    aliases: ["font-family"],
    introducedIn: "dizajn",
  },
  {
    id: "box-shadow",
    term: "box-shadow",
    group: "css",
    what: "Тень у блока. Числа по порядку: сдвиг вправо, сдвиг вниз, размытие. Потом цвет тени — обычно полупрозрачный чёрный.",
    example: ".card {\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);\n}",
    demo: {
      html: '<div class="box">Карточка с тенью</div>',
      css: "body{padding:12px 16px 24px;font-family:sans-serif}.box{background:white;padding:16px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18)}",
    },
    aliases: ["box-shadow"],
    introducedIn: "dizajn",
  },
  {
    id: "hover",
    term: ":hover",
    group: "css",
    what: "Как элемент выглядит, пока над ним курсор мыши. Пишется сразу после селектора, без пробела. На телефоне срабатывает при касании.",
    example: "button:hover {\n  background-color: gold;\n}",
    aliases: [":hover", "button:hover"],
    introducedIn: "dizajn",
  },

  // ---------- JavaScript ----------
  {
    id: "variable",
    term: "Переменная: const и let",
    group: "js",
    what: "Коробка с именем, в которой программа хранит значение. const — коробка, содержимое которой не меняется. let — коробка, в которую можно положить новое значение.",
    example: 'const name = "Барсик";\nlet count = 0;\ncount = count + 1; // теперь в count лежит 1',
    note: "Если значение будет меняться (например, счёт), объявляй переменную через let.",
    aliases: ["const", "let", "переменную", "переменная", "переменные"],
    introducedIn: "schetchik",
  },
  {
    id: "querySelector",
    term: "document.querySelector",
    group: "js",
    what: "Находит элемент на странице, чтобы JavaScript мог с ним работать. В скобках в кавычках пишут, что искать: #имя для id, .имя для класса или название тега.",
    example: 'const button = document.querySelector("#like-button");',
    note: "Если элемент не найден, querySelector вернёт null, и в консоли появится ошибка «Cannot read properties of null».",
    aliases: ["querySelector", "document.querySelector"],
    introducedIn: "knopka",
  },
  {
    id: "addEventListener",
    term: "addEventListener",
    group: "js",
    what: "Говорит элементу: «когда с тобой случится вот это, выполни вот этот код». Чаще всего событие — это \"click\", нажатие.",
    example: 'button.addEventListener("click", function () {\n  // этот код выполнится при нажатии\n});',
    aliases: ["addEventListener"],
    introducedIn: "knopka",
  },
  {
    id: "function",
    term: "function () { }",
    group: "js",
    what: "Набор команд, который выполняется не сразу, а когда его позовут. Команды пишут между фигурными скобками { и }. В addEventListener функцию «зовёт» нажатие на кнопку.",
    example: "function () {\n  // команды пишутся здесь, между { и }\n}",
    aliases: ["функция", "функции", "функцию", "function"],
    introducedIn: "knopka",
  },
  {
    id: "textContent",
    term: "textContent",
    group: "js",
    what: "Текст внутри элемента. Чтобы поменять текст, присвой ему новое значение через знак =. Текст пишется в кавычках.",
    example: 'message.textContent = "Барсик доволен!";',
    aliases: ["textContent", "message.textContent", "countText.textContent"],
    introducedIn: "knopka",
  },
  {
    id: "string",
    term: "Строка в кавычках",
    group: "js",
    what: "Текст в программе всегда пишут в кавычках — так JavaScript понимает, что это слова, а не команды.",
    example: '"Привет!"',
    note: "Открывающая и закрывающая кавычки должны быть одинаковыми: \"…\" или '…'.",
    aliases: ["кавычках", "кавычки"],
    introducedIn: "knopka",
  },
  {
    id: "console",
    term: "Консоль",
    group: "js",
    what: "Окошко под результатом, куда программа пишет сообщения и ошибки. Если что-то не работает — первым делом смотри туда: там написано, что случилось и в какой строке.",
    example: 'console.log("Проверка: код дошёл до этого места");',
    aliases: ["консоль", "консоли", "console.log"],
    introducedIn: "oshibka",
  },
  {
    id: "count-plus",
    term: "count = count + 1",
    group: "js",
    what: "Увеличить значение на один: возьми то, что лежит в count, прибавь 1 и положи обратно в count.",
    example: "let count = 0;\ncount = count + 1; // 1\ncount = count + 1; // 2",
    aliases: ["count = count + 1", "count = count + 1;"],
    introducedIn: "schetchik",
  },
  {
    id: "array",
    term: "Массив [ ]",
    group: "js",
    what: "Список значений в квадратных скобках через запятую. Элементы нумеруются с нуля: первый — facts[0], второй — facts[1].",
    example: 'const facts = [\n  "Первый факт",\n  "Второй факт",\n];',
    aliases: ["массив", "массиве", "массива", "facts"],
    introducedIn: "svoya-versiya",
  },
  {
    id: "random",
    term: "Math.random",
    group: "js",
    what: "Даёт случайное число от 0 до 1. Вместе с Math.floor помогает выбрать случайный элемент массива.",
    example: "const index = Math.floor(Math.random() * facts.length);\nfactText.textContent = facts[index];",
    aliases: ["Math.random", "Math.random()", "Math.floor"],
    introducedIn: "svoya-versiya",
  },
];

const aliasMap = new Map<string, string>();
for (const t of glossary) {
  for (const a of t.aliases) aliasMap.set(a.toLowerCase(), t.id);
}

/** Ищет понятие по фрагменту кода или слову из текста урока. */
export function findTermId(token: string): string | null {
  const raw = token.trim().toLowerCase();
  const candidates = [
    raw,
    raw.replace(/[:;]+$/, ""),
    raw.replace(/\(.*$/, ""),
    raw.replace(/:.*$/, ""),
    raw.split(".").pop() ?? raw,
  ];
  for (const c of candidates) {
    const id = aliasMap.get(c);
    if (id) return id;
  }
  return null;
}

export function getTerm(id: string): GlossaryTerm | undefined {
  return glossary.find((t) => t.id === id);
}
