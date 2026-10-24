import os
import time
BASE = os.environ.get("BASE_URL", "http://localhost:3000")

def set_code(pg, tab, text):
    pg.get_by_role("tab", name=tab, exact=True).click()
    content = pg.locator(".cm-content")
    content.click()
    pg.keyboard.press("Control+A")
    pg.keyboard.press("Delete")
    pg.keyboard.insert_text(text)

def preview(pg):
    return pg.frame_locator('iframe[title^="Результат"]')

def check(pg):
    pg.get_by_role("button", name="Проверить").click()
    pg.wait_for_function("() => !document.body.innerText.includes('Проверяю…')", timeout=10000)
    time.sleep(0.2)

def unlock_until(pg, n_completed, slugs):
    pg.goto(BASE + "/")
    pg.evaluate("""(s) => localStorage.setItem('codequest:progress:v1', JSON.stringify({version:1, completed:s, drafts:{}}))""", slugs[:n_completed])
