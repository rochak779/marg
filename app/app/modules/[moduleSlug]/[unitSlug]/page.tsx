'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { moduleBySlug } from '@/content/modules';
import { LessonView } from '@/components/learning/LessonView';
import { BuildView } from '@/components/learning/BuildView';
import { PracticeView } from '@/components/learning/PracticeView';
export default function Page({
  params,
}: {
  params: Promise<{ moduleSlug: string; unitSlug: string }>;
}) {
  const { moduleSlug, unitSlug } = use(params);
  const courseModule = moduleBySlug(moduleSlug);
  const unit = courseModule?.units.find((item) => item.day === unitSlug);
  if (!courseModule || !unit) notFound();
  if (unit.kind === 'build')
    return <BuildView courseModule={courseModule} unit={unit} />;
  if (unit.kind === 'practice')
    return <PracticeView courseModule={courseModule} unit={unit} />;
  return <LessonView module={courseModule} unit={unit} />;
}
