import type { Metadata } from "next";
import { PlacementPage } from "@/components/control/PlacementPage";

export const metadata: Metadata = { title: "Входная проверка — CodeQuest" };

export default function Page() {
  return <PlacementPage />;
}
