/**
 * Политика безопасности основного приложения.
 *
 * frame-src 'none' — главный барьер для предпросмотра: фрейм с кодом ребёнка
 * не сможет загрузить чужой сайт (проверено в Chromium, см. docs/adr/0001).
 * Сам srcdoc-предпросмотр этим правилом не блокируется.
 *
 * Важно: srcdoc-документ наследует CSP родителя. Поэтому script-src здесь
 * пока не задаём — строгий script-src основного приложения появится вместе
 * с отдельным доменом для выполнения проектов (docs/adr/0001).
 *
 * Политика задаётся и заголовком (сервер Next.js), и <meta> (GitHub Pages).
 * frame-ancestors в <meta> не работает, поэтому он только в заголовке.
 */
/**
 * connect-src: приложение ходит только на свой сайт и к ИИ-наставнику.
 * Это же ограничение наследует фоновый поток с Python (он создаётся из blob:),
 * поэтому код ребёнка на Python не может обращаться к другим сайтам.
 *
 * Файл без импортов: его читает next.config.ts, где сокращённые пути @/… не работают.
 */
function mentorOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_AI_MENTOR_URL ?? "").trim().replace(/^["'«]+|["'»]+$/g, "").trim();
  try {
    return raw ? new URL(raw).origin : "";
  } catch {
    return "";
  }
}

export const APP_CSP = [
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `connect-src 'self'${mentorOrigin() ? ` ${mentorOrigin()}` : ""}`,
].join("; ");
