'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/gtag';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { QuestionCard } from '@/components/onboarding/question-card';
import {
  STEPS,
  TOTAL_STEPS,
  EMPTY_ANSWERS,
  PERSONA_DESCRIPTIONS,
  scoreAxis,
  classifyPersona,
  type OnboardingAnswers,
  type PersonaType,
  type AxisScore,
  type ChoiceId,
  type QuestionId,
  type StepMeta,
} from '@/lib/onboarding-v6';

const STORAGE_KEY = 'budgetroad_onboarding_v6';
const LEGACY_STORAGE_KEY = 'budgetroad_result';

type SavedState = {
  step: number;
  answers: OnboardingAnswers;
  persona: PersonaType | null;
  axisScore: AxisScore | null;
};

export default function BudgetDraftPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ANSWERS);
  const [persona, setPersona] = useState<PersonaType | null>(null);
  const [axisScore, setAxisScore] = useState<AxisScore | null>(null);
  const [enteredAt] = useState(() => Date.now());
  const firstInputAt = useRef<number | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    trackEvent('budget_draft_entered');
    try {
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SavedState;
        // step 범위 검증 — 옛 schema(진입 라우팅 포함, step=14 등) 무시
        if (
          typeof parsed.step === 'number' &&
          parsed.step >= 0 &&
          parsed.step <= TOTAL_STEPS &&
          parsed.answers &&
          'Q1' in parsed.answers
        ) {
          setStep(parsed.step);
          setAnswers(parsed.answers);
          setPersona(parsed.persona ?? null);
          setAxisScore(parsed.axisScore ?? null);
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (step === 0 && answers.Q1 === null) return;
    try {
      const data: SavedState = { step, answers, persona, axisScore };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [step, answers, persona, axisScore]);

  function trackFirstInput() {
    if (firstInputAt.current !== null) return;
    firstInputAt.current = Date.now();
    const elapsed = Math.round((firstInputAt.current - enteredAt) / 1000);
    trackEvent('input_started', { time_to_start_sec: elapsed });
  }

  function handleChoiceSelect(qid: QuestionId, choiceId: ChoiceId) {
    trackFirstInput();
    setAnswers((prev) => ({ ...prev, [qid]: choiceId }));
    trackEvent('onboarding_question_answered', {
      question_id: qid,
      choice_id: choiceId,
    });
  }

  function buildResultPayload(p: PersonaType, score: AxisScore) {
    const timeInSteps = firstInputAt.current
      ? Math.round((Date.now() - firstInputAt.current) / 1000)
      : 0;
    const payload: Record<string, string | number> = {
      persona: p,
      axis_a: score.a,
      axis_b: score.b,
      time_in_steps_sec: timeInSteps,
    };
    for (const k of Object.keys(answers) as (keyof OnboardingAnswers)[]) {
      const v = answers[k];
      if (v) payload[k.toLowerCase()] = v;
    }
    return payload;
  }

  function next() {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const score = scoreAxis(answers);
    const p = classifyPersona(score);
    setAxisScore(score);
    setPersona(p);
    setStep(TOTAL_STEPS);
    trackEvent('result_viewed', buildResultPayload(p, score));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() {
    if (step > 0) {
      trackEvent('back_clicked', { from_step: step + 1 });
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function reset() {
    trackEvent('result_reset_clicked');
    setStep(0);
    setAnswers(EMPTY_ANSWERS);
    setPersona(null);
    setAxisScore(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  const isResult = step === TOTAL_STEPS;
  const currentMeta: StepMeta | null = step < TOTAL_STEPS ? STEPS[step] : null;
  const currentAnswer: ChoiceId | null = currentMeta ? answers[currentMeta.id] : null;
  const canProceed = currentAnswer !== null;

  return (
    <div className="flex min-h-dvh flex-col bg-[#F9FAFB]">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB]/80 px-6 backdrop-blur-sm sm:h-[87px] sm:px-8">
        <Link href="/">
          <img
            src="/brand/logo-ko-nav.png"
            alt="버짓로드"
            className="h-[28px] w-auto sm:h-[36px]"
          />
        </Link>
      </header>

      {!isResult && (
        <div className="mx-auto w-full max-w-[576px] px-6 pt-6">
          <ProgressBar
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            macroStep={1}
            macroTotal={3}
          />
        </div>
      )}

      <main className="mx-auto flex w-full max-w-[576px] flex-1 flex-col px-6">
        {currentMeta && (
          <QuestionView
            meta={currentMeta}
            currentAnswer={currentAnswer}
            onChoiceSelect={handleChoiceSelect}
          />
        )}
        {isResult && persona && axisScore && (
          <ResultView persona={persona} axisScore={axisScore} onReset={reset} />
        )}
      </main>

      {!isResult && (
        <nav className="sticky bottom-0 z-10 border-t border-[#E5E7EB] bg-[#F9FAFB]/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[576px] items-center justify-between px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="flex h-14 items-center gap-2 text-base font-bold text-[#373737] transition-opacity disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M10 4L6 8L10 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              이전
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canProceed}
              className="flex h-14 items-center gap-2 text-base font-bold text-[#373737] transition-opacity disabled:opacity-40"
            >
              {step === TOTAL_STEPS - 1 ? '결과 보기' : '다음'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

// ── Question View ──

function QuestionView({
  meta,
  currentAnswer,
  onChoiceSelect,
}: {
  meta: StepMeta;
  currentAnswer: ChoiceId | null;
  onChoiceSelect: (qid: QuestionId, choiceId: ChoiceId) => void;
}) {
  return (
    <div className="flex flex-col pb-8 pt-6">
      <div className="space-y-1.5 pb-2 pt-2">
        <p className="text-sm leading-5 text-[#6A7282]">{meta.id}.</p>
        <h1 className="text-[30px] font-bold leading-9 text-[#373737]">{meta.title}</h1>
        {meta.subtitle && (
          <p className="pt-2 text-base leading-6 text-[#6A7282]">{meta.subtitle}</p>
        )}
      </div>
      <div className="flex flex-col gap-3 pt-4">
        {meta.options.map((o) => (
          <QuestionCard
            key={o.id}
            selected={currentAnswer === o.id}
            label={o.label}
            onClick={() => onChoiceSelect(meta.id, o.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Result View (임시) ──

function ResultView({
  persona,
  axisScore,
  onReset,
}: {
  persona: PersonaType;
  axisScore: AxisScore;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-12 pt-12 text-center">
      <div className="space-y-4">
        <p className="text-sm leading-5 text-[#6A7282]">분석 결과</p>
        <h1 className="text-[34px] font-bold leading-[44px] text-[#373737]">
          당신은 <span className="text-[#5B8CB7]">{persona}형</span>입니다
        </h1>
        <p className="max-w-[420px] text-base leading-6 text-[#6A7282]">
          {PERSONA_DESCRIPTIONS[persona]}
        </p>
      </div>

      <div className="w-full max-w-[420px] rounded-2xl bg-white px-6 py-5 text-left shadow-sm">
        <p className="pb-2 text-sm font-medium text-[#373737]">다음 단계 준비 중</p>
        <p className="text-sm leading-6 text-[#6A7282]">
          유형별 추천 식장 형태, 항목별 예산, 추가금 케어 토글이
          <br />곧 이 화면에 추가됩니다.
        </p>
      </div>

      {process.env.NODE_ENV !== 'production' && (
        <div className="rounded-lg bg-[#F3F4F6] px-4 py-2 text-xs text-[#6A7282]">
          debug · axisA: {axisScore.a} / axisB: {axisScore.b}
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="flex min-h-[64px] w-full max-w-[260px] items-center justify-center gap-3 rounded-3xl border border-[#E5E7EB] bg-[#373737] px-8 text-lg font-medium text-white active:scale-[0.99]"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        다시하기
      </button>
    </div>
  );
}
