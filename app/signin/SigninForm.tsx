'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signInWithGoogle, signInWithPassword } from '@/lib/auth/actions';
import { Arrow, Back, Brand, GoogleIcon, Stage } from '../../components/ui';

const ERROR_COPY: Record<string, string> = {
  invalid_credentials: 'That email or password isn’t right.',
  email_not_confirmed: 'Confirm your email first — check your inbox.',
  invalid_input: 'Enter a valid email and password.',
  unavailable: 'Something went wrong. Try again.',
};

export default function SigninForm() {
  const r = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <Stage>
      <div className="top">
        <Back href="/" />
        <Brand />
        <span style={{ width: 36 }} />
      </div>
      <div className="signin-title">
        <h1>Welcome back.</h1>
        <p className="muted">Your path is waiting exactly where you left it.</p>
      </div>
      <form
        className="signin-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setPending(true);
          const result = await signInWithPassword({ email, password });
          setPending(false);
          if (!result.ok) {
            setError(ERROR_COPY[result.error] ?? ERROR_COPY.unavailable);
            return;
          }
          const resume =
            new URLSearchParams(window.location.search).get('assessment') ===
            'incomplete';
          r.push(resume ? '/assessment' : '/app');
          r.refresh();
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
        <input
          className="field"
          aria-label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
        />
        {error && (
          <div role="alert" style={{ color: '#b3261e', fontSize: 12 }}>
            {error}
          </div>
        )}
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Continue learning'} <Arrow />
        </button>
        <div className="divider">or</div>
        <button
          type="button"
          className="btn ghost"
          onClick={() => signInWithGoogle()}
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </form>
      <div className="bottom-actions">
        <span className="muted">
          Assessment unfinished?{' '}
          <Link
            href="/signin?assessment=incomplete"
            style={{ color: '#6669b8', textDecoration: 'underline' }}
          >
            Use resume flow
          </Link>
        </span>
        <span className="muted">
          Forgot your password?{' '}
          <Link
            href="/forgot-password"
            style={{ color: '#6669b8', textDecoration: 'underline' }}
          >
            Reset it
          </Link>
        </span>
        <span className="muted">
          New to Marg?{' '}
          <Link
            href="/signup"
            style={{ color: '#6669b8', textDecoration: 'underline' }}
          >
            Create an account
          </Link>
        </span>
      </div>
    </Stage>
  );
}
