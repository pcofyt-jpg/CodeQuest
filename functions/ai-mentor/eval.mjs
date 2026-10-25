#!/usr/bin/env node
/**
 * Сравнение YandexGPT Lite и Pro на настоящих ошибках из уроков CodeQuest.
 *
 * Запуск (PowerShell, в папке проекта):
 *   $env:MENTOR_URL="https://functions.yandexcloud.net/…"; $env:MENTOR_CODE="ваш-код"; node functions/ai-mentor/eval.mjs
 *
 * Для сравнения у функции временно должно быть ALLOW_MODEL_CHOICE=1 (потом уберите).
 * Скрипт печатает ответы обеих моделей — их можно прислать для оценки. Код доступа не печатается.
 */
const URL_ = process.env.MENTOR_URL;
const CODE = process.env.MENTOR_CODE;
if (!URL_ || !CODE) {
  console.error("Задайте MENTOR_URL и MENTOR_CODE (см. комментарий в начале файла).");
  process.exit(1);
}

const lesson7 = {
  html: '<div class="card">\n  <h2>Ракета готова?</h2>\n  <p id="status">Ракета ждёт команды.</p>\n  <button id="start-button">Старт</button>\n</div>\n',
  css: "",
  js: 'const button = document.querySelector("#start");\nconst statusText = document.querySelector("#status");\n\nbutton.addEventListner("click", function () {\n  statusText.textContent = "3... 2... 1... Поехали!";\n});\n',
};
const cases = [
  {
    name: "Урок 7: querySelector не нашёл кнопку",
    req: { mode: "explain-error", files: lesson7, lesson: { title: "Найди ошибку", goal: "Кнопка «Старт» снова заработает." }, error: { message: "Uncaught TypeError: Cannot read properties of null (reading 'addEventListner')", line: 4 } },
  },
  {
    name: "Урок 7: опечатка в addEventListener",
    req: { mode: "explain-error", files: { ...lesson7, js: lesson7.js.replace('"#start"', '"#start-button"') }, lesson: { title: "Найди ошибку", goal: "Кнопка «Старт» снова заработает." }, error: { message: "Uncaught TypeError: button.addEventListner is not a function", line: 4 } },
  },
  {
    name: "Урок 8: счётчик не показывает число",
    req: {
      mode: "check-help",
      files: { html: '<p>Лайков: <span id="count">0</span></p>\n<button id="plus">+1</button>\n', css: "", js: 'let count = 0;\nconst countText = document.querySelector("#count");\nconst plusButton = document.querySelector("#plus");\n\nplusButton.addEventListener("click", function () {\n  count = count + 1;\n});\n' },
      lesson: { title: "Счётчик лайков", goal: "Каждое нажатие на «+1» увеличит число." },
      failedChecks: [{ message: "Три нажатия на «+1» показывают 1, 2, 3" }],
    },
  },
  {
    name: "Урок 4: у карточки нет отступа",
    req: {
      mode: "check-help",
      files: { html: '<div class="card">\n  <h2>Барсик</h2>\n  <p>Кот</p>\n</div>\n', css: ".card {\n  background-color: white;\n  border-radius: 16px;\n  padding: 20 px;\n}\n", js: "" },
      lesson: { title: "Карточка", goal: "Аккуратная карточка с заголовком и текстом." },
      failedChecks: [{ message: "У карточки есть внутренний отступ padding" }],
    },
  },
  {
    name: "Синтаксис: пропущена скобка",
    req: { mode: "explain-error", files: { html: '<button id="go">Жми</button><p id="out"></p>', css: "", js: 'document.querySelector("#go").addEventListener("click", function () {\n  document.querySelector("#out").textContent = "Привет";\n}\n' }, error: { message: "SyntaxError: Unexpected token (3:1)", line: 3 } },
  },
];

const HINTS = {
  config_folder_id: "Не задана переменная окружения FOLDER_ID (ID каталога codequest).",
  config_codes_missing: "Не задана переменная окружения ACCESS_CODES_SHA256.",
  config_codes_not_hashes: "В ACCESS_CODES_SHA256 не хеши. Вставьте строку, которую печатает scripts/mentor-codes.mjs, а не сами коды.",
  config_service_account: "Функции не назначен сервисный аккаунт ai-mentor.",
  code: "Код доступа не подходит: проверьте MENTOR_CODE и что его хеш есть в ACCESS_CODES_SHA256.",
  origin: "В ALLOWED_ORIGINS нет http://localhost:3000.",
};
let hinted = false;

for (const c of cases) {
  console.log("\n" + "=".repeat(70) + "\n" + c.name);
  for (const model of ["yandexgpt-lite", "yandexgpt"]) {
    const t = Date.now();
    try {
      const res = await fetch(URL_, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8", Origin: "http://localhost:3000" },
        body: JSON.stringify({ ...c.req, code: CODE, model }),
      });
      const data = await res.json().catch(() => ({}));
      if (!hinted && data.error && HINTS[data.error]) {
        console.log(`\n>>> Что исправить: ${HINTS[data.error]}`);
        hinted = true;
      }
      console.log(`\n--- ${model} (${res.status}, ${((Date.now() - t) / 1000).toFixed(1)} с)`);
      console.log(data.answer ?? (data.error ? `[${data.error}] ${data.message}` : JSON.stringify(data)));
    } catch (e) {
      console.log(`\n--- ${model}: ошибка соединения — ${e.message}`);
    }
  }
}
