'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Arrow, Brand, Stage } from '@/components/ui';
import { useLearning } from '@/app/providers';
import { derivePath } from '@/lib/learning/assessment';
import { track } from '@/lib/learning/analytics';
import type { AppliedContext, AssessmentAnswers } from '@/lib/learning/types';

type AnswerValue = boolean | AppliedContext;
const questions = [
  {
    title:
      'Do you currently use AI for tasks beyond writing, summarising, brainstorming or generating drafts?',
    helper:
      'For example: analysing information, categorising inputs, using multiple sources, creating prototypes or completing a multi-step task.',
    options: [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ],
  },
  {
    title: 'Which type of work do you do most often?',
    helper:
      'Choose the closest match. This determines which applied module comes first.',
    options: [
      {
        label: 'Analyse customer feedback or conduct research',
        value: 'feedback',
      },
      {
        label: 'Organise feature requests, tickets or ideas',
        value: 'requests',
      },
      {
        label: 'Create product documents and stakeholder updates',
        value: 'communication',
      },
      { label: 'Turn product ideas into prototypes', value: 'prototyping' },
    ],
  },
  {
    title: 'Have you ever tried to create a multi-step AI workflow?',
    helper:
      'For example: processing an input, producing structured output and passing it into another step or tool.',
    options: [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ],
  },
] as const;

export default function Assessment() {
  const router = useRouter();
  const { state, update } = useLearning();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<(AnswerValue | null)[]>(
    state.assessment
      ? [
          state.assessment.beyondDrafting,
          state.assessment.context,
          state.assessment.builtWorkflow,
        ]
      : [null, null, null],
  );
  const question = questions[step];
  const continueFlow = () => {
    if (selected[step] === null) return;
    if (step < 2) return setStep(step + 1);
    const answers: AssessmentAnswers = {
      beyondDrafting: selected[0] as boolean,
      context: selected[1] as AppliedContext,
      builtWorkflow: selected[2] as boolean,
    };
    update((current) => ({
      ...current,
      assessment: answers,
      path: derivePath(answers),
    }));
    track('assessment_completed', {
      context: answers.context,
      beyondDrafting: answers.beyondDrafting,
      builtWorkflow: answers.builtWorkflow,
    });
    router.push('/recommendation');
  };
  return (
    <Stage className="quiz">
      <div className="top">
        <button
          className="icon-btn"
          onClick={() =>
            step > 0 ? setStep(step - 1) : router.push('/signup')
          }
          aria-label="Go back"
        >
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m14.5 6-6 6 6 6" />
          </svg>
        </button>
        <Brand />
        <span style={{ width: 36 }} />
      </div>
      <div
        className="segments"
        role="progressbar"
        aria-label={`Question ${step + 1} of 3`}
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={3}
      >
        {questions.map((_, index) => (
          <span
            key={index}
            className={`segment ${index <= step ? 'on' : ''}`}
          />
        ))}
      </div>
      <div className="quiz-visual">
        <svg viewBox="0 0 300 148" aria-hidden>
          <g className="float">
            <rect x="34" y="34" width="78" height="86" rx="12" fill="#F8F8F8" />
            <rect x="46" y="50" width="52" height="7" rx="3.5" fill="#E4E7FD" />
            <rect x="46" y="64" width="40" height="7" rx="3.5" fill="#E4E7FD" />
            <rect x="46" y="78" width="52" height="7" rx="3.5" fill="#F1F1F4" />
          </g>
          <path
            d="M124 78c26 0 28-26 52-26M124 90c28 0 32 26 56 26"
            fill="none"
            stroke="#FCD197"
            strokeWidth="2.4"
            strokeDasharray="7 7"
          />
          <circle cx="212" cy="52" r="27" fill="#FCD197" />
          <text
            x="212"
            y="59"
            textAnchor="middle"
            fontSize="17"
            fontWeight="700"
            fill="#6669B8"
          >
            AI
          </text>
          <circle cx="208" cy="116" r="15" fill="#FDA366" />
          <path d="M202 116h12m-6-6v12" stroke="#fff" strokeWidth="2.4" />
        </svg>
      </div>
      <div className="question">
        <div className="label" style={{ color: '#6669b8' }}>
          QUESTION {step + 1} OF 3
        </div>
        <h1>{question.title}</h1>
        <p>{question.helper}</p>
      </div>
      <div className="answers">
        {question.options.map((option, index) => (
          <button
            type="button"
            className={`answer ${selected[step] === option.value ? 'selected' : ''}`}
            key={option.label}
            onClick={() =>
              setSelected((current) =>
                current.map((value, position) =>
                  position === step ? option.value : value,
                ),
              )
            }
            aria-pressed={selected[step] === option.value}
          >
            <span className="letter">{String.fromCharCode(65 + index)}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      <div className="quiz-actions">
        <button
          className="btn"
          disabled={selected[step] === null}
          onClick={continueFlow}
        >
          {step === 2 ? 'See my path' : 'Continue'} <Arrow />
        </button>
        <small className="muted">
          Takes about 30 seconds · shapes your whole path
        </small>
      </div>
    </Stage>
  );
}
