'use client';
export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="state-message" role="alert">
      <h1>This learning page couldn’t load.</h1>
      <p className="muted">Your progress remains saved locally.</p>
      <button className="btn" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
