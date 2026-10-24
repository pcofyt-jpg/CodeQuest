import type { NextConfig } from "next";
import { APP_CSP } from "./src/lib/security";

/**
 * Два режима сборки.
 *
 * Обычный (npm run dev / build / start): заголовки безопасности отдаёт сервер Next.js.
 *
 * Статический (STATIC_EXPORT=1, для GitHub Pages): все страницы собираются в папку out/.
 * GitHub Pages не позволяет задавать свои HTTP-заголовки, поэтому главная политика
 * (frame-src 'none' и др.) дублируется в <meta> в src/app/layout.tsx — она работает
 * в обоих режимах. Что теряется без заголовков — см. docs/DEPLOY.md.
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";

const securityHeaders = [
  { key: "Content-Security-Policy", value: `${APP_CSP}; frame-ancestors 'none'` },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), display-capture=()",
  },
];

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      // Сайт на GitHub Pages живёт по адресу вида https://имя.github.io/репозиторий/
      basePath: process.env.BASE_PATH || "",
      trailingSlash: true,
      poweredByHeader: false,
    }
  : {
      poweredByHeader: false,
      async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
      },
    };

export default nextConfig;
