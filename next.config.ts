import type { NextConfig } from "next";

/**
 * Заголовки безопасности основного приложения.
 *
 * frame-src 'none' — главный барьер для предпросмотра: фрейм с кодом ребёнка
 * не сможет перейти на внешний сайт (проверено в Chromium, см. docs/adr/0001).
 * Сам srcdoc-предпросмотр этим правилом не блокируется.
 *
 * Важно: srcdoc-документ наследует CSP родителя. Поэтому script-src здесь
 * пока не задаём — строгий script-src основного приложения появится вместе
 * с отдельным доменом для выполнения проектов (этап 2, docs/adr/0001).
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), display-capture=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
