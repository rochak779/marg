import Link from 'next/link';
import { Back, Stage } from '../../components/ui';
export default function Onboarding() {
  return (
    <Stage className="onboarding-screen">
      <div className="onboard-head">
        <div className="top">
          <Back href="/" />
        </div>
        <div className="copy">
          <div className="label" style={{ color: '#fcd197' }}>
            WHAT IS MARG?
          </div>
          <h1>A learning path, not another chatbot.</h1>
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
          ['10-minute steps', 'Prompting, models, agents, plain language.'],
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
          Sounds like me
        </Link>
      </div>
    </Stage>
  );
}
