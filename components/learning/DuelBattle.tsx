'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui';
import {
  BOT_NAME,
  DUEL_QUESTION_SECONDS,
  pickDuelQuestions,
  resolveBotAnswer,
  scoreDuel,
  xpForOutcome,
  type BotAnswer,
  type DuelOutcome,
} from '@/lib/learning/duel';
import {
  getDuelSummary,
  recordDuelResult,
  type DuelSummary,
  type RecordDuelResultInput,
} from '@/lib/learning/duel-actions';
import type { CurriculumModule, QuizQuestion } from '@/lib/learning/types';

type Phase = 'battle' | 'result';

function buildBotAnswers(questions: QuizQuestion[]): BotAnswer[] {
  return questions.map((question) => resolveBotAnswer(question));
}

export function DuelBattle({
  module,
  onExit,
  initialSummary,
  avatarSeed,
}: {
  module: CurriculumModule;
  onExit: () => void;
  initialSummary?: DuelSummary | null;
  avatarSeed?: string;
}) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    pickDuelQuestions(module),
  );
  const [botAnswers, setBotAnswers] = useState<BotAnswer[]>(() =>
    buildBotAnswers(questions),
  );
  const [phase, setPhase] = useState<Phase>('battle');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>(() =>
    questions.map(() => -1),
  );
  const [userAnswerMs, setUserAnswerMs] = useState<number[]>(() =>
    questions.map(() => 0),
  );
  const [questionStartAt, setQuestionStartAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [result, setResult] = useState<{
    userScore: number;
    botScore: number;
    outcome: DuelOutcome;
    xp: number;
  } | null>(null);
  const [summary, setSummary] = useState<DuelSummary | null>(
    initialSummary ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const timeoutFiredRef = useRef(false);
  const answerStateRef = useRef({ userAnswers, userAnswerMs });

  // Keep answerStateRef fresh on every render so the interval callback
  // doesn't use stale closures when checking/recording the timeout
  useEffect(() => {
    answerStateRef.current = { userAnswers, userAnswerMs };
  });

  // Ticks while a question is live: drives the countdown, the bot's
  // "thinking…" -> "answered" status line, and auto-locks timed-out questions.
  useEffect(() => {
    if (phase !== 'battle') return;
    timeoutFiredRef.current = false;

    const timer = window.setInterval(() => {
      const currentNow = Date.now();
      const currentElapsedMs = currentNow - questionStartAt;
      const currentSecondsLeft = Math.max(
        0,
        DUEL_QUESTION_SECONDS - Math.floor(currentElapsedMs / 1000),
      );

      setNow(currentNow);

      // Auto-lock the question when the clock runs out (only once per question)
      // Read from answerStateRef to avoid stale closures when user answered early
      const currentAnswerState = answerStateRef.current;
      if (
        !timeoutFiredRef.current &&
        currentSecondsLeft === 0 &&
        currentAnswerState.userAnswers[questionIndex] < 0
      ) {
        timeoutFiredRef.current = true;
        const nextTimes = currentAnswerState.userAnswerMs.map((value, index) =>
          index === questionIndex ? DUEL_QUESTION_SECONDS * 1000 : value,
        );
        setUserAnswerMs(nextTimes);
        if (questionIndex === questions.length - 1) {
          // Use the fresh answer state for finishBattle, but get fresh userAnswers
          // from the ref since finishBattle needs the correct answer record
          finishBattle(currentAnswerState.userAnswers, nextTimes);
        }
      }
    }, 250);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIndex]);

  const elapsedMs = now - questionStartAt;
  const secondsLeft = Math.max(
    0,
    DUEL_QUESTION_SECONDS - Math.floor(elapsedMs / 1000),
  );
  const answered = userAnswers[questionIndex] >= 0;
  const timedOut = !answered && secondsLeft === 0;
  const locked = answered || timedOut;
  const currentQuestion = questions[questionIndex];
  const currentBotAnswer = botAnswers[questionIndex];
  const botHasAnswered = elapsedMs >= currentBotAnswer.delayMs;

  // Once both the learner and the bot have shown their answer for this
  // question, auto-advance to the next one after a short beat so the
  // correct/wrong highlight is still visible. The last question skips this —
  // finishBattle already transitions straight to the result screen.
  useEffect(() => {
    if (phase !== 'battle') return;
    if (!locked || !botHasAnswered) return;
    if (questionIndex >= questions.length - 1) return;
    const timer = window.setTimeout(() => {
      goNext();
    }, 1400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, locked, botHasAnswered, questionIndex]);

  function finishBattle(finalAnswers: number[], finalTimes: number[]) {
    const userCorrect = finalAnswers.filter(
      (answer, index) => answer === questions[index].correctIndex,
    ).length;
    const botCorrect = botAnswers.filter((bot) => bot.correct).length;
    const userTimeMs = finalTimes.reduce((sum, ms) => sum + ms, 0);
    const botTimeMs = botAnswers.reduce((sum, bot) => sum + bot.delayMs, 0);
    const { userScore, botScore, outcome } = scoreDuel(
      userCorrect,
      userTimeMs,
      botCorrect,
      botTimeMs,
    );
    const xp = xpForOutcome(outcome);
    setResult({ userScore, botScore, outcome, xp });
    setPhase('result');
    void saveResult({
      moduleId: module.id,
      questionIds: questions.map((question) => question.id),
      userScore,
      userTimeMs,
      botScore,
      outcome,
    });
  }

  // Persists a duel result, retrying once before giving up. The result
  // screen always renders from the local computation regardless of whether
  // this succeeds — a failed write only surfaces as a small inline note and
  // stale Wins/Streak/Rank, never a blocked result screen.
  async function saveResult(input: RecordDuelResultInput) {
    setSaving(true);
    setSaveError(false);
    let outcome = await recordDuelResult(input);
    if (!outcome.ok) {
      outcome = await recordDuelResult(input);
    }
    setSaving(false);
    if (!outcome.ok) {
      setSaveError(true);
      return;
    }
    const nextSummary = await getDuelSummary();
    setSummary(nextSummary);
  }

  // Record a loss if the learner leaves mid-battle (house rule #2). Reads
  // the latest state via a ref so the cleanup below (registered once on
  // mount) doesn't act on stale closure values captured at mount time.
  const exitStateRef = useRef({ phase, module, questions });
  useEffect(() => {
    exitStateRef.current = { phase, module, questions };
  });
  // Guards against React Strict Mode's synchronous mount->cleanup->remount
  // cycle in dev (and Fast Refresh remounts) recording a spurious loss
  // before the learner has seen question 1. A real navigation-away happens
  // well after mount, so didMountRef.current will be true by then; Strict
  // Mode's immediate dev-only unmount fires before the timeout ever runs.
  const didMountRef = useRef(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      didMountRef.current = true;
    }, 0);
    return () => {
      window.clearTimeout(timer);
      const exitState = exitStateRef.current;
      if (didMountRef.current && exitState.phase === 'battle') {
        void recordDuelResult({
          moduleId: exitState.module.id,
          questionIds: exitState.questions.map((question) => question.id),
          userScore: 0,
          userTimeMs: 0,
          botScore: 100,
          outcome: 'loss',
        });
      }
    };
  }, []);

  const selectAnswer = (optionIndex: number) => {
    if (locked) return;
    const timeMs = Math.min(DUEL_QUESTION_SECONDS * 1000, elapsedMs);
    const nextAnswers = userAnswers.map((value, index) =>
      index === questionIndex ? optionIndex : value,
    );
    const nextTimes = userAnswerMs.map((value, index) =>
      index === questionIndex ? timeMs : value,
    );
    setUserAnswers(nextAnswers);
    setUserAnswerMs(nextTimes);
    if (questionIndex === questions.length - 1) {
      finishBattle(nextAnswers, nextTimes);
    }
  };

  const goNext = () => {
    setQuestionIndex((index) => index + 1);
    setQuestionStartAt(Date.now());
    setNow(Date.now());
  };

  const startRematch = () => {
    const nextQuestions = pickDuelQuestions(module);
    setQuestions(nextQuestions);
    setBotAnswers(buildBotAnswers(nextQuestions));
    setUserAnswers(nextQuestions.map(() => -1));
    setUserAnswerMs(nextQuestions.map(() => 0));
    setQuestionIndex(0);
    setQuestionStartAt(Date.now());
    setNow(Date.now());
    setResult(null);
    setSummary(null);
    setPhase('battle');
  };

  if (phase === 'result' && result) {
    const title =
      result.outcome === 'win'
        ? 'Victory'
        : result.outcome === 'loss'
          ? 'Defeat'
          : 'Draw';
    const missedCount = questions.filter(
      (question, index) => userAnswers[index] !== question.correctIndex,
    ).length;
    return (
      <article className="duel-result">
        <h1>{title}</h1>
        <div className="duel-result-score-row">
          <span className="duel-result-score-label">You</span>
          <p className="duel-result-score">
            {result.userScore} – {result.botScore}
          </p>
          <span className="duel-result-score-label">{BOT_NAME}</span>
        </div>
        <p className="duel-result-xp">+{result.xp} XP</p>
        <div className="duel-result-chips">
          <span>{summary?.rank ? `Rank #${summary.rank}` : 'Unranked'}</span>
          <span>Win streak {summary?.streak ?? 0}</span>
        </div>
        {missedCount > 0 && (
          <p className="duel-result-missed">
            You missed {missedCount} question{missedCount === 1 ? '' : 's'}.
          </p>
        )}
        {saveError && (
          <p className="duel-result-save-error">
            Couldn&apos;t save this result. Your Wins/Streak/Rank may be out
            of date until your next duel.
          </p>
        )}
        <footer className="duel-result-actions">
          <button
            type="button"
            className="duel-primary-action"
            onClick={startRematch}
            disabled={saving}
          >
            Rematch
          </button>
          <button type="button" className="duel-text-action" onClick={onExit}>
            Back to challenges
          </button>
        </footer>
      </article>
    );
  }

  return (
    <article className="duel-battle">
      <header className="duel-battle-header">
        <button
          type="button"
          className="duel-exit-btn"
          aria-label="Exit challenge"
          onClick={() => setShowExitConfirm(true)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="duel-battle-player">
          <Avatar className="avatar" seed={avatarSeed ?? 'you'} />
          <span>You</span>
          <strong>
            {userAnswers.filter(
              (answer, index) => answer === questions[index]?.correctIndex,
            ).length * 20}
          </strong>
        </div>
        <div className="duel-battle-timer">
          <span>
            QUESTION {questionIndex + 1} OF {questions.length}
          </span>
          <span>{secondsLeft}s</span>
        </div>
        <div className="duel-battle-opponent">
          <span className="duel-bot-avatar" aria-hidden="true">
            🤖
          </span>
          <span>{BOT_NAME}</span>
          <strong>
            {botAnswers
              .slice(0, questionIndex + 1)
              .filter((bot) => bot.correct).length * 20}
          </strong>
        </div>
      </header>

      <section className="duel-question">
        <h2>{currentQuestion.prompt}</h2>
        <div className="duel-options">
          {currentQuestion.options.map((option, optionIndex) => {
            const isCorrect =
              locked && optionIndex === currentQuestion.correctIndex;
            const isWrong =
              locked &&
              optionIndex === userAnswers[questionIndex] &&
              optionIndex !== currentQuestion.correctIndex;
            return (
              <button
                type="button"
                key={option}
                className={`duel-option ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                disabled={locked}
                onClick={() => selectAnswer(optionIndex)}
              >
                <span>{option}</span>
              </button>
            );
          })}
        </div>
        <p className="duel-bot-line">
          {botHasAnswered
            ? `${BOT_NAME} answered ${currentBotAnswer.correct ? 'correctly' : 'incorrectly'} in ${Math.round(currentBotAnswer.delayMs / 1000)}s`
            : `${BOT_NAME} is thinking…`}
        </p>
      </section>

      {showExitConfirm && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-sheet">
            <h2>Leave this challenge?</h2>
            <p>Leaving mid-battle counts as a loss.</p>
            <div className="confirm-sheet-actions">
              <button
                type="button"
                className="confirm-no"
                onClick={() => setShowExitConfirm(false)}
              >
                No
              </button>
              <button
                type="button"
                className="confirm-yes danger"
                onClick={onExit}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
