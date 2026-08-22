'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLearning } from '@/app/providers';
import { Back, GoogleIcon, Stage } from '../../components/ui';
export default function Signup() {
  const r = useRouter();
  const { update } = useLearning();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <Stage>
      <div className="crown">
        <div className="top">
          <Back href="/onboarding" />
          <span>● ● ━</span>
          <span />
        </div>
        <div className="crown-copy">
          <div className="label" style={{ color: '#7f2e19' }}>
            STEP 3 · CREATE ACCOUNT
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
        onSubmit={(e) => {
          e.preventDefault();
          update((current) => ({
            ...current,
            profile: {
              firstName: name.trim().split(/\s+/)[0] || 'Learner',
              email: email.trim(),
            },
          }));
          r.push('/assessment');
        }}
      >
        <button type="button" className="btn ghost">
          <GoogleIcon />
          Continue with Google
        </button>
        <div className="divider">or with email</div>
        <div className="form">
          <input
            className="field"
            aria-label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="First name"
            required
          />
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
            placeholder="Create a password"
            required
          />
        </div>
        <label style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
          <input type="checkbox" defaultChecked /> Send me one daily nudge,
          nothing else
        </label>
        <div style={{ marginTop: 'auto', display: 'grid', gap: 9 }}>
          <button className="btn">Create my learning path</button>
          <div className="terms">
            This prototype stores learning progress only in this browser.
          </div>
        </div>
      </form>
    </Stage>
  );
}
