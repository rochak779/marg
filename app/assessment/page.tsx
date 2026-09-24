'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand, Stage } from '@/components/ui';
import { useLearning } from '@/app/providers';
import { saveAssessment } from '@/lib/learning/server-actions';
import { track } from '@/lib/learning/analytics';
import { moduleById } from '@/content/modules';
import type { AppliedContext, AssessmentAnswers } from '@/lib/learning/types';

type AnswerValue = boolean | AppliedContext;
const questions = [
  {
    title: 'Do you use AI for more than writing or getting answers?',
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
  const { state, setState } = useLearning();
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
  const [submitting, setSubmitting] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const question = questions[step];
  const selectAnswer = async (value: AnswerValue) => {
    if (submitting) return;
    const next = selected.map((current, position) =>
      position === step ? value : current,
    );
    setSelected(next);
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    const answers: AssessmentAnswers = {
      beyondDrafting: next[0] as boolean,
      context: next[1] as AppliedContext,
      builtWorkflow: next[2] as boolean,
    };
    setSubmitting(true);
    setSaveFailed(false);
    // A dropped connection rejects rather than returning ok: false.
    const result = await saveAssessment(answers).catch(() => null);
    setSubmitting(false);
    if (!result?.ok) {
      setSaveFailed(true);
      return;
    }
    setState(result.state);
    const assignedModuleIds = result.state.path?.assignedModuleIds ?? [];
    const firstModule = assignedModuleIds[0]
      ? moduleById(assignedModuleIds[0])
      : undefined;
    track('assessment_completed', {
      context: answers.context,
      beyondDrafting: answers.beyondDrafting,
      builtWorkflow: answers.builtWorkflow,
      entryLevel: result.state.path?.entryLevel ?? '',
      guidanceLevel: result.state.path?.guidanceLevel ?? '',
      assignedModuleIds,
      firstModuleId: firstModule?.id ?? '',
      firstModuleTitle: firstModule?.title ?? '',
      firstModuleLessonIds: firstModule?.units.map((unit) => unit.id) ?? [],
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
      <div className="question">
        <div className="label" style={{ color: '#6669b8' }}>
          QUESTION {step + 1} OF 3
        </div>
        <h1>{question.title}</h1>
        <p>{question.helper}</p>
      </div>
      <div className="answers">
        {question.options.map((option) => (
          <button
            type="button"
            className={`answer ${selected[step] === option.value ? 'selected' : ''}`}
            key={option.label}
            disabled={submitting}
            onClick={() => selectAnswer(option.value)}
            aria-pressed={selected[step] === option.value}
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      {saveFailed && (
        <p role="alert" className="save-error">
          Couldn’t save your answers. Check your connection and tap your answer
          again.
        </p>
      )}
    </Stage>
  );
}
