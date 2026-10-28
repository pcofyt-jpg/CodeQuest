# Сквозные тесты

Проверяют студию в настоящем браузере Chromium. Написаны на Python, чтобы не добавлять
в проект тяжёлую зависимость; позже их можно перенести на Playwright для Node.

```bash
pip install playwright && python -m playwright install chromium
npm run build && npm start          # в отдельном терминале
python e2e/test_lesson_flow.py      # прохождение урока, черновики, закрытые уроки
python e2e/test_preview_security.py # попытки кода выбраться из песочницы, зависший цикл
python e2e/test_all_lessons.py      # все уроки: стартовый код не проходит, эталонное решение проходит
python e2e/test_projects_backup.py  # «Мои проекты», скачивание сайта, перенос через файл, подсказка при опечатке
python e2e/test_practice_extras.py  # разминки, подсказка о раскладке, сертификат, шаблоны, «Скопировать»
python e2e/test_python.py           # Python: робот, вечный цикл, ввод, ошибки, закрытая сеть
python e2e/test_images.py           # библиотека картинок: панель, копирование кода, предпросмотр, скачивание
python e2e/test_mentor_ui.py        # ИИ-наставник против имитации функции (нужна сборка с NEXT_PUBLIC_AI_MENTOR_URL)
```

Адрес сервера можно задать переменной `BASE_URL`.

`test_all_lessons.py` также служит набором эталонных решений уроков.

Важно: не запускайте статическую сборку (`STATIC_EXPORT=1 npx next build`) в той же папке, пока работает
`npm start`, — она перезапишет файлы сервера, и страницы перестанут оживать (скрипты будут отдаваться с ошибкой 500).
