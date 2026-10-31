"""«Разминка дня» на главной и живой образец в «Сверстай по образцу»."""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright

REF = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "content", "lessons", "references.json")))
ALL = list(REF)
ok_all = True
def report(name, cond):
    global ok_all
    ok_all &= bool(cond)
    print(("  ok  " if cond else "  FAIL") + " " + name)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.goto(BASE + "/"); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(600)
    report("новичку разминку не показываем", "Разминка дня" not in pg.inner_text("body"))
    START = ["kak-ustroen-sajt", "klaviatura", "tegi", "studiya"]
    unlock_until(pg, 4, START)
    pg.goto(BASE + "/"); pg.wait_for_timeout(800)
    block = pg.locator('section[aria-labelledby="practice-title"]')
    report("после пройденных уроков появилась «Разминка дня»", block.count() == 1 and "Разминка дня" in block.inner_text())
    report("у задания подпись, из какого урока", "из урока «" in block.inner_text())
    # проходим все задания разминки, подбирая ответы
    for _ in range(4):
        b_text = block.inner_text()
        if block.get_by_label("Напечатай здесь:").count():
            target = block.locator("pre").first.inner_text()
            block.get_by_label("Напечатай здесь:").fill(target); block.get_by_role("button", name="Проверить ответ").click()
        elif block.get_by_label("Пропущенный кусочек кода").count():
            hint_try = ["</p>", "</h1>", "<p>", "color", "px", ".card"]
            for t in hint_try:
                block.get_by_label("Пропущенный кусочек кода").fill(t); block.get_by_role("button", name="Проверить ответ").click()
                if "Верно!" in block.inner_text(): break
        elif block.locator('[aria-label="Строчки"]').count():
            break
        else:
            opts = block.locator("button.rounded-xl.border-2")
            for k in range(opts.count()):
                opts.nth(k).click()
                if "Верно!" in block.inner_text(): break
        if block.get_by_role("button", name="Дальше →").count(): block.get_by_role("button", name="Дальше →").click()
    pg.wait_for_timeout(300)
    done = "Разминка на сегодня" in pg.inner_text("body")
    print("     (разминка пройдена автоматически:", done, ")")

    # живой образец
    unlock_until(pg, ALL.index("o-vizitka"), ALL)
    pg.goto(BASE + "/learn/o-vizitka"); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(800)
    frame = pg.frame_locator('iframe[title="Образец страницы"]')
    report("в уроке виден живой образец", frame.locator(".vizitka h1").inner_text() == "Кью")
    report("у задачи блок «Почему так»", "Почему так:" in pg.locator('section[aria-label="Урок"]').inner_text())
    print("ALL OK:", ok_all)
    b.close()
