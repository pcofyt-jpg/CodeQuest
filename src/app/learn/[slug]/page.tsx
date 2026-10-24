import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLesson, lessons } from "@/content/lessons/catalog";
import { Studio } from "@/components/studio/Studio";

export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  return { title: lesson ? `Урок ${lesson.number}. ${lesson.title} — CodeQuest` : "CodeQuest" };
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  if (!getLesson(slug)) notFound();
  return <Studio slug={slug} />;
}
