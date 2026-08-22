import './globals.css';
import { Providers } from './providers';
export const metadata = {
  title: 'Marg — Learn AI for work',
  description: 'A personalised path to practical AI skills.',
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
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
