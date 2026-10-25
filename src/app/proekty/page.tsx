import type { Metadata } from "next";
import { ProjectsPage } from "@/components/projects/ProjectsPage";

export const metadata: Metadata = { title: "Мои проекты — CodeQuest" };

export default function Page() {
  return <ProjectsPage />;
}
