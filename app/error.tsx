'use client';
import { Stage } from '@/components/ui';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Stage>
      <div className="state-message" role="alert">
        <h1>Something interrupted your path.</h1>
        <p className="muted">
          Your saved progress is still in this browser. Try loading this screen
          again.
        </p>
        <button className="btn" onClick={reset}>
          Try again
        </button>
      </div>
    </Stage>
  );
}
