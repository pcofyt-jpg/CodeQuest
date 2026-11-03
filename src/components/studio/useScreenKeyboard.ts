"use client";

import { useEffect, useState } from "react";

/**
 * Открыта ли экранная клавиатура телефона и сколько места осталось над ней.
 *
 * Браузеры сообщают об этом по-разному (iOS уменьшает только visualViewport,
 * Android с interactive-widget=resizes-content уменьшает и сам экран страницы),
 * поэтому сравниваем видимую высоту с наибольшей высотой, которую видели при той же ширине:
 * если осталось меньше 75 %, значит, снизу клавиатура.
 */
export type ScreenKeyboard = { open: boolean; height: number; offsetTop: number };

const CLOSED: ScreenKeyboard = { open: false, height: 0, offsetTop: 0 };

export function useScreenKeyboard(): ScreenKeyboard {
  const [state, setState] = useState<ScreenKeyboard>(CLOSED);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let width = vv.width;
    let full = Math.max(vv.height, window.innerHeight);

    const update = () => {
      if (Math.abs(vv.width - width) > 40) {
        // Повернули телефон: запоминаем высоту заново.
        width = vv.width;
        full = vv.height;
      }
      full = Math.max(full, vv.height);
      const open = vv.height < full * 0.75;
      setState((s) =>
        open
          ? s.open && s.height === vv.height && s.offsetTop === vv.offsetTop
            ? s
            : { open, height: Math.round(vv.height), offsetTop: Math.round(vv.offsetTop) }
          : s.open
            ? CLOSED
            : s,
      );
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}
