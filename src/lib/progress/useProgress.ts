"use client";

import { useSyncExternalStore } from "react";
import { progressStore } from "./store";

/** Прогресс ученика; на сервере и при первой отрисовке — пустой. */
export function useProgress() {
  return useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
    progressStore.getServerSnapshot,
  );
}

const noopSubscribe = () => () => {};

/** true после гидрации — чтобы не показывать «закрытые» уроки до чтения прогресса. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
