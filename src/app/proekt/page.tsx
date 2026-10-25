import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectStudio } from "@/components/projects/ProjectStudio";

export const metadata: Metadata = { title: "Проект — CodeQuest" };

// Адрес проекта — /proekt/?id=…: страница одна и та же, проект выбирается в браузере.
// Так она работает и на статическом хостинге (GitHub Pages).
export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-dvh items-center justify-center text-muted">Открываю проект…</div>}>
      <ProjectStudio />
    </Suspense>
  );
}
