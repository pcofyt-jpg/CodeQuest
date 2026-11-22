"""ИИ-наставник в студии — против имитации функции (e2e/README.md).

Студия должна быть собрана с NEXT_PUBLIC_AI_MENTOR_URL=адрес имитации, имитация — принимать код test-code-1.
Проверяет: код доступа, ответ, отказ по неверному коду, «что не так» после проверки, состав запроса,
двойной и тройной клик и двойное касание: напоминание остаётся, прокрутка окна не прыгает, запроса нет.
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

def scroll_y(pg):
    return pg.evaluate("window.scrollY")

def reminder_open(scope):
    return scope.get_by_role("alertdialog").count() == 1 and "Наставник увидит весь твой код" in scope.inner_text()

def burst_at(pg, locator, n, gap_ms, tap=False):
    """n нажатий в центр кнопки «Спросить», без прокрутки между ними."""
    locator.scroll_into_view_if_needed()
    pg.wait_for_timeout(50)
    box = locator.bounding_box()
    if not box:
        return None
    x = box["x"] + box["width"] / 2
    y = box["y"] + box["height"] / 2
    y0 = scroll_y(pg)
    for i in range(n):
        if tap:
            pg.touchscreen.tap(x, y)
        else:
            pg.mouse.click(x, y)
        if i + 1 < n and gap_ms:
            pg.wait_for_timeout(gap_ms)
    pg.wait_for_timeout(80)
    return y0

def close_reminder(scope, pg):
    cancel = scope.get_by_role("button", name="Отмена")
    if cancel.count():
        cancel.first.click()
        pg.wait_for_timeout(80)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={"width": 1440, "height": 900}, has_touch=True).new_page()
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

    # Повторные клики не закрывают напоминание и не двигают окно.
    def check_burst(scope, button_name, width, height, n, gap, tap=False):
        pg.set_viewport_size({"width": width, "height": height})
        pg.wait_for_timeout(150)
        if width < 1024:
            tab = pg.locator('nav[aria-label="Разделы студии"] button', has_text="Результат")
            if tab.count():
                tab.click()
        close_reminder(scope, pg)
        ask = scope.get_by_role("button", name=button_name).first
        ask.wait_for()
        before = mock_len()
        y0 = burst_at(pg, ask, n, gap, tap)
        kind = "касания" if tap else "клика"
        open_ok = y0 is not None and reminder_open(scope) and mock_len() == before and abs(scroll_y(pg) - y0) <= 2
        report(f"{button_name} {width}px: {n} {kind}, пауза {gap} мс — открыто, без запроса, scrollY", open_ok)
        pg.wait_for_timeout(550)
        y_before_cancel = scroll_y(pg)
        close_reminder(scope, pg)
        report(
            f"{button_name} {width}px: {n} {kind} — «Отмена» после паузы, scrollY",
            y0 is not None
            and not reminder_open(scope)
            and abs(scroll_y(pg) - y_before_cancel) <= 2
            and abs(scroll_y(pg) - y0) <= 2,
        )

    for width in (1280, 1366, 1440, 1920):
        for n in (2, 3):
            for gap in (0, 150, 300):
                check_burst(console, "Спросить наставника", width, 900, n, gap)
    check_burst(console, "Спросить наставника", 390, 844, 2, 80, tap=True)

    pg.set_viewport_size({"width": 1440, "height": 900})
    pg.wait_for_timeout(200)
    close_reminder(console, pg)
    y_esc = scroll_y(pg)
    console.get_by_role("button", name="Спросить наставника").first.click()
    pg.wait_for_timeout(100)
    report("Escape закрывает напоминание", reminder_open(console))
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(100)
    report("Escape закрыл и не сдвинул scrollY", not reminder_open(console) and abs(scroll_y(pg) - y_esc) <= 2)
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
            check_burst(panel, "Спросить наставника, что не так", 1440, 900, n, gap)

    ask_lesson = panel.get_by_role("button", name="Спросить наставника, что не так")
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
