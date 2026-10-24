# Сквозные тесты

Проверяют студию в настоящем браузере Chromium. Написаны на Python, чтобы не добавлять
в проект тяжёлую зависимость; позже их можно перенести на Playwright для Node.

```bash
pip install playwright && python -m playwright install chromium
npm run build && npm start          # в отдельном терминале
python e2e/test_lesson_flow.py      # прохождение урока, черновики, закрытые уроки
python e2e/test_preview_security.py # попытки кода выбраться из песочницы, зависший цикл
python e2e/test_all_lessons.py      # все уроки: стартовый код не проходит, эталонное решение проходит
```

Адрес сервера можно задать переменной `BASE_URL`.

`test_all_lessons.py` также служит набором эталонных решений уроков.
