'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLearning } from '@/app/providers';
import { Arrow, Back, Brand, GoogleIcon, Stage } from '../../components/ui';
export default function Signin() {
  const r = useRouter();
  const { state, update } = useLearning();
  const [email, setEmail] = useState(state.profile?.email ?? '');
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
      <div className="progress-card">
        <div className="ring">
          <span>60%</span>
        </div>
        <div>
          <div className="label" style={{ color: '#fcd197' }}>
            TRACK 1 · IN PROGRESS
          </div>
          <strong style={{ fontSize: 14 }}>Lesson 7 — How models think</strong>
          <div style={{ fontSize: 11, marginTop: 6 }}>4-day streak</div>
        </div>
      </div>
      <form
        className="signin-form"
        onSubmit={(e) => {
          e.preventDefault();
          update((current) => ({
            ...current,
            profile: {
              firstName:
                current.profile?.firstName || email.split('@')[0] || 'Learner',
              email: email.trim(),
            },
          }));
          const resume =
            new URLSearchParams(window.location.search).get('assessment') ===
            'incomplete';
          r.push(resume ? '/assessment' : '/app');
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
          placeholder="Password"
          required
        />
        <button className="btn">
          Continue learning <Arrow />
        </button>
        <div className="divider">or</div>
        <button type="button" className="btn ghost">
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
