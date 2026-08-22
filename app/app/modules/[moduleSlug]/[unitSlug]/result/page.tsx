'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { moduleBySlug } from '@/content/modules';
import { QuizResult } from '@/components/learning/QuizResult';
export default function Page({
  params,
}: {
  params: Promise<{ moduleSlug: string; unitSlug: string }>;
}) {
  const { moduleSlug, unitSlug } = use(params);
  const courseModule = moduleBySlug(moduleSlug);
  const unit = courseModule?.units.find((item) => item.day === unitSlug);
  if (!courseModule || !unit || unit.kind !== 'lesson') notFound();
  return <QuizResult module={courseModule} unit={unit} />;
}
