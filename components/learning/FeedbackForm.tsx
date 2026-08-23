'use client';
import { useState } from 'react';
import { submitFeedback } from '@/lib/feedback/server-actions';

const FEEDBACK_RATINGS = [
  { value: 1, emoji: '😡' },
  { value: 2, emoji: '🙁' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😍' },
] as const;

// Shared by Settings > Help & feedback (generic, no context), the
// quiz-result prompt (Day 1/Day 2, tagged with moduleId/unitId — an
// early-insight signal, see PRD 11.1, not the North Star's rating), and the
// course-complete screen (tagged with the last module's id, copy overridden
// via title/subtitle/placeholder below).
export function FeedbackForm({
  onClose,
  moduleId,
  unitId,
  title = 'Help & feedback',
  subtitle = "How's the app working for you?",
  placeholder = 'Tell us more (optional)',
}: {
  onClose: () => void;
  moduleId?: number;
  unitId?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (rating === null) return;
    setSubmitting(true);
    const result = await submitFeedback({ rating, message, moduleId, unitId });
    setSubmitting(false);
    if (result.ok) {
      setSent(true);
      setTimeout(onClose, 1400);
    }
  };

  return (
    <div
      className="feedback-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="feedback-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        {sent ? (
          <p className="feedback-thanks">Thanks, got it! 🙌</p>
        ) : (
          <>
            <div className="feedback-sheet-head">
              <div>
                <h2>{title}</h2>
                <p>{subtitle}</p>
              </div>
              <button
                type="button"
                className="feedback-sheet-close"
                aria-label="Close"
                onClick={onClose}
              >
                ×
              </button>
            </div>
            <div className="feedback-rating">
              {FEEDBACK_RATINGS.map(({ value, emoji }) => (
                <button
                  type="button"
                  key={value}
                  className={rating === value ? 'selected' : ''}
                  aria-label={`Rate ${value} out of 5`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={placeholder}
              maxLength={2000}
            />
            <button
              type="button"
              className="btn"
              disabled={rating === null || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Sending…' : 'Send feedback'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
