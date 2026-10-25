import { describe, expect, it } from "vitest";
import { isMentorUrl, normalizeMentorUrl } from "./client";

describe("адрес наставника", () => {
  it("прощает пробелы и кавычки вокруг скопированного адреса", () => {
    const raw = '  "https://functions.yandexcloud.net/d4eabc123"  ';
    expect(normalizeMentorUrl(raw)).toBe("https://functions.yandexcloud.net/d4eabc123");
    expect(isMentorUrl(normalizeMentorUrl(raw))).toBe(true);
  });

  it("не включает наставника по пустому или странному адресу", () => {
    expect(isMentorUrl(normalizeMentorUrl(undefined))).toBe(false);
    expect(isMentorUrl("functions.yandexcloud.net/d4e")).toBe(false);
    expect(isMentorUrl("http://example.com/x")).toBe(false);
    expect(isMentorUrl("https://x.net/a b")).toBe(false);
    expect(isMentorUrl("http://127.0.0.1:3200/")).toBe(true);
  });
});
