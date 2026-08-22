import Link from 'next/link';
export function Stage({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="stage">
      <section className={`phone ${className}`}>{children}</section>
    </main>
  );
}
export function Brand() {
  return (
    <div className="brand">
      <span className="mark">म</span>
      <span>marg</span>
    </div>
  );
}
export function Arrow() {
  return (
    <span className="arrow" aria-hidden>
      →
    </span>
  );
}
export function Back({ href }: { href: string }) {
  return (
    <Link className="icon-btn" href={href} aria-label="Go back">
      <svg
        viewBox="0 0 24 24"
        width="17"
        height="17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m14.5 6-6 6 6 6" />
      </svg>
    </Link>
  );
}

export function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.5 14.1a6 6 0 0 1 0-3.9V7.6H3.2a10 10 0 0 0 0 9.1l3.3-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.1c1.5 0 2.8.5 3.9 1.5l2.8-2.8A9.4 9.4 0 0 0 3.2 7.6l3.3 2.6A5.8 5.8 0 0 1 12 6.1Z"
      />
    </svg>
  );
}
