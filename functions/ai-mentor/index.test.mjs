import { afterEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { _resetCounters, buildMessages, cleanAnswer, handler } from "./index.js";

const CODE = "kot-raketa-123";
const env = {
  FOLDER_ID: "b1gtestfolder",
  ACCESS_CODES_SHA256: createHash("sha256").update(CODE).digest("hex"),
  ALLOWED_ORIGINS: "https://pcofyt-jpg.github.io,http://localhost:3000",
  DAILY_LIMIT: "2",
};
const ORIGIN = "https://pcofyt-jpg.github.io";
const context = { token: { access_token: "t1.test-iam-token" } };
const files = { html: "<button id='start-button'>Старт</button>", css: "", js: 'const b = document.querySelector("#start");\nb.addEventListener("click", f);' };
const body = (extra = {}) =>
  JSON.stringify({ code: CODE, mode: "explain-error", files, error: { message: "TypeError: Cannot read properties of null", line: 2 }, ...extra });
const event = (b, method = "POST", origin = ORIGIN) => ({ httpMethod: method, headers: { Origin: origin }, body: b });
const modelOk = (text = "Посмотри на строку 1: **id** не совпадает.") =>
  vi.fn(async () => ({ ok: true, json: async () => ({ result: { alternatives: [{ message: { role: "assistant", text } }], usage: { totalTokens: "900" } } }) }));

afterEach(() => _resetCounters());

describe("ИИ-наставник: функция", () => {
  it("отвечает на предварительный запрос CORS только своему сайту", async () => {
    const ok = await handler(event("", "OPTIONS"), context, { env });
    expect(ok.statusCode).toBe(204);
    expect(ok.headers["Access-Control-Allow-Origin"]).toBe(ORIGIN);
    const bad = await handler(event("", "OPTIONS", "https://evil.example"), context, { env });
    expect(bad.statusCode).toBe(403);
  });

  it("отклоняет чужой сайт, неверный код и неизвестный режим", async () => {
    const fetch = modelOk();
    expect((await handler(event(body(), "POST", "https://evil.example"), context, { env, fetch })).statusCode).toBe(403);
    expect((await handler(event(body({ code: "не-тот" })), context, { env, fetch })).statusCode).toBe(401);
    expect((await handler(event(body({ mode: "write-everything" })), context, { env, fetch })).statusCode).toBe(400);
    expect((await handler(event("{не json"), context, { env, fetch })).statusCode).toBe(400);
    expect((await handler(event("x".repeat(70_000)), context, { env, fetch })).statusCode).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("вызывает модель с токеном сервисного аккаунта и отключённым логированием", async () => {
    const fetch = modelOk();
    const res = await handler(event(body()), context, { env, fetch });
    expect(res.statusCode).toBe(200);
    expect(res.headers["Access-Control-Allow-Origin"]).toBe(ORIGIN);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://llm.api.cloud.yandex.net/foundationModels/v1/completion");
    expect(init.headers.Authorization).toBe("Bearer t1.test-iam-token");
    expect(init.headers["x-data-logging-enabled"]).toBe("false");
    expect(init.headers["x-folder-id"]).toBe("b1gtestfolder");
    const sent = JSON.parse(init.body);
    expect(sent.modelUri).toBe("gpt://b1gtestfolder/yandexgpt-lite/latest");
    expect(sent.messages[0].role).toBe("system");
    expect(sent.messages[1].text).toContain("1: const b");
    expect(sent.messages[1].text).not.toContain(CODE); // код доступа в модель не уходит
    const data = JSON.parse(res.body);
    expect(data.answer).toBe("Посмотри на строку 1: id не совпадает.");
    expect(data.left).toBe(1);
  });

  it("принимает тело в base64 и запрос «что не так» с проверками", async () => {
    const fetch = modelOk("Проверь id кнопки.");
    const b = body({ mode: "check-help", error: undefined, failedChecks: [{ message: "Кнопка меняет текст" }] });
    const res = await handler({ ...event(Buffer.from(b).toString("base64")), isBase64Encoded: true }, context, { env, fetch });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(fetch.mock.calls[0][1].body).messages[1].text).toContain("- Кнопка меняет текст");
  });

  it("соблюдает дневной лимит", async () => {
    const fetch = modelOk();
    await handler(event(body()), context, { env, fetch });
    await handler(event(body()), context, { env, fetch });
    const third = await handler(event(body()), context, { env, fetch });
    expect(third.statusCode).toBe(429);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("выбор модели работает только при ALLOW_MODEL_CHOICE=1", async () => {
    const fetch = modelOk();
    await handler(event(body({ model: "yandexgpt" })), context, { env, fetch });
    expect(JSON.parse(fetch.mock.calls[0][1].body).modelUri).toContain("/yandexgpt-lite/");
    await handler(event(body({ model: "yandexgpt" })), context, { env: { ...env, ALLOW_MODEL_CHOICE: "1" }, fetch });
    expect(JSON.parse(fetch.mock.calls[1][1].body).modelUri).toContain("/yandexgpt/latest");
  });

  it("понятно сообщает о сбоях модели и настройки", async () => {
    const down = vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }));
    expect((await handler(event(body()), context, { env, fetch: down })).statusCode).toBe(502);
    const empty = vi.fn(async () => ({ ok: true, json: async () => ({ result: { alternatives: [] } }) }));
    expect((await handler(event(body()), context, { env, fetch: empty })).statusCode).toBe(502);
    expect((await handler(event(body()), {}, { env, fetch: modelOk() })).statusCode).toBe(500); // нет сервисного аккаунта
    expect((await handler(event(body()), context, { env: { ...env, FOLDER_ID: "" }, fetch: modelOk() })).statusCode).toBe(500);
  });

  it("убирает разметку из ответа и собирает понятный запрос", () => {
    expect(cleanAnswer("### Совет\n**Важно**: проверь ```js\nid```")).toBe("Совет\nВажно: проверь id");
    const msgs = buildMessages({ mode: "explain-error", files, error: { message: "Ошибка", line: 2 }, lesson: { title: "Найди ошибку", goal: "Кнопка заработает" } });
    expect(msgs[1].text).toContain("Урок: Найди ошибку");
    expect(msgs[1].text).toContain("строка 2");
  });
});

describe("ИИ-наставник: диагностика настройки", () => {
  it("называет, какой настройки не хватает", async () => {
    const run = async (e) => JSON.parse((await handler(event(body()), context, { env: { ...env, ...e }, fetch: modelOk() })).body).error;
    expect(await run({ FOLDER_ID: "" })).toBe("config_folder_id");
    expect(await run({ ACCESS_CODES_SHA256: "" })).toBe("config_codes_missing");
    expect(await run({ ACCESS_CODES_SHA256: "kot-raketa-123" })).toBe("config_codes_not_hashes");
    expect(JSON.parse((await handler(event(body()), {}, { env, fetch: modelOk() })).body).error).toBe("config_service_account");
  });

  it("не выдаёт наружу подробности неожиданной ошибки", async () => {
    const brokenEnv = { ...env };
    Object.defineProperty(brokenEnv, "FOLDER_ID", { get() { throw new ReferenceError("b1gxxx is not defined"); } });
    const res = await handler(event(body()), context, { env: brokenEnv, fetch: modelOk() });
    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain("b1gxxx");
    expect(res.body).not.toContain("stack");
    expect(JSON.parse(res.body).error).toBe("internal");
    expect(res.headers["Access-Control-Allow-Origin"]).toBe(ORIGIN);
  });
});
