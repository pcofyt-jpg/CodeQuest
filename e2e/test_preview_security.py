import sys, time; import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright
SLUGS = ["zagolovok","opisanie","cveta","kartochka","knopka","dizajn","oshibka","schetchik","svoya-versiya","moj-proekt"]
ATTACK = r'''
const r = [];
try { r.push("parentDOM:" + parent.document.title); } catch (e) { r.push("parentDOM:blocked"); }
try { r.push("ls:" + localStorage.getItem("codequest:progress:v1")); } catch (e) { r.push("ls:blocked"); }
try { r.push("cookie:" + document.cookie); } catch (e) { r.push("cookie:blocked"); }
try { const w = window.open("https://example.com"); r.push("popup:" + (w ? "opened" : "blocked")); } catch (e) { r.push("popup:blocked"); }
try { top.location.href = "https://example.com"; r.push("topnav:done"); } catch (e) { r.push("topnav:blocked"); }
fetch("https://example.com").then(() => console.log("fetch:ok")).catch(() => console.log("fetch:blocked"));
const img = new Image(); img.onerror = () => console.log("img:blocked"); img.onload = () => console.log("img:loaded"); img.src = "https://example.com/x.png";
console.log(r.join(" | "));
'''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width":1440,"height":900})
    reqs=[]; pg.on("request", lambda r: reqs.append(r.url) if "example.com" in r.url else None)
    unlock_until(pg, 9, SLUGS)
    pg.goto(BASE + "/learn/moj-proekt"); pg.wait_for_selector(".cm-content")
    set_code(pg, "JavaScript", ATTACK); pg.wait_for_timeout(2000)
    cons = pg.locator('section[aria-label="Консоль"]').inner_text()
    print("CONSOLE:\n", cons)
    print("app still on page:", pg.url)
    print("requests to example.com:", reqs)

    # бесконечный цикл: приложение должно оставаться отзывчивым
    set_code(pg, "JavaScript", "let n = 0;\nwhile (true) {\n  n++;\n}\n")
    pg.wait_for_timeout(700)
    t = time.time(); pg.evaluate("1"); t1 = time.time()-t
    pg.wait_for_timeout(1500)
    t = time.time(); pg.evaluate("1"); t2 = time.time()-t
    cons = pg.locator('section[aria-label="Консоль"]').inner_text()
    print("eval latency during/after loop: %.2fs / %.2fs" % (t1, t2))
    print("loop message:", "Цикл работал дольше секунды" in cons, "| line link:", "строка 2" in cons)

    # уход фрейма на другой адрес
    set_code(pg, "JavaScript", 'setTimeout(() => { location.href = "https://example.com"; }, 200);')
    pg.wait_for_timeout(2500)
    cons = pg.locator('section[aria-label="Консоль"]').inner_text()
    print("nav blocked msg:", "попробовала перейти" in cons)
    # постоянный уход -> предпросмотр останавливается, а не зацикливается
    set_code(pg, "JavaScript", 'location.href = "https://example.com";')
    pg.wait_for_timeout(4000)
    print("stuck notice:", "снова и снова" in pg.inner_text("body"))
    print("requests to example.com total:", len(reqs))
    b.close()
