import Link from 'next/link';
import { Arrow, Back, Stage } from '../../components/ui';
export default function Onboarding() {
  return (
    <Stage className="onboarding-screen">
      <div className="onboard-head">
        <div className="top">
          <Back href="/" />
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <i
              style={{
                width: 6,
                height: 6,
                borderRadius: 9,
                background: '#ffffff66',
              }}
            />
            <i
              style={{
                width: 18,
                height: 6,
                borderRadius: 9,
                background: '#fcd197',
              }}
            />
            <i
              style={{
                width: 6,
                height: 6,
                borderRadius: 9,
                background: '#ffffff66',
              }}
            />
          </span>
          <Link href="/signup" style={{ fontSize: 12, color: '#ffffffcc' }}>
            Skip
          </Link>
        </div>
        <svg
          className="float"
          viewBox="0 0 130 120"
          style={{
            position: 'absolute',
            right: 14,
            top: 72,
            width: 126,
            height: 116,
          }}
          aria-hidden
        >
          <circle cx="72" cy="46" r="34" fill="#FCD197" />
          <circle
            cx="72"
            cy="46"
            r="34"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            opacity=".5"
          />
          <text
            x="72"
            y="55"
            textAnchor="middle"
            fontSize="22"
            fontWeight="700"
            fill="#6669B8"
          >
            AI
          </text>
          <g stroke="#FFF3E2" strokeWidth="1.5" opacity=".7" fill="none">
            <path d="M72 46 24 88m48-42 46 44M24 88l94 2" />
          </g>
          <circle cx="24" cy="88" r="12" fill="#FDA366" />
          <circle cx="118" cy="90" r="9" fill="#F8F8F8" />
        </svg>
        <div className="copy">
          <div className="label" style={{ color: '#fcd197' }}>
            WHAT IS MARG?
          </div>
          <h1>A learning path — not another chatbot.</h1>
          <p
            style={{
              fontSize: 12.5,
              lineHeight: 1.5,
              margin: '8px 0 0',
              color: '#ffffffbf',
            }}
          >
            Marg won&apos;t do the work for you. It teaches you to do it with
            AI.
          </p>
        </div>
      </div>
      <div className="value-list">
        {[
          ['10-minute steps', 'Prompting, models, agents — plain language.'],
          ['A live playground', 'Write a real prompt, get real feedback.'],
          ['Progress that adds up', 'Streaks, milestones, one path to finish.'],
        ].map((v, i) => (
          <div className="value" key={v[0]}>
            <span className="value-icon">{['10', '✓', '↗'][i]}</span>
            <div>
              <strong>{v[0]}</strong>
              <p>{v[1]}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bottom-actions" style={{ padding: '0 24px 28px' }}>
        <Link className="btn" href="/signup">
          Sounds like me <Arrow />
        </Link>
        <span className="muted">About 4 hours a month</span>
      </div>
    </Stage>
  );
}
