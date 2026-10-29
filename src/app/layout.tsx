import type { Metadata, Viewport } from "next";
import "@fontsource-variable/rubik";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { APP_CSP } from "@/lib/security";

export const metadata: Metadata = {
  title: "CodeQuest — учимся делать сайты",
  description: "Учебная студия: дети 9–12 лет создают сайты и мини-игры на HTML, CSS и JavaScript.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#11122b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/* Работает и без заголовков сервера (GitHub Pages). См. src/lib/security.ts */}
        <meta httpEquiv="Content-Security-Policy" content={APP_CSP} />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
