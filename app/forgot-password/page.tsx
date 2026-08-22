'use client';
import Link from 'next/link';
import { useState } from 'react';
import { requestPasswordReset } from '@/lib/auth/actions';
import { Back, Brand, Stage } from '@/components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <Stage>
      <div className="top">
        <Back href="/signin" />
        <Brand />
        <span style={{ width: 36 }} />
      </div>
      <div className="signin-title">
        <h1>Reset your password.</h1>
        <p className="muted">
          {sent
            ? `If an account exists for ${email}, a reset link is on its way.`
            : 'We’ll email you a link to set a new one.'}
        </p>
      </div>
      {!sent && (
        <form
          className="signin-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            await requestPasswordReset({ email });
            setPending(false);
            setSent(true);
          }}
        >
          <input
            className="field"
            aria-label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Work email"
            required
          />
          <button className="btn" type="submit" disabled={pending}>
            {pending ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <div className="bottom-actions">
        <span className="muted">
          Remembered it?{' '}
          <Link
            href="/signin"
            style={{ color: '#6669b8', textDecoration: 'underline' }}
          >
            Back to sign in
          </Link>
        </span>
      </div>
    </Stage>
  );
}
