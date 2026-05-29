'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/gtag';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { QuestionCard } from '@/components/onboarding/question-card';
import { LoadingView } from '@/components/result/loading-view';
import { ResultView as ResultPageView } from '@/components/result/result-view';
import {
  STEPS,
  TOTAL_STEPS,
  EMPTY_ANSWERS,
  scoreAxis,
  classifyPersona,
  type OnboardingAnswers,
  type PersonaType,
  type AxisScore,
  type ChoiceId,
  type QuestionId,
  type StepMeta,
} from '@/lib/onboarding-v6';
import type { ToggleState } from '@/lib/budget-engine';
import { decodeShare } from '@/lib/share-state';

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
  const [sharedToggles, setSharedToggles] = useState<ToggleState | null>(null);
  const [enteredAt] = useState(() => Date.now());
  const firstInputAt = useRef<number | null>(null);
  // 공유 링크(?r=)로 본 결과인지 — 이 경우 sessionStorage에 저장하지 않아
  // 로고/CTA로 재진입 시 공유 결과가 아니라 '내 온보딩'이 시작되게 한다.
  const fromSharedRef = useRef(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    trackEvent('budget_draft_entered');
    // 공유 링크(?r=)로 진입 시: 답변+토글 복원 → 온보딩 건너뛰고 결과 화면 바로 표시
    try {
      const code = new URLSearchParams(window.location.search).get('r');
      const shared = decodeShare(code);
      if (shared) {
        const score = scoreAxis(shared.answers);
        fromSharedRef.current = true; // 세션 저장 스킵 → 로고/CTA로 자기 것 시작 가능
        setAnswers(shared.answers);
        setSharedToggles(shared.toggles);
        setAxisScore(score);
        setPersona(classifyPersona(score));
        setStep(TOTAL_STEPS + 1);
        trackEvent('shared_result_viewed');
        // ?r=는 URL에 유지 — 새로고침해도 같은 결과가 다시 뜨도록(링크 reload-stable)
        return;
      }
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SavedState;
        // step 범위 검증 — 옛 schema는 무시. 현재 유효 범위: 0 ~ TOTAL_STEPS+1 (loading=14, result=15)
        if (
          typeof parsed.step === 'number' &&
          parsed.step >= 0 &&
          parsed.step <= TOTAL_STEPS + 1 &&
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
    if (fromSharedRef.current) return; // 공유 링크로 본 결과는 내 세션에 저장하지 않음
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
    // 마지막 문항(M5) 답변 완료 → 로딩 화면 진입. 분류·이벤트는 로딩 끝에서.
    setStep(TOTAL_STEPS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onLoadingComplete() {
    const score = scoreAxis(answers);
    const p = classifyPersona(score);
    setAxisScore(score);
    setPersona(p);
    setStep(TOTAL_STEPS + 1);
    trackEvent('result_viewed', buildResultPayload(p, score));
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
    fromSharedRef.current = false; // 이제부터는 내 세션 — 저장 재개
    // 공유 링크로 들어왔던 경우 ?r= 제거(남아있으면 새로고침 시 공유 결과로 되돌아감)
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, '', '/budget-draft');
    }
    setStep(0);
    setAnswers(EMPTY_ANSWERS);
    setPersona(null);
    setAxisScore(null);
    setSharedToggles(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  const isLoading = step === TOTAL_STEPS;
  const isResult = step === TOTAL_STEPS + 1;
  const isQuestion = step < TOTAL_STEPS;
  const currentMeta: StepMeta | null = isQuestion ? STEPS[step] : null;
  const currentAnswer: ChoiceId | null = currentMeta ? answers[currentMeta.id] : null;
  const canProceed = currentAnswer !== null;

  return (
    <div className="flex min-h-dvh flex-col bg-[#F9FAFB]">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB]/80 px-6 backdrop-blur-sm sm:h-[88px] sm:px-8">
        <Link href="/">
          <img
            src="/brand/logo-ko-nav.png"
            alt="버짓로드"
            className="h-7 w-auto sm:h-[41px]"
          />
        </Link>
      </header>

      {isQuestion && (
        <div className="mx-auto w-full max-w-[576px] px-6 pt-6">
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>
      )}

      <main className={`mx-auto flex w-full flex-1 flex-col ${isLoading ? '' : 'max-w-[576px] px-6'}`}>
        {currentMeta && (
          <QuestionView
            meta={currentMeta}
            currentAnswer={currentAnswer}
            onChoiceSelect={handleChoiceSelect}
            stepNumber={step + 1}
          />
        )}
        {isLoading && <LoadingView onComplete={onLoadingComplete} />}
        {isResult && persona && axisScore && (
          <ResultPageView
            answers={answers}
            onReset={reset}
            initialToggles={sharedToggles ?? undefined}
          />
        )}
      </main>

      {isQuestion && (
        <nav className="sticky bottom-0 z-10 border-t border-[#E5E7EB] bg-[#F9FAFB]/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[576px] items-center justify-between px-6 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:py-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="flex h-12 items-center gap-2 text-base font-bold text-[#373737] transition-opacity disabled:opacity-40 sm:h-14 sm:text-lg"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className="h-[25px] w-[25px] sm:h-7 sm:w-7"
              >
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
              className="flex h-12 items-center gap-2 text-base font-bold text-[#373737] transition-opacity disabled:opacity-40 sm:h-14 sm:text-lg"
            >
              {step === TOTAL_STEPS - 1 ? '결과 보기' : '다음'}
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className="h-[25px] w-[25px] sm:h-7 sm:w-7"
              >
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
  stepNumber,
}: {
  meta: StepMeta;
  currentAnswer: ChoiceId | null;
  onChoiceSelect: (qid: QuestionId, choiceId: ChoiceId) => void;
  stepNumber: number; // 1-based 화면 노출용. 내부 meta.id (Q1·T2·M5 등)와 분리.
}) {
  return (
    <div className="flex flex-col pb-8 pt-6">
      <div className="space-y-2 pb-2 pt-2">
        <p className="text-sm leading-5 text-[#6A7282]">Q{stepNumber}.</p>
        <h1 className="text-[28px] font-bold leading-9 text-[#373737] sm:text-[30px]">
          {meta.title}
        </h1>
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

// 임시 ResultView 컴포넌트는 STEP 2 C4에서 ResultPageView로 교체됨.
