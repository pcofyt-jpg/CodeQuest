"""Библиотека картинок: панель, копирование кода, картинка видна в предпросмотре."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright

ok_all = True
def report(name, cond):
    global ok_all
    ok_all &= bool(cond)
    print(("  ok  " if cond else "  FAIL") + " " + name)

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 1440, "height": 900})
    ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=BASE.split("/", 3)[0] + "//" + BASE.split("/", 3)[2])
    pg = ctx.new_page()
    pg.goto(BASE + "/"); pg.evaluate("localStorage.clear()")
    pg.goto(BASE + "/proekty/"); pg.wait_for_selector('section[aria-label="Список проектов"]:not(.opacity-0)')
    pg.get_by_role("button", name="Новый проект").click(); pg.wait_for_selector(".cm-content")
    pg.get_by_role("button", name="Картинки", exact=True).click()
    drawer = pg.get_by_role("dialog", name="Картинки")
    report("панель открылась, в ней 12 картинок", drawer.is_visible() and drawer.locator("li").count() == 12)
    drawer.get_by_role("button", name="Скопировать код картинки «Ракета»").click(); pg.wait_for_timeout(200)
    code = pg.evaluate("navigator.clipboard.readText()")
    report("скопирован короткий код картинки", code == '<img src="kartinki/raketa.svg" alt="Ракета">')
    report("кнопка подтвердила копирование", drawer.get_by_role("button", name="Скопировать код картинки «Ракета»").inner_text() == "Скопировано!")
    pg.keyboard.press("Escape")
    set_code(pg, "HTML", "<h1>Космос</h1>\n" + code)
    pg.wait_for_timeout(1200)
    w = pg.frame_locator('iframe[title^="Результат"]').locator("img").evaluate("img => img.naturalWidth")
    report("картинка видна в предпросмотре", w == 120)
    with pg.expect_download() as dl:
        pg.get_by_role("button", name="Скачать сайт").click()
    html = open(dl.value.path(), encoding="utf-8").read()
    report("в скачанный сайт картинка встроена", "data:image/svg+xml;base64," in html and "kartinki/" not in html)
    print("ALL OK:", ok_all)
    b.close()
