import type { Lesson, ProjectFiles } from "./types";
import referencesJson from "./references.json";

/**
 * Курс 3 «Интерактив и мини-игры». Пять игр на настоящем JavaScript:
 * кликер (1–3), «Угадай число» (4–6), викторина (7–8), «Камень, ножницы, бумага» (9), «Бегун» (10),
 * тренировка «Почини игру» (11) и финал — своя игра с нуля (12).
 * Каждая игра начинается с чистого листа (freshStart) и растёт урок за уроком.
 * Проверки — сценарии: студия сама нажимает кнопки, вводит числа, жмёт клавиши и ждёт таймер.
 */
const references = referencesJson as Record<string, ProjectFiles>;
const ref = (slug: string): ProjectFiles => {
  const r = references[slug];
  if (!r) throw new Error(`Нет эталонного решения для урока ${slug}`);
  return r;
};
const C = "igry";

const gameCss = `body {
  font-family: Verdana, sans-serif;
  text-align: center;
  padding: 24px;
}

button {
  font-size: 18px;
  padding: 10px 18px;
  margin: 4px;
  border: none;
  border-radius: 12px;
  background-color: #ffb84d;
}
`;

export const course3: Lesson[] = [
  {
    track: "project",
    course: C,
    slug: "kliker",
    number: 1,
    title: "Кликер: условие if",
    goal: "Ты сделаешь первую игру: жми кнопку, набирай очки — и на 10 очках появится «Победа!».",
    freshStart: true,
    explanation: [
      "В играх программа постоянно принимает решения: набрал 10 очков — победа, кончилось время — игра окончена. Для этого есть условие if — «если».",
      "if (score >= 10) { … } значит: «если очков больше или равно 10 — выполни то, что в фигурных скобках». Сравнивать можно так: > больше, < меньше, >= больше или равно, <= меньше или равно, === равно.",
      "В JavaScript равенство проверяют тремя знаками ===. Один знак = кладёт значение в переменную — перепутать их очень легко.",
    ],
    newTerms: ["js-if"],
    practice: [
      {
        kind: "choice",
        question: "Когда появится «Победа!»?",
        code: 'if (score >= 10) {\n  message.textContent = "Победа!";\n}',
        options: ["Когда очков 10 или больше", "Когда очков ровно 9", "Сразу"],
        correct: 0,
        explain: ">= значит «больше или равно». На 10, 11, 12 очках условие верно.",
      },
      {
        kind: "fill",
        prompt: "Проверь, что очков ровно 5.",
        before: "if (score ",
        after: " 5) {",
        answers: ["==="],
        explain: "Равенство — три знака ===. Один знак = — это «положить значение».",
      },
    ],
    steps: [
      "Нажми «Жми!» в окне результата — очки растут. Но победы пока нет.",
      "Во вкладке JavaScript найди комментарий «Урок 1» внутри обработчика нажатия.",
      "Напиши на его месте условие: if (score >= 10) { message.textContent = \"Победа!\"; }",
      "Понажимай кнопку десять раз и проверь.",
    ],
    starter: {
      html: `<!-- Курс 3: игры! Первая — кликер. -->
<h1>Кликер</h1>
<p>Очки: <span id="score">0</span></p>
<button id="click-button">Жми!</button>
<p id="message"></p>
`,
      css: gameCss,
      js: `let score = 0;
const scoreText = document.querySelector("#score");
const message = document.querySelector("#message");
const clickButton = document.querySelector("#click-button");

clickButton.addEventListener("click", function () {
  score = score + 1;
  scoreText.textContent = score;
  // Урок 1: если score дошёл до 10 — напиши в message «Победа!»
});
`,
    },
    focusFile: "js",
    hints: [
      "Условие пишется внутри обработчика нажатия, после строки scoreText.textContent = score;",
      "Форма условия: if (условие) { что сделать }",
      "Целиком: if (score >= 10) { message.textContent = \"Победа!\"; }",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { click: "#click-button", times: 9 },
          { expect: { selector: "#message", equals: "" } },
          { click: "#click-button" },
          { expect: { selector: "#message", contains: "Победа" } },
        ],
        message: "На 9 нажатиях победы нет, а на 10-м появляется «Победа!»",
        fix: "Внутри обработчика напиши if (score >= 10) { message.textContent = \"Победа!\"; } — после строки, которая показывает очки.",
      },
      {
        kind: "source",
        file: "js",
        pattern: "if\\s*\\(",
        message: "В коде есть условие if",
        fix: "Добавь условие: if (score >= 10) { … }",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь скобки: у if круглые (условие) и фигурные { действия }." },
    ],
    learned: [
      "if проверяет условие и выполняет код, только если оно верно.",
      "Сравнения: > < >= <= и === (равно).",
      "Один знак = кладёт значение, три === сравнивают.",
    ],
    quiz: [
      {
        question: "Что значит score >= 10 ?",
        options: ["Очков больше или равно 10", "Очков ровно 10", "Положить 10 в score"],
        correct: 0,
        explain: ">= — «больше или равно».",
      },
      {
        question: "Где ошибка?",
        code: 'if (score = 10) {\n  message.textContent = "Победа!";\n}',
        options: ["Один знак = вместо ===", "Нет точки с запятой после if", "Ошибок нет"],
        correct: 0,
        explain: "score = 10 кладёт 10 в score, а не сравнивает. Нужно ===.",
      },
    ],
    reference: ref("kliker"),
  },
  {
    track: "project",
    course: C,
    slug: "kliker-uluchsheniya",
    number: 2,
    title: "Кликер: улучшения",
    goal: "В кликере появится улучшение: за 10 очков каждое нажатие станет приносить вдвое больше.",
    explanation: [
      "Во многих кликерах очки можно «потратить» на улучшение. Для этого нужна ещё одна переменная — perClick: сколько очков даёт одно нажатие.",
      "Главная кнопка теперь прибавляет не 1, а perClick: score = score + perClick. А кнопка улучшения проверяет, хватает ли очков, отнимает 10 и удваивает perClick: perClick = perClick * 2.",
      "Так работают почти все игры: есть состояние (очки, сила нажатия), а кнопки его меняют по правилам.",
    ],
    newTerms: [],
    practice: [
      {
        kind: "choice",
        question: "perClick = 2. Сколько очков будет после трёх нажатий, если было 0?",
        code: "score = score + perClick;",
        options: ["3", "6", "2"],
        correct: 1,
        explain: "Каждое нажатие прибавляет 2: 2, 4, 6.",
      },
      {
        kind: "order",
        prompt: "Собери улучшение: если хватает очков — заплатить и удвоить силу.",
        lines: ["if (score >= 10) {", "  score = score - 10;", "  perClick = perClick * 2;", "}"],
        explain: "Сначала проверка, потом «оплата» и улучшение — внутри фигурных скобок.",
      },
    ],
    steps: [
      "В HTML появилась кнопка улучшения, а в конце JavaScript — заготовка «Урок 2».",
      "В обработчике главной кнопки замени score + 1 на score + perClick.",
      "Напиши обработчик для upgradeButton: если score >= 10 — отними 10, удвой perClick и покажи новые очки.",
    ],
    additions: {
      html: { before: '<p id="message">', text: '<button id="upgrade-button">Улучшение: ×2 за 10 очков</button>\n' },
      js: `
// Урок 2: улучшение
let perClick = 1;
const upgradeButton = document.querySelector("#upgrade-button");
// Напиши: при нажатии на улучшение — если очков хватает (score >= 10),
// отними 10, удвой perClick и покажи новые очки
`,
    },
    focusFile: "js",
    hints: [
      "Главная кнопка: score = score + perClick; — вместо + 1.",
      "Улучшение: upgradeButton.addEventListener(\"click\", function () { if (score >= 10) { … } });",
      "Внутри if: score = score - 10; perClick = perClick * 2; scoreText.textContent = score;",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { click: "#click-button", times: 10 },
          { expect: { selector: "#score", equals: "10" } },
          { click: "#upgrade-button" },
          { expect: { selector: "#score", equals: "0" } },
          { click: "#click-button" },
          { expect: { selector: "#score", equals: "2" } },
          { click: "#upgrade-button" },
          { expect: { selector: "#score", equals: "2" } },
        ],
        message: "Улучшение стоит 10 очков, после него нажатие даёт 2, без очков улучшить нельзя",
        fix: "Главная кнопка: score = score + perClick. Улучшение: if (score >= 10) { score = score - 10; perClick = perClick * 2; scoreText.textContent = score; }",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Посмотри в консоль: чаще всего пропущена скобка в конце обработчика — });" },
    ],
    learned: [
      "Состояние игры хранится в переменных: score, perClick.",
      "Кнопки меняют состояние по правилам — с помощью if.",
      "* — умножение, - — вычитание.",
    ],
    quiz: [
      {
        question: "Зачем нужна проверка if (score >= 10) в улучшении?",
        options: ["Чтобы нельзя было купить улучшение без очков", "Чтобы игра работала быстрее", "Она не нужна"],
        correct: 0,
        explain: "Без проверки очки ушли бы в минус.",
      },
      {
        question: "perClick = 4. Что будет после perClick = perClick * 2 ?",
        options: ["6", "8", "42"],
        correct: 1,
        explain: "4 × 2 = 8: сила нажатия удвоилась.",
      },
    ],
    reference: ref("kliker-uluchsheniya"),
  },
  {
    track: "project",
    course: C,
    slug: "kliker-tajmer",
    number: 3,
    title: "Кликер на время: таймер",
    goal: "Кликер станет игрой на скорость: у тебя 5 секунд, а потом кнопка выключится.",
    explanation: [
      "Чтобы что-то происходило само каждую секунду, есть таймер: setInterval(функция, 1000). Число 1000 — это миллисекунды: 1000 мс = 1 секунда.",
      "setInterval возвращает номер таймера — его запоминают в переменную: const timer = setInterval(…). Когда время вышло, таймер останавливают: clearInterval(timer). Иначе он будет тикать вечно.",
      "Кнопку можно выключить: clickButton.disabled = true — на неё больше нельзя нажать.",
    ],
    newTerms: ["js-timer"],
    practice: [
      {
        kind: "choice",
        question: "Сколько раз в секунду сработает setInterval(f, 500) ?",
        options: ["1 раз", "2 раза", "500 раз"],
        correct: 1,
        explain: "500 мс — полсекунды, значит, два раза в секунду.",
      },
      {
        kind: "fill",
        prompt: "Останови таймер timer.",
        before: "",
        after: "(timer);",
        answers: ["clearInterval"],
        explain: "clearInterval останавливает таймер, запущенный через setInterval.",
      },
    ],
    steps: [
      "В HTML появились время и кнопка «Старт», в JavaScript — заготовка «Урок 3».",
      "Напиши обработчик для startButton, а в нём — таймер: const timer = setInterval(function () { … }, 1000);",
      "Внутри таймера: уменьши timeLeft на 1 и покажи его в timeText.",
      "Когда timeLeft станет 0: clearInterval(timer), выключи кнопку и напиши итог в message.",
    ],
    additions: {
      html: { before: '<p id="message">', text: '<p>Время: <span id="time">5</span></p>\n<button id="start-button">Старт</button>\n' },
      js: `
// Урок 3: игра на время
let timeLeft = 5;
const timeText = document.querySelector("#time");
const startButton = document.querySelector("#start-button");
// Напиши: по нажатию «Старт» запусти таймер, который каждую секунду уменьшает timeLeft,
// а когда время кончится — остановит таймер и выключит кнопку кликера
`,
    },
    focusFile: "js",
    hints: [
      "Таймер запускается внутри обработчика кнопки «Старт».",
      "Каркас: startButton.addEventListener(\"click\", function () { const timer = setInterval(function () { … }, 1000); });",
      "Внутри таймера: timeLeft = timeLeft - 1; timeText.textContent = timeLeft; и if (timeLeft <= 0) { clearInterval(timer); clickButton.disabled = true; }",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { expect: { selector: "#time", equals: "5" } },
          { click: "#start-button" },
          { wait: 1250 },
          { expect: { selector: "#time", equals: "4" } },
        ],
        message: "После «Старт» время уменьшается каждую секунду",
        fix: "В обработчике «Старт» запусти setInterval с 1000 мс, а внутри уменьшай timeLeft и показывай его в timeText.",
      },
      {
        kind: "source",
        file: "js",
        pattern: "clearInterval\\s*\\(",
        message: "Таймер останавливается (clearInterval)",
        fix: "Когда timeLeft <= 0, вызови clearInterval(timer) — иначе таймер будет тикать вечно.",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь скобки: у setInterval в конце должно быть }, 1000);" },
    ],
    learned: [
      "setInterval запускает функцию снова и снова через заданное время.",
      "clearInterval останавливает таймер.",
      "disabled = true выключает кнопку.",
    ],
    quiz: [
      {
        question: "Что будет, если забыть clearInterval?",
        options: ["Таймер продолжит тикать, время уйдёт в минус", "Игра станет быстрее", "Ничего"],
        correct: 0,
        explain: "Таймер не останавливается сам — его нужно остановить.",
      },
      {
        question: "Сколько миллисекунд в 3 секундах?",
        options: ["30", "300", "3000"],
        correct: 2,
        explain: "1 секунда = 1000 мс, значит, 3 секунды = 3000 мс.",
      },
    ],
    reference: ref("kliker-tajmer"),
  },
  {
    track: "project",
    course: C,
    slug: "ugadaj-vvod",
    number: 4,
    title: "Угадай число: поле ввода",
    goal: "Ты начнёшь новую игру и научишься читать то, что игрок ввёл в поле.",
    freshStart: true,
    explanation: [
      "Новая игра — «Угадай число». Игрок вводит число в поле, а программа отвечает. Поле ввода создаёт тег <input>.",
      "То, что введено в поле, хранится в свойстве value: guessInput.value. Но это всегда текст, даже если ввели цифры. Чтобы сравнивать числа, текст превращают в число: Number(guessInput.value).",
    ],
    newTerms: ["js-input-value"],
    practice: [
      {
        kind: "choice",
        question: "В поле ввели 5. Что даст guessInput.value + 1 ?",
        options: ["6", "51", "Ошибку"],
        correct: 1,
        explain: "value — это текст «5», а текст + 1 склеивается: «51». Нужен Number().",
      },
      {
        kind: "fill",
        prompt: "Преврати введённое в число.",
        before: "const guess = ",
        after: "(guessInput.value);",
        answers: ["Number"],
        explain: "Number() превращает текст в число.",
      },
    ],
    steps: [
      "Посмотри HTML: поле <input id=\"guess\"> и кнопка «Проверить».",
      "В обработчике кнопки возьми число из поля: const guess = Number(guessInput.value);",
      "Покажи его в hint: hint.textContent = \"Ты ввёл: \" + guess;",
      "Введи число в окне результата и нажми «Проверить».",
    ],
    starter: {
      html: `<h1>Угадай число</h1>
<p>Я загадал число от 1 до 10.</p>
<input id="guess" type="number" placeholder="Твоё число">
<button id="check-button">Проверить</button>
<p id="hint"></p>
`,
      css: `${gameCss}
input {
  font-size: 18px;
  padding: 10px;
  width: 140px;
  border-radius: 12px;
  border: 2px solid #8f7cf5;
}
`,
      js: `const guessInput = document.querySelector("#guess");
const checkButton = document.querySelector("#check-button");
const hint = document.querySelector("#hint");

checkButton.addEventListener("click", function () {
  // Урок 4: возьми число из поля ввода и покажи его в hint
});
`,
    },
    focusFile: "js",
    hints: [
      "Введённое лежит в guessInput.value.",
      "Число: const guess = Number(guessInput.value);",
      "Показать: hint.textContent = \"Ты ввёл: \" + guess;",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { type: { selector: "#guess", value: "7" } },
          { click: "#check-button" },
          { expect: { selector: "#hint", contains: "7" } },
          { type: { selector: "#guess", value: "3" } },
          { click: "#check-button" },
          { expect: { selector: "#hint", contains: "3" } },
        ],
        message: "После «Проверить» программа показывает введённое число",
        fix: "В обработчике: const guess = Number(guessInput.value); hint.textContent = \"Ты ввёл: \" + guess;",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь, что id в querySelector совпадают с id в HTML." },
    ],
    learned: [
      "<input> — поле, куда игрок вводит данные.",
      "value — то, что введено, всегда текст.",
      "Number() превращает текст в число.",
    ],
    quiz: [
      {
        question: "Почему нужен Number(guessInput.value) ?",
        options: ["value — текст, а сравнивать нужно числа", "Без него поле не работает", "Чтобы стереть поле"],
        correct: 0,
        explain: "Из поля всегда приходит текст.",
      },
      {
        question: "Какой тег создаёт поле ввода?",
        options: ["<input>", "<button>", "<p>"],
        correct: 0,
        explain: "<input> — поле ввода. У него нет закрывающего тега.",
      },
    ],
    reference: ref("ugadaj-vvod"),
  },
  {
    track: "project",
    course: C,
    slug: "ugadaj-podskazki",
    number: 5,
    title: "Угадай число: больше или меньше",
    goal: "Игра начнёт подсказывать: «Больше!», «Меньше!» — пока не угадаешь.",
    explanation: [
      "Загаданное число храним в переменной secret. Теперь у программы три варианта ответа, а не два. Для этого после if добавляют else if — «иначе если», а в конце else — «во всех остальных случаях».",
      "Python и JavaScript похожи: если ты проходил Python, это тот же if / elif / else, только со скобками.",
    ],
    newTerms: ["js-else-if"],
    practice: [
      {
        kind: "choice",
        question: "secret = 7, игрок ввёл 9. Что ответит программа?",
        code: 'if (guess < secret) {\n  hint.textContent = "Больше!";\n} else if (guess > secret) {\n  hint.textContent = "Меньше!";\n} else {\n  hint.textContent = "Угадал!";\n}',
        options: ["Больше!", "Меньше!", "Угадал!"],
        correct: 1,
        explain: "9 больше 7 — сработает вторая ветка: загаданное число меньше.",
      },
      {
        kind: "order",
        prompt: "Собери три ветки.",
        lines: ["if (guess < secret) {", "} else if (guess > secret) {", "} else {", "}"],
        explain: "if → else if → else, каждая ветка в фигурных скобках.",
      },
    ],
    steps: [
      "В конце JavaScript появилась переменная secret = 7.",
      "В обработчике после const guess = … замени вывод «Ты ввёл» на три ветки: if (guess < secret) — «Больше!», else if (guess > secret) — «Меньше!», else — «Угадал!».",
      "Проверь: введи 3, потом 9, потом 7.",
    ],
    additions: {
      js: `
// Урок 5: загаданное число
const secret = 7;
// В обработчике выше: если guess < secret — «Больше!», если больше — «Меньше!», иначе — «Угадал!»
`,
    },
    focusFile: "js",
    hints: [
      "Три ветки: if (…) { … } else if (…) { … } else { … }",
      "if (guess < secret) { hint.textContent = \"Больше!\"; } else if (guess > secret) { hint.textContent = \"Меньше!\"; } else { hint.textContent = \"Угадал!\"; }",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { type: { selector: "#guess", value: "3" } },
          { click: "#check-button" },
          { expect: { selector: "#hint", contains: "Больше" } },
          { type: { selector: "#guess", value: "9" } },
          { click: "#check-button" },
          { expect: { selector: "#hint", contains: "Меньше" } },
          { type: { selector: "#guess", value: "7" } },
          { click: "#check-button" },
          { expect: { selector: "#hint", contains: "Угадал" } },
        ],
        message: "Подсказки верные: 3 → «Больше!», 9 → «Меньше!», 7 → «Угадал!»",
        fix: "Сравнивай guess с secret: if (guess < secret) — «Больше!», else if (guess > secret) — «Меньше!», else — «Угадал!».",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь фигурные скобки между ветками: } else if (…) {" },
    ],
    learned: [
      "else if добавляет ещё одну проверку.",
      "else срабатывает, когда все условия выше неверны.",
      "Игра = состояние (secret) + правила (if).",
    ],
    quiz: [
      {
        question: "Сколько веток выполнится за одно нажатие?",
        options: ["Одна", "Все три", "Две"],
        correct: 0,
        explain: "Выполняется первая ветка с верным условием, остальные пропускаются.",
      },
      {
        question: "Когда сработает else?",
        options: ["Когда все условия выше неверны", "Всегда", "Никогда"],
        correct: 0,
        explain: "else — «во всех остальных случаях».",
      },
    ],
    reference: ref("ugadaj-podskazki"),
  },
  {
    track: "project",
    course: C,
    slug: "ugadaj-popytki",
    number: 6,
    title: "Угадай число: попытки и новая игра",
    goal: "Игра будет считать попытки, а кнопка «Новая игра» загадает новое случайное число.",
    explanation: [
      "Чтобы игра каждый раз была новой, загаданное число выбирают случайно: Math.floor(Math.random() * 10) + 1 — число от 1 до 10. Math.random даёт дробь от 0 до 1, умножаем на 10 и отбрасываем дробную часть.",
      "Раз secret будет меняться, его объявляют через let, а не const. А для новой игры всё состояние возвращают к началу: попытки — в 0, подсказку — пустую.",
    ],
    newTerms: [],
    practice: [
      {
        kind: "choice",
        question: "Почему secret теперь нужно объявить через let?",
        options: ["Его значение будет меняться в новой игре", "let работает быстрее", "const нельзя для чисел"],
        correct: 0,
        explain: "const нельзя переприсвоить, а в новой игре мы кладём в secret новое число.",
      },
      {
        kind: "fill",
        prompt: "Случайное число от 1 до 10.",
        before: "secret = Math.floor(Math.random() * 10) + ",
        after: ";",
        answers: ["1"],
        explain: "Без + 1 получились бы числа от 0 до 9.",
      },
    ],
    steps: [
      "Замени const secret на let secret.",
      "В обработчике проверки увеличивай tries на 1 и показывай его в triesText.",
      "Напиши обработчик «Новая игра»: новое случайное secret, tries = 0, пустая подсказка.",
    ],
    additions: {
      html: { before: '<p id="hint">', text: '<p>Попыток: <span id="tries">0</span></p>\n<button id="new-game">Новая игра</button>\n' },
      js: `
// Урок 6: попытки и новая игра
let tries = 0;
const triesText = document.querySelector("#tries");
const newGameButton = document.querySelector("#new-game");
// 1) В обработчике проверки: tries + 1 и покажи в triesText.
// 2) «Новая игра»: новое случайное secret, tries = 0, пустая подсказка.
`,
    },
    focusFile: "js",
    hints: [
      "Попытки: tries = tries + 1; triesText.textContent = tries; — внутри обработчика проверки.",
      "Новая игра: secret = Math.floor(Math.random() * 10) + 1; tries = 0; triesText.textContent = tries; hint.textContent = \"\";",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { type: { selector: "#guess", value: "5" } },
          { click: "#check-button" },
          { expect: { selector: "#tries", equals: "1" } },
          { click: "#check-button" },
          { expect: { selector: "#tries", equals: "2" } },
          { click: "#new-game" },
          { expect: { selector: "#tries", equals: "0" } },
          { expect: { selector: "#hint", equals: "" } },
        ],
        message: "Попытки считаются, а «Новая игра» сбрасывает их и подсказку",
        fix: "В проверке: tries = tries + 1 и показать. В «Новой игре»: tries = 0, показать, hint.textContent = \"\".",
      },
      {
        kind: "source",
        file: "js",
        pattern: "Math\\.random\\s*\\(",
        message: "Новое число загадывается случайно (Math.random)",
        fix: "В «Новой игре»: secret = Math.floor(Math.random() * 10) + 1;",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Если ошибка «Assignment to constant variable», замени const secret на let secret." },
    ],
    learned: [
      "Math.floor(Math.random() * 10) + 1 — случайное число от 1 до 10.",
      "Меняющиеся значения объявляют через let.",
      "Новая игра — это сброс состояния к началу.",
    ],
    quiz: [
      {
        question: "Что даст Math.floor(4.7)?",
        options: ["4", "5", "4.7"],
        correct: 0,
        explain: "Math.floor отбрасывает дробную часть, округляя вниз.",
      },
      {
        question: "Что значит «сбросить состояние»?",
        options: ["Вернуть переменные игры к начальным значениям", "Удалить код", "Перезагрузить компьютер"],
        correct: 0,
        explain: "Попытки — в 0, подсказка — пустая, новое загаданное число.",
      },
    ],
    reference: ref("ugadaj-popytki"),
  },
  {
    track: "project",
    course: C,
    slug: "viktorina",
    number: 7,
    title: "Викторина: вопросы и функция",
    goal: "Ты начнёшь викторину: вопросы хранятся в списке, а своя функция показывает вопрос на экране.",
    freshStart: true,
    explanation: [
      "У каждого вопроса есть текст, варианты ответа и номер правильного. Такие связанные данные хранят в объекте — в фигурных скобках: { text: \"…\", answers: […], correct: 1 }. А все вопросы — в массиве объектов.",
      "Достать часть объекта можно через точку: q.text — текст вопроса, q.answers[0] — первый вариант.",
      "Своя функция — это набор команд с именем: function showQuestion() { … }. Её пишут один раз, а вызывают сколько угодно: showQuestion();. Так код не повторяется.",
    ],
    newTerms: ["js-object", "js-own-function"],
    practice: [
      {
        kind: "choice",
        question: "Что такое q.answers[1] ?",
        code: 'const q = { text: "Сколько ног у паука?", answers: ["6", "8", "10"], correct: 1 };',
        options: ["«8»", "«6»", "1"],
        correct: 0,
        explain: "answers — массив, нумерация с нуля: [1] — второй элемент, «8».",
      },
      {
        kind: "choice",
        question: "Сколько раз выполнится код внутри функции?",
        code: "function hello() {\n  console.log(\"Привет\");\n}\nhello();\nhello();",
        options: ["0", "1", "2"],
        correct: 2,
        explain: "Функция выполняется каждый раз, когда её вызывают: hello() — два раза.",
      },
    ],
    steps: [
      "Посмотри на массив questions: в нём три объекта-вопроса.",
      "Допиши функцию showQuestion(): возьми вопрос const q = questions[current];",
      "Покажи q.text в questionText, а три варианта — на кнопках buttons[0], buttons[1], buttons[2].",
    ],
    starter: {
      html: `<h1>Викторина</h1>
<p id="question"></p>
<button id="a0"></button>
<button id="a1"></button>
<button id="a2"></button>
<p>Очки: <span id="score">0</span></p>
`,
      css: gameCss,
      js: `const questions = [
  { text: "Сколько ног у паука?", answers: ["6", "8", "10"], correct: 1 },
  { text: "Какая планета самая большая?", answers: ["Юпитер", "Марс", "Земля"], correct: 0 },
  { text: "Сколько будет 7 × 6?", answers: ["36", "48", "42"], correct: 2 },
];
let current = 0;
let score = 0;
const questionText = document.querySelector("#question");
const scoreText = document.querySelector("#score");
const buttons = [document.querySelector("#a0"), document.querySelector("#a1"), document.querySelector("#a2")];

// Урок 7: допиши функцию — показать вопрос номер current и подписать кнопки
function showQuestion() {
}

showQuestion();
`,
    },
    focusFile: "js",
    hints: [
      "Внутри функции: const q = questions[current]; и questionText.textContent = q.text;",
      "Кнопки: buttons[0].textContent = q.answers[0]; — и так же для 1 и 2.",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { expect: { selector: "#question", contains: "паука" } },
          { expect: { selector: "#a0", equals: "6" } },
          { expect: { selector: "#a1", equals: "8" } },
          { expect: { selector: "#a2", equals: "10" } },
        ],
        message: "На экране первый вопрос и три варианта ответа",
        fix: "В showQuestion(): const q = questions[current]; questionText.textContent = q.text; и подпиши кнопки buttons[i].textContent = q.answers[i].",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь фигурные скобки функции: function showQuestion() { … }" },
    ],
    learned: [
      "Объект хранит связанные данные: { text, answers, correct }.",
      "Массив объектов — удобный список вопросов.",
      "Своя функция: function имя() { … } — пишется один раз, вызывается сколько угодно.",
    ],
    quiz: [
      {
        question: "Как достать текст вопроса из объекта q?",
        options: ["q.text", "q[text]", "text.q"],
        correct: 0,
        explain: "Часть объекта достают через точку.",
      },
      {
        question: "Как вызвать функцию showQuestion?",
        options: ["showQuestion();", "function showQuestion;", "call showQuestion"],
        correct: 0,
        explain: "Имя функции и скобки: showQuestion();",
      },
    ],
    reference: ref("viktorina"),
  },
  {
    track: "project",
    course: C,
    slug: "viktorina-otvety",
    number: 8,
    title: "Викторина: ответы и итог",
    goal: "Викторина заработает целиком: ответы, очки, следующий вопрос и итог в конце.",
    explanation: [
      "Функции можно передавать данные — параметры. function answer(index) { … } получает номер нажатой кнопки. Вызов answer(1) значит: «нажата кнопка номер 1».",
      "Внутри answer сравниваем index с правильным ответом, прибавляем очко, переходим к следующему вопросу (current + 1). Когда вопросы кончились — показываем итог.",
    ],
    newTerms: [],
    practice: [
      {
        kind: "choice",
        question: "Что такое index в answer(index) ?",
        options: ["Номер нажатой кнопки, который передали в функцию", "Счёт игры", "Текст вопроса"],
        correct: 0,
        explain: "Параметр получает значение при вызове: answer(2) — index = 2.",
      },
      {
        kind: "fill",
        prompt: "Сколько всего вопросов?",
        before: "if (current < questions.",
        after: ") {",
        answers: ["length"],
        explain: "length — длина массива, количество вопросов.",
      },
    ],
    steps: [
      "В конце JavaScript появилась заготовка функции answer(index) и обработчики трёх кнопок.",
      "Внутри answer: если index === questions[current].correct — прибавь очко и покажи его.",
      "Потом current + 1. Если вопросы ещё есть — showQuestion(), иначе — «Конец! Очки: … из …».",
    ],
    additions: {
      js: `
// Урок 8: ответы, очки и конец игры
function answer(index) {
  // если index === questions[current].correct — прибавь очко и покажи его;
  // потом перейди к следующему вопросу, а если вопросы кончились — покажи итог
}

buttons[0].addEventListener("click", function () { answer(0); });
buttons[1].addEventListener("click", function () { answer(1); });
buttons[2].addEventListener("click", function () { answer(2); });
`,
    },
    focusFile: "js",
    hints: [
      "Проверка ответа: if (index === questions[current].correct) { score = score + 1; scoreText.textContent = score; }",
      "Дальше: current = current + 1; if (current < questions.length) { showQuestion(); } else { questionText.textContent = \"Конец! Очки: \" + score + \" из \" + questions.length; }",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { click: "#a1" },
          { expect: { selector: "#score", equals: "1" } },
          { expect: { selector: "#question", contains: "планета" } },
          { click: "#a0" },
          { expect: { selector: "#score", equals: "2" } },
          { click: "#a0" },
          { expect: { selector: "#score", equals: "2" } },
          { expect: { selector: "#question", contains: "Конец" } },
          { expect: { selector: "#question", contains: "2 из 3" } },
        ],
        message: "Правильные ответы дают очко, вопросы меняются, в конце — «Конец! … 2 из 3»",
        fix: "В answer: сравни index с questions[current].correct, потом current + 1 и либо showQuestion(), либо итог «Конец! Очки: … из …».",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь, что функция answer написана целиком, со всеми фигурными скобками." },
    ],
    learned: [
      "Функция может получать данные — параметры.",
      "length — количество элементов массива.",
      "Игра закончена, когда вопросы кончились.",
    ],
    quiz: [
      {
        question: "Какой номер у последнего вопроса, если вопросов 3?",
        options: ["3", "2", "1"],
        correct: 1,
        explain: "Нумерация с нуля: 0, 1, 2.",
      },
      {
        question: "Зачем проверка current < questions.length ?",
        options: ["Чтобы не показать несуществующий вопрос", "Чтобы прибавить очко", "Она не нужна"],
        correct: 0,
        explain: "Когда current дошёл до длины массива, вопросов больше нет.",
      },
    ],
    reference: ref("viktorina-otvety"),
  },
  {
    track: "project",
    course: C,
    slug: "knb",
    number: 9,
    title: "Камень, ножницы, бумага",
    goal: "Ты сыграешь с компьютером: он выбирает случайно, а программа решает, кто победил.",
    freshStart: true,
    explanation: [
      "Компьютер выбирает случайно из массива: choices[Math.floor(Math.random() * 3)].",
      "Правил победы несколько, поэтому условия соединяют: && — «и» (оба условия верны), || — «или» (хотя бы одно верно). Например: (player === \"камень\" && computer === \"ножницы\") — камень бьёт ножницы.",
      "Сначала проверяем ничью, потом все три способа победить, а всё остальное — поражение.",
    ],
    newTerms: ["js-logic"],
    practice: [
      {
        kind: "choice",
        question: "Когда условие верно?",
        code: '(player === "камень" && computer === "ножницы")',
        options: ["Игрок выбрал камень И компьютер — ножницы", "Игрок выбрал камень ИЛИ компьютер — ножницы", "Всегда"],
        correct: 0,
        explain: "&& — «и»: оба условия должны быть верны.",
      },
      {
        kind: "choice",
        question: "true || false — это…",
        options: ["true", "false", "ошибка"],
        correct: 0,
        explain: "|| — «или»: хватает одного верного.",
      },
    ],
    steps: [
      "В функции play компьютер уже выбирает случайно и показывает свой выбор.",
      "Допиши: если player === computer — «Ничья!».",
      "Иначе, если сработал один из трёх способов победить (соедини их через ||), — «Победа!». Во всех остальных случаях — «Поражение!».",
    ],
    starter: {
      html: `<h1>Камень, ножницы, бумага</h1>
<button id="rock">Камень</button>
<button id="scissors">Ножницы</button>
<button id="paper">Бумага</button>
<p id="computer"></p>
<p id="result"></p>
`,
      css: gameCss,
      js: `const choices = ["камень", "ножницы", "бумага"];
const computerText = document.querySelector("#computer");
const resultText = document.querySelector("#result");

function play(player) {
  const computer = choices[Math.floor(Math.random() * 3)];
  computerText.textContent = "Компьютер: " + computer;
  // Урок 9: ничья, победа или поражение?
}

document.querySelector("#rock").addEventListener("click", function () { play("камень"); });
document.querySelector("#scissors").addEventListener("click", function () { play("ножницы"); });
document.querySelector("#paper").addEventListener("click", function () { play("бумага"); });
`,
    },
    focusFile: "js",
    hints: [
      "Ничья: if (player === computer) { resultText.textContent = \"Ничья!\"; }",
      "Победа: else if ((player === \"камень\" && computer === \"ножницы\") || (player === \"ножницы\" && computer === \"бумага\") || (player === \"бумага\" && computer === \"камень\")) { … }",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { click: "#rock" },
          { expect: { selector: "#result", from: { selector: "#computer", map: { "Компьютер: камень": "Ничья!", "Компьютер: ножницы": "Победа!", "Компьютер: бумага": "Поражение!" } } } },
          { click: "#rock" },
          { expect: { selector: "#result", from: { selector: "#computer", map: { "Компьютер: камень": "Ничья!", "Компьютер: ножницы": "Победа!", "Компьютер: бумага": "Поражение!" } } } },
          { click: "#scissors" },
          { expect: { selector: "#result", from: { selector: "#computer", map: { "Компьютер: камень": "Поражение!", "Компьютер: ножницы": "Ничья!", "Компьютер: бумага": "Победа!" } } } },
          { click: "#scissors" },
          { expect: { selector: "#result", from: { selector: "#computer", map: { "Компьютер: камень": "Поражение!", "Компьютер: ножницы": "Ничья!", "Компьютер: бумага": "Победа!" } } } },
          { click: "#paper" },
          { expect: { selector: "#result", from: { selector: "#computer", map: { "Компьютер: камень": "Победа!", "Компьютер: ножницы": "Поражение!", "Компьютер: бумага": "Ничья!" } } } },
          { click: "#paper" },
          { expect: { selector: "#result", from: { selector: "#computer", map: { "Компьютер: камень": "Победа!", "Компьютер: ножницы": "Поражение!", "Компьютер: бумага": "Ничья!" } } } },
        ],
        message: "Итог всегда правильный: «Ничья!», «Победа!» или «Поражение!» по правилам игры",
        fix: "Сначала ничья (player === computer), потом три способа победить через ||, иначе — «Поражение!». Текст — ровно «Ничья!», «Победа!», «Поражение!».",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь скобки в длинном условии: каждая пара (… && …) в своих круглых скобках." },
    ],
    learned: [
      "&& — «и», || — «или».",
      "Сложные правила собирают из простых условий.",
      "Случайный выбор из массива: arr[Math.floor(Math.random() * arr.length)].",
    ],
    quiz: [
      {
        question: "Что значит || ?",
        options: ["или", "и", "не равно"],
        correct: 0,
        explain: "|| — «или», && — «и», !== — «не равно».",
      },
      {
        question: "Игрок — ножницы, компьютер — бумага. Итог?",
        options: ["Победа", "Поражение", "Ничья"],
        correct: 0,
        explain: "Ножницы режут бумагу.",
      },
    ],
    reference: ref("knb"),
  },
  {
    track: "project",
    course: C,
    slug: "begun",
    number: 10,
    title: "Бегун: клавиатура",
    goal: "Бегун будет двигаться стрелками на клавиатуре и кнопками на экране — для телефона.",
    freshStart: true,
    explanation: [
      "Игра может слушать клавиатуру: document.addEventListener(\"keydown\", function (event) { … }). В event.key — какая клавиша нажата: \"ArrowRight\" — стрелка вправо, \"ArrowLeft\" — влево.",
      "Двигать элемент можно через стиль: runner.style.left = x + \"px\" — сдвиг от левого края. Чтобы это работало, у бегуна в CSS position: absolute.",
      "На телефоне клавиатуры со стрелками нет, поэтому сделаем и кнопки. А чтобы не писать одно и то же дважды, движение вынесем в функцию move(dx) — её вызывают и клавиши, и кнопки.",
    ],
    newTerms: ["js-keydown"],
    practice: [
      {
        kind: "choice",
        question: "Что такое event.key при нажатии стрелки вправо?",
        options: ["\"ArrowRight\"", "\"Right\"", "39"],
        correct: 0,
        explain: "В event.key — название клавиши: \"ArrowRight\", \"ArrowLeft\", \" \" (пробел) и так далее.",
      },
      {
        kind: "fill",
        prompt: "Сдвинь бегуна на x пикселей.",
        before: "runner.style.left = x + ",
        after: ";",
        answers: ['"px"', "'px'"],
        explain: "Число + \"px\" — так получается размер для CSS, например \"60px\".",
      },
    ],
    steps: [
      "Допиши функцию move(dx): x = x + dx; steps = steps + 1; runner.style.left = x + \"px\"; stepsText.textContent = steps;",
      "Напиши обработчик клавиатуры: если event.key === \"ArrowRight\" — move(20), если \"ArrowLeft\" — move(-20).",
      "Кнопки ← и → уже вызывают move — проверь их тоже.",
    ],
    starter: {
      html: `<h1>Бегун</h1>
<p>Жми стрелки ← и → на клавиатуре или кнопки.</p>
<div id="track"><div id="runner">🏃</div></div>
<button id="left">←</button>
<button id="right">→</button>
<p>Шагов: <span id="steps">0</span></p>
`,
      css: `${gameCss}
#track {
  position: relative;
  height: 64px;
  max-width: 400px;
  margin: 16px auto;
  background-color: #e7f5ff;
  border-radius: 12px;
}

#runner {
  position: absolute;
  left: 0;
  top: 8px;
  font-size: 40px;
}
`,
      js: `let x = 0;
let steps = 0;
const runner = document.querySelector("#runner");
const stepsText = document.querySelector("#steps");

// Урок 10: допиши — сдвинуть бегуна на dx пикселей и посчитать шаг
function move(dx) {
}

// Урок 10: слушай клавиатуру — стрелки ← и → вызывают move

document.querySelector("#left").addEventListener("click", function () { move(-20); });
document.querySelector("#right").addEventListener("click", function () { move(20); });
`,
    },
    focusFile: "js",
    hints: [
      "move: x = x + dx; steps = steps + 1; runner.style.left = x + \"px\"; stepsText.textContent = steps;",
      "Клавиатура: document.addEventListener(\"keydown\", function (event) { if (event.key === \"ArrowRight\") { move(20); } … });",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { key: "ArrowRight", times: 3 },
          { expect: { selector: "#steps", equals: "3" } },
          { expect: { selector: "#runner", style: { property: "left", equals: "60px" } } },
          { key: "ArrowLeft" },
          { expect: { selector: "#runner", style: { property: "left", equals: "40px" } } },
          { click: "#right" },
          { expect: { selector: "#steps", equals: "5" } },
          { expect: { selector: "#runner", style: { property: "left", equals: "60px" } } },
        ],
        message: "Стрелки и кнопки двигают бегуна на 20px и считают шаги",
        fix: "Допиши move(dx) и обработчик keydown: ArrowRight → move(20), ArrowLeft → move(-20).",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Проверь кавычки в \"ArrowRight\" и \"px\"." },
    ],
    learned: [
      "keydown — событие нажатия клавиши, event.key — какая клавиша.",
      "style.left двигает элемент с position: absolute.",
      "Общую логику выносят в функцию и вызывают из разных мест.",
    ],
    quiz: [
      {
        question: "Зачем движение вынесено в функцию move?",
        options: ["Чтобы клавиши и кнопки использовали один и тот же код", "Чтобы бегун был быстрее", "Без функции нельзя"],
        correct: 0,
        explain: "Один код — меньше ошибок: исправил в одном месте, работает везде.",
      },
      {
        question: "Что будет при runner.style.left = \"100px\" ?",
        options: ["Бегун встанет в 100 пикселях от левого края дорожки", "Бегун станет шире", "Ничего"],
        correct: 0,
        explain: "left — расстояние от левого края у элемента с position: absolute.",
      },
    ],
    reference: ref("begun"),
  },
  {
    track: "practice",
    course: C,
    slug: "pochini-igru",
    number: 11,
    title: "Тренировка: почини игру",
    goal: "Чужой кликер на время сломан в трёх местах. Найди и почини.",
    explanation: [
      "Это тренировка на чужом коде — твои игры она не меняет. В игре три ошибки: одна видна в консоли, а две — нет, их видно только по поведению игры.",
      "Для тренировки таймер здесь быстрый: тик каждые 0,1 секунды. Нажми «Старт» и посмотри, что происходит со временем, а потом понажимай кнопку очков.",
    ],
    newTerms: [],
    practice: [
      {
        kind: "choice",
        question: "Что не так в условии if (score = 10) ?",
        options: ["Один знак = кладёт 10 в score, а не сравнивает", "Нужны квадратные скобки", "Всё правильно"],
        correct: 0,
        explain: "Сравнение — ===. С одним = условие «верно» сразу, и очки становятся 10.",
      },
      {
        kind: "choice",
        question: "Время уходит в минус: −1, −2, −3… Что забыли?",
        options: ["clearInterval", "setInterval", "disabled"],
        correct: 0,
        explain: "Таймер не остановили — он продолжает тикать.",
      },
    ],
    steps: [
      "Открой консоль: там первая ошибка. Нажми на номер строки.",
      "Понажимай «Жми!»: «Победа!» появляется сразу, а очки странные. Найди условие.",
      "Нажми «Старт»: время уходит в минус. Найди, где таймер должен остановиться.",
    ],
    starter: {
      html: `<h1>Кликер на время</h1>
<p>Очки: <span id="score">0</span> · Время: <span id="time">3</span></p>
<button id="click-button">Жми!</button>
<button id="start-button">Старт</button>
<p id="message"></p>
`,
      css: gameCss,
      js: `let score = 0;
let timeLeft = 3;
const scoreText = document.querySelector("#score");
const timeText = document.querySelector("#time");
const message = document.querySelector("#message");
const clickButton = document.querySelector("#click-button");
const startButton = document.querySelector("#start-button");

clickButton.addEventListener("click", function () {
  score = score + 1;
  scoreText.textContent = scor;
  if (score = 10) {
    message.textContent = "Победа!";
  }
});

startButton.addEventListener("click", function () {
  const timer = setInterval(function () {
    timeLeft = timeLeft - 1;
    timeText.textContent = timeLeft;
    if (timeLeft === 0) {
      clickButton.disabled = true;
    }
  }, 100);
});
`,
    },
    focusFile: "js",
    hints: [
      "Три места: опечатка в имени переменной, = вместо === и пропущенный clearInterval.",
      "scoreText.textContent = score; · if (score === 10) · внутри if (timeLeft === 0) добавь clearInterval(timer);",
    ],
    checks: [
      {
        kind: "scenario",
        steps: [
          { click: "#click-button", times: 3 },
          { expect: { selector: "#score", equals: "3" } },
          { expect: { selector: "#message", equals: "" } },
          { click: "#start-button" },
          { wait: 700 },
          { expect: { selector: "#time", equals: "0" } },
        ],
        message: "Очки считаются правильно, «Победа!» не появляется раньше времени, время останавливается на 0",
        fix: "Исправь опечатку scor → score, = на === в условии и добавь clearInterval(timer) когда timeLeft === 0.",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Посмотри в консоль: имя переменной написано с опечаткой." },
    ],
    learned: [
      "Не все ошибки видны в консоли: часть видно только по поведению игры.",
      "= вместо === — частая и коварная ошибка.",
      "Таймер нужно останавливать.",
    ],
    quiz: [
      {
        question: "Какую из трёх ошибок покажет консоль?",
        options: ["Опечатку в имени переменной", "= вместо ===", "Забытый clearInterval"],
        correct: 0,
        explain: "Неизвестное имя — ошибка ReferenceError. Остальные две программа выполняет «как написано».",
      },
      {
        question: "Как найти ошибку, которой нет в консоли?",
        options: ["Сравнить, что должно происходить и что происходит, и найти это место в коде", "Никак", "Удалить весь код"],
        correct: 0,
        explain: "Наблюдай за игрой и ищи код, который отвечает за неправильное поведение.",
      },
    ],
    reference: ref("pochini-igru"),
  },
  {
    track: "project",
    course: C,
    slug: "svoya-igra",
    number: 12,
    title: "Финал: своя игра",
    goal: "Ты придумаешь и соберёшь свою игру с нуля — по своему плану.",
    freshStart: true,
    explanation: [
      "Финал курса! Придумай игру: «Поймай звезду» (кнопка прыгает по экрану), «Реакция» (успей нажать, пока не вышло время), «Монетка» (угадай орёл или решку), «Счёт до 100 за минуту» — или своё.",
      "Любая игра состоит из одного и того же: состояние (переменные let — очки, время, жизни), действия игрока (кнопки, клавиши, поле ввода), правила (if) и что-то живое — случайность (Math.random), таймер (setInterval) или клавиатура (keydown).",
      "Работай маленькими шагами и запускай после каждого. Застрял — открой шпаргалку, свои игры из этого курса или спроси наставника.",
    ],
    newTerms: [],
    steps: [
      "Придумай игру и её правила: как набрать очки, как выиграть или проиграть.",
      "HTML: заголовок, кнопка (или поле ввода) и место для счёта.",
      "JavaScript: переменная для очков, обработчик действия, условие if и случайность, таймер или клавиатура.",
      "Оформи игру в CSS и сыграй сам!",
    ],
    starter: {
      html: `<!-- Финал курса: своя игра.
     Чек-лист (по нему работает проверка):
     1. Кнопка (или поле ввода), на которую реагирует игра.
     2. Переменная состояния через let (очки, время, жизни).
     3. Обработчик действия игрока — addEventListener.
     4. Правило игры — условие if.
     5. Что-то живое: Math.random, setInterval или keydown. -->

`,
      css: "",
      js: "",
    },
    focusFile: "html",
    hints: ["Загляни в свои игры из этого курса: в них есть всё — кнопки, if, таймер, случайность и клавиатура."],
    checks: [
      { kind: "count", selector: "button, input", min: 1, message: "Есть кнопка или поле ввода", fix: "Добавь в HTML <button id=\"…\">…</button>." },
      { kind: "source", file: "js", pattern: "\\blet\\s+\\w+", message: "Есть переменная состояния (let)", fix: "Заведи переменную: let score = 0;" },
      { kind: "source", file: "js", pattern: "addEventListener\\s*\\(", message: "Игра реагирует на действия игрока", fix: "Добавь обработчик: кнопка.addEventListener(\"click\", function () { … });" },
      { kind: "source", file: "js", pattern: "if\\s*\\(", message: "Есть правило игры (if)", fix: "Добавь условие: например, if (score >= 10) { … }" },
      {
        kind: "source",
        file: "js",
        pattern: "Math\\.random|setInterval|keydown",
        message: "В игре есть случайность, таймер или клавиатура",
        fix: "Добавь Math.random(), setInterval или обработчик keydown — то, что сделает игру живой.",
      },
      { kind: "noErrors", message: "В консоли нет ошибок", fix: "Посмотри в консоль и нажми на номер строки с ошибкой." },
    ],
    learned: [
      "Ты придумал и собрал свою игру с нуля.",
      "Игра = состояние + действия игрока + правила + что-то живое.",
      "Теперь ты умеешь делать сайты и игры на настоящем коде!",
    ],
    quiz: [
      {
        question: "Из чего состоит почти любая игра?",
        options: ["Состояние, действия игрока, правила", "Только картинки", "Только таймер"],
        correct: 0,
        explain: "Переменные хранят состояние, обработчики ловят действия, if задаёт правила.",
      },
      {
        question: "Как сделать игру разной каждый раз?",
        options: ["Добавить случайность — Math.random", "Сделать кнопку больше", "Никак"],
        correct: 0,
        explain: "Случайность делает каждую партию новой.",
      },
    ],
    reference: ref("svoya-igra"),
  },
];
