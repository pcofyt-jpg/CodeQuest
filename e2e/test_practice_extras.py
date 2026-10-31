"""Разминки «Попробуй», подсказка о раскладке, сертификат, шаблоны, «Скопировать» в шпаргалке."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright

START = ["kak-ustroen-sajt", "klaviatura", "tegi", "studiya"]
C1 = ["zagolovok","opisanie","cveta","kartochka","knopka","dizajn","oshibka","schetchik","svoya-versiya","moj-proekt"]
ok_all = True
def report(name, cond):
    global ok_all
    ok_all &= bool(cond)
    print(("  ok  " if cond else "  FAIL") + " " + name)

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 1440, "height": 900})
    origin = BASE.split("/", 3)[0] + "//" + BASE.split("/", 3)[2]
    ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=origin)
    pg = ctx.new_page()
    pg.goto(BASE + "/"); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(600)
    body = pg.inner_text("body")
    report("маршрут начинается со «Старта»", "СТАРТ: С АЗОВ" in body.upper() and "Начать первый урок" in body)
    pg.get_by_role("link", name="Начать первый урок").click(); pg.wait_for_url("**/learn/kak-ustroen-sajt**")
    report("урок по схеме Понять → Попробуй → Сделай → Проверь себя", "1. Понять" in pg.inner_text("body") and "2. Попробуй" in pg.inner_text("body"))

    # --- «напечатай» с подсказкой о раскладке (урок «Клавиатура»)
    unlock_until(pg, 1, START)
    pg.goto(BASE + "/learn/klaviatura"); pg.wait_for_selector(".cm-content")
    practice = pg.locator('section[aria-labelledby="practice-title"]')
    practice.get_by_label("Напечатай здесь:").fill("Бр1Ю")
    report("русская раскладка: показана подсказка переключить", "включена русская раскладка" in practice.inner_text())
    practice.get_by_label("Напечатай здесь:").fill("<h1>"); practice.get_by_role("button", name="Проверить ответ").click()
    report("правильный ввод засчитан", "Верно!" in practice.inner_text())
    practice.get_by_role("button", name="Дальше →").click()
    report("переход к следующему заданию разминки", "задание 2 из 5" in practice.inner_text().lower())

    # --- «собери код» и «вставь пропущенное» (урок «Теги»)
    unlock_until(pg, 2, START)
    pg.goto(BASE + "/learn/tegi"); pg.wait_for_selector(".cm-content")
    practice = pg.locator('section[aria-labelledby="practice-title"]')
    pool = practice.locator('[aria-label="Строчки"]')
    pool.get_by_role("button", name="</div>").click()
    for line in ["<div>", "<h2>Мой питомец</h2>"]:
        pool.get_by_role("button", name=line).click()
    practice.get_by_role("button", name="Проверить порядок").click()
    report("неверный порядок: объяснение", "Порядок другой" in practice.inner_text())
    mine = practice.locator('[aria-label="Твой код"]')
    while mine.get_by_role("button").count() > 0:
        mine.get_by_role("button").first.click()
    for line in ["<div>", "<h2>Мой питомец</h2>", "</div>"]:
        pool.get_by_role("button", name=line).click()
    practice.get_by_role("button", name="Проверить порядок").click()
    report("верный порядок засчитан", "Верно!" in practice.inner_text())
    practice.get_by_role("button", name="Дальше →").click()
    practice.get_by_label("Пропущенный кусочек кода").fill("</p>"); practice.get_by_role("button", name="Проверить ответ").click()
    report("«вставь пропущенное» засчитано", "Верно!" in practice.inner_text())

    # --- сертификат: курс 1 пройден, курс 2 — нет
    unlock_until(pg, 10, C1)
    pg.goto(BASE + "/"); pg.wait_for_timeout(500)
    report("на главной ссылка на сертификат курса 1", pg.get_by_role("link", name="Получить сертификат курса").count() == 1)
    pg.goto(BASE + "/sertifikat/?kurs=pervyj-sajt"); pg.wait_for_timeout(500)
    pg.get_by_label("Имя на сертификате (по желанию)").fill("Миша")
    cert = pg.get_by_role("article", name="Сертификат")
    report("сертификат с именем и курсом", "Миша" in cert.inner_text() and "Первый сайт" in cert.inner_text())
    pg.goto(BASE + "/sertifikat/?kurs=nastoyashchij-sajt"); pg.wait_for_timeout(500)
    report("незавершённый курс: сертификат пока не готов", "пока не готов" in pg.inner_text("body"))

    # --- шаблон «Открытка»
    pg.goto(BASE + "/proekty/"); pg.wait_for_selector('section[aria-label="Список проектов"]:not(.opacity-0)')
    pg.get_by_role("button", name="Начать «Открытка»").click(); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(1200)
    frame = pg.frame_locator('iframe[title^="Результат"]')
    frame.locator("#gift-button").click(); pg.wait_for_timeout(200)
    report("шаблон открытки работает", "подарок" in frame.locator("#gift").inner_text())

    # --- «Скопировать» в шпаргалке
    pg.get_by_role("button", name="Шпаргалка").click()
    drawer = pg.get_by_role("dialog", name="Шпаргалка")
    drawer.get_by_role("button", name="Скопировать").first.click(); pg.wait_for_timeout(200)
    report("пример из шпаргалки копируется", len(pg.evaluate("navigator.clipboard.readText()")) > 3)
    print("ALL OK:", ok_all)
    b.close()
