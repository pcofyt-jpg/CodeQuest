"use client";

import { useEffect, useRef, useState } from "react";
import { isPreviewMessage, type PreviewMessage } from "@/lib/preview/buildDocument";

type Props = {
  html: string;
  token: string;
  title: string;
  onMessage: (msg: PreviewMessage) => void;
  onNavigationBlocked: () => void;
  className?: string;
};

/**
 * Окно результата. Код ребёнка выполняется только здесь.
 *
 * sandbox="allow-scripts" без allow-same-origin: у документа непрозрачный
 * origin, он не может читать DOM, cookies и хранилище приложения,
 * открывать окна, отправлять формы и управлять вкладкой.
 */
export function PreviewFrame({ html, token, title, onMessage, onNavigationBlocked, className }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const loadsRef = useRef(0);
  /** пришёл ли сигнал «загрузился» от документа ребёнка */
  const loadedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const restartsRef = useRef<number[]>([]);
  const [remountKey, setRemountKey] = useState(0);
  const [stuck, setStuck] = useState(false);
  const callbacks = useRef({ onMessage, onNavigationBlocked });

  useEffect(() => {
    callbacks.current = { onMessage, onNavigationBlocked };
  });

  useEffect(() => {
    loadsRef.current = 0;
    loadedRef.current = false;
    return () => window.clearTimeout(timerRef.current);
  }, [html, remountKey]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Принимаем сообщения только от своего фрейма и только текущей версии кода.
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!isPreviewMessage(event.data, token)) return;
      if (event.data.type === "loaded") {
        loadedRef.current = true;
        return;
      }
      callbacks.current.onMessage(event.data);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [token]);

  const restart = () => {
    // Возвращаем ребёнка к его странице, но не бесконечно —
    // иначе код, который сразу уходит, зациклит студию.
    const now = Date.now();
    restartsRef.current = [...restartsRef.current.filter((t) => now - t < 5000), now];
    callbacks.current.onNavigationBlocked();
    if (restartsRef.current.length > 3) {
      setStuck(true);
      return;
    }
    setRemountKey((k) => k + 1);
  };

  const handleLoad = () => {
    loadsRef.current += 1;
    // Чужая страница во фрейме видна по двум признакам:
    //  1) второй load для того же кода (переход после загрузки);
    //  2) load без сигнала «загрузился» от нашего документа (переход сразу,
    //     документ ребёнка так и не догрузился, загрузилась страница ошибки).
    // Сигнал приходит сообщением, поэтому даём ему немного времени дойти.
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (loadsRef.current > 1 || !loadedRef.current) restart();
    }, 250);
  };

  if (stuck) {
    return (
      <div className={`flex items-center justify-center p-6 text-center text-sm text-muted ${className ?? ""}`}>
        <p className="max-w-xs">
          Страница снова и снова пытается перейти по другому адресу, поэтому предпросмотр остановлен.
          Убери из кода переходы (location, ссылки) — и результат появится после следующего изменения.
        </p>
      </div>
    );
  }

  return (
    <iframe
      key={remountKey}
      ref={frameRef}
      title={title}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      srcDoc={html}
      onLoad={handleLoad}
      className={className}
    />
  );
}
