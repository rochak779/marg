'use client';
import { useState } from 'react';
import { signInWithGoogle, signUpWithPassword } from '@/lib/auth/actions';
import { Back, Close, GoogleIcon, Stage } from '../../components/ui';

const ERROR_COPY: Record<string, string> = {
  already_registered: 'An account already exists for that email.',
  invalid_input: 'Check your name, email and password (8+ characters).',
  rate_limited: 'Too many signup attempts. Wait a few minutes and try again.',
  unavailable: 'Something went wrong. Try again.',
};

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Stage>
        <div className="top">
          <span />
          <span />
          <Close href="/signin" />
        </div>
        <div className="crown-copy">
          <div className="label" style={{ color: '#7f2e19' }}>
            CHECK YOUR EMAIL
          </div>
          <h1>Confirm your account to continue.</h1>
          <p className="muted">
            We sent a confirmation link to {email}. Open it on this device to
            start your assessment.
          </p>
        </div>
      </Stage>
    );
  }

  return (
    <Stage>
      <div className="crown">
        <div className="top">
          <Back href="/onboarding" />
          <span />
        </div>
        <div className="crown-copy">
          <div className="label" style={{ color: '#fcd197' }}>
            CREATE ACCOUNT
          </div>
          <h1>
            Save your place
            <br />
            on the path.
          </h1>
        </div>
      </div>
      <form
        className="sheet"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setPending(true);
          const result = await signUpWithPassword({
            firstName: name.trim().split(/\s+/)[0] || 'Learner',
            email: email.trim(),
            password,
          });
          setPending(false);
          if (!result.ok) {
            setError(ERROR_COPY[result.error] ?? ERROR_COPY.unavailable);
            return;
          }
          setSent(true);
        }}
      >
        <button
          type="button"
          className="btn ghost"
          style={{ fontSize: 14 }}
          onClick={() => signInWithGoogle()}
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <div className="divider">or with email</div>
        <div className="form">
          <input
            className="field"
            type="text"
            aria-label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            required
          />
          <input
            className="field"
            aria-label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
          />
          <input
            className="field"
            aria-label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            minLength={8}
            required
          />
        </div>
        {error && (
          <div role="alert" style={{ color: '#b3261e', fontSize: 12 }}>
            {error}
          </div>
        )}
        <label style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12 }}>
          <input
            type="checkbox"
            defaultChecked
            style={{ accentColor: 'var(--purple)' }}
          />{' '}
          Send me one daily nudge, nothing else
        </label>
        <div style={{ marginTop: 'auto', display: 'grid', gap: 9 }}>
          <button
            className="btn"
            type="submit"
            style={{ fontSize: 14 }}
            disabled={pending}
          >
            {pending ? 'Creating account…' : 'Create my learning path'}
          </button>
        </div>
      </form>
    </Stage>
  );
}
