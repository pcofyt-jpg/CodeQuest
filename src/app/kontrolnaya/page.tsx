import type { Metadata } from "next";
import { Suspense } from "react";
import { ControlPage } from "@/components/control/ControlPage";

export const metadata: Metadata = { title: "Контрольная миссия — CodeQuest" };

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-muted">Открываю контрольную миссию…</div>}>
      <ControlPage />
    </Suspense>
  );
}
