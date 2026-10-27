import type { Metadata } from "next";
import { Suspense } from "react";
import { CertificatePage } from "@/components/certificate/CertificatePage";

export const metadata: Metadata = { title: "Сертификат — CodeQuest" };

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-muted">Открываю сертификат…</div>}>
      <CertificatePage />
    </Suspense>
  );
}
