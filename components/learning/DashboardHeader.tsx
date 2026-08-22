import Link from 'next/link';
import { Avatar } from '@/components/ui';

export function DashboardHeader({
  subtitle,
  progress,
  firstName,
  streak,
  avatarSeed,
}: {
  subtitle: string;
  progress: number;
  firstName?: string;
  streak?: number;
  avatarSeed?: string;
}) {
  return (
    <div className="hello dashboard-header">
      <div className="hello-person">
        <Link href="/app/settings" aria-label="Open settings">
          {avatarSeed ? (
            <Avatar className="avatar" seed={avatarSeed} />
          ) : (
            <span className="avatar">म</span>
          )}
        </Link>
        <div>
          <b>Welcome {firstName || 'Learner'}</b>
          <div className="muted">
            <span className="progress-bolt" aria-hidden>
              •
            </span>
            {streak !== undefined ? `${streak} day streak · ` : ''}
            {subtitle}
          </div>
        </div>
      </div>
      <Link
        className="icon-btn notification-button"
        href="/app/notifications"
        aria-label="Open notifications"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M18 15v-5a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 15Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {progress < 100 && <span aria-hidden />}
      </Link>
    </div>
  );
}
