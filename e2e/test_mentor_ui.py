"""ИИ-наставник в студии — против имитации функции (e2e/README.md).

Студия должна быть собрана с NEXT_PUBLIC_AI_MENTOR_URL=адрес имитации, имитация — принимать код test-code-1.
Проверяет: код доступа, ответ, отказ по неверному коду, «что не так» после проверки, состав запроса,
двойной и тройной клик по «Спросить наставника» (запроса без «Отправить» нет).
"""
import json, os, sys, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright

MOCK = os.environ.get("MENTOR_MOCK", "http://127.0.0.1:3200/")
SLUGS = ["zagolovok","opisanie","cveta","kartochka","naiti-element","knopka","dizajn","oshibka","schetchik","svoya-versiya","moj-proekt"]
ok_all = True
def report(name, cond):
    global ok_all
    ok_all &= bool(cond)
    print(("  ok  " if cond else "  FAIL") + " " + name)

def mock_len():
    return len(json.loads(urllib.request.urlopen(MOCK).read().decode()))

def burst_click(pg, locator, n, gap_ms):
    """n кликов в одну точку — центр кнопки «Спросить», как двойной клик мышью."""
    locator.scroll_into_view_if_needed()
    box = locator.bounding_box()
    if not box:
        return False
    x = box["x"] + box["width"] / 2
    y = box["y"] + box["height"] / 2
    for i in range(n):
        pg.mouse.click(x, y)
        if i + 1 < n and gap_ms:
            pg.wait_for_timeout(gap_ms)
    return True

def close_reminder(scope, pg):
    cancel = scope.get_by_role("button", name="Отмена")
    if cancel.count():
        cancel.first.click()
        pg.wait_for_timeout(80)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1440, "height": 900})
    unlock_until(pg, 7, SLUGS)
    pg.goto(BASE + "/learn/oshibka"); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(1200)
    console = pg.locator('section[aria-label="Консоль"]')
    console.get_by_role("button", name="Спросить наставника").first.click()
    parent = console.inner_text()
    report("без кода просит родителя ввести код", "Наставнику нужен код доступа" in parent)
    report(
        "родителю перечислено, что уходит",
        "весь код урока (все файлы)" in parent and "задание урока" in parent and "сообщения непройденных проверок или текст ошибки" in parent,
    )
    report(
        "нет ложных обещаний",
        "не сохраняет" not in parent and "не передаются" not in parent and "только код урока" not in parent,
    )

    console.get_by_label("Код доступа").fill("неверный-код"); console.get_by_role("button", name="Сохранить").click()
    pg.wait_for_timeout(300)
    report("после кода — напоминание, запроса ещё нет", "Наставник увидит весь твой код" in console.inner_text() and "Код доступа не подходит" not in console.inner_text())
    console.get_by_role("button", name="Отправить").click(); pg.wait_for_timeout(800)
    report("неверный код: понятный отказ и снова форма", "Код доступа не подходит" in console.inner_text() and console.get_by_label("Код доступа").count() == 1)

    console.get_by_label("Код доступа").fill("Test-Code-1"); console.get_by_role("button", name="Сохранить").click()
    pg.wait_for_timeout(300)
    report("перед отправкой напоминание", "Наставник увидит весь твой код" in console.inner_text())
    console.get_by_role("button", name="Отмена").click(); pg.wait_for_timeout(300)
    report("отмена не показывает ответ", "сравни id кнопки" not in console.inner_text())

    # Двойной и тройной клик не должны попадать в «Отправить».
    for width in (1440, 1280):
        pg.set_viewport_size({"width": width, "height": 900})
        pg.wait_for_timeout(200)
        for n in (2, 3):
            for gap in (0, 150, 300):
                before = mock_len()
                ask = console.get_by_role("button", name="Спросить наставника").first
                ok = burst_click(pg, ask, n, gap)
                pg.wait_for_timeout(700)
                report(f"консоль {width}px: {n} клика, пауза {gap} мс — запроса нет", ok and mock_len() == before)
                close_reminder(console, pg)

    pg.set_viewport_size({"width": 1440, "height": 900})
    console.get_by_role("button", name="Спросить наставника").first.click(); pg.wait_for_timeout(600)
    console.get_by_role("button", name="Отправить").click(); pg.wait_for_timeout(800)
    txt = console.inner_text()
    report("верный код: ответ наставника показан", "сравни id кнопки" in txt)
    report("подпись «ИИ может ошибаться» и остаток вопросов", "может ошибаться" in txt and "осталось: 7" in txt)

    # код запомнен: форма не появляется, но напоминание — каждый раз
    pg.reload(); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(1200)
    console.get_by_role("button", name="Спросить наставника").first.click(); pg.wait_for_timeout(300)
    report("код запомнен — сначала напоминание", "Наставник увидит весь твой код" in console.inner_text() and "Наставнику нужен код доступа" not in console.inner_text())
    console.get_by_role("button", name="Отправить").click(); pg.wait_for_timeout(800)
    report("код запомнен — ответ после «Отправить»", "сравни id кнопки" in console.inner_text())

    # «что не так» после непройденной проверки
    check(pg)
    panel = pg.locator('section[aria-label="Урок"]')
    ask_lesson = panel.get_by_role("button", name="Спросить наставника, что не так")
    ask_lesson.wait_for()
    for n in (2, 3):
        for gap in (0, 150, 300):
            before = mock_len()
            ok = burst_click(pg, ask_lesson, n, gap)
            pg.wait_for_timeout(700)
            report(f"урок: {n} клика, пауза {gap} мс — запроса нет", ok and mock_len() == before)
            close_reminder(panel, pg)
            ask_lesson = panel.get_by_role("button", name="Спросить наставника, что не так")
            ask_lesson.wait_for()

    ask_lesson.click(); pg.wait_for_timeout(600)
    report("напоминание и у непройденной проверки", "Наставник увидит весь твой код" in panel.inner_text())
    panel.get_by_role("button", name="Отправить").click(); pg.wait_for_timeout(800)
    report("«что не так» после проверки отвечает", "сравни id кнопки" in panel.inner_text())

    received = json.loads(urllib.request.urlopen(MOCK).read().decode())
    modes = [r["mode"] for r in received]
    report("запросы обоих режимов дошли", "explain-error" in modes and "check-help" in modes)
    report("«простой» запрос text/plain (без предварительного CORS)", all((r["ctype"] or "").startswith("text/plain") for r in received))
    allowed = {"code", "mode", "files", "lesson", "error", "failedChecks"}
    report("в запросе только нужные поля", all(set(r["keys"]) <= allowed for r in received))
    report("номер строки ошибки передан (строка 4)", any(r["error"] and r["error"].get("line") == 4 for r in received))
    print("ALL OK:", ok_all)
    b.close()
