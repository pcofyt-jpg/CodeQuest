"""ИИ-наставник в студии — против имитации функции (e2e/README.md).

Студия должна быть собрана с NEXT_PUBLIC_AI_MENTOR_URL=адрес имитации, имитация — принимать код test-code-1.
Проверяет: код доступа, ответ, отказ по неверному коду, «что не так» после проверки, состав запроса.
"""
import json, os, sys, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright

MOCK = os.environ.get("MENTOR_MOCK", "http://127.0.0.1:3200/")
SLUGS = ["zagolovok","opisanie","cveta","kartochka","knopka","dizajn","oshibka","schetchik","svoya-versiya","moj-proekt"]
ok_all = True
def report(name, cond):
    global ok_all
    ok_all &= bool(cond)
    print(("  ok  " if cond else "  FAIL") + " " + name)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1440, "height": 900})
    unlock_until(pg, 6, SLUGS)
    pg.goto(BASE + "/learn/oshibka"); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(1200)
    console = pg.locator('section[aria-label="Консоль"]')
    console.get_by_role("button", name="Спросить наставника").first.click()
    report("без кода просит родителя ввести код", "Наставнику нужен код доступа" in console.inner_text())
    report("родителю объяснено, что передаётся", "получает только код урока и текст ошибки" in console.inner_text())

    console.get_by_label("Код доступа").fill("неверный-код"); console.get_by_role("button", name="Сохранить").click()
    pg.wait_for_timeout(800)
    report("неверный код: понятный отказ и снова форма", "Код доступа не подходит" in console.inner_text() and console.get_by_label("Код доступа").count() == 1)

    console.get_by_label("Код доступа").fill("Test-Code-1"); console.get_by_role("button", name="Сохранить").click()
    pg.wait_for_timeout(800)
    txt = console.inner_text()
    report("верный код: ответ наставника показан", "сравни id кнопки" in txt)
    report("подпись «ИИ может ошибаться» и остаток вопросов", "может ошибаться" in txt and "осталось: 7" in txt)

    # код запомнился: на другой ошибке форма не появляется
    pg.reload(); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(1200)
    console.get_by_role("button", name="Спросить наставника").first.click(); pg.wait_for_timeout(800)
    report("код запомнен — сразу ответ", "сравни id кнопки" in console.inner_text())

    # «что не так» после непройденной проверки
    check(pg)
    panel = pg.locator('section[aria-label="Урок"]')
    panel.get_by_role("button", name="Спросить наставника, что не так").click(); pg.wait_for_timeout(800)
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
