/**
 * Курсы маршрута. Пока готов курс 1; курсы 2 и 3 в разработке
 * (план — docs/CURRICULUM.md). На главной они показаны честно, как «готовится».
 */
export type Course = {
  id: string;
  number: number;
  title: string;
  description: string;
  status: "ready" | "soon";
};

export const courses: Course[] = [
  {
    id: "pervyj-sajt",
    number: 1,
    title: "Первый сайт",
    description: "Свой сайт на любую тему: заголовки, цвета, карточка, кнопки и счётчик.",
    status: "ready",
  },
  {
    id: "nastoyashchij-sajt",
    number: 2,
    title: "Настоящий сайт",
    description: "Меню, списки, картинки, ряд карточек и версия для телефона. В конце — сайт с нуля по своему плану.",
    status: "soon",
  },
  {
    id: "igry",
    number: 3,
    title: "Интерактив и мини-игры",
    description: "Условия, ввод, таймер и счёт. Кликер, «угадай число», викторина — и своя игра.",
    status: "soon",
  },
];
