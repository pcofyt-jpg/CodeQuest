import type { Lesson, ProjectFiles } from "./types";
import referencesJson from "./references.json";

/**
 * Модуль «Понимаю структуру кода» — по наблюдениям пилота (docs/pilot-feedback.md):
 * ребёнок легко придумывает содержание, но путается в структуре: пары тегов, второй <main>,
 * порядок разделов, родитель и дети (.cards и .card), id и class, вертикальное меню,
 * чтение технических требований. Формат — найти и исправить самому: проверки смотрят
 * на устройство кода (structureOk, count, order), а помощник в консоли называет строку и причину.
 */
const references = referencesJson as Record<string, ProjectFiles>;
const ref = (slug: string): ProjectFiles => {
  const r = references[slug];
  if (!r) throw new Error(`Нет эталонного решения для урока ${slug}`);
  return r;
};
const C = "struktura";
const baseCss = "body {\n  font-family: Verdana, sans-serif;\n  margin: 16px;\n}\n";

export const courseStruktura: Lesson[] = [
  {
    track: "practice",
    course: C,
    slug: "para-tegov",
    number: 1,
    title: "Пары тегов",
    goal: "Ты найдёшь и исправишь три ошибки в тегах — и научишься замечать их сам.",
    explanation: [
      "Тег состоит из трёх частей: < в начале, имя и > в конце — <h1>. Закрывающий тег такой же, но с косой чертой: </h1>. Если пропустить > — браузер не поймёт, где кончается тег, и текст может пропасть.",
      "Открывающий тег — это начало коробки, закрывающий — её конец. Всё, что между ними, лежит внутри. Без закрывающего тега коробка «расползается» на всё, что ниже.",
      "Студия помогает: поставь курсор на тег — его пара подсветится. Если подсветка коралловая — пары нет. А в консоли появится подсказка со строкой и причиной.",
    ],
    newTerms: ["teg-para"],
    practice: [
      {
        kind: "choice",
        question: "Где ошибка?",
        code: "<h1 Мой питомец</h1>",
        options: ["У <h1 нет закрывающей скобки >", "Нужно </h2>", "Ошибок нет"],
        correct: 0,
        explain: "Открывающий тег должен заканчиваться >: <h1>Мой питомец</h1>.",
      },
      {
        kind: "choice",
        question: "Какой тег закрывающий?",
        options: ["</p>", "<p>", "<p/>"],
        correct: 0,
        explain: "Закрывающий — с косой чертой после <.",
      },
    ],
    steps: [
      "Посмотри в консоль: студия уже нашла ошибки и показывает строки.",
      "Строка 1: у <h1 не хватает >. Допиши её.",
      "Строка 2: вместо второго <p> должен быть закрывающий </p>.",
      "Строка 3: абзац не закрыт — добавь </p> в конце. Поставь курсор на каждый тег и проверь, что его пара светится.",
    ],
    starter: {
      html: "<h1 Мой питомец</h1>\n<p>Его зовут Рыжик.<p>\n<p>Он любит <b>спать на солнце</b>\n",
      css: baseCss,
      js: "",
    },
    focusFile: "html",
    hints: [
      "Ошибок три — по одной в каждой строке. Консоль называет строку и причину.",
      "Закрывающий тег — с косой чертой: </p>.",
      "Правильно: <h1>Мой питомец</h1> · <p>Его зовут Рыжик.</p> · <p>Он любит <b>спать на солнце</b></p>",
    ],
    checks: [
      { kind: "text", selector: "h1", minLength: 5, message: "Заголовок виден на странице", fix: "Допиши > в открывающем теге: <h1>Мой питомец</h1>." },
      { kind: "count", selector: "p", min: 2, max: 2, message: "На странице ровно два абзаца", fix: "Во второй строке вместо <p> в конце нужен закрывающий </p>." },
      { kind: "structureOk", message: "Все теги закрыты правильно — помощник в консоли молчит", fix: "Посмотри подсказки в консоли и нажми на номер строки." },
    ],
    learned: [
      "Тег: < имя > — открывающий, </ имя > — закрывающий.",
      "Без > или без закрывающего тега страница ломается.",
      "Курсор на теге подсвечивает его пару; коралловая подсветка — пары нет.",
    ],
    quiz: [
      {
        question: "Что будет, если не закрыть <b>?",
        options: ["Жирным станет всё, что ниже", "Ничего", "Страница не откроется"],
        correct: 0,
        explain: "Коробка не закрыта — внутри неё оказывается всё до конца страницы.",
      },
      {
        question: "Сколько символов > в правильной паре <p>текст</p> ?",
        options: ["2", "1", "0"],
        correct: 0,
        explain: "По одной > в каждом теге: <p> и </p>.",
      },
    ],
    reference: ref("para-tegov"),
  },
  {
    track: "practice",
    course: C,
    slug: "odin-main",
    number: 2,
    title: "Один main и порядок разделов",
    goal: "Ты наведёшь порядок в каркасе страницы: шапка, один main, подвал — по местам.",
    explanation: [
      "Порядок в HTML — это порядок на странице. Браузер показывает теги сверху вниз ровно так, как они написаны. Если <footer> написать выше <main>, подвал окажется посередине.",
      "<main> на странице один — это коробка для всего главного. Все разделы <section> кладут внутрь него, а не открывают новый <main> для каждого.",
      "Каркас всегда одинаковый: <header> вверху, <main> с разделами в середине, <footer> внизу.",
    ],
    newTerms: ["karkas-poryadok"],
    practice: [
      {
        kind: "order",
        prompt: "Собери каркас страницы в правильном порядке.",
        lines: ["<header>…</header>", "<main>…</main>", "<footer>…</footer>"],
        explain: "Шапка, основная часть, подвал — сверху вниз.",
      },
      {
        kind: "choice",
        question: "Нужно добавить ещё один раздел. Как правильно?",
        options: ["Новый <section> внутри того же <main>", "Новый <main> после первого", "Новый <footer>"],
        correct: 0,
        explain: "<main> один, а разделов внутри него — сколько угодно.",
      },
    ],
    steps: [
      "Посмотри в консоль: студия заметила второй <main>.",
      "Перенеси раздел «Хобби» внутрь первого <main>, а лишние <main> и </main> удали.",
      "Перенеси <footer> в самый конец — после </main>.",
    ],
    starter: {
      html: `<header>
  <h1>Моя страница</h1>
</header>

<footer>
  <p>Сделано в CodeQuest</p>
</footer>

<main>
  <section id="o-sebe">
    <h2>О себе</h2>
    <p>Мне 10 лет, я люблю рисовать.</p>
  </section>
</main>

<main>
  <section id="hobbi">
    <h2>Хобби</h2>
    <p>Рисую котов и драконов.</p>
  </section>
</main>
`,
      css: baseCss + "\nfooter {\n  color: gray;\n}\n",
      js: "",
    },
    focusFile: "html",
    hints: [
      "Нужен один <main>, а внутри — оба раздела <section>.",
      "Порядок сверху вниз: <header>, <main>, <footer>.",
      "Вырежи блок <footer>…</footer> и вставь его в самый конец, после последнего </main>; второй <main> и первый </main> удали.",
    ],
    checks: [
      { kind: "count", selector: "main", min: 1, max: 1, message: "На странице ровно один <main>", fix: "Перенеси раздел «Хобби» в первый <main>, а лишние <main> и </main> удали." },
      { kind: "order", selectors: ["header", "main", "footer"], message: "Порядок: шапка, основная часть, подвал", fix: "Перенеси <footer>…</footer> в самый конец страницы." },
      { kind: "order", selectors: ["#o-sebe", "#hobbi"], message: "Разделы идут по порядку: «О себе», потом «Хобби»", fix: "Раздел «О себе» должен стоять выше раздела «Хобби»." },
      { kind: "structureOk", message: "Помощник в консоли молчит", fix: "Посмотри подсказки в консоли." },
    ],
    learned: [
      "Порядок в HTML = порядок на странице.",
      "<main> один; разделы кладут внутрь него.",
      "Каркас: <header> → <main> → <footer>.",
    ],
    quiz: [
      {
        question: "<footer> написан в коде выше <main>. Где он будет на странице?",
        options: ["Выше основной части", "Всё равно внизу", "Его не будет видно"],
        correct: 0,
        explain: "Браузер показывает теги в том порядке, в каком они написаны.",
      },
      {
        question: "Сколько <main> бывает на странице?",
        options: ["Один", "Сколько угодно", "Два"],
        correct: 0,
        explain: "<main> — одна коробка для всего главного.",
      },
    ],
    reference: ref("odin-main"),
  },
  {
    track: "practice",
    course: C,
    slug: "roditel-deti",
    number: 3,
    title: "Родитель и дети: .cards и .card",
    goal: "Ты разберёшься, чем контейнер отличается от карточек, и почему у одинаковых карточек один класс.",
    explanation: [
      "Контейнер — это родитель: <div class=\"cards\">. Карточки внутри него — дети: <div class=\"card\">. Родитель управляет тем, как стоят дети, например ставит их в ряд (display: flex). Дети управляют своим видом: фоном, отступами, углами.",
      "Одинаковым элементам дают один и тот же класс. card1, card2 и card3 — это три разных имени, и правило .card не сработает ни для одного. А если у всех class=\"card\", одно правило оформит все три карточки сразу.",
      "Запись .cards > .card значит: «карточки, которые лежат прямо внутри контейнера».",
    ],
    newTerms: ["roditel-deti"],
    practice: [
      {
        kind: "choice",
        question: "Какой код правильный для трёх одинаковых карточек?",
        options: ['class="card" у всех трёх', 'class="card1", "card2", "card3"', "id=\"card\" у всех трёх"],
        correct: 0,
        explain: "Один класс — одно правило CSS для всех. А id должен быть уникальным.",
      },
      {
        kind: "choice",
        question: "Кому писать display: flex, чтобы карточки встали в ряд?",
        options: ["Родителю .cards", "Каждой карточке .card", "Тегу <body>"],
        correct: 0,
        explain: "Родитель расставляет детей. Дети отвечают только за свой вид.",
      },
    ],
    steps: [
      "Посмотри в консоль: правило .card не сработало — в HTML нет такого класса.",
      "Дай всем трём карточкам один класс: class=\"card\".",
      "Оберни карточки в родителя: перед первой — <div class=\"cards\">, после последней — </div>.",
    ],
    starter: {
      html: `<h1>Мои любимые игры</h1>
<div class="card1">Шахматы</div>
<div class="card2">Майнкрафт</div>
<div class="card3">Футбол</div>
`,
      css: `${baseCss}
.cards {
  display: flex;
  gap: 12px;
}

.card {
  background-color: #e7f5ff;
  padding: 16px;
  border-radius: 12px;
}
`,
      js: "",
    },
    focusFile: "html",
    hints: [
      "Классы card1, card2, card3 разные — а в CSS правило для одного класса card.",
      "У всех трёх карточек должно быть class=\"card\".",
      "Родитель: <div class=\"cards\"> перед карточками и </div> после них.",
    ],
    checks: [
      { kind: "count", selector: ".cards > .card", min: 3, max: 3, message: "Внутри контейнера .cards ровно три карточки .card", fix: "Дай карточкам class=\"card\" и оберни их в <div class=\"cards\"> … </div>." },
      { kind: "styleIs", selector: ".cards", property: "display", values: ["flex"], message: "Карточки стоят в ряд (родитель с display: flex)", fix: "Контейнеру нужен class=\"cards\" — правило для него уже есть в CSS." },
      { kind: "structureOk", message: "Все правила CSS находят свои элементы", fix: "Посмотри подсказки в консоли: какое правило не нашло класс." },
    ],
    learned: [
      "Родитель (.cards) расставляет детей, дети (.card) отвечают за свой вид.",
      "Одинаковым элементам — один класс.",
      ".cards > .card — дети прямо внутри родителя.",
    ],
    quiz: [
      {
        question: "Правило .card { … } не сработало. Самая частая причина?",
        options: ["В HTML класс написан иначе", "Нужно перезагрузить компьютер", "CSS не работает с div"],
        correct: 0,
        explain: "Имена в HTML и CSS должны совпадать до буквы.",
      },
      {
        question: "Кто кому родитель?",
        code: '<div class="cards">\n  <div class="card">А</div>\n</div>',
        options: [".cards — родитель, .card — ребёнок", ".card — родитель", "Они соседи"],
        correct: 0,
        explain: "То, что внутри, — ребёнок; коробка снаружи — родитель.",
      },
    ],
    reference: ref("roditel-deti"),
  },
  {
    track: "practice",
    course: C,
    slug: "id-ili-class",
    number: 4,
    title: "id или class?",
    goal: "Ты научишься отличать id от class и правильно обращаться к ним в CSS.",
    explanation: [
      "id — уникальное имя, как номер паспорта: на странице только один элемент с таким id. class — общее имя для группы, как форма команды: его носят сколько угодно элементов.",
      "В CSS и в JavaScript их пишут по-разному: id — с решёткой (#note), класс — с точкой (.box). Перепутаешь знак — правило просто не сработает, а браузер даже не пожалуется.",
      "Правило выбора: если элемент один и его нужно найти — id. Если таких элементов много и они выглядят одинаково — class.",
    ],
    newTerms: ["id-vs-class"],
    practice: [
      {
        kind: "fill",
        prompt: "В HTML <p id=\"note\">. Как обратиться к нему в CSS?",
        before: "",
        after: "note { color: red; }",
        answers: ["#"],
        explain: "id — с решёткой: #note.",
      },
      {
        kind: "fill",
        prompt: "В HTML <div class=\"box\">. Как обратиться к ним в CSS?",
        before: "",
        after: "box { padding: 8px; }",
        answers: ["."],
        explain: "Класс — с точкой: .box.",
      },
    ],
    steps: [
      "Посмотри в консоль: студия подсказывает, где перепутаны id и class.",
      "В CSS исправь .note на #note — в HTML это id.",
      "И #box на .box — в HTML это класс, и коробок две.",
    ],
    starter: {
      html: `<p id="note">Важно: завтра нет уроков!</p>
<div class="box">Коробка с карандашами</div>
<div class="box">Коробка с красками</div>
`,
      css: `${baseCss}
.note {
  color: #d6336c;
  font-weight: bold;
}

#box {
  background-color: #fff3bf;
  padding: 8px;
  margin-bottom: 8px;
}
`,
      js: "",
    },
    focusFile: "css",
    hints: [
      "Сравни: в HTML id=\"note\", а в CSS .note — знак не тот.",
      "id — решётка #, класс — точка.",
      "Нужно: #note { … } и .box { … }",
    ],
    checks: [
      { kind: "styleIs", selector: "#note", property: "color", values: ["rgb(214, 51, 108)"], message: "Заметка стала розовой: правило #note сработало", fix: "В CSS замени .note на #note — в HTML это id." },
      { kind: "styleIs", selector: ".box", property: "background-color", values: ["rgb(255, 243, 191)"], message: "Обе коробки с жёлтым фоном: правило .box сработало", fix: "В CSS замени #box на .box — в HTML это класс." },
      { kind: "structureOk", message: "Все правила CSS находят свои элементы", fix: "Посмотри подсказки в консоли." },
    ],
    learned: [
      "id — уникальный (один на странице), class — для группы.",
      "В CSS: #id и .class.",
      "Перепутанный знак — правило молча не работает.",
    ],
    quiz: [
      {
        question: "На странице 10 одинаковых карточек. Что им дать?",
        options: ["Один class", "Один id всем", "Разные id"],
        correct: 0,
        explain: "Общее оформление — общий класс.",
      },
      {
        question: "Как найти в JavaScript элемент с id=\"start\"?",
        options: ['document.querySelector("#start")', 'document.querySelector(".start")', 'document.querySelector("start")'],
        correct: 0,
        explain: "В querySelector те же знаки, что в CSS: # для id.",
      },
    ],
    reference: ref("id-ili-class"),
  },
  {
    track: "practice",
    course: C,
    slug: "menyu-stolbikom",
    number: 5,
    title: "Меню столбиком",
    goal: "Ты поставишь ссылки меню друг под другом — правильным способом.",
    explanation: [
      "Ссылки <a> по умолчанию стоят в строку, как слова в предложении. Чтобы поставить их столбиком, есть два способа.",
      "Способ HTML: тег <br> — перенос строки. Он работает, но смешивает содержание и вид: если потом захочешь меню в строку — придётся удалять <br> по всему коду.",
      "Способ CSS: nav a { display: block; } — каждая ссылка становится блоком и занимает свою строку. Вид меняется в одном месте, а нажимать можно на всю ширину строки. Как выглядит страница — работа CSS, поэтому выбираем этот способ.",
    ],
    newTerms: ["br-vs-block"],
    practice: [
      {
        kind: "choice",
        question: "Какой способ лучше для меню столбиком?",
        options: ["nav a { display: block; } в CSS", "<br> после каждой ссылки", "Писать каждую ссылку в отдельном <main>"],
        correct: 0,
        explain: "Внешний вид — работа CSS: меняется в одном месте.",
      },
      {
        kind: "fill",
        prompt: "Сделай ссылки блоками.",
        before: "nav a { display: ",
        after: "; }",
        answers: ["block"],
        explain: "display: block — элемент занимает свою строку.",
      },
    ],
    steps: [
      "Посмотри на меню в окне результата: ссылки стоят в строку.",
      "В CSS в правило nav a допиши display: block;",
      "Если хочешь, добавь отступ между пунктами: margin-bottom: 8px;",
    ],
    starter: {
      html: `<header>
  <h1>Мой сайт</h1>
  <nav>
    <a href="#o-sebe">О себе</a>
    <a href="#hobbi">Хобби</a>
    <a href="#foto">Фото</a>
  </nav>
</header>

<main>
  <section id="o-sebe"><h2>О себе</h2></section>
  <section id="hobbi"><h2>Хобби</h2></section>
  <section id="foto"><h2>Фото</h2></section>
</main>
`,
      css: `${baseCss}
nav a {
  margin-right: 12px;
}
`,
      js: "",
    },
    focusFile: "css",
    hints: [
      "Правило nav a уже есть — допиши в него одну строку.",
      "nav a { display: block; }",
    ],
    checks: [
      { kind: "stacked", selector: "nav a", direction: "vertical", message: "Ссылки меню стоят друг под другом", fix: "В правило nav a допиши display: block;" },
      {
        kind: "source",
        file: "css",
        pattern: "display\\s*:\\s*block|flex-direction\\s*:\\s*column",
        message: "Столбик сделан средствами CSS",
        fix: "Сделай это в CSS: nav a { display: block; } — а не тегами <br>.",
      },
      { kind: "structureOk", message: "Помощник в консоли молчит", fix: "Посмотри подсказки в консоли." },
    ],
    learned: [
      "<br> — перенос строки в HTML, display: block — способ CSS.",
      "Как выглядит страница — работа CSS.",
      "display: block ставит элемент на свою строку.",
    ],
    quiz: [
      {
        question: "Меню нужно снова сделать в строку. Где проще: с <br> или с display: block?",
        options: ["С display: block — поменять одну строку CSS", "С <br> — удалить все теги", "Одинаково"],
        correct: 0,
        explain: "Вид в CSS меняется в одном месте.",
      },
      {
        question: "Что делает display: block у ссылки?",
        options: ["Ставит её на отдельную строку во всю ширину", "Делает её жирной", "Прячет её"],
        correct: 0,
        explain: "Блок занимает всю строку — следующий элемент встаёт ниже.",
      },
    ],
    reference: ref("menyu-stolbikom"),
  },
  {
    track: "practice",
    course: C,
    slug: "chitaem-zadanie",
    number: 6,
    title: "Читаем задание как программист",
    goal: "Ты научишься выполнять техническое задание точно — по словам, а не «на глаз».",
    explanation: [
      "Программист работает по заданию, и в нём важно каждое слово: какой тег, какой класс, сколько штук. Страница может выглядеть похоже, но если устройство другое — задание не выполнено. Студия, как и настоящие программы, проверяет устройство кода.",
      "Задание: «В разделе „Мои игрушки“ должен быть контейнер div с классом toys, а в нём ровно три элемента div с классом toy. В каждом — заголовок h3 с названием игрушки».",
      "Читай задание медленно и отмечай: тег — div, класс контейнера — toys, класс игрушек — toy, количество — три, заголовок — h3. Потом сверь с кодом каждую мелочь.",
    ],
    newTerms: [],
    practice: [
      {
        kind: "choice",
        question: "В задании: «три элемента с классом toy». Какой код подходит?",
        options: ['Три <div class="toy">', '<div class="toy-1">, <div class="toy-2">, <div class="toy-3">', 'Два <div class="toy">'],
        correct: 0,
        explain: "Именно класс toy и именно три — как в задании.",
      },
      {
        kind: "choice",
        question: "Страница выглядит правильно, но проверка не проходит. Что делать?",
        options: ["Сверить код с заданием по словам: теги, классы, количество", "Нажать «Проверить» ещё раз", "Перекрасить страницу"],
        correct: 0,
        explain: "Проверка смотрит на устройство кода. Ищи, где код отличается от задания.",
      },
    ],
    steps: [
      "Прочитай задание в объяснении и выпиши требования: тег, классы, количество, заголовок.",
      "Сверь с кодом: у контейнера класс toys? У каждой игрушки ровно toy? Заголовки — h3?",
      "Исправь всё, что не совпадает. Внешний вид при этом может почти не измениться — и это нормально.",
    ],
    starter: {
      html: `<section>
  <h2>Мои игрушки</h2>
  <div class="toys-list">
    <div class="toy-1"><h2>Конструктор</h2></div>
    <div class="toy"><h4>Робот</h4></div>
    <div class="toy"><h3>Мяч</h3></div>
  </div>
</section>
`,
      css: `${baseCss}
.toys {
  display: flex;
  gap: 12px;
}

.toy {
  background-color: #e3fafc;
  padding: 12px;
  border-radius: 10px;
}
`,
      js: "",
    },
    focusFile: "html",
    hints: [
      "Ошибок четыре: класс контейнера, класс первой игрушки и два заголовка.",
      "Нужно: <div class=\"toys\">, у всех игрушек class=\"toy\", все заголовки — <h3>.",
    ],
    checks: [
      { kind: "count", selector: ".toys > .toy", min: 3, max: 3, message: "В контейнере toys ровно три элемента toy", fix: "Контейнеру — class=\"toys\", каждой игрушке — class=\"toy\" (без цифр и добавок)." },
      { kind: "count", selector: ".toy > h3", min: 3, max: 3, message: "В каждой игрушке заголовок h3", fix: "Замени <h2> и <h4> внутри игрушек на <h3>." },
      { kind: "structureOk", message: "Все правила CSS находят свои элементы", fix: "Посмотри подсказки в консоли." },
    ],
    learned: [
      "В задании важно каждое слово: тег, класс, количество.",
      "Проверка смотрит на устройство кода, а не на картинку.",
      "Сначала выпиши требования, потом сверь их с кодом.",
    ],
    quiz: [
      {
        question: "Почему «выглядит правильно» — ещё не «сделано правильно»?",
        options: ["Разный код может выглядеть одинаково, а работать по-разному", "Это одно и то же", "Потому что студия ошибается"],
        correct: 0,
        explain: "Устройство кода важно для оформления, для JavaScript и для других программистов.",
      },
      {
        question: "С чего начать работу по заданию?",
        options: ["Выписать требования по пунктам", "Сразу писать код", "Нарисовать картинку"],
        correct: 0,
        explain: "Список требований — это и план, и проверка себя.",
      },
    ],
    reference: ref("chitaem-zadanie"),
  },
  {
    track: "practice",
    course: C,
    slug: "najdi-vse-oshibki",
    number: 7,
    title: "Найди все ошибки",
    goal: "Ты найдёшь и исправишь пять ошибок разных видов — всё, что изучил в модуле.",
    explanation: [
      "На этой странице пять ошибок: пропущенная скобка, второй <main>, неверный класс, незакрытый тег и перепутанные id и class. Часть видна в консоли, часть — только по тому, как выглядит страница.",
      "Работай как детектив: сначала консоль — каждая подсказка называет строку. Потом сравни, что должно быть на странице и что видно на самом деле.",
    ],
    newTerms: [],
    practice: [
      {
        kind: "choice",
        question: "С чего начать поиск ошибок?",
        options: ["С подсказок в консоли — у них есть номера строк", "С перекрашивания страницы", "С удаления кода"],
        correct: 0,
        explain: "Консоль экономит время: строка и причина уже названы.",
      },
      {
        kind: "choice",
        question: "Правило .title не красит <h1 id=\"title\">. Почему?",
        options: ["title — это id, нужно #title", "h1 нельзя красить", "Нужно две точки"],
        correct: 0,
        explain: "id — решётка, класс — точка.",
      },
    ],
    steps: [
      "Открой консоль и исправь ошибки, которые она называет, — по одной.",
      "Проверь карточки: у всех ли одинаковый класс? Все ли закрыты?",
      "Проверь цвет заголовка: работает ли правило для него в CSS?",
    ],
    starter: {
      html: `<header>
  <h1 id="title">Клуб юных художников</h1>
</header>

<main>
  <section id="o-klube">
    <h2 Наш клуб</h2>
    <p>Мы рисуем по субботам.</p>
  </section>
</main>

<main>
  <section id="raboty">
    <h2>Работы</h2>
    <div class="cards">
      <div class="card">Закат</div>
      <div class="kard">Кот</div>
      <div class="card">Море
    </div>
  </section>
</main>
`,
      css: `${baseCss}
.title {
  color: #8f7cf5;
}

.cards {
  display: flex;
  gap: 12px;
}

.card {
  background-color: #fff3bf;
  padding: 12px;
  border-radius: 10px;
}
`,
      js: "",
    },
    focusFile: "html",
    hints: [
      "Пять ошибок: > у <h2, лишние </main> и <main>, класс kard, незакрытая карточка «Море», .title в CSS.",
    ],
    checks: [
      { kind: "count", selector: "main", min: 1, max: 1, message: "Один <main>", fix: "Удали лишние </main> и <main> между разделами." },
      { kind: "count", selector: ".cards > .card", min: 3, max: 3, message: "Три карточки с классом card", fix: "Исправь класс kard и закрой карточку «Море» тегом </div>." },
      { kind: "styleIs", selector: "#title", property: "color", values: ["rgb(143, 124, 245)"], message: "Заголовок сиреневый", fix: "В CSS замени .title на #title." },
      { kind: "structureOk", message: "Помощник в консоли молчит", fix: "Посмотри подсказки в консоли." },
    ],
    learned: [
      "Ошибки ищут по порядку: сначала подсказки консоли, потом вид страницы.",
      "Ты умеешь находить и исправлять ошибки сам — это главный навык программиста.",
    ],
    quiz: [
      {
        question: "Карточка «Море» не закрыта. Что произойдёт?",
        options: ["Всё ниже окажется внутри неё", "Ничего", "Карточка исчезнет"],
        correct: 0,
        explain: "Незакрытая коробка «съедает» то, что после неё.",
      },
      {
        question: "Какой навык ты тренировал в этом модуле?",
        options: ["Находить и исправлять ошибки самостоятельно", "Копировать готовый код", "Печатать быстро"],
        correct: 0,
        explain: "Это и есть понимание программирования — а не повторение примеров.",
      },
    ],
    reference: ref("najdi-vse-oshibki"),
  },
  {
    track: "practice",
    course: C,
    slug: "po-sheme",
    number: 8,
    title: "Финал: собери страницу по схеме",
    goal: "Ты соберёшь страницу с нуля по схеме её устройства — как настоящий верстальщик.",
    explanation: [
      "Верстальщики часто получают не картинку, а схему: что внутри чего лежит. Схема этой страницы — в комментарии во вкладке HTML. Отступ в схеме значит «внутри».",
      "Собирай сверху вниз и закрывай каждую коробку сразу, как открыл. После каждого шага смотри в консоль: помощник подскажет, если что-то не так.",
    ],
    newTerms: [],
    steps: [
      "Прочитай схему в комментарии.",
      "Собери каркас: header, main, footer.",
      "Наполни: заголовок и меню в шапке, два раздела с id в main, карточки в контейнере, подпись в подвале.",
    ],
    starter: {
      html: `<!-- Схема страницы (отступ = «внутри»):
header
  h1 — название коллекции
  nav — две ссылки: на #rasskaz и на #kollekciya
main
  section id="rasskaz"
    h2, p — о чём коллекция
  section id="kollekciya"
    h2
    div class="cards"
      три div class="card" — по одному экспонату
footer
  p — подпись -->

`,
      css: `${baseCss}
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.card {
  background-color: #e7f5ff;
  padding: 12px;
  border-radius: 10px;
}
`,
      js: "",
    },
    focusFile: "html",
    hints: ["Сверяйся со схемой построчно: каждая строка схемы — один тег, отступ — значит внутри предыдущего."],
    checks: [
      { kind: "order", selectors: ["header", "main", "footer"], message: "Каркас: header, main, footer по порядку", fix: "Сначала <header>, потом <main>, в конце <footer>." },
      { kind: "count", selector: "main", min: 1, max: 1, message: "Один <main>", fix: "Оба раздела кладут в один <main>." },
      { kind: "anchorsResolve", selector: "header nav", min: 2, message: "В меню две ссылки, и они ведут на разделы", fix: "В <nav> — <a href=\"#rasskaz\"> и <a href=\"#kollekciya\">; у разделов такие же id." },
      { kind: "count", selector: "main section[id]", min: 2, message: "В main два раздела с id", fix: "<section id=\"rasskaz\"> и <section id=\"kollekciya\"> внутри <main>." },
      { kind: "count", selector: "#kollekciya .cards > .card", min: 3, max: 3, message: "В коллекции контейнер с тремя карточками", fix: "Внутри раздела коллекции: <div class=\"cards\"> и в нём три <div class=\"card\">." },
      { kind: "exists", selector: "footer p", message: "В подвале есть подпись", fix: "<footer> <p>…</p> </footer>" },
      { kind: "structureOk", message: "Помощник в консоли молчит", fix: "Посмотри подсказки в консоли." },
    ],
    learned: [
      "Страницу можно собрать по схеме устройства.",
      "Отступы в коде повторяют схему: что внутри чего.",
      "Ты понимаешь структуру кода — и умеешь её проверять сам.",
    ],
    quiz: [
      {
        question: "Что значит отступ в схеме страницы?",
        options: ["Этот элемент лежит внутри предыдущего", "Этот элемент меньше", "Пустую строку"],
        correct: 0,
        explain: "Отступ показывает вложенность — как и в коде.",
      },
      {
        question: "Когда лучше закрывать тег?",
        options: ["Сразу, как открыл, а потом писать внутрь", "В самом конце работы", "Не обязательно"],
        correct: 0,
        explain: "Так не забудешь — и коробки не перепутаются.",
      },
    ],
    reference: ref("po-sheme"),
  },
];
