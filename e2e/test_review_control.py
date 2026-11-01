"""«Разбор решения», контрольная миссия, входная проверка, «Рекомендуем дальше»."""
import os, re, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright

C1 = ["zagolovok","opisanie","cveta","kartochka","naiti-element","knopka","dizajn","oshibka","schetchik","svoya-versiya","moj-proekt"]
PLACEMENT_RIGHT = ["</p>", "CSS", "h1 { color: tomato; }", ".card", "Отступ внутри элемента, от края до содержимого",
                   'Элемент с id="like"', "Каждый раз при нажатии на кнопку", "3", "Значение будет меняться", "Теги закрыты не в том порядке"]
ok_all = True
def report(name, cond):
    global ok_all
    ok_all &= bool(cond)
    print(("  ok  " if cond else "  FAIL") + " " + name)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.goto(BASE + "/"); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(600)
    body = pg.inner_text("body")
    report("новичку: приглашение на входную проверку", "Входная проверка" in body)
    report("на карте шаги маршрута и «Рекомендуем дальше»", "ШАГ 1" in body.upper() and "Рекомендуем дальше" in body)

    # «Разбор решения»: 3 неудачные проверки + все подсказки
    pg.goto(BASE + "/learn/zagolovok"); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(600)
    for _ in range(3): check(pg)
    lesson = pg.locator('section[aria-label="Урок"]')
    report("после трёх неудач без подсказок разбора ещё нет", "Разбор решения" not in lesson.inner_text())
    hint_btn = lesson.get_by_role("button", name=re.compile(r"подсказка \(осталось"))
    while hint_btn.count():
        hint_btn.first.click(); pg.wait_for_timeout(100)
    pg.wait_for_timeout(300)
    report("после подсказок появился «Разбор решения»", "Разбор решения" in lesson.inner_text())
    lesson.get_by_role("button", name="Открыть разбор").click(); pg.wait_for_timeout(200)
    report("разбор показывает недостающие строки и «почему так»", "Нет у тебя:" in lesson.inner_text() and "Почему так" in lesson.inner_text())

    # контрольная миссия: открыта после курса, 8 вопросов
    unlock_until(pg, 11, C1)
    pg.goto(BASE + "/kontrolnaya/?kurs=pervyj-sajt"); pg.wait_for_timeout(700)
    report("контрольная: 8 вопросов", "8 вопросов по всему курсу" in pg.inner_text("body"))
    pg.goto(BASE + "/kontrolnaya/?kurs=nastoyashchij-sajt"); pg.wait_for_timeout(500)
    report("контрольная закрыта, пока курс не пройден", "Контрольная пока закрыта" in pg.inner_text("body"))

    # входная проверка: правильные ответы → «Старт» и курс 1 засчитаны
    pg.goto(BASE + "/"); pg.evaluate("localStorage.clear()")
    pg.goto(BASE + "/proverka/"); pg.wait_for_timeout(700)
    for ans in PLACEMENT_RIGHT:
        pg.get_by_role("button", name=ans, exact=True).first.click(); pg.wait_for_timeout(80)
    pg.wait_for_timeout(300)
    report("проверка пройдена: 10 из 10", "10 из 10" in pg.inner_text("body") and "засчитаны" in pg.inner_text("body"))
    pg.goto(BASE + "/"); pg.wait_for_timeout(700)
    body = pg.inner_text("body")
    report("после проверки — следующий шаг: практикум «Пары тегов»", "Пары тегов" in body)
    pg.goto(BASE + "/sertifikat/?kurs=pervyj-sajt"); pg.wait_for_timeout(500)
    report("за засчитанный проверкой курс сертификата нет", "по входной проверке" in pg.inner_text("body"))
    print("ALL OK:", ok_all)
    b.close()
