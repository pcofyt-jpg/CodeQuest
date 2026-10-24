import sys; import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from helpers import *
from playwright.sync_api import sync_playwright
CARD = ".card{background:white;padding:20px;border-radius:16px}"
SOL = {
 "zagolovok": {"HTML": "<h1>Мой сайт</h1>"},
 "opisanie": {"HTML": "<h1>Космос</h1>\n<p>Здесь я собираю факты о планетах.</p>"},
 "cveta": {"CSS": "body { background-color: midnightblue; color: white; }\nh1 { color: gold; }"},
 "kartochka": {"HTML": '<h1>Питомец</h1><div class="card"><h2>Барсик</h2><p>Кот</p></div>', "CSS": CARD},
 "knopka": {"JavaScript": 'const button = document.querySelector("#like-button");\nconst message = document.querySelector("#message");\nbutton.addEventListener("click", function () {\n  message.textContent = "Барсик доволен!";\n});'},
 "dizajn": {"CSS": "body{font-family:Verdana,sans-serif}\n" + CARD + "\n.card{box-shadow:0 8px 24px rgba(0,0,0,.15)}\nbutton{background-color:tomato;border-radius:8px}\nbutton:hover{background-color:gold}"},
 "oshibka": {"JavaScript": 'const button = document.querySelector("#start-button");\nconst statusText = document.querySelector("#status");\nbutton.addEventListener("click", function () {\n  statusText.textContent = "Поехали!";\n});'},
 "schetchik": {"JavaScript": 'let count = 0;\nconst countText = document.querySelector("#count");\nconst plusButton = document.querySelector("#plus");\nplusButton.addEventListener("click", function () {\n  count = count + 1;\n  countText.textContent = count;\n});'},
 "svoya-versiya": {"HTML": '<div class="card"><h1>Факты о животных</h1><p id="fact">Жми</p><button id="next-fact">Ещё</button></div>',
   "CSS": "button { background-color: seagreen; color: white; }",
   "JavaScript": 'const facts = ["А","Б","В","Г","Д"];\nconst factText = document.querySelector("#fact");\nconst button = document.querySelector("#next-fact");\nbutton.addEventListener("click", function () {\n  factText.textContent = facts[Math.floor(Math.random() * facts.length)];\n});'},
 "moj-proekt": {"HTML": '<h1>Магический шар</h1><p id="answer">Задай вопрос</p><button id="ask">Спросить</button>',
   "CSS": "body{font-family:sans-serif}\nh1{color:navy}\nbutton{padding:10px}",
   "JavaScript": 'const a = ["Да","Нет"];\ndocument.querySelector("#ask").addEventListener("click", function () {\n  document.querySelector("#answer").textContent = a[Math.floor(Math.random()*2)];\n});'},
}
SLUGS = list(SOL)
ok_all = True
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width":1440,"height":900})
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    unlock_until(pg, 9, SLUGS)
    for slug, sol in SOL.items():
        pg.goto(BASE + "/learn/" + slug); pg.wait_for_selector(".cm-content"); pg.wait_for_timeout(600)
        check(pg); starter_fail = "Все проверки пройдены" not in pg.inner_text("body")
        for tab, code in sol.items(): set_code(pg, tab, code)
        pg.wait_for_timeout(900); check(pg)
        body = pg.inner_text("body")
        passed = "Все проверки пройдены" in body
        false_nav = "попробовала перейти" in body
        good = starter_fail and passed and not false_nav
        ok_all &= good
        print(f"{slug:15} starter_fails={starter_fail} solution_passes={passed} false_nav={false_nav}")
        if not passed: print(body[body.find("Почти"):][:400])
    print("ALL OK:", ok_all, "| page errors:", errs)
    b.close()
