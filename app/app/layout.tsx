import { AppShell } from '@/components/learning/AppShell';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
