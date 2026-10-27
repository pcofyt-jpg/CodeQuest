import type { ProjectFiles } from "@/content/lessons/types";

/**
 * Шаблоны для «Моих проектов»: рабочие заготовки, которые ребёнок переделывает под себя.
 * Код простой и с комментариями — только то, что встречалось в курсах 1–2.
 */
export type ProjectTemplate = { id: string; title: string; description: string; files: ProjectFiles };

export const templates: ProjectTemplate[] = [
  {
    id: "otkrytka",
    title: "Открытка",
    description: "Поздравление с кнопкой-сюрпризом. Поменяй текст, цвета и картинку.",
    files: {
      html: `<div class="card">
  <img src="kartinki/zvezda.svg" alt="Звезда">
  <h1>С днём рождения!</h1>
  <p>Желаю, чтобы всё получалось!</p>
  <button id="gift-button">Открыть подарок</button>
  <p id="gift"></p>
</div>
`,
      css: `body {
  font-family: Verdana, sans-serif;
  background-color: #fff0f6;
  display: flex;
  justify-content: center;
  padding: 24px;
}

.card {
  max-width: 360px;
  text-align: center;
  background-color: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

button {
  background-color: #e64980;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 16px;
}
`,
      js: `// Нажали на кнопку — показываем сюрприз
const giftButton = document.querySelector("#gift-button");
const gift = document.querySelector("#gift");

giftButton.addEventListener("click", function () {
  gift.textContent = "Твой подарок — целый день игр!";
});
`,
    },
  },
  {
    id: "viktorina",
    title: "Викторина",
    description: "Вопрос и три ответа. Придумай свои вопросы и ответы.",
    files: {
      html: `<h1>Викторина</h1>
<p>Какая планета ближе всех к Солнцу?</p>
<button id="answer-1">Меркурий</button>
<button id="answer-2">Марс</button>
<button id="answer-3">Юпитер</button>
<p id="result"></p>
`,
      css: `body {
  font-family: Verdana, sans-serif;
  padding: 24px;
}

button {
  display: block;
  margin-bottom: 8px;
  padding: 10px 18px;
  font-size: 16px;
  border-radius: 10px;
  border: 2px solid #4dabf7;
  background-color: white;
}

button:hover {
  background-color: #e7f5ff;
}
`,
      js: `// Правильный ответ — первая кнопка
const result = document.querySelector("#result");

document.querySelector("#answer-1").addEventListener("click", function () {
  result.textContent = "Верно! Меркурий ближе всех к Солнцу.";
});

document.querySelector("#answer-2").addEventListener("click", function () {
  result.textContent = "Не совсем. Попробуй ещё!";
});

document.querySelector("#answer-3").addEventListener("click", function () {
  result.textContent = "Не совсем. Попробуй ещё!";
});
`,
    },
  },
  {
    id: "kliker",
    title: "Кликер",
    description: "Игра: набери 10 очков. Поменяй цель, картинку и награду.",
    files: {
      html: `<h1>Кликер</h1>
<p>Очки: <span id="score">0</span> из 10</p>
<button id="click-button"><img src="kartinki/myach.svg" alt="Мяч" width="80"></button>
<p id="message">Жми на мяч!</p>
`,
      css: `body {
  font-family: Verdana, sans-serif;
  text-align: center;
  padding: 24px;
}

#click-button {
  border: none;
  background-color: #ebfbee;
  border-radius: 50%;
  padding: 16px;
}

#click-button:hover {
  background-color: #d3f9d8;
}
`,
      js: `let score = 0;
const scoreText = document.querySelector("#score");
const message = document.querySelector("#message");
const clickButton = document.querySelector("#click-button");

clickButton.addEventListener("click", function () {
  score = score + 1;
  scoreText.textContent = score;
  // Совет: в курсе 3 ты научишься проверять, набраны ли 10 очков (if).
  message.textContent = "Ещё!";
});
`,
    },
  },
];
