import Link from 'next/link';
import { Stage } from '@/components/ui';
export default function NotFound() {
  return (
    <Stage>
      <div className="state-message">
        <h1>That learning page isn’t here.</h1>
        <p className="muted">
          Return to your courses and choose an available unit.
        </p>
        <Link className="btn" href="/app/courses">
          My courses
        </Link>
      </div>
    </Stage>
  );
}
