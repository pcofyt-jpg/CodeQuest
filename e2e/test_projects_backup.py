"""«Мои проекты», скачивание сайта, перенос прогресса через файл, подсказка при опечатке."""
import os, re, sys, json, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright

SLUGS = ["zagolovok","opisanie","cveta","kartochka","knopka","dizajn","oshibka","schetchik","svoya-versiya","moj-proekt"]
ok_all = True
def report(name, cond):
    global ok_all
    ok_all &= bool(cond)
    print(("  ok  " if cond else "  FAIL") + " " + name)

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(accept_downloads=True); pg = ctx.new_page()
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(BASE + "/"); pg.evaluate("localStorage.clear()")

    # --- проект: создать, написать код, сохранить, переименовать
    pg.goto(BASE + "/proekty/")
    pg.wait_for_selector('section[aria-label="Список проектов"]:not(.opacity-0)')  # страница «ожила»
    pg.get_by_role("button", name="Новый проект").click()
    pg.wait_for_url(re.compile(r"/proekt/?\?id=")); pg.wait_for_selector(".cm-content")
    set_code(pg, "HTML", "<h1>Угадай число</h1><p id='out'>?</p><button id='go'>Жми</button>")
    set_code(pg, "JavaScript", 'document.querySelector("#go").addEventListener("click", function () { document.querySelector("#out").textContent = "42"; });')
    pg.wait_for_timeout(1500)
    pg.frame_locator('iframe[title^="Результат"]').locator("#go").click(); pg.wait_for_timeout(200)
    report("проект работает в предпросмотре", pg.frame_locator('iframe[title^="Результат"]').locator("#out").inner_text() == "42")
    pg.reload(); pg.wait_for_selector(".cm-content")
    report("проект сохраняется после перезагрузки", "Угадай число" in pg.evaluate("() => document.querySelector('.cm-content').innerText"))

    # --- скачать сайт
    with pg.expect_download() as dl:
        pg.get_by_role("button", name="Скачать сайт").click()
    path = dl.value.path(); html = open(path, encoding="utf-8").read()
    report("скачанный сайт содержит код ребёнка", "<h1>Угадай число</h1>" in html and 'textContent = "42"' in html)
    report("в скачанном сайте нет служебного кода студии", "__cqLoop" not in html and "Content-Security-Policy" not in html)
    report("имя файла по названию проекта", dl.value.suggested_filename.endswith(".html"))

    pg.goto(BASE + "/proekty/")
    pg.get_by_role("button", name="Переименовать").click()
    pg.get_by_label("Название проекта").fill("Моя игра"); pg.get_by_role("button", name="Сохранить").click()
    report("проект переименован", pg.get_by_role("link", name="Моя игра").count() == 1)

    # --- перенос через файл: сохранить, очистить, загрузить
    unlock_until(pg, 3, SLUGS); pg.goto(BASE + "/"); pg.wait_for_timeout(500)
    with pg.expect_download() as dl:
        pg.get_by_role("button", name="Сохранить в файл").click()
    backup_path = dl.value.path()
    data = json.load(open(backup_path, encoding="utf-8"))
    report("в файле прогресс и проект", data.get("kind") == "codequest-backup" and len(data["projects"]) == 1)
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(500)
    report("после очистки прогресса нет", re.search(r"Пройдено 0 из \d+", pg.inner_text("body")) is not None)
    pg.locator('input[type="file"]').set_input_files(backup_path)
    pg.get_by_role("button", name="Заменить").click(); pg.wait_for_timeout(300)
    report("прогресс восстановлен из файла", re.search(r"Пройдено 3 из \d+", pg.inner_text("body")) is not None)
    pg.goto(BASE + "/proekty/")
    report("проект восстановлен из файла", pg.get_by_role("link", name="Моя игра").count() == 1)

    # --- испорченный файл отклоняется
    bad = os.path.join(tempfile.mkdtemp(), "bad.json"); open(bad, "w").write('{"kind":"другое"}')
    pg.goto(BASE + "/"); pg.wait_for_timeout(300)
    pg.locator('input[type="file"]').set_input_files(bad); pg.wait_for_timeout(300)
    report("чужой файл отклонён с объяснением", "Это не файл прогресса CodeQuest" in pg.inner_text("body"))

    # --- удаление проекта
    pg.goto(BASE + "/proekty/"); pg.get_by_role("button", name="Удалить").click()
    pg.get_by_role("button", name="Удалить").last.click()
    report("проект удалён", pg.get_by_text("Пока проектов нет").count() == 1)

    # --- урок 7: подсказка при опечатке после исправления первой ошибки
    unlock_until(pg, 6, SLUGS); pg.goto(BASE + "/learn/oshibka/"); pg.wait_for_selector(".cm-content")
    set_code(pg, "JavaScript", 'const button = document.querySelector("#start-button");\nconst statusText = document.querySelector("#status");\n\nbutton.addEventListner("click", function () {\n  statusText.textContent = "Поехали!";\n});\n')
    pg.wait_for_timeout(1200)
    report("опечатка: подсказка addEventListener", "Может быть, ты имел в виду addEventListener?" in pg.locator('section[aria-label="Консоль"]').inner_text())

    # --- курсы на главной
    pg.goto(BASE + "/"); body = pg.inner_text("body")
    report("на главной курс 2 открыт, курс 3 «готовится»", "КУРС 2 · НАСТОЯЩИЙ САЙТ" in body.upper() and "Интерактив и мини-игры" in body and "КУРС 3 · ГОТОВИТСЯ" in body.upper())
    report("ошибок страницы нет", not [e for e in errs if "addEventListner" not in e])
    print("ALL OK:", ok_all)
    b.close()
