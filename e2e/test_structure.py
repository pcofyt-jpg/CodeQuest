"""Помощник по структуре, «Студия проверит», подсветка пары тега (по наблюдениям пилота)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright

C1 = ["zagolovok","opisanie","cveta","kartochka","knopka","dizajn","oshibka","schetchik","svoya-versiya","moj-proekt"]
ok_all = True
def report(name, cond):
    global ok_all
    ok_all &= bool(cond)
    print(("  ok  " if cond else "  FAIL") + " " + name)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1440, "height": 900})
    unlock_until(pg, 10, C1)
    pg.goto(BASE + "/learn/para-tegov"); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(1200)
    con = pg.locator('section[aria-label="Консоль"]')
    t = con.inner_text()
    report("консоль: подсказка про пропущенную >", "Подсказка по HTML" in t and "нет закрывающей скобки" in t)
    report("консоль: незакрытый <p> со строкой", "не закрыт" in t)
    lesson = pg.locator('section[aria-label="Урок"]').inner_text()
    report("«Студия проверит:» видно до проверки", "Студия проверит:" in lesson and "На странице ровно два абзаца" in lesson)

    # подсветка пары: курсор в <h1> правильного кода
    set_code(pg, "HTML", "<h1>Мой питомец</h1>\n<div>\n  <p>текст\n</div>")
    pg.locator(".cm-content").click(); pg.keyboard.press("Control+Home"); pg.keyboard.press("ArrowRight"); pg.keyboard.press("ArrowRight")
    pg.wait_for_timeout(200)
    report("курсор на <h1>: подсвечены оба тега пары", pg.locator(".cm-tag-pair").count() == 2)
    pg.keyboard.press("Control+Home"); pg.keyboard.press("ArrowDown"); pg.keyboard.press("ArrowDown"); pg.keyboard.press("End")
    for _ in range(4): pg.keyboard.press("ArrowLeft")
    pg.keyboard.press("Home"); pg.keyboard.press("ArrowRight"); pg.keyboard.press("ArrowRight"); pg.keyboard.press("ArrowRight")
    pg.wait_for_timeout(200)
    report("курсор на незакрытом <p>: коралловая подсветка", pg.locator(".cm-tag-unpaired").count() == 1)

    # переход к строке CSS из подсказки
    unlock_until(pg, 13, C1 + ["para-tegov", "odin-main", "roditel-deti"])
    pg.goto(BASE + "/learn/id-ili-class"); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(1200)
    con = pg.locator('section[aria-label="Консоль"]')
    report("id/class перепутаны: подсказка «Для id пиши #note»", "Для id пиши #note" in con.inner_text())
    con.get_by_role("button", name="строка 6").first.click(); pg.wait_for_timeout(300)
    report("ссылка на строку открывает вкладку CSS", pg.get_by_role("tab", name="CSS").get_attribute("aria-selected") == "true")
    print("ALL OK:", ok_all)
    b.close()
