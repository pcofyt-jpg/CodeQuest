import sys, time; import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width":1440,"height":900})
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(BASE + "/"); pg.wait_for_timeout(800)
    pg.get_by_role("link", name="Начать первый урок").click()
    pg.wait_for_url("**/learn/kak-ustroen-sajt**"); pg.wait_for_selector(".cm-content")
    # стартовый код не должен проходить проверку
    check(pg)
    ok_all = "Почти получилось" in pg.inner_text("body")
    print("starter fails:", ok_all)
    set_code(pg, "HTML", "<h1>Мой сайт про котов</h1>")
    pg.wait_for_timeout(900)
    print("preview h1:", preview(pg).locator("h1").inner_text())
    check(pg)
    body = pg.inner_text("body")
    passed = "Все проверки пройдены" in body and "Чему ты научился" in body
    ok_all = ok_all and passed
    print("passed:", "Все проверки пройдены" in body, "| learned shown:", "Чему ты научился" in body)
    pg.get_by_role("link", name="Следующий урок: Клавиатура программиста").last.click()
    pg.wait_for_url("**/learn/klaviatura**"); pg.wait_for_selector(".cm-content")
    lesson2 = "Клавиатура программиста" in pg.inner_text("body")
    ok_all = ok_all and lesson2
    print("lesson2 open:", lesson2)
    # черновик сохраняется после перезагрузки
    set_code(pg, "HTML", "<h1>Космос</h1>\n<p>Черновик сохраняется сам</p>")
    pg.wait_for_timeout(1200); pg.reload(); pg.wait_for_selector(".cm-content")
    draft = "Черновик сохраняется сам" in pg.locator(".cm-content").inner_text()
    ok_all = ok_all and draft
    print("draft restored:", draft)
    # закрытый урок
    pg.goto(BASE + "/learn/schetchik"); pg.wait_for_timeout(500)
    locked = "пока закрыт" in pg.inner_text("body")
    ok_all = ok_all and locked and errs == []
    print("locked screen:", locked)
    print("page errors:", errs)
    b.close()
sys.exit(0 if ok_all else 1)
