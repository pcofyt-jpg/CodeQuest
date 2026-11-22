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

def reminder_open(pg):
    dialog = pg.get_by_role("alertdialog")
    return dialog.count() == 1 and "Наставник увидит весь твой код" in dialog.inner_text()

def buttons_on_screen(pg):
    """Кнопки и само окно внутри visualViewport, верхний элемент в центре кнопки — она сама."""
    return pg.evaluate("""() => {
      const d = document.querySelector('[role="alertdialog"]');
      if (!d) return false;
      const vv = window.visualViewport;
      const vw = vv ? vv.width : window.innerWidth;
      const vh = vv ? vv.height : window.innerHeight;
      const ox = vv ? vv.offsetLeft : 0;
      const oy = vv ? vv.offsetTop : 0;
      const box = d.getBoundingClientRect();
      const dialogInside = box.left >= ox - 1 && box.top >= oy - 1 && box.right <= ox + vw + 1 && box.bottom <= oy + vh + 1;
      if (!dialogInside) return false;
      const buttons = [...d.querySelectorAll('button')];
      if (buttons.length !== 2) return false;
      return buttons.every((b) => {
        const r = b.getBoundingClientRect();
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        const inside = r.left >= ox - 1 && r.top >= oy - 1 && r.right <= ox + vw + 1 && r.bottom <= oy + vh + 1;
        return inside && r.width >= 44 && r.height >= 44 && !!top && (top === b || b.contains(top));
      });
    }""")

def scroll_snapshot(pg):
    return pg.evaluate("""() => {
      const inners = [];
      const walk = (el) => {
        if (!el || el.nodeType !== 1) return;
        const s = getComputedStyle(el);
        if (/(auto|scroll|hidden)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1)
          inners.push(Math.round(el.scrollTop));
        for (const c of el.children) walk(c);
      };
      walk(document.body);
      return { y: Math.round(window.scrollY), inners };
    }""")

def same_scroll(a, b):
    if a is None or b is None or abs(a["y"] - b["y"]) > 2:
        return False
    if len(a["inners"]) != len(b["inners"]):
        return False
    return all(abs(x - y) <= 2 for x, y in zip(a["inners"], b["inners"]))

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

def close_reminder(pg):
    if pg.get_by_role("alertdialog").count():
        pg.keyboard.press("Escape")
        pg.wait_for_timeout(60)

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
    report("после кода — напоминание, запроса ещё нет", reminder_open(pg) and "Код доступа не подходит" not in console.inner_text())
    pg.get_by_role("button", name="Отправить").click(); pg.wait_for_timeout(800)
    report("неверный код: понятный отказ и снова форма", "Код доступа не подходит" in console.inner_text() and console.get_by_label("Код доступа").count() == 1)

    console.get_by_label("Код доступа").fill("Test-Code-1"); console.get_by_role("button", name="Сохранить").click()
    pg.wait_for_timeout(300)
    report("перед отправкой напоминание", reminder_open(pg))
    pg.get_by_role("button", name="Отмена").click(); pg.wait_for_timeout(300)
    report("отмена не показывает ответ", "сравни id кнопки" not in console.inner_text())

    # Повторные клики и касания не закрывают окно, кнопки целиком на экране, окно не прыгает.
    VIEWPORTS = [(1280, 720), (1280, 800), (1366, 768), (1440, 900), (1920, 1080), (390, 844), (360, 800), (320, 568)]

    def check_burst(scope, button_name, width, height, n, gap, tab):
        pg.set_viewport_size({"width": width, "height": height})
        pg.wait_for_timeout(80)
        close_reminder(pg)
        if width < 1024:
            tab_btn = pg.locator('nav[aria-label="Разделы студии"] button', has_text=tab)
            if tab_btn.count() and tab_btn.get_attribute("aria-pressed") != "true":
                tab_btn.click(force=True)
        ask = scope.get_by_role("button", name=button_name).first
        ask.wait_for()
        before = mock_len()
        tap = width < 1024
        y0 = burst_at(pg, ask, n, gap, tap)
        kind = "касания" if tap else "клика"
        open_ok = (
            y0 is not None
            and reminder_open(pg)
            and buttons_on_screen(pg)
            and mock_len() == before
            and abs(scroll_y(pg) - y0) <= 2
        )
        report(f"{button_name} {width}x{height}: {n} {kind}, пауза {gap} — открыто, кнопки сверху, scrollY, 0 запросов", open_ok)
        close_reminder(pg)

    def check_scroll_lock(scope, button_name, width, height, tab):
        pg.set_viewport_size({"width": width, "height": height})
        pg.wait_for_timeout(80)
        close_reminder(pg)
        if width < 1024:
            tab_btn = pg.locator('nav[aria-label="Разделы студии"] button', has_text=tab)
            if tab_btn.count() and tab_btn.get_attribute("aria-pressed") != "true":
                tab_btn.click(force=True)
        ask = scope.get_by_role("button", name=button_name).first
        ask.wait_for()
        pg.evaluate("""() => {
          const walk = (el) => {
            if (!el || el.nodeType !== 1) return;
            const s = getComputedStyle(el);
            if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 40) el.scrollTop = 160;
            for (const c of el.children) walk(c);
          };
          walk(document.body);
        }""")
        ask.scroll_into_view_if_needed()
        pg.wait_for_timeout(40)
        before = scroll_snapshot(pg)
        ask.click()
        pg.wait_for_timeout(80)
        opened = scroll_snapshot(pg)
        pg.mouse.move(6, 6)
        pg.mouse.wheel(0, 900)
        pg.keyboard.press("PageDown")
        pg.keyboard.press("Space")
        pg.keyboard.press("End")
        pg.evaluate("""() => {
          document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: 800, bubbles: true, cancelable: true }));
          try { document.body.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true })); } catch (e) {}
        }""")
        pg.wait_for_timeout(40)
        during = scroll_snapshot(pg)
        close_reminder(pg)
        pg.wait_for_timeout(80)
        after = scroll_snapshot(pg)
        report(
            f"{button_name} {width}x{height}: прокрутка под окном не двигает и не прыгает",
            reminder_open(pg) is False and same_scroll(before, opened) and same_scroll(before, during) and same_scroll(before, after),
        )

    for width, height in VIEWPORTS:
        for n in (2, 3):
            for gap in (0, 150, 300, 600):
                check_burst(console, "Спросить наставника", width, height, n, gap, "Результат")

    check_scroll_lock(console, "Спросить наставника", 1280, 800, "Результат")
    check_scroll_lock(console, "Спросить наставника", 320, 568, "Результат")

    pg.set_viewport_size({"width": 1440, "height": 900})
    pg.wait_for_timeout(150)
    close_reminder(pg)
    y_esc = scroll_y(pg)
    console.get_by_role("button", name="Спросить наставника").first.click()
    pg.wait_for_timeout(100)
    report("Escape закрывает напоминание", reminder_open(pg))
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(100)
    report("Escape закрыл и не сдвинул scrollY", not reminder_open(pg) and abs(scroll_y(pg) - y_esc) <= 2)
    console.get_by_role("button", name="Спросить наставника").first.click(); pg.wait_for_timeout(600)
    pg.get_by_role("button", name="Отправить").click(); pg.wait_for_timeout(800)
    txt = console.inner_text()
    report("верный код: ответ наставника показан", "сравни id кнопки" in txt)
    report("подпись «ИИ может ошибаться» и остаток вопросов", "может ошибаться" in txt and "осталось: 7" in txt)

    # код запомнен: форма не появляется, но напоминание — каждый раз
    pg.reload(); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(1200)
    console.get_by_role("button", name="Спросить наставника").first.click(); pg.wait_for_timeout(300)
    report("код запомнен — сначала напоминание", reminder_open(pg) and "Наставнику нужен код доступа" not in console.inner_text())
    pg.get_by_role("button", name="Отправить").click(); pg.wait_for_timeout(800)
    report("код запомнен — ответ после «Отправить»", "сравни id кнопки" in console.inner_text())

    # «что не так» после непройденной проверки
    check(pg)
    panel = pg.locator('section[aria-label="Урок"]')
    ask_lesson = panel.get_by_role("button", name="Спросить наставника, что не так")
    ask_lesson.wait_for()
    for width, height in VIEWPORTS:
        for n in (2, 3):
            for gap in (0, 150, 300, 600):
                check_burst(panel, "Спросить наставника, что не так", width, height, n, gap, "Задание")

    check_scroll_lock(panel, "Спросить наставника, что не так", 1280, 800, "Задание")
    check_scroll_lock(panel, "Спросить наставника, что не так", 320, 568, "Задание")

    pg.set_viewport_size({"width": 1440, "height": 900})
    close_reminder(pg)
    ask_lesson = panel.get_by_role("button", name="Спросить наставника, что не так")
    ask_lesson.click(); pg.wait_for_timeout(600)
    report("напоминание и у непройденной проверки", reminder_open(pg))
    pg.get_by_role("button", name="Отправить").click(); pg.wait_for_timeout(800)
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
sys.exit(0 if ok_all else 1)
