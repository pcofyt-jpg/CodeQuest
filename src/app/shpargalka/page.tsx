import type { Metadata } from "next";
import { GlossaryPage } from "@/components/glossary/GlossaryPage";

export const metadata: Metadata = { title: "Шпаргалка — CodeQuest" };

export default function ShpargalkaPage() {
  return <GlossaryPage />;
}
