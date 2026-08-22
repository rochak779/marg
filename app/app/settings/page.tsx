'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLearning } from '@/app/providers';
import { signOut } from '@/lib/auth/actions';
import { deleteAccount } from '@/lib/auth/account-actions';
import { saveAvatar } from '@/lib/learning/server-actions';
import { Avatar } from '@/components/ui';
import { avatarChoices } from '@/lib/avatar';

const Icon = ({
  type,
}: {
  type: 'clock' | 'chart' | 'path' | 'bell' | 'help' | 'logout' | 'trash';
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
    {type === 'help' && (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M9.8 9a2.4 2.4 0 1 1 3.6 2c-.9.5-1.4 1-1.4 2M12 16.5v.01" />
      </>
    )}
    {type === 'logout' && (
      <>
        <path d="M15 4h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
        <path d="M19 12H9m10 0-3.5-3.5M19 12l-3.5 3.5" />
      </>
    )}
    {type === 'trash' && (
      <>
        <path d="M5 7h14M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const avatarSeed = state.profile?.avatarSeed;
  const choices = avatarSeed
    ? avatarChoices(avatarSeed.replace(/-\d+$/, ''))
    : [];

  const closeDeleteFlow = () => {
    setShowDeleteConfirm(false);
    setShowDeleteForm(false);
    setConfirmText('');
    setDeleteError(null);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    setDeleting(true);
    const result = await deleteAccount(confirmText);
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(
        result.error === 'confirmation_required'
          ? 'Type DELETE exactly to confirm.'
          : 'Could not delete your account. Try again.',
      );
      return;
    }
    r.push('/signup');
    r.refresh();
  };

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
      <h2>ACCOUNT</h2>
      <div className="settings-group">
        <button
          type="button"
          className="settings-row"
          onClick={async () => {
            await signOut();
            r.push('/signin');
            r.refresh();
          }}
        >
          <i>
            <Icon type="logout" />
          </i>
          <span>
            <b>Log out</b>
          </span>
        </button>
        <button
          type="button"
          className="settings-row settings-row-danger"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <i>
            <Icon type="trash" />
          </i>
          <span>
            <b>Delete my account</b>
          </span>
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-sheet">
            <h2>Delete your account?</h2>
            <p>
              This permanently deletes your account and all learning
              progress. This cannot be undone.
            </p>
            <div className="confirm-sheet-actions">
              <button
                type="button"
                className="confirm-no"
                onClick={closeDeleteFlow}
              >
                No
              </button>
              <button
                type="button"
                className="confirm-yes danger"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowDeleteForm(true);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteForm && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-sheet">
            <h2>Type DELETE to confirm</h2>
            <p>Last check before we permanently delete everything.</p>
            <label className="confirm-delete-input">
              <input
                className="field"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="DELETE"
              />
            </label>
            {deleteError && (
              <div role="alert" className="confirm-delete-error">
                {deleteError}
              </div>
            )}
            <div className="confirm-sheet-actions">
              <button
                type="button"
                className="confirm-no"
                onClick={closeDeleteFlow}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-yes danger"
                disabled={confirmText !== 'DELETE' || deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
