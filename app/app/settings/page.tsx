'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLearning } from '@/app/providers';
import { signOut } from '@/lib/auth/actions';
import { saveAvatar } from '@/lib/learning/server-actions';
import { Avatar } from '@/components/ui';
import { avatarChoices } from '@/lib/avatar';

const Icon = ({
  type,
}: {
  type: 'clock' | 'chart' | 'path' | 'bell' | 'lock' | 'help';
}) => (
  <svg viewBox="0 0 24 24" aria-hidden>
    {type === 'clock' && (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    )}
    {type === 'chart' && <path d="M6 18v-5m6 5V7m6 11v-8" />}
    {type === 'path' && (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="m4 12 8 4 8-4" />
      </>
    )}
    {type === 'bell' && (
      <>
        <path d="M18 15v-5a6 6 0 1 0-12 0v5l-2 3h16l-2-3Z" />
        <path d="M10 20h4" />
      </>
    )}
    {type === 'lock' && (
      <>
        <rect x="5" y="11" width="14" height="9" rx="3" />
        <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
      </>
    )}
    {type === 'help' && (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M9.8 9a2.4 2.4 0 1 1 3.6 2c-.9.5-1.4 1-1.4 2M12 16.5v.01" />
      </>
    )}
  </svg>
);
export default function SettingsPage() {
  const { state, setState } = useLearning();
  const r = useRouter();
  const [reminders, setReminders] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const avatarSeed = state.profile?.avatarSeed;
  const choices = avatarSeed
    ? avatarChoices(avatarSeed.replace(/-\d+$/, ''))
    : [];
  return (
    <div className="settings-view">
      <h1>Settings</h1>
      <section className="settings-profile">
        <svg viewBox="0 0 300 120" aria-hidden>
          <circle cx="274" cy="2" r="60" />
          <path d="m256 92 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />
        </svg>
        {avatarSeed ? (
          <button
            type="button"
            className="settings-avatar-btn"
            onClick={() => setPickingAvatar((value) => !value)}
            aria-label="Change avatar"
          >
            <Avatar className="settings-avatar" seed={avatarSeed} />
          </button>
        ) : (
          <span className="settings-avatar">म</span>
        )}
        <div>
          <b>{state.profile?.firstName || 'Learner'}</b>
          <p>{state.profile?.email || 'No email linked yet'}</p>
          <small>Synced to your account</small>
        </div>
      </section>
      {pickingAvatar && (
        <section className="avatar-picker">
          {choices.map((seed) => (
            <button
              type="button"
              key={seed}
              className={seed === avatarSeed ? 'selected' : ''}
              onClick={async () => {
                const result = await saveAvatar({ seed });
                if (result.ok) {
                  setState(result.state);
                  setPickingAvatar(false);
                }
              }}
            >
              <Avatar seed={seed} />
            </button>
          ))}
        </section>
      )}
      <h2>LEARNING</h2>
      <div className="settings-group">
        <button
          type="button"
          className="settings-row"
          onClick={() => setReminders((value) => !value)}
        >
          <i>
            <Icon type="clock" />
          </i>
          <span>
            <b>Daily reminder</b>
            <small>Visual preference for this prototype</small>
          </span>
          <em
            className={`toggle ${reminders ? 'on' : ''}`}
            aria-label={reminders ? 'Daily reminder on' : 'Daily reminder off'}
          />
        </button>
        <div className="settings-row">
          <i>
            <Icon type="chart" />
          </i>
          <span>
            <b>Weekly goal</b>
            <small>Complete five learning units</small>
          </span>
          <strong>5 units</strong>
        </div>
        <Link className="settings-row" href="/assessment">
          <i>
            <Icon type="path" />
          </i>
          <span>
            <b>Retake the assessment</b>
            <small>Your completed units stay saved</small>
          </span>
          <strong>›</strong>
        </Link>
      </div>
      <h2>APP</h2>
      <div className="settings-group">
        <button
          type="button"
          className="settings-row"
          onClick={() => setNotifications((value) => !value)}
        >
          <i>
            <Icon type="bell" />
          </i>
          <span>
            <b>Notifications</b>
            <small>Nudges and new unit updates</small>
          </span>
          <em
            className={`toggle ${notifications ? 'on' : ''}`}
            aria-label={
              notifications ? 'Notifications on' : 'Notifications off'
            }
          />
        </button>
        <Link className="settings-row" href="/app/settings/account">
          <i>
            <Icon type="lock" />
          </i>
          <span>
            <b>Account & security</b>
            <small>Export or delete your account</small>
          </span>
          <strong>›</strong>
        </Link>
        <div className="settings-row disabled" aria-disabled="true">
          <i>
            <Icon type="help" />
          </i>
          <span>
            <b>Help & feedback</b>
            <small>Coming soon</small>
          </span>
        </div>
      </div>
      <button
        type="button"
        className="settings-signout"
        onClick={async () => {
          await signOut();
          r.push('/signin');
          r.refresh();
        }}
      >
        Sign out
      </button>
      <p className="settings-foot">Marg — Every expert was once a beginner.</p>
    </div>
  );
}
