'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { moduleBySlug } from '@/content/modules';
import { ModuleOverview } from '@/components/learning/ModuleOverview';
export default function Page({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = use(params);
  const courseModule = moduleBySlug(moduleSlug);
  if (!courseModule) notFound();
  return <ModuleOverview module={courseModule} />;
}
