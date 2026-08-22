'use client';
import { usePathname } from 'next/navigation';
import { Stage } from '@/components/ui';
import { BottomNav } from './BottomNav';
import { LocalImportPrompt } from './LocalImportPrompt';
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLearningFlow = pathname.startsWith('/app/modules/');
  return (
    <Stage>
      <div
        className={`app-screen routed-app ${isLearningFlow ? 'learning-flow-screen' : ''}`}
      >
        {!isLearningFlow && <LocalImportPrompt />}
        {children}
      </div>
      {pathname !== '/app/notifications' && !isLearningFlow && <BottomNav />}
    </Stage>
  );
}
