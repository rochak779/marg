import Link from 'next/link';
import { Brand, Stage } from '../components/ui';
export default function Landing() {
  return (
    <Stage className="landing">
      <header className="top">
        <Brand />
      </header>
      <div className="hero">
        <div className="orbital float">
          <svg viewBox="0 0 300 180" aria-hidden>
            <g stroke="#FCD197" opacity=".6">
              <path d="M150 42 82 100m68-58 70 60M82 100l45 48m93-46-47 47M127 148h46" />
            </g>
            <circle cx="150" cy="42" r="28" fill="#FCD197" />
            <text
              x="150"
              y="49"
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fill="#6669B8"
            >
              AI
            </text>
            <circle cx="82" cy="100" r="13" fill="#FDA366" />
            <circle cx="220" cy="102" r="13" fill="#fff" />
            <circle cx="127" cy="148" r="11" fill="#fff" />
            <circle cx="173" cy="149" r="15" fill="#FDA366" />
          </svg>
        </div>
        <div className="hero-copy">
          <span className="pill">12 tracks · 140 lessons</span>
          <h1>Learn AI, one clear step at a time.</h1>
        </div>
      </div>
      <div className="landing-copy muted">
        Not a chatbot doing your work. A path that makes you genuinely good at
        using AI.
      </div>
      <div className="bottom-actions">
        <Link className="btn" href="/onboarding">
          Get started
        </Link>
        <span className="muted">
          Already learning here?{' '}
          <Link href="/signin" style={{ color: 'var(--purple)', fontWeight: 600 }}>
            Sign in
          </Link>
        </span>
      </div>
    </Stage>
  );
}
