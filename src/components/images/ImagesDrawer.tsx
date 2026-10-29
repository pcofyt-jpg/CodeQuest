"use client";

import { useEffect, useRef, useState } from "react";
import { imageDataUri, imagePath, images } from "@/content/images";

/** Библиотека картинок: выбрать картинку и скопировать её код. */
export function ImagesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copy = async (name: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(name);
    } catch {
      setCopied(null);
      window.prompt("Скопируй код (Ctrl+C):", code);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Закрыть библиотеку картинок" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="images-title"
        className="relative flex h-full w-full max-w-md flex-col bg-paper pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-3">
          <h2 id="images-title" className="text-xl font-bold">
            Картинки
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 font-semibold text-route hover:bg-route-soft"
          >
            Закрыть
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[15px] leading-relaxed">
            Выбери картинку, нажми «Скопировать код» и вставь его во вкладку HTML. Поменяй alt на своё описание.
            Картинки из интернета в студии не показываются — так безопаснее.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {images.map((img) => {
              const code = `<img src="${imagePath(img.name)}" alt="${img.title}">`;
              return (
                <li key={img.name} className="flex flex-col items-center rounded-xl border border-line bg-surface p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- встроенная SVG-картинка, оптимизация не нужна */}
                  <img src={imageDataUri(img)} alt="" width={72} height={72} />
                  <p className="mt-1 font-semibold">{img.title}</p>
                  <code className="mt-1 text-center font-mono text-[11px] break-all text-muted">{imagePath(img.name)}</code>
                  <button
                    type="button"
                    onClick={() => copy(img.name, code)}
                    aria-label={`Скопировать код картинки «${img.title}»`}
                    className="mt-2 w-full rounded-lg bg-route px-2 py-1.5 text-sm font-semibold text-on-accent"
                  >
                    {copied === img.name ? "Скопировано!" : "Скопировать код"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
