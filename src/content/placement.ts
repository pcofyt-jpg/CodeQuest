import type { QuizQuestion } from "@/content/lessons/types";

/**
 * Входная проверка для тех, кто уже делал сайты (например, ребятам 12–14 лет).
 * 8 верных из 10 с первой попытки — «Старт» и курс 1 засчитываются, можно начинать с практикума и курса 2.
 * Вопросы — по темам «Старта» и курса 1: теги, CSS, классы, JavaScript-кнопка, переменные.
 */
export const PLACEMENT_PASS = 8;

export const placementQuestions: QuizQuestion[] = [
  {
    question: "Какой тег — закрывающий тег абзаца?",
    options: ["</p>", "<p>", "<p/>"],
    correct: 0,
    explain: "Закрывающий тег — с косой чертой после <.",
  },
  {
    question: "Какой язык отвечает за цвета и отступы на странице?",
    options: ["CSS", "HTML", "JavaScript"],
    correct: 0,
    explain: "HTML — что на странице, CSS — как выглядит, JavaScript — как реагирует.",
  },
  {
    question: "Как правильно записать правило CSS для заголовка?",
    options: ["h1 { color: tomato; }", "h1 = color tomato", "<h1 color=tomato>"],
    correct: 0,
    explain: "Кого оформляем, а в фигурных скобках — свойство, двоеточие, значение и точка с запятой.",
  },
  {
    question: "Как в CSS обратиться к элементам с class=\"card\"?",
    options: [".card", "#card", "card()"],
    correct: 0,
    explain: "Класс — с точкой, id — с решёткой.",
  },
  {
    question: "Что такое padding?",
    options: ["Отступ внутри элемента, от края до содержимого", "Отступ снаружи элемента", "Толщина рамки"],
    correct: 0,
    explain: "padding — внутри, margin — снаружи.",
  },
  {
    question: "Что вернёт document.querySelector(\"#like\")?",
    options: ["Элемент с id=\"like\"", "Все элементы с классом like", "Текст «like»"],
    correct: 0,
    explain: "querySelector находит элемент; # — по id.",
  },
  {
    question: "Когда выполнится код внутри обработчика?",
    code: 'button.addEventListener("click", function () {\n  message.textContent = "Ура!";\n});',
    options: ["Каждый раз при нажатии на кнопку", "Один раз при открытии страницы", "Никогда"],
    correct: 0,
    explain: "addEventListener запускает функцию при каждом нажатии.",
  },
  {
    question: "Что будет в count после этих строк?",
    code: "let count = 2;\ncount = count + 1;",
    options: ["3", "2", "21"],
    correct: 0,
    explain: "Берём 2, прибавляем 1 и кладём обратно в count.",
  },
  {
    question: "Почему для счёта пишут let, а не const?",
    options: ["Значение будет меняться", "let работает быстрее", "const нельзя для чисел"],
    correct: 0,
    explain: "const нельзя переприсвоить.",
  },
  {
    question: "Что не так в этом коде?",
    code: "<div>\n  <p>Текст</div>\n</p>",
    options: ["Теги закрыты не в том порядке", "Нельзя класть <p> в <div>", "Всё правильно"],
    correct: 0,
    explain: "Сначала закрывают внутренний тег, потом внешний.",
  },
];
