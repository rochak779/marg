'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLearning } from '@/app/providers';
import { isUnitUnlocked } from '@/lib/learning/progression';
import { submitQuiz } from '@/lib/learning/server-actions';
import { track } from '@/lib/learning/analytics';
import type { CurriculumModule, LessonUnit } from '@/lib/learning/types';

export function LessonView({
  module,
  unit,
}: {
  module: CurriculumModule;
  unit: LessonUnit;
}) {
  const router = useRouter();
  const { state, ready, setState } = useLearning();
  const [answers, setAnswers] = useState<number[]>(() =>
    unit.quiz.map(() => -1),
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  if (!ready) return <div className="state-message">Loading lesson…</div>;
  if (
    !isUnitUnlocked(state, unit.id) &&
    !state.completedUnitIds.includes(unit.id)
  )
    return (
      <div className="state-message">
        <h1>This lesson is still locked.</h1>
        <p className="muted">Complete the previous unit first.</p>
        <Link className="btn" href={`/app/modules/${module.slug}`}>
          Back to module
        </Link>
      </div>
    );

  const currentQuestion = unit.quiz[questionIndex];
  const selectedAnswer = answers[questionIndex];
  const answered = selectedAnswer >= 0;
  const lessonIndex = module.units.findIndex((item) => item.id === unit.id);
  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = await submitQuiz({ unitId: unit.id, answers });
    setSubmitting(false);
    if (!result.ok) return;
    setState(result.state);
    const score = result.state.quizResults[unit.id]?.score ?? 0;
    track('quiz_submitted', { moduleId: module.id, unitId: unit.id, score });
    router.push(`/app/modules/${module.slug}/${unit.day}/result`);
  };

  if (showQuiz)
    return (
      <article className="sixa-flow sixa-quiz">
        <div className="sixa-quiz-glow" />
        <header className="sixa-flow-header">
          <button
            type="button"
            onClick={() => setShowQuiz(false)}
            aria-label="Back to lesson"
          >
            <svg viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span>Day {lessonIndex + 1} quiz</span>
          <i />
        </header>
        <div
          className="sixa-question-progress"
          aria-label={`Question ${questionIndex + 1} of ${unit.quiz.length}`}
        >
          {unit.quiz.map((question, index) => (
            <i
              className={index <= questionIndex ? 'active' : ''}
              key={question.id}
            />
          ))}
        </div>
        <section className="sixa-question-heading">
          <span>
            QUESTION {questionIndex + 1} OF {unit.quiz.length}
          </span>
          <h1>{currentQuestion.prompt}</h1>
        </section>
        <fieldset className="sixa-options">
          <legend className="sr-only">Choose one answer</legend>
          {currentQuestion.options.map((option, optionIndex) => {
            const isCorrect =
              answered && optionIndex === currentQuestion.correctIndex;
            const isWrong =
              answered && optionIndex === selectedAnswer && !isCorrect;
            return (
              <label
                className={`${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                key={option}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  checked={selectedAnswer === optionIndex}
                  disabled={answered}
                  onChange={() =>
                    setAnswers((current) =>
                      current.map((answer, index) =>
                        index === questionIndex ? optionIndex : answer,
                      ),
                    )
                  }
                />
                <span className="sixa-option-letter">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span>{option}</span>
                <strong aria-hidden="true">
                  {isCorrect ? '✓' : isWrong ? '×' : ''}
                </strong>
              </label>
            );
          })}
        </fieldset>
        {answered && (
          <p className="sixa-answer-explanation">
            {currentQuestion.explanation}
          </p>
        )}
        <footer className="sixa-flow-footer">
          <button
            type="button"
            className="sixa-primary-action"
            disabled={!answered || submitting}
            onClick={() =>
              questionIndex === unit.quiz.length - 1
                ? submit()
                : setQuestionIndex((index) => index + 1)
            }
          >
            {questionIndex === unit.quiz.length - 1
              ? submitting
                ? 'Submitting…'
                : 'See my result'
              : 'Next'}
            {answered && <span aria-hidden="true">→</span>}
          </button>
          {!answered && <small>Pick one answer to continue</small>}
        </footer>
      </article>
    );

  return (
    <article className="sixa-flow sixa-lesson">
      <header className="sixa-lesson-top">
        <div className="sixa-flow-header">
          <Link
            href={`/app/modules/${module.slug}`}
            aria-label="Back to module"
          >
            <svg viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <span>
            Day {lessonIndex + 1} · {unit.estimatedMinutes} min
          </span>
          <span className="sixa-more" aria-hidden="true">
            •••
          </span>
        </div>
        <div className="sixa-lesson-progress" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <i className={index < 2 ? 'active' : ''} key={index} />
          ))}
        </div>
      </header>
      <div className="sixa-lesson-scroll">
        <span className="sixa-section-label">
          {unit.day.toUpperCase()} LESSON
        </span>
        <h1>{unit.title}</h1>
        <p className="sixa-lesson-hook">{unit.hook}</p>
        {unit.theory.map((paragraph) => (
          <p className="sixa-theory" key={paragraph}>
            {paragraph}
          </p>
        ))}
        <section className="sixa-example-card">
          <div>
            <span className="sixa-example-icon">✓</span>
            <strong>EXAMPLE</strong>
          </div>
          <p>{unit.example}</p>
        </section>
        <section className="sixa-task-card">
          <div>
            <span className="sixa-task-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 4h4v5l4 8a2 2 0 0 1-1.8 3H7.8A2 2 0 0 1 6 17l4-8V4Z" />
              </svg>
            </span>
            <strong>Your task · 4 min</strong>
          </div>
          <p>{unit.action}</p>
        </section>
        <section className="sixa-save-card">
          <span>Keep for Saturday</span>
          <p>{unit.savedComponent}</p>
        </section>
      </div>
      <footer className="sixa-flow-footer">
        <button
          type="button"
          className="sixa-primary-action"
          onClick={() => setShowQuiz(true)}
        >
          Check understanding <span aria-hidden="true">→</span>
        </button>
        <small>{unit.quiz.length} questions · about a minute</small>
      </footer>
    </article>
  );
}
