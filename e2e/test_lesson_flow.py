import sys, time; import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width":1440,"height":900})
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(BASE + "/"); pg.wait_for_timeout(800)
    pg.get_by_role("link", name="Начать первый урок").click()
    pg.wait_for_url("**/learn/zagolovok"); pg.wait_for_selector(".cm-content")
    # стартовый код не должен проходить проверку
    check(pg)
    print("starter fails:", "Почти получилось" in pg.inner_text("body"))
    set_code(pg, "HTML", "<h1>Мой сайт про котов</h1>")
    pg.wait_for_timeout(900)
    print("preview h1:", preview(pg).locator("h1").inner_text())
    check(pg)
    body = pg.inner_text("body")
    print("passed:", "Все проверки пройдены" in body, "| learned shown:", "Чему ты научился" in body)
    pg.get_by_role("link", name="Следующий урок: Описание под заголовком").last.click()
    pg.wait_for_url("**/learn/opisanie"); pg.wait_for_selector(".cm-content")
    print("lesson2 open:", "Описание под заголовком" in pg.inner_text("body"))
    # черновик сохраняется после перезагрузки
    set_code(pg, "HTML", "<h1>Космос</h1>\n<p>Черновик сохраняется сам</p>")
    pg.wait_for_timeout(1200); pg.reload(); pg.wait_for_selector(".cm-content")
    print("draft restored:", "Черновик сохраняется сам" in pg.locator(".cm-content").inner_text())
    # закрытый урок
    pg.goto(BASE + "/learn/schetchik"); pg.wait_for_timeout(500)
    print("locked screen:", "пока закрыт" in pg.inner_text("body"))
    print("page errors:", errs)
    b.close()
