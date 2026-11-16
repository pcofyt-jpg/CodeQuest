import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CERTIFICATE_NAME_COPY, MENTOR_PARENT_COPY, MENTOR_REMINDER_COPY } from "./pendingOwnerCopy";

const mentorSources = [
  "src/content/pendingOwnerCopy.ts",
  "src/components/mentor/MentorBox.tsx",
].map((path) => readFileSync(path, "utf8"));

describe("тексты CQ-025, CQ-028 и CQ-026", () => {
  it("родительский текст перечисляет, что уходит, и не обещает лишнего", () => {
    expect(MENTOR_PARENT_COPY.lead).toContain("Чтобы ответить, он получает:");
    expect(MENTOR_PARENT_COPY.items).toEqual([
      "весь код урока (все файлы);",
      "задание урока;",
      "сообщения непройденных проверок или текст ошибки.",
    ]);
    expect(MENTOR_PARENT_COPY.tail).toContain("Ещё отправляется код доступа.");

    const blob = mentorSources.join("\n");
    for (const phrase of [
      "не сохраняет",
      "не передаются",
      "получает только код урока и текст ошибки",
      "152-ФЗ",
      "по закону",
      "соответствует",
      "гарантир",
      "сертифицир",
    ]) {
      expect(blob, phrase).not.toContain(phrase);
    }
  });

  it("напоминание и кнопки — формулировки редактора", () => {
    expect(MENTOR_REMINDER_COPY).toEqual({
      text: "Наставник увидит весь твой код. Проверь, что в нём нет твоего имени, адреса и телефона.",
      send: "Отправить",
      cancel: "Отмена",
    });
  });

  it("сертификат: ник, стирание имени и совет, которого нет в старом примере", () => {
    expect(CERTIFICATE_NAME_COPY).toEqual({
      placeholder: "Например, Капитан Код",
      nickHint: "Придумай ник вместо настоящего имени.",
      clearName: "Стереть имя",
      printAdvice: "Не выкладывай в интернет сертификат с настоящим именем — лучше впиши ник.",
    });
    const page = readFileSync("src/components/certificate/CertificatePage.tsx", "utf8");
    expect(page).not.toContain("Например, Миша");
    expect(page).toContain("print:hidden");
    expect(page).toContain("CERTIFICATE_NAME_COPY.printAdvice");
    expect(page).toContain('removeItem(NAME_KEY)');
    expect(page).not.toContain("localStorage.clear");
  });
});
