import './globals.css';
import { Providers } from './providers';
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
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
