import Link from 'next/link';
import { Brand, Stage } from '../components/ui';
export default function Landing() {
  return (
    <Stage className="landing">
      <header className="top">
        <Brand />
      </header>
      <div className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element -- static
            SVG illustration; next/image can't optimize local SVGs without
            enabling dangerouslyAllowSVG, which isn't worth it for a vector. */}
        <img
          className="hero-art float"
          src="/images/landing-hero.svg"
          alt=""
          aria-hidden
        />
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
