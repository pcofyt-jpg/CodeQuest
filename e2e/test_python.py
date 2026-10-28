"""Студия Python: робот, запуск, бесконечный цикл, ввод, объяснение ошибки, закрытая сеть."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright

PY = ["robot-start", "robot-marshrut", "robot-cikl", "py-print", "py-peremennye", "py-input", "py-esli", "py-ugadaj"]
ok_all = True
def report(name, cond):
    global ok_all
    ok_all &= bool(cond)
    print(("  ok  " if cond else "  FAIL") + " " + name)

def run_btn(pg):
    pg.get_by_role("button", name="▶ Запустить").click()
    pg.wait_for_function("() => !document.body.innerText.includes('Выполняю…')", timeout=30000)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1440, "height": 900})
    fails = []; pg.on("requestfailed", lambda r: fails.append((r.url, r.failure)) if "example.com" in r.url else None)
    pg.goto(BASE + "/"); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(500)
    report("раздел Python на главной открыт сразу", "PYTHON: ПЕРВЫЕ ШАГИ" in pg.inner_text("body").upper()
           and pg.get_by_role("link", name="Робот Кью: первые команды").count() == 1)

    pg.goto(BASE + "/learn/robot-start"); pg.wait_for_selector(".cm-content")
    report("одна вкладка Python и реплика Кью", pg.get_by_role("tab", name="Python").count() == 1
           and pg.get_by_role("tab", name="HTML").count() == 0 and "Кью:" in pg.inner_text("body"))
    report("поле робота нарисовано", pg.get_by_role("img", name="Поле робота: робот в пути").count() == 1)
    t0 = time.time(); run_btn(pg); pg.wait_for_timeout(800)
    print("     первый запуск (с загрузкой Python): %.1f с" % (time.time() - t0))
    report("стартовый код: робот не дошёл", "не дошёл до флажка" in pg.inner_text("body"))
    set_code(pg, "Python", "for i in range(5):\n    robot.right()\n")
    run_btn(pg); pg.wait_for_timeout(2200)
    report("цикл: робот у флажка и собрал кристаллы", "Робот у флажка и собрал все кристаллы!" in pg.inner_text("body"))
    check(pg); report("проверка урока пройдена", "Все проверки пройдены" in pg.inner_text("body"))

    set_code(pg, "Python", "robot.right()\nrobot.right()\nrobot.up()\n")
    run_btn(pg); pg.wait_for_timeout(1500)
    con = pg.locator('section[aria-label="Консоль"]').inner_text()
    report("робот врезался: объяснение и строка 3", "врезался в стену" in con and "строка 3" in con)

    # бесконечный цикл: страница отвечает, программа остановлена, потом снова работает
    unlock_until(pg, 3, PY); pg.goto(BASE + "/learn/py-print"); pg.wait_for_selector(".cm-content")
    set_code(pg, "Python", "while True:\n    pass\n")
    pg.get_by_role("button", name="▶ Запустить").click(); pg.wait_for_timeout(800)
    t = time.time(); pg.evaluate("1 + 1"); lag = time.time() - t
    report("во время вечного цикла страница отвечает (%.3f с)" % lag, lag < 0.2)
    pg.wait_for_function("() => document.body.innerText.includes('дольше 5 секунд')", timeout=15000)
    report("вечный цикл остановлен с объяснением", True)
    set_code(pg, "Python", 'print("снова работаю", 6 * 7)\n'); run_btn(pg); pg.wait_for_timeout(300)
    report("после остановки Python снова работает", "снова работаю 42" in pg.locator('section[aria-label="Консоль"]').inner_text())

    set_code(pg, "Python", 'pritn("Привет")\n'); run_btn(pg); pg.wait_for_timeout(300)
    report("опечатка: «Может быть, ты имел в виду print?»", "Может быть, ты имел в виду print?" in pg.inner_text("body"))

    # сеть из Python закрыта: запрос не должен дойти до нашего «чужого» сервера
    LEAK = "/tmp/leak/hits.txt"
    if os.path.exists(LEAK): os.remove(LEAK)
    set_code(pg, "Python", 'import pyodide.code\npyodide.code.run_js("fetch(\'http://127.0.0.1:3399/leak\').catch(() => 0)")\nprint("ок")\n')
    run_btn(pg); pg.wait_for_timeout(2000)
    leaked = os.path.exists(LEAK) and "/leak" in open(LEAK).read()
    report("код на Python не может обратиться к другому сайту", not leaked and "ок" in pg.locator('section[aria-label="Консоль"]').inner_text())

    # ввод
    unlock_until(pg, 5, PY); pg.goto(BASE + "/learn/py-input"); pg.wait_for_selector(".cm-content")
    report("поле ввода есть и заполнено примером", pg.get_by_label("Ввод для программы — по строке на каждый input()").input_value() == "кот\n7")
    run_btn(pg); pg.wait_for_timeout(300)
    out = pg.locator('section[aria-label="Консоль"]').inner_text()
    report("ввод показан в выводе как в консоли", "Какое животное тебе нравится? кот" in out)
    print("ALL OK:", ok_all)
    b.close()
