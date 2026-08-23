'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteAccount, exportAccountData } from '@/lib/auth/account-actions';

export default function AccountSettings() {
  const r = useRouter();
  const [exporting, setExporting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const result = await exportAccountData();
    setExporting(false);
    if (!result.ok) {
      setError('Could not export your data. Try again.');
      return;
    }
    const blob = new Blob([JSON.stringify(result.data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marg-account-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    const result = await deleteAccount(confirmText);
    setDeleting(false);
    if (!result.ok) {
      setError(
        result.error === 'confirmation_required'
          ? 'Type DELETE exactly to confirm.'
          : 'Could not delete your account. Try again.',
      );
      return;
    }
    r.push('/signin');
    r.refresh();
  };

  return (
    <div className="settings-view">
      <Link href="/app/settings" className="text-back">
        ← Settings
      </Link>
      <h1>Account & security</h1>

      <section className="settings-group" style={{ padding: 16 }}>
        <b>Export your data</b>
        <p className="muted" style={{ margin: '4px 0 12px' }}>
          Download everything Marg has stored for your account as a JSON
          file: your profile, assessment, path and all progress.
        </p>
        <button className="btn ghost" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Preparing…' : 'Download my data'}
        </button>
      </section>

      <section className="settings-group" style={{ padding: 16, marginTop: 16 }}>
        <b>Delete account</b>
        <p className="muted" style={{ margin: '4px 0 12px' }}>
          Permanently deletes your account and all learning progress. This
          cannot be undone.
        </p>
        {!showDeleteForm ? (
          <button
            className="btn ghost"
            onClick={() => setShowDeleteForm(true)}
          >
            Delete my account
          </button>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            <label style={{ fontSize: 13 }}>
              Type <b>DELETE</b> to confirm.
              <input
                className="field"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="DELETE"
              />
            </label>
            {error && (
              <div role="alert" style={{ color: '#b3261e', fontSize: 12 }}>
                {error}
              </div>
            )}
            <button
              className="btn"
              style={{ background: '#b3261e' }}
              disabled={confirmText !== 'DELETE' || deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Deleting…' : 'Permanently delete my account'}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setShowDeleteForm(false);
                setConfirmText('');
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
