"use client";

import { useSyncExternalStore } from "react";
import { projectsStore } from "./store";

export function useProjects() {
  return useSyncExternalStore(projectsStore.subscribe, projectsStore.getSnapshot, projectsStore.getServerSnapshot);
}
