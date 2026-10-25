"use client";

import { useSyncExternalStore } from "react";

/** Код доступа к наставнику. Его вводит родитель; хранится только в этом браузере. */
const KEY = "codequest:mentor-code:v1";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export const mentorCode = {
  get: read,
  set(code: string) {
    try {
      window.localStorage.setItem(KEY, code.trim().toLowerCase().slice(0, 100));
    } catch {
      // не удалось сохранить — код придётся ввести снова
    }
    listeners.forEach((l) => l());
  },
  clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // ничего страшного
    }
    listeners.forEach((l) => l());
  },
};

export function useMentorCode(): string {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => "",
  );
}
