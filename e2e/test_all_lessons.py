"""Проходит все 10 уроков подряд, как ученик, используя эталонные решения из references.json.

Проверяет: стартовый код не проходит, эталон проходит, непройденная проверка показывает
подсказку, урок проекта продолжает код прошлого урока проекта, работают тест,
шпаргалка и контрольная точка, нет ложных сообщений о переходе.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = json.load(open(os.path.join(ROOT, "src/content/lessons/references.json"), encoding="utf-8"))
SLUGS = list(REF)
# Уроки проекта, которые продолжают сайт прошлого урока того же курса, и чем этот сайт узнать.
CONTINUES = {
    **{s: "Мой кот Барсик" for s in ["opisanie", "cveta", "kartochka", "knopka", "dizajn", "schetchik", "moj-proekt"]},
    **{s: "Мой футбол" for s in ["spiski", "menyu", "kartinki", "otstupy", "ramki", "ryad", "centr", "telefon"]},
    **{s: "<h1>Кликер</h1>" for s in ["kliker-uluchsheniya", "kliker-tajmer"]},
    **{s: "<h1>Угадай число</h1>" for s in ["ugadaj-podskazki", "ugadaj-popytki"]},
    "viktorina-otvety": "<h1>Викторина</h1>",
}
FRESH = {"karkas": "Барсик", "sayt-s-nulya": "Мой футбол", "ugadaj-vvod": "Кликер", "viktorina": "Угадай число",
         "knb": "Викторина", "begun": "Камень", "svoya-igra": "Бегун"}  # начинаются с чистого листа: чужого сайта быть не должно
TABS = {"html": "HTML", "css": "CSS", "js": "JavaScript"}

def editor_text(pg, tab):
    pg.get_by_role("tab", name=tab, exact=True).click()
    return pg.evaluate("() => document.querySelector('.cm-content').innerText")

ok_all = True
def report(name, cond):
    global ok_all
    ok_all &= bool(cond)
    print(("  ok  " if cond else "  FAIL") + " " + name)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto(BASE + "/"); pg.evaluate("localStorage.clear()")
    for i, slug in enumerate(SLUGS):
        print(f"== {i+1}. {slug}")
        pg.goto(BASE + "/learn/" + slug); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(700)
        # продолжение проекта: в стартовом HTML есть заголовок из прошлого урока проекта
        if slug in CONTINUES:
            report("продолжает сайт из прошлого урока курса", CONTINUES[slug] in editor_text(pg, "HTML"))
        if slug in FRESH:
            report("начинается с чистого листа", FRESH[slug] not in editor_text(pg, "HTML"))
        check(pg)
        body = pg.inner_text("body")
        report("стартовый код не проходит", "Все проверки пройдены" not in body)
        report("показана подсказка «Что сделать»", "Что сделать:" in body)
        files = REF[slug]
        if files.get("py"):  # урок Python: одна вкладка Python
            set_code(pg, "Python", files["py"])
        else:
            for f, code in files.items():
                if f in TABS:
                    set_code(pg, TABS[f], code)
        pg.wait_for_timeout(900); check(pg)
        body = pg.inner_text("body")
        report("эталон проходит", "Все проверки пройдены" in body)
        report("нет ложного сообщения о переходе", "попробовала перейти" not in body)
        report("показан тест «Проверь себя»", "Проверь себя" in body)

    # тест после урока: ошибка → объяснение, верный ответ → итог
    pg.goto(BASE + "/learn/kartochka"); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(500)
    quiz = pg.locator('section[aria-labelledby="quiz-title"]')
    quiz.get_by_role("button", name="Скругляет углы").click()
    report("неверный ответ объясняется", "Не совсем" in quiz.inner_text())
    quiz.get_by_role("button", name="Делает отступ внутри блока — от края до текста").click()
    quiz.get_by_role("button", name="padding: 20px;", exact=True).click()
    quiz.get_by_role("button", name=".card", exact=True).click()
    report("тест засчитан", "Тест пройден! С первой попытки: 2 из 3" in quiz.inner_text())

    # шпаргалка: нажатие на термин в тексте урока открывает карточку
    pg.locator("section[aria-label='Урок']").get_by_role("button", name="padding").first.click()
    drawer = pg.get_by_role("dialog", name="Шпаргалка")
    report("термин открывает шпаргалку", drawer.is_visible() and "Внутренний отступ" in drawer.inner_text())
    pg.keyboard.press("Escape")
    report("шпаргалка закрывается по Esc", pg.get_by_role("dialog").count() == 0)

    # контрольная точка: сломанный код заменяется рабочей версией прошлого урока
    pg.goto(BASE + "/learn/knopka"); pg.wait_for_selector(".cm-content")
    set_code(pg, "HTML", "<h1>сломано"); pg.wait_for_timeout(600)
    pg.get_by_role("button", name="Взять рабочую версию прошлого урока").click()
    pg.get_by_role("button", name="Заменить", exact=True).click(); pg.wait_for_timeout(600)
    html = editor_text(pg, "HTML")
    report("контрольная точка восстановила код", "Чем занимается Барсик" in html and 'id="like-button"' in html)

    pg.goto(BASE + "/shpargalka"); pg.wait_for_timeout(600)
    report("страница шпаргалки показывает все понятия", "Ещё" not in pg.inner_text("main") if pg.locator("main").count() else "появятся здесь" not in pg.inner_text("body"))
    print("ALL OK:", ok_all)
    b.close()
