import type { Metadata, Viewport } from "next";
import "@fontsource-variable/onest";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeQuest — учимся делать сайты",
  description: "Учебная студия: дети 9–12 лет создают сайты и мини-игры на HTML, CSS и JavaScript.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f6fb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
