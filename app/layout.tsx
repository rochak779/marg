import { Suspense } from 'react';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { PostHogPageView } from '@/components/PostHogPageView';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata = {
  title: 'Marg',
  description: 'A personalised path to practical AI skills.',
  appleWebApp: {
    capable: true,
    title: 'Marg',
    statusBarStyle: 'default' as const,
  },
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
  themeColor: '#4820a9',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
