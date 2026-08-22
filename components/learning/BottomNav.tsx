'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  ['Home', '/app', <path key="h" d="m4 11 8-6 8 6v8h-5v-6H9v6H4Z" />],
  [
    'Courses',
    '/app/courses',
    <path
      key="c"
      d="M5 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H5Zm14 0h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6Z"
    />,
  ],
  ['Progress', '/app/progress', <path key="p" d="M6 19v-6m6 6V7m6 12V10" />],
  [
    'Build',
    '/app/build',
    <path key="b" d="M10 4h4v5l4 8a2 2 0 0 1-2 3H8a2 2 0 0 1-2-3l4-8Z" />,
  ],
  [
    'Duels',
    '/app/duels',
    <path key="d" d="M6 4h12M8 4v5a4 4 0 0 0 8 0V4M12 13v4M9 20h6" />,
  ],
  [
    'Settings',
    '/app/settings',
    <g key="s">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2m0 12v2M4 12h2m12 0h2" />
    </g>,
  ],
] as const;
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="app-nav" aria-label="Primary navigation">
      {items.map(([label, href, icon]) => {
        const active =
          href === '/app' ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`nav-btn ${active ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {icon}
              </svg>
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
