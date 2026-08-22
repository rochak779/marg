'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updatePassword } from '@/lib/auth/actions';
import { Back, Brand, Stage } from '@/components/ui';

export default function ResetPassword() {
  const r = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <Stage>
      <div className="top">
        <Back href="/signin" />
        <Brand />
        <span style={{ width: 36 }} />
      </div>
      <div className="signin-title">
        <h1>Set a new password.</h1>
        <p className="muted">Use at least 8 characters.</p>
      </div>
      <form
        className="signin-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setPending(true);
          const result = await updatePassword({ password });
          setPending(false);
          if (!result.ok) {
            setError('That link may have expired. Request a new one.');
            return;
          }
          r.push('/app');
          r.refresh();
        }}
      >
        <input
          className="field"
          aria-label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password"
          minLength={8}
          required
        />
        {error && (
          <div role="alert" style={{ color: '#b3261e', fontSize: 12 }}>
            {error}
          </div>
        )}
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </Stage>
  );
}
