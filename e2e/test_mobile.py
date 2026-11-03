"""Студия на телефоне: задание над кодом, «Проверить» на вкладке кода, строка символов при открытой клавиатуре.

Клавиатуру имитируем уменьшением высоты окна: студия считает её открытой,
когда видимая высота меньше 75 % наибольшей.
"""
from playwright.sync_api import sync_playwright
from helpers import BASE

SLUG = "kak-ustroen-sajt"
results = []


def ok(name, cond):
    results.append(cond)
    print(("  ok   " if cond else "  FAIL ") + name)


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 375, "height": 740}, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto(BASE + "/"); pg.evaluate("localStorage.clear()")
    pg.goto(BASE + "/learn/" + SLUG); pg.wait_for_selector(".cm-content", state="attached")
    nav = pg.get_by_role("navigation", name="Разделы студии")

    ok("на вкладке «Задание» в нижней панели нет второй кнопки «Проверить»",
       nav.get_by_role("button", name="Проверить").count() == 0)

    nav.get_by_role("button", name="Код").click()
    strip = pg.locator("section[aria-label='Редактор кода'] button[aria-expanded]")
    ok("над кодом есть свёрнутое задание", strip.is_visible() and strip.get_attribute("aria-expanded") == "false")
    strip.click()
    ok("задание разворачивается и показывает, что проверит студия",
       pg.locator("section[aria-label='Редактор кода']").get_by_text("Студия проверит:").is_visible())
    strip.click()
    ok("на вкладке «Код» есть «Проверить»", nav.get_by_role("button", name="Проверить").is_visible())

    pg.locator(".cm-content").click()
    pg.keyboard.press("Control+End")
    pg.set_viewport_size({"width": 375, "height": 400}); pg.wait_for_timeout(500)
    bar = pg.get_by_role("toolbar", name="Символы для кода")
    ok("с клавиатурой появляется строка символов", bar.is_visible())
    ok("с клавиатурой нижние вкладки спрятаны", not nav.is_visible())
    ok("с клавиатурой задание над кодом спрятано", strip.count() == 0)

    before = pg.evaluate("document.querySelector('.cm-content').innerText")
    bar.get_by_role("button", name="<", exact=True).click()
    bar.get_by_role("button", name=">", exact=True).click()
    after = pg.evaluate("document.querySelector('.cm-content').innerText")
    ok("символы вставляются в код", after.rstrip().endswith("<>") and len(after) > len(before))
    ok("после нажатия символа фокус остаётся в редакторе",
       pg.evaluate("!!document.activeElement.closest('.cm-editor')"))

    pg.set_viewport_size({"width": 375, "height": 740}); pg.wait_for_timeout(500)
    ok("клавиатура закрыта — вкладки вернулись", nav.is_visible() and not bar.is_visible())

    nav.get_by_role("button", name="Проверить").click()
    pg.wait_for_selector("#results-title", timeout=10000)
    pg.wait_for_timeout(800)  # плавная прокрутка к итогу
    top = pg.evaluate("document.getElementById('results-title').getBoundingClientRect().top")
    ok("после проверки открыто задание, итог виден на экране", 0 <= top < 740)

    ok("нет ошибок страницы", errors == [])
    b.close()

print("ALL OK:", all(results))
raise SystemExit(0 if all(results) else 1)
